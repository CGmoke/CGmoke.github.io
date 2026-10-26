---
title: 只用 OpenCV 做多目标跟踪：从 CSRT 到 ID 生命周期
layout: '@/layouts/Post'
date: 2026-10-26
tags:
  - OpenCV
  - 多目标跟踪
  - CSRT
  - MOG2
categories:
  - 编程
label:
  - 原创
description:
  - 纯 OpenCV、零模型权重的多目标跟踪框架：从跟踪器选型、IoU 关联、ID 生命周期到 MOG2 运动检测的完整工程实践。
image:
  - /cover/OpenCV-MOT.jpg
---
# 只用 OpenCV 做多目标跟踪：从 CSRT 到 ID 生命周期

大多数 OpenCV 跟踪教程的终点是这么几行：

```python
tracker = cv2.TrackerCSRT_create()
tracker.init(frame, bbox)
while True:
    ok, bbox = tracker.update(frame)
    cv2.rectangle(frame, ...)
```

跑起来很爽，但它只回答了半个问题。CSRT 告诉你"这个框下一帧大概在哪"，却从不告诉你"这仍然是同一个目标"。一旦画面里出现第二个人、第一个人被挡住两秒、或者有人走出画面再从另一侧进来，这套代码就散了：框会漂、会跳到别人身上、会因为一次 `ok=False` 彻底消失。

单目标跟踪器（SOT）和多目标跟踪（MOT）之间缺的不是一个 API，而是一整层东西：**关联、身份、生命周期**。

