---
title: Label Studio 数据标注完整教程
layout: '@/layouts/Post'
date: 2026-09-30
tags:
  - label-studio
  - yolo
  - 数据标注
categories:
  - 编程
label:
  - 原创
description:
  - 从环境安装到 YOLO 目标检测数据标注的保姆级指南
image:
  - /assets/image-20260717173514671.png
---
# Label Studio 数据标注完整教程

从环境安装到 YOLO 目标检测数据标注的保姆级指南

Label StudioYOLO 目标检测Windows数据标注

目录

[环境准备与安装](#ch1)

[启动 Label Studio](#ch2)

[创建标注项目](#ch3)

[配置标注标签](#ch4)

[导入图片数据](#ch5)

[开始数据标注](#ch6)

[导出标注结果](#ch7)

[转换为 YOLO 格式](#ch8)

[划分数据集](#ch9)

[常见问题与解决方案](#ch10)

## 1环境准备与安装

### 1.1 前置条件

在安装 Label Studio 之前，请确保你的电脑已安装以下软件：

| 软件   | 最低版本       | 说明                         |
| :----- | :------------- | :--------------------------- |
| Python | 3.9+           | 推荐 3.10                    |
| pip    | 最新版         | Python 自带包管理器          |
| 浏览器 | 任意现代浏览器 | Chrome / Edge / Firefox 均可 |

**建议**

如果你的电脑上已有 Miniconda / Anaconda，建议创建一个独立的虚拟环境来安装 Label Studio，避免与其他项目的依赖冲突。

### 1.2 创建虚拟环境（推荐但非必须）

```
# 使用 conda 创建虚拟环境
conda create -n label_studio python=3.10

# 激活虚拟环境
conda activate label_studio
```

### 1.3 安装 Label Studio

激活虚拟环境后，使用 pip 一键安装 Label Studio：

```
# 安装 Label Studio
pip install label-studio
```

安装过程中 pip 会自动下载所有依赖包，整个安装过程大约需要 2 ~ 5 分钟（取决于网速）。

**注意**

安装完成后，终端可能会弹出 Windows 防火墙提示，请选择"允许访问"，否则后续启动可能无法在浏览器中访问。

### 1.4 验证安装

```
# 查看 Label Studio 版本
label-studio --version
```

如果能正常输出版本号（如 1.18.0），说明安装成功。

## 2启动 Label Studio

### 2.1 基本启动

在终端中执行以下命令启动 Label Studio：

```
label-studio start
```

启动后，终端会显示如下信息：

```
Label Studio is starting at http://localhost:8080
```

### 2.2 指定端口和数据目录（可选）

```
# 指定端口为 9090
label-studio start --port 9090

# 指定数据存储目录
label-studio start --data-dir D:/my_label_studio_data
```

### 2.3 访问 Web 界面

启动成功后，在浏览器中打开以下地址：

```
http://localhost:8080
```

首次访问会进入注册页面。输入邮箱和密码创建一个账号（不需要邮箱验证），创建完成后自动登录。

## 3创建标注项目

### 3.1 新建项目

登录后，点击页面中央的 Create Project 按钮。

**Step 1**

在弹出的对话框中填写项目信息：

- **Project name**：输入项目名称，如 `food_packaging_detection`
- **Description**：可选，如"食品包装袋目标检测数据集标注"

然后点击 Create 按钮创建项目。

<img src="/assets/image-20260717173621295.png" alt="image-20260717173621295" style="zoom:67%;" />

### 3.2 进入项目设置

创建完成后，会自动进入项目页面。如果需要重新进入，可以在首页的项目列表中点击项目名称。

点击右上角的 Settings 按钮进入项目设置。

## 4配置标注标签

### 4.1 选择标注模板

在 Settings 页面中，选择左侧的 Labeling Interface 选项卡。

**Step 2**

点击 Browse Templates 按钮，在模板列表中选择：

##### Object Detection with Bounding Boxes

![image-20260717173514671](/assets/image-20260717173514671.png)

这个模板专门用于矩形框目标检测标注，正是 YOLO 训练所需的格式。

### 4.2 配置标签类别

选择模板后，会进入标签配置界面。默认会有两个示例标签，我们需要替换成自己的类别。

**Step 3**

在 **Labels** 区域中，删除默认标签，然后添加你的目标类别。例如，如果你的数据集包含以下类别：

- `food_pkg` — 食品包装袋
- `paper_ball` — 纸团
- `empty_cig_box` — 空烟盒

则点击 "Add Label" 分别添加这三个标签。

**关键规则**

标签名称建议使用英文小写 + 下划线（如 `food_packaging`），避免使用中文和空格。这样在后续导出 YOLO 格式时能减少转码问题。

<img src="/assets/image-20260717173810570.png" alt="image-20260717173810570" style="zoom: 67%;" />

需要根据你要标注的图片来命名，以上为列举内容，只有参考价值。

### 4.3 手动编辑标签配置（高级）

如果你想精确控制配置，可以切换到 Code 视图手动编辑 XML。一个典型的目标检测配置如下：

```
<View style="height: 512px">
  <Image name="image" value="$image" zoom="true"
         zoomControl="true" rotateControl="true"/>
  <RectangleLabels name="label" toName="image"
                    strokeWidth="3" opacity="0.9">
    <Label value="food_packaging" background="#FF0000"/>
    <Label value="paper_ball" background="#00FF00"/>
    <Label value="empty_cig_box" background="#0000FF"/>
  </RectangleLabels>
</View>
```

##### 其中每个 `<Label>` 的 `background` 属性可以指定该类别框的颜色。

<img src="/assets/image-20260717173942685.png" alt="image-20260717173942685" style="zoom: 67%;" />

##### 需要根据你要标注的图片来命名，以上为列举内容，只有参考价值。

### 4.4 保存配置

配置完成后，点击右下角的 Save 按钮保存标签设置。

## 5导入图片数据

Label Studio 提供两种主要的图片导入方式。你可以根据需要选择其中一种。

<img src="/assets/image-20260717174206270.png" alt="image-20260717174206270" style="zoom:50%;" />

### 5.1 方式一：直接上传图片（最简单）

适合图片数量较少（< 1000 张）的场景。

**Step 4**

1. 在项目页面中，点击右侧的 Import 按钮
2. 选择 **Upload Files** 或直接将图片文件拖拽到上传区域
3. 支持批量上传，可以选择整个文件夹中的所有图片
4. 等待上传完成，页面会显示已导入的图片数量

**加速技巧**

如果你的图片很多，可以通过设置环境变量 `DATA_UPLOAD_MAX_NUMBER_FILES=5000` 来增加单次上传数量上限。

### 5.2 方式二：链接本地文件目录（推荐大量图片）

适合图片数量多、或图片已经按目录组织好的场景[[2\]](#cite-2)。

**Step 4b**

1. 进入 Settings → **Cloud Storage** 选项卡

2. 点击 Add Source Storage

3. 按如下配置填写：

   | 配置项              | 填写内容                                        |
   | :------------------ | :---------------------------------------------- |
   | Storage Type        | `Local files`                                   |
   | Storage Title       | 自定义名称（如 `my_images`）                    |
   | Absolute local path | 图片所在目录的绝对路径，如 `D:\datasets\images` |
   | Use for             | 选择 `Source storage`                           |

4. 点击 Add Storage 保存

5. 点击 Sync Storage 将图片同步到项目中

**重要**

使用本地文件链接方式时，启动 Label Studio 之前必须设置环境变量：

```
set LABEL_STUDIO_LOCAL_FILES_SERVING_ENABLED=true
set LABEL_STUDIO_LOCAL_FILES_DOCUMENT_ROOT=D:\Coding\TienKung_URDF\tianyi2_urdf
```

其中 `DOCUMENT_ROOT` 必须是图片目录的父目录或更高层级。

![image-20260717174414182](/assets/image-20260717174414182.png)

## 6开始数据标注

### 6.1 进入标注界面

图片导入完成后，在项目页面点击 Label All Tasks 按钮进入标注工作区。

### 6.2 标注操作步骤

**Step 5**

**画框标注流程：**

1. **选择标签**：在右侧面板中，先点击你要标注的类别标签（如 `food_packaging`）
2. **画框**：在图片上按住鼠标左键，拖动画出一个矩形框，将目标物体框住
3. **调整框**：框画好后，可以拖动框的边角来调整大小，拖动框的中心来移动位置
4. **继续标注**：对图片中的每一个目标重复上述操作
5. **提交**：标注完当前图片后，点击右下角的 Submit 按钮保存标注并跳到下一张

### 6.3 快捷键

掌握快捷键可以大幅提升标注效率：

| 快捷键     | 功能                     |
| :--------- | :----------------------- |
| `D`        | 提交当前标注，跳到下一张 |
| `A`        | 跳到上一张图片           |
| `Ctrl + Z` | 撤销上一步操作           |
| `Delete`   | 删除选中的标注框         |
| `Ctrl + S` | 保存当前标注             |
| `Esc`      | 取消当前操作             |
| 1          | 选择标签                 |

### 6.4 标注注意事项

- **框要紧贴目标边缘**：不要留过多空白，也不要裁掉目标的一部分
- **标注一致性**：同类目标在不同图片中的标注标准要一致（比如都框整个包装袋，而不是有时框一半）
- **遮挡处理**：如果目标被部分遮挡，仍然用框标注可见部分
- **小目标**：即使是很小的目标，也要标注（YOLO 对小目标检测有专门的策略）
- **模糊图片**：如果图片过于模糊无法辨认，可以跳过不标注

## 7导出标注结果

### 7.1 导出标注数据

标注完成后，需要将标注结果导出为可以使用的格式。

**Step 6**

1. 在项目页面中，点击右侧的 Export 按钮

2. 在导出格式下拉菜单中，选择 Yolo with Images 格式（Label Studio 的原生格式）

3. 点击 Export 按钮

   ![image-20260717184110479](/assets/image-20260717184110479.png)

4.选择导出

![image-20260717181928258](/assets/image-20260717181928258.png)



## 8常见问题与解决方案

### Q1: 启动 Label Studio 后浏览器无法访问？

**原因**：Windows 防火墙拦截了请求。

**解决**：在防火墙弹窗中选择"允许访问"；或手动在 Windows 防火墙中放行 8080 端口。

### Q2: 导入的本地图片显示无法加载？

**原因**：未设置本地文件访问的环境变量。

**解决**：在启动前设置以下两个环境变量：

```
set LABEL_STUDIO_LOCAL_FILES_SERVING_ENABLED=true
set LABEL_STUDIO_LOCAL_FILES_DOCUMENT_ROOT=你的图片根目录
```

### Q3: 导出的标注框位置不对？

**原因**：Label Studio 使用百分比坐标（0~100），YOLO 使用归一化坐标（0~1）。

**解决**：确保转换脚本中将坐标除以 100。本文提供的转换脚本已处理此问题。

### Q4: 训练时类别编号不匹配？

**原因**：`CLASS_NAMES` 列表顺序与 `data.yaml` 中的 `names` 顺序不一致。

**解决**：确保两者完全一致，建议复制粘贴避免手动输入错误。

### Q5: Windows 下训练时 DataLoader 报错？

**原因**：Windows 多进程数据加载存在兼容性问题。

**解决**：将 `workers` 参数设为 0（最稳定）或 2~4（稍快）。

### Q6: 标注界面图片加载很慢？

**解决**：如果是通过本地文件链接方式导入，确保 `DOCUMENT_ROOT` 路径正确。如果是上传方式，图片已缓存到 Label Studio 内部，速度取决于磁盘 I/O。

### Q7: 如何修改已提交的标注？

在项目页面中，将筛选条件切换为 "Annotated"，然后点击任意已标注的图片即可重新编辑标注。

### Q8: 能否使用已有 YOLO 模型进行预标注（自动标注）？

**可以**。Label Studio 支持接入 ML 后端，用训练好的 YOLO 模型自动生成预标注，人工只需审核和修正。需要安装 `label-studio-ml` 并配置后端脚本。此功能较为复杂，建议在基础标注流程熟悉后再尝试。

## 参考来源

1. Label Studio 官方文档, Quick start guide for Label Studiohttps://labelstud.io/guide/quick_start
2. DraemSky, label-studio的使用教程(导入本地路径)https://blog.csdn.net/DraemSky/article/details/148454889
3. sanshanjianke, YOLO快速入门和Label Studio的安装使用(速成课)https://blog.csdn.net/sanshanjianke/article/details/158314006
4. Trisyp, 目标检测系列(五)已标注数据集(yolo格式)导入labelstudio继续标注https://blog.csdn.net/Trisyp/article/details/149051050
5. wxzuobi, 深度学习—数据标注—label-studiohttps://blog.csdn.net/wxzuobi/article/details/154236748