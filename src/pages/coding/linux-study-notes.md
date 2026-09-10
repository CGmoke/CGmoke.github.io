---
title: Linux学习笔记
layout: '@/layouts/Post'
date: 2026-09-10
tags: [Linux]
pin: false
language: 中文
categories:
  - 编程
label:
  - 原创
description:
  - Linux学习笔记
image:
  - /Linux-study-notes.jpg
---

##

# Linux学习笔记

> 本笔记以 **CentOS** 为主线（课程原版），并在各章节补充 Ubuntu 的差异知识，便于对比学习。

---

## 目录

- [CentOS 与 Ubuntu 差异速览](#centos-与-ubuntu-差异速览)
- [第一章 Linux入门](#第一章-linux入门)
  - [1.1 操作系统概述](#11-操作系统概述)
  - [1.2 Linux初识](#12-linux初识)
  - [1.3 虚拟机介绍](#13-虚拟机介绍)
  - [1.4 远程连接Linux系统](#14-远程连接linux系统)
  - [1.5 拍摄快照](#15-拍摄快照)
- [第二章 Linux基础命令](#第二章-linux基础命令)
  - [2.1 Linux目录结构](#21-linux目录结构)
  - [2.2 命令基础](#22-命令基础)
  - [2.3 ls命令](#23-ls命令)
  - [2.4 cd与pwd命令](#24-cd与pwd命令)
  - [2.5 特殊路径符](#25-特殊路径符)
  - [2.6 mkdir命令](#26-mkdir命令)
  - [2.7 文件操作命令](#27-文件操作命令)
  - [2.8 grep、wc与管道符](#28-grepwc与管道符)
  - [2.9 which与find命令](#29-which与find命令)
  - [2.10 echo、tail与重定向符](#210-echotail与重定向符)
  - [2.11 vi编辑器](#211-vi编辑器)
- [第三章 Linux权限管控](#第三章-linux权限管控)
  - [3.1 认知root用户](#31-认知root用户)
  - [3.2 用户和用户组](#32-用户和用户组)
  - [3.3 查看权限控制信息](#33-查看权限控制信息)
  - [3.4 chmod命令 - 修改权限](#34-chmod命令---修改权限)
  - [3.5 chown命令 - 修改所属](#35-chown命令---修改所属)
- [第四章 Linux实用操作](#第四章-linux实用操作)
  - [4.1 各类小技巧快捷键](#41-各类小技巧快捷键)
  - [4.2 软件安装](#42-软件安装)
  - [4.3 systemctl控制软件](#43-systemctl控制软件)
  - [4.4 软连接](#44-软连接)
  - [4.5 日期和时区](#45-日期和时区)
  - [4.6 IP地址和主机名](#46-ip地址和主机名)
  - [4.7 配置Linux固定IP](#47-配置linux固定ip)
  - [4.8 网络传输](#48-网络传输)
  - [4.9 进程管理](#49-进程管理)
  - [4.10 主机状态监控](#410-主机状态监控)
  - [4.11 环境变量](#411-环境变量)
  - [4.12 上传、下载](#412-上传下载)
  - [4.13 压缩、解压](#413-压缩解压)
- [第五章 实战部署](#第五章-实战部署)
  - [5.1 MySQL 部署](#51-mysql-部署)
- [第六章 脚本 & 自动化](#第六章-脚本--自动化)
  - [6.1 Shell 脚本基础](#61-shell-脚本基础)
  - [6.2 变量](#62-变量)
  - [6.3 条件判断](#63-条件判断)
  - [6.4 循环语句](#64-循环语句)
  - [6.5 函数](#65-函数)
  - [6.6 数组](#66-数组)
  - [6.7 自动化运维实战脚本](#67-自动化运维实战脚本)
  - [6.8 crontab 定时任务](#68-crontab-定时任务)
- [第七章 项目实战](#第七章-项目实战)
  - [7.1 项目架构概述](#71-项目架构概述)
  - [7.2 Nginx 部署](#72-nginx-部署)
  - [7.3 Node.js 项目部署](#73-nodejs-项目部署)
  - [7.4 Redis 部署](#74-redis-部署)
  - [7.5 综合实战：Web 项目全栈部署](#75-综合实战web-项目全栈部署)
- [第八章 云平台技术](#第八章-云平台技术)
  - [8.1 云计算基础](#81-云计算基础)
  - [8.2 容器化技术概述](#82-容器化技术概述)
  - [8.3 Docker 安装](#83-docker-安装)
  - [8.4 Docker 核心概念](#84-docker-核心概念)
  - [8.5 Docker 常用命令](#85-docker-常用命令)
  - [8.6 Dockerfile](#86-dockerfile)
  - [8.7 Docker Compose](#87-docker-compose)
  - [8.8 Kubernetes 基础](#88-kubernetes-基础)
  - [8.9 kubectl 常用命令](#89-kubectl-常用命令)
  - [8.10 后续学习路线](#810-后续学习路线)

---

## CentOS 与 Ubuntu 差异速览

> 本笔记课程基于 CentOS，下表汇总了与 Ubuntu 的关键差异，便于对照学习。各章节中也会标注 `<Ubuntu差异>` 小节。

| 对比维度 | CentOS（课程主线） | Ubuntu |
|----------|--------------------|--------|
| **包族/系** | Red Hat 系（RHEL） | Debian 系 |
| **包管理器** | `yum`（CentOS 8+ 为 `dnf`） | `apt` / `apt-get` |
| **软件包格式** | `.rpm` | `.deb` |
| **root 用户** | 默认启用，直接 `su -` 切换 | 默认禁用 root 登录，用 `sudo` 提权 |
| **普通用户提权** | 需手动 `visudo` 配置 | 安装时自动加入 `sudo` 组 |
| **创建用户** | `useradd`（不自动建 HOME/设密码） | `adduser`（交互式，自动配置） |
| **网络配置** | `/etc/sysconfig/network-scripts/ifcfg-ens33` | `/etc/netplan/*.yaml`（Netplan） |
| **网络服务名** | `network` | `systemd-networkd` 或 `NetworkManager` |
| **防火墙** | `firewalld`（`firewall-cmd`） | `ufw`（Uncomplicated Firewall） |
| **安全模块** | SELinux | AppArmor |
| **默认 Shell** | Bash | Bash（默认）/ 也可选 dash |
| **默认编辑器** | vi/vim | nano（默认）/ vim |
| **软件源** | CentOS 官方源/EPEL | Ubuntu 官方源/PPA |
| **服务管理** | `systemctl`（相同） | `systemctl`（相同） |
| **目录结构** | FHS 标准（相同） | FHS 标准（相同） |
| **时区设置** | `timedatectl`（CentOS 7+） | `timedatectl`（相同） |
| **MySQL 安装** | `yum install mysql-community-server` | `apt install mysql-server` |

> 💡 **记忆要点：** 两者都遵循 FHS 目录标准和 systemd 服务管理，底层命令（ls/cd/grep/ps 等）完全通用；差异主要集中在**包管理、用户体系、网络配置、防火墙**四个方面。

---

## 第一章 Linux入门

### 1.1 操作系统概述

计算机由**硬件**和**软件**两部分组成。操作系统是软件的一类，主要作用是协助用户调度硬件工作，充当用户和计算机硬件之间的桥梁。

**常见操作系统：**
- **PC端：** Windows、Linux、MacOS
- **移动端：** Android、iOS、鸿蒙系统

**操作系统的核心角色：**

```
用户
  ↓
操作系统（调度硬件、管理资源）
  ↓
计算机硬件（CPU、内存、磁盘、网卡等）
```

### 1.2 Linux初识

Linux 由**内核、系统、软件**三部分组成，是一个完整的操作系统。Linux 的创始人是 Linus Torvalds。

**Linux 的组成：**
- **内核（Kernel）：** 系统核心，管理硬件资源
- **系统级程序：** 文件系统、设备驱动等
- **应用程序：** 各种工具软件、命令等

Linux 有众多发行版，分为两大阵营：

| 阵营 | 代表发行版 | 特点 |
|------|-----------|------|
| **Red Hat 系** | CentOS、RHEL、Fedora | 企业服务器主流，使用 RPM 包 + yum/dnf |
| **Debian 系** | Ubuntu、Debian、Linux Mint | 桌面与云环境流行，使用 DEB 包 + apt |

> 本课程主要使用 CentOS 学习。Ubuntu 是 Debian 系最流行的发行版，桌面体验好，云服务器（如 AWS/阿里云）也广泛提供 Ubuntu 镜像。

### 1.3 虚拟机介绍

通过虚拟机软件，可以在现有的计算机上模拟出一台或多台虚拟的计算机。这些虚拟机完全就像真正的计算机那样进行工作。

**常用虚拟机软件：**
- **VMware Workstation：** 功能强大，课程推荐使用
- **VirtualBox：** 免费开源，轻量级

**构建虚拟机环境的步骤：**
1. 安装 VMware 虚拟机软件
2. 下载 CentOS/Ubuntu 镜像文件（ISO）
3. 在 VMware 中创建虚拟机并安装系统
4. 配置网络和基本设置

> `Ubuntu差异` Ubuntu 官方提供 Desktop（带图形界面）和 Server（纯命令行）两个版本 ISO。学习命令行建议选 Server 版；CentOS 同样有 Everything/DVD/Minimal 多种镜像，课程一般用 DVD 版。

### 1.4 远程连接Linux系统

Linux 操作形式分为两种：**图形化界面**（用鼠标操作）和**命令行**（远程连接）。

> **为什么用命令行？** 在 Linux 下命令行使用率更高、更好用，服务器通常不安装图形界面以节省资源。可以借助第三方软件 FinalShell 进行命令行操作。

**远程连接步骤：**
1. 在 Linux 虚拟机中打开终端，输入 `ip addr` 查看 IP 地址
2. 在 Windows 中安装 FinalShell
3. 在 FinalShell 中新建连接，填入虚拟机的 IP 地址
4. 输入用户名和密码进行连接

> `<Ubuntu差异>` 远程连接工具（FinalShell/Xshell/Tabby）对 CentOS/Ubuntu 通用。但需注意：
> - CentOS 默认已安装并启动 SSH 服务（sshd），可直接连接。
> - **Ubuntu Server 默认安装并启用 sshd**；但 **Ubuntu Desktop 默认未安装 SSH 服务**，需先执行 `sudo apt install openssh-server` 并 `sudo systemctl start ssh` 启动后才能远程连接。
> - 登录用户名：CentOS 默认 root；Ubuntu 默认安装时创建的普通用户（如 ubuntu），root 不能直接登录。

### 1.5 拍摄快照

快照功能可以保存虚拟机当前的状态，相当于"存档"。当系统出现问题或操作失误时，可以通过快照恢复到之前的状态。

> **使用建议：** 在进行重大操作（如安装软件、修改配置）前，建议先拍摄快照，以便随时回退。VMware 快照功能对 CentOS/Ubuntu 均适用，操作完全相同。

---

## 第二章 Linux基础命令

### 2.1 Linux目录结构

Linux 的目录结构是一个**树形结构**，没有盘符的概念。顶级目录只有一个——根目录（`/`）。

```
/                         根目录，所有目录的起点
├── bin                   存放常用命令（二进制可执行文件）
├── boot                  系统启动相关文件
├── dev                   设备文件（硬件设备映射为文件）
├── etc                   系统配置文件
├── home                  普通用户的主目录
│   └── 用户名            每个用户都有自己的子目录
├── lib                   系统库文件
├── opt                   可选软件安装目录
├── proc                  进程信息（虚拟文件系统）
├── root                  root用户的主目录
├── usr                   用户程序和数据
│   └── local             本地安装的软件
├── var                   经常变化的数据（日志等）
└── tmp                   临时文件
```

> `<Ubuntu差异>` CentOS 和 Ubuntu 都遵循 FHS（文件系统层次标准），目录结构基本一致。细微差异：
> - CentOS 的 `bin`、`sbin`、`lib` 是独立目录；**Ubuntu 较新版本（20.04+）已将 `bin`、`sbin`、`lib` 合并为 `/usr` 下的符号链接**（`/bin → usr/bin`），但使用上无差别。
> - 网络配置文件位置不同（见 4.7 节）。
> - 软件日志位置都在 `/var/log`，但具体日志文件名略有差异。

### 2.2 命令基础

命令行即 Linux 终端，命令即 Linux 程序。Linux 命令有其通用的格式：

```bash
# 命令通用格式
command [-options] [parameter]

# 示例：以列表形式显示 /home/itheima 目录内容
ls -l /home/itheima
# ls 是命令本身，-l 是选项，/home/itheima 是参数
```

**命令格式说明：**
- **command：** 命令本身，如 ls、cd
- **-options：** 选项，控制命令行为，可选
- **parameter：** 参数，命令作用的对象，可选

> `<Ubuntu差异>` 命令格式对 Ubuntu 完全通用，ls/cd/pwd/cat 等基础命令的语法和选项一致。

### 2.3 ls命令

作用：列出目录下的内容。

```
ls [-a -l -h] [Linux路径]
```

> 不带参数和选项时，以平铺形式列出当前工作目录的内容。

| 选项 | 说明 | 示例 |
|------|------|------|
| `-a` | 显示隐藏内容（以 . 开头的文件/目录） | `ls -a` |
| `-l` | 以列表（竖向排列）展示，显示更多信息 | `ls -l` |
| `-h` | 以易于阅读的形式显示文件大小（需配合 -l） | `ls -lh` |

```bash
# 显示根目录的隐藏文件和详情
ls -alh /

# 选项可组合使用，以下两种等价
ls -a -l -h /
ls -alh /
```

> **当前工作目录：** 不给参数路径时，ls 默认显示当前工作路径的内容。当前工作目录即终端当前所在的目录。

### 2.4 cd与pwd命令

**cd - 切换工作目录**
```
cd [Linux路径]
```
不加参数时回到当前用户的 HOME 目录。

**pwd - 查看当前工作目录**
```
pwd
```
无参数无选项，输出当前所在的绝对路径。

```bash
cd /home/itheima   # 切换到指定目录
pwd                 # 输出：/home/itheima
cd                  # 不加参数，回到HOME目录
cd ~                # ~ 也表示HOME目录
```

### 2.5 特殊路径符

在路径中可以使用特殊符号来简化路径书写：

| 符号 | 含义 | 示例 |
|------|------|------|
| `.` | 当前目录 | `cd ./Desktop` |
| `..` | 上一级目录 | `cd ..` |
| `~` | HOME 目录 | `cd ~/Desktop` |

### 2.6 mkdir命令

作用：创建文件夹（目录）。

```
mkdir [-p] Linux路径
```
参数必填；`-p` 表示自动创建不存在的父目录（递归创建）。

```bash
# 创建单个目录
mkdir test

# 递归创建多级目录
mkdir -p a/b/c/d
# 如果 a/b/c 不存在，会自动逐级创建
```

### 2.7 文件操作命令

#### touch、cat、more

| 命令 | 作用 | 语法 |
|------|------|------|
| `touch` | 创建文件 | `touch Linux路径` |
| `cat` | 查看文件内容（全部输出） | `cat Linux路径` |
| `more` | 查看文件内容（支持翻页） | `more Linux路径` |

> **more 操作方式：** 空格键翻页，q 键退出查看。

#### cp、mv、rm

| 命令 | 作用 | 语法 | 关键选项 |
|------|------|------|----------|
| `cp` | 复制文件/文件夹 | `cp [-r] 参数1 参数2` | `-r` 递归复制文件夹 |
| `mv` | 移动文件/文件夹 | `mv 参数1 参数2` | 无选项 |
| `rm` | 删除文件/文件夹 | `rm [-r -f] 参数1 参数2 ... 参数N` | `-r` 删文件夹，`-f` 强制删除 |

```bash
# cp 复制文件
cp test.txt test_copy.txt

# cp -r 复制文件夹
cp -r folder1 folder2

# mv 移动文件（也可用于重命名）
mv test.txt /home/itheima/
mv old_name.txt new_name.txt

# rm 删除文件
rm test.txt

# rm -rf 强制删除文件夹
rm -rf folder1

# rm 支持通配符 * 模糊匹配
rm test*      # 删除以 test 开头的文件
rm *test      # 删除以 test 结尾的文件
rm *test*     # 删除包含 test 的文件
```

> **关于 -f 选项：** 普通用户删除内容不会弹出提示，只有 root 管理员用户删除内容会有提示确认。所以普通用户一般用不到 `-f` 选项。切换 root 用户：`su - root`，退回普通用户：`exit`。

> ⚠️ **危险操作：** `rm -rf /` 会删除系统所有文件，绝对不要执行！使用通配符时也要格外小心。

> `<Ubuntu差异>` cp/mv/rm 命令在 Ubuntu 上完全通用。唯一差异：Ubuntu 普通用户执行 `rm` 删除自己无写权限的文件时，因默认未配置 `sudo` 别名，可能提示 Permission denied，需加 `sudo`。CentOS 普通用户行为类似，但 Ubuntu 上使用 `sudo` 更普遍（因 root 默认禁用）。

### 2.8 grep、wc与管道符

#### grep - 关键字过滤

```
grep [-n] 关键字 文件路径
```
`-n` 表示在结果中显示行号。从文件中通过关键字过滤文件行。

#### wc - 统计

```
wc [-c -m -l -w] 文件路径
```
统计文件的行数、单词数量等。

| 选项 | 说明 |
|------|------|
| `-c` | 统计 bytes 数量 |
| `-m` | 统计字符数量 |
| `-l` | 统计行数 |
| `-w` | 统计单词数量 |

#### 管道符 |

管道符 `|` 的作用：将左边命令的输出结果，作为右边命令的输入。管道符可以嵌套使用。

```bash
# 查找 test.txt 中包含 "hello" 的行
cat test.txt | grep "hello"

# 统计 /etc 目录下有多少个文件（ls 结果的行数）
ls /etc | wc -l

# 管道符嵌套使用
cat test.txt | grep "hello" | wc -l
# 统计包含 hello 的行数
```

> `<Ubuntu差异>` grep/wc/管道符完全通用，无差异。

### 2.9 which与find命令

#### which - 查找命令

`which` 可以查找命令的程序文件所在位置。

```bash
which ls
# 输出：/usr/bin/ls

which cd
# 输出：/usr/bin/cd
```

#### find - 查找文件

**按文件名查找：**

```bash
find 起始路径 -name "被查找文件名"

# 示例：从根目录查找名为 test.txt 的文件
find / -name "test.txt"

# 支持通配符
find / -name "test*"
```

**按文件大小查找：**

```bash
find 起始路径 -size +|-n[kMG]

# + 表示大于，- 表示小于
# k=KB, M=MB, G=GB

# 示例：查找 / 目录下大于 100MB 的文件
find / -size +100M

# 示例：查找小于 1KB 的文件
find / -size -1k
```

> `<Ubuntu差异>` which/find 完全通用。命令路径可能因发行版略有不同，但用法一致。

### 2.10 echo、tail与重定向符

#### echo - 输出内容

```
echo 输出的内容
```
类似编程语言中的 print 功能。

```bash
echo "Hello Linux"
# 输出：Hello Linux

# 反引号 ` 中的内容会作为命令执行
echo `pwd`
# 输出当前工作目录路径
```

#### 重定向符

| 符号 | 含义 | 示例 |
|------|------|------|
| `>` | 覆盖写入（将左侧结果写入右侧文件，覆盖原有内容） | `echo "hi" > test.txt` |
| `>>` | 追加写入（在文件末尾追加内容） | `echo "hi" >> test.txt` |

#### tail - 查看文件尾部

```
tail [-f -num] Linux路径
```
`-f` 持续跟踪文件变化；`-num` 查看末尾 num 行（默认10行）。

```bash
# 查看 test.txt 末尾 10 行
tail test.txt

# 查看末尾 20 行
tail -20 test.txt

# 持续跟踪文件变化（常用于查看日志）
tail -f /var/log/messages
```

> `<Ubuntu差异>` echo/tail/重定向符完全通用。日志文件路径不同：CentOS 系统日志在 `/var/log/messages`，Ubuntu 系统日志在 `/var/log/syslog`（Ubuntu 用 rsyslog，日志分散为 auth.log、syslog 等）。

### 2.11 vi编辑器

vi 是 Linux 中最经典的文本编辑器，所有的 Linux 系统都会内置 vi 编辑器。vim 是 vi 的增强版。

#### vi的三种工作模式

| 模式 | 说明 | 进入方式 |
|------|------|----------|
| **命令模式** | 默认模式，键盘输入被解释为命令 | 打开文件即进入；按 Esc 从其他模式返回 |
| **输入模式** | 可以编辑文本内容 | 命令模式下按 i / a / o 等键 |
| **底线命令模式** | 保存、退出等操作 | 命令模式下输入 `:` 进入 |

**模式切换流程：**

```
打开文件 → 命令模式 ──按 i/a/o──→ 输入模式
                     ↑                │
                     └── 按 Esc ──────┘
                     │
                 按 : 键
                     ↓
              底线命令模式 ── wq(保存退出) / q!(强制不保存退出) ──→ 退出 vi
```

#### 命令模式常用快捷键

| 按键 | 功能 |
|------|------|
| `i` | 在当前光标位置前插入 |
| `a` | 在当前光标位置后插入 |
| `o` | 在当前行下方新建一行插入 |
| `dd` | 删除当前行 |
| `ndd` | 删除当前行起的 n 行（如 3dd） |
| `yy` | 复制当前行 |
| `nyy` | 复制当前行起的 n 行 |
| `p` | 粘贴 |
| `u` | 撤销 |
| `gg` | 跳到文件首行 |
| `G` | 跳到文件末行 |

#### 底线命令模式常用命令

| 命令 | 功能 |
|------|------|
| `:w` | 保存 |
| `:q` | 退出 |
| `:wq` | 保存并退出 |
| `:q!` | 强制退出不保存 |
| `:set nu` | 显示行号 |
| `/关键字` | 搜索关键字（n 查找下一个） |

```bash
# 用 vi 打开/创建文件
vi hello.txt

# 操作流程：
# 1. 按 i 进入输入模式，输入内容
# 2. 按 Esc 回到命令模式
# 3. 输入 :wq 保存退出
```

> `<Ubuntu差异>` vi/vim 操作完全通用。但需注意：
> - **CentOS 默认安装 vim-enhanced**，`vi` 实际指向 vim，支持语法高亮。
> - **Ubuntu 最小安装可能只有 vi-tiny**，方向键可能异常。建议执行 `sudo apt install vim` 安装完整版。
> - Ubuntu 默认推荐 **nano** 编辑器（底部有快捷键提示，Ctrl+O 保存、Ctrl+X 退出），对新手更友好。

---

## 第三章 Linux权限管控

### 3.1 认知root用户

root 用户拥有最大的系统操作权限，普通用户权限受限。普通用户的权限在 `/home` 目录下是不受限的，但在其他目录下受限。

#### su - 切换用户

```
su [-] [用户名]
```
`-` 表示切换用户后同时切换到该用户的 HOME 目录。

```bash
# 切换到 root 用户
su - root
# 输入密码后进入 root

# 退回普通用户
exit
```

#### sudo - 临时获取root权限

`sudo` 命令可以让普通用户以 root 身份执行单条命令。但需要先为普通用户配置 sudo 认证。

> **配置 sudo 认证：** 切换到 root 用户，执行 `visudo`，在文件末尾添加：`用户名 ALL=(ALL) NOPASSWD: ALL`，保存退出后该普通用户即可使用 sudo。

```bash
# 普通用户使用 sudo 执行需要 root 权限的命令
sudo ls /root
sudo mkdir /mydir
```

> `<Ubuntu差异>` **这是 CentOS 与 Ubuntu 最大的差异之一：**
> - **CentOS：** 默认启用 root 账户，设了 root 密码后可直接 `su -` 切换。普通用户需手动 `visudo` 配置才能用 sudo。
> - **Ubuntu：** **默认禁用 root 登录**（root 无密码，无法直接登录或 `su -`）。安装时创建的普通用户**自动加入 sudo 组**，可直接用 `sudo` 提权（需输入当前用户密码）。
> - Ubuntu 若需启用 root 登录：`sudo passwd root` 设置 root 密码，之后即可 `su -`。
> - Ubuntu 免密 sudo：将用户加入 sudo 组后，编辑 `sudo visudo` 添加 `用户名 ALL=(ALL) NOPASSWD: ALL`。

```bash
# ===== Ubuntu 典型用法 =====
sudo apt update          # 普通用户用 sudo 执行管理命令
sudo -i                  # 进入 root 交互式 shell（替代 su -）
sudo su -                # 切换到 root（等效 su -）
```

### 3.2 用户和用户组

Linux 系统中可以通过用户组来管理用户。每个用户可以属于一个或多个组。

#### 用户组管理

| 命令 | 作用 | 语法 |
|------|------|------|
| `groupadd` | 创建用户组 | `groupadd 组名` |
| `groupdel` | 删除用户组 | `groupdel 组名` |

#### 用户管理

| 命令 | 作用 | 语法 |
|------|------|------|
| `useradd` | 创建用户 | `useradd [-g 组名] 用户名` |
| `userdel` | 删除用户 | `userdel [-r] 用户名` |
| `usermod` | 修改用户所属组 | `usermod -aG 组名 用户名` |

```bash
# 创建用户组
groupadd moke

# 创建用户并指定所属组
useradd -g moke user1

# 删除用户（-r 同时删除 HOME 目录）
userdel -r user1
```

#### getent - 查看用户和组

```bash
# 查看当前系统中有哪些用户
getent passwd

# 查看当前系统有哪些组
getent group
```

> `<Ubuntu差异>` **创建用户的推荐命令不同：**
> - **CentOS：** 使用 `useradd`，它不会自动创建 HOME 目录、不设密码、不交互，需手动 `passwd 用户名` 设密码、`mkdir /home/用户名`。
> - **Ubuntu：** 推荐 `adduser`（交互式），会自动创建 HOME 目录、复制配置文件、提示设置密码、询问全名等，更友好：
>   
>   ```bash
>   sudo adduser user1    # Ubuntu 推荐，交互式创建
>   sudo useradd user1    # Ubuntu 也可用，但需手动配置（同 CentOS）
>   ```
> - Ubuntu 中普通用户加入 sudo 组即获提权：`sudo usermod -aG sudo 用户名`；CentOS 中则需 visudo 配置或加入 wheel 组。

### 3.3 查看权限控制信息

通过 `ls -l` 可以查看文件/目录的权限信息。权限信息由 10 个字符组成：

```bash
# ls -l 输出示例
drwxr-xr-x. 2 itheima itheima 4096 Nov 15 10:00 test
  ①        ②       ③      ④       ⑤        ⑥       ⑦
# ① 权限信息（10个字符）
# ② 文件/文件夹的硬链接数
# ③ 所属用户
# ④ 所属用户组
# ⑤ 文件大小
# ⑥ 最后修改时间
# ⑦ 文件/文件夹名称
```

**权限字符解读：**

权限信息第 1 个字符表示类型：`-` 表示文件，`d` 表示文件夹，`l` 表示软链接。

后 9 个字符分为 3 组，分别表示**所属用户权限**、**所属组权限**、**其他用户权限**：

```
  d   rwx   r-x   r-x
  │    │     │     │
  │    │     │     └── 其他用户权限：r(读) -(无写) x(执行)
  │    │     └──────── 所属组权限：r(读) -(无写) x(执行)
  │    └────────────── 所属用户权限：r(读) w(写) x(执行)
  └─────────────────── 类型：d=文件夹
```

| 权限字符 | 对文件 | 对文件夹 |
|----------|--------|----------|
| `r` (read) | 可以查看文件内容 | 可以列出文件夹内容（ls） |
| `w` (write) | 可以修改文件内容 | 可以在文件夹内创建/删除文件 |
| `x` (execute) | 可以将文件作为程序执行 | 可以进入文件夹（cd） |
| `-` | 无对应权限 | 无对应权限 |

> `<Ubuntu差异>` 权限模型完全一致，`ls -l` 输出格式相同。细微差异：CentOS 的 `ls -l` 输出权限后可能有 `.`（表示启用了 SELinux 安全标签）或 `+`（表示有 ACL）；Ubuntu 默认使用 AppArmor，`ls -l` 一般无 `.` 后缀。

### 3.4 chmod命令 - 修改权限

作用：修改文件或目录的权限控制信息。

```
chmod [-R] 权限 文件/文件夹路径
```
`-R` 对文件夹内所有内容应用相同权限。

#### 符号方式

```bash
# u=user, g=group, o=other, a=all
# +增加权限, -移除权限, =设置权限

chmod u=rwx,g=rx,o=x test.txt   # 设置具体权限
chmod u+x test.txt              # 给用户增加执行权限
chmod o-w test.txt              # 移除其他用户的写权限
chmod -R u=rwx,g=rx,o=rx folder # 递归修改文件夹
```

#### 数字序号方式（关键）

权限可以用数字表示，三者权限之和即为该组的权限数字：

| 权限 | 数字 | 说明 |
|------|------|------|
| `r` | 4 | 读 |
| `w` | 2 | 写 |
| `x` | 1 | 执行 |

**权限数字速查表：**
- `0` = ---（无权限）
- `1` = --x（仅执行）
- `2` = -w-（仅写）
- `3` = -wx（写+执行）
- `4` = r--（仅读）
- `5` = r-x（读+执行）
- `6` = rw-（读+写）
- `7` = rwx（读+写+执行）

```bash
# chmod 755 = rwxr-xr-x
# 用户：7(rwx) 组：5(r-x) 其他：5(r-x)
chmod 755 test.txt

# chmod 644 = rw-r--r--（常用文件权限）
chmod 644 test.txt

# chmod 777 = rwxrwxrwx（所有权限，慎用）
chmod 777 test.txt
```

> `<Ubuntu差异>` chmod 用法完全通用，无差异。

### 3.5 chown命令 - 修改所属

作用：修改文件/文件夹的所属用户和用户组。chmod 是修改权限，chown 是修改所属。

```
chown [-R] [用户][:][用户组] 文件路径
```
`-R` 递归修改文件夹内所有内容。

```bash
# 修改所属用户
chown user1 test.txt

# 修改所属用户组
chown :group1 test.txt

# 同时修改用户和组
chown user1:group1 test.txt

# 递归修改文件夹
chown -R user1:group1 folder
```

> **注意：** chown 命令需要 root 权限才能执行，普通用户需要使用 `sudo`。

> `<Ubuntu差异>` chown 用法完全通用。Ubuntu 中因 root 默认禁用，普通用户执行 chown 必须加 `sudo`。

---

## 第四章 Linux实用操作

### 4.1 各类小技巧快捷键

| 快捷键/命令 | 功能 |
|-------------|------|
| `ctrl + c` | 强制停止当前运行的程序/命令 |
| `ctrl + d` | 退出当前用户登录 / 退出特定程序 |
| `history` | 显示历史输入过的命令 |
| `!命令前缀` | 自动执行上一次匹配的命令（如 `!ls`） |
| `ctrl + r` | 搜索历史命令（输入关键词匹配） |
| `ctrl + l` 或 `clear` | 清屏 |
| `Tab` | 自动补全文件名/命令名 |
| `↑ / ↓` | 浏览上一条/下一条历史命令 |

> `<Ubuntu差异>` 快捷键完全通用，无差异。

### 4.2 软件安装

Linux 系统提供了包管理器来安装软件。**CentOS 使用 `yum`，Ubuntu 使用 `apt`**，这是两者最核心的差异之一。

#### CentOS：yum 包管理器

```
yum [-y] [install | remove | search] 软件名称
```
`-y` 表示自动确认，无需手动输入 yes。

```bash
# 安装软件
yum -y install wget

# 卸载软件
yum -y remove wget

# 搜索软件
yum search wget

# 更新所有软件
yum -y update

# CentOS 8+ 使用 dnf（yum 的下一代，语法兼容）
dnf -y install wget
```

#### Ubuntu：apt 包管理器

```
apt [-y] [install | remove | search] 软件名称
```

```bash
# 安装软件前先更新软件源列表（重要！）
sudo apt update

# 安装软件
sudo apt -y install wget

# 卸载软件
sudo apt -y remove wget

# 卸载软件并删除配置文件
sudo apt -y purge wget

# 搜索软件
apt search wget

# 更新所有已安装软件
sudo apt -y upgrade
```

> `<Ubuntu差异>` **包管理器差异对照表：**

| 操作 | CentOS (yum/dnf) | Ubuntu (apt) |
|------|------------------|--------------|
| 更新软件源 | `yum makecache` | `apt update` |
| 安装软件 | `yum install 包名` | `apt install 包名` |
| 卸载软件 | `yum remove 包名` | `apt remove 包名` |
| 卸载+清配置 | `yum remove 包名` | `apt purge 包名` |
| 搜索软件 | `yum search 关键词` | `apt search 关键词` |
| 升级所有软件 | `yum update` | `apt upgrade` |
| 查看包信息 | `yum info 包名` | `apt show 包名` |
| 列出已安装 | `yum list installed` | `dpkg -l` 或 `apt list --installed` |
| 自动确认 | `-y` | `-y` |
| 包格式 | `.rpm` | `.deb` |
| 本地包安装 | `rpm -ivh 包.rpm` | `dpkg -i 包.deb` |

> 💡 **apt vs apt-get：** `apt` 是 apt-get 的简化版，输出更友好，适合交互式使用；`apt-get` 更适合脚本。两者功能类似。

### 4.3 systemctl控制软件

Linux 中很多软件安装后支持通过 `systemctl` 命令控制启动、停止、开机自启等。**systemctl 在 CentOS 和 Ubuntu 上完全通用**（都基于 systemd）。

| 命令 | 功能 |
|------|------|
| `systemctl start 服务名` | 启动服务 |
| `systemctl stop 服务名` | 停止服务 |
| `systemctl status 服务名` | 查看服务状态 |
| `systemctl enable 服务名` | 设置开机自启 |
| `systemctl disable 服务名` | 关闭开机自启 |
| `systemctl restart 服务名` | 重启服务 |

```bash
# 启动防火墙
systemctl start firewalld

# 查看防火墙状态
systemctl status firewalld

# 设置开机自启
systemctl enable firewalld
```

> `<Ubuntu差异>` systemctl 命令本身通用，但**服务名可能不同**：

| 功能 | CentOS 服务名 | Ubuntu 服务名 |
|------|--------------|---------------|
| 网络服务 | `network` | `systemd-networkd` 或 `NetworkManager` |
| 防火墙 | `firewalld` | `ufw`（实际是 iptables 前端） |
| SSH 服务 | `sshd` | `ssh` |
| MySQL | `mysqld` | `mysql` |
| Nginx | `nginx` | `nginx` |
| Apache | `httpd` | `apache2` |

```bash
# CentOS 重启网络
systemctl restart network

# Ubuntu 重启网络（Netplan 环境）
systemctl restart systemd-networkd
# 或
systemctl restart NetworkManager
```

### 4.4 软连接

软连接类似 Windows 的快捷方式，可以将文件/文件夹链接到其他位置。

```
ln -s 被链接的文件/文件夹路径 链接路径
```

```bash
# 将 /etc/sysconfig/network-scripts/ifcfg-ens33 链接到 ~/net
ln -s /etc/sysconfig/network-scripts/ifcfg-ens33 ~/net

# 之后直接编辑 ~/net 即可操作原文件
vi ~/net
```

> `<Ubuntu差异>` `ln -s` 用法完全通用。但 Ubuntu 网络配置文件路径不同（见 4.7 节），软连接示例路径需相应调整。

### 4.5 日期和时区

#### date - 查看和设置日期

```bash
# 查看当前时间
date

# 自定义格式输出
date +%Y-%m-%d           # 2024-01-15
date +%Y-%m-%d\ %H:%M:%S # 2024-01-15 10:30:00

# 修改时区（需 root，CentOS）
rm -f /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

#### timedatectl - 现代化时区设置（推荐）

CentOS 7+ 和 Ubuntu 均支持 `timedatectl`，比手动软连接更规范：

```bash
# 查看时区与时间状态
timedatectl

# 设置时区为上海
timedatectl set-timezone Asia/Shanghai

# 开启 NTP 自动同步
timedatectl set-ntp true
```

#### ntpdate - 时间同步

```bash
# CentOS 安装 ntpdate 并同步时间
yum -y install ntpdate
ntpdate -u ntp.aliyu
n.com

# Ubuntu 安装并同步
sudo apt install ntpdate
sudo ntpdate -u ntp.aliyun.com
```

> `<Ubuntu差异>` `date`/`timedatectl` 命令通用。差异：
> - CentOS 默认时区可能是 UTC；Ubuntu 安装时可选择时区。
> - 推荐两者都用 `timedatectl set-timezone Asia/Shanghai`，无需手动删软连接。
> - Ubuntu 还可用 `chrony`（`sudo apt install chrony`）替代 ntpdate 做持续同步。

### 4.6 IP地址和主机名

#### 查看IP地址

```bash
ip addr        # 查看IP地址（通用）
ifconfig       # 查看IP地址（需安装 net-tools）
```

#### 主机名管理

```bash
hostname                          # 查看主机名
hostnamectl set-hostname mylinux  # 修改主机名（需root，通用）
```

#### 域名解析

在 Linux 中，`/etc/hosts` 文件用于本地域名解析，可以将 IP 地址映射为主机名。

```bash
# 编辑 hosts 文件
vi /etc/hosts

# 添加映射关系
192.168.1.100  mylinux
192.168.1.101  node1
```

> `<Ubuntu差异>` `ip addr`/`hostnamectl`/`/etc/hosts` 完全通用。差异：
> - Ubuntu 网卡名通常为 `ens33` 或 `eth0`，CentOS 也常见 `ens33`，命名规则一致（predictable network interface names）。
> - `ifconfig` 在两者上都需额外安装 net-tools 包：CentOS 用 `yum install net-tools`，Ubuntu 用 `sudo apt install net-tools`。

### 4.7 配置Linux固定IP

虚拟机中 Linux 的 IP 默认是动态获取的，每次重启可能变化。配置固定 IP 可以方便远程连接。**这是 CentOS 与 Ubuntu 差异最大的配置之一。**

#### CentOS：修改 ifcfg 配置文件

```bash
# 编辑网络配置文件（网卡名可能不同，如 ens33）
vi /etc/sysconfig/network-scripts/ifcfg-ens33

# 修改/添加以下配置：
BOOTPROTO="static"          # 将 dhcp 改为 static
IPADDR="192.168.88.131"     # 固定IP地址
NETMASK="255.255.255.0"     # 子网掩码
GATEWAY="192.168.88.2"      # 网关
DNS1="8.8.8.8"              # DNS服务器

# 重启网络服务生效
systemctl restart network
```

#### Ubuntu：修改 Netplan 配置文件（YAML 格式）

Ubuntu 18.04+ 使用 **Netplan** 管理网络，配置文件为 YAML 格式，位于 `/etc/netplan/` 目录。

```bash
# 查看现有配置文件名
ls /etc/netplan/
# 通常为 01-network-manager-all.yaml 或 00-installer-config.yaml

# 编辑配置文件（需 sudo）
sudo vi /etc/netplan/01-network-manager-all.yaml
```

```yaml
# Netplan 固定 IP 配置示例（注意 YAML 缩进必须用空格，不能用 Tab）
network:
  version: 2
  ethernets:
    ens33:                          # 网卡名，用 ip addr 查看
      dhcp4: no                     # 关闭 DHCP
      addresses:
        - 192.168.88.132/24         # 固定IP/子网掩码位数
      routes:
        - to: default
          via: 192.168.88.2          # 网关
      nameservers:
        addresses: [8.8.8.8, 114.114.114.114]  # DNS
```

```bash
# 应用配置生效
sudo netplan apply

# 测试配置（不实际应用）
sudo netplan try
```

> `<Ubuntu差异>` **固定 IP 配置对比：**

| 对比项 | CentOS | Ubuntu |
|--------|--------|--------|
| 配置工具 | network 服务 | Netplan（生成后端配置） |
| 配置文件 | `/etc/sysconfig/network-scripts/ifcfg-ens33` | `/etc/netplan/*.yaml` |
| 文件格式 | shell 变量键值对 | YAML（缩进敏感） |
| 生效命令 | `systemctl restart network` | `sudo netplan apply` |
| 后端渲染 | 直接由 network 读取 | 渲染为 systemd-networkd / NetworkManager 配置 |

> ⚠️ **Netplan 注意事项：** YAML 严格区分缩进，必须用空格不能 Tab；冒号后必须有空格；修改前建议 `sudo cp` 备份原文件；配置错误可能导致网络断开。

### 4.8 网络传输

#### 网络请求和下载

| 命令 | 作用 | 语法 |
|------|------|------|
| `ping` | 测试网络连通性 | `ping [-c num] IP/域名` |
| `wget` | 下载文件（非交互式） | `wget [-b] URL` |
| `curl` | 发起 HTTP 请求 | `curl [-O] URL` |

```bash
# ping 测试网络连通性
ping -c 4 baidu.com   # -c 指定次数

# wget 下载文件
wget http://example.com/file.tar.gz
wget -b http://example.com/file.tar.gz  # -b 后台下载

# curl 发送请求
curl http://baidu.com             # 获取网页内容
curl -O http://example.com/file.zip # -O 下载保存为文件
```

> `<Ubuntu差异>` ping/wget/curl 用法通用，但需安装：CentOS 用 `yum install wget curl`，Ubuntu 用 `sudo apt install wget curl`。Ubuntu 的 `ping` 默认需 `sudo` 才能用 `-c` 外的高级选项（因 capabilities 限制），普通用户基本 ping 可用。

#### 端口

端口是设备与外界通讯的出口。Linux 中可以通过 `nmap` 命令查看端口占用情况，`netstat` 查看网络连接。

```bash
# CentOS 安装 nmap
yum -y install nmap

# Ubuntu 安装 nmap
sudo apt install nmap

# 查看指定IP的端口占用
nmap 127.0.0.1

# 查看端口占用（需安装 net-tools）
netstat -anp | grep 80

# 通用替代命令（无需安装额外包）
ss -tulnp | grep 80
```

**常见端口：**
- **22：** SSH（远程连接）
- **80：** HTTP（Web服务）
- **443：** HTTPS（加密Web服务）
- **3306：** MySQL数据库
- **6379：** Redis

#### 防火墙（重点差异）

**CentOS：firewalld**

```bash
# 启动/停止/开机自启
systemctl start firewalld
systemctl enable firewalld

# 开放端口（--permanent 永久生效）
firewall-cmd --permanent --add-port=3306/tcp
firewall-cmd --permanent --add-service=http
firewall-cmd --reload          # 重新加载生效

# 查看已开放端口
firewall-cmd --list-all

# 关闭端口
firewall-cmd --permanent --remove-port=3306/tcp
firewall-cmd --reload
```

**Ubuntu：ufw（Uncomplicated Firewall）**

```bash
# 安装（Ubuntu Server 默认未装，Desktop 常预装）
sudo apt install ufw

# 启用/禁用
sudo ufw enable
sudo ufw disable

# 开放端口
sudo ufw allow 3306/tcp        # 开放 3306
sudo ufw allow 80              # 开放 80（可省略协议）
sudo ufw allow http            # 按服务名开放

# 查看状态
sudo ufw status
sudo ufw status verbose

# 关闭端口
sudo ufw deny 3306
sudo ufw delete allow 3306     # 删除规则
```

> `<Ubuntu差异>` **防火墙对比：**

| 对比项 | CentOS (firewalld) | Ubuntu (ufw) |
|--------|--------------------|--------------|
| 命令 | `firewall-cmd` | `ufw` |
| 开放端口 | `firewall-cmd --permanent --add-port=80/tcp` + `--reload` | `sudo ufw allow 80` |
| 查看规则 | `firewall-cmd --list-all` | `sudo ufw status` |
| 底层 | iptables/nftables | iptables |
| 语法 | 较复杂 | 简洁 |
| 默认状态 | 默认启用 | 默认未启用（需手动 `ufw enable`） |

### 4.9 进程管理

程序运行在操作系统中，被操作系统管理，称为"进程"。

#### ps - 查看进程

```bash
# 查看所有进程（-e 所有，-f 详细信息）
ps -ef

# 配合管道符查找特定进程
ps -ef | grep mysql
```

#### kill - 关闭进程

```bash
# kill 进程ID
kill 1234

# -9 强制杀死进程
kill -9 1234
```

> **ps -ef 输出说明：**
> - **UID：** 进程所属用户
> - **PID：** 进程ID（用于 kill）
> - **PPID：** 父进程ID
> - **C：** CPU占用率
> - **STIME：** 启动时间
> - **TTY：** 终端设备
> - **TIME：** 累计CPU时间
> - **CMD：** 启动进程的命令

> `<Ubuntu差异>` ps/kill 完全通用，无差异。Ubuntu 也可用 `pgrep`/`pkill` 按名查找/杀进程（CentOS 同样支持）。

### 4.10 主机状态监控

#### top - 系统资源监控

`top` 类似 Windows 的任务管理器，可以实时查看系统资源使用情况。

```bash
top   # 按 q 退出
```

**top 命令关键信息：**
- **load average：** 系统负载（1/5/15分钟），值越低越好
- **CPU(s)：** CPU 使用率（us 用户，sy 系统，id 空闲）
- **Mem：** 内存使用情况（total 总量，free 空闲，used 已用）
- **Swap：** 交换分区使用情况

#### df - 磁盘空间监控

```bash
df -h   # 以易读方式显示磁盘使用情况
```

#### iostat - 磁盘IO监控

```bash
# CentOS
yum -y install sysstat
# Ubuntu
sudo apt install sysstat

iostat -x 1 3   # 每1秒采样，共3次
```

#### sar - 网络状态监控

```bash
sar -n DEV 1 3   # 查看网络接口流量，每1秒1次，共3次
```

> `<Ubuntu差异>` top/df/iostat/sar 命令完全通用。`iostat`/`sar` 都来自 sysstat 包，安装命令不同：CentOS `yum install sysstat`，Ubuntu `sudo apt install sysstat`。Ubuntu 上 sysstat 安装后需 `sudo vi /etc/default/sysstat` 将 `ENABLED="false"` 改为 `"true"` 才能收集历史数据。

### 4.11 环境变量

环境变量是操作系统运行时记录的一些关键信息，用于辅助系统运行。环境变量没有统一的名称，是一组变量的集合。

#### env - 查看环境变量

```bash
env   # 查看所有环境变量

# 查看指定环境变量
echo $PATH
```

#### $PATH 环境变量

PATH 记录了系统命令的搜索路径。当执行命令时，系统会从 PATH 记录的路径中搜索该命令的程序文件。

> **为什么在任何目录都能使用 ls 等命令？** 因为 `/usr/bin` 等目录在 PATH 环境变量中，系统会自动在这些路径下查找命令。通过 `which ls` 可以看到 ls 在 `/usr/bin/ls`。

#### 设置环境变量

```bash
# 临时设置（当前终端有效）
export MYVAR=hello

# 永久设置（当前用户有效）
vi ~/.bashrc
# 在文件末尾添加：export MYVAR=hello
source ~/.bashrc   # 使配置立即生效

# 永久设置（所有用户有效，需 root）
vi /etc/profile
```

> `<Ubuntu差异>` 环境变量机制完全通用。差异在于默认加载的配置文件：
> - **CentOS** 默认 Shell 为 Bash，加载 `~/.bashrc` → `/etc/bashrc`。
> - **Ubuntu** 默认 Shell 也是 Bash，但加载顺序为 `~/.bashrc` → `/etc/bash.bashrc`；若用 **zsh**（如安装了 oh-my-zsh）则加载 `~/.zshrc`。
> - Ubuntu 推荐用户级环境变量写入 `~/.profile`（登录时加载）或 `~/.bashrc`（交互式 shell 加载）。

### 4.12 上传、下载

可以通过 `rz` 和 `sz` 命令在 FinalShell 等终端中进行文件的上传和下载。

```bash
# CentOS 安装 lrzsz
yum -y install lrzsz

# Ubuntu 安装 lrzsz
sudo apt install lrzsz

# 上传文件到 Linux（弹出文件选择窗口）
rz

# 下载文件到 Windows
sz test.txt
```

> **FinalShell 更简单：** 使用 FinalShell 连接时，可以直接通过底部的文件管理面板拖拽上传/下载文件，更加方便。

> `<Ubuntu差异>` rz/sz 用法通用，仅安装命令不同。

### 4.13 压缩、解压

#### tar 命令

Linux 中最常用的压缩/解压工具，常用于 `.tar` 和 `.tar.gz` 格式。

| 选项 | 说明 |
|------|------|
| `-c` | 创建压缩文件（create） |
| `-x` | 解压文件（extract） |
| `-v` | 显示过程（verbose） |
| `-f` | 指定文件名（必须放最后） |
| `-z` | 使用 gzip 压缩（.tar.gz） |
| `-C` | 解压到指定目录 |

```bash
# 压缩为 .tar.gz 格式
tar -zcvf test.tar.gz test/

# 压缩为 .tar 格式（不压缩，仅打包）
tar -cvf test.tar test/

# 解压 .tar.gz 到当前目录
tar -zxvf test.tar.gz

# 解压到指定目录
tar -zxvf test.tar.gz -C /home/itheima/
```

#### zip / unzip 命令

```bash
# CentOS 安装 zip/unzip
yum -y install zip unzip

# Ubuntu 安装 zip/unzip
sudo apt install zip unzip

# 压缩为 zip（-r 递归压缩文件夹）
zip -r test.zip test/

# 解压 zip
unzip test.zip

# 解压到指定目录
unzip test.zip -d /home/itheima/
```

> **压缩格式对比：**
> - **.tar.gz：** Linux 最常用，压缩率高
> - **.tar：** 仅打包不压缩
> - **.zip：** 跨平台兼容性好，Windows 也支持

> `<Ubuntu差异>` tar/zip/unzip 命令完全通用，仅安装命令不同。

---

## 第五章 实战部署

### 5.1 MySQL 部署

在 Linux 上部署 MySQL 数据库是常见的实战操作，综合运用了前面学过的命令。**CentOS 与 Ubuntu 安装方式差异较大。**

#### CentOS：yum 安装 MySQL 5.7

```bash
# 1. 更新 yum 源（安装 MySQL 官方 yum 仓库）
rpm -Uvh https://dev.mysql.com/get/mysql57-community-release-el7.rpm

# 2. yum 安装 MySQL 服务器
yum -y install mysql-community-server

# 3. 启动 MySQL
systemctl start mysqld
systemctl enable mysqld   # 设置开机自启

# 4. 查看初始密码
grep "password" /var/log/mysqld.log

# 5. 登录 MySQL
mysql -uroot -p
# 输入初始密码

# 6. 修改密码（在 MySQL 命令行中）
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
```

#### Ubuntu：apt 安装 MySQL（更简单）

Ubuntu 用 apt 安装 MySQL 更简洁，安装过程中会提示设置 root 密码。

```bash
# 1. 更新软件源
sudo apt update

# 2. 安装 MySQL 服务器（安装中会提示设置 root 密码）
sudo apt install mysql-server

# 3. 启动并设置开机自启
sudo systemctl start mysql
sudo systemctl enable mysql

# 4. 登录（用安装时设置的密码）
sudo mysql -uroot -p

# 5. 运行安全配置脚本（推荐，加固安全）
sudo mysql_secure_installation
```

> ⚠️ **MySQL 密码策略：** MySQL 5.7+ 默认密码策略要求：长度至少 8 位，包含大小写字母、数字和特殊字符。如需设置简单密码，需先修改密码策略。

```sql
-- 降低密码策略（仅在测试环境中使用）
SET GLOBAL validate_password_policy=0;
SET GLOBAL validate_password_length=4;

-- 修改为简单密码
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
```

#### 开放远程连接

```sql
-- 允许 root 远程连接
CREATE USER 'root'@'%' IDENTIFIED BY '密码';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

```bash
# CentOS 开放防火墙 3306 端口
firewall-cmd --permanent --add-port=3306/tcp
firewall-cmd --reload

# Ubuntu 开放防火墙 3306 端口
sudo ufw allow 3306/tcp
```

> `<Ubuntu差异>` **MySQL 部署对比：**

| 对比项 | CentOS | Ubuntu |
|--------|--------|--------|
| 安装命令 | `yum install mysql-community-server` | `sudo apt install mysql-server` |
| 是否需加源 | 需先 rpm 安装官方 yum 源 | 默认源已包含，无需加源 |
| 服务名 | `mysqld` | `mysql` |
| 初始密码 | 需 `grep` 日志获取 | 安装时交互设置 |
| 安全加固 | 手动 | `mysql_secure_installation` |
| 配置文件 | `/etc/my.cnf` | `/etc/mysql/mysql.conf.d/mysqld.cnf` |
| 数据目录 | `/var/lib/mysql` | `/var/lib/mysql` |
| 日志文件 | `/var/log/mysqld.log` | `/var/log/mysql/error.log` |
| 开放端口 | `firewall-cmd` | `sudo ufw allow` |

> 💡 **Ubuntu MySQL 8.0 注意：** Ubuntu 20.04+ 默认装 MySQL 8.0，root 默认用 `auth_socket` 认证（无需密码，仅限本地 sudo 登录）。若需密码登录，需 `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '密码';`。

---

## 第六章 脚本 & 自动化

> Shell 脚本是将一系列 Linux 命令按顺序写入文件，由 Shell 解释器批量执行的技术。掌握 Shell 脚本编程，可以大幅提升运维效率，实现自动化部署、日志清理、数据备份等任务。

### 6.1 Shell 脚本基础

#### 创建与执行

Shell 脚本本质上是一个文本文件，通常以 `.sh` 为扩展名。文件第一行必须指定解释器（shebang）。

```bash
#!/bin/bash
# 这是注释，以 # 开头
echo "Hello, Shell Script!"
```

**执行脚本的两种方式：**

```bash
# 方式一：添加执行权限后直接运行
chmod +x hello.sh
./hello.sh

# 方式二：用 bash/sh 解释器执行（无需执行权限）
bash hello.sh
sh hello.sh
```

> **shebang 说明：** `#!/bin/bash` 告诉系统用 /bin/bash 解释器执行脚本。其他常见写法：`#!/bin/sh`（POSIX Shell，更通用）、`#!/usr/bin/env bash`（更可移植）。

> `<Ubuntu差异>` CentOS 和 Ubuntu 默认 Shell 都是 Bash，脚本写法通用。但 Ubuntu 的 `/bin/sh` 默认指向 `dash`（更轻量），`/bin/bash` 指向 Bash。如果脚本用了 Bash 特有语法（如数组、`[[ ]]`），必须用 `#!/bin/bash` 而非 `#!/bin/sh`，否则在 Ubuntu 上可能报错。

#### 脚本调试

```bash
# 执行前检查语法（不实际运行）
bash -n hello.sh

# 执行时显示每条命令（调试模式）
bash -x hello.sh

# 在脚本内开启调试模式
#!/bin/bash
set -x          # 开启命令回显
set -e          # 遇到错误立即退出
set -u          # 使用未定义变量时报错
set -o pipefail # 管道中任一命令失败则整体失败
```

### 6.2 变量

#### 自定义变量

```bash
#!/bin/bash
# 变量名=值，注意等号两边不能有空格！
name="itheima"
age=18

# 使用变量：$变量名 或 ${变量名}
echo "姓名：$name"
echo "年龄：${age}岁"

# 变量重新赋值
name="heima"
echo "新姓名：$name"

# 只读变量（不可修改）
readonly PI=3.14
# PI=3.15  # 报错：只读变量

# 删除变量（只读变量不能删除）
unset age
# echo $age  # 输出为空
```

> ⚠️ **变量赋值的坑：** `name = "value"`（等号两边有空格）会报错！Shell 会把 name 当命令执行。正确写法是 `name="value"`（无空格）。

#### 命令替换

将命令的执行结果赋值给变量，使用反引号 `` ` `` 或 `$()`：

```bash
# 两种写法等价，推荐 $()（更清晰，支持嵌套）
current_dir=$(pwd)
current_dir=`pwd`

today=$(date +%Y-%m-%d)
echo "今天是 $today"

# 获取文件行数
line_count=$(wc -l < /etc/passwd)
echo "passwd 文件有 $line_count 行"
```

#### 特殊变量

Shell 预定义了一组特殊变量，在脚本中非常常用：

| 变量 | 含义 | 示例 |
|------|------|------|
| `$0` | 脚本文件名 | `./hello.sh` |
| `$1`~`$9` | 第1~9个位置参数 | `./hello.sh arg1 arg2` 中 `$1=arg1` |
| `${10}` | 第10个及以上参数（需用花括号） | |
| `$#` | 参数总个数 | |
| `$@` | 所有参数（每个参数独立） | 常用于 `for arg in "$@"` |
| `$*` | 所有参数（合为一个字符串） | |
| `$?` | 上一条命令的退出状态码（0=成功） | |
| `$$` | 当前脚本的进程PID | |
| `$!` | 最近一个后台进程的PID | |

```bash
#!/bin/bash
# 参数演示脚本：param_demo.sh
echo "脚本名：$0"
echo "参数个数：$#"
echo "第一个参数：$1"
echo "第二个参数：$2"
echo "所有参数：$@"

# 执行：bash param_demo.sh hello world 123
# 输出：
# 脚本名：param_demo.sh
# 参数个数：3
# 第一个参数：hello
# 第二个参数：world
# 所有参数：hello world 123
```

```bash
#!/bin/bash
# $? 退出状态码演示
ls /tmp
echo "ls 执行结果：$?"    # 0 表示成功

ls /not_exist_dir
echo "ls 执行结果：$?"    # 非零表示失败
```

> `<Ubuntu差异>` Shell 变量语法在 CentOS/Ubuntu 上完全通用，无差异。

### 6.3 条件判断

#### if 语句

```bash
#!/bin/bash
# 基本语法
if [ 条件 ]; then
    命令
fi

# if-else
if [ 条件 ]; then
    命令1
else
    命令2
fi

# if-elif-else
if [ 条件1 ]; then
    命令1
elif [ 条件2 ]; then
    命令2
else
    命令3
fi
```

> ⚠️ **`[ ]` 的注意事项：** 方括号内两侧必须有空格！`[ $a = $b ]` 正确，`[$a=$b]` 错误。条件判断推荐用 `[[ ]]`（Bash 增强，支持 `&&`、`||`、模式匹配）。

#### 条件判断类型

**1. 数值比较：**

| 运算符 | 含义 | 示例 |
|--------|------|------|
| `-eq` | 等于 | `[ $a -eq $b ]` |
| `-ne` | 不等于 | `[ $a -ne $b ]` |
| `-gt` | 大于 | `[ $a -gt $b ]` |
| `-lt` | 小于 | `[ $a -lt $b ]` |
| `-ge` | 大于等于 | `[ $a -ge $b ]` |
| `-le` | 小于等于 | `[ $a -le $b ]` |

**2. 字符串比较：**

| 运算符 | 含义 | 示例 |
|--------|------|------|
| `=` | 字符串相等 | `[ "$a" = "$b" ]` |
| `!=` | 字符串不等 | `[ "$a" != "$b" ]` |
| `-z` | 字符串为空 | `[ -z "$str" ]` |
| `-n` | 字符串非空 | `[ -n "$str" ]` |

**3. 文件判断：**

| 运算符 | 含义 |
|--------|------|
| `-e 文件` | 文件存在 |
| `-f 文件` | 存在且为普通文件 |
| `-d 文件` | 存在且为目录 |
| `-r 文件` | 可读 |
| `-w 文件` | 可写 |
| `-x 文件` | 可执行 |

```bash
#!/bin/bash
# 条件判断综合示例
score=85

if [ $score -ge 90 ]; then
    echo "优秀"
elif [ $score -ge 80 ]; then
    echo "良好"
elif [ $score -ge 60 ]; then
    echo "及格"
else
    echo "不及格"
fi

# 文件判断
if [ -f /etc/passwd ]; then
    echo "passwd 文件存在"
fi

# 字符串判断
user=$(whoami)
if [ "$user" = "root" ]; then
    echo "当前是 root 用户"
else
    echo "当前是普通用户：$user"
fi
```

#### case 语句

case 适合多分支匹配，比多个 elif 更清晰：

```bash
#!/bin/bash
# case 语句示例：服务管理脚本
read -p "请输入操作(start/stop/restart/status): " action

case "$action" in
    start)
        echo "启动服务..."
        systemctl start nginx
        ;;
    stop)
        echo "停止服务..."
        systemctl stop nginx
        ;;
    restart)
        echo "重启服务..."
        systemctl restart nginx
        ;;
    status)
        systemctl status nginx
        ;;
    *)
        echo "未知操作：$action"
        echo "用法：$0 {start|stop|restart|status}"
        exit 1
        ;;
esac
```

### 6.4 循环语句

#### for 循环

```bash
#!/bin/bash
# 列表循环
for i in 1 2 3 4 5; do
    echo "第 $i 次循环"
done

# 范围循环（seq 或 {start..end}）
for i in {1..5}; do
    echo "数字：$i"
done

for i in $(seq 1 2 10); do  # 步长为2：1,3,5,7,9
    echo "奇数：$i"
done

# 遍历目录文件
for file in /etc/*.conf; do
    echo "配置文件：$file"
done

# 遍历脚本参数
for arg in "$@"; do
    echo "参数：$arg"
done

# C 风格 for 循环
for ((i=0; i<5; i++)); do
    echo "i = $i"
done
```

#### while 循环

```bash
#!/bin/bash
# 基本while循环
count=1
while [ $count -le 5 ]; do
    echo "第 $count 次循环"
    count=$((count + 1))   # 算术运算用 $(())
done

# 读取文件每一行
while read line; do
    echo "行内容：$line"
done < /etc/passwd

# 无限循环（用 break 退出）
while true; do
    echo "运行中... (Ctrl+C 退出)"
    sleep 1
done
```

#### until 循环

until 与 while 相反，条件为假时循环，为真时停止：

```bash
#!/bin/bash
# 等待服务启动
until systemctl is-active --quiet nginx; do
    echo "等待 Nginx 启动..."
    sleep 2
done
echo "Nginx 已启动！"
```

#### break 和 continue

```bash
#!/bin/bash
# break 跳出整个循环
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        break    # 到5就退出
    fi
    echo "i = $i"
done

# continue 跳过本次循环
for i in {1..10}; do
    if [ $((i % 2)) -eq 0 ]; then
        continue  # 跳过偶数
    fi
    echo "奇数：$i"
done
```

### 6.5 函数

Shell 函数将重复的代码块封装，便于复用。

```bash
#!/bin/bash
# 函数定义（两种写法）
function greet() {
    echo "Hello, $1!"
}

# 简写（省略 function 关键字）
saybye() {
    echo "Goodbye, $1!"
}

# 调用函数（参数用空格分隔，不用括号）
greet "itheima"     # 输出：Hello, itheima!
saybye "world"      # 输出：Goodbye, world!
```

#### 函数返回值

Shell 函数的返回值有两种方式：`return`（返回状态码）和 `echo`（返回字符串）。

```bash
#!/bin/bash
# 方式一：return 返回状态码（0-255）
is_root() {
    if [ "$(whoami)" = "root" ]; then
        return 0    # true
    else
        return 1    # false
    fi
}

# 调用并用 $? 判断
if is_root; then
    echo "是 root 用户"
else
    echo "不是 root 用户"
fi

# 方式二：echo 返回字符串（更常用）
get_ip() {
    hostname -I | awk '{print $1}'
}

my_ip=$(get_ip)
echo "本机IP：$my_ip"
```

#### 函数实战：计算阶乘

```bash
#!/bin/bash
# 递归计算阶乘
factorial() {
    local n=$1       # local 声明局部变量
    if [ $n -le 1 ]; then
        echo 1
    else
        local prev=$(factorial $((n - 1)))
        echo $((n * prev))
    fi
}

read -p "请输入一个正整数: " num
result=$(factorial $num)
echo "$num! = $result"
```

### 6.6 数组

Bash 支持一维数组（索引数组）和关联数组（键值对）。

```bash
#!/bin/bash
# 索引数组
fruits=("apple" "banana" "cherry" "date")

# 访问元素（索引从0开始）
echo "第一个：${fruits[0]}"
echo "第三个：${fruits[2]}"

# 访问所有元素
echo "所有水果：${fruits[@]}"

# 数组长度
echo "共 ${#fruits[@]} 个水果"

# 遍历数组
for fruit in "${fruits[@]}"; do
    echo "水果：$fruit"
done

# 追加元素
fruits+=("elderberry")
echo "追加后：${fruits[@]}"

# 关联数组（需 Bash 4.0+）
declare -A person
person[name]="张三"
person[age]=25
person[city]="北京"

echo "姓名：${person[name]}"
echo "年龄：${person[age]}"

# 遍历关联数组
for key in "${!person[@]}"; do
    echo "$key = ${person[$key]}"
done
```

> `<Ubuntu差异>` 关联数组（`declare -A`）需要 Bash 4.0+。CentOS 7 自带 Bash 4.2，Ubuntu 20.04+ 自带 Bash 5.0+，均支持。但 `/bin/sh` 指向的 dash 不支持数组，所以使用数组的脚本必须用 `#!/bin/bash`。

### 6.7 自动化运维实战脚本

以下实战脚本综合运用了变量、条件判断、循环、函数等知识，可直接用于实际运维场景。

#### 实战1：日志清理脚本

自动清理指定天数前的旧日志文件，释放磁盘空间。

```bash
#!/bin/bash
# log_cleanup.sh - 日志清理脚本
# 功能：清理指定目录下超过 N 天的日志文件
# 用法：bash log_cleanup.sh [日志目录] [保留天数]

LOG_DIR=${1:-"/var/log/myapp"}       # 默认日志目录
DAYS=${2:-30}                        # 默认保留30天

# 检查目录是否存在
if [ ! -d "$LOG_DIR" ]; then
    echo "[错误] 目录不存在：$LOG_DIR"
    exit 1
fi

echo "===== 日志清理任务 ====="
echo "日志目录：$LOG_DIR"
echo "保留天数：$DAYS 天"
echo "清理时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "------------------------"

# 统计清理前磁盘占用
before_size=$(du -sh "$LOG_DIR" 2>/dev/null | awk '{print $1}')

# 查找并删除旧日志
deleted=0
for file in $(find "$LOG_DIR" -name "*.log" -mtime +$DAYS -type f); do
    rm -f "$file"
    echo "已删除：$file"
    deleted=$((deleted + 1))
done

# 统计清理后磁盘占用
after_size=$(du -sh "$LOG_DIR" 2>/dev/null | awk '{print $1}')

echo "------------------------"
echo "清理完成！"
echo "删除文件数：$deleted"
echo "清理前占用：$before_size"
echo "清理后占用：$after_size"
echo "========================"
```

#### 实战2：MySQL 自动备份脚本

定时备份 MySQL 数据库，保留最近7天的备份。参考了 crontab + Shell 脚本的自动化组合方案 [$TRAE_REF](https://cloud.tencent.com/developer/article/2529803)。

```bash
#!/bin/bash
# backup_mysql.sh - MySQL 自动备份脚本
# 功能：备份指定数据库，自动压缩，保留最近7天
# 用法：bash backup_mysql.sh

# ===== 配置区 =====
DB_USER="root"
DB_PASS="your_password"
DB_NAME="mydb"
BACKUP_DIR="/data/backup/mysql"
KEEP_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"
# ==================

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始备份 $DB_NAME ..."

# 执行备份并压缩
mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" 2>/dev/null | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份成功：$BACKUP_FILE"
    echo "  文件大小：$(du -h "$BACKUP_FILE" | awk '{print $1}')"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份失败！"
    exit 1
fi

# 清理超过保留天数的旧备份
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 清理 $KEEP_DAYS 天前的旧备份 ..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$KEEP_DAYS -exec rm -f {} \;

# 列出当前备份文件
echo "当前备份文件列表："
ls -lh "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份任务完成"
```

#### 实战3：批量创建用户脚本

```bash
#!/bin/bash
# create_users.sh - 批量创建用户脚本
# 功能：从用户列表文件批量创建用户并设置密码
# 用法：bash create_users.sh users.txt

# users.txt 格式：每行一个用户名
USER_FILE=$1

if [ ! -f "$USER_FILE" ]; then
    echo "[错误] 用户列表文件不存在：$USER_FILE"
    echo "用法：$0 <用户列表文件>"
    exit 1
fi

# 检查是否为 root
if [ "$(whoami)" != "root" ]; then
    echo "[错误] 请使用 root 用户执行此脚本"
    exit 1
fi

success=0
fail=0

while read username; do
    # 跳过空行和注释行
    [ -z "$username" ] && continue
    [[ "$username" == \#* ]] && continue

    # 检查用户是否已存在
    if id "$username" &>/dev/null; then
        echo "[跳过] 用户 $username 已存在"
        continue
    fi

    # 创建用户并设置默认密码
    useradd -m "$username"
    echo "${username}:User@123456" | chpasswd

    if [ $? -eq 0 ]; then
        echo "[成功] 创建用户：$username"
        success=$((success + 1))
    else
        echo "[失败] 创建用户：$username"
        fail=$((fail + 1))
    fi
done < "$USER_FILE"

echo "========================"
echo "创建完成！成功 $success 个，失败 $fail 个"
```

#### 实战4：系统监控告警脚本

```bash
#!/bin/bash
# monitor.sh - 系统资源监控告警脚本
# 功能：监控 CPU、内存、磁盘使用率，超过阈值发送告警
# 用法：bash monitor.sh

# ===== 阈值配置 =====
CPU_THRESHOLD=80      # CPU使用率阈值(%)
MEM_THRESHOLD=80      # 内存使用率阈值(%)
DISK_THRESHOLD=90     # 磁盘使用率阈值(%)
ALERT_EMAIL="admin@example.com"
# ====================

echo "===== 系统监控报告 ====="
echo "时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "主机：$(hostname)"
echo "------------------------"

# 检查CPU使用率
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
cpu_int=${cpu_usage%.*}
echo "CPU使用率：${cpu_usage}%"
if [ "$cpu_int" -gt "$CPU_THRESHOLD" ]; then
    echo "[告警] CPU使用率超过 ${CPU_THRESHOLD}%！"
fi

# 检查内存使用率
mem_usage=$(free | awk '/Mem:/ {printf("%.0f", $3/$2*100)}')
echo "内存使用率：${mem_usage}%"
if [ "$mem_usage" -gt "$MEM_THRESHOLD" ]; then
    echo "[告警] 内存使用率超过 ${MEM_THRESHOLD}%！"
fi

# 检查各分区磁盘使用率
echo "磁盘使用情况："
df -h | awk 'NR>=2 {print ""$1" "$5" "$6""}' | while read partition usage mount; do
    usage_num=${usage%\%}
    echo "  $partition ($mount): $usage"
    if [ "$usage_num" -gt "$DISK_THRESHOLD" ]; then
        echo "  [告警] $mount 磁盘使用率超过 ${DISK_THRESHOLD}%！"
    fi
done

echo "------------------------"
echo "监控完成"
```

### 6.8 crontab 定时任务

crontab 是 Linux 的定时任务调度器，类似于 Windows 的计划任务。crond 守护进程每分钟检查一次任务列表，按配置的时间自动执行。参考了 crontab 定时任务的配置方法 [$TRAE_REF](https://blog.csdn.net/xuguokun1986/article/details/52092105)。

#### crontab 命令

```bash
# 编辑当前用户的定时任务
crontab -e

# 查看当前用户的定时任务
crontab -l

# 删除所有定时任务
crontab -r

# 以指定用户编辑定时任务（需root）
sudo crontab -u username -e
```

#### cron 表达式

```
# 格式：分 时 日 月 周 命令
# *    *  *  *  *  command
# |    |  |  |  |
# |    |  |  |  +-- 星期 (0-7, 0和7都是周日)
# |    |  |  +----- 月份 (1-12)
# |    |  +-------- 日期 (1-31)
# |    +----------- 小时 (0-23)
# +---------------- 分钟 (0-59)
```

| 表达式 | 含义 |
|--------|------|
| `*/5 * * * * command` | 每5分钟执行一次 |
| `0 * * * * command` | 每小时整点执行 |
| `0 2 * * * command` | 每天凌晨2点执行 |
| `0 0 * * 0 command` | 每周日凌晨执行 |
| `0 0 1 * * command` | 每月1号凌晨执行 |
| `30 8-18 * * 1-5 command` | 工作日8:30到18:30每小时执行 |

#### 实战配置

```bash
# 编辑定时任务
crontab -e

# 添加以下任务：

# 每天凌晨2点备份MySQL
0 2 * * * /data/scripts/backup_mysql.sh >> /var/log/backup.log 2>&1

# 每周日凌晨3点清理日志
0 3 * * 0 /data/scripts/log_cleanup.sh /var/log/myapp 30 >> /var/log/cleanup.log 2>&1

# 每5分钟检查系统资源
*/5 * * * * /data/scripts/monitor.sh >> /var/log/monitor.log 2>&1

# 每天早上8点发送服务器状态报告
0 8 * * * echo "Daily Report" | mail -s "Server Status" admin@example.com
```

> **`2>&1` 说明：** 将标准错误（2）重定向到标准输出（1），即把错误信息也写入日志文件。

#### crond 服务管理

```bash
# 确保crond服务运行
systemctl start crond       # CentOS
systemctl start cron        # Ubuntu（服务名为cron）

systemctl enable crond      # CentOS 开机自启
systemctl enable cron       # Ubuntu 开机自启

systemctl status crond      # 查看状态
```

> `<Ubuntu差异>` crontab 用法通用，但服务名不同：**CentOS 为 `crond`，Ubuntu 为 `cron`**。cron 日志位置也不同：CentOS 在 `/var/log/cron`，Ubuntu 在 `/var/log/syslog`（可用 `grep CRON /var/log/syslog` 过滤）。

#### crontab 使用注意事项

- **环境变量：** crontab 执行环境精简，PATH 可能不全。脚本中建议使用绝对路径，或在脚本开头 `source ~/.bashrc` 加载环境。
- **输出重定向：** 如果命令有输出但未重定向，cron 会发邮件。建议所有任务都加 `>> /path/to/log 2>&1`。
- **执行权限：** 确保脚本有执行权限 `chmod +x script.sh`。
- **时区：** cron 使用系统时区，可用 `timedatectl` 确认。

---

## 第七章 项目实战

> 综合运用前六章所学知识，完成一个完整的 Web 项目部署。本章以部署 **Nginx + Node.js + Redis + MySQL** 全栈架构为例，涵盖从环境准备到服务上线的全流程。在生产环境中，几乎所有成熟系统都会在应用服务前增加一层 Nginx 反向代理，由 Nginx 统一对外提供访问入口 [$TRAE_REF](https://juejin.cn/post/7599581687358930994)。

### 7.1 项目架构概述

#### 架构图

```
                    ┌─────────────────────────────────────────────┐
                    │                   客户端浏览器                │
                    └──────────────────────┬──────────────────────┘
                                           │ HTTP/HTTPS
                                           ▼
                    ┌─────────────────────────────────────────────┐
                    │              Nginx (端口 80/443)              │
                    │     静态资源服务 + 反向代理 + 负载均衡         │
                    └──────┬──────────────────────────┬───────────┘
                           │ /api/*                   │ 静态文件
                           ▼                          ▼
              ┌────────────────────┐    ┌─────────────────────────┐
              │  Node.js (端口3000) │    │  /usr/share/nginx/html  │
              │    后端 API 服务    │    │    前端静态页面 (HTML)   │
              └────────┬───────────┘    └─────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
  ┌────────────────┐     ┌──────────────────┐
  │  MySQL (3306)  │     │  Redis (6379)    │
  │   数据持久化    │     │   缓存/Session   │
  └────────────────┘     └──────────────────┘
```

#### 各组件职责

| 组件 | 端口 | 职责 |
|------|------|------|
| Nginx | 80/443 | 静态资源服务、反向代理、SSL终止、负载均衡 |
| Node.js | 3000 | 后端 API 服务，处理业务逻辑 |
| MySQL | 3306 | 数据持久化存储 |
| Redis | 6379 | 缓存、Session 存储 |

### 7.2 Nginx 部署

Nginx 是一款高性能的 HTTP 服务器和反向代理服务器，由俄罗斯程序员 Igor Sysoev 开发 [$TRAE_REF](https://cloud.tencent.com/developer/article/2028960)。

#### 安装 Nginx

```bash
# ===== CentOS =====
yum -y install nginx
systemctl start nginx
systemctl enable nginx

# ===== Ubuntu =====
sudo apt update
sudo apt -y install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 验证安装

```bash
# 检查版本
nginx -v

# 测试配置文件语法
nginx -t

# 重新加载配置（不中断服务）
nginx -s reload

# 浏览器访问 http://服务器IP，看到欢迎页即成功
curl http://localhost
```

#### 静态网站部署

```bash
# Nginx 默认网站根目录
# CentOS: /usr/share/nginx/html
# Ubuntu: /var/www/html

# 部署静态网页
# CentOS
cp -r mywebsite/* /usr/share/nginx/html/

# Ubuntu
sudo cp -r mywebsite/* /var/www/html/
```

#### Nginx 配置文件结构

```bash
# 主配置文件
# CentOS: /etc/nginx/nginx.conf
# Ubuntu: /etc/nginx/nginx.conf

# 站点配置目录
# CentOS: /etc/nginx/conf.d/
# Ubuntu: /etc/nginx/sites-available/ 和 /etc/nginx/sites-enabled/

# 查看 Nginx 配置
vi /etc/nginx/nginx.conf
```

**核心配置结构：**

```nginx
# /etc/nginx/nginx.conf 核心结构

events {
    worker_connections 1024;    # 每个worker进程最大连接数
}

http {
    include       mime.types;    # 文件类型映射
    default_type  application/octet-stream;

    # 日志格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    sendfile        on;
    keepalive_timeout  65;

    # 加载站点配置
    include /etc/nginx/conf.d/*.conf;        # CentOS
    # include /etc/nginx/sites-enabled/*;     # Ubuntu
}
```

#### 配置反向代理

反向代理是 Nginx 最常用的功能之一：客户端访问 Nginx，Nginx 将请求转发到后端 Node.js 服务 [$TRAE_REF](https://juejin.cn/post/7599581687358930994)。

```nginx
# /etc/nginx/conf.d/myapp.conf (CentOS)
# 或 /etc/nginx/sites-available/myapp (Ubuntu，需 ln -s 到 sites-enabled/)

server {
    listen 80;
    server_name www.example.com;       # 域名或IP

    # 静态资源服务
    location / {
        root   /usr/share/nginx/html;   # 静态文件目录
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;  # SPA 前端路由支持
    }

    # 反向代理：将 /api 请求转发到 Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;    # 后端服务地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件缓存优化
    location ~* \.(jpg|jpeg|png|gif|css|js|ico)$ {
        root /usr/share/nginx/html;
        expires 30d;                          # 缓存30天
        add_header Cache-Control "public, no-transform";
    }

    # 错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

```bash
# 重新加载 Nginx 配置
nginx -t && nginx -s reload

# 或用 systemctl
systemctl reload nginx
```

#### 负载均衡配置

当后端有多个 Node.js 实例时，可以用 Nginx 做负载均衡：

```nginx
# 在 http 块中定义 upstream
upstream nodejs_backend {
    # 轮询（默认）
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;

    # 权重模式
    # server 127.0.0.1:3000 weight=3;
    # server 127.0.0.1:3001 weight=1;

    # IP 哈希（会话保持）
    # ip_hash;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://nodejs_backend;
    }
}
```

> `<Ubuntu差异>` Nginx 安装命令不同（`yum` vs `apt`），但配置文件语法完全一致。主要差异：
> - **站点配置目录：** CentOS 用 `/etc/nginx/conf.d/*.conf`，Ubuntu 用 `/etc/nginx/sites-available/` + `sites-enabled/`（通过软链接启用）。
> - **默认网站根目录：** CentOS 为 `/usr/share/nginx/html`，Ubuntu 为 `/var/www/html`。
> - **默认用户：** CentOS 的 Nginx worker 进程用户为 `nginx`，Ubuntu 为 `www-data`（配置文件中 `user` 指令不同）。

### 7.3 Node.js 项目部署

#### 安装 Node.js

```bash
# ===== CentOS =====
# 通过 NodeSource 安装指定版本（推荐）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum -y install nodejs

# ===== Ubuntu =====
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt -y install nodejs

# 验证（两种系统通用）
node -v    # v18.x.x
npm -v     # 9.x.x
```

#### 配置 npm 国内镜像

```bash
# 设置淘宝镜像加速下载
npm config set registry https://registry.npmmirror.com

# 验证
npm config get registry
```

#### 部署 Node.js 项目

```bash
# 1. 创建项目目录
mkdir -p /data/myapp
cd /data/myapp

# 2. 上传项目代码（或从 Git 拉取）
# git clone https://github.com/yourname/myapp.git

# 3. 安装依赖
npm install

# 4. 测试运行
node app.js
# 确认能正常启动后按 Ctrl+C 停止
```

#### 使用 PM2 管理进程

直接用 `node app.js` 运行的进程在终端关闭后会停止。生产环境推荐用 **PM2** 进程管理器：

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name "myapp"

# 常用命令
pm2 list              # 查看所有进程
pm2 show myapp        # 查看详情
pm2 logs myapp        # 查看日志
pm2 restart myapp     # 重启
pm2 stop myapp        # 停止
pm2 delete myapp      # 删除

# 设置开机自启
pm2 startup           # 生成启动脚本
pm2 save              # 保存当前进程列表

# 集群模式（利用多核CPU）
pm2 start app.js -i 4 --name "myapp"    # 启动4个进程
pm2 start app.js -i max --name "myapp"  # 按CPU核心数启动
```

**PM2 配置文件（ecosystem.config.js）：**

```javascript
// /data/myapp/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'myapp',
    script: 'app.js',
    instances: 2,           // 进程数
    exec_mode: 'cluster',   // 集群模式
    max_memory_restart: '500M',  // 内存超过500M自动重启
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/myapp/error.log',
    out_file: '/var/log/myapp/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
```

```bash
# 用配置文件启动
pm2 start ecosystem.config.js
```

> `<Ubuntu差异>` Node.js 安装和 PM2 用法完全通用。但需注意权限：Ubuntu 默认非 root 用户操作，全局安装 PM2 可能需 `sudo npm install -g pm2`，或配置 npm 全局目录到用户路径。

### 7.4 Redis 部署

Redis 是高性能的内存键值数据库，常用于缓存、Session 存储和消息队列。

#### 安装 Redis

```bash
# ===== CentOS =====
yum -y install redis
systemctl start redis
systemctl enable redis

# ===== Ubuntu =====
sudo apt -y install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

> ⚠️ **服务名差异：** CentOS 服务名为 `redis`，Ubuntu 服务名为 `redis-server`。

#### 基本使用

```bash
# 连接 Redis
redis-cli

# 基本操作
127.0.0.1:6379> set name "itheima"     # 设置键值
OK
127.0.0.1:6379> get name               # 获取值
"itheima"
127.0.0.1:6379> keys *                  # 查看所有键
1) "name"
127.0.0.1:6379> del name                # 删除键
(integer) 1
127.0.0.1:6379> expire name 60          # 设置过期时间60秒
127.0.0.1:6379> ttl name                # 查看剩余生存时间
127.0.0.1:6379> flushall                # 清空所有数据（危险！）
127.0.0.1:6379> exit                    # 退出
```

#### 配置远程访问

```bash
# 编辑配置文件
# CentOS: /etc/redis.conf
# Ubuntu: /etc/redis/redis.conf
vi /etc/redis.conf          # CentOS
sudo vi /etc/redis/redis.conf  # Ubuntu

# 修改以下配置：
bind 0.0.0.0              # 允许远程连接（默认127.0.0.1仅本地）
requirepass yourpassword  # 设置密码（生产环境必须设置）
port 6379                 # 端口

# 重启生效
systemctl restart redis          # CentOS
sudo systemctl restart redis-server  # Ubuntu
```

```bash
# 开放防火墙端口
# CentOS
firewall-cmd --permanent --add-port=6379/tcp
firewall-cmd --reload

# Ubuntu
sudo ufw allow 6379/tcp
```

> `<Ubuntu差异>` Redis 安装和服务名不同（见上），配置文件路径也不同：CentOS 为 `/etc/redis.conf`，Ubuntu 为 `/etc/redis/redis.conf`。其他操作命令通用。

### 7.5 综合实战：Web 项目全栈部署

将 Nginx、Node.js、MySQL、Redis 组合起来，完成一个完整的项目部署。

#### 部署流程

```bash
#!/bin/bash
# deploy.sh - Web 项目一键部署脚本
# 功能：部署 Nginx + Node.js + MySQL + Redis 全栈项目

set -e  # 遇到错误立即退出

APP_DIR="/data/myapp"
LOG_DIR="/var/log/myapp"

echo "===== 开始部署 Web 项目 ====="

# 1. 创建目录
echo "[1/6] 创建项目目录..."
mkdir -p "$APP_DIR"
mkdir -p "$LOG_DIR"

# 2. 检查并安装依赖服务
echo "[2/6] 检查服务状态..."
for svc in nginx mysqld redis; do
    if systemctl is-active --quiet "$svc" 2>/dev/null; then
        echo "  $svc 已运行"
    else
        echo "  $svc 未运行，尝试启动..."
        systemctl start "$svc" 2>/dev/null || echo "  警告：$svc 启动失败，请手动检查"
    fi
done

# 3. 拉取/更新项目代码
echo "[3/6] 部署项目代码..."
cd "$APP_DIR"
if [ -d ".git" ]; then
    git pull origin main
else
    echo "  请将项目代码上传到 $APP_DIR"
fi

# 4. 安装 Node.js 依赖
echo "[4/6] 安装 npm 依赖..."
npm install --production

# 5. 重启 Node.js 服务
echo "[5/6] 重启 Node.js 服务..."
pm2 restart myapp 2>/dev/null || pm2 start ecosystem.config.js
pm2 save

# 6. 重载 Nginx 配置
echo "[6/6] 重载 Nginx 配置..."
nginx -t && nginx -s reload

echo "===== 部署完成！ ====="
echo "访问地址：http://$(hostname -I | awk '{print $1}')"
echo "日志目录：$LOG_DIR"
```

#### 部署后验证清单

| 检查项 | 命令 | 预期结果 |
|--------|------|----------|
| Nginx 运行 | `systemctl status nginx` | active (running) |
| Node.js 进程 | `pm2 list` | myapp online |
| MySQL 连接 | `mysql -uroot -p -e "SELECT 1"` | 返回 1 |
| Redis 连接 | `redis-cli ping` | PONG |
| 端口监听 | `ss -tulnp \| grep -E '80\|3000\|3306\|6379'` | 四个端口都在监听 |
| 页面访问 | `curl http://localhost` | 返回 HTML |
| API 测试 | `curl http://localhost/api/health` | 返回 JSON |

> 💡 **生产环境建议：**
> - 使用 HTTPS（Let's Encrypt 免费证书 + Nginx SSL 配置）
> - 配置防火墙，仅开放必要端口（80/443/22）
> - 设置 MySQL 和 Redis 密码
> - 定期备份 MySQL（配合第六章的 crontab 脚本）
> - 使用 PM2 集群模式提高可用性
> - 配置 Nginx 日志轮转（logrotate）

---

## 第八章 云平台技术

> 云计算和容器化是现代 IT 基础设施的核心技术。本章介绍云计算基础概念、Docker 容器化部署和 Kubernetes 容器编排入门，为云原生应用部署打下基础。

### 8.1 云计算基础

#### 云计算服务模型

| 模型 | 全称 | 说明 | 典型产品 |
|------|------|------|----------|
| **IaaS** | 基础设施即服务 | 提供虚拟机、存储、网络等基础资源 | 阿里云ECS、AWS EC2、腾讯云CVM |
| **PaaS** | 平台即服务 | 提供运行环境、数据库、中间件 | 阿里云PaaS、Heroku、Google App Engine |
| **SaaS** | 软件即服务 | 提供可直接使用的应用软件 | 钉钉、企业微信、Office 365 |

#### 云计算部署模型

| 模型 | 说明 | 适用场景 |
|------|------|----------|
| **公有云** | 第三方提供，多租户共享 | 创业公司、互联网应用 |
| **私有云** | 企业自建，独享资源 | 政府、金融、大型企业 |
| **混合云** | 公有云+私有云组合 | 业务弹性扩展场景 |

#### 国内主流云平台

| 云平台 | 特点 | 适用场景 |
|--------|------|----------|
| **阿里云** | 国内市场份额第一，产品线最全 | 企业级应用、电商 |
| **腾讯云** | 社交/游戏生态强，性价比高 | 游戏、直播、社交 |
| **华为云** | 政企客户多，安全合规强 | 政务、大型企业 |
| **AWS中国** | 全球化部署，技术领先 | 跨国企业、出海业务 |

### 8.2 容器化技术概述

#### 什么是容器

容器是一种轻量级的虚拟化技术，将应用程序及其依赖打包到一个独立的、可移植的运行环境中。与虚拟机相比，容器共享宿主机内核，启动更快、资源占用更少。

#### 容器 vs 虚拟机

| 对比维度 | 虚拟机 (VM) | 容器 (Container) |
|----------|-------------|------------------|
| **虚拟化层级** | 硬件级虚拟化 | 操作系统级虚拟化 |
| **内核** | 每个VM有独立内核 | 共享宿主机内核 |
| **启动速度** | 分钟级 | 秒级 |
| **资源占用** | GB级 | MB级 |
| **隔离性** | 强（完全隔离） | 中等（进程级隔离） |
| **镜像大小** | GB级 | MB级 |
| **部署密度** | 单机几个 | 单机几十上百个 |
| **跨平台** | 需相同架构 | 需相同架构+内核 |

#### Docker 简介

Docker 是最流行的容器化平台，基于 Go 语言开发，遵循 Apache 2.0 协议开源。Docker 让开发者将应用及依赖打包到轻量级、可移植的容器中，实现"一次构建，到处运行" [$TRAE_REF](https://www.cnblogs.com/apanly/p/6983693.html)。

**Docker 三大核心概念：**

| 概念 | 类比 | 说明 |
|------|------|------|
| **镜像 (Image)** | 程序安装包 | 只读模板，包含应用运行所需的所有内容 |
| **容器 (Container)** | 运行中的程序 | 镜像的运行实例，可启动/停止/删除 |
| **仓库 (Registry)** | 应用商店 | 存储和分发镜像（如 Docker Hub） |

### 8.3 Docker 安装

#### CentOS 安装 Docker

官方推荐使用 Docker 的 yum/dnf 仓库安装 [$TRAE_REF](https://docs.docker.com/engine/install/centos/)：

```bash
# 1. 卸载旧版本
sudo dnf remove docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine

# 2. 安装 dnf 插件并添加 Docker 仓库
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 3. 安装 Docker Engine 及相关组件
sudo dnf install docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

# 4. 启动并设置开机自启
sudo systemctl enable --now docker

# 5. 验证安装
sudo docker run hello-world
```

> 💡 CentOS 7 使用 `yum` 替代 `dnf`，命令语法兼容。如果官方源慢，可替换为阿里云镜像源：`sudo dnf config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo`。

#### Ubuntu 安装 Docker

官方推荐使用 Docker 的 apt 仓库安装 [$TRAE_REF](https://docs.docker.com/engine/install/ubuntu/)：

```bash
# 1. 卸载旧版本
sudo apt remove docker.io docker-compose docker-compose-v2 docker-doc podman-docker

# 2. 安装依赖并添加 Docker 官方 GPG 密钥
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 3. 添加 Docker apt 仓库
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update

# 4. 安装 Docker Engine
sudo apt install docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

# 5. 验证安装
sudo docker run hello-world
```

#### 一键安装脚本（快速方式）

两种系统均可使用 Docker 官方一键脚本，适合开发测试环境：

```bash
# 下载并执行安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker（RPM系需手动启动，DEB系自动启动）
sudo systemctl enable --now docker
```

#### 配置非 root 用户使用 Docker

默认只有 root 用户能执行 docker 命令，将普通用户加入 docker 组即可免 sudo：

```bash
# 将当前用户加入 docker 组
sudo usermod -aG docker $USER

# 重新登录后生效，或执行：
newgrp docker

# 验证（无需 sudo）
docker run hello-world
```

#### 配置国内镜像加速

```bash
# 创建/编辑 Docker 配置文件
sudo vi /etc/docker/daemon.json

# 添加国内镜像源
{
    "registry-mirrors": [
        "https://docker.1panel.live",
        "https://docker.m.daocloud.io",
        "https://dockerproxy.com"
    ]
}

# 重启 Docker 生效
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A 5 "Registry Mirrors"
```

> `<Ubuntu差异>` Docker 安装方式不同（CentOS 用 `dnf/yum`，Ubuntu 用 `apt`），但安装后用法完全一致。两种系统都需要将用户加入 docker 组才能免 sudo 运行。

### 8.4 Docker 核心概念

#### 镜像 (Image)

镜像是 Docker 容器的只读模板，包含运行应用所需的代码、库、环境变量和配置文件。

```
# 镜像采用分层存储结构
┌─────────────────────┐
│  应用代码层 (可写)    │  ← 容器运行时新增的可写层
├─────────────────────┤
│  npm 依赖层          │  ← 构建时添加
├─────────────────────┤
│  Node.js 运行时层    │  ← FROM node:18
├─────────────────────┤
│  Ubuntu 基础层       │  ← 基础镜像
└─────────────────────┘
```

#### 容器 (Container)

容器是镜像的运行实例。每个容器相互隔离，拥有自己的文件系统、网络和进程空间。

```
镜像 (Image)          容器 (Container)
┌──────────┐  docker run   ┌──────────┐
│  只读模板 │ ────────────→ │ 运行实例  │
│  (静态)   │               │  (动态)   │
└──────────┘               └──────────┘
                           ↓ docker stop
                           ┌──────────┐
                           │ 停止的容器 │
                           └──────────┘
```

#### 仓库 (Registry)

仓库是存储和分发镜像的服务。Docker Hub 是最大的公共仓库，企业可搭建私有仓库（Harbor）。

### 8.5 Docker 常用命令

#### 镜像命令

```bash
# 搜索镜像
docker search nginx

# 拉取镜像（默认从 Docker Hub）
docker pull nginx:latest        # 指定版本
docker pull nginx               # 默认 latest

# 列出本地镜像
docker images
docker image ls

# 删除镜像
docker rmi nginx:latest          # 按名称删除
docker rmi $(docker images -q)   # 删除所有镜像

# 构建镜像
docker build -t myapp:1.0 .      # -t 指定名称和标签，. 表示当前目录

# 查看镜像详情
docker inspect nginx:latest

# 清理未使用的镜像
docker image prune -a
```

#### 容器命令

```bash
# 创建并启动容器
docker run [选项] 镜像名 [命令]

# 常用选项
docker run -d \                   # -d 后台运行
    --name mynginx \               # --name 指定容器名
    -p 8080:80 \                   # -p 端口映射（宿主机:容器）
    -v /data/html:/usr/share/nginx/html \  # -v 挂载目录（宿主机:容器）
    -e ENV_KEY=value \             # -e 设置环境变量
    --restart=always \             # --restart 重启策略
    nginx:latest

# 列出容器
docker ps              # 运行中的容器
docker ps -a           # 所有容器（包括已停止）

# 容器管理
docker start mynginx     # 启动容器
docker stop mynginx      # 停止容器
docker restart mynginx   # 重启容器
docker kill mynginx      # 强制停止
docker rm mynginx        # 删除容器（需先停止）
docker rm -f mynginx     # 强制删除运行中的容器

# 查看容器日志
docker logs mynginx             # 查看全部日志
docker logs -f mynginx          # 持续跟踪日志（类似 tail -f）
docker logs --tail 100 mynginx  # 查看最后100行

# 进入容器
docker exec -it mynginx bash     # 进入容器终端（推荐）
docker exec -it mynginx sh       # 镜像无 bash 时用 sh

# 查看容器详情
docker inspect mynginx

# 查看容器资源占用
docker stats                    # 所有容器实时资源
docker stats mynginx            # 指定容器

# 在容器内执行命令
docker exec mynginx ls /etc/nginx
```

#### 实战：部署 Nginx 容器

```bash
# 拉取 Nginx 镜像
docker pull nginx

# 启动 Nginx 容器
docker run -d \
    --name mynginx \
    -p 8080:80 \
    -v /data/nginx/html:/usr/share/nginx/html \
    -v /data/nginx/conf:/etc/nginx/conf.d \
    --restart=always \
    nginx:latest

# 访问测试
curl http://localhost:8080

# 查看日志
docker logs -f mynginx

# 进入容器
docker exec -it mynginx bash

# 停止并删除
docker stop mynginx && docker rm mynginx
```

#### 实战：部署 MySQL 容器

```bash
docker run -d \
    --name mysql \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=MyPass123! \
    -e MYSQL_DATABASE=mydb \
    -e MYSQL_USER=appuser \
    -e MYSQL_PASSWORD=AppPass456! \
    -v /data/mysql/data:/var/lib/mysql \
    --restart=always \
    mysql:8.0

# 连接测试
docker exec -it mysql mysql -uroot -p
```

#### 实战：部署 Redis 容器

```bash
docker run -d \
    --name redis \
    -p 6379:6379 \
    -v /data/redis:/data \
    --restart=always \
    redis:7 redis-server --requirepass "RedisPass789!"
```

### 8.6 Dockerfile

Dockerfile 是一个文本文件，包含一系列指令，用于自动构建 Docker 镜像。

#### 常用指令

| 指令 | 作用 | 示例 |
|------|------|------|
| `FROM` | 基础镜像（必须为第一条指令） | `FROM node:18-alpine` |
| `WORKDIR` | 设置工作目录 | `WORKDIR /app` |
| `COPY` | 复制文件到镜像 | `COPY . /app` |
| `RUN` | 构建时执行命令 | `RUN npm install` |
| `ENV` | 设置环境变量 | `ENV NODE_ENV=production` |
| `EXPOSE` | 声明端口（仅声明，不映射） | `EXPOSE 3000` |
| `CMD` | 容器启动时默认命令 | `CMD ["node", "app.js"]` |
| `ENTRYPOINT` | 容器启动入口命令 | `ENTRYPOINT ["node"]` |
| `ARG` | 构建时变量 | `ARG VERSION=1.0` |
| `VOLUME` | 声明挂载点 | `VOLUME /data` |

#### Node.js 项目 Dockerfile 示例

```dockerfile
# Dockerfile - Node.js 应用
# ===== 构建阶段 =====
FROM node:18-alpine AS builder

WORKDIR /app

# 先复制 package.json，利用 Docker 缓存层加速构建
COPY package*.json ./
RUN npm install --production

# 复制源代码
COPY . .

# ===== 运行阶段（多阶段构建减小镜像体积）=====
FROM node:18-alpine

WORKDIR /app

# 从构建阶段复制 node_modules 和源码
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 声明端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --no-check-certificate --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "app.js"]
```

#### 构建与运行

```bash
# 构建镜像（-t 名称:标签，. 表示当前目录）
docker build -t myapp:1.0 .

# 运行容器
docker run -d \
    --name myapp \
    -p 3000:3000 \
    --restart=always \
    myapp:1.0

# 查看镜像大小
docker images myapp:1.0

# 查看镜像构建历史（分层）
docker history myapp:1.0
```

#### .dockerignore 文件

类似 .gitignore，排除不需要的文件，减小构建上下文体积：

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
*.md
test
coverage
```

### 8.7 Docker Compose

Docker Compose 用于定义和运行多容器 Docker 应用。通过一个 YAML 文件配置所有服务，一条命令启动整个应用栈。

#### docker-compose.yml 示例

```yaml
# docker-compose.yml - 全栈应用部署
version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/html:/usr/share/nginx/html
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - app
    restart: always
    networks:
      - frontend

  # Node.js 应用
  app:
    build: ./myapp           # 从 Dockerfile 构建
    container_name: nodeapp
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    restart: always
    networks:
      - frontend
      - backend

  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: RootPass123!
      MYSQL_DATABASE: mydb
      MYSQL_USER: appuser
      MYSQL_PASSWORD: AppPass456!
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d  # 初始化SQL
    ports:
      - "3306:3306"
    restart: always
    networks:
      - backend

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: redis
    command: redis-server --requirepass RedisPass789!
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: always
    networks:
      - backend

# 数据卷
volumes:
  mysql_data:
  redis_data:

# 网络
networks:
  frontend:
  backend:
```

#### Docker Compose 常用命令

```bash
# 启动所有服务（后台运行）
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f          # 所有服务
docker compose logs -f app      # 指定服务

# 停止并删除容器、网络
docker compose down

# 停止但保留容器
docker compose stop

# 重新构建并启动
docker compose up -d --build

# 重启某个服务
docker compose restart app

# 进入容器
docker compose exec app bash

# 查看服务配置
docker compose config
```

> `<Ubuntu差异>` Docker 和 Docker Compose 在 CentOS/Ubuntu 上完全通用，命令和配置文件语法一致。差异仅在安装方式。

### 8.8 Kubernetes 基础

Kubernetes（简称 K8s）是 Google 开源的容器编排平台，用于自动部署、扩展和管理容器化应用。当容器数量增多、需要跨多台服务器管理时，K8s 是行业标准 [$TRAE_REF](https://cloud.tencent.com/developer/article/2597063)。

#### K8s 架构概览

```
┌───────────────────────────────────────────────────────┐
│                  Kubernetes 集群                        │
│                                                       │
│  ┌─────────────────┐    ┌──────────────────────────┐  │
│  │   Master 节点    │    │      Worker 节点 1        │  │
│  │  (控制平面)      │    │  ┌──────┐  ┌──────┐     │  │
│  │                 │    │  │ Pod1  │  │ Pod2  │     │  │
│  │  • API Server   │    │  │nginx  │  │app    │     │  │
│  │  • Scheduler    │    │  └──────┘  └──────┘     │  │
│  │  • Controller   │    └──────────────────────────┘  │
│  │  • etcd         │                                 │
│  └─────────────────┘    ┌──────────────────────────┐  │
│                         │      Worker 节点 2        │  │
│                         │  ┌──────┐  ┌──────┐     │  │
│                         │  │ Pod3  │  │ Pod4  │     │  │
│                         │  │mysql  │  │redis  │     │  │
│                         │  └──────┘  └──────┘     │  │
│                         └──────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

#### K8s 核心组件

**Master 节点（控制平面）：**

| 组件 | 作用 |
|------|------|
| **API Server** | 集群入口，所有操作通过 API Server 进行 |
| **Scheduler** | 调度器，决定 Pod 运行在哪个节点 |
| **Controller Manager** | 控制器，维护集群状态（如自动重启故障 Pod） |
| **etcd** | 分布式键值存储，保存集群所有配置和状态数据 |

**Worker 节点：**

| 组件 | 作用 |
|------|------|
| **kubelet** | 节点代理，管理本节点 Pod 的生命周期 |
| **kube-proxy** | 网络代理，负责 Service 的负载均衡和流量转发 |
| **容器运行时** | 运行容器的引擎（containerd / Docker） |

#### K8s 四大核心概念

以下概念解析基于腾讯云开发者社区的技术文章 [$TRAE_REF](https://cloud.tencent.com/developer/article/2597063)。

**1. Pod - 最小部署单元**

Pod 是 K8s 中最小的可部署计算单元，包含一个或多个紧密关联的容器。同一 Pod 内的容器共享网络和存储，始终调度到同一节点。

```yaml
# pod-nginx.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
    resources:
      limits:
        memory: "256Mi"
        cpu: "500m"
      requests:
        memory: "128Mi"
        cpu: "250m"
```

**2. Service - 稳定访问入口**

Pod 的 IP 是临时的（重启后变化），Service 提供固定的访问地址和负载均衡，通过标签选择器关联一组 Pod。

```yaml
# service-nginx.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort          # 类型：ClusterIP(默认)/NodePort/LoadBalancer
  selector:
    app: nginx            # 关联标签为 app=nginx 的 Pod
  ports:
  - port: 80              # Service 端口
    targetPort: 80        # Pod 端口
    nodePort: 30080       # 节点端口（NodePort 类型，范围30000-32767）
```

**Service 类型对比：**

| 类型 | 访问范围 | 说明 |
|------|----------|------|
| ClusterIP | 集群内部 | 默认类型，生成集群内虚拟 IP |
| NodePort | 集群外部 | 在每个节点开放端口，`节点IP:NodePort` 访问 |
| LoadBalancer | 公网 | 结合云厂商负载均衡器，分配公网 IP |
| ExternalName | 外部域名 | 将 Service 映射到外部 DNS 名称 |

**3. Deployment - 声明式管理**

Deployment 管理 Pod 的副本集，支持滚动更新、回滚、扩缩容。开发者声明期望状态，K8s 自动维持。

```yaml
# deployment-nginx.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3              # 期望副本数
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate    # 滚动更新策略
    rollingUpdate:
      maxSurge: 1          # 滚动更新时最多多出1个Pod
      maxUnavailable: 1    # 滚动更新时最多不可用1个Pod
  template:                # Pod 模板
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "250m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
```

**4. Ingress - HTTP 统一入口**

Ingress 是集群的 HTTP/HTTPS 入口网关，通过域名和路径路由规则将外部请求转发到对应 Service，支持 SSL 终止。

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: api.example.com          # 域名
    http:
      paths:
      - path: /                    # 路径
        pathType: Prefix
        backend:
          service:
            name: nginx-service    # 转发到的 Service
            port:
              number: 80
```

#### 四大组件协同流程

```
开发者 → 创建 Deployment → 管理 ReplicaSet → 管理 Pod（运行容器）
                                    ↓
              创建 Service → 关联 Pod（标签选择器）→ 提供稳定访问
                                    ↓
              创建 Ingress → 关联 Service → 对外暴露 HTTP 入口
```

- **Deployment** 保障 Pod 的"数量稳定"和"版本可控"
- **Service** 保障 Pod 的"访问稳定"
- **Ingress** 保障外部访问的"统一高效"
- **Pod** 是承载应用运行的最终载体

### 8.9 kubectl 常用命令

kubectl 是 K8s 命令行工具，用于与集群交互。

#### 基础命令

```bash
# 集群信息
kubectl cluster-info              # 查看集群信息
kubectl get nodes                 # 查看节点
kubectl get nodes -o wide         # 查看节点详情

# 资源查看
kubectl get pods                  # 查看 Pod
kubectl get pods -o wide          # Pod 详情（含IP、节点）
kubectl get pods --all-namespaces # 所有命名空间的 Pod
kubectl get svc                   # 查看 Service
kubectl get deployment            # 查看 Deployment
kubectl get all                   # 查看所有资源

# 详情查看
kubectl describe pod nginx-pod    # 查看 Pod 详情（排查问题常用）
kubectl describe svc nginx-service

# 日志查看
kubectl logs nginx-pod            # 查看 Pod 日志
kubectl logs -f nginx-pod         # 持续跟踪日志
kubectl logs nginx-pod --previous # 查看上次崩溃的日志

# 进入容器
kubectl exec -it nginx-pod -- bash
kubectl exec -it nginx-pod -- sh
```

#### 部署与管理

```bash
# 部署/更新资源（从 YAML 文件）
kubectl apply -f deployment-nginx.yaml
kubectl apply -f service-nginx.yaml

# 删除资源
kubectl delete -f deployment-nginx.yaml
kubectl delete pod nginx-pod
kubectl delete deployment nginx-deployment

# 扩缩容
kubectl scale deployment nginx-deployment --replicas=5   # 扩容到5个副本
kubectl scale deployment nginx-deployment --replicas=2   # 缩容到2个

# 滚动更新
kubectl set image deployment/nginx-deployment nginx=nginx:1.22

# 查看更新状态
kubectl rollout status deployment/nginx-deployment

# 回滚
kubectl rollout undo deployment/nginx-deployment              # 回滚到上一版本
kubectl rollout undo deployment/nginx-deployment --to-revision=2  # 回滚到指定版本

# 查看历史版本
kubectl rollout history deployment/nginx-deployment
```

#### 标签与选择器

```bash
# 给 Pod 打标签
kubectl label pod nginx-pod env=production

# 按标签筛选
kubectl get pods -l app=nginx
kubectl get pods -l env=production

# 删除标签
kubectl label pod nginx-pod env-
```

### 8.10 后续学习路线

#### 常用命令速查表

| 分类 | 命令 | 功能 | CentOS/Ubuntu |
|------|------|------|---------------|
| Docker镜像 | `docker pull nginx` | 拉取镜像 | 通用 |
| Docker镜像 | `docker images` | 列出镜像 | 通用 |
| Docker镜像 | `docker build -t name .` | 构建镜像 | 通用 |
| Docker镜像 | `docker rmi 镜像ID` | 删除镜像 | 通用 |
| Docker容器 | `docker run -d --name c -p 80:80 nginx` | 启动容器 | 通用 |
| Docker容器 | `docker ps -a` | 列出容器 | 通用 |
| Docker容器 | `docker logs -f 容器名` | 查看日志 | 通用 |
| Docker容器 | `docker exec -it 容器名 bash` | 进入容器 | 通用 |
| Docker容器 | `docker stop/rm 容器名` | 停止/删除 | 通用 |
| Compose | `docker compose up -d` | 启动服务栈 | 通用 |
| Compose | `docker compose down` | 停止删除 | 通用 |
| Compose | `docker compose logs -f` | 查看日志 | 通用 |
| K8s | `kubectl get pods` | 查看 Pod | 通用 |
| K8s | `kubectl apply -f file.yaml` | 部署资源 | 通用 |
| K8s | `kubectl describe pod 名称` | 查看 Pod 详情 | 通用 |
| K8s | `kubectl logs pod名称` | 查看日志 | 通用 |
| K8s | `kubectl scale deploy 名称 --replicas=N` | 扩缩容 | 通用 |
| K8s | `kubectl rollout undo deploy 名称` | 回滚 | 通用 |

#### 进阶学习方向

| 方向 | 内容 | 推荐资源 |
|------|------|----------|
| **Docker 进阶** | 网络模型、数据卷、安全、镜像优化 | [Docker 官方文档](https://docs.docker.com/) |
| **Docker Compose** | 多服务编排、环境隔离、CI/CD 集成 | [Compose 文档](https://docs.docker.com/compose/) |
| **K8s 进阶** | ConfigMap/Secret、StatefulSet、DaemonSet、HPA | [K8s 官方文档](https://kubernetes.io/zh-cn/docs/) |
| **K8s 集群搭建** | kubeadm 部署、生产级集群 | [kubeadm 文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/) |
| **CI/CD** | Jenkins、GitLab CI、GitHub Actions | 实践项目 |
| **服务网格** | Istio、Linkerd | 云原生进阶 |
| **监控告警** | Prometheus + Grafana | 运维监控体系 |

#### 学习建议

- **多练习：** 命令行操作需要反复练习才能熟练掌握
- **勤做笔记：** 记录常用命令和参数，便于查阅
- **善用帮助：** `man 命令名`、`命令名 --help`、`docker --help`、`kubectl --help`
- **理解原理：** 不仅会用命令，还要理解背后的原理
- **安全意识：** 谨慎使用 `rm -rf`、`chmod 777`、`docker rm -f` 等危险操作
- **对照学习：** 同时了解 CentOS 与 Ubuntu 的差异，加深对 Linux 体系的理解
- **实践优先：** 搭建虚拟机环境，按笔记中的命令逐一实操
- **容器思维：** 从传统部署向容器化部署转变，理解"不可变基础设施"理念

---

> 📖 **参考资料：**
> - [CSDN博客 - Linux笔记](https://blog.csdn.net/u011005040/article/details/127836760)
> - [Docker 官方文档 - CentOS 安装](https://docs.docker.com/engine/install/centos/)
> - [Docker 官方文档 - Ubuntu 安装](https://docs.docker.com/engine/install/ubuntu/)
> - [K8s 核心概念解析](https://cloud.tencent.com/developer/article/2597063)
>
> 📅 整理时间：2026年7月 | 本笔记为学习整理，命令和操作请在理解基础上使用
>
