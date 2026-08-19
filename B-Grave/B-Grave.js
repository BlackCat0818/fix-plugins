// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE-API/dts/helperlib/src/index.d.ts"/> 


const pluginName = "B-Grave";
ll.registerPlugin(
    /* name */ pluginName,
    /* introduction */ `${pluginName} - 全新重构版本墓碑插件`,
    /* version */[2, 0, 0, Version.Release],
    /* otherInformation */{ "发布地址": "https://www.minebbs.com/resources/authors/forget.132107/" }
);

const debugMode = false; // 调试模式，生产环境下不推荐开启
const devMode = false; // 开发者模式，生产环境下不推荐开启
const testersList = [ // 测试人员玩家名称列表
    "Steve",
    "Alex"
];

logger.setLogLevel(debugMode ? 5 : 4);

const graveConfig = new JsonConfigFile(`./plugins/${pluginName}/config/graveConfig.json`, JSON.stringify(
    {
        "whiteListItems": [ // 物品白名单列表
            "minecraft:elytra",
            "minecraft:firework_rocket",
            "ed:ball",
            "ed:ball_1",
            "minecraft:bundle",
            "minecraft:white_bundle",
            "minecraft:light_gray_bundle",
            "minecraft:gray_bundle",
            "minecraft:black_bundle",
            "minecraft:brown_bundle",
            "minecraft:red_bundle",
            "minecraft:orange_bundle",
            "minecraft:yellow_bundle",
            "minecraft:lime_bundle",
            "minecraft:green_bundle",
            "minecraft:cyan_bundle",
            "minecraft:light_blue_bundle",
            "minecraft:blue_bundle",
            "minecraft:purple_bundle",
            "minecraft:magenta_bundle",
            "minecraft:pink_bundle"
        ],
        "admins": [ // 墓碑管理员玩家名列表，墓碑管理员可以无需钥匙打开任何人的墓碑
            "Steve",
            "Alex"
        ],
        "searchAvailableSpaceMode": "sphere", // 查找以玩家死亡位置为中心一定范围内的可用空间，支持 sphere 球体 | cube 矩形体
        "searchAvailableSpaceRadius": 8, // 查找以玩家死亡位置为中心指定半径的球体或矩形体的范围内的可用空间，推荐值 5 ~ 10，不建议过小或过大
        "effectiveDuration": 20, // 墓碑有效时间，超过这个时间墓碑自动销毁并生成掉落物，设置为-1则墓碑永远不会被自动清理，单位：分钟，推荐值：5 ~ 30，不建议过小或过大
        "allowChangeDimTp": true, // 手持钥匙传送至墓碑时允许跨维度传送
        "tpGraveConsumesKey": false, // grave back 后是否消耗钥匙
        "dropGraveBlock": true, // 开启墓碑后是否掉落墓碑方块
        "economicConfig": { // 经济系统
            "type": "llmoney", // 经济类型，llmoney | scoreboard
            "scoreboardName": "money", // 经济计分板名称，仅在 type 为 scoreboard 时有效
            "tpGraveNeedMoney": true, // 传送至墓碑时是否需要消耗经济
            "calculationMethod": "deathcount", // 消耗经济的计算类型：填写指定数字 为固定数额 | 填写数组 为随机 | 填写 "deathcount"为死亡榜 | distance为距离
            "needMoneyRandomRange": [
                10,
                100
            ],
            "deathCountScoreboard": "deathcount", // 玩家死亡榜计分板名称，仅在 calculationMethod 为 "deathcount" 时有效
            "doubleThePriceWhenAllowChangeDimTp": true // 跨维度传送时是否价格翻倍
        },
        "dimensionConfig": { // 维度配置，支持自定义维度
            "over_world": { // 维度标准类型名
                "dimid": 0, // 维度id
                "dim": "主世界", // 维度名称
                "height": { // 维度可用高度
                    "minY": -64, // 维度最小高度
                    "maxY": 320 // 维度最大高度
                },
                "generateGrave": true,
                "allowUseKeyTpToGrave": true,
                "dropXpOrb": true,
                "dropExpPercent": 30
            },
            "the_nether": {
                "dimid": 1,
                "dim": "下界",
                "height": {
                    "minY": 0,
                    "maxY": 128
                },
                "generateGrave": true,
                "allowUseKeyTpToGrave": true,
                "dropXpOrb": true,
                "dropExpPercent": 30
            },
            "the_end": {
                "dimid": 2,
                "dim": "末地",
                "height": {
                    "minY": 0,
                    "maxY": 256
                },
                "generateGrave": true,
                "allowUseKeyTpToGrave": true,
                "dropXpOrb": true,
                "dropExpPercent": 30
            }
        }
    }, null, 4
));

// 全局墓碑管理对象
const graveManager = {
    graves: new Map(), // 存储墓碑信息：key为实体uniqueId，value为创建时间戳
    timer: null,      // 计时器对象
    GRAVE_TIMEOUT: 60 * 1000 * getGraveConfig("effectiveDuration"), // 10分钟（毫秒）

    /**
     * 添加新墓碑
     * @param {Entity} graveEntity 
     */
    addGrave(graveEntity) {
        this.graves.set(graveEntity.uniqueId, Date.now());
    },

    /**
     * 移除墓碑
     * @param {Entity} graveEntity 
     */
    removeGrave(graveEntity) {
        this.graves.delete(graveEntity.uniqueId);
    },

    // 清理过期墓碑
    cleanExpiredGraves() {
        const now = Date.now();
        for (const [uniqueId, createTime] of this.graves) {
            if (now - createTime > this.GRAVE_TIMEOUT) {
                const graveEntity = mc.getEntity(Number(uniqueId));
                if (graveEntity) cleanSingleGrave(graveEntity, "墓碑过期");

                this.graves.delete(uniqueId);
            }
        }
    },

    // 初始化计时系统
    initTimer() {
        this.timer = setInterval(() => {
            // 扫描并添加已加载的墓碑
            const entities = mc.getAllEntities().filter(en => en && en.type === graveEntityTypeName);
            for (const graveEntity of entities) {
                if (!this.graves.has(graveEntity.uniqueId)) {
                    this.addGrave(graveEntity);
                }
            }
            this.cleanExpiredGraves();
        }, 1000 * 60); // 每分钟检查一次
    },

    // 服务器启动时初始化
    initOnServerStart() {
        // 清理现有计时器
        if (this.timer) clearInterval(this.timer);

        // 扫描并添加已加载的墓碑
        const entities = mc.getAllEntities().filter(en => en && en.type === graveEntityTypeName);
        for (const graveEntity of entities) {
            this.addGrave(graveEntity);
        }

        // 启动计时器
        this.initTimer();
    }
};

/**
 * 获取配置文件中的某个键的值
 * @param {string} key 
 */
function getGraveConfig(key) {
    try {
        return JSON.parse(graveConfig.read())[key] || graveConfig.get(key, null);
    } catch (error) {
        logError("getGraveConfig", error);
        return false;
    }
}

/**
 * 获取服务器设置
 */
