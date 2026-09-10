---
title: ROS2 入门指南：从安装到第一个节点
layout: '@/layouts/Post'
date: 2026-09-08
tags: [ROS2, 机器人, 教程]
pin: true
language: 中文
categories:
  - 编程
label:
  - 原创
description:
  - ROS2 (Robot Operating System 2) 是新一代机器人开发框架，本文将带你从零开始了解 ROS2，完成环境安装并运行你的第一个 ROS2 节点。
image:
  - /ogImage.jpg
---

## 什么是 ROS2？

ROS2 是机器人操作系统 2（Robot Operating System 2）的简称，是用于编写机器人软件的灵活框架。它继承了 ROS1 的优秀设计，同时在实时性、安全性、跨平台支持等方面进行了重大改进。

### ROS2 的核心优势

- 🚀 **DDS 通信中间件**：采用工业级的数据分发服务
- 🔒 **更安全的架构**：原生支持安全通信
- 💻 **跨平台支持**：Linux、Windows、macOS 全平台支持
- ⚡ **实时性能优化**：适用于对实时性要求高的场景
- 📦 **丰富的生态系统**：大量现成的功能包和工具

## 环境安装（以 Ubuntu 22.04 + Humble 为例）

### 1. 设置语言环境

```bash
locale  # 检查是否支持 UTF-8
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

### 2. 添加 ROS2 软件源

```bash
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
  -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### 3. 安装 ROS2 Humble

```bash
sudo apt update
sudo apt install ros-humble-desktop
```

### 4. 配置环境变量

```bash
source /opt/ros/humble/setup.bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

## 第一个 ROS2 节点

### 理解节点（Node）的概念

在 ROS2 中，节点是执行计算的基本单元。一个机器人系统通常由多个节点组成，每个节点负责一个特定的功能。

### 创建工作空间

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
```

### 创建 Python 包

```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python --node-name my_first_node my_py_package
```

### 编写第一个节点

编辑 `src/my_py_package/my_py_package/my_first_node.py`：

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HelloNode(Node):
    def __init__(self):
        super().__init__('hello_node')
        self.publisher_ = self.create_publisher(String, 'hello_topic', 10)
        timer_period = 1.0  # 秒
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'你好，ROS2！第 {self.count} 次消息 🚀'
        self.publisher_.publish(msg)
        self.get_logger().info(f'发布: "{msg.data}"')
        self.count += 1

def main(args=None):
    rclpy.init(args=args)
    node = HelloNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### 编译并运行

```bash
cd ~/ros2_ws
colcon build --packages-select my_py_package
source install/setup.bash
ros2 run my_py_package my_first_node
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `ros2 node list` | 列出所有运行中的节点 |
| `ros2 topic list` | 列出所有话题 |
| `ros2 topic echo <topic>` | 查看话题内容 |
| `ros2 service list` | 列出所有服务 |
| `ros2 bag record` | 录制话题数据 |

## 下一步

- 📚 学习话题（Topic）通信机制
- 🔧 了解服务（Service）和动作（Action）
- 🛠️ 探索 RViz2 可视化工具
- 🗺️ 开始学习 Nav2 导航栈

> ROS2 的学习曲线虽然较陡，但一旦掌握了核心概念，你就能快速构建复杂的机器人应用。加油！💪
