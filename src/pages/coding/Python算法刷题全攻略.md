---
title: Python算法刷题全攻略
layout: '@/layouts/Post'
date: 2026-09-12
tags: [博客, 教程]
pin: false
language: 中文
categories:
  - 编程
label:
  - 原创
description:
  - Python算法刷题全攻略
image:
  - /Python算法刷题全攻略.jpg
---
# Python 算法刷题全攻略：从入门到进阶的实战方法论

> 面向两类读者：**刚入门的算法小白**和**已经刷过一些题、想要体系化突破的老手**。
> 编程语言统一使用 **Python**。本文不求「量」，只求「质」——每个知识点都讲清楚**为什么**、**怎么写**、**什么时候用**。

---

## 目录

1. [为什么用 Python 刷题](#一为什么用-python-刷题)
2. [Python 刷题工具箱（新手必看，老手速查）](#二python-刷题工具箱)
3. [高频题型与考点（由浅入深）](#三高频题型与考点)
4. [刷题平台横向对比](#四刷题平台横向对比)
5. [刷题方法论：从入门到进阶的路径](#五刷题方法论)
6. [结语](#六结语)

---

## 一、为什么用 Python 刷题

先破除一个误区：**「Python 太慢，不适合刷算法」**。

这个说法只对了一半。Python 的执行速度确实远慢于 C++，但在 99% 的面试题和大量竞赛题中，**你真正的瓶颈是「思路」，而不是「常数」**。只要复杂度写对（通常 O(n log n) 以内），Python 完全够用。

Python 刷题的优势：

| 优势 | 说明 |
| :--- | :--- |
| **语法简洁** | 少写一半样板代码，把精力留给算法本身 |
| **内置数据结构强大** | `list`、`dict`、`set`、`deque`、`heapq`、`Counter` 开箱即用 |
| **整数不溢出** | 大数运算、取模天然安全，无需考虑 `long long` |
| **代码即伪代码** | 面试时写出来更接近可读的思路，沟通成本低 |

一句话：**用 Python 刷题，练的是思维，不是打字速度。**

---

## 二、Python 刷题工具箱

> 这一节既是新手的「语法补课」，也是老手的「速查手册」。建议收藏。

### 2.1 内置数据结构速查

#### list —— 万能序列

```python
a = [1, 2, 3]
a.append(4)              # 尾部追加
a.pop()                  # 弹出尾部
a.insert(0, 0)           # 头部插入 O(n)，慎用
a[1:3]                   # 切片，返回新列表
a.sort()                 # 原地排序
b = sorted(a)            # 返回新列表
```

**两个高频易错点：**

```python
# 1. 深拷贝 2D 数组：必须用列表推导，不能用乘法
grid = [[False] * n for _ in range(m)]   # 正确，每行独立
# grid = [[False] * n] * m               # 错误！所有行指向同一对象

# 2. 回溯中保存路径必须复制一份
res.append(path[:])      # 复制一份
# res.append(path)       # 错误！path 后续会被修改
```

#### dict —— 哈希表，时间换空间的核心

```python
d = {}
d.get(key, 0)            # 不存在时返回默认值，避免 KeyError
d[key] = d.get(key, 0) + 1   # 经典「计数 +1」写法
for k, v in d.items():       # 遍历键值对
    pass
```

#### set —— 去重与快速查找

```python
seen = set()
if x in seen:            # O(1) 查找
    pass
a & b                    # 交集
a | b                    # 并集
```

#### 字符串

```python
s.split()                # 按空白切分
s.split(',')             # 按指定字符切分
','.join(items)          # 拼接
s.strip()                # 去首尾空白
s.count('a')             # 计数
s.find('a')              # 查找下标，不存在返回 -1
s[i:j]                   # 切片（字符串不可变，切片产生新串）
```

### 2.2 collections 模块 —— 竞赛三件套

#### deque —— BFS 的标配队列

```python
from collections import deque
q = deque()
q.append(x)              # 入队尾
q.popleft()              # 出队头，O(1)
q.appendleft(x)          # 入队头
```

> 为什么不用 `list.pop(0)`？因为 `pop(0)` 是 **O(n)**，BFS 里会让复杂度直接退化。

#### Counter —— 一键计数

```python
from collections import Counter
cnt = Counter("aabbbcccc")   # Counter({'c':4,'b':3,'a':2})
cnt.most_common(1)           # 出现最多的元素
```

#### defaultdict —— 免去判键

```python
from collections import defaultdict
adj = defaultdict(list)      # 建图时自动创建空列表
adj[u].append(v)
```

#### OrderedDict —— 手写 LRU 缓存

`OrderedDict` 能记住插入顺序，配合 `move_to_end` 和 `popitem` 可实现 O(1) 的 LRU：

```python
from collections import OrderedDict
class LRU:
    def __init__(self, cap):
        self.cap = cap
        self.d = OrderedDict()
    def get(self, key):
        if key not in self.d: return -1
        self.d.move_to_end(key)          # 标记为最近使用
        return self.d[key]
    def put(self, key, val):
        if key in self.d:
            self.d.move_to_end(key)
        self.d[key] = val
        if len(self.d) > self.cap:
            self.d.popitem(last=False)   # 淘汰最久未使用
```

### 2.3 heapq —— 堆（优先队列）

```python
import heapq
h = []
heapq.heappush(h, x)     # 入堆
top = heapq.heappop(h)   # 弹出最小元素
```

> 注意：`heapq` 默认是**小根堆**。要「求前 K 大」或「大根堆」，存**负值**即可：`heappush(h, -x)`。

```python
# 求前 K 大（用小根堆维护，堆顶即第 K 大）
h = []
for x in nums:
    heapq.heappush(h, x)
    if len(h) > k:
        heapq.heappop(h)   # 弹出最小的，剩下的 k 个就是前 K 大
```

### 2.4 bisect —— 二分查找的内置实现

```python
import bisect
a = [1, 3, 3, 5, 7]
bisect.bisect_left(a, 3)    # 2，第一个 >= 3 的下标
bisect.bisect_right(a, 3)   # 4，第一个 > 3 的下标
```

`bisect` 只适用于**已经排序**的数组。但很多题目需要**自定义判定函数**（二分答案），这时必须手写模板——见 [3.3 节](#33-二分查找与二分答案)。

### 2.5 functools —— 记忆化搜索的开关

```python
from functools import lru_cache
@lru_cache(None)         # Python 3.9+ 可直接用 @cache
def fib(n):
    return n if n <= 1 else fib(n-1) + fib(n-2)
```

加一个装饰器，就能把指数级的递归暴搜变成记忆化搜索（很多 DP 都可以这样写，见 [3.7 节](#37-动态规划)）。

### 2.6 itertools —— 排列组合与累加

```python
from itertools import permutations, combinations, accumulate, product

list(permutations([1,2,3]))          # 全排列
list(combinations([1,2,3], 2))       # 组合
list(accumulate([1,2,3,4]))          # [1,3,6,10] 前缀和
list(product('ab', '12'))            # 笛卡尔积
```

> 竞赛里 `itertools.permutations` 能快速帮你验证手写回溯是否正确，但正式提交时**不要依赖它**——它是暴力枚举，容易超时。

### 2.7 math —— 数论常用

```python
from math import gcd, lcm, comb, factorial, isqrt, inf

gcd(12, 18)              # 6，最大公约数
lcm(4, 6)                # 12，最小公倍数（Python 3.9+）
comb(n, k)               # 组合数 C(n,k)
isqrt(n)                 # 整数平方根（向下取整）
float('inf')             # 正无穷
-math.inf                # 负无穷
```

### 2.8 排序技巧

```python
# 1. 自定义 key
nums.sort(key=lambda x: x[1])            # 按元组第二个元素排序
nums.sort(key=lambda x: (x[0], -x[1]))   # 多关键字：第一个升序，第二个降序

# 2. 稳定排序：Python 的 sort 是稳定的，等价元素保持原序

# 3. 自定义比较器（Python 3 需 cmp_to_key）
from functools import cmp_to_key
def cmp(a, b):
    return (a > b) - (a < b)   # 返回 -1/0/1
nums.sort(key=cmp_to_key(cmp))
```

### 2.9 位运算速查

```python
x & 1            # 判断奇偶：1 为奇，0 为偶
x >> 1           # 除以 2（向下取整）
x << 1           # 乘以 2
x & (x - 1)      # 去掉最低位的 1（经典技巧）
x & -x           # 取出最低位的 1（lowbit）
x ^ y            # 异或：找只出现一次的数字
mask & (1 << i)  # 判断第 i 位是否为 1
```

### 2.10 输入输出与递归优化（竞赛必配）

```python
import sys
sys.setrecursionlimit(1_000_000)   # 调大递归深度（DFS 常配）

# 快速读入
input = sys.stdin.readline

# 输出缓冲（交互题必须 flush）
print(ans, flush=True)
```

> 竞赛中习惯性加上 `sys.setrecursionlimit`，否则深树 DFS 会 `RecursionError`。

### 2.11 第三方神器 sortedcontainers

Python 没有内置的「有序集合/有序列表」。当题目要求 O(log n) 插入、删除、求第 K 小/rank 时，可以用第三方库：

```python
from sortedcontainers import SortedList
sl = SortedList()
sl.add(x)                # O(log n) 插入
sl.discard(x)            # O(log n) 删除
sl[k]                    # 第 k 小
sl.bisect_left(x)        # rank
```

> LeetCode 已内置该库；Codeforces / AtCoder 的 Python 环境也支持。这是 Python 选手对抗「有序集合」类题目的重要武器。

---

## 三、高频题型与考点

> 本节按**由浅入深**排列，覆盖比赛和面试最常见的题型。每个题型给出「识别信号 + 模板 + 一道例题」。

### 3.1 数组与双指针 / 在线枚举

**识别信号**：题目在数组上找「满足某种关系的两个位置」，且这种关系有单调性。

**核心思想**：与其枚举所有下标对 O(n²)，不如维护「遍历过程中遇到的最优值」在线更新，把复杂度降到 O(n)。

**例题：买卖股票的最佳时机（LeetCode 121）**

> 求某天买入、未来某天卖出能获得的最大利润。

```python
def maxProfit(prices):
    min_price = float('inf')   # 维护已遍历部分的最小值
    ans = 0
    for p in prices:
        ans = max(ans, p - min_price)   # 先算利润
        min_price = min(min_price, p)   # 再更新最小值，保证「买入在前」
    return ans
```

这类「边遍历边维护一个历史最优值」的写法，我称之为**在线枚举**，是双指针/前缀最值的入门形态。

**双指针**是其推广：两个指针同向或相向移动，每次移动都「不回头」，从而 O(n) 扫完。

### 3.2 前缀和与差分

**识别信号**：频繁求「子数组/区间的和」。

**核心思想**：预处理 `pre[i] = sum(nums[0..i-1])`，则任意区间和 `[l, r]` 可 O(1) 求出：

```python
# 区间和 = pre[r+1] - pre[l]
pre = [0]
for x in nums:
    pre.append(pre[-1] + x)
sum_lr = pre[r + 1] - pre[l]
```

配合 `itertools.accumulate` 或 `bisect`（前缀和数组通常递增，可二分）能解决大量题。差分是前缀和的逆运算，用于「区间统一加减」的批量更新。

### 3.3 二分查找与二分答案 ⭐重点

二分是**最容易在边界上翻车**的算法，死循环、越界、多一少一都是常客。解决之道是**不要死记「加一减一」，而要用统一的思维模型**。

#### 3.3.1 红蓝染色法：一个模型吃透所有二分

想象把数组染成两种颜色：

- **红色**：不满足条件的元素（在左边）；
- **蓝色**：满足条件的元素（在右边）。

二分的过程，就是不断用 `mid` 试探，把 `mid` 染成红或蓝，让红蓝的分界线逐渐逼近真正的答案。

以「查找第一个 ≥ target 的下标」为例，条件 `check(mid) = nums[mid] >= target`：

```python
def lower_bound(nums, target):
    # 开区间 (left, right)，循环不变量：
    #   nums[left]  < target  （红）
    #   nums[right] >= target  （蓝）
    left, right = -1, len(nums)
    while left + 1 < right:          # 区间内还有未染色元素
        mid = (left + right) // 2
        if nums[mid] >= target:      # 满足条件 → 染蓝
            right = mid
        else:                        # 不满足 → 染红
            left = mid
    return right                     # 第一个蓝色位置
```

**为什么开区间 `(-1, n)` 最省心？** 因为初始时 `left=-1` 是「虚拟的红」，`right=n` 是「虚拟的蓝」，天然满足循环不变量，无需纠结 `left` 到底指哪儿。

**四种需求，一次转化：**

| 需求 | 写法 |
| :--- | :--- |
| 第一个 ≥ x | `lower_bound(nums, x)` |
| 第一个 > x | `lower_bound(nums, x + 1)` |
| 最后一个 < x | `lower_bound(nums, x) - 1` |
| 最后一个 ≤ x | `lower_bound(nums, x + 1) - 1` |

#### 3.3.2 二分答案：把「求最值」变成「猜答案」

当问题的解有**单调性**（若 `x` 可行，则所有比 `x` 大/小的都可行）时，可以直接对答案二分。

**求最小可行解**（check 单调：前面 False，后面 True）：

```python
def min_feasible(lo, hi, check):
    left, right = lo - 1, hi + 1   # 保证 check(left)=False, check(right)=True
    while left + 1 < right:
        mid = (left + right) // 2
        if check(mid):
            right = mid            # check 为真 → 往小找
        else:
            left = mid
    return right                   # 最小的满足 check 的值
```

**求最大可行解**（check 单调：前面 True，后面 False）：只需把更新反过来，最后返回 `left`。

> 一句话记忆：**开区间写法里，check 为真时更新谁，最后就返回谁。**

**例题：爱吃香蕉的珂珂（LeetCode 875）**

> 求能在 `h` 小时内吃完所有香蕉的最小速度 `k`。速度越大越容易吃完，单调，直接二分答案：

```python
def minEatingSpeed(piles, h):
    def check(k):
        # 速度 k 下，吃完所有香蕉需要的总小时数
        return sum((p + k - 1) // k for p in piles) <= h
    left, right = 0, max(piles) + 1   # right 一定不可行（每堆都吃不满一口）
    while left + 1 < right:
        mid = (left + right) // 2
        if check(mid):
            right = mid
        else:
            left = mid
    return right
```

> 注意 `(p + k - 1) // k` 是**向上取整除法**的经典写法。

### 3.4 单调栈 ⭐重点

**识别信号**：「下一个更大/更小元素」「左侧最近比它大的」「柱状图/车队」等——凡是「找某个方向最近的满足大小关系的元素」，先想单调栈。

**核心思想**：维护一个「单调」的栈（存下标），遍历时把「没有用了」的元素弹掉，栈顶就是答案。每个元素**入栈一次、出栈一次**，总复杂度 O(n)。

```python
def next_greater_right(nums):
    # 返回 right[i]：nums[i] 右侧最近的严格大于它的下标，不存在为 len(nums)
    n = len(nums)
    right = [n] * n
    st = []
    for i in range(n - 1, -1, -1):
        while st and nums[st[-1]] <= nums[i]:   # 想求「严格小于」改 >=
            st.pop()                            # 弹出「永远没用」的元素
        if st:
            right[i] = st[-1]
        st.append(i)
    return right
```

**例题：每日温度（LeetCode 739）**

> 求每一天之后再过几天会迎来更高温度。等价于求「右侧第一个大于它的下标」。

```python
def dailyTemperatures(t):
    n = len(t)
    ans = [0] * n
    st = []
    for i in range(n - 1, -1, -1):
        while st and t[st[-1]] <= t[i]:
            st.pop()
        if st:
            ans[i] = st[-1] - i
        st.append(i)
    return ans
```

**记忆点**：栈里存的是「还没找到答案」的元素；弹出的条件 `<=` 还是 `<` 决定「严格」还是「非严格」。

### 3.5 哈希表

**识别信号**：「两数之和」「是否存在」「前缀匹配」「去重计数」——需要 O(1) 查找/计数。

哈希表本身不难，难在**「哈希表 + 其他技巧」的组合**：

- 哈希表 + 前缀和：把「和为 target 的子数组」转化为「找前面的某个前缀和」。
- 哈希表 + 遍历顺序：一次遍历，边查边存（如两数之和）。
- 哈希表 + 字符串：用前缀哈希集合做「最长公共前缀」类题。

```python
# 两数之和：一次遍历，查补数
def twoSum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
```

### 3.6 贪心

**识别信号**：求「最大值/最小值」，且**每一步都能做出当前看起来最优、且全局也最优的选择**。

**关键**：贪心不是「猜」，而是「能证明」。常见套路：

- **排序后贪心**：先排序，再依次处理（如区间调度、摧毁小行星）。
- **增量贪心**：只关注相邻关系，把「总收益」拆成可累加的小段。

**例题：买卖股票的最佳时机 II（LeetCode 122）**

> 可以无限次交易（但每次只持一股），求最大利润。策略：**抓住每一次上涨**。

```python
def maxProfit(prices):
    return sum(max(0, prices[i+1] - prices[i]) for i in range(len(prices)-1))
```

**为什么对？** 任意策略的利润都不超过「所有上升段的高度总和」，而「相邻上涨就累加」恰好能把这个总和全部拿到手。中继下跌全部跳过。

> **贪心 vs 动态规划**：当「看起来能贪心但不确定对不对」时，先想想 DP（见下节）。很多题目（如股票系列）贪心和 DP 都能做，但 DP 更普适。

### 3.7 动态规划 ⭐重点

DP 是算法题的分水岭。判断和建模比背模板更重要。

#### 3.7.1 判断一道题是不是 DP

**口诀：求最优问方案数，阶段明显无后效，贪心不对暴力慢，十有八九是 DP。**

具体信号：

1. **问法**：最大/最小/最长/最多、方案数（常要取模 `1e9+7`）、能否凑出/到达。
2. **结构**：有明显的「阶段性」（一天天、一步步、一个个物品、一棵树的子树）；决策只依赖当前状态（无后效性）。
3. **陷阱**：题目表面是字符串/图/数学，剥开后是 DP；「看着像贪心但贪心会错」的基本必是 DP。

#### 3.7.2 解题四步法

1. **定状态**：用什么变量唯一描述当前子问题？常见 `dp[i]`、`dp[i][j]`。
2. **推转移**：当前状态有哪些决策？先写文字递推，再翻译成代码。
3. **初始化**：边界值填 0 或 ±inf；计数类 DP 记得 `dp[0] = 1`。
4. **优化**：先保证正确，再考虑滚动数组、维度压缩。

#### 3.7.3 核心模板（按考察频率排序）

**① 线性 DP（最高频）**

```python
# 最大子段和（连续）
dp = [0] * n
dp[0] = a[0]
for i in range(1, n):
    dp[i] = max(dp[i-1] + a[i], a[i])
ans = max(dp)

# 打家劫舍（不相邻选取最大值）
dp[0] = a[0]
dp[1] = max(a[0], a[1])
for i in range(2, n):
    dp[i] = max(dp[i-1], dp[i-2] + a[i])
```

**② 背包 DP（必考）—— 正序/倒序是关键**

```python
# 0-1 背包：每个物品最多选一次 → 容量倒序遍历
dp = [0] * (V + 1)
for w, v in items:
    for j in range(V, w - 1, -1):
        dp[j] = max(dp[j], dp[j - w] + v)

# 完全背包：每个物品无限次 → 容量正序遍历
for w, v in items:
    for j in range(w, V + 1):
        dp[j] = max(dp[j], dp[j - w] + v)
```

> **记忆**：0-1 背包倒序是为了「每个物品只用一次」；正序会变成无限用。

**③ 区间 DP**：枚举「区间长度 → 左端点 → 分割点」。

```python
# 石子合并（最小值）：dp[l][r] = min(dp[l][k] + dp[k+1][r]) + 区间和
for length in range(2, n + 1):
    for l in range(n - length + 1):
        r = l + length - 1
        dp[l][r] = float('inf')
        for k in range(l, r):
            dp[l][r] = min(dp[l][r], dp[l][k] + dp[k+1][r] + pre[r+1] - pre[l])
```

**④ 树形 DP**：状态定义在「以 u 为根的子树」上。

```python
# 树上最大独立集（没有上司的舞会）
def dfs(u, parent):
    dp0[u] = 0          # 不选 u
    dp1[u] = val[u]     # 选 u
    for v in adj[u]:
        if v == parent: continue
        dfs(v, u)
        dp0[u] += max(dp0[v], dp1[v])
        dp1[u] += dp0[v]
```

**⑤ 状态压缩 DP**：n 很小（≤ 20），状态是「集合」，用二进制位表示选/没选。

```python
# TSP：dp[mask][u] 表示访问过 mask 集合、当前在 u 的最短路径
dp = [[inf] * n for _ in range(1 << n)]
dp[1][0] = 0
for mask in range(1 << n):
    for u in range(n):
        if mask & (1 << u):
            for v in range(n):
                if not (mask & (1 << v)):
                    dp[mask | (1 << v)][v] = min(dp[mask | (1 << v)][v],
                                                 dp[mask][u] + dist[u][v])
```

**⑥ 数位 DP**：求 [L, R] 内满足条件的数字个数，用**记忆化搜索**写最自然。

```python
@lru_cache(None)
def dfs(pos, tight, ...):
    if pos == len(digits):
        return 1 if 满足条件 else 0
    limit = digits[pos] if tight else 9
    res = 0
    for d in range(limit + 1):
        res += dfs(pos + 1, tight and d == limit, ...)
    return res
```

#### 3.7.4 记忆化搜索：DP 的另一种写法

很多 DP 用「自顶向下 + 记忆化」写更直观，尤其当状态带条件时。以股票问题为例：

```python
from functools import lru_cache

def maxProfit(prices):
    n = len(prices)
    @lru_cache(None)
    def dfs(i, hold):
        if i < 0:
            return -inf if hold else 0   # 非法状态用 -inf 表示
        if hold:
            return max(dfs(i-1, True), dfs(i-1, False) - prices[i])  # 持有：不动 或 买入
        return max(dfs(i-1, False), dfs(i-1, True) + prices[i])      # 不持有：不动 或 卖出
    return dfs(n-1, False)
```

> 技巧：**用 `-inf` 表示「非法状态」**，转移时 `max` 会自动排除它。

### 3.8 深度优先搜索（DFS）与回溯

**识别信号**：遍历所有可能解（排列、组合、子集）、找所有路径、棋盘问题、需要「尝试-撤销」的场景。

#### DFS 本质

DFS = 用**栈**驱动的纵深遍历。「不撞南墙不回头」，走到尽头再回溯。树的递归遍历是它的最小原型：

```python
def preorder(root):
    if not root: return
    print(root.val)
    preorder(root.left)
    preorder(root.right)
```

图遍历需要 `visited` 防止死循环；无向图还要传 `parent` 避免「回到父亲」造成假环。

#### 回溯三要素与模板

任何回溯题，回答三个问题即可建模：

| 要素 | 含义 | 例子（全排列） |
| :--- | :--- | :--- |
| **路径 path** | 已经做出的选择 | `path` 数组 |
| **选择列表** | 当前可选的合法选项 | 尚未用过的数字 |
| **结束条件** | 何时构成完整解 | `len(path) == len(nums)` |

```python
def backtrack(路径, 选择列表):
    if 满足结束条件:
        收集结果(路径)        # 注意 path[:] 复制
        return
    for 选择 in 选择列表:
        做选择
        backtrack(路径, 新的选择列表)
        撤销选择              # 回溯！
```

```python
# 全排列
def permute(nums):
    res = []
    used = [False] * len(nums)
    def dfs(path):
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):
            if not used[i]:
                used[i] = True
                path.append(nums[i])
                dfs(path)
                path.pop()          # 撤销
                used[i] = False     # 撤销
    dfs([])
    return res
```

#### 剪枝：回溯的灵魂

裸回溯是指数级，必须剪枝：

1. **可行性剪枝**：当前状态已不可能满足条件，立即 return（N 皇后冲突）。
2. **最优性剪枝**：当前代价已超过已知最优，不再深入。
3. **记忆化剪枝**：用备忘录记录已算状态（爬楼梯 → 记忆化 → 就是 DP）。
4. **顺序剪枝**：排序让搜索尽早命中/触发剪枝。

```python
memo = {}
def fib(n):
    if n <= 1: return n
    if n not in memo:
        memo[n] = fib(n-1) + fib(n-2)
    return memo[n]
```

#### DFS vs BFS 怎么选

| 特性 | DFS | BFS |
| :--- | :--- | :--- |
| 数据结构 | 栈（递归/显式） | 队列 |
| 路径性质 | 不一定最短 | 无权图必最短 |
| 适用 | 回溯、所有解、连通性 | 最短路、层级遍历、扩散 |

### 3.9 网格图 DFS / BFS

二维网格是「图」的特例，方向固定为「上下左右」。递归入口是某个格子，边界是「出界/障碍/已访问」。

**DFS（连通块）**：

```python
def num_islands(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':
            return
        grid[i][j] = '0'    # 标记已访问（就地淹没，省 visited 数组）
        for x, y in (i, j-1), (i, j+1), (i-1, j), (i+1, j):
            dfs(x, y)
    ans = 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                dfs(i, j)
                ans += 1
    return ans
```

**BFS（最短路）**：

```python
from collections import deque
def bfs_shortest(grid, sx, sy):
    m, n = len(grid), len(grid[0])
    dis = [[-1] * n for _ in range(m)]
    dis[sx][sy] = 0
    q = deque([(sx, sy)])
    while q:
        i, j = q.popleft()
        for x, y in (i, j-1), (i, j+1), (i-1, j), (i+1, j):
            if 0 <= x < m and 0 <= y < n and grid[x][y] != '#' and dis[x][y] < 0:
                dis[x][y] = dis[i][j] + 1
                q.append((x, y))
    return dis
```

> 两个模板共用同一个方向元组写法 `(i, j-1), (i, j+1), (i-1, j), (i+1, j)`，可背下来。

### 3.10 链表

链表在 Python 中需要手写节点：

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

必背的四个操作：

```python
# 反转链表
def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev

# 快慢指针找中点（快指针走两步，慢指针走一步）
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next

# 哑节点（头节点可能被改时，统一边界处理）
dummy = ListNode(0, head)
cur = dummy
# ... 操作 ...
return dummy.next

# 环检测：快慢指针相遇则有环；相遇后一头回起点同步走，再相遇即环入口
```

**关键心法**：链表操作前，先「保存下一个节点 `nxt`」，否则容易断链。

### 3.11 图论（补充）

工作区笔记主要聚焦 DFS，这里补上几个必会的图论高频考点：

- **拓扑排序**：有依赖关系（课程表）→ 用「入度 + 队列」或 DFS 后序逆序。
- **最短路**：无权图用 BFS；带权图用 Dijkstra（`heapq` 实现）；负权用 Bellman-Ford/SPFA。
- **并查集**：连通性、判环、等价关系 → 路径压缩 + 按秩合并。

```python
# 并查集模板
class DSU:
    def __init__(self, n):
        self.p = list(range(n))
    def find(self, x):
        if self.p[x] != x:
            self.p[x] = self.find(self.p[x])   # 路径压缩
        return self.p[x]
    def union(self, a, b):
        self.p[self.find(a)] = self.find(b)
```

---

## 四、刷题平台横向对比

| 平台 | 定位 | 优点 | 缺点 | 适合谁 |
| :--- | :--- | :--- | :--- | :--- |
| **LeetCode（力扣）** | 面试导向 | 题量大、题解/讨论区极其丰富、每日一题、难度分级清晰、内置 `sortedcontainers` | 偏面试风格，算法竞赛氛围弱，困难题质量良莠不齐 | 求职面试、打基础 |
| **洛谷 (Luogu)** | 竞赛/OI 导向 | 算法标签完善、难度系数（颜色）直观、蓝桥杯真题齐全、海量题单 | 界面偏竞赛，面试题少，部分题解质量参差 | 蓝桥杯、CSP、国内竞赛 |
| **Codeforces** | 全球算法竞赛 | 题目思维性强、新颖，rating 体系清晰，赛后 editorial 权威，赛制分层 | 英文、现场赛有压力、构造/交互题多、无中文 | 提升思维、冲 rating |
| **AtCoder** | 日本算法竞赛 | 题目质量极高、题面严谨、ABC/ARC/AGC 分层清晰、editorial 详细、对 Python 友好 | 英文/日文、现场赛制 | 打比赛、练高质量题 |
| **牛客网** | 校招笔试 | 企业笔试真题多、模拟笔试、榜单 | 题解质量一般、界面略杂 | 校招笔试备考 |
| **蓝桥杯** | 国内赛事 | 题目贴近生活场景、模板化、Python 友好 | 难度上限不高、风格偏「套模板」 | 拿奖、保研加分 |

**搭配建议：**

- **求职党**：LeetCode 为主，按「剑指 Offer + 热题 100」刷，辅以牛客笔试真题。
- **竞赛党**：洛谷刷蓝桥杯真题打底，AtCoder/Codeforces 打比赛练思维、补题。
- **两者兼顾**：LeetCode 练「模板熟练度」，AtCoder ABC 练「灵活运用」，每周固定打一场比赛。

---

## 五、刷题方法论

### 5.1 新手路线（0 → 能过面试）

1. **过语言关**：把本文第二章的工具箱代码亲手敲一遍。
2. **按标签刷**：数组 → 哈希表 → 字符串 → 排序 → 双指针 → 前缀和。
3. **三板斧**：熟练掌握「双指针 + 前缀和 + 哈希表」，能解决大量简单/中等题。
4. **攻二分**：用[红蓝染色法](#331-红蓝染色法一个模型吃透所有二分)写 10 道二分，做到一次 AC 无死循环。
5. **栈与队列**：单调栈、BFS。
6. **递归与回溯**：树遍历 → 全排列/组合/子集 → 剪枝。
7. **动态规划**：先线性 DP 和背包，再区间/树形。

### 5.2 进阶路线（老手突破）

1. **专题攻坚**：单调栈、区间 DP、树形 DP、状压 DP、数位 DP、图论（拓扑/最短路/并查集）。
2. **限时训练**：每题限 20–30 分钟，模拟真实考试/面试的压力。
3. **打比赛补题**：AtCoder ABC / Codeforces Div.3 起步，赛后必补「没做出来但接近」的题。
4. **写题解笔记**：像本仓库一样，把每道题的「识别信号 + 思路 + 模板 + 易错点」沉淀下来。**写笔记是逼自己讲清楚，讲清楚才是真会。**

### 5.3 复盘方法论（比多刷更重要）

拿到一道没做出来的题，按这个顺序：

1. 先自己想 15 分钟（建立「痛苦记忆」，才记得牢）。
2. 看题解，但只看「思路」，不看代码；自己把代码写出来。
3. 反问三个问题：
   - 这道题属于哪个题型？识别信号是什么？
   - 我卡在哪一步？是没识别题型，还是不会转移/边界？
   - 下次看到什么关键词能立刻想到这个解法？
4. 记一条笔记，写「一句话总结」。

### 5.4 Python 刷题高频易错点清单

- [ ] `path[:]` 复制路径，`[[False]*n for _ in range(m)]` 建二维数组。
- [ ] 0-1 背包倒序，完全背包正序，别搞反。
- [ ] 求最大初始化 `-inf`，求最小初始化 `inf`，计数 `dp[0]=1`。
- [ ] 计数类 DP 每步取模。
- [ ] 用 `deque` 做 BFS，别用 `list.pop(0)`。
- [ ] 深递归记得 `sys.setrecursionlimit`。
- [ ] 回溯时「做选择」和「撤销选择」必须成对。
- [ ] `heapq` 是小根堆，要大根堆存负值。
- [ ] 数组长度多开 1–2 格，避免越界。
- [ ] 答案不一定是 `dp[n]`，有时是 `max(dp)`。

---

## 六、结语

算法刷题的本质，不是记住几百道题的答案，而是**建立「识别题型 → 套用思维模型 → 手写模板」的条件反射**。

- **新手**：先把「三板斧」（双指针、前缀和、哈希）+ 二分 + 回溯 + 线性/背包 DP 练到肌肉记忆。
- **老手**：用单调栈、区间/树形/状压/数位 DP、图论补齐拼图，再通过比赛补题锻炼「陌生题的现场建模能力」。
- **所有人**：写题解笔记。**输入多少都不如输出一次。**

最后送你一句我很喜欢的话：

> **刷题不是目的，构建你的「算法知识体系」才是。** 每做一道题，都往这个体系里挂一个钩子；钩子越密，你解题时能「钓」上来的思路就越多。

祝刷题愉快，AC 不断。 🚀