function getServerConfig() {
    return File.readFrom("./server.properties")
        ?.replace(/#(.*)\n/g, "")
        ?.split("\n")
        ?.filter(str => str.trim() != "")
        ?.reduce((obj, line) => ({ ...obj, [line.split("=")[0].trim()]: line.split("=")[1].trim() }), {})
}

const levelName = getServerConfig()["level-name"]; // 获取存档名称
const resource_packs_path = `./worlds/${levelName}/resource_packs/`; // 资源包目录
const behavior_packs_path = `./worlds/${levelName}/behavior_packs/`; // 行为包目录
const world_resource_packs_json_path = `./worlds/${levelName}/world_resource_packs.json`;
const world_behavior_packs_json_path = `./worlds/${levelName}/world_behavior_packs.json`;
// 目标UUID
const RESOURCE_PACK_UUID = "b17af4d5-486d-480e-8d1f-f864c9a33a20";
const BEHAVIOR_PACK_UUID = "0db99973-12b3-4c67-abbb-90e4726e73e1";

// 墓碑方块列表
const graveBlockTypeNames = [
    "effect99:grave",
    "effect99:wooden_grave",
    "effect99:stone_grave",
    "effect99:stone_slab_grave",
    "effect99:stone_cross_grave",
    "effect99:blackstone_grave",
    "effect99:golden_blackstone_grave",
    "effect99:golden_cross_netherite_grave",
    "effect99:golden_netherite_grave"
];

const graveEntityTypeName = "entity:grave_inventory";

const graveKeyTypeName = "effect99:key";

// 动态生成维度名称到ID的映射
const DIMIDS = (function () {
    const defaultDimMap = {
        "主世界": 0,
        "下界": 1,
        "末地": 2
    };
    try {
        const dimensionConfig = getGraveConfig("dimensionConfig");
        if (!dimensionConfig) return defaultDimMap;

        const dimMap = {};
        for (const key in dimensionConfig) {
            const config = dimensionConfig[key];
            dimMap[config.dim] = config.dimid; // 使用维度名称作为键，维度ID作为值
        }
        return dimMap;
    } catch (error) {
        logError("生成DIMIDS时出错，使用默认配置", error);
        // 出错时返回默认值
        return defaultDimMap;
    }
})();

function sendGraveInfoToPlayerActionbar() {
    try {
        const onlinePlayers = mc.getOnlinePlayers().filter(p => !p.isSimulatedPlayer());
        if (onlinePlayers.length <= 0) return;

        onlinePlayers.forEach(player => { // 主副手持钥匙显示墓碑信息

            //const block = player.getBlockFromViewVector(false, false, 5, false);
            //player.sendText(`方块名称：${block?.name}\n${Format.Clear}方块类型名：${block?.type}\n\n`, 5); // ${block.getNbt()}\n${block.getNbt().toSNBT(4)}

            /*
            // 距离测试，欧几里得距离公式更准确：calculateDistance3D 函数
            const testPos = new IntPos(-21, -60, 1, 0);
            const distance1 = player.distanceTo(testPos);
            const distance3 = calculateDistance3D(player.blockPos.x, player.blockPos.y, player.blockPos.z, testPos.x, testPos.y, testPos.z);
            player.sendText(`distance1 : ${distance1}\ndistance3 : ${distance3}\nspeed : ${player.speed}\n\n\n`, 5);
            */

            // 相同维度和不同维度：位置，距离等等...
            const mainHandItem = player.getHand();
            const offHandItem = player.getOffHand();

            const pos = player.blockPos;

            // 检查主手或副手是否为钥匙
            const graveKey = [mainHandItem, offHandItem].find(item =>
                !item.isNull() && item.type === graveKeyTypeName
            );
            if (graveKey) {
                /*
                const newLore = [
                    `§r§9墓碑位置: §c${x}, ${y}, ${z}`,
                    `§r§8${pos.dim}`
                ];
                */
                const lore = graveKey.lore || [];

                if (lore.length >= 2) {

                    const graveLocation = lore[0].split(":")[1].trim().replace(/§[a-zA-Z0-9]/g, '').split(",");
                    const graveX = parseInt(graveLocation[0].trim());
                    const graveY = parseInt(graveLocation[1].trim());
                    const graveZ = parseInt(graveLocation[2].trim());
                    const graveDim = lore[1].replace(/§[a-zA-Z0-9]/g, '');
                    const graveDimid = DIMIDS[graveDim];

                    const distance = calculateDistance3D(pos.x, pos.y, pos.z, graveX, graveY, graveZ);

                    if (pos.dimid === graveDimid) {
                        const speed = Number(player.speed.toFixed(2));
                        const needTime = speed !== 0 ? formatTime(Number((distance / speed).toFixed(2))) : "§c下辈子§r";
                        const arr = [
                            `§p墓碑位置: §c${graveX}, ${graveY}, ${graveZ} `,
                            `§7距离: §f${distance.toFixed(2)}格 §a${getDirection3(player, [graveX, graveY, graveZ])}`,
                            ...(distance > (16 * 4) ? [
                                `§d当前速度 : §b${speed}§b格/秒`,
                                `§f大概还需§c${needTime}§f才能到达 `
                            ] : [])
                        ];
                        player.sendText(arr.join("\n") + "\n\n\n", 5);
                    } else {
                        player.sendText(`§p墓碑所在维度: §7${graveDim}\n§c${graveX}, ${graveY}, ${graveZ}\n\n`, 5);
                    }

                    // 当玩家靠近墓碑时如果墓碑方块不存在或为其他方块则自动销毁钥匙
                    const graveBlock = mc.getBlock(new IntPos(graveX, graveY, graveZ, graveDimid));

                    if (graveDimid === pos.dimid && distance <= 6 && (!graveBlock || !graveBlockTypeNames.includes(graveBlock.type))) {
                        playSound(player, "random.break", 0.5);
                        graveKey.setNull();
                        player.refreshItems();
                    }
                }
            }
        });
    } catch (error) {
        logError("sendGraveInfoToPlayerActionbar", error);
    }
}

/**
 * 计算跨维度等效距离
 * @param {Player} player 
 * @param {number} graveX 
 * @param {number} graveY 
 * @param {number} graveZ 
 * @param {number} graveDimid 
 * @returns 
 */
function calculateEffectiveDistance(player, graveX, graveY, graveZ, graveDimid) {
    // 防御性检查
    if (!player || !player.pos) {
        logger.error("calculateEffectiveDistance: player or player.pos is undefined!");
        return 0;
    }
    const playerPos = player.blockPos;
    const playerDimid = playerPos.dimid;

    // 同维度直接计算距离
    if (playerDimid === graveDimid) {
        return calculateDistance3D(
            playerPos.x, playerPos.y, playerPos.z,
            graveX, graveY, graveZ
        );
    }

    // 主世界 ↔ 下界 坐标转换 (8:1)
    if ((playerDimid === 0 && graveDimid === 1) ||
        (playerDimid === 1 && graveDimid === 0)) {

        const ratio = 8;
        let calcX1 = playerPos.x;
        let calcZ1 = playerPos.z;
        let calcX2 = graveX;
        let calcZ2 = graveZ;

        // 玩家在主世界，墓碑在下界
        if (playerDimid === 0) {
            calcX1 /= ratio;
            calcZ1 /= ratio;
        }
        // 玩家在下界，墓碑在主世界
        else {
            calcX2 *= ratio;
            calcZ2 *= ratio;
        }

        return calculateDistance3D(
            calcX1, playerPos.y, calcZ1,
            calcX2, graveY, calcZ2
        );
    }

    // 玩家在主世界，墓碑在末地
    if (playerDimid === 0 && graveDimid === 2) {
        // 计算墓碑到末地祭坛(0,0,0)的距离
        return calculateDistance3D(0, 0, 0, graveX, graveY, graveZ);
    }

    // 其他跨维度情况返回0距离
    return 0;
}

// 经济计算策略
const ECONOMIC_CALCULATORS = {

    // 固定数额
    //fixed: (config) => config.tpGravePrice || 0,

    // 随机范围
    random: (config) => {
        const [min, max] = config.needMoneyRandomRange || [10, 1000];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 死亡次数
    deathcount: (config, player) => {
        const scoreboard = config.deathCountScoreboard || "deathcount";
        return player.getScore(scoreboard) || 0;
    },

    // 距离
    distance: (player, graveX, graveY, graveZ, graveDimid) => {
        //logger.warn(`ECONOMIC_CALCULATORS.distance : ${player} ${typeof player} | ${player.pos}`);
        return Math.floor(calculateEffectiveDistance(
            player, graveX, graveY, graveZ, graveDimid
        ));
    }
};

// 计算传送费用
function calculateTeleportCost(player, graveX, graveY, graveZ, graveDimid) {
    try {
        const ecoConfig = getGraveConfig("economicConfig");
        if (!ecoConfig) {
            logger.error(`获取配置 economicConfig 时发生错误：ecoConfig=${ecoConfig}`);
            return 0;
        }

        if (!ecoConfig.tpGraveNeedMoney) return 0;

        const method = ecoConfig.calculationMethod;
        let cost = 0;

        // 数字：固定数额
        if (typeof method === 'number') cost = method;

        // 数组：随机范围
        else if (Array.isArray(method)) {
            cost = ECONOMIC_CALCULATORS.random(ecoConfig);
        }
        // 字符串：策略计算
        else if (typeof method === 'string') {
            const calculator = ECONOMIC_CALCULATORS[method];
            if (calculator) {
                // 根据方法类型传递正确的参数
                if (method === "distance") {
                    cost = calculator(
                        player,
                        graveX, graveY, graveZ, graveDimid
                    );
                } else {
                    cost = calculator(ecoConfig, player);
                }
            } else {
                logger.error(`未知的经济计算方法: ${method}`);
            }
        } else {
            logger.error(`无效的经济计算方法类型: ${method} |${typeof method}`);
        }

        // 跨维度价格翻倍
        const currentDimid = player.pos.dimid;
        const isDifferentDim = currentDimid !== graveDimid;

        if (isDifferentDim &&
            ecoConfig.doubleThePriceWhenAllowChangeDimTp &&
            cost > 0) {
            cost *= 2;
        }

        return cost;
    } catch (error) {
        logError("calculateTeleportCost", error);
        return 0;
    }
}

function registerCommands() {
    try {
        const command = mc.newCommand("grave", "墓碑系统", PermType.Any);
        command.setEnum("ListAction", ["back", "reload", "gg", "query", "clean"]);
        command.mandatory("action", ParamType.Enum, "ListAction", 1);
        command.overload(["ListAction"]);
        command.setCallback((cmd, ori, out, res) => {
            const player = ori.player;
            switch (res.action) {
                case "back":
                    if (!player || player.isSimulatedPlayer()) return out.error(`此命令仅限玩家执行!`);

                    // 检查当前维度是否允许使用钥匙传送至墓碑
                    // 获取玩家死亡维度的配置
                    const dimid = player.pos.dimid;
                    const dimensionConfig = getGraveConfig("dimensionConfig");
                    let dimConfig = null;

                    // 查找匹配的维度配置
                    for (const key in dimensionConfig) {
                        if (dimensionConfig[key].dimid === dimid) {
                            dimConfig = dimensionConfig[key];
                            break;
                        }
                    }

                    // 如果找不到配置则跳过
                    if (!dimConfig) {
                        logger.fatal(`未找到维度ID ${dimid} 的配置！`);
                        return out.error(`未找到维度ID ${dimid} 的配置，请联系服务器管理员！`);
                    }

                    if (!dimConfig.allowUseKeyTpToGrave) return out.error("当前维度不允许使用钥匙传送至墓碑!");


                    // 查找玩家手中的钥匙
                    const graveKey = [player.getHand(), player.getOffHand()].find(item =>
                        !item.isNull() && item.type === graveKeyTypeName
                    );

                    if (!graveKey) return out.error("你的主手或副手需要至少有一把钥匙!");


                    const lore = graveKey.lore || [];
                    if (lore.length < 2) return out.error("钥匙数据不完整，缺少墓碑位置信息!");


                    // 解析钥匙中的位置信息
                    const graveLocation = lore[0].split(":")[1].trim().replace(/§[a-zA-Z0-9]/g, '').split(",");
                    const graveX = parseInt(graveLocation[0].trim());
                    const graveY = parseInt(graveLocation[1].trim());
                    const graveZ = parseInt(graveLocation[2].trim());
                    const graveDim = lore[1].replace(/§[a-zA-Z0-9]/g, '');
                    const graveDimid = DIMIDS[graveDim];

                    // 检查维度是否匹配
                    const currentDimid = player.pos.dimid;
                    const isDifferentDim = currentDimid !== graveDimid;

                    if (isDifferentDim && !getGraveConfig("allowChangeDimTp")) return out.error(`跨维度传送已被禁用! 墓碑位置: ${graveDim} ${graveX}, ${graveY}, ${graveZ}`);

                    // 计算传送费用（使用新方法）
                    const cost = calculateTeleportCost(player, graveX, graveY, graveZ, graveDimid);

                    // 计算实际距离（用于显示）
                    const actualDistance = Math.floor(calculateEffectiveDistance(
                        player, graveX, graveY, graveZ, graveDimid
                    ));
                    const ecoConfig = getGraveConfig("economicConfig");
                    // 检查玩家余额
                    if (ecoConfig.tpGraveNeedMoney) {
                        let playerMoney = 0;

                        if (ecoConfig.type === "llmoney") {
                            playerMoney = money.get(player.xuid);
                        } else {
                            playerMoney = player.getScore(ecoConfig.scoreboardName);
                        }

                        if (playerMoney < cost) {
                            return out.error(`余额不足! 需要 ${cost} 金币，当前余额: ${playerMoney} 金币`);
                        }
                    }

                    const targetUpBlock = mc.getBlock(graveX, graveY + 2, graveZ, graveDimid);
                    const isInTheDifferentDim = dimid !== graveDimid;
                    const arr = [
                        `你的位置：${player.blockPos}`,
                        `墓碑位置：${new IntPos(graveX, graveY, graveZ, graveDimid)}`,
                        `你距离墓碑：§a${actualDistance} 格`,
                        `是否跨纬度：${isInTheDifferentDim ? `§c是` : `§a否`}`,
                        `本次传送需要§6消耗经济§f：${cost > 0 ? `§c${cost}` : `§7${cost}`} 金币`,
                        `本次传送需要§b消耗钥匙§f：${getGraveConfig("tpGraveConsumesKey") ? "§c是" : "§a否"}`,
                        `目的地是否可能会§d导致窒息§f：${targetUpBlock?.type === "minecraft:air" ? "§a否" : "§c是"}`
                    ];

                    // 发送确认表单
                    player.sendModalForm("传送至墓碑", arr.join("\n§r").trim(), "确认", "取消", (pl, res) => {
                        if (res) {
                            // 传送到墓碑上方一格
                            const teleportPos = new FloatPos(graveX + 0.5, graveY + 1, graveZ + 0.5, graveDimid);
                            // 执行传送
                            if (!pl.teleport(teleportPos)) return pl.sendText("§c传送失败，请联系服务器管理员!");

                            // 扣除经济
                            if (ecoConfig.tpGraveNeedMoney && cost > 0) {
                                if (ecoConfig.type === "llmoney") {
                                    money.reduce(pl.xuid, cost);
                                } else { // scoreboard
                                    pl.reduceScore(ecoConfig.scoreboardName, cost);
                                };
                            };

                            // 消耗钥匙
                            if (getGraveConfig("tpGraveConsumesKey")) {
                                graveKey.setNull();
                                pl.refreshItems();
                                pl.sendText(`扣除钥匙*1`);
                            };

                            pl.sendText(`已成功传送至墓碑位置! ${isDifferentDim ? "(跨维度传送)" : ""}`);
                            if (ecoConfig.tpGraveNeedMoney && cost > 0) pl.sendText(`扣除费用: ${cost} 金币`);
                        };
                    });

                    break;

                case "gg":

                    if (!player || player.isSimulatedPlayer()) return out.error(`此命令仅限玩家执行!`);

                    if (!player.isOP()) return out.error(`此命令仅限管理员执行!`);

                    playerDie(player);

                    out.success("正在尝试模拟玩家死亡生成墓碑等相关逻辑...");
                    break

                case "reload":

                    if ((player && !player?.isOP()) || (ori.type !== 7)) return out.error(`此命令仅限管理员执行!`);

                    graveConfig.reload() ? out.success("墓碑配置文件已成功热重载！") : out.error("墓碑配置文件热重载失败，请检查控制台！");

                    break;

                case "query":

                    if (ori.type === 0) {
                        // 玩家执行逻辑
                        const graves = getAllGravesInfo();

                        if (player.isOP()) {
                            // OP玩家：查询所有墓碑
                            sendGravesForm(player, graves);
                        } else {
                            // 普通玩家：只查询自己的墓碑
                            const myGraves = graves.filter(g => g.ownerXUID === player.xuid);
                            sendGravesForm(player, myGraves);
                        }
                    } else if (ori.type === 7) {
                        // 控制台执行：逐个打印墓碑信息
                        const graves = getAllGravesInfo();
                        if (graves.length === 0) {
                            out.success("当前没有已加载的墓碑");
                            return;
                        }

                        out.success(`已查询到 ${graves.length} 座已加载的墓碑：`);
                        graves.forEach((grave, index) => {
                            out.success(`${index + 1}. 位置: ${grave.pos} 归属人: ${grave.ownerName}`);
                        });
                    }
                    break;

                case "clean":

                    if ((player && !player?.isOP()) && ori.type !== 7) return out.error(`此命令仅限管理员执行!`);

                    const cleanedGraves = cleanAllLoadedGraves("管理员清理");

                    if (ori.type === 0) {
                        // 玩家执行：逐个发送清理信息
                        if (cleanedGraves.length === 0) {
                            player.sendText("§a没有可清理的墓碑");
                            break;
                        }

                        player.sendText(`§a已清理 ${cleanedGraves.length} 座墓碑：`);
                        cleanedGraves.forEach((grave, index) => {
                            player.sendText(`§a${index + 1}. 位置: ${grave.pos} 归属: ${grave.ownerName}`);
                        });
                    } else if (ori.type === 7) {
                        // 控制台执行：逐个打印清理信息
                        if (cleanedGraves.length === 0) {
                            out.success("没有可清理的墓碑");
                            break;
                        }

                        out.success(`已清理 ${cleanedGraves.length} 座墓碑：`);
                        cleanedGraves.forEach((grave, index) => {
                            out.success(`${index + 1}. 位置: ${grave.pos} 归属: ${grave.ownerName}`);
                        });
                    };
                    break;
            };
        });
        command.setup();
    } catch (error) {
        logError("registerCommands", error);
    };
};

function printPluginLogo(type, color) {
    const currentPlugin = ll.getCurrentPluginInfo();
    //logger.warn(currentPlugin);
    const versionSuffix = currentPlugin.versionStr.split("-")[1] || "";
    const versionTypeMap = {
        "": "正式发布版本",
        "beta": "测试版本",
        "dev": "开发版本"
    };
    const versionTypeStr = versionTypeMap[versionSuffix] || "未知版本";
    switch (type) {
        case 0:
            colorLog("grey", `正在加载 ${pluginName} v${currentPlugin.versionStr}`);
            colorLog("grey", ``);
            colorLog(color, `██████╗        ██████╗ ██████╗  █████╗ ██╗   ██╗███████╗`);
            colorLog(color, `██╔══██╗      ██╔════╝ ██╔══██╗██╔══██╗██║   ██║██╔════╝`);
            colorLog(color, `██████╔╝█████╗██║  ███╗██████╔╝███████║██║   ██║█████╗  `);
            colorLog(color, `██╔══██╗╚════╝██║   ██║██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  `);
            colorLog(color, `██████╔╝      ╚██████╔╝██║  ██║██║  ██║ ╚████╔╝ ███████╗`);
            colorLog(color, `╚═════╝        ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝`);
            colorLog("grey", `                                                        `);
            colorLog("grey", ``);
            colorLog(`${versionSuffix === '' ? 'white' : versionSuffix === 'beta' ? 'dk_yellow' : versionSuffix === 'dev' ? 'cyan' : '红色'}`, `       插件版本: v${currentPlugin.versionStr} ${versionTypeStr}`);
            colorLog("pink", `       作者minebbs: https://www.minebbs.com/resources/authors/forget.132107/`);
            colorLog("grey", ``);
            colorLog("grey", `${pluginName} 已加载`);
            if (versionSuffix === "dev" || versionSuffix === "beta") colorLog("yellow", `你当前使用的是[${versionTypeStr}]，可能会遇到未知问题，请谨慎在生产环境中使用，如遇bug请及时向作者反馈！`);

            /*
            logger.info(`正在加载 ${pluginName} ${currentPlugin.versionStr}`);
            logger.info("");
            logger.info("██████╗        ██████╗ ██████╗  █████╗ ██╗   ██╗███████╗");
            logger.info("██╔══██╗      ██╔════╝ ██╔══██╗██╔══██╗██║   ██║██╔════╝");
            logger.info("██████╔╝█████╗██║  ███╗██████╔╝███████║██║   ██║█████╗  ");
            logger.info("██╔══██╗╚════╝██║   ██║██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  ");
            logger.info("██████╔╝      ╚██████╔╝██║  ██║██║  ██║ ╚████╔╝ ███████╗");
            logger.info("╚═════╝        ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝");
            logger.info("                                                        ");
            logger.info("");
            logger.info(`       插件版本: v${currentPlugin.versionStr} ${versionTypeStr}`);
            logger.info("       作者minebbs: https://www.minebbs.com/resources/authors/forget.132107/");
            logger.info("");
            logger.info(`${pluginName} 已加载`);
            if (versionType === "dev" || versionType === "beta") logger.warn(`你当前使用的是[${versionTypeStr}]，可能会遇到未知问题，如遇bug请及时向作者反馈！`);
            */
            break;

        case 1:
            logger.warn(`

██████         ██████  ██████   █████  ██    ██ ███████ 
██   ██       ██       ██   ██ ██   ██ ██    ██ ██      
██████  █████ ██   ███ ██████  ███████ ██    ██ █████   
██   ██       ██    ██ ██   ██ ██   ██  ██  ██  ██      
██████         ██████  ██   ██ ██   ██   ████   ███████ 
                                                        
                                                        `);
            break;

        case 2:
            logger.warn(`
██████╗        ██████╗ ██████╗  █████╗ ██╗   ██╗███████╗
██╔══██╗      ██╔════╝ ██╔══██╗██╔══██╗██║   ██║██╔════╝
██████╔╝█████╗██║  ███╗██████╔╝███████║██║   ██║█████╗  
██╔══██╗╚════╝██║   ██║██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  
██████╔╝      ╚██████╔╝██║  ██║██║  ██║ ╚████╔╝ ███████╗
╚═════╝        ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝
                                                        `);
            break;
        case 3:
            logger.warn(" ________                 ________  ________  ________  ___      ___ _______      ")
            logger.warn("|\\   __  \\               |\\   ____\\|\\   __  \\|\\   __  \\|\\  \\    /  /|\\  ___ \\     ")
            logger.warn("\\ \\  \\|\\ /_  ____________\\ \\  \\___|\\ \\  \\|\\  \\ \\  \\|\\  \\ \\  \\  /  / | \\   __/|    ")
            logger.warn(" \\ \\   __  \\|\\____________\\ \\  \\  __\\ \\   _  _\\ \\   __  \\ \\  \\/  / / \\ \\  \\_|/__  ")
            logger.warn("  \\ \\  \\|\\  \\|____________|\\ \\  \\|\\  \\ \\  \\\\  \\\\ \\  \\ \\  \\ \\    / /   \\ \\  \\_|\\ \\ ")
            logger.warn("   \\ \\_______\\              \\ \\_______\\ \\__\\\\ _\\\\ \\__\\ \\__\\ \\__/ /     \\ \\_______\\")
            logger.warn("    \\|_______|               \\|_______|\\|__|\\|__|\\|__|\\|__|\\|__|/       \\|_______|")
            logger.warn("                                                                                  ")
            logger.warn("                                                                                  ")
            logger.warn("                                                                                  ")
            break;
        default:
            break;
    }
}

mc.listen("onServerStarted", () => {
    // 当墓碑有效期不为-1时（不为无限时长）初始化墓碑计时管理系统
    if (getGraveConfig("effectiveDuration") !== -1) graveManager.initOnServerStart();

    // 注册指令
    registerCommands();

    // 给手持钥匙玩家显示墓碑信息
    setInterval(() => {
        sendGraveInfoToPlayerActionbar();
    }, 1000); // 500 ~ 1000


    setTimeout(() => {

        // 检查LSE版本号是否>=0.13.0
        if (ll.major >= 0 && ll.minor >= 13 && ll.revision >= 0) {
            //logger.info("B-Grave 全新重构版本已成功加载！");
            /*
            colorLog("green",
                "\n",
                "╔════════════════════════════════════════════════════════════════╗\n",
                "║                          _ooOoo_                               ║\n",
                "║                         o8888888o                              ║\n",
                '║                         88" . "88                              ║\n',
                "║                         (| ^_^ |)                              ║\n",
                "║                         O\\  =  /O                              ║\n",
                "║                      ____/`---'\\____                           ║\n",
                "║                    .'  \\|     |//   '.                         ║\n",
                "║                   /  \\|||  :  |||//   \\                        ║\n",
                "║                  /  _||||| -:- |||||-  \\                       ║\n",
                "║                  |   | \\\\  -  ///  |   |                       ║\n",
                "║                  | \\_|  ''\\---/''  |   |                       ║\n",
                "║                  \\  .-\\__  `-`  ___/-. /                       ║\n",
                "║                ___`. .'  /--.--\\  `. . ___                     ║\n",
                '║              ."""<  `.___\\_<|>_/___.`  >""".                   ║\n',
                "║            | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |                 ║\n",
                "║            \\  \\ `-.   \\_ __\\ /__ _/   .-` /  /                 ║\n",
                "║      ========`-.____`-.___\\_____/___.-`____.-'========         ║\n",
                "║                           `=---='                              ║\n",
                "║      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^        ║\n",
                "║            佛祖保佑       永不崩溃     永不报错                ║\n",
                "╚════════════════════════════════════════════════════════════════╝\n"
            );*/

            printPluginLogo(0, "bt_blue"); // 3

        } else {
            logger.warn(`检测到你正在不稳定的LSE版本（${ll.major}.${ll.minor}.${ll.revision}）中使用本插件，可能会发送报错、崩溃等现象`);
        }
        if (!ll.pluginsRoot || ll.pluginsRoot !== "./plugins/") logger.error(`检测到你的插件目录不为 "./plugins/" ，配置&数据文件可能会无法初始化和读写，请检查插件文件夹名称和路径！`);

        // 开启死亡不掉落
        if (mc.runcmd("gamerule keepinventory true")) {
            logger.info("本插件已成功使服务器开启死亡不掉落！");
            logger.info("温馨提示：开启死亡不掉落为正常现象，本插件需要开启死亡不掉落以确保墓碑能在玩家死亡时读取并准确保存玩家死亡前物品！")
        } else {
            logger.error("本插件需要开启死亡不掉落，否则无法生效！");
            logger.error("开启死亡不掉落失败，请检查控制台！");
        }

        // 检查并创建死亡榜和金币计分板
        checkAndCreateScoreboardObjectives();

        logger.warn(`使用本插件时请确保存档已开启实验性玩法中的 "即将推出的创作者功能" 选项，否则墓碑将会被活塞等方块推动！`);
        logger.warn(`使用本插件时请确保 实体 entity:grave_inventory 和 物品 effect99:key 加入到扫地机插件白名单中（如果有）！`);

        const installationResult = checkAddonInstallation();
        if (installationResult.installed) {
            //logger.info(`墓碑 Addon-RP [资源包] 位于: ${installationResult.resourcePackPath}`);
            //logger.info(`墓碑 Addon-BP [行为包] 位于: ${installationResult.behaviorPackPath}`);

            // 可以进一步操作这些路径
            // 例如检查资源包版本等
        } else {
            logger.error("墓碑Addon 未正确安装，请检查日志");
        }
    }, 1000 * 8); // 5~10秒
});

function checkAndCreateScoreboardObjectives() {
    const ecoConfig = getGraveConfig("economicConfig");
    const deathCountScoreboard = ecoConfig.deathCountScoreboard;
    if (!mc.getScoreObjective(deathCountScoreboard)) mc.newScoreObjective(deathCountScoreboard, "死亡榜");
    const moneyScoreboard = ecoConfig.scoreboardName;
    if (!mc.getScoreObjective(moneyScoreboard)) mc.newScoreObjective(moneyScoreboard, "经济榜");
};

function checkAddonInstallation() {
    let resourcePackJsonFound = false;
    let resourcePackManifestFound = false;
    let behaviorPackJsonFound = false;
    let behaviorPackManifestFound = false;

    // 存储找到的包路径
    let foundResourcePackPath = "";
    let foundBehaviorPackPath = "";

    // 1. 检查资源包在world_resource_packs.json中是否存在
    if (File.exists(world_resource_packs_json_path)) {
        const content = File.readFrom(world_resource_packs_json_path);
        if (content) {
            try {
                const packs = JSON.parse(content);
                resourcePackJsonFound = packs.some(pack => pack.pack_id.toLowerCase() === RESOURCE_PACK_UUID.toLowerCase());
            } catch (e) {
                logger.error("解析world_resource_packs.json失败: " + e);
            }
        }
    }

    // 2. 检查资源包在resource_packs文件夹中是否存在
    if (File.exists(resource_packs_path) && File.checkIsDir(resource_packs_path)) {
        const resourcePacks = File.getFilesList(resource_packs_path);
        for (const packDir of resourcePacks) {
            const packPath = `${resource_packs_path}${packDir}`;
            const manifestPath = `${packPath}/manifest.json`;

            if (File.exists(manifestPath) && !File.checkIsDir(manifestPath)) {
                const manifestContent = File.readFrom(manifestPath);
                if (manifestContent) {
                    try {
                        const manifest = JSON.parse(manifestContent);
                        if (manifest.header && manifest.header.uuid.toLowerCase() === RESOURCE_PACK_UUID.toLowerCase()) {
                            resourcePackManifestFound = true;
                            foundResourcePackPath = packPath; // 记录找到的资源包路径
                            break;
                        }
                    } catch (e) {
                        logger.error(`解析资源包 ${packDir}/manifest.json 失败: ${e}`);
                    }
                }
            }
        }
    }

    // 3. 检查行为包在world_behavior_packs.json中是否存在
    if (File.exists(world_behavior_packs_json_path)) {
        const content = File.readFrom(world_behavior_packs_json_path);
        if (content) {
            try {
                const packs = JSON.parse(content);
                behaviorPackJsonFound = packs.some(pack => pack.pack_id.toLowerCase() === BEHAVIOR_PACK_UUID.toLowerCase());
            } catch (e) {
                logger.error("解析world_behavior_packs.json失败: " + e);
            }
        }
    }

    // 4. 检查行为包在behavior_packs文件夹中是否存在
    if (File.exists(behavior_packs_path) && File.checkIsDir(behavior_packs_path)) {
        const behaviorPacks = File.getFilesList(behavior_packs_path);
        for (const packDir of behaviorPacks) {
            const packPath = `${behavior_packs_path}${packDir}`;
            const manifestPath = `${packPath}/manifest.json`;

            if (File.exists(manifestPath) && !File.checkIsDir(manifestPath)) {
                const manifestContent = File.readFrom(manifestPath);
                if (manifestContent) {
                    try {
                        const manifest = JSON.parse(manifestContent);
                        if (manifest.header && manifest.header.uuid.toLowerCase() === BEHAVIOR_PACK_UUID.toLowerCase()) {
                            behaviorPackManifestFound = true;
                            foundBehaviorPackPath = packPath; // 记录找到的行为包路径
                            break;
                        }
                    } catch (e) {
                        logger.error(`解析行为包 ${packDir}/manifest.json 失败: ${e}`);
                    }
                }
            }
        }
    }

    // 检查结果
    const resourcePackInstalled = resourcePackJsonFound && resourcePackManifestFound;
    const behaviorPackInstalled = behaviorPackJsonFound && behaviorPackManifestFound;
    const allInstalled = resourcePackInstalled && behaviorPackInstalled;

    if (!allInstalled) {
        logger.error("Addon 加载失败，本插件将会无法运行！！！请检测存档中是否成功安装了 GraveAddon！！！");

        if (!resourcePackJsonFound) {
            logger.error(`- 在 world_resource_packs.json 中找不到资源包 UUID: ${RESOURCE_PACK_UUID}`);
        }
        if (!resourcePackManifestFound) {
            logger.error(`- 在 resource_packs 文件夹中找不到资源包 UUID: ${RESOURCE_PACK_UUID}`);
        }
        if (!behaviorPackJsonFound) {
            logger.error(`- 在 world_behavior_packs.json 中找不到行为包 UUID: ${BEHAVIOR_PACK_UUID}`);
        }
        if (!behaviorPackManifestFound) {
            logger.error(`- 在 behavior_packs 文件夹中找不到行为包 UUID: ${BEHAVIOR_PACK_UUID}`);
        }
    } else {
        logger.info(`GraveAddon 已正确安装在存档 ${levelName} 内。`);
        logger.info(`- 找到资源包: ${foundResourcePackPath}`);
        logger.info(`- 找到行为包: ${foundBehaviorPackPath}`);
        logger.info(``);
        logger.info(`=============== 插件已成功加载！===============`);
    }

    return {
        installed: allInstalled,
        resourcePackPath: foundResourcePackPath,
        behaviorPackPath: foundBehaviorPackPath
    };
}

// 修改表单函数：支持传入墓碑列表
function sendGravesForm(player, graves) {
    const form = mc.newSimpleForm();
    form.setTitle("查询墓碑");
    const content = `找到 ${graves.length} 座${player.isOP() ? "" : "你的"}墓碑`;
    //form.setContent(`找到 ${graves.length} 座${player.isOP() ? "" : "你的"}墓碑`);

    const arr = [];
    graves.forEach((grave, index) => {
        //form.addLabel(`${index + 1}. 位置：${grave.pos} 归属人：${grave.ownerName}`);
        arr.push(`${index + 1}. 位置：${grave.pos} 归属人：${grave.ownerName}`);
    });
    form.setContent(content + "\n" + arr.join("\n").trim());

    player.sendForm(form, (pl, id) => {
        if (id == null) return;
        // 表单选择处理（保持不变）
        // 如果已加载的墓碑太多，添加翻页功能，每页显示8个
    });
}

/**
 * 清理单个墓碑
 * @param {Entity} graveEntity 
 * @param {string} [reason=""] 清理原因：服务器 | 管理员
 * @returns 
 */
function cleanSingleGrave(graveEntity, reason = "") {
    try {
        const graveEntityAllTags = graveEntity.getAllTags() || [];
        const graveEntityTag = graveEntityAllTags.length === 1 ? graveEntityAllTags[0] : false;

        if (graveEntityTag) {
            const graveBlockPos = graveEntity.blockPos;
            const graveBlock = mc.getBlock(graveBlockPos);

            // 破坏墓碑方块
            if (graveBlock) graveBlock.destroy(Boolean(getGraveConfig("dropGraveBlock")));

            // 杀死墓碑实体（自动掉落物品）
            //graveEntity.kill();
            dropItemsFromGraveEntity(graveEntity, graveBlockPos);

            // 从管理器中移除
            graveManager.removeGrave(graveEntity);

            graveEntity.despawn();

            const owner = mc.getPlayer(graveEntityTag);

            if (owner) {
                owner.sendText(`§3你的墓碑已被清理，位置：${graveBlockPos}，§v原因：${reason}`);
                playSound(owner, "random.break", 0.5);
            } else {
                logger.warn(`${data.xuid2name(graveEntityTag)} 的墓碑已被清理，位置：${graveBlockPos}，原因：${reason}`);
            }

            return true;
        }
    } catch (error) {
        logError("cleanSingleGrave", error);
    }
    return false;
}

// 新增辅助函数：获取所有墓碑信息
function getAllGravesInfo() {
    return mc.getAllEntities()
        .filter(en => en && en.type === graveEntityTypeName)
        .map(graveEntity => {
            const tags = graveEntity.getAllTags() || [];
            const ownerTag = tags.length === 1 ? tags[0] : null;
            return {
                entity: graveEntity,
                ownerXUID: ownerTag,
                ownerName: ownerTag ? data.xuid2name(ownerTag) : "未知玩家",
                pos: graveEntity.blockPos
            };
        });
}

// 修改清理函数：返回清理的墓碑信息
function cleanAllLoadedGraves(reason = "") {
    try {
        const graves = getAllGravesInfo();
        const cleanedGraves = [];

        for (const grave of graves) {
            if (cleanSingleGrave(grave.entity, reason)) {
                cleanedGraves.push({
                    ownerName: grave.ownerName,
                    pos: grave.pos
                });
            }
        }

        return cleanedGraves;
    } catch (error) {
        logError("cleanAllLoadedGraves", error);
        return [];
    }
}

function getOnlineRealPlayers() {
    return mc.getOnlinePlayers().filter(p => !p.isSimulatedPlayer());
};

/**
 * 根据维度ID获取该维度的最低和最大可用建筑高度
 * @param {number} dimid 
 * @returns {{minY: number, maxY: number}}
 */
function getMinAndMaxY(dimid) {
    const dimensionConfig = getGraveConfig("dimensionConfig");

    // 遍历所有维度配置
    for (const key in dimensionConfig) {
        const config = dimensionConfig[key];
        // 匹配维度ID
        if (config.dimid === dimid) {
            // 返回配置中的高度范围
            return {
                minY: config.height.minY,
                maxY: config.height.maxY
            };
        }
    }

    // 默认值（未找到匹配维度时使用）
    return {
        minY: -64,
        maxY: 320
    };
}

/**
 * 以centerPos为中心radius为半径查找球体或矩形体内可用空间
 * @param {IntPos} centerPos 
 * @param {number} radius 
 * @param {string} mode sphere | cube
 */
function searchAvailableSpace(centerPos, radius, mode = "sphere") {
    const start = performance.now(); // 开始计时

    const dimid = centerPos.dimid;
    const { minY, maxY } = getMinAndMaxY(dimid);
    const cx = centerPos.x;
    const cy = centerPos.y;
    const cz = centerPos.z;

    // 1. 虚空检查
    if (dimid === 2 && cy < 1) {

        // 在中心点下方创建3x3的末地石平台
        for (let xOffset = -1; xOffset <= 1; xOffset++) {
            for (let zOffset = -1; zOffset <= 1; zOffset++) {
                const x = cx + xOffset;
                const z = cz + zOffset;
                // 在 y=0 高度放置末地石，y=1的高度会生成墓碑方块和实体
                mc.setBlock(new IntPos(x, 0, z, dimid), "minecraft:end_stone");
            }
        }
    }

    // 2. 检查周围一圈方块（3x3x3 立方体表面）
    let allWater = true;
    let allLava = true;

    // 定义3x3x3立方体表面的26个偏移量
    const offsets = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
                // 排除中心点本身
                if (dx !== 0 || dy !== 0 || dz !== 0) {
                    offsets.push([dx, dy, dz]);
                }
            }
        }
    }

    // 检查每个偏移位置的方块
    for (const [dx, dy, dz] of offsets) {
        const x = cx + dx;
        const y = cy + dy;
        const z = cz + dz;

        // 跳过超出世界高度的位置
        if (y < minY || y > maxY) continue;

        const block = mc.getBlock(new IntPos(x, y, z, dimid));
        if (!block) continue;

        const type = block.type;
        const isWater = type === "minecraft:water" || type === "minecraft:flowing_water";
        const isLava = type === "minecraft:lava" || type === "minecraft:flowing_lava";

        if (!isWater) allWater = false;
        if (!isLava) allLava = false;

        // 如果已经不全是水也不全是岩浆，提前退出
        if (!allWater && !allLava) break;
    }

    // 3. 如果全是水，向上搜索空气位置
    if (allWater) {
        for (let y = cy; y <= maxY; y++) {
            const block = mc.getBlock(new IntPos(cx, y, cz, dimid));
            if (block && block.type === "minecraft:air") {
                const end = performance.now(); // 结束计时
                const duration = end - start;  // 计算耗时（毫秒）
                return {
                    success: true,
                    pos: new IntPos(cx, y, cz, dimid),
                    duration
                };
            }
        }
    }

    // 4. 如果全是岩浆，替换为岩浆块并返回中心点
    if (allLava) {
        for (const [dx, dy, dz] of offsets) {
            const x = cx + dx;
            const y = cy + dy;
            const z = cz + dz;

            // 跳过超出世界高度的位置
            if (y < minY || y > maxY) continue;

            mc.setBlock(new IntPos(x, y, z, dimid), "minecraft:magma");
        }
        const end = performance.now(); // 结束计时
        const duration = end - start;  // 计算耗时（毫秒）
        return {
            success: true,
            pos: centerPos,
            duration
        };
    }

    // 5. 在指定范围内搜索空气位置
    // 搜索顺序：由近及远（曼哈顿距离）
    for (let dist = 0; dist <= radius; dist++) {
        // 在三维空间中按曼哈顿距离搜索
        for (let dx = -dist; dx <= dist; dx++) {
            for (let dy = -dist; dy <= dist; dy++) {
                for (let dz = -dist; dz <= dist; dz++) {
                    if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) !== dist) continue;

                    const x = cx + dx;
                    const y = cy + dy;
                    const z = cz + dz;

                    // 跳过超出世界高度的位置
                    if (y < minY || y > maxY) continue;

                    // 检查是否在范围内
                    let inRange = false;
                    if (mode === "cube") {
                        // 立方体模式：直接检查坐标范围
                        inRange = Math.abs(dx) <= radius &&
                            Math.abs(dy) <= radius &&
                            Math.abs(dz) <= radius;
                    } else {
                        // 球体模式：计算欧几里得距离
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        inRange = distance <= radius;
                    }

                    if (inRange) {
                        const block = mc.getBlock(new IntPos(x, y, z, dimid));
                        if (block && block.type === "minecraft:air") {
                            const end = performance.now(); // 结束计时
                            const duration = end - start;  // 计算耗时（毫秒）
                            return {
                                success: true,
                                pos: new IntPos(x, y, z, dimid),
                                duration
                            };
                        }
                    }
                }
            }
        }
    }


    const end = performance.now(); // 结束计时
    const duration = end - start;  // 计算耗时（毫秒）

    // 没有找到可用位置
    return {
        success: false,
        pos: centerPos, // 返回原始位置作为备选，最后返回的这个pos必须是距离centerPos最近的坐标（欧几里得距离）
        duration
    };
}

