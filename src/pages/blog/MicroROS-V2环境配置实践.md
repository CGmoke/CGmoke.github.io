---
title: MicroROS-V2环境配置实践
layout: '@/layouts/Post'
date: 2026-09-10
tags: [MicroROS-V2]
pin: false
language: 中文
categories:
  - 博客
label:
  - 原创
description:
  - MicroROS-V2环境配置实践
image:
  - /MicroROS-V2环境配置实践.png
---

# 为什么我们把 MicroROS-V2 的开发环境从虚拟机搬到了原生 Ubuntu 22.04

> 一次「选型 → 踩坑 → 落地」的完整记录。包含选型依据、10 个阶段的配置过程、以及 5 个能让人卡一整天的坑。
> 目标读者：准备接手 MicroROS-V2（ROS 2 + micro-ROS 视觉跟随小车）的开发者，或正在纠结「虚拟机 / WSL2 / 双系统怎么选」的机器人开发者。

---

## 0. 先说结论

| 问题 | 结论 |
| --- | --- |
| 操作系统选哪个？ | **Ubuntu 22.04.x LTS (jammy)**，唯一现实选项，不是偏好问题 |
| 用虚拟机还是裸机？ | 长期开发用**原生 Ubuntu**；只做评估/教学可沿用官方 VMware 镜像 |
| 能不能直接用 WSL2？ | **不推荐**，网络与串口两道硬伤 |
| 拿到源码 zip 就能搭环境吗？ | **不能**。官方源码包缺件，必须从官方 VM 镜像里导出完整工作区 |
| 最难的一步是什么？ | 不是装 ROS，而是**工作区迁移 + 硬编码/动态拼接路径修复** |

最终落地的版本基线（本机实测）：

| 组件 | 版本 |
| --- | --- |
| OS | Ubuntu 22.04.5 LTS (jammy) |
| ROS 2 | Humble |
| Python | 3.10.12（`uv` 管理的两个隔离环境） |
| 主环境 `mircoros_v2_env` | NumPy 1.26.4 / OpenCV 4.11.0 / mediapipe / onnxruntime |
| YOLO 环境 `yolo_env` | NumPy 2.2.6 / ultralytics 8.4.110 / torch |
| micro-ROS Agent | 预编译包，`uros_ws` 独立工作区，UDP 8090 |
| `ROS_DOMAIN_ID` / `CAR_TYPE` | `40` / `ptz`（豪华云台版） |

---

## 1. 选型：为什么是 Ubuntu 22.04，而不是 24.04 / WSL2 / 虚拟机

### 1.1 为什么必须是 22.04：ROS 2 Humble 的官方支持平台