这篇文章基于开源项目 [opencv-multi-object-tracking](https://github.com/CGmoke/opencv-multi-object-tracking)（一个纯 OpenCV、不依赖任何模型权重的 MOT 框架），把这一层拆开讲清楚。包括每个设计决定背后的理由，以及那些只有在真跑起来之后才会遇到的 OpenCV 坑。

---

## 一、先认清手里的四把刀

OpenCV 的 contrib 模块提供了四个可用的相关滤波/在线学习跟踪器。它们都在 `cv2.legacy` 或 `cv2` 命名空间下，构造方式统一，但性格完全不同：

| 后端 | 原理 | 性格 | 适用 |
| --- | --- | --- | --- |
| `CSRT` | 通道与空间可靠性加权的判别式相关滤波 | 精度最好，框贴合紧，慢 | 离线分析、精度优先 |
| `KCF` | 核化相关滤波（循环矩阵 + 高斯核） | 最快可用，快速运动和遮挡下容易丢框 | 实时、低配机器 |
| `MIL` | 多示例学习，把框内样本当"正包" | 抗部分遮挡，但框会越跑越松，CPU 吃得多 | 遮挡频繁、能容忍框松 |
| `MOSSE` | 最小输出平方误差，纯频域 | 极快，精度最差 | 极端性能场景 |

项目在 640×480、两个目标、含绘制与 JPEG 编码的实测数据：

| 后端 | 每帧检测 | 每 2 帧检测 |
| --- | --- | --- |
| KCF | 41.6 fps | 52.8 fps |
| CSRT | 31.4 fps | 32.5 fps |

而纯运动检测（MOG2 + 形态学 + 轮廓，不含跟踪）大约 320 fps。

这组数字说了一件很重要的事：**瓶颈永远在相关滤波跟踪器上，不在预处理上**。所以在优化之前，先决定 `kcf` 还是 `csrt`，比任何微优化都有效。项目里所有"低配机器怎么办"的建议，最终都归结为换 `kcf` 或拉大检测间隔。

### 构造跟踪器：一个必须写的兼容链

OpenCV 的历史包袱在这里体现得非常具体。4.5.1 把 contrib 跟踪器挪进了 `cv2.legacy`，后续版本又往回挪，某些构建只暴露类而不暴露工厂函数。硬编码任何一个入口，都会在别人的机器上 `AttributeError`。

所以正确的做法是逐点探测：

```python
def _candidate_factories(name: str):
    short = name.upper()
    candidates = []

    legacy = getattr(getattr(cv2, "legacy", None), f"Tracker{short}_create", None)
    if callable(legacy):
        candidates.append((f"cv2.legacy.Tracker{short}_create", legacy))

    modern = getattr(cv2, f"Tracker{short}_create", None)
    if callable(modern):
        candidates.append((f"cv2.Tracker{short}_create", modern))

    cls = getattr(cv2, f"Tracker{short}", None)
    if cls is not None and callable(getattr(cls, "create", None)):
        candidates.append((f"cv2.Tracker{short}.create", cls.create))

    return candidates
```

注意顺序：**legacy 优先**。这不是保守，是踩出来的。在"运动检测 + 大量跟踪器实例反复创建销毁"这种负载下，较新 OpenCV 里的 `cv2.TrackerX_create` 新实现出现过堆损坏导致进程崩溃，而 `cv2.legacy` 版本稳定。旧构建没有 `cv2.legacy` 时会自动回退到新实现。

另一个坑：**部分平台的跟踪器拒绝浮点元组**。`init()` 之前必须把框四舍五入到整数像素，宽度高度还得兜个底（`max(1.0, w)`），否则一个退化框会让某些后端直接抛 `cv2.error`。

```python
def init_tracker(tracker, frame, bbox):
    x, y, w, h = bbox
    tracker.init(frame, (int(round(x)), int(round(y)),
                         int(round(max(1.0, w))), int(round(max(1.0, h)))))
```

`update()` 的返回值同样不可信任——它可能返回 `None`、可能抛异常、可能给出 `w=0` 的退化简并框。这些都要在适配层吃掉，转成干净的 `Optional[BBox]`，别让它们污染上层逻辑。

---

## 二、N 个目标 = N 个跟踪器 + 一层关联

想清楚这一点，MOT 就不神秘了：

> **每个存活目标独占一个跟踪器实例；每帧让所有跟踪器各自 `update()`；再用一个新来的观测框去和已有目标做匹配，决定谁是谁。**

跟踪器负责"框往哪走"，关联负责"框属于谁"。前者是 OpenCV 给的，后者要自己写。

单帧的流程大概长这样：

```text
frame
  │
  ├─► [可选] 检测器 (YOLO / MOG2 / 手工框) ──► detections: List[BBox]
  │
  ├─► 对每个存活 track：tracker.update(frame) ──► 新几何框
  │
  ├─► iou_matrix(track_boxes, det_boxes) ──► (N_track × N_det) 矩阵
  │
  ├─► match(matrix, threshold) ──► (配对, 未匹配轨迹, 未匹配检测)
  │        ├─ 配对 ──► 重锚跟踪器, hits+1, 状态置 ACTIVE
  │        └─ 未匹配检测 ──► 新建 ID
  │
  └─► 未匹配轨迹 ──► misses+1 ──► 超时销毁
```

这里有个容易被忽略但很关键的取舍：**`TrackManager.step()` 的返回值是一个不可变快照**（`FrameResult`），包含当帧的目标、新建 ID、销毁 ID、匹配结果。调用方（CLI、Web、录像）只消费这个快照，不碰内部状态。这样同一套跟踪内核可以同时喂给 OpenCV 窗口、Flask 的 MJPEG 流、CSV 写入器和录像器，而彼此不知情。

---

## 三、IoU 关联：为什么贪心就够了（大部分时候）

关联的度量选了 IoU，理由很朴素：**廉价、无依赖、语言中立**。它不需要卡尔曼滤波预测位置，不需要外观特征，不需要 GPU。对于 30fps 的固定机位场景，相邻两帧同一个目标的 IoU 通常在 0.6 以上，而不同目标之间接近 0——这个信噪比已经足够。

IoU 矩阵用 numpy 向量化算，一次算完 N×M 个组合：

```python
ix = np.clip(np.minimum(ax2[:, None], bx2[None, :])
             - np.maximum(ax1[:, None], bx1[None, :]), 0, None)
iy = np.clip(np.minimum(ay2[:, None], by2[None, :])
             - np.maximum(ay1[:, None], by1[None, :]), 0, None)
inter = ix * iy
union = area_a + area_b - inter
out = np.where(union > EPS, inter / union, 0.0)
```

然后两种匹配策略：

**贪心**：把所有 IoU 超过阈值的 `(分数, 行, 列)` 三元组按分数降序排，从高到低取，取过的行列跳过。复杂度 `O(n·m·log(n·m))`，确定性极强。

**匈牙利**：`scipy.optimize.linear_sum_assignment` 求全局最优的一对一指派。代价矩阵构造有个小技巧——低于阈值的配对给一个 `1e6` 的禁止代价，大于任何真实代价（真实代价在 `[0, 1]`），于是求解器只会在别无选择时才碰它，事后按阈值过滤掉即可：

```python
cost = np.where(matrix >= threshold, 1.0 - matrix, _FORBIDDEN_COST)
row_ind, col_ind = linear_sum_assignment(cost)
pairs = [(int(r), int(c)) for r, c in zip(row_ind, col_ind)
         if matrix[r, c] >= threshold]
```

匈牙利是全局最优，但项目默认用贪心，原因值得说：**贪心在 MOT 里的损失通常可以忽略，而它带来的确定性更值钱**。排序键是 `(-score, row, col)`——分数相同时按行列号排，保证跨平台、跨运行结果完全一致。这意味着 CI 里可以断言精确的 ID 序列，而引入浮点求和顺序差异的求解器会让测试变得脆弱。

匈牙利作为可选路径保留（`--match-method hungarian`，需要 `pip install scipy`，缺失时自动回退贪心并只告警一次）。

---

## 四、ID 生命周期：真正决定体验的部分

这一层是纯领域逻辑，跟 OpenCV 一点关系都没有——这正是它值得单独设计的原因。

### 状态机

```text
         检测命中
  ┌──────────────────────┐
  ▼                      │
[ACTIVE] ──更新失败──► [LOST] ──misses > max_missing──► 销毁
  │                      │
  │                      └──距上次检测 ≥ max_coast──► 销毁
  │
  └──hits < min_hits 且首次丢失──► 立即销毁（暂定轨迹）
```

三个阈值，各管一件事：

- `min_hits`（默认 3）：轨迹要被"确认"需要多少次检测命中。未确认的暂定轨迹**一次丢失就立刻销毁**，而且不入销毁事件——这条专治 1~2 帧的误检闪烁。检测端再怎么漏，也漏不出满屏乱跳的 ID。
- `max_missing`（默认 15）：丢失后保留 ID 等待恢复的帧数。遮挡、转身、短暂出画都靠它扛。
- `max_coast`（默认 8）：**无检测支持**的连续滑行上限。它和 `max_missing` 同时生效，谁先触发谁负责回收。这是防漂移的：跟踪器可以自己"觉得"还在跟踪，一路滑到画面角落，`max_missing` 拦不住它，`max_coast` 可以。

### 一个反直觉的设计：跟踪器成功 ≠ 命中

这是整个项目里我最想推荐的一个决定。

朴素写法是：`tracker.update()` 返回 `ok=True` 就当作这条轨迹还活着、命中数加一。但这会让"命中"这个概念失去意义——跟踪器永远说自己 ok，哪怕目标早就没了、框正贴着背景纹理慢慢爬。

所以这里划了一条硬线：

```python
# 跟踪器自报成功只刷新几何，不计命中、不改状态
def _accept_box(self, track, box, frame_index):
    box = self._smooth_box(track, box)
    track.bbox = box
    track.misses = 0
    track.last_seen_frame = frame_index
    track.push_trail(bbox_center(box), self.trail_length)
```

`hits` **只**由"检测匹配"增加，状态**只**能由检测匹配从 `LOST` 恢复到 `ACTIVE`。跟踪器的唯一职责是给出候选几何，它没有身份话语权。

代价是：纯手工框选（没有任何检测器）时，目标丢失后无法自动恢复，必须重新框选。这个代价是值得的——它把"跟踪器幻觉"这类最难 debug 的问题从源头掐掉了。

### 平滑：为什么"存平滑后的框，用原始框重锚"

抖动是这类系统的常见病。项目的做法是滑动平均窗口（`smooth_window`，默认 5）优先，`box_smoothing` 的 EMA 兜底：

```python
if self.smooth_window > 1:
    track.box_history.append(box)
    count = float(len(track.box_history))
    return tuple(sum(item[i] for item in track.box_history) / count
                 for i in range(4))
```

但注意 `_refresh()` 里的细节：

```python
raw = normalize_bbox(detection.bbox)
self._init_fn(track.tracker, frame, raw)   # 跟踪器吃原始检测框
box = self._smooth_box(track, raw)         # 对外展示用平滑框
track.bbox = box
```

**跟踪器用原始检测框，展示和导出用平滑框。** 反过来的话，平滑引入的滞后会被喂进跟踪器，下一帧的搜索窗口就偏了，误差会累积。平滑只能做在输出侧，不能做在反馈环里。

还有一个边界：`LOST` 的目标重新出现时，清空平滑历史直接吸附新框。否则旧位置会把新框拖回来一截——看起来就像"框追着目标慢慢挪过去"。

### 一个真实的下标错位 bug

`step()` 里第三步——回收超期滑行的 `LOST` 轨迹——会删字典条目，导致 `self.tracks` 列表缩短、下标整体前移。而第二步产生的匹配对里存的是**列表下标**。如果不处理，`matched` 字段会越界或指向错误目标。

修法是按 `track_id` 重映射：

```python
tracks = self.tracks
index_by_id = {t.track_id: i for i, t in enumerate(tracks)}
matched = tuple(
    (index_by_id[track_id], det_index)
    for track_id, det_index in (
        (assoc_tracks[track_index].track_id, det_index)
        for track_index, det_index in pairs
    )
    if track_id in index_by_id
)
```

**在下标和对象身份之间，永远优先相信身份。** 只要有一处可能删元素，下标就是不可靠的。

---

## 五、让画面里自动出现目标：MOG2 背景建模

跟踪器需要初始框。框从哪来？三种：手工种子框、运行时鼠标框选、自动检测。前两种零成本，第三种最实用——而且**不需要任何模型权重**。

`cv2.createBackgroundSubtractorMOG2()` 在固定机位下几乎是免费的午餐：它把静止的内容学成背景，只留下"和背景不一样"的前景。项目把它做成了一条 8 级流水线，因为**裸 MOG2 的输出根本没法用**：

```text
frame
 1. 灰度化 → [CLAHE] → GaussianBlur(5) → [medianBlur]
 2. 亮度突变门控（1/4 抽样中位数，跳变 ≥ 8 灰度级即丢帧）
 3. 背景模型 apply(gray, learningRate=rate)   ← detectShadows=False
 4. 时序一致性：最近 2 帧掩码 bitwise_and
 5. 形态学：开运算去噪点 + 闭运算补孔洞
 6. 前景占比 > 25% → 判为全局突变，整帧丢弃
 7. findContours → 面积/边长/长宽比/填充率/最大占比过滤
 8. mergeFragments → NMS
 9. 连续性(≥2) + 位移(≥6px) + 静止剔除(30 帧) → confidence ≥ 0.45
```

几个参数选择值得解释：

**`varThreshold=25` 而不是 OpenCV 默认的 16。** 默认值在纹理地面上会把每一丝抖动都判成前景，输出一片雪花。25 配合前置的高斯模糊，正好压掉纹理波动而不丢真实目标。

**`detectShadows=False`。** 打开阴影检测等于主动引入"半灰度"的第三类像素，紧接着要做阴影剔除，最后发现噪点翻倍收益为零。

**`learningRate=0.0`，预热后冻结背景。** 这是最反直觉的一个。让背景持续学习会导致移动物体的躯干被慢慢吸收进背景，最后只剩一条很窄的前沿条——框越跟越小。冻结背景能让运动物体在移动期间**整体**保持为前景，框的形状接近真实。代价是静止物体也会残留前景，这由后面的位移门限处理。

**预热期必须用温和的学习率。** `warmup_rate` 默认 0.05。设成 1.0 会把模型重置成单分量状态，之后运动物体一帧就被吸收——和上面同样的症状。这个坑很难从现象反推原因，因为"模型收敛太快"和"阈值太高"看起来一模一样。

### 时序一致性：一行代码省掉一半调参

```python
stable = self._masks[0]
for previous in list(self._masks)[1:]:
    stable = cv2.bitwise_and(stable, previous)
```

最近 N 帧掩码按位与。单帧闪烁的噪点、压缩块、边缘抖动无法通过多帧交集，从源头消失；真实目标连续存在，交集后仍在。默认 `temporal_frames=2`——窗口开大会把快速目标的框裁窄，一般不超过 3。历史不足时返回全零掩码，等价于"延后 N-1 帧再输出"，这个语义干净且可预测。

### 处理的顺序是有讲究的

`findContours` 之后不是立刻 NMS，而是**先过滤单个连通域 → 再合并碎片 → 最后 NMS**：

```python
merged = merge_fragments(boxes, iou_threshold=0.15, gap_px=0.0, growth=3.0)
kept = nms(merged, iou_threshold=0.6, containment_threshold=0.8)
```

如果先 NMS 再合并，一个被拆成三块的物体会被 NMS 各自保留（它们互不重叠），然后才被分组合并——但分组时已经丢失了"它们本来是一伙"的信息。先合并能让同一物体的多个局部框收敛成一个覆盖整体的外接框，NMS 只负责清理"整体框 + 残留局部框"这种真正的重复。

### 静止目标：`min_motion_px` 抓不到的那种

`min_motion_px`（默认 6px）比较的是候选中心相对**首次出现位置**的位移。这能滤掉从未移动的物体，但抓不到"走过来然后停住"的目标——背景已经冻结，它就永久留在前景里，而它相对首次位置早就不止 6px 了。

补充手段是 IoU 的时间连续性：相邻两次检测框 IoU ≥ 0.95 连续 30 次，判定为静止，停止输出。目标再次移动后重新获得新 ID（身份不跨静止期保留，这是刻意的——静止 30 帧后"重新出现"的目标，从系统视角看确实是一个新观测）。

### 置信度不设面积项

运动检测天然没有"分数"。项目构造了一个复合评分：

```python
score = (0.5 * shape_score    # 长宽比偏离 1 的程度 × 填充率
       + 0.3 * fill_score     # 框内前景像素占比
       + 0.1 * persist_score  # 连续命中次数
       + 0.1 * motion_score)  # 移动 1.0 / 静止 0.5
```

关键是**面积不参与打分**。加面积项看起来合理（大目标更可信），实际会让合并算法更倾向于保留"几何错误但面积巨大"的框——下游去重在分数并列时就会挑错。这是个典型的"评分函数与下游消费方式耦合"的陷阱。

---

## 六、三类失控，三道护栏

背景建模在生产环境里的失败模式高度集中。项目针对三类各设了一道护栏：

| 失控 | 现象 | 护栏 |
| --- | --- | --- |
| 光照突变 | 开关灯、云影飘过、自动曝光调整 → 整屏变前景 → 一帧内 spawn 几十个 ID | 亮度中位数门控 + `max_fg_ratio=0.25` + 3 帧快速重学背景 |
| 置信度饱和 | 所有候选都是 0.99，过滤形同虚设 | 复合评分，不随面积单调递增，`min_quality=0.45` |
| 巨型合并框 | 链式合并把半屏背景并成一个框 | `merge_growth=3.0`：并集面积不超过较大输入框的 3 倍 |

亮度门控的实现有个细节值得一提——用**中位数**而不是均值，而且先做 1/4 抽样：

```python
level = float(np.median(gray[::4, ::4]))
if abs(level - self._brightness) >= self.brightness_step:  # 默认 8
    self._brightness = level      # 吸附到新亮度，避免连续触发
    return True
self._brightness = (1 - rate) * self._brightness + rate * level  # EMA
```

一个人走近镜头会改变大面积像素，均值会被拉低从而误触发；中位数基本不动。而开关灯、自动曝光是整体分布平移，中位数立刻跳变。抽样 1/4 让这个判断几乎零成本。

触发后不是简单丢帧：进入恢复期（3 帧），期间用 `warmup_rate` 更新背景，让模型快速适应新亮度，同时清空时序窗口（旧亮度的掩码和新帧相与会全空，留着只会白白多丢一帧）。

---

## 七、绘制：那些让演示"看起来专业"的细节

这部分代码量不小，但全是 OpenCV 基础 API 的组合。挑三个真正影响观感的：

**按 ID 生成稳定高对比颜色。** 用黄金比例步进色相，相邻 ID 的颜色差异最大：

```python
hue = int(((track_id * 0.618033988749895) % 1.0) * 179)
hsv = np.uint8([[[hue, 220, 255]]])
bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)[0][0]
```

注意 OpenCV 的 H 通道范围是 `0~179`（不是 0~360），S/V 是 `0~255`。这个换算错了会导致颜色全挤在红黄区间。

**所有几何绘制都用 `lineType=cv2.LINE_AA`。** 矩形和文字的锯齿在 480p 上极其明显，抗锯齿的开销可以忽略。

**字号和线宽跟着分辨率走。** 固定 `0.5` 的字号在 720p 上小到看不清，在 360p 上又盖住目标：

```python
scale = clamp(frame.shape[0] / 720.0 * 0.6, 0.38, 0.9)
thickness = max(1, round(frame.shape[0] / 480.0 * 2))
```

**标签底板位置要自适应。** 目标贴着画面顶部时，标签画在框上方会被裁掉，得翻到框下方：

```python
ty = y - 6 if y - th - baseline - 6 >= 0 else y + h + th + 6
```

**轨迹用逐段渐变模拟淡出。** 对每一段单独算混合比例，越旧越接近背景色：

```python
for index in range(total):
    factor = (index + 1) / total
    segment_color = scale_color(color, factor)
    cv2.line(frame, points[index], points[index + 1], segment_color,
             thickness, cv2.LINE_AA)
```

比"整条线一个颜色"好看得多，成本只是几十次 `cv2.line`。

---

## 八、踩坑清单

把上面散落的坑集中列一遍，这些都是真跑起来才会遇到的：

1. **跟踪器不在 `opencv-python` 里。** 必须 `opencv-contrib-python>=4.5.1`。装错了报的是 `AttributeError: module 'cv2' has no attribute 'TrackerCSRT_create'`，很容易误判成版本问题。
2. **`TrackerX_create` 的命名空间会漂移。** 写兼容链，legacy 优先。某些构建只有 `cv2.TrackerX.create()` 类方法。
3. **`init()` 要整数框。** 部分平台拒绝浮点元组，且宽高必须 ≥ 1。
4. **`background.apply()` 的学习率必须用关键字传参。**
   ```python
   mask = bg.apply(gray, learningRate=rate)   # 对
   mask = bg.apply(gray, rate)                # 危险
   ```
   第二个位置参数在部分 OpenCV 版本里被当作 `fgmask`，学习率静默失效——不报错，只是物体躯干被慢慢吸进背景，框越跑越小。这类"参数错位但不报错"的坑最难查。
5. **跟踪器会报出画面外的坐标。** 不做 `clip` 的话，CSV 里会出现负坐标行，屏幕上会画到窗口外。项目在 `_accept_box` 前统一裁剪，完全出画则直接当丢失处理。
6. **分辨率变化必须重建背景模型。** 换摄像头、切视频源都会踩到。项目在 `__call__` 开头比对 `(width, height)`，变了就 `reset(keep_background=False)`。
7. **`findContours` 在 OpenCV 4 返回 2 个值**（contours, hierarchy），OpenCV 3 是 3 个。跨大版本兼容要处理。
8. **`cv2.boundingRect` 给的是整数像素框**，`cv2.contourArea` 给的是浮点面积。二者不一致是正常的（轮廓可以是不规则形状），别拿来互相校验。
9. **H 通道范围是 0~179。**
10. **`--loop` 循环播放后，基于 FPS 估算的时间戳会和真实时间脱钩。** 需要精确时间就随帧传时钟，别用 `frame_index / fps`。

---

## 九、性能：先换后端，再谈并行

前面说过瓶颈在跟踪器。项目的并行化选择也基于这个判断，而且做得非常克制：

```python
if self.max_parallel > 0 and len(track_ids) > 1:
    boxes = self._update_boxes_parallel(track_ids, frame)   # 只并行 update
    for track_id, box in zip(track_ids, boxes):
        self._apply_update_result(track_id, box, frame, frame_index)  # 主线程
```

**只把 `tracker.update()` 的纯计算阶段丢进线程池**，关联和状态机永远在主线程按固定顺序执行。这样结果与串行完全一致，可复现性不受影响。默认 `max_parallel=0`（完全串行）——并行是可选加速，不是默认行为。

Python 的 GIL 让很多人觉得线程池对 CPU 密集任务没用，但 OpenCV 的 C++ 后端在计算时会释放 GIL，所以多个跟踪器的 `update()` 确实能并行跑。前提是**一个跟踪器实例不能被两个线程同时 update**——项目是一轨迹一任务，天然满足。

其他性能手段按性价比排序：

1. **换 `kcf`**：31 → 41 fps，一步到位。
2. **拉大检测间隔**（`--motion-interval 2` / `detector.interval 3`）：间隙由跟踪器推进，检测只在关键帧做。
3. **跳帧而不是排队**：Web 模式在捕获/处理/推流三路分别做滑动窗口速率统计，处理跟不上输入时只处理最新帧。视频流里**丢帧比延迟好**——延迟会累积，丢帧不会。
4. **降低推流帧率**：`stream_fps=15` 对监控画面足够，对编码器是减半的负担。

---

## 十、这条路的边界在哪

诚实地讲：纯 OpenCV 的相关滤波 + IoU 关联，能撑住的场景是有明确边界的。

**能做好：**
- 固定机位、目标数量个位数、遮挡时间短于 1 秒
- 目标是行人/车辆这类"框形稳定"的对象
- 实时性要求 25~30 fps、没有 GPU
- 需要零权重部署、可离线、可审计

**做不好：**
- **长时间完全遮挡后恢复身份**。没有 ReID，遮挡 2 秒后从另一侧出来，系统给的就是新 ID。这是信息论层面的缺失，不是调参能解决的。
- **快速运动 + 低帧率**。IoU 关联假设相邻帧位置相近；30fps 下快速横穿的目标，相邻帧 IoU 可能直接归零。项目里预留了 `pairwise_centroid_distance` 作为次级关联线索，但主流程尚未启用。
- **相机运动**。手持拍摄时全局背景都在动，MOG2 会输出满屏前景。项目只能靠 `learning_rate=0.01` 让背景缓慢吸收"移动过的静态区域"来缓解，本质是权宜之计。
- **外观相似的目标交叉**。两个穿同样工服的人交错走过，IoU 关联会在交叉点交换身份。

要继续往上走，路子是清楚的：**检测器换 YOLO（项目已支持 `--detector yolo`）+ 关联加入卡尔曼预测 + 身份加入 ReID 特征**。这就是 DeepSORT / ByteTrack 的方向。项目把检测器和跟踪器都做成了端口（`domain/ports.py`），换实现只需要提供符合契约的对象，不用改领域逻辑。

---

## 快速上手

```bash
git clone https://github.com/CGmoke/opencv-multi-object-tracking.git
cd opencv-multi-object-tracking
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

mot-track --list-trackers          # 看当前环境支持哪些后端

# 视频 + 自动运动检测，无需任何模型权重
mot-track --source demo.mp4 --motion --csv trails.csv

# 无界面服务器上跑，只看统计
mot-track --source demo.mp4 --motion --no-display --max-frames 200

# 浏览器里看 MJPEG 实时画面
pip install -e ".[web]" && mot-web   # → http://127.0.0.1:8000
```

导出的 CSV 每帧每个 ACTIVE 目标一行，含 `track_id, frame, timestamp, x, y, w, h, cx, cy, label`，可以直接灌进 pandas 画轨迹热力图。

---

## 结语

把 OpenCV 的跟踪器变成可用的多目标跟踪器，工作量的大头不在 OpenCV。真正的工程都在三个地方：

1. **把不可靠的观测变可靠**（时序一致性、形态学、多重几何过滤、复合置信度）
2. **把不可靠的身份变可靠**（IoU 关联、状态机、命中只认检测、滑行上限）
3. **把失控的场景变可控**（光照门控、面积护栏、跳帧策略）

第一类靠调图像，第二类靠设计数据结构，第三类靠承认系统会失败并给它兜底。

至于那个 `cv2.legacy` 的兼容链和 `learningRate=` 的关键字——它们是这条路上必须交的过路费。写下来，下一个踩到的人能少花一天。

---

*项目地址：[github.com/CGmoke/opencv-multi-object-tracking](https://github.com/CGmoke/opencv-multi-object-tracking) · Apache-2.0*