// 禁止末影龙搬运墓碑方块
mc.listen("onEndermanTakeBlock", (entity, block, pos) => {
    if (graveBlockTypeNames.includes(block.type)) {
        return false;
    };
});

/*
// 禁止凋灵破坏墓碑方块，注意，此事件不包括凋灵爆炸的破坏。
mc.listen("onWitherBossDestroy", (witherBoss, AAbb, aaBB) => {
    // 获取两个对角点的坐标范围
    const x1 = Math.min(AAbb.x, aaBB.x);
    const x2 = Math.max(AAbb.x, aaBB.x);
    const y1 = Math.min(AAbb.y, aaBB.y);
    const y2 = Math.max(AAbb.y, aaBB.y);
    const z1 = Math.min(AAbb.z, aaBB.z);
    const z2 = Math.max(AAbb.z, aaBB.z);
    const dim = AAbb.dimid; // 维度（两个点应在同一维度）

    // 遍历区域内所有方块
    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            for (let z = z1; z <= z2; z++) {
                const block = mc.getBlock(x, y, z, dim);
                // 如果存在草方块，拦截破坏
                if (block && graveBlockTypeNames.includes(block.type)) {
                    logger.warn(`已阻止凋灵破坏墓碑方块：${block.pos}`);
                    return false; // 返回 false 阻止凋灵破坏该区域
                }
            }
        }
    }
    // 未发现墓碑方块，不拦截（让凋灵正常破坏）
});
*/