这一条没有商量余地。ROS 2 的发行版与 Ubuntu 版本是**强绑定**的，由 [REP 2000](https://reps.openrobotics.org/rep-2000/) 规定：**Humble Hawksbill 的 Tier 1 平台就是 Ubuntu 22.04 (Jammy)**。

后果很直接：

- 在 24.04 上执行 `apt install ros-humble-*`，会**大面积 404 / 依赖不可解**——因为 ROS 2 官方只为 jammy 构建了 Humble 的 deb 包；
- 真想在 24.04 上跑 Humble，只能**全源码编译**（rclcpp、rviz、Nav2、cartographer……），这在工程上不可接受；
- 反向也一样：Ubuntu 22.04 上装 Jazzy（Humble 的后继版本）同样没戏。

而本项目全栈都压在 Humble 上：Nav2、slam_toolbox、cartographer、`robot_localization`、`cv_bridge`、`rosbridge`，以及官方那 16 个已经按 Humble 编译好的 ROS 2 包。因此**装 22.04 不是「保守」，而是让 apt 生态直接可用**。

一条命令自查：

```bash
lsb_release -a
# 期望：Description: Ubuntu 22.04.x LTS    Codename: jammy
```

> ⚠️ 官方文档另有一条**顺序警告**：必须先把 systemd / udev 相关系统包升级到最新，**再**装 ROS 2。否则在新装的系统上装 ROS 2 依赖可能误删关键系统包（见 [ros2/ros2#1272](https://github.com/ros2/ros2/issues/1272)、[Launchpad #1974196](https://bugs.launchpad.net/ubuntu/+source/systemd/+bug/1974196)）。所以 `sudo apt full-upgrade -y` 要放在 `apt install ros-humble-desktop` **之前**。

### 1.2 为什么放弃 WSL2

WSL2 看起来很美：与 Windows 共存、不用分区、性能不错。但在这个项目上有两个绕不过去的硬伤，都在**「连硬件」**这件事上：

| 问题 | 具体表现 |
| --- | --- |
| **网络是 NAT** | 这个项目的通信模型是 **ESP32-S3 主动连出**到 Agent：`ESP32 → WiFi → agent_ip:UDP 8090`。WSL2 默认 NAT，局域网内的 ESP32 **根本无法连回 WSL2 里的 Agent**。要改成 `networkingMode=mirrored`（需 Win11 22H2+），还可能和 Windows 自身端口冲突 |
| **USB 串口要转发** | 配置下位机参数、刷写 NVS 都走串口（`/dev/ttyUSB0`）。WSL2 需要 `usbipd-win` 把 USB 设备转发进来，**每次插拔后常要重新绑定**，配置控制板时失败率很高 |
| DDS 多播受限 | 容器/虚拟网络下 ROS 2 的多播发现经常失效，要手工配 `ROS_STATIC_PEERS` |

结论：WSL2 只适合「**纯改代码、不连硬件**」的场景。整车联调不推荐。

### 1.3 为什么从官方 VMware 虚拟机迁移到裸机

官方推荐路线是导入他们的 VMware 镜像，开箱即用。它非常适合「先跑通、验证硬件」，但作为**日常开发环境**，有四个越来越难受的点：

| 维度 | VMware 虚拟机 | 原生 Ubuntu |
| --- | --- | --- |
| CPU / 内存 | 损耗 5–20%，建图时雷达容易掉频 | 100% |
| GPU（YOLO 加速） | 难直通 | 独显可用 |
| USB 串口 | 需手动挂载，偶尔掉设备 | 直通，最稳 |
| 网络（UDP 8090） | 要配桥接，NAT 下直接不通 | 天然同网段 |
| 摄像头图传延迟 | 多一跳虚拟网卡 | 最低 |

关键是：**虚拟化本身不是技术必需**。Agent 只是一个监听 UDP 8090 的普通 ROS 2 节点：

```python
Node(
    package='micro_ros_agent',
    executable='micro_ros_agent',
    arguments=['udp4', '--port', '8090', '-v', '4'],
)
```

车体只关心「那个 IP 通不通」，不关心它跑在虚拟机还是裸机上。官方文档里反复出现的「虚拟机的真实 IP」，换成「Ubuntu 主机的局域网 IP」，其余逻辑**完全不变**。

于是我们的方案是：**保留官方 VM 镜像不删**（当作官方参考环境和缺件仓库），日常开发在原生 Ubuntu 22.04 上进行。

> 💡 如果做的是双系统，安装前务必：暂停 BitLocker、关闭 Windows 快速启动、关闭 Secure Boot、腾出 ≥150 GB 未分配空间、**先用 Live USB 验证 WiFi 网卡和显卡**。装完立即执行 `timedatectl set-local-rtc 1 --adjust-system-clock`，否则和 Windows 来回切换后时间会差 8 小时。

---

## 2. 动手前必须知道的一件事：源码 zip 装不出完整环境

这是整个过程中**最容易让人走弯路**的认知。我们实测核对了官方源码包 `mircoros_v2-1.0.1.zip`（782 个条目），发现它缺了关键组件：

| 缺件 | 为什么重要 | 后果 |
| --- | --- | --- |
| **`smart_tracker` 包** | `microros_v2_bringup/package.xml` 里有 `<depend>smart_tracker</depend>`，`super_tracker.launch.py` 直接依赖它 | ❌ **视觉跟随全线不可用** |
| **模型 `MODELS/tracker/super_track.onnx`** | 上述跟踪器的模型 | ❌ 同上 |
| **`third_party_library/`** | cartographer / gmapping 源码工作区 | ⚠️ 建图方案受限（可用 apt 版替代） |
| **`workspaces/tools/config_robot.py`** | 下位机参数配置工具 | ⚠️ 连车第一步就卡住 |
| Python 虚拟环境 | `uv` 管理的两个环境 | ⚠️ 需重建 |
| `/dev/microros_board` 的 udev 规则 | 串口别名 | ⚠️ 需自行添加 |

其中 `smart_tracker` 特别反直觉：**它没有源码**，只以预编译产物（`.so` + `super_tracker` 可执行 + 6 个 msg/srv）存在于 VM 的 `install/` 里，全盘 `find src/` 根本找不到它，但源码里被引用了 **13 处**。

> 📌 **所以正确姿势是先下载官方 VM 镜像，从镜像里把完整工作区导出，再迁移到原生 Ubuntu。** 这也是我们保留 VM 镜像不删的原因之一。
>
> 如果这台机器装不了 VMware，可以用 `libguestfs` 的 `guestmount` **只读挂载 VMDK** 直接取文件，不用启动虚拟机。官方 VMDK 实测：58.6 GB 稀疏盘，根分区是 `/dev/sda3`（54 GB ext4），VM 内用户名为 `yahboom`。

---

## 3. 配置过程：10 个阶段

整体路线：

```
S0 系统基座 ──► S1 ROS 2 Humble ──► S2 依赖装载 ──► S3 关键组件(Agent/SLAM/Nav2) ──► S4 工作区迁移 ⭐
                                                                                        │
              S9 环境验收 ◄── S8 开发工具 ◄── S7 编译 ◄── S6 网络/串口/环境变量 ◄── S5 Python 双环境
```

首次完整搭建约 **4–6 小时**（含下载）。磁盘建议 `/` ≥ 60 GB、`/home` ≥ 250 GB，内存 ≥ 16 GB（YOLO 推理与 Nav2 同开）。

> 📌 **路径说明**：下文命令中，`~/` 指代你的家目录。官方默认布局是 `~/microros_ws`、`~/MODELS`、`~/workspaces`；本项目最终迁移为**单一父目录布局** `~/microros_v2/{microros_ws,uros_ws,MODELS,workspaces}`。两者只能选一个，混用是后面路径报错的根源。本文按**迁移后布局**书写，并在涉及差异处标注。

### S0　系统基座与预检

```bash
# 1) 系统更新（必须在装 ROS 2 之前！见 §1.1 的 systemd 警告）
sudo apt update
sudo apt full-upgrade -y

# 2) 基础工具
sudo apt install -y \
  build-essential cmake git curl wget vim htop \
  python3-pip python3-venv python3-dev \
  software-properties-common lsb-release gnupg ca-certificates \
  net-tools iputils-ping usbutils v4l-utils

# 3) 时间同步（双系统必做）
timedatectl set-local-rtc 1 --adjust-system-clock

# 4) locale（ROS 2 要求 UTF-8，否则工具链可能乱码/构建失败）
sudo apt install -y locales
sudo locale-gen en_US en_US.UTF-8 zh_CN.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

# 5) 网络预检：ESP32-S3 只支持 2.4G WiFi；Agent 用 UDP 8090
nmcli dev wifi list | head -20
sudo ufw allow 8090/udp
```

**验证点**：

```bash
lsb_release -a | grep 22.04 && echo "S0-OK"
locale | grep -c "UTF-8"     # 应为 3
```

### S1　安装 ROS 2 Humble

现在官方推荐用 `ros2-apt-source` 包自动管理密钥与 apt 源：

```bash
sudo add-apt-repository universe -y
sudo apt update && sudo apt install -y curl

export ROS_APT_SOURCE_VERSION=$(curl -s https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest \
  | grep -F "tag_name" | awk -F'"' '{print $4}')
curl -L -o /tmp/ros2-apt-source.deb \
  "https://github.com/ros-infrastructure/ros-apt-source/releases/download/${ROS_APT_SOURCE_VERSION}/ros2-apt-source_${ROS_APT_SOURCE_VERSION}.$(. /etc/os-release && echo ${UBUNTU_CODENAME:-${VERSION_CODENAME}})_all.deb"
sudo dpkg -i /tmp/ros2-apt-source.deb

sudo apt update && sudo apt full-upgrade -y
sudo apt install -y ros-humble-desktop ros-dev-tools

# 初始化 rosdep 与 colcon
sudo apt install -y python3-colcon-common-extensions python3-rosdep python3-vcstool
sudo rosdep init        # 报 "already exists" 说明已初始化，跳过
rosdep update          # 国内网络常超时，多试几次或配镜像
```

网络受限时可用经典方式（手动加 key 与 `sources.list.d/ros2.list`）。

写入 `~/.bashrc`：

```bash
cat >> ~/.bashrc <<'EOF'

# ===== ROS 2 Humble =====
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=40      # 必须与控制板 ros_domain_id 一致（出厂 40）
export CAR_TYPE=ptz          # ptz | no_ptz | basic_car
EOF
source ~/.bashrc
```

> ⚠️ `CAR_TYPE` 只能是 `ptz` / `no_ptz` / `basic_car` 三者之一，非法值会被**静默回退**为 `ptz`。很多 launch 文件不设这个变量会直接抛异常。

**验证点**：

```bash
printenv ROS_DISTRO          # humble
ros2 pkg list | wc -l        # 通常 > 300

# 双向通信自测
ros2 run demo_nodes_cpp talker &     # 终端 1
ros2 run demo_nodes_py listener      # 终端 2，应打印 I heard: [Hello World: N]
```

### S2　依赖装载

先让 rosdep 自动处理：

```bash
cd ~/microros_v2/microros_ws
rosdep install --from-paths src --ignore-src -r -y
```

失败时用从官方 15 个 `package.xml` 聚合出的清单兜底：

```bash
sudo apt install -y \
  ros-humble-rclpy ros-humble-rclcpp ros-humble-rclcpp-lifecycle \
  ros-humble-rcl-interfaces ros-humble-rosidl-default-generators \
  ros-humble-rosidl-default-runtime ros-humble-rosidl-runtime-py \
  ros-humble-std-msgs ros-humble-std-srvs ros-humble-geometry-msgs \
  ros-humble-sensor-msgs ros-humble-nav-msgs ros-humble-action-msgs \
  ros-humble-visualization-msgs ros-humble-builtin-interfaces \
  ros-humble-nav2-msgs ros-humble-cartographer-ros-msgs \
  ros-humble-launch ros-humble-launch-ros ros-humble-ament-index-python \
  ros-humble-cv-bridge ros-humble-message-filters ros-humble-tf2-ros \
  ros-humble-tf2-geometry-modules ros-humble-pluginlib ros-humble-angles \
  ros-humble-robot-state-publisher ros-humble-joint-state-publisher \
  ros-humble-joint-state-publisher-gui ros-humble-xacro \
  ros-humble-rviz2 ros-humble-rviz-common ros-humble-rviz-default-plugins \
  ros-humble-rviz-rendering ros-humble-robot-localization \
  ros-humble-nav2-common ros-humble-nav2-core ros-humble-nav2-costmap-2d \
  ros-humble-nav2-util ros-humble-nav2-bringup \
  python3-numpy python3-yaml python3-requests python3-opencv python3-pytest \
  libnanoflann-dev nlohmann-json3-dev qtbase5-dev
```

**⚠️ 上面这份清单其实漏了几项必需依赖**——它们不在 `package.xml` 里，但对照官方 VM 的 apt 清单后发现官方装了，且缺了会直接报错：

```bash
sudo apt install -y \
  python3-serial \
  terminator \
  liblua5.3-dev \
  libzbar0 \
  libusb-1.0-0 \
  libprotobuf-dev libprotoc-dev protobuf-compiler \
  libgflags-dev libgoogle-glog-dev libceres-dev libsuitesparse-dev \
  libgeographic-dev libabsl-dev libffi-dev libcairo2-dev \
  ninja-build ccache bison flex gperf \
  libopenblas0 libgl1-mesa-glx mesa-utils gstreamer1.0-libav
```

其中两个是「缺了直接卡住」级别：

- **`python3-serial`**：`config_robot.py` 用 `import serial` 与下位机通信，缺了**连车第一步就做不了**；
- **`liblua5.3-dev`**：源码编译 cartographer 需要 `liblua5.3.so`，只有运行库 `liblua5.3-0` 不够，编译期会报「没有规则可制作目标 liblua5.3.so」。

> 💡 小技巧：`apt-mark showmanual > ~/apt_manual_full.txt`，与官方 VM 导出的清单 `diff`，能快速定位自己缺了哪个包。

### S3　关键组件：Agent / SLAM / Nav2

**先说一个实测更正：Humble 的二进制源里没有 `micro_ros_agent`。**

```bash
# ❌ 这条会失败，不要用
sudo apt install -y ros-humble-micro-ros-agent
```

`apt-cache search micro-ros` 只返回 diagnostic-bridge / msgs / rclc-parameter，**没有 agent**；它依赖的 XRCE-DDS 引擎 `microxrcedds_agent` 同样不在源里。所以 Agent 只能来自「官方 VM 的预编译包」或「源码构建」。

还有一个容易找错位置的点：**Agent 不在 `microros_ws`，而在独立工作区 `uros_ws`**。官方 VM 的 `~/.bashrc` 末尾是**四个前缀**，这是整条链路能通的关键，Agent 就在第三个里：

```bash
source /opt/ros/humble/setup.bash
source ~/microros_v2/microros_ws/install/setup.bash
source ~/microros_v2/uros_ws/install/setup.bash                      # ← agent 在这里
source ~/microros_v2/microros_ws/third_party_library/install/setup.bash
```

本机 `uros_ws/install/` 实测只有 3 个包：`micro_ros_agent`、`micro_ros_msgs`、`micro_ros_setup`。

SLAM / Nav2 这些 apt 都有：

```bash
sudo apt install -y ros-humble-slam-toolbox ros-humble-nav2-map-server
sudo apt install -y ros-humble-slam-gmapping
sudo apt install -y ros-humble-cartographer ros-humble-cartographer-ros liblua5.3-dev
sudo apt install -y ros-humble-navigation2 ros-humble-nav2-bringup
sudo apt install -y ros-humble-rosbridge-suite     # 手机 APP 建图导航需要
```

**不接车也能自检 Agent**：

```bash
ros2 pkg prefix micro_ros_agent        # 应指向 ~/microros_v2/uros_ws/install/micro_ros_agent
ros2 run micro_ros_agent micro_ros_agent udp4 --port 8090 -v4
# 期望：info | UDPv4AgentLinux.cpp | init | running... | port: 8090
```

### S4　工作区迁移（⭐ 决定成败）

这一步的内容见 §2 的结论：从官方 VM 导出，而不是用源码 zip。

**第 1 步：在 VM 内打包**（先记环境清单，便于日后复现）

```bash
cd ~
pip freeze > ~/requirements_full.txt 2>/dev/null
apt-mark showmanual > ~/apt_manual_full.txt 2>/dev/null

tar czf ~/microros_full.tar.gz \
  --exclude='microros_ws/build' \
  --exclude='microros_ws/install' \
  --exclude='microros_ws/log' \
  microros_ws workspaces MODELS 2>/dev/null
```

排除 `build/`、`install/` 后归档通常在 **1–2 GB** 量级（含编译产物约 7.9 GB）。

**第 2 步：传出来**——VMware 共享文件夹 / `scp` / U 盘（NTFS）都行。

**第 3 步：在 Ubuntu 上解包并归位**

```bash
# 若目标布局是 ~/microros_v2/（推荐，单一父目录便于整体搬迁）
mkdir -p /tmp/mrv2 && tar xzf ~/microros_full.tar.gz -C /tmp/mrv2
mkdir -p ~/microros_v2
mv /tmp/mrv2/{microros_ws,workspaces,MODELS} ~/microros_v2/ && rmdir /tmp/mrv2

# Agent 的独立工作区需另行从 VM 导出
# （用 guestmount 只读挂载 VMDK 或直接拷贝）
ls -d ~/microros_v2/{microros_ws,uros_ws,MODELS,workspaces}
```

**第 4 步：修正硬编码路径（用户名不是 `yahboom` 时必做）**

官方的 `.desktop`、脚本、`.vscode/tasks.json` 里**硬编码了 `/home/yahboom`**：

```bash
# 先看有多少处
grep -rl '/home/yahboom' ~/microros_v2/microros_ws ~/microros_v2/workspaces 2>/dev/null

# 替换为当前用户的 HOME
grep -rlZ '/home/yahboom' ~/microros_v2/microros_ws ~/microros_v2/workspaces 2>/dev/null \
  | xargs -0 sed -i "s|/home/yahboom|$HOME|g"

# 复查（应为空）
grep -rl '/home/yahboom' ~/microros_v2/microros_ws ~/microros_v2/workspaces 2>/dev/null
```

**验证点**：

```bash
ls -d ~/microros_v2/{microros_ws,uros_ws,MODELS,workspaces}   # 四个目录都在
ros2 pkg prefix smart_tracker                                  # ⚠️ 关键：视觉跟随的命门
ls ~/microros_v2/MODELS/tracker/                               # super_track.onnx / .engine
grep -rl '/home/yahboom' ~/microros_v2/microros_ws 2>/dev/null | wc -l   # 应为 0
```

### S5　Python 双虚拟环境

官方用 [`uv`](https://astral.sh/uv) 管理**两个隔离环境**，分工明确：主环境跑 RobotManager / mediapipe / 通用视觉，YOLO 环境专门跑 ultralytics，避免依赖冲突。

| 环境 | 用途 | 关键依赖 |
| --- | --- | --- |
| `mircoros_v2_env` | 主项目：视觉、RobotManager、智能体 | mediapipe、opencv、onnxruntime、textual、dt-apriltags、litellm、fastmcp |
| `yolo_env` | YOLO 专用 | `numpy==2.2.6`、`opencv-python>=4.11.0.86`、`ultralytics==8.4.110` |

**⚠️ 两个容易踩的细节**：

1. 官方环境是 **uv 管理的项目（project）**，不是裸 venv。真实结构是 `python_env/<env>/` 放 `pyproject.toml` / `uv.lock`，虚拟环境在**下一层 `.venv/`**。所以激活路径是 **`python_env/mircoros_v2_env/.venv/bin/activate`**，少一层就找不到。
2. **uv 建的 venv 默认不带 pip**（会报 `No module named pip`），装包要用 `uv pip install`。

如果已经整包从 VM 导出，`python_env/` 可以直接复用——实测 `pyvenv.cfg` 里是 `home = /usr/bin`，只要目标机 Python 同为 3.10 就能直接跑，**无需重建**。需要重建时：

```bash
# ① 装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# ② 建两个 uv 环境（保持官方层级：项目目录 + 内部 .venv）
cd ~/microros_v2/microros_ws
uv venv --python 3.10 python_env/mircoros_v2_env/.venv
uv venv --python 3.10 python_env/yolo_env/.venv

# ③ 主环境
uv pip install --python python_env/mircoros_v2_env/.venv/bin/python \
    "dt-apriltags==3.1.7" "mediapipe==0.10.21" "litellm>=1.93.0" "fastmcp>=3.4.4" \
    opencv-python numpy pyyaml requests textual onnxruntime pillow

# ④ YOLO 环境（严格按官方 requirements.txt）
uv pip install --python python_env/yolo_env/.venv/bin/python \
    "numpy==2.2.6" "opencv-python>=4.11.0.86" "ultralytics==8.4.110"
```

**验证点**（本机实测输出）：

```bash
python_env/mircoros_v2_env/.venv/bin/python -c "import cv2,numpy,mediapipe;print(cv2.__version__,numpy.__version__)"
# → 4.11.0 1.26.4

python_env/yolo_env/.venv/bin/python -c "import ultralytics,numpy;print(ultralytics.__version__,numpy.__version__)"
# → 8.4.110 2.2.6
```

### S6　网络 / 串口 / 环境变量（连车前置）

**① 串口权限与别名**

```bash
# 插上 Type-C 控制板，确认设备与 VID:PID
lsusb | grep -i -E "silicon|cp210|10c4|espressif|303a|ch34"

# 加入 dialout 组（免 sudo 访问串口）——必须重新登录才生效
sudo usermod -aG dialout $USER
```

**实测更正**：官方用的是 **CP210x USB-UART 桥**（`idVendor=10c4`、`idProduct=ea60`），匹配 `KERNEL=="ttyUSB*"`，所以别名落在 `/dev/ttyUSB0` 而不是 `ttyACM0`——这也正好解释了为什么 `config_robot.py` 默认打开 `/dev/ttyUSB0`。

```bash
sudo tee /etc/udev/rules.d/99-microros-board.rules > /dev/null <<'EOF'
# CP210x UART Bridge -> /dev/microros_board
KERNEL=="ttyUSB*", ATTRS{idVendor}=="10c4", ATTRS{idProduct}=="ea60", MODE:="0777", SYMLINK+="microros_board"
EOF
sudo udevadm control --reload-rules && sudo udevadm trigger
ls -l /dev/microros_board
```

> 不同批次可能用其它桥接芯片（如 CH340 `1a86:7523`），**以 `lsusb` 实测为准**。

**② 确认本机局域网 IP 并写入下位机**

```bash
ip -4 addr show | grep -E "inet .*(wl|en)"     # 记下与小车同网段的 IP
```

用图形化工具配置下位机（推荐）：

```bash
python3 ~/microros_v2/microros_ws/.system_cfg/robot_manager/robot_manager.py
```

| 面板 | 参数 | 填什么 |
| --- | --- | --- |
| 控制板 | `wifi_ssid` / `wifi_passwd` | **2.4G** WiFi（ESP32-S3 不支持 5G） |
| 控制板 | `agent_ip_addr` | **本机 IP**（上一步读到的） |
| 控制板 | `agent_ip_port` | `8090` |
| 控制板 | `ros_domain_id` | `40`（与 `$ROS_DOMAIN_ID` 一致） |
| 控制板 | `servo_1_offset` / `servo_2_offset` | 先 `0`，后续标定 |
| 主机设置 | `CAR_TYPE` | 豪华版 `ptz` |
| 主机设置 | `camera_ip` | 车体 OLED 上 `camera` 字段的值 |

**③ 环境挂载：四个前缀，缺一不可**（已在 S3 解释为什么）

```bash
cat >> ~/.bashrc <<'EOF'

# ===== MicroROS V2 四前缀 =====
source /opt/ros/humble/setup.bash
source ~/microros_v2/microros_ws/install/setup.bash
source ~/microros_v2/uros_ws/install/setup.bash
source ~/microros_v2/microros_ws/third_party_library/install/setup.bash
export ROS_DOMAIN_ID=40
export CAR_TYPE=ptz
export PYTHONNOUSERSITE=1
EOF
source ~/.bashrc
```

> ⚠️ **`PYTHONNOUSERSITE=1` 不是可选项**。`cv_bridge` 由 NumPy 1.x 编译，若用户级 `~/.local` 下存在 NumPy 2.x 会遮蔽它，导致 `AttributeError: _ARRAY_API not found`，甚至**段错误**。所有视觉相关 launch 都以该变量启动节点，请勿移除。
>
> 💡 **双网卡陷阱**：同时接有线 + WiFi 时 DDS 可能选错网卡导致通信异常。最简单是开发时只启用一张网卡，或设 `ROS_STATIC_PEERS`。

**验证点**：

```bash
ls -l /dev/microros_board                    # 有指向
groups | grep dialout                        # 已加入（需重新登录后）
echo $ROS_DOMAIN_ID $CAR_TYPE $PYTHONNOUSERSITE   # 40 ptz 1
ros2 pkg executables micro_ros_agent         # agent 可见（说明四前缀生效）
```

### S7　编译

```bash
cd ~/microros_v2/microros_ws
source /opt/ros/humble/setup.bash
rosdep install --from-paths src --ignore-src -r -y
colcon build --symlink-install
source install/setup.bash
```

`--symlink-install` 让 launch / config 改动**直接生效**，开发期强烈建议。增量编译：

```bash
colcon build --packages-select microros_v2_bringup robot_description --symlink-install
```

**⚠️ 全量编译会清掉预编译的 `smart_tracker`**（因为它没有源码，colcon 重建 `install/` 时不会重新生成它），必须在编译后恢复：

```bash
# 先备份（只需一次，且要备份到工作区之外）
mkdir -p ~/microros_backup
cp -a ~/microros_v2/microros_ws/install/smart_tracker ~/microros_backup/

# 每次全量编译后
cp -a ~/microros_backup/smart_tracker ~/microros_v2/microros_ws/install/smart_tracker
find ~/microros_v2/microros_ws/install/smart_tracker -name "*.pyc" -delete
```

同时需要**把构建期依赖降级为运行期依赖**，否则编译期找不到 `smart_tracker` 的 CMake 配置：

```bash
# <depend> = build_depend + build_export_depend + exec_depend
# 编译它不可能（无源码），但运行期确实要用 → 只保留 exec_depend
sed -i 's|<depend>smart_tracker</depend>|<exec_depend>smart_tracker</exec_depend>|' \
    src/microros_v2_bringup/package.xml
```

**编译后自检（不接车也能做）**：

```bash
ros2 pkg list | grep -cE "microros|smart_tracker|roadnet|multi_brains"   # 期望 ~11
ros2 interface list | grep -E "^    interfaces/"                          # 期望 9 个（3 msg + 4 srv + 2 action）

# --show-args 会真正加载 launch 并解析全部参数，能在接车前暴露路径/缺包/导入问题
for f in test_connect car_base slam_toolbox nav2; do
  echo "--- $f ---"; ros2 launch microros_v2_bringup $f.launch.py --show-args | head -5
done
```

编译常见错误速查：

| 报错关键字 | 原因 | 处理 |
| --- | --- | --- |
| `failed to create symbolic link ... Is a directory` | VM 遗留的 `build/` 目录占住了 `--symlink-install` 的位置 | `rm -rf build/<pkg> install/<pkg>` 后重编；顽固时 `rm -rf build install log` |
| `没有规则可制作目标 liblua5.3.so` | 只有运行库没有开发包 | `sudo apt install -y liblua5.3-dev` |
| `ValueError: bad marshal data (unknown type code)` | VM 带来的 `.pyc` 与你的 Python 不兼容 | 见 §4.2 |
| `Could not find ... "smart_tracker"` | 无源码，colcon 无法构建期解析 | 见上文依赖降级 + 编译后恢复 |
| `nanoflann.hpp: No such file` | 缺 `libnanoflann-dev` | S2 清单 |
| `nlohmann/json.hpp` not found | 缺 `nlohmann-json3-dev` | S2 清单 |
| `Qt5Widgets` not found | 缺 `qtbase5-dev` | S2 清单 |
| 编译到一半 OOM | 内存不足 | `colcon build --parallel-workers 2`，关掉 RViz |
| `warning: 'ConstPtr' is deprecated` | ROS 2 正常弃用警告，**非错误** | 忽略 |

### S8　开发工具与备份

```bash
sudo snap install code --classic
```

插件：Python、C/C++、ROS、Remote - SSH、CMake Tools。打开 `~/microros_v2/microros_ws` 后即可使用官方 `.vscode/tasks.json` 的构建任务（`Ctrl+Shift+B`）——但注意里面的命令写死了 `/home/yahboom/microros_ws`，迁移时需同步替换。

常用调试命令：

```bash
ros2 topic hz /scan                       # 雷达频率
ros2 run rqt_graph rqt_graph              # 节点通信图
ros2 run rqt_tf_tree rqt_tf_tree          # TF 树
ros2 bag record -a                        # 录包
```

**配好就立刻备份**，出问题可快速回滚：

```bash
# 备份配置与不可再生的预编译包
cd ~/microros_v2
tar czf ~/microros_env_backup_$(date +%Y%m%d).tar.gz \
  microros_ws/.system_cfg microros_ws/.vscode microros_ws/src/*/config \
  workspaces MODELS
tar rf ~/microros_env_backup_$(date +%Y%m%d).tar.gz -C ~ .bashrc 2>/dev/null || true

mkdir -p ~/microros_backup
cp -a ~/microros_v2/microros_ws/install/smart_tracker ~/microros_backup/
cp -a ~/microros_v2/uros_ws ~/microros_backup/
```

> `smart_tracker` 与 `micro_ros_agent` 是**丢了最难补**的两样东西，单独备份到工作区之外。

### S9　环境验收：23 项清单

逐项打勾，**全绿才算环境搭好**：

| # | 检查项 | 命令 | 期望 |
| --- | --- | --- | --- |
| 1 | Ubuntu 版本 | `lsb_release -a` | 22.04.x LTS |
| 2 | ROS 发行版 | `printenv ROS_DISTRO` | humble |
| 3 | ROS 包数量 | `ros2 pkg list \| wc -l` | > 300 |
| 4 | Agent 可用 | `ros2 pkg executables micro_ros_agent` | 有输出 |
| 5 | Nav2 可用 | `ros2 pkg prefix nav2_bringup` | 有输出 |
| 6 | slam_toolbox | `ros2 pkg executables slam_toolbox` | 有输出 |
| 7 | **smart_tracker 存在** | `ros2 pkg prefix smart_tracker` | ⚠️ 关键 |
| 8 | **跟踪模型存在** | `ls ~/microros_v2/MODELS/tracker/` | ⚠️ 关键 |
| 9 | 工作区路径 | `ls -d ~/microros_v2/{microros_ws,uros_ws,MODELS,workspaces}` | 四个都在 |
| 10 | robot_info 存在 | `ls ~/microros_v2/microros_ws/.system_cfg/robot_info.json` | 存在 |
| 11 | 硬编码路径已替换 | `grep -rl '/home/yahboom' ~/microros_v2/microros_ws \| wc -l` | 0 |
| 12 | 编译通过 | `colcon build` | 无 error |
| 13 | 主 Python 环境 | `python -c "import cv2,mediapipe"` | 通过 |
| 14 | YOLO Python 环境 | `python -c "import ultralytics"` | 通过 |
| 15 | 串口别名 | `ls -l /dev/microros_board` | 有指向 |
| 16 | dialout 组 | `groups \| grep dialout` | 已加入 |
| 17 | 防火墙放行 | `sudo ufw status` | 8090/udp ALLOW |
| 18 | Domain ID | `echo $ROS_DOMAIN_ID` | 与控制板一致（40） |
| 19 | CAR_TYPE | `echo $CAR_TYPE` | ptz（按车型） |
| 20 | 控制板 agent_ip | RobotManager → 控制板面板 | = 本机 IP |
| 21 | **链路连通** | `ros2 launch microros_v2_bringup test_connect.launch.py` | **绿灯常亮 + 出图 + IMU/scan 统计** |
| 22 | 无动态拼接残留 | 见 §4.3 | 无致命残留 |
| 23 | 4 个核心 launch 可加载 | `ros2 launch ... --show-args` | 全部可加载 |

第 21 项是最有说服力的一项：控制板**绿灯常亮** + 相机窗口出画面 + 终端每 10 秒打印 `/imu` 与 `/scan` 统计。

---

## 4. 五个真正的坑（这几个各能卡一整天）

### 4.1 坑一：`apt install ros-humble-micro-ros-agent` 装不上

已在 S3 说明。Humble 二进制源里**没有** agent，也没有 `microxrcedds_agent`。务必用官方 VM 的预编译包，并记得它是**独立工作区** `uros_ws`，必须单独 source。忘了这一条的症状是：

```bash
ros2 pkg executables micro_ros_agent     # 无任何输出
```

### 4.2 坑二：`bad marshal data` —— 极易误判成代码错误

**症状**：

```
ValueError: bad marshal data (unknown type code)
  File ".../test_connect.launch.py", line 14
    from microros_v2_bringup.robot_tools.robot_tool import ...
launch.invalid_launch_file_error.InvalidLaunchFileError: ...
```

看起来像 launch 文件语法错误，实际是它**导入的模块的 `.pyc` 坏了**。同理会让 `from smart_tracker.msg import TrackBox` 失败。

**原因**：从 VM 导出时带上了用 VM 内 Python 生成的 `.pyc`，而 Python 优先加载缓存而不重新编译。实测我们的工作区副本里有 **7455 个 `.pyc` / 1211 个 `__pycache__`**。

**处理**：

```bash
find ~/microros_v2/microros_ws -name "*.pyc" -delete
find ~/microros_v2/microros_ws -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
```

### 4.3 坑三：动态拼接路径 —— 搬家后 launch 报 `FileNotFoundError`

**症状**（注意报错路径里**少了 `microros_v2/` 这一段**——这正是代码还在按**旧布局**拼路径的证据）：

```
FileNotFoundError: [Errno 2] No such file or directory:
  '/home/moke/microros_ws/.system_cfg/robot_info.json'
```

路径「看起来对、实际不存在」：`microros_ws` 前面缺了 `microros_v2/`。

**根因**：官方代码里有四类路径写法，字面量批量替换**只能覆盖前两类**：

| 写法 | 示例 | 字面量替换能否覆盖 |
| --- | --- | --- |
| 完整字面量 | `'/home/moke/microros_v2/microros_ws/...'` | ✅ 能 |
| 裸 HOME 基路径 | `Path("/home/moke")` 再拼 `"MODELS"` | ❌ 不能 |
| 动态拼接 | `os.path.join(os.path.expanduser('~'), 'microros_ws', ...)` | ❌ 不能 |
| 波浪号字面量 | `"~/microros_v2/microros_ws/src/.../color_hsv.txt"` | ❌ 不能 |

还有三个**手工才能处理的陷阱写法**：

- `follow_line_controller.py` 里 `DEFAULT_HSV_FILE = "~/microros_v2/..."`——把 `~` 从 `expanduser()` 里挪出来了，初始化时拿到未展开的 `~` 字符串，后续再展开就成了 `~/<展开后的字符串>`，**一定打不开**；
- `06_FaceLandmarks.py` 里 `expanduser('~')+'MODELS'+'mediapipe'+...`——**双重错误**：路径已迁移，且多了一层 `mediapipe/`，该文件实际就在 `MODELS/` 根下；
- `llm_agent_config.yaml` 里的 `hsv_file`——经 `os.path.expanduser()` 展开后**仍可用**，改成绝对路径只是可读性优化。

**⚠️ 还有一个「两种拼写」的坑**：`uv` 生成 `.venv/bin/activate` 等 31 个文件时，会把路径写成 **`mircoros_ws`（少一个下划线）**。批量替换必须同时覆盖 `microros_ws` 和 `mircoros_ws` 两种拼写，否则这些文件会漏改。

**正确的修复方式**：不要把路径写死，而是统一走一个约 70 行的解析模块 `microros_paths.py`，部署到各 Python 包里（本机已部署到 9 个包）。解析优先级：

1. 环境变量 `MICROROS_WS` / `MICROROS_UROS_WS` / `MICROROS_MODELS_DIR` / `MICROROS_WORKSPACES_DIR`
2. 迁移后布局 `~/microros_v2/<name>`
3. 官方原始布局 `~/<name>`

好处是**将来再次搬家只需改环境变量，不必再全库搜索**。

**定位技巧**：看到某个 launch 报 `No such file or directory` 时——

1. 先看报错路径里**有没有 `microros_v2`**，没有就是动态拼接漏改；
2. 再确认**两种拼写**都搜过；
3. 最后确认该路径**确实应该存在**（别去修一个本来就该不存在的路径）。

> ⚠️ 另外：**绝不要用 `sed` 改 `build/` 或 `install/` 里的文件**。曾因为改了 `build/` 里的 CMake 缓存导致缓存自相矛盾，`colcon build` 21 个包全失败报 symlink 冲突。遇到就 `rm -rf build install log` 重新来过。

### 4.4 坑四：NumPy 2.x 打崩 `cv_bridge`

**症状**：`AttributeError: _ARRAY_API not found`，或视觉节点直接段错误。

**原因**：`cv_bridge` 是**用 NumPy 1.x 编译**的。如果用户级 `~/.local` 下装了 NumPy 2.x，它会遮蔽系统的 NumPy 1.x。

**处理**：确保 `export PYTHONNOUSERSITE=1`（已写入 `.bashrc`）。手动启动节点时也要带上，别以为 launch 里注入过就万事大吉。

另外注意**两个环境不要混用**：主环境是 NumPy 1.26.4，YOLO 环境是 2.2.6。YOLO 相关 launch 找不到 ultralytics 时，先 `source microros_ws/src/scripts/yolo_env.sh`。

### 4.5 坑五：`colcon build` 之后视觉跟随起不来

因为全量编译重建了 `install/`，把手工放入的预编译 `smart_tracker` 清掉了。**备份到工作区外，编译后恢复，并清掉 `.pyc`**——这就是 S7 里那段命令存在的原因。

> 增量编译（`--packages-select`）**不会**清掉它，只有全量 `colcon build` 会。

---

## 5. 总结与经验

### 5.1 这次配置的五条核心经验

1. **版本选择跟着生态走，不跟着「新」走。** Ubuntu 22.04 是 ROS 2 Humble 的 Tier 1 平台，选它不是保守，是让整个 apt 生态直接可用。省下的不是几小时，而是「全源码编译」这条不归路。
2. **评估环境与开发环境可以分开。** 官方 VM 镜像「开箱即用」的价值非常大——但它的正确用法是**当参考环境和取件仓库**，而不是当日常开发机。我们最终是「VM 不删 + 裸机开发」。
3. **先搞清楚交付物完整性，再动手。** 如果一开始就假设「源码 zip = 全部」，会在 `smart_tracker` 缺失上浪费大量时间。花 20 分钟核对缺件清单，省下一整天。
4. **路径硬编码是迁移的最大敌人。** 字面量替换只能解决一半问题，剩下的要靠统一的路径解析模块 + 环境变量覆盖。这件事越早做越省事。
5. **配好立刻备份，尤其是不可再生的预编译产物。** `smart_tracker` 和 `micro_ros_agent` 丢了极难补。

### 5.2 给后来者的最小行动清单

```
□ 确认系统是 Ubuntu 22.04.x LTS (jammy)
□ 先 apt full-upgrade，再装 ROS 2 Humble
□ 装齐依赖（别漏 python3-serial、liblua5.3-dev）
□ 从官方 VM 导出完整工作区（不要用源码 zip）
□ 迁移工作区 + 替换 /home/yahboom + 修动态路径
□ 修复工作区路径后立即清理 VM 带来的 .pyc
□ 备份 smart_tracker / uros_ws 到工作区之外
□ 建两个 uv 环境（注意 .venv 层级，用 uv pip install）
□ 配 udev 别名 + dialout + ufw 8090/udp
□ .bashrc 写四个前缀 + ROS_DOMAIN_ID + CAR_TYPE + PYTHONNOUSERSITE
□ test_connect.launch.py 看到绿灯常亮 + 出图 + IMU/scan 统计
```

### 5.3 参考链接

| 资料 | 链接 |
| --- | --- |
| ROS 2 Humble Ubuntu (deb) 安装 | <https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html> |
| `ros2-apt-source` 现行源配置方式 | <https://github.com/ros-infrastructure/ros-apt-source> |
| ROS 2 平台支持（REP 2000） | <https://reps.openrobotics.org/rep-2000/> |
| Nav2 文档 | <https://docs.nav2.org/> |
| slam_toolbox | <https://github.com/SteveMacenski/slam_toolbox> |
| micro-ROS | <https://micro.ros.org/> |
| uv（Python 环境管理器） | <https://astral.sh/uv> |
| 官方资料页 | <https://www.yahboom.com/study/MicroROS-V2> |

---

*本文基于本项目 Ubuntu 22.04 环境的实际搭建过程整理，文中所有版本号、体积、分区布局、报错信息均为本机实测结果。*
