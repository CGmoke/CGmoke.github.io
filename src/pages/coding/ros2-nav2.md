---
title: ROS2 Nav2 导航栈完全指南
layout: '@/layouts/Post'
date: 2025-03-05
tags: [ROS2, Nav2, 导航, 机器人]
pin: false
language: 中文
categories:
  - 编程
label:
  - 原创
description:
  - 深入了解 ROS2 Nav2 导航栈的架构、配置和实战应用，从零开始搭建一个完整的自主导航系统。
image:
  - /ogImage.jpg
---

## Nav2 简介

Nav2（Navigation2）是 ROS2 的官方导航框架，基于 ROS Navigation Stack 重写而来，提供了更灵活、更强大的自主导航能力。

### Nav2 的核心组件

- **BT Navigator**：行为树导航器，管理导航任务流程
- **Planner Server**：路径规划器，计算全局路径
- **Controller Server**：控制器，执行局部路径跟踪
- **Behavior Server**：行为服务器，处理等待、倒车等行为
- **Waypoint Follower**：航点跟随器，执行多点导航

## 安装 Nav2

```bash
sudo apt install ros-humble-navigation2 \
  ros-humble-nav2-bringup \
  ros-humble-turtlebot3*
```

## 启动仿真环境

```bash
export TURTLEBOT3_MODEL=burger
ros2 launch nav2_bringup tb3_simulation_launch.py
```

## Nav2 参数配置详解

### 代价地图配置（Costmap）

```yaml
local_costmap:
  ros__parameters:
    update_frequency: 5.0
    publish_frequency: 2.0
    global_frame: odom
    robot_base_frame: base_link
    rolling_window: true
    width: 3
    height: 3
    resolution: 0.05
    robot_radius: 0.22

global_costmap:
  ros__parameters:
    update_frequency: 1.0
    publish_frequency: 1.0
    global_frame: map
    robot_base_frame: base_link
    robot_radius: 0.22
    resolution: 0.05
```

### 规划器配置

常用的规划器插件：

- **SmacPlanner2D**：混合 A* 规划器，支持非完整约束
- **Navfn Planner**：经典 Dijkstra/A* 规划器
- **SmacPlannerHybrid**：适用于差速/全向移动机器人

### 控制器配置

常用控制器：

- **DWBController**：动态窗口法控制器
- **TEBController**：时间弹性带控制器，轨迹优化性能更好

## 自定义导航任务

### 通过代码发送导航目标

```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from nav2_msgs.action import NavigateToPose

class NavigationClient(Node):
    def __init__(self):
        super().__init__('nav2_client')
        self._action_client = ActionClient(
            self, NavigateToPose, 'navigate_to_pose'
        )

    def send_goal(self, x, y, theta):
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose.header.frame_id = 'map'
        goal_msg.pose.header.stamp = self.get_clock().now().to_msg()
        goal_msg.pose.pose.position.x = x
        goal_msg.pose.pose.position.y = y
        goal_msg.pose.pose.orientation.w = theta

        self._action_client.wait_for_server()
        return self._action_client.send_goal_async(goal_msg)

def main(args=None):
    rclpy.init(args=args)
    client = NavigationClient()
    future = client.send_goal(2.0, 2.0, 1.0)
    rclpy.spin_until_future_complete(client, future)
    client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## 调试技巧

### 可视化检查

```bash
rviz2
```

在 RViz 中添加以下显示项：
- `/map` - 地图
- `/global_costmap` - 全局代价地图
- `/local_costmap` - 局部代价地图
- `/plan` - 规划路径
- `/cmd_vel` - 速度指令

### 日志调试

```bash
ros2 run nav2_map_server map_server --ros-args --log-level debug
```

## 性能优化建议

1. **调整代价地图分辨率**：根据实际场景平衡精度和计算量
2. **合理设置规划频率**：避免过高频率导致 CPU 占用过高
3. **使用代价地图过滤器**：去除障碍物误检
4. **优化行为树**：简化不必要的导航流程

> 导航是机器人应用中最核心的功能之一，深入理解 Nav2 的工作原理对于构建稳定可靠的机器人系统至关重要。🎯