/*
mc.listen("onMobHurt", (mob, source, damage, cause) => {
    if (mob.isPlayer()) {
        return false;
    }
});
*/

/**
 * 玩家死亡
 * @param {Player} player 
 */
function playerDie(player) {
    try {
        logger.debug(`[playerDie] 玩家 ${player.realName} 死亡，处理生成墓碑相关操作...开始计时...`);
        const start = performance.now(); // 开始计时
        const playerInventory = getPlayerAllClonedItems(player);

        // 死亡时背包内没有任何物品，直接返回
        const isPlayerInventoryEmpty = playerInventory.length === 0;
        if (isPlayerInventoryEmpty) return;

        const pos = player.blockPos;
        const dimid = pos.dimid;

        const { minY, maxY } = getMinAndMaxY(dimid);
        if (dimid === 0 && (pos.y < minY || pos.y >= maxY)) return;
        if (dimid === 1 && (pos.y < minY || pos.y >= maxY)) return;
        if (dimid === 2 && pos.y >= maxY) return;
        //if (dimid === 2 && Math.abs(pos.x) <= 100 && Math.abs(pos.z) <= 100 && pos.y >= 50 && pos.y <= 100) return; // 判断是否在末地主岛范围内
        if (dimid === 2 && Math.hypot(pos.x, pos.z) <= 128) {
            player.sendText(`在末地主岛死亡，物品已保留`);
            return;
        };


        const searchAvailableSpaceMode = getGraveConfig("searchAvailableSpaceMode");
        const searchAvailableSpaceRadius = getGraveConfig("searchAvailableSpaceRadius");
        const result = searchAvailableSpace(pos, searchAvailableSpaceRadius, searchAvailableSpaceMode);

        let x = result.pos.x;
        let y = result.pos.y;
        let z = result.pos.z;

        x += 0.5;
        y = (dimid === 2) ? Math.max(y, 1) : y;
        z += 0.5;

        // 找到可用空间
        if (result.success) {

            logger.debug(`function => searchAvailableSpace(pos, searchAvailableSpaceRadius, searchAvailableSpaceMode) -> 本次耗时：${result.duration}ms`);

            // 生成墓碑实体
            const spawnPos = new FloatPos(x, y, z, dimid);
            const graveEntity = mc.spawnMob(graveEntityTypeName, spawnPos);


            if (!graveEntity) {
                mc.broadcast(`尝试在 ${spawnPos} 处生成墓碑实体 ${graveEntityTypeName} 失败：${graveEntity}，请联系服务器管理员！`);
                logger.fatal(`尝试在 ${spawnPos} 处生成墓碑实体 ${graveEntityTypeName} 失败：${graveEntity}`);
                return;
            };

            // 添加到墓碑计时管理系统
            graveManager.addGrave(graveEntity);

            // 设置墓碑实体名称（悬浮字）
            const newName = `§c${player.realName}§r \n R.I.P`;
            const setGraveEntityNameSuccess = setGraveEntityName(graveEntity, newName);

            //logger.debug(`墓碑实体 ${graveEntity.name} | ${graveEntity.type} 成功生成在 ${spawnPos} 处！`);
            //logger.debug(`[墓碑实体] 成功生成在 ${spawnPos} 处！`);

            //const graveInventory = graveEntity.getContainer(); // 不知道为什么Addon的getContainer始终为false，可能是LSE的问题

            logger.debug(`尝试设置墓碑实体名称：${setGraveEntityNameSuccess}`);
            logger.debug(`设置后的墓碑实体名称：${graveEntity.getNbt().getData("CustomName")}`);

            // 给墓碑实体添加tag标签（玩家xuid）
            graveEntity.addTag(player.xuid);


            // 生成墓碑方块
            // 根据玩家经验等级生成不同款式的墓碑方块
            const playerLevel = player.getTotalExperience();
            const graveRank = playerLevel < 12 ? 1 : playerLevel < 25 ? 2 : playerLevel < 37 ? 3 : playerLevel < 50 ? 4 : playerLevel < 62 ? 5 : playerLevel < 75 ? 6 : playerLevel < 87 ? 7 : playerLevel < 100 ? 8 : 8;
            const newX = Math.floor(x), newY = y, newZ = Math.floor(z);

            const placeGraveBlockPos = result.pos;
            const placeGraveBlock = mc.setBlock(placeGraveBlockPos, graveBlockTypeNames[graveRank]);

            if (!placeGraveBlock) {
                mc.broadcast(`尝试在 ${placeGraveBlockPos} 处生成墓碑方块 ${graveBlockTypeNames[graveRank]} 失败：${placeGraveBlock}，请联系服务器管理员！`);
                logger.fatal(`尝试在 ${placeGraveBlockPos} 处生成墓碑方块 ${graveBlockTypeNames[graveRank]} 失败：${placeGraveBlock}`);
                return;
            };

            // 在末地主岛死亡，在墓碑上方放置末地石以保护墓碑不被龙毁（测试）
            /*
            if (dimid === 2 && Math.hypot(pos.x, pos.z) <= 128) {
                mc.setBlock(new IntPos(placeGraveBlockPos.x, placeGraveBlockPos.y + 1, placeGraveBlockPos.z, placeGraveBlockPos.dimid), "minecraft:end_stone");
            };*/

            const graveBlock = mc.getBlock(placeGraveBlockPos);
            // 设置墓碑可销毁属性
            setGraveBlockDestructible(graveBlock, 1);

            /*
            {
                name: "effect99:wooden_grave",
                states: {
                    "block:destructible": 0,
                    "minecraft:cardinal_direction": north
                },
                version: 18168865
            }
            */
            logger.debug(`玩家经验等级：${playerLevel} | 墓碑款式：${graveRank}`);

            logger.debug(`[墓碑方块] ${graveBlock.type} 成功生成在：${placeGraveBlockPos} 处！`);

            // 将模型 ID 改为 graveRank
            const setGraveModelSsuccess = setGraveModel(graveEntity, graveRank);

            logger.debug(`尝试设置墓碑实体模型ID为 ${graveRank}：${setGraveModelSsuccess}`);

            // 把非白名单物品添加到墓碑实体容器中（因为graveEntity.getContainer()总返回false所以直接改nbt了）
            setGraveInventory(playerInventory, graveEntity);

            // 清除玩家背包内全部物品
            clearPlayerAllItems(player);

            if (!isPlayerInventoryEmpty) { // 背包内物品数量不为空
                const key = mc.newItem(graveKeyTypeName, 1);
                if (key) {
                    /*const newLore = [ // 此处需要修改...
                        `§r§9死亡地点: §c${x - 0.5}, ${y}, ${z - 0.5}`,
                        `§r§8${pos.dim}`
                    ];*/
                    const newLore = [
                        `§r§9墓碑位置: §c${newX}, ${newY}, ${newZ}`,
                        `§r§8${pos.dim}`
                    ];

                    key.setLore(newLore);

                    if (player.getInventory().hasRoomFor(key)) {
                        player.giveItem(key);
                    } else {
                        player.sendText(`你的背包空间不足以放下一枚 ${key.name}，§r可在工作台合成。`);
                    }
                }
            }

            const end = performance.now(); // 结束计时
            const duration = end - start;  // 计算耗时（毫秒）

            player.sendText(`§3你的墓碑已成功生成在：${placeGraveBlockPos} 处！`); // 本次耗时：${result.duration.toFixed(2)}ms，总耗时: ${duration.toFixed(2)}ms
            logger.warn(`玩家 ${player.realName} 的墓碑已成功生成在：${placeGraveBlockPos} 处！`);
            logger.debug(`[playerDie] 计时结束，本次成功找到可用空间: ${placeGraveBlockPos}，总耗时: ${duration.toFixed(5)}ms（${(duration / 1000).toFixed(5)}秒）`);
        } else {

            // 未找到可用空间，生成掉落物并通知玩家...
            playerInventory.forEach(item => { mc.spawnItem(item, player.blockPos); });

            // 清除玩家背包内全部物品
            clearPlayerAllItems(player);

            player.sendText(`你的死亡周围未找到可用空间，掉落物已生成在：${player.blockPos} 处！`);
            logger.warn(`${player.realName} 的死亡周围未找到可用空间，掉落物已生成在：${player.blockPos} 处！`);

            const end = performance.now(); // 结束计时
            const duration = end - start;  // 计算耗时（毫秒）
            logger.debug(`[playerDie] 计时结束，本次未找到可用空间，掉落物已生成在: ${player.blockPos} 处，总耗时：${duration.toFixed(5)}ms（${(duration / 1000).toFixed(5)}秒）`);
        }
    } catch (error) {
        logError("playerDie", error);
    }
}

