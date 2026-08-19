# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-release] - 2026-06-23

### Added
- 禁止末影人搬运墓碑方块

### Fixed
- 修复手持钥匙传送至墓碑时消耗的经济不正确问题

### Changed
- 优化玩家死亡在末地主岛时墓碑避免被末影龙破坏的问题，现在在末地主岛范围内死亡时不会掉落物品和生成墓碑

## [1.9.9-beta] - 2025-9-16

### Fixed
- 修复当未找到可用空间时未清除背包的问题

## [1.9.8-beta] - 2025-9-5

### Fixed
- 修复当设置掉落经验但掉落比例为0时仍然扣除经验并且依然生成经验球导致的刷经验问题

## [1.9.7-beta] - 2025-7-30

### Changed
- 在 `onPlayerDie` 事件监听内增加 try catch
- 在玩家死在末地主岛范围内时不生成墓碑也不掉落物品（暂时解决末影龙破坏墓碑问题）

## [1.9.6-beta] - 2025-7-27

### Changed
- 在执行 `grave clean` 命令时打印信息增加清理序号、墓碑位置和归属人详细信息
- 在执行 `grave query` 命令时普通玩家只能查询自己的墓碑、管理员和控制台可以查询所有玩家墓碑

## [1.9.5-beta] - 2025-7-26

### Added
- 完成 `/grave back` 命令（支持消耗钥匙/金币、跨维度传送等配置）
- 完成 `/grave query` 命令（查询已加载墓碑数据）
- 玩家死亡是否生成墓碑、死亡是否掉落经验、经验掉落比例、钥匙传送功能支持多维度独立配置
- 硬编码的DIMIDS常量修改为动态生成维度名称到ID的映射

### Fixed
- 修复在控制台执行命令 `grave clean` 和 `grave reload` 时引发的报错

## [1.9.4-dev] - 2025-7-26

### Added
- 玩家破坏墓碑后从计时管理系统自动移除
- 墓碑被清理时添加清理源以及原因记录（系统/管理员）
- `/grave clean` 命令实现

### Changed
- 根据配置文件启用/禁用墓碑有效期检查和自动清理
- 优化（简化）部分核心代码逻辑

### Fixed
- 修复计时系统初始化问题（自动管理所有已加载墓碑实体）
- 解决新增墓碑实体无法加入计时系统的问题

## [1.9.3-dev] - 2025-7-25

### Added
- 玩家/管理员开启墓碑时添加控制台日志记录
- 墓碑清理时添加控制台操作日志

### Changed
- 优化 `mc.getEntities` 参数处理逻辑
- 死亡高度超出维度限制时不再生成墓碑（并且不掉落物品）

## [1.9.2-dev] - 2025-7-24

### Added
- 注册 `/grave reload` 命令（管理员热重载配置）
- 注册 `/grave gg` 命令（管理员模拟玩家死亡）
- 注册 `/grave back` 命令（玩家消耗钥匙+金币传送）
- 注册 `/grave clean` 命令（管理员清理所有墓碑）
- 注册 `/grave query` 命令（管理员/玩家查询墓碑数据）

## [1.9.1-dev] - 2025-7-23

### Added
- `getItemLockMode` 函数实现
- `getItemIsKeepOnDeath` 函数实现

### Changed
- 玩家死亡时保留具有"死亡不掉落"和"锁定模式"的物品
- 具有特殊标签的物品不再存入墓碑

## [1.9.0] - 2025-7-22

### Added
- `onServerStarted` 事件中实现钥匙检测逻辑
- `breakGrave` 函数核心实现
- `searchAvailableSpace` 函数（支持虚空/海洋/岩浆湖检测）
- 墓碑实体防爆机制（Addon实现）
- 墓碑方块防爆机制（Addon实现）
- 墓碑防推机制（基岩原生特性，需开启实验玩法中的`即将推出的创作者功能`选项 或者将存档nbt内实验性标签内添加`upcoming_creator_features`字节型标签并设置为1）
- 墓碑防吸机制（物品存储在实体内部，无法被吸出）

### Fixed
- 修复钥匙持有者正常破坏墓碑的权限验证

## [2.0.1] - 2026-8-19

### Added
- 注册 `/grave drop` 命令（玩家使自己的所有墓碑掉落其中物品）

<!-- 下载链接 -->
[1.9.6-beta]: https://www.minebbs.com/resources/b-grave-b-tombstone.12439/