/**
 * 掉落经验球（添加维度经验比例参数）
 * @param {Player} player 玩家对象
 * @param {number} dropExpPercent 当前维度的经验掉落比例
 */
function reducePlayerExpAndDropExpOrb(player, dropExpPercent) {
    const pos = player.feetPos;
    const lvl = player.getLevel();
    const drop = lvl * 7;

    // 保持原循环逻辑
    for (let i = 0; i < drop && i < 100; i++) {
        runCmdInAnyDimid(pos.dimid, `summon xp_orb ${pos.x} ${pos.y} ${pos.z}`);
    }

    let c1;
    if (lvl > 1) {
        const removelvl = Math.max(1, Math.floor(lvl * dropExpPercent / 100));
        c1 = player.reduceLevel(removelvl);
    } else {
        c1 = player.setTotalExperience(0);
    }

    if (c1) {
        logger.debug(`${player.realName} 的经验已成功掉落!`);
        return true;
    } else {
        logger.debug(`${player.realName} 的经验掉落失败!`);
        return false;
    }
}

// 玩家右键墓碑方块
mc.listen("onUseItemOn", (player, item, block, side, pos) => {
    if (player.isSimulatedPlayer()) return;

    // windows设备玩家防抖...

    if (graveBlockTypeNames.includes(block.type)) breakGrave(player, block);
});

// 玩家左键（攻击）墓碑方块
/*
mc.listen("onAttackBlock", (player, block, item) => {
    if (player.isSimulatedPlayer()) return;
    if (graveBlockTypeNames.includes(block.type)) breakGrave(player, block);
    logger.debug(`onAttackBlock 触发.`);
});
*/

// 玩家开始破坏方块/点击左键
mc.listen("onStartDestroyBlock", (player, block) => {
    if (player.isSimulatedPlayer()) return;
    if (graveBlockTypeNames.includes(block.type)) breakGrave(player, block);
    //logger.debug(`onStartDestroyBlock 触发.`);
});

mc.listen("onDestroyBlock", (player, block) => {
    try {
        if (player.isSimulatedPlayer()) return;

        if (graveBlockTypeNames.includes(block.type)) {
            const pos = block.pos;
            const x = pos.x, y = pos.y, z = pos.z;
            const dimid = pos.dimid;

            // ================ 获取墓碑实体·方案一 ================

            const /**@type {Array<Entity,Entity,...>} 所有墓碑实体的数组*/entities = mc.getEntities(pos).filter(en => en && en.type === graveEntityTypeName);

            const graveEntity = entities.length === 1 ? entities[0] : false;

            // ================ 获取墓碑实体·方案二 ================
            /*
            const entities = mc.getAllEntities().filter(entity => entity && entity.type === graveEntityTypeName && entity.getAllTags().length > 0);
            const graveEntity = 1;
            */

            if (graveEntity) {
                const graveEntityAllTags = graveEntity.getAllTags() || [];
                const graveEntityTag = graveEntityAllTags.length === 1 ? graveEntityAllTags[0] : false;

                // 这里不需要判断是否有管理员权限，因为如果有权限早在 onStartDestroyBlock 事件中就触发了，管理员依然可以越权
                if (graveEntityTag && player.xuid !== graveEntityTag) {
                    const owner = data.xuid2name(graveEntityTag);
                    player.sendText(`§c禁止破坏他人 ${owner} 的墓碑！`);
                    logger.debug(`${player.realName} 试图破坏 ${owner} 的墓碑，位置：${block.pos}，已成功拦截。`);
                    return false;
                } else {
                    const mainHandItem = player.getHand();
                    const offHandItem = player.getOffHand();

                    // 检查主手或副手是否为钥匙
                    const graveKey = [mainHandItem, offHandItem].find(item =>
                        !item.isNull() && item.type === graveKeyTypeName
                    );
                    if (graveKey) {
                        const lore = graveKey.lore || [];

                        if (lore.length >= 2) {

                            const graveLocation = lore[0].split(":")[1].trim().replace(/§[a-zA-Z0-9]/g, '').split(",");
                            const graveX = parseInt(graveLocation[0].trim());
                            const graveY = parseInt(graveLocation[1].trim());
                            const graveZ = parseInt(graveLocation[2].trim());
                            const graveDim = lore[1].replace(/§[a-zA-Z0-9]/g, '');
                            const graveDimid = DIMIDS[graveDim];

                            if (graveX === x && graveY === y && graveZ === z && graveDimid === dimid) {
                                logger.debug(`${player.realName} 试图破坏 自己 的墓碑，进行掉落墓碑中物品。`);

                                //graveEntity.triggerEvent("spawnItem");
                                dropItemsFromGraveEntity(graveEntity, pos);

                                // 移除墓碑实体和方块
                                //mc.runcmd(`setblock ${x} ${y} ${z} air destroy`);
                                block.destroy(Boolean(getGraveConfig("dropGraveBlock")));

                                graveManager.removeGrave(graveEntity);

                                graveEntity.despawn();

                                // 播放音效
                                playSound(player, "random.break", 0.5); // volume 0.5
                                playSound(player, "block.end_portal.spawn", 1, 1.5); // pitch 1.5

                                // 生成粒子
                                for (let i = 0; i < 12; i++) {
                                    mc.spawnParticle(new FloatPos(x + 0.5, y + 0.5, z + 0.5, dimid), "effect99:souls");
                                }

                                graveKey.setNull();
                                player.refreshItems();
                            } else {
                                player.sendText('§c你拿的是错误的钥匙!');
                                //logger.debug(`graveX : ${graveX} | graveY : ${graveY} | graveZ : ${graveZ} | graveDimid : ${graveDimid}`);
                                //logger.debug(`x : ${x} | y : ${y} | z : ${z} | dimid : ${dimid}`);
                                return false;
                            }
                        } else {
                            player.sendText('§c你拿的钥匙中没有墓碑信息!');
                            //logger.debug(`graveX : ${graveX} | graveY : ${graveY} | graveZ : ${graveZ} | graveDimid : ${graveDimid}`);
                            //logger.debug(`x : ${x} | y : ${y} | z : ${z} | dimid : ${dimid}`);
                            return false;
                        }
                    } else {
                        player.sendText('§c你需要一把钥匙\n\n\n', 5);
                        return false;
                    }
                }
                //mc.broadcast(`[内部] 玩家挖掘了方块 ${block.name} ${block.type} ${block.pos}`);

            } else {
                // 墓碑实体不存在，已将墓碑方块设置为不可销毁
                setGraveBlockDestructible(block, 0);

                // 打印调试信息和错误日志
                if (debugMode) {
                    mc.broadcast(`[onDestroyBlock] 玩家挖掘了方块 ${block.name} ${block.type} ${block.pos} | graveEntity : ${graveEntity}`);
                    mc.broadcast(`[onDestroyBlock] ${block.pos} 处的墓碑实体不存在（可能发生偏移？）已将墓碑方块设置为不可销毁，如遇墓碑方块仍被破坏请检查控制台和代码！`);
                    logger.fatal(`[onDestroyBlock] entities.some(entity => entity.type === graveEntityTypeName) : ${entities.some(entity => entity.type === graveEntityTypeName)}`);
                    logger.fatal(`[onDestroyBlock] entities.length === 1 : ${entities.length === 1} | entities.length : ${entities.length}`);
                    if (entities.length !== 1 && entities.length !== 0) entities.forEach((en, index) => { logger.debug(`第 ${index + 1} 个实体 : ${en.name} | ${en.type} | ${en.pos} | ${en.blockPos}`); });
                    if (entities.length !== 0) logger.fatal(`[onDestroyBlock] entities[0].type === graveEntityTypeName : ${entities[0].type === graveEntityTypeName}`);
                }
            }
        }
    } catch (error) {
        logError("onDestroyBlock", error);
    };
});

mc.listen("onPlayerDie", (player, _source) => {
    try {
        if (player.isSimulatedPlayer()) return;

        // 增加死亡榜分数
        const deathCountScoreboard = getGraveConfig("economicConfig").deathCountScoreboard;
        if (mc.getScoreObjective(deathCountScoreboard)) player.addScore(deathCountScoreboard, 1);

        // 获取玩家死亡维度的配置
        const dimid = player.blockPos.dimid;
        const dimensionConfig = getGraveConfig("dimensionConfig");
        let dimConfig = null;

        // 查找匹配的维度配置
        for (const key in dimensionConfig) {
            if (dimensionConfig[key].dimid === dimid) {
                dimConfig = dimensionConfig[key];
                break;
            };
        };

        // 如果找不到配置则跳过
        if (!dimConfig) {
            logger.fatal(`未找到维度ID ${dimid} 的配置！`);
            return;
        };

        // 根据维度配置执行墓碑生成
        if (dimConfig.generateGrave) {
            playerDie(player);
        };

        // 根据维度配置执行经验掉落
        if (dimConfig.dropXpOrb && dimConfig.dropExpPercent > 0) {
            reducePlayerExpAndDropExpOrb(player, dimConfig.dropExpPercent);
        };
    } catch (error) {
        logError("onPlayerDie", error);
    };
});

/*
// 不知道干嘛的：https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/systemafterevents?view=minecraft-bedrock-stable
system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id === "grave:model") {
        e.sourceEntity.runCommand(`setblock ~ ~ ~ ${graves[e.sourceEntity.getProperty("grave:model")]} ["block:destructible":1]`)
        // 在墓碑实体的位置放置一个墓碑方块并设置为可销毁？还是不知道干嘛的
    }
})
*/

function getDirection3(player, target) {
    // 坐标处理
    const trunc = v => +(v.toFixed(2));
    const { x: px, y: py, z: pz } = player.feetPos;
    const [dx, dy, dz] = [target[0] - trunc(px), target[1] - trunc(py), target[2] - trunc(pz)];

    // 阶段一：三维近距检测
    if ((dx ** 2 + dy ** 2 + dz ** 2) <= 64) { // 8^2=64
        return `非常近(${Math.round(Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2))}格内)`;
    }

    // 阶段二：垂直方向检测（平面距离小于5，垂直距离小于8）
    const hDistSq = dx ** 2 + dz ** 2;
    if (hDistSq <= 25 && dy ** 2 >= 64) { // 5^2=25, 8^2=64
        return dy > 0 ? "上方" : "下方";
    }

    // 阶段三：朝向投影计算
    const yawRad = (player.direction.yaw % 360) * Math.PI / 180;
    const [fx, fz] = [-Math.sin(yawRad), Math.cos(yawRad)];  // 前方向量
    const [rx, rz] = [-fz, fx];                             // 右方向量

    // 计算投影分量（点积计算）
    const frontProj = dx * fx + dz * fz;
    const rightProj = dx * rx + dz * rz;

    // 方向阈值判断
    const absFront = Math.abs(frontProj);
    const absRight = Math.abs(rightProj);
    const DOMINANT_RATIO = 2;

    return absFront > absRight * DOMINANT_RATIO ? (frontProj > 0 ? "正前方" : "正后方") :
        absRight > absFront * DOMINANT_RATIO ? (rightProj > 0 ? "正右方" : "正左方") :
            frontProj > 0 ? (rightProj > 0 ? "右前方" : "左前方") :
                (rightProj > 0 ? "右后方" : "左后方");
}

/**
 * 将秒数转换为分秒格式字符串
 * @param {number} totalSeconds - 总秒数（自动取整处理）
 * @returns {string} 格式化后的时间字符串
 * 
 * @example
 * formatTime(125)   // "2分5秒"
 * formatTime(45)    // "45秒"
 * formatTime(60)    // "1分"
 */
function formatTime(totalSeconds) {
    // 参数校验与整数处理
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));

    // 时间单位分解
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // 分段拼接逻辑
    const timeParts = [];
    if (minutes > 0) {
        timeParts.push(`${minutes}分`);
        if (remainingSeconds > 0) {
            timeParts.push(`${remainingSeconds}秒`);
        }
    } else {
        timeParts.push(`${remainingSeconds}秒`);
    }

    return timeParts.join('');
}

/**
 * 开启/打碎墓碑
 * @param {Player} player 
 * @param {Block} block 
 */
function breakGrave(player, block) {
    try {
        const admins = getGraveConfig("admins");
        const pos = block.pos;
        const x = pos.x, y = pos.y, z = pos.z;
        const dimid = pos.dimid;

        const /**@type {Array<Entity,Entity,...>} 所有墓碑实体的数组*/entities = mc.getEntities(pos).filter(en => en && en.type === graveEntityTypeName);

        const mainHandItem = player.getHand();
        const offHandItem = player.getOffHand();

        // 检查主手或副手是否为钥匙
        const graveKey = [mainHandItem, offHandItem].find(item =>
            !item.isNull() && item.type === graveKeyTypeName
        );

        const graveEntity = entities.length === 1 ? entities[0] : false;

        if (graveEntity) {
            const graveEntityAllTags = graveEntity.getAllTags() || [];
            const graveEntityTag = graveEntityAllTags.length === 1 ? graveEntityAllTags[0] : false;

            if (player.isOP() && admins.includes(player.realName)) {

                if (graveEntityTag && player.xuid !== graveEntityTag) {
                    const owner = data.xuid2name(graveEntityTag);
                    logger.warn(`[breakGrave] 墓碑管理员 ${player.realName} 挖掘了 ${owner} 的墓碑！`);
                } else {
                    logger.warn(`[breakGrave] 墓碑管理员 ${player.realName} 挖掘了 自己 的墓碑：${block.pos}！`);
                }

                //graveEntity.triggerEvent("spawnItem");
                dropItemsFromGraveEntity(graveEntity, pos);

                // 移除墓碑实体和方块
                //mc.runcmd(`setblock ${x} ${y} ${z} air destroy`);
                block.destroy(Boolean(getGraveConfig("dropGraveBlock")));

                graveManager.removeGrave(graveEntity);

                graveEntity.despawn();

                // 播放音效
                playSound(player, "random.break", 0.5); // volume 0.5
                playSound(player, "block.end_portal.spawn", 1, 1.5); // pitch 1.5

                // 生成粒子
                for (let i = 0; i < 12; i++) {
                    mc.spawnParticle(new FloatPos(x + 0.5, y + 0.5, z + 0.5, dimid), "effect99:souls");
                }
            } else {
                if (graveKey) {

                    // 安全处理lore数据
                    const lore = graveKey.lore || [];

                    if (lore.length >= 2) {

                        const graveLocation = lore[0].split(":")[1].trim().replace(/§[a-zA-Z0-9]/g, '').split(",");
                        const graveX = parseInt(graveLocation[0].trim());
                        const graveY = parseInt(graveLocation[1].trim());
                        const graveZ = parseInt(graveLocation[2].trim());
                        const graveDim = lore[1].replace(/§[a-zA-Z0-9]/g, '');
                        const graveDimid = DIMIDS[graveDim];

                        const hasPlayerXuidTag = graveEntity.getAllTags().some(tag => tag === player.xuid);

                        if (hasPlayerXuidTag) { // 判断墓碑实体是否拥有玩家xuid的tag标签

                            if (graveX === x && graveY === y && graveZ === z && graveDimid === dimid) {

                                logger.warn(`[breakGrave] 玩家 ${player.realName} 挖掘了 自己 的墓碑：${block.pos}！`);

                                //graveEntity.triggerEvent("spawnItem");
                                dropItemsFromGraveEntity(graveEntity, pos);

                                // 移除墓碑实体和方块
                                //mc.runcmd(`setblock ${x} ${y} ${z} air destroy`);
                                block.destroy(Boolean(getGraveConfig("dropGraveBlock")));
                                graveEntity.despawn();

                                // 播放音效
                                playSound(player, "random.break", 0.5); // volume 0.5
                                playSound(player, "block.end_portal.spawn", 1, 1.5); // pitch 1.5

                                // 生成粒子
                                for (let i = 0; i < 12; i++) {
                                    mc.spawnParticle(new FloatPos(x + 0.5, y + 0.5, z + 0.5, dimid), "effect99:souls");
                                }

                                graveKey.setNull();
                                player.refreshItems();
                            } else {
                                player.sendText('§c你拿的是错误的钥匙!');
                                //logger.debug(`graveX : ${graveX} | graveY : ${graveY} | graveZ : ${graveZ} | graveDimid : ${graveDimid}`);
                                //logger.debug(`x : ${x} | y : ${y} | z : ${z} | dimid : ${dimid}`);
                            }
                        } else {
                            player.sendText('§p你不是此墓碑的主人.\n\n\n', 5);
                        }
                    } else { // 钥匙物品没有lore时
                        const hasPlayerXuidTag = graveEntity.getAllTags().some(tag => tag === player.xuid);

                        if (hasPlayerXuidTag) {
                            playSound(player, "random.pop");
                            const newLore = [
                                `§r§9墓碑位置: §c${x}, ${y}, ${z}`,
                                `§r§8${pos.dim}`
                            ];
                            graveKey.setLore(newLore);
                            player.refreshItems();
                        } else {
                            player.sendText('§p你不是此墓碑的主人.\n\n\n', 5);
                        }
                    }
                } else {
                    player.sendText('§c你需要一把钥匙\n\n\n', 5);
                }
            }
        } else {
            // 墓碑实体不存在，已将墓碑方块设置为不可销毁
            setGraveBlockDestructible(block, 0);

            // 打印调试信息和错误日志
            if (debugMode) {
                mc.broadcast(`[breakGrave] graveEntity : ${graveEntity}`);
                mc.broadcast(`[breakGrave] ${block.pos} 处的墓碑实体不存在（可能发生偏移？）已将墓碑方块设置为不可销毁，如遇墓碑方块仍被破坏请检查控制台和代码！`);
                logger.fatal(`[breakGrave] entities.some(entity => entity.type === graveEntityTypeName) : ${entities.some(entity => entity.type === graveEntityTypeName)}`);
                logger.fatal(`[breakGrave] entities.length === 1 : ${entities.length === 1} | entities.length : ${entities.length}`);
                if (entities.length !== 1 && entities.length !== 0) entities.forEach((en, index) => { logger.debug(`第 ${index + 1} 个实体 : ${en.name} | ${en.type} | ${en.pos} | ${en.blockPos}`); });
                if (entities.length !== 0) logger.fatal(`[breakGrave] entities[0].type === graveEntityTypeName : ${entities[0].type === graveEntityTypeName}`);
            }
        }
    } catch (error) {
        logError("breakGrave", error);
    }
}

// setGraveBlockDestructible 这个函数貌似能成功设置但是好像没什么用？block:destructible这个属性到底干嘛的？设置为0也还是可以挖掘破坏
// 疑似是 minecraft:custom_components 自定义组件：https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_custom_components?view=minecraft-bedrock-stable
/**
 * 设置墓碑方块可销毁属性
 * @param {Block} block 
 * @param {number} destructible 0 为不可销毁 | 1为可销毁
 */
function setGraveBlockDestructible(block, destructible) { // 把可销毁属性设置为0（false，即为不可销毁，好像是防止破坏？）
    if (!block) return false;
    const blockNbt = block.getNbt();
    const states = blockNbt.getTag("states");
    states.setString("minecraft:cardinal_direction", ["north", "south", "west", "east"][Math.floor(Math.random() * 4)]);
    states.setByte("block:destructible", destructible); // destructible：可破坏的
    return blockNbt.setTag("states", states);
}

/**
 * 从墓碑实体中将其掉落物生成
 * @param {Entity} graveEntity 
 * @param {IntPos} pos 
 */
function dropItemsFromGraveEntity(graveEntity, pos = graveEntity.pos) {
    if (!graveEntity) return;

    // 获取墓碑实体的NBT数据
    const nbt = graveEntity.getNbt();
    if (!nbt) return;
    try {
        // 获取ChestItems列表（包含墓碑中的物品）
        const chestItems = nbt.getTag("ChestItems");
        if (!chestItems || chestItems.getType() !== NBT.List) return;

        // 遍历所有物品
        for (let i = 0; i < chestItems.getSize(); i++) {
            const itemNbt = chestItems.getTag(i);
            if (!itemNbt || itemNbt.getType() !== NBT.Compound) continue;

            // 从NBT创建物品对象
            const item = mc.newItem(itemNbt);
            if (item && !item.isNull()) {
                // 在指定位置生成掉落物
                mc.spawnItem(item, pos);
            }
        }

        // 清空墓碑中的物品
        //chestItems.clear(); // NbtType.clear() 方法不存在
        nbt.setTag("ChestItems", chestItems);
        graveEntity.setNbt(nbt);
    } catch (e) {
        logger.error("处理墓碑实体中的物品时出错:", e);
    } finally {
        // 销毁NBT对象释放内存
        if (nbt) nbt.destroy(); // ？？？文档中是destroy，但补全中是destory（补全错误，文档正确），正确的是：destroy
    }
}

/**
 * 设置墓碑实体的物品栏
 * @param {Array<Item>} playerInventory 玩家物品栏数组
 * @param {Entity} graveEntity 墓碑实体对象
 * @returns {boolean} 是否成功设置
 */
function setGraveInventory(playerInventory, graveEntity) {
    // 获取墓碑实体的NBT
    const graveNbt = graveEntity.getNbt();
    if (!graveNbt) return false;

    // 创建新的 ChestItems 列表 (NbtList)
    const chestItems = new NbtList([]);

    // 处理42个槽位（0-41）
    for (let slot = 0; slot < 42; slot++) {
        let itemTag = new NbtCompound({});

        if (slot < playerInventory.length && playerInventory[slot] && !playerInventory[slot].isNull()) {
            // 玩家物品栏中的物品
            const item = playerInventory[slot];
            if (hasCurseofVanishing(item)) continue;

            // 通过NBT获取Block数据（如果物品是方块）
            if (item.isBlock) {
                const itemNbt = item.getNbt();
                if (itemNbt) {
                    const blockTag = itemNbt.getTag("Block");
                    if (blockTag) {
                        itemTag.setTag("Block", blockTag);
                    }
                }
            }

            // 通过NBT获取额外的tag数据
            const itemNbt = item.getNbt();
            if (itemNbt) {
                const extraTag = itemNbt.getTag("tag");
                if (extraTag) {
                    itemTag.setTag("tag", extraTag);
                }
            }

            // 设置物品基础属性
            itemTag.setByte("Count", item.count);
            itemTag.setShort("Damage", item.aux); // 使用aux属性作为Damage值
            itemTag.setString("Name", item.type); // 使用type属性作为物品名
            itemTag.setByte("Slot", slot);
            itemTag.setByte("WasPickedUp", 0); // 总是设为0

        } else {
            // 空槽位
            itemTag.setByte("Count", 0);
            itemTag.setShort("Damage", 0);
            itemTag.setString("Name", "");
            itemTag.setByte("Slot", slot);
            itemTag.setByte("WasPickedUp", 0);
        }

        chestItems.addTag(itemTag);
    }

    // 更新墓碑NBT
    graveNbt.setTag("ChestItems", chestItems);

    // 将修改后的NBT写回实体
    return graveEntity.setNbt(graveNbt);
}

/**
 * 修改墓碑实体的模型属性
 * @param {Entity} graveEntity 墓碑实体对象
 * @param {number} modelId 要设置的模型ID
 * @returns {boolean} 是否成功修改
 */
function setGraveModel(graveEntity, modelId) {
    // 获取墓碑实体的NBT
    const graveNbt = graveEntity.getNbt();
    if (!graveNbt) return false;

    // 获取或创建 properties 标签
    let propertiesTag = graveNbt.getTag("properties");
    if (!propertiesTag /*|| propertiesTag.getType() !== NBT.Compound*/) {
        propertiesTag = new NbtCompound({});
    }

    // 设置 grave:model 值
    propertiesTag.setInt("grave:model", modelId);

    // 更新 properties 标签
    graveNbt.setTag("properties", propertiesTag);

    // 将修改后的NBT写回实体
    return graveEntity.setNbt(graveNbt);
}

/**
 * 判断盔甲栏物品对象是否拥有消失诅咒
 * @param {Item} item 物品对象
 * @returns 该盔甲栏物品对象是否拥有消失诅咒
 */
function hasCurseofVanishing(item) {
    if (item == null) return false;
    let tag = item.getNbt().getData("tag");
    if (tag != null) {
        let ench = tag.getData("ench");
        if (ench != null) {
            ench = ench.toArray();
            for (let e of ench) {
                if (e.id == 28 && !item.isEnchantingBook) { // 28 是 消失诅咒 27 是绑定诅咒
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 清除玩家背包内全部物品（不清除锁定标签和死亡不掉落标签的物品）
 * @param {Player} player 玩家对象e
 */
function clearPlayerAllItems(player) {
    const whiteListItems = getGraveConfig("whiteListItems");
    let success = true;

    player.getInventory().getAllItems().forEach(item => {
        if (item != null && !item.isNull() &&
            item.type !== graveKeyTypeName && !whiteListItems.includes(item.type) &&
            getItemLockMode(item) === 0 && !getItemIsKeepOnDeath(item)) {
            success = success && item.setNull();
        }
    });

    player.getArmor().getAllItems().forEach(item => {
        if (item != null && !item.isNull() &&
            item.type !== graveKeyTypeName && !whiteListItems.includes(item.type) &&
            getItemLockMode(item) === 0 && !getItemIsKeepOnDeath(item)) {
            success = success && item.setNull();
        }
    });

    const offhandItem = player.getOffHand();
    if (offhandItem != null && !offhandItem.isNull() &&
        offhandItem.type !== graveKeyTypeName && !whiteListItems.includes(offhandItem.type) &&
        getItemLockMode(offhandItem) === 0 && !getItemIsKeepOnDeath(offhandItem)) {
        success = success && player.getOffHand().setNull();
    };

    success = success && player.refreshItems();

    return success;
}

/**
 * 获取玩家背包内所有物品对象列表
 * @param {Player} player 玩家对象
 */
function getPlayerAllClonedItems(player) {
    const whiteListItems = getGraveConfig("whiteListItems");
    let Items = [];
    const InventoryItems = player.getInventory().getAllItems().filter(it => !it.isNull());
    const OffHandItem = !player.getOffHand().isNull() ? [player.getOffHand()] : [];
    const ArmoItmes = player.getArmor().getAllItems().filter(it => !it.isNull());

    // 合并所有物品对象到 Items 数组中
    Items = [...InventoryItems, ...OffHandItem, ...ArmoItmes];

    // 定义一个新的数组，存储复制后的新的物品对象
    const clonedItems = Items.filter(item => {

        // 过滤未锁定的物品和带有死亡不掉落标签的物品
        return item != null && !item.isNull() &&
            getItemLockMode(item) === 0 && !getItemIsKeepOnDeath(item) &&
            item.type !== graveKeyTypeName && !whiteListItems.includes(item.type);

    }).map(item => item.clone()).filter(it => it != null);

    player.refreshItems();

    return clonedItems;
}

/*
{
    Count: 1b,
    Damage: 0s,
    Name: "minecraft:netherite_sword",
    WasPickedUp: 0b,
    tag: {
        Damage: 0,
        "minecraft:keep_on_death": 1b
    }
}
*/

/*
{
    Count: 1b,
    Damage: 0s,
    Name: "minecraft:clock",
    WasPickedUp: 0b,
    tag: {
        display: {
            Lore: ["手持钟", "点击地面或长按空气", "打开菜单"],
            Name: "服务器菜单"
        },
        ench: [],
        "minecraft:item_lock": 2b,
        "minecraft:keep_on_death": 1b
    }
}
*/

/**
 * 设置物品为死亡不掉落（修复版）
 * @param {Item} item 物品对象
 * @returns {Boolean} 是否设置成功
 */
function setItemKeepOnDeath(item) {
    try {
        if (!item) return false;
        // 获取物品的NBT数据
        let nbt = item.getNbt();

        // 处理无NBT或非Compound类型的情况
        if (!nbt || nbt.getType() !== NBT.Compound) {
            // 创建新的顶层Compound
            nbt = new NbtCompound();
        }

        // 获取或创建tag复合标签
        let tag = nbt.getTag("tag");
        if (!tag || tag.getType() !== NBT.Compound) {
            // 创建新的tag Compound
            tag = new NbtCompound();
            tag.setByte("minecraft:keep_on_death", 1); // 使用便捷方法
            // 将新tag添加到顶层NBT
            nbt.setTag("tag", tag);
        }

        // 设置minecraft:keep_on_death标签（使用Byte类型）
        tag.setByte("minecraft:keep_on_death", 1); // 使用便捷方法

        // 更新物品NBT并返回结果
        return item.setNbt(nbt);
    } catch (error) {
        logError("setItemKeepOnDeath", error);
        return false;
    }
}

/**
 * 检查物品是否设置了死亡不掉落（修复版）
 * @param {Item} item 物品对象
 * @returns {Boolean} 是否设置了死亡不掉落
 */
function getItemIsKeepOnDeath(item) {
    try {
        if (!item) return false;
        const nbt = item.getNbt();
        // 无NBT或非Compound类型直接返回false
        if (!nbt || nbt.getType() !== NBT.Compound) return false;

        // 获取tag复合标签
        const tag = nbt.getTag("tag");
        // 无tag或非Compound类型直接返回false
        if (!tag || tag.getType() !== NBT.Compound) return false;

        // 直接获取数据值（避免额外对象操作）
        const keepValue = tag.getData("minecraft:keep_on_death");

        // 检查是否为1（byte类型）
        return keepValue === 1;
    } catch (error) {
        logError("getItemIsKeepOnDeath", error);
        return false;
    }
}

/**
 * 设置物品的锁定模式
 * @param {Item} item 物品对象
 * @param {0|1|2} mode 锁定的模式 0:无 1:锁定在格子里 2:锁定在背包里
 * @returns {Boolean} 是否设置成功
 */
function setItemLockMode(item, mode) {
    try {
        if (!item) return false;
        // 获取物品的NBT数据
        let nbt = item.getNbt();

        // 处理无NBT或非Compound类型的情况
        if (!nbt || nbt.getType() !== NBT.Compound) {
            nbt = new NbtCompound();
        }

        // 获取或创建tag复合标签
        let tag = nbt.getTag("tag");
        if (!tag || tag.getType() !== NBT.Compound) {
            tag = new NbtCompound();
            if (mode !== 0) tag.setByte("minecraft:item_lock", mode);

            nbt.setTag("tag", tag);
        }

        // 根据模式值设置或移除item_lock标签
        if (mode === 0) {
            // 移除锁定标签（如果存在）
            tag.removeTag("minecraft:item_lock");
        } else {
            // 设置锁定模式（使用Byte类型）
            tag.setByte("minecraft:item_lock", mode);
        }

        // 更新物品NBT
        return item.setNbt(nbt);
    } catch (error) {
        logError("setItemLockMode", error);
        return false;
    }
}

/**
 * 获取物品对象锁定模式
 * @param {Item} item 
 * @returns {0|1|2} 锁定的模式 0:无 1:锁定在格子里 2:锁定在背包里
 */
function getItemLockMode(item) {
    try {
        if (!item) return false;
        // 获取物品的NBT数据
        const nbt = item.getNbt();
        if (!nbt) return 0; // 无NBT数据直接返回0

        // 获取tag复合标签
        const tag = nbt.getTag("tag");
        if (tag && tag.getType() === NBT.Compound) {
            // 检查item_lock标签
            const itemLock = tag.getTag("minecraft:item_lock");
            if (itemLock && itemLock.getType() === NBT.Byte) {
                // 返回锁定模式值（自动转换Byte为Number）
                return itemLock.get();
            }
        }
    } catch (error) {
        logError(`getItemLockMode`, error);
        return 0; // 默认返回无锁定
    }
    return 0; // 默认返回无锁定
}

/**
 * 设置墓碑实体名称（起到悬浮字效果）
 * @param {Entity} graveEntity 墓碑实体对象
 * @param {string} name 要设置的悬浮名称
 * @returns {boolean} 是否成功设置
 */
function setGraveEntityName(graveEntity, name) {
    // 获取墓碑实体的完整NBT
    const graveNbt = graveEntity.getNbt();
    if (!graveNbt) return false;

    // 设置新的CustomName（无论是否存在）
    graveNbt.setString("CustomName", name);

    // 确保CustomNameVisible设置为1（显示名称）
    graveNbt.setByte("CustomNameVisible", 1);

    // 将修改后的完整NBT写回实体
    return graveEntity.setNbt(graveNbt);
}

/**
 * 计算两个三维坐标点之间的距离
 * @param {number} x1 - 第一个点的 x 坐标
 * @param {number} y1 - 第一个点的 y 坐标
 * @param {number} z1 - 第一个点的 z 坐标
 * @param {number} x2 - 第二个点的 x 坐标
 * @param {number} y2 - 第二个点的 y 坐标
 * @param {number} z2 - 第二个点的 z 坐标
 * @returns {number} - 返回两点之间的距离
 */
function calculateDistance3D(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.floor((Math.sqrt(dx * dx + dy * dy + dz * dz) - 0.5));
}

/**
 * 
 * @param {number} dimid 要执行指令的维度ID
 * @param {string} cmd 要执行的指令字符串
 */
function runCmdInAnyDimid(dimid, cmd) {
    if (dimid === 0) {
        mc.runcmdEx(`execute in overworld run ${cmd}`);
    } else if (dimid === 1) {
        mc.runcmdEx(`execute in nether run ${cmd}`);
    } else if (dimid === 2) {
        mc.runcmdEx(`execute in the_end run ${cmd}`);
    }
}
/**
 * 播放声音给玩家，此函数可能需要改善，支持在方块位置播放音效
 * @param {LLSE_Player} player 玩家对象
 * @param {string} soundID 音效ID字符串
 * @param {number} volume 音量数值,定声音能被听见的距离。必须至少为0.0。对小于1.0的值，声音会相对减轻，球状可闻范围会相对小。对大于1.0的值，声音不会实际上增大，但其可闻范围（1.0时半径为16米）会与音量相乘。声音总会基于与球体中心的距离逐渐衰减至无声。默认为1.0。
 * @param {number} pitch 音调，该数字没有特别限制，但是必须要在0.0至256.0之间才有对应效果。高于256.0的值与默认值的效果相同。小于等于0.0的值会导致听不到该声音。
 * @param {number} minimumVolume 定在声音可闻范围外的目标能听到的音量。若目标在可闻范围外，作为补偿，声源会被放置在距离目标较近的位置（距离小于4格），而-{}-最小音量会决定补偿声源的音量。
 */
function playSound(player, soundID, volume = 1, pitch = 1, minimumVolume = 1) {
    runCmdInAnyDimid(player.pos.dimid, `playsound ${soundID} "${player.realName}" ${player.feetPos.x} ${player.feetPos.y + 1} ${player.feetPos.z} ${volume} ${pitch} ${minimumVolume}`);
}

function logError(eventName, errorObj) {
    logger.error(`在 ${eventName} 中发生错误，error.message：${errorObj.message}`);
    logger.error(`在 ${eventName} 中发生错误，error.stack：${errorObj.stack}`);
}

// ==================== 开发者模式调试代码 ====================
if (devMode) {
    mc.listen("onChat", (player, msg) => {
        try {
            if (testersList.includes(player.realName)) {
                if (msg === "1") {
                    //const block = player.getBlockFromViewVector(false, false, 5, false);
                    //logger.debug(block?.getNbt().toSNBT(4));
                    const graveEntity = mc.getAllEntities().filter(entity => entity.type === graveEntityTypeName);
                    graveEntity.forEach((gEntity, index) => {
                        logger.debug(`[${index + 1}] 获取当前所有已加载的墓碑实体：${gEntity.name} | ${gEntity.type} | ${gEntity.pos} gEntity.uniqueId : ${gEntity.uniqueId} 类型 ： ${typeof gEntity.uniqueId} | gEntity.runtimeId : ${gEntity.runtimeId} 类型 ： ${typeof gEntity.runtimeId}`);
                        logger.debug(`${mc.getEntity(Number(gEntity.uniqueId)).type} | ${mc.getEntity(Number(gEntity.runtimeId)).type}`);
                        //logger.debug(`${gEntity.getNbt().toSNBT(4)}`);
                    });

                };
                if (msg === "2") {
                    const item = player.getHand();
                    logger.debug(item.getNbt().toSNBT(4));
                }
                if (msg === "3") {
                    const searchAvailableSpaceMode = getGraveConfig("searchAvailableSpaceMode");
                    const searchAvailableSpaceRadius = getGraveConfig("searchAvailableSpaceRadius");
                    const result = searchAvailableSpace(player.blockPos, searchAvailableSpaceRadius, searchAvailableSpaceMode);
                    logger.debug(result.success);
                    logger.debug(result.pos);

                    logger.debug(`function => searchAvailableSpace(pos, searchAvailableSpaceRadius, searchAvailableSpaceMode) -> 本次耗时：${result.duration}ms`);
                }
                if (msg === "4") {
                    player.sendText(`getItemLockMode : ${getItemLockMode(player.getHand())}`);
                }
                if (msg === "5") {
                    const succuss1 = setItemKeepOnDeath(player.getHand());
                    player.refreshItems();
                    player.sendText(`setItemKeepOnDeath(player.getHand()) : ${succuss1}`);
                }
                if (msg === "6") {
                    const success2 = getItemIsKeepOnDeath(player.getHand());
                    player.sendText(`getItemIsKeepOnDeath(player.getHand()) : ${success2}`);
                }
                if (msg === "7") {
                    const success3 = setItemLockMode(player.getHand(), 1);
                    player.refreshItems();
                    player.sendText(`setItemLockMode : ${success3}`);
                }
                if (msg === "8") {
                    logger.debug(player.getHand().getNbt().toSNBT(4));
                }
            }
        } catch (error) {
            logError("onChat", error);
        };
    });

    mc.listen("onMobHurt", (mob, source, damage, cause) => {
        if (mob.isPlayer()) {
            const player = mob.toPlayer();
            if (player && testersList.includes(player.realName)) {
                return false;
            }
        }
    });
}

// 插件卸载时清理计时器
ll.onUnload(() => {
    if (graveManager.timer) {
        clearInterval(graveManager.timer);
        graveManager.timer = null;
    }
});