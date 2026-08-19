// LiteLoader-AIDS automatic generated
/// <reference path="d:\LSE-API/dts/helperlib/src/index.d.ts"/> 


/*

    已完成：
    1. 配置文件与数据文件初始化
    2. 指令注册
    3. 假人租赁系统表单构建
    4. 金币购买假人逻辑（经济管理模块）
    5. 假人续租
    6. 假人快速上下线
    7. 假人自动重生设置
    
    ToDo：
    1. 创建假人时支持自定义写入备注
    2. 假人时长限时、到期自动收回逻辑（循环检查是否租赁到期）
    3. 支持自定义第三方API（例如计分板达到一定分数才能租赁假人）
    4. 假人执行操作部分优先完善假人传送至指定坐标/玩家

*/

const moneyManager = require("./lib/moneyManager");

// 初始化配置文件
const pluginConfig = new JsonConfigFile(`./plugins/B-FakePlayer/config/config.json`, JSON.stringify(
    {
        "maxFakePlayersPerUser": 5, // 每个玩家最大拥有假人数量
        "deposit": 8888, // 假人押金，租赁到期时返还
        "rentPerDay": 100, // 日租金额
        "distanceLimit": 100000, // 假人创建最远位置限制(XYZ的最大绝对值)
        "economic": {
            "economicType": "llmoney", // llmoney | scoreboard
            "scoreboardName": "money", // 计分板名称
            "currencyUnitName": "金币" // 货币单位名称
        }
    }, null, 4
))

const Economy = new moneyManager(pluginConfig.get("economic")["economicType"], pluginConfig.get("economic")["scoreboardName"]);

// 初始化数据文件
const pluginData = new JsonConfigFile(`./plugins/B-FakePlayer/data/data.json`, JSON.stringify(
    {

    }, null, 4
))

const distanceLimit = pluginConfig.get("distanceLimit"), deposit = pluginConfig.get("deposit"),
    currencyUnitName = pluginConfig.get("economic")["currencyUnitName"], maxFakePlayersPerUser = pluginConfig.get("maxFakePlayersPerUser"),
    rentPerDay = pluginConfig.get("rentPerDay")

// 初始化玩家数据
mc.listen("onJoin", (player) => {
    if (player.isSimulatedPlayer()) return;
    //logger.warn(pluginData.get(player.uuid));
    if ([undefined, null].includes(pluginData.get(player.uuid))) {
        pluginData.init(player.uuid, {
            "ownerName": player.realName,
            "ownFakePlayerCount": 0,
            "fakePlayersList": []
        })
    }
})

// 假人死亡自动重生
mc.listen("onPlayerDie", (player, _source) => {
    if (player.isSimulatedPlayer()) {
        const name = player.name, pos = player.blockPos;
        const res = isNameDuplicate(JSON.parse(pluginData.read()), name);
        if (res[0]) {
            setTimeout(() => {
                if (res[5] && res[8] && res[10] === "rented") {
                    const respawnPos = res[6] === `origin` ? new IntPos(res[1], res[2], res[3], res[4]) : pos;
                    if (player.simulateRespawn()) {
                        logger.warn(`${res[7]} 的假人：${name}(${respawnPos}) 自动重生成功!`);
                    } else {
                        logger.error(`${res[7]} 的假人：${name}(${respawnPos}) 自动重生失败!`);
                    }
                }
            }, 2000);
        };
    }
})

function sendQQGroupMsg(str) {
    if (ll.hasExported("SparkAPIEx", "sendGroupMsg")) {
        const groupId = ll.imports("SparkAPIEx", "getMainGroup")();
        ll.imports("SparkAPIEx", "sendGroupMsg")(groupId, str); // 导入 sparkbridge API
    }
}

function offlineAllFakePlayers() {
    const simulatedPlayers = mc.getOnlinePlayers().filter(player => player.isSimulatedPlayer());
    const obj = JSON.parse(pluginData.read());
    for (const player of simulatedPlayers) {
        if (isNameDuplicate(obj, player.name)[0]) {
            logger.warn(`插件被卸载，假人已下线：${player.name} ${player.blockPos}`);
            player.simulateDisconnect();
        }
    }
}

// 插件被卸载时下线所有假人（根据假人名称判断，仅下线本插件创建的假人）
ll.onUnload(() => {
    offlineAllFakePlayers();
    //logger.warn(`插件被卸载，下线假人...`);
});

mc.listen("onServerStarted", () => {

    // 开服自动上线玩家的假人
    setTimeout(() => {
        let obj = JSON.parse(pluginData.read());
        for (const playerUuid in obj) {
            if (obj.hasOwnProperty(playerUuid)) {
                const fakePlayersList = obj[playerUuid].fakePlayersList;
                for (const fakePlayer of fakePlayersList) {
                    if (fakePlayer.autoRespawnWhenServerStarted && fakePlayer.isOnline && fakePlayer.status === "rented") {
                        const spawnPos = new IntPos(fakePlayer.fpPosX, fakePlayer.fpPosY, fakePlayer.fpPosZ, fakePlayer.fpPosDimid);
                        if (mc.spawnSimulatedPlayer(fakePlayer.fpName, spawnPos)) {
                            logger.warn(`${obj[playerUuid].ownerName} 的假人：${fakePlayer.fpName}(${spawnPos}) 自动上线成功!`);
                        } else {
                            logger.error(`${obj[playerUuid].ownerName} 的假人：${fakePlayer.fpName}(${spawnPos}) 自动上线失败!`);
                        }
                    }
                }
            }
        }
    }, 2000);


    setInterval(() => {
        let obj = JSON.parse(pluginData.read());

        // 检查是否进入赎回期并设置赎回期
        for (const playerUuid in obj) {
            if (obj.hasOwnProperty(playerUuid)) {
                let fakePlayersList = obj[playerUuid].fakePlayersList;
                for (const fakePlayer of fakePlayersList) {
                    if (isAfter(fakePlayer.rentEndDate)) {
                        fakePlayersList = fakePlayersList.map(fp => {
                            if (fp.fpName === fakePlayer.fpName && fp.status === "rented") {
                                const fpPos = new IntPos(fp.fpPosX, fp.fpPosY, fp.fpPosZ, fp.fpPosDimid);
                                mc.broadcast(`§c${obj[playerUuid].ownerName} 的假人 ${fakePlayer.fpName} ${fpPos} 已进入赎回期`);
                                logger.warn(`${obj[playerUuid].ownerName} 的假人 ${fp.fpName} ${fpPos} 已进入赎回期`);
                                mc.getPlayer(fp.fpName)?.simulateDisconnect();
                                fp.status = "grace";
                                fp.isOnline = false;
                            }
                        });
                        pluginData.write(JSON.stringify(obj, null, 4));
                    }
                }
            }
        }
        // 检查是否超过赎回期并释放假人数据
        for (const playerUuid in obj) {
            if (obj.hasOwnProperty(playerUuid)) {
                let fakePlayersList = obj[playerUuid].fakePlayersList;
                for (const fakePlayer of fakePlayersList) {
                    if (isAfter(fakePlayer.destroyDate)) {
                        fakePlayersList = fakePlayersList.map(fp => {
                            if (fp.fpName === fakePlayer.fpName && fp.status !== "destroyed") {
                                const fpPos = new IntPos(fp.fpPosX, fp.fpPosY, fp.fpPosZ, fp.fpPosDimid);
                                mc.broadcast(`§c${obj[playerUuid].ownerName} 的假人 ${fakePlayer.fpName} ${fpPos} 已超过赎回期，已被销毁`);
                                logger.warn(`${obj[playerUuid].ownerName} 的假人 ${fp.fpName} ${fpPos} 已超过赎回期，已被销毁`);
                                mc.getPlayer(fp.fpName)?.simulateDisconnect();
                                /*
                                // 删除整个假人对象数据
                                const index = fakePlayersList.findIndex(fp =>
                                    fp.fpName === fakePlayer.fpName
                                );
                                const fpPos = new IntPos(fp.fpPosX, fp.fpPosY, fp.fpPosZ, fp.fpPosDimid);
                                mc.broadcast(`§c${obj[playerUuid].ownerName} 的假人 ${fp.fpName} ${fpPos} 已超过赎回期，全部资源已释放`)
                                logger.warn(`${obj[playerUuid].ownerName} 的假人 ${fp.fpName} ${fpPos} 已超过赎回期，全部资源已释放`);
                                fakePlayersList.splice(index, 1);
                                */
                                fp.status = "destroyed";
                                fp.isOnline = false;
                            }
                        });
                        pluginData.write(JSON.stringify(obj, null, 4));
                    }
                }
            }
        }

    }, 1000 * 1); // 60秒检查一次

    // 注册指令
    const command = mc.newCommand("bfakeplayer", "§6假人租赁系统", PermType.Any);
    command.setAlias("bfp");
    command.overload([]);
    command.setCallback((cmd, ori, out, res) => {
        if (!ori.player || ori.player.isSimulatedPlayer()) return out.error("此命令仅限玩家执行!");
        return mainForm(ori.player);

    })
    command.setup();
})

/**
 * 判断字符串中是否包含中文
 * @param {string} text 字符串
 * @returns 
 */
function containsChinese(text) {
    var pattern = /[\u4E00-\u9FA5]/; // 匹配中文字符的正则表达式范围
    return pattern.test(text); // 测试文本中是否包含中文字符
}
/**
 * 
 * @param {Object} obj 
 * @param {string} str 
 * @returns 
 */
function isNameDuplicate(obj, str) {
    for (const playerUuid in obj) {
        if (obj.hasOwnProperty(playerUuid)) {
            const fakePlayersList = obj[playerUuid].fakePlayersList;
            for (const fakePlayer of fakePlayersList) {
                if (fakePlayer.fpName === str) {
                    return [
                        true,
                        fakePlayer.fpPosX,
                        fakePlayer.fpPosY,
                        fakePlayer.fpPosZ,
                        fakePlayer.fpPosDimid,
                        fakePlayer.autoRespawnWhenDie,
                        fakePlayer.respawnPos,
                        obj[playerUuid].ownerName,
                        fakePlayer.isOnline,
                        fakePlayer.autoRespawnWhenServerStarted,
                        fakePlayer.status
                    ]; // 发现重复名称
                }
            }
        }
    }
    return [false]; // 未发现重复名称
}

/**
 * 反馈信息
 * @param {Player} player 
 * @param {string} str 
 */
function feedBack(player, str) {
    return player.tell(`§l§e[B-FakePlayer]§r§f ` + str);
}

/**
 * 主表单
 * @param {Player} player 
 */
function mainForm(player) {
    const form = mc.newSimpleForm()
        .setTitle(`B-FakePlayer 假人租赁系统 主菜单`)
        .setContent(`我的假人数量：${pluginData.get(player.uuid)["fakePlayersList"].length} 个\n请选择操作：`)

        .addButton(`假人租赁`, `textures/ui/color_plus`)
        .addButton(`管理假人`, `textures/ui/icon_multiplayer`)
        .addButton(`查看现有全部假人`, `textures/ui/magnifyingGlass`)
        .addButton(`关闭`);

    player.sendForm(form, (pl, id) => {
        if (id == null) return;
        switch (id) {
            case 0:
                if (pluginData.get(pl.uuid)["fakePlayersList"].length >= maxFakePlayersPerUser) return feedBack(pl, `§c您的假人数量已达到上限：${maxFakePlayersPerUser} 个`);
                rentForm(pl);
                break;
            case 1:
                managerForm(pl);
                break;
            case 2:
                queryForm(pl);
                break;
            case 3:
                break;
        }
    })
}
const DIMIDS = [`主世界`, `下界`, `末地`];
/**
 * 假人租赁
 * @param {Player} player 
 */
function rentForm(player) {
    const form = mc.newCustomForm();
    form.setTitle(`B-FakePlayer 假人租赁`)

        .addInput(`假人创建的名称：`, `可包含英文大小写数字空格(不可存在中文)`)
        .addInput(`假人创建坐标X轴：(填空将使用当前位置)`, `纯阿拉伯数字`)
        .addInput(`假人创建坐标Y轴：：(填空将使用当前位置)`, `纯阿拉伯数字`)
        .addInput(`假人创建坐标Z轴：：(填空将使用当前位置)`, `纯阿拉伯数字`)
        .addDropdown(`请选择假人创建所在维度：`, DIMIDS, 0)
        .addInput(`请输入租赁现实天数：`, `纯阿拉伯数字`);

    player.sendForm(form, (pl, id) => {
        if (id == null) return;

        let fpName = id[0], fpPosX = Number(id[1]), fpPosY = Number(id[2]), fpPosZ = Number(id[3]),
            fpPosDimid = id[4], rentDays = Number(id[5]), obj = JSON.parse(pluginData.read());

        //logger.warn(`Name：${fpName}\nX：${fpPosX}\nY：${fpPosY}\nZ：${fpPosZ}\ndimid：${fpPosDimid}\n租赁天数：${rentDays}`);

        if (fpName.length <= 0) return feedBack(pl, `§c请输入假人名称`);
        if (containsChinese(fpName)) return feedBack(pl, `§c假人名称中禁止包含中文`);
        if (fpName.includes(`§`)) return feedBack(pl, `§c假人名称中禁止包含§`);
        if (isNameDuplicate(obj, fpName)[0]) return feedBack(pl, `§c您创建的假人名称与其他玩家的假人名称重复`);
        if ([id[1], id[2], id[3]].some(v => v.length <= 0)) fpPosX = pl.blockPos.x, fpPosY = pl.blockPos.y, fpPosZ = pl.blockPos.z, fpPosDimid = pl.blockPos.dimid;
        if ([fpPosX, fpPosY, fpPosZ].some(v => isNaN(v) || Math.abs(v) > distanceLimit)) return feedBack(pl, `§c假人创建位置禁止超过±${distanceLimit}`);
        if (id[5].length <= 0 || isNaN(rentDays) || rentDays > 30 || rentDays <= 0) return feedBack(pl, `§c租赁天数必须在0~30天之间`);
        if (Economy.get(pl.xuid) < deposit + rentPerDay * rentDays) return feedBack(pl, `§c您的余额不足 ${deposit} ${currencyUnitName}`);

        let content = [
            `假人名称：${fpName}`,
            `假人位置：${new IntPos(fpPosX, fpPosY, fpPosZ, fpPosDimid)}`,
            `假人租赁押金：${deposit} ${currencyUnitName}，租赁到期时退还`,
            `假人日租金：${rentPerDay}`,
            `您本次共需支付${deposit + rentPerDay * rentDays} ${currencyUnitName}`
        ];
        pl.sendModalForm(
            `B-FakePlayer 确认租赁假人`, content.join("\n§f"),
            `确认租赁`, `取消租赁`, (p, r) => {
                if (r) {
                    // 试图创建假人
                    if (!mc.spawnSimulatedPlayer(fpName, new IntPos(fpPosX, fpPosY, fpPosZ, fpPosDimid))) return feedBack(pl, `§c创建假人失败，请联系服务器管理员`);
                    feedBack(pl, `§a创建假人成功：${fpName},(${DIMIDS[fpPosDimid]})${fpPosX},${fpPosY},${fpPosZ}`);
                    Economy.reduce(pl.xuid, deposit + rentPerDay * rentDays);

                    let tempData = pluginData.get(pl.uuid);
                    tempData["fakePlayersList"].push(
                        {
                            "fpName": fpName,
                            "fpPosX": fpPosX,
                            "fpPosY": fpPosY,
                            "fpPosZ": fpPosZ,
                            "fpPosDimid": fpPosDimid,
                            "createdTime": system.getTimeStr(),
                            "autoRespawnWhenDie": true,
                            "autoRespawnWhenServerStarted": true, // 插件被热重载时也会触发 onServerStarted
                            "respawnPos": "origin", // origin | current 原位置复活 或 现位置复活
                            "rentEndDate": addDays(system.getTimeStr(), rentDays),
                            "destroyDate": addDays(system.getTimeStr(), rentDays + 7), // 此处有待完善（自定义赎回期天数）
                            "isOnline": true, // true | false
                            "status": "rented", // rented (租赁中) | grace (赎回期) | destroyed (已销毁)
                            "inventory": [] // 背包内物品SNBT数组
                        }
                    )
                    tempData["ownFakePlayerCount"] += 1;
                    pluginData.set(pl.uuid, tempData);
                    pluginData.reload();
                } else {
                    feedBack(p, `取消本次假人租赁`);
                }
            }
        )
    })
}
/**
 * 我的假人列表
 * @param {Player} player 
 */
function fakePlayersListForm(player) {
    const form = mc.newSimpleForm();
    form.setTitle(`B-FakePlayer 我的假人列表`)
        .setContent(`请选择操作：`)

    let obj = JSON.parse(pluginData.read());
    let fakePlayers = [];
    for (const playerUuid in obj) {
        if (obj.hasOwnProperty(playerUuid)) {
            const fakePlayersList = obj[playerUuid].fakePlayersList;
            for (const fakePlayer of fakePlayersList) {
                if (fakePlayer.status !== "destroyed") {
                    const spawnPos = new IntPos(fakePlayer.fpPosX, fakePlayer.fpPosY, fakePlayer.fpPosZ, fakePlayer.fpPosDimid);
                    // 将 fakePlayer 对象存储到数组中，以便在后续操作中使用
                    fakePlayers.push({
                        name: fakePlayer.fpName,
                        pos: spawnPos,
                        isOnline: !!mc.getPlayer(fakePlayer.fpName),
                        status: fakePlayer.status,
                        createdTime: fakePlayer.createdTime,
                        rentEndDate: fakePlayer.rentEndDate,
                        playerUuid: playerUuid
                    });
                    form.addButton(`${fakePlayer.fpName}(${spawnPos}) ${mc.getPlayer(fakePlayer.fpName) ? ` - §a在线` : ` - §c离线`}`);
                }
            }
        }
    }
    // 操作按钮放在最后
    form.addButton(`上线所有假人`, `textures/ui/up_arrow`);
    form.addButton(`下线所有假人`, `textures/ui/down_arrow`);
    form.addButton(`返回上一级`, ``);

    player.sendForm(form, (pl, id) => {
        if (id == null) return;
        // 处理操作按钮点击（最后添加的三个按钮）
        if (id >= fakePlayers.length) {
            const operationIndex = id - fakePlayers.length;
            switch (operationIndex) {
                case 0: // 上线所有假人
                    for (const fakePlayer in fakePlayers) {
                        const fplayer = fakePlayers[fakePlayer];
                        const online = fplayer.isOnline && Boolean(mc.getPlayer(fplayer.name));

                        if (!online && fplayer.status === "rented") {
                            feedBack(pl, `§6假人 ${fplayer.name} (${fplayer.pos}) §a已上线`);
                            mc.spawnSimulatedPlayer(fplayer.name, fplayer.pos);
                            fplayer.isOnline = true; // 更新假人的在线状态（此行似乎没有意义）
                            obj[fplayer.playerUuid].fakePlayersList.find(fp => fp.fpName === fplayer.name).isOnline = true;
                        }
                    }
                    break;
                case 1: // 下线所有假人
                    for (const fakePlayer in fakePlayers) {
                        const fplayer = fakePlayers[fakePlayer];
                        const online = fplayer.isOnline && Boolean(mc.getPlayer(fplayer.name));

                        if (online && fplayer.status === "rented") {
                            feedBack(pl, `§6假人 ${fplayer.name} (${fplayer.pos}) §c已下线`);
                            mc.getPlayer(fplayer.name).simulateDisconnect();
                            fplayer.isOnline = false; // 更新假人的在线状态
                            obj[fplayer.playerUuid].fakePlayersList.find(fp => fp.fpName === fplayer.name).isOnline = false;
                        }
                    }
                    break;
                case 2: // 返回上一级
                    managerForm(pl);
                    break;
            }
            pluginData.write(JSON.stringify(obj, null, 4));
            return;
        }
        const selectedFakePlayer = fakePlayers[id];
        const fp = (mc.getPlayer(selectedFakePlayer.name) && selectedFakePlayer.isOnline) ? mc.getPlayer(selectedFakePlayer.name) : false;
        let content = [
            `假人名称：${selectedFakePlayer.name}`,
            `假人坐标：(${selectedFakePlayer.pos})`,
            `假人租赁开始时间：${selectedFakePlayer.createdTime}`,
            `假人上线状态：${fp ? ` - §a在线` : ` - §c离线`}`
        ];
        if (fp) content.push(`假人生命值：${fp.health} / ${fp.maxHealth}`);
        content.push(`假人租赁状态：${selectedFakePlayer.status === `rented` ? `§a租赁中` : selectedFakePlayer.status === `grace` ? `§6赎回期` : `§c已销毁`}`);
        content.push(`假人到期时间：${selectedFakePlayer.rentEndDate}`);

        pl.sendSimpleForm(
            `B-FakePlayer 假人信息`, content.join("\n§f"),
            [`下线当前假人`, `删除此假人`, `假人物品栏操作`, `假人自动重生设置`, `假人续租`, `返回上一级`],
            [`textures/ui/down_arrow`, `textures/ui/cancel`, `textures/ui/inventory_icon`, `textures/ui/settings_glyph_color_2x`, `textures/items/clock_item`, ``],
            (p, i) => {
                if (i == null) return;
                switch (i) {
                    case 0:  // 下线当前假人
                        if (fp) {
                            selectedFakePlayer.isOnline = false; // 更新假人的在线状态
                            obj[selectedFakePlayer.playerUuid].fakePlayersList.find(fp => fp.fpName === selectedFakePlayer.name).isOnline = false;
                            feedBack(pl, `§6假人 ${fp.name} (${fp.pos}) §c已下线`);
                            fp.simulateDisconnect();
                        } else {
                            feedBack(pl, `§6假人 ${selectedFakePlayer.name} (${selectedFakePlayer.pos}) §c当前已经离线`);
                        }
                        break;
                    case 1:  // 删除此假人
                        // 查找对应的玩家数据
                        p.sendModalForm(
                            `B-FakePlayer 我的假人列表`, `确认删除此假人？\n假人名称：${selectedFakePlayer.name}\n假人位置：${selectedFakePlayer.pos}`,
                            `确认删除`, `取消删除`, (pla, result) => {
                                if (result) {
                                    const playerData = obj[selectedFakePlayer.playerUuid];
                                    if (playerData) {
                                        // 查找假人索引
                                        const index = playerData.fakePlayersList.findIndex(fp =>
                                            fp.fpName === selectedFakePlayer.name
                                        );
                                        if (index !== -1) {
                                            // 如果假人在线则先下线
                                            if (fp) {
                                                fp.simulateDisconnect();
                                                feedBack(pla, `§c已强制下线假人 ${selectedFakePlayer.name}`);
                                            }
                                            // 从内存中移除
                                            playerData.fakePlayersList.splice(index, 1);
                                            feedBack(pla, `§a已成功删除假人 ${selectedFakePlayer.name}`);
                                        } else {
                                            feedBack(pla, `§c错误：找不到该假人数据`);
                                        }
                                    } else {
                                        feedBack(pla, `§c错误：玩家数据不存在`);
                                    }
                                    pluginData.write(JSON.stringify(obj, null, 4));
                                }
                            }
                        )
                        break;
                    case 2:  // 假人物品栏操作
                        // 这里需要添加物品栏操作的逻辑
                        p.tell(`功能正在制作中...`);
                        break;
                    case 3: // 假人自动重生设置
                        autoRespawnSettingsForm(p, selectedFakePlayer.name);
                        break;
                    case 4:  // 假人续租
                        renewalRentForm(p, selectedFakePlayer.name);
                        break;
                    case 5:  // 返回上一级
                        fakePlayersListForm(p);
                        break;
                }
            }
        )
    })
}
/**
 * 假人快速上下线
 * @param {Player} player 
 */
function quicklyGoOnlineAndOfflineForm(player) {
    const form = mc.newCustomForm();
    form.setTitle(`B-FakePlayer 假人快速上下线`)
        .addLabel(`设置状态完毕后，点击“提交”完成操作：`) // id[0]

    let obj = JSON.parse(pluginData.read());
    let fakePlayers = [];
    let switchId = 1; // 用于记录 switch 元素的 id

    for (const playerUuid in obj) {
        if (obj.hasOwnProperty(playerUuid)) {
            const fakePlayersList = obj[playerUuid].fakePlayersList;
            for (const fakePlayer of fakePlayersList) {
                const spawnPos = new IntPos(fakePlayer.fpPosX, fakePlayer.fpPosY, fakePlayer.fpPosZ, fakePlayer.fpPosDimid);
                const online = Boolean(mc.getPlayer(fakePlayer.fpName)) && fakePlayer.isOnline;
                const status = fakePlayer.status === "rented" ? "§a租赁中" : fakePlayer.status === "grace" ? "§6赎回期" : "§c已销毁";
                // 将 fakePlayer 对象存储到数组中，以便在后续操作中使用
                fakePlayers.push({
                    name: fakePlayer.fpName,
                    pos: spawnPos,
                    isOnline: fakePlayer.isOnline,
                    playerUuid: playerUuid,
                    status: fakePlayer.status, // 添加 playerUuid
                    destroyDate: fakePlayer.destroyDate
                });
                form.addSwitch(`§f${fakePlayer.fpName} ${spawnPos} ${online ? ` - §a在线` : ` - §c离线`} ${status}`, online);
                switchId++; // 增加 switchId 以便后续处理
            }
        }
    }
    player.sendForm(form, (pl, id) => {
        if (id == null) return;

        let errorMessages = []; // 收集所有错误信息
        let hasChanges = false; // 标记是否有数据修改

        for (let index = 1; index < id.length; index++) {
            const switchState = id[index];
            const fakePlayer = fakePlayers[index - 1];

            // 跳过未变更的状态
            const online = Boolean(mc.getPlayer(fakePlayer.name)) && fakePlayer.isOnline;
            if (switchState === online) continue;

            // 状态检查
            if (fakePlayer.status === "grace") {
                errorMessages.push(`§c${fakePlayer.name} 在赎回期内，请先赎回后再进行上下线操作`);
                continue;
            }
            if (fakePlayer.status === "destroyed") {
                errorMessages.push(`§c${fakePlayer.name} 由于超过赎回期已于${fakePlayer.destroyDate}被销毁`);
                continue;
            }

            // 执行状态变更
            try {
                if (switchState) {
                    mc.spawnSimulatedPlayer(fakePlayer.name, fakePlayer.pos);
                    feedBack(pl, `§6${fakePlayer.name} §a已上线`);
                } else {
                    const fp = mc.getPlayer(fakePlayer.name);
                    if (fp) {
                        fp.simulateDisconnect();
                        feedBack(pl, `§6${fakePlayer.name} §c已下线`);
                    }
                }

                // 更新状态
                obj[fakePlayer.playerUuid].fakePlayersList.find(fp =>
                    fp.fpName === fakePlayer.name
                ).isOnline = switchState;
                hasChanges = true;
            } catch (e) {
                errorMessages.push(`§c操作失败：${fakePlayer.name} (${e.message})`);
            }
        }

        // 统一显示错误信息
        if (errorMessages.length > 0) {
            for (const msg of errorMessages) {
                feedBack(pl, msg);
            }
        }

        // 保存变更
        if (hasChanges) {
            pluginData.write(JSON.stringify(obj, null, 4));
        }
    })
}

/**
 * 假人管理
 * @param {Player} player 
 */
function managerForm(player) {
    const form = mc.newSimpleForm();
    form.setTitle(`B-FakePlayer 假人管理`)
        .setContent(`请选择操作：`)

        .addButton(`我的假人列表`, `textures/ui/FriendsDiversity`)
        .addButton(`假人快速上下线`, `textures/ui/move`)
        .addButton(`假人执行操作`, `textures/items/iron_pickaxe`)
        .addButton(`帮助`, `textures/ui/infobulb`);

    player.sendForm(form, (pl, id) => {
        if (id == null) return;
        switch (id) {
            case 0:
                fakePlayersListForm(pl);
                break;
            case 1:
                quicklyGoOnlineAndOfflineForm(pl);
                break;
            case 2:
                pl.tell(`功能正在制作中...`);
                break;
            case 3:
                pl.tell(`功能正在制作中...`);
                break;
        }
    })
}

/**
 * 假人自动重生设置
 * @param {Player} player 玩家对象
 * @param {string} fpName 假人名称
 */
function autoRespawnSettingsForm(player, fpName) {
    const form = mc.newCustomForm();
    form.setTitle(`B-FakePlayer 假人自动重生设置`)
        .addLabel(`正在设置假人：${fpName}`); // response[0]

    let obj = JSON.parse(pluginData.read());
    let targetFakePlayer = null;
    let playerUuid = null;

    // 遍历查找目标假人
    outerLoop:
    for (const uuid in obj) {
        if (obj.hasOwnProperty(uuid)) {
            const fakePlayersList = obj[uuid].fakePlayersList;
            for (const fp of fakePlayersList) {
                if (fp.fpName === fpName) {
                    targetFakePlayer = fp;
                    playerUuid = uuid;
                    break outerLoop;
                }
            }
        }
    }

    // 未找到假人的情况处理
    if (!targetFakePlayer) return feedBack(player, `§c未找到假人 ${fpName}`);

    const respawnPosState = targetFakePlayer.respawnPos === `origin` ? true : false;
    // 添加两个开关控件
    form.addSwitch(`死亡时自动重生`, targetFakePlayer.autoRespawnWhenDie);
    form.addSwitch(`服务器重启时自动重生`, targetFakePlayer.autoRespawnWhenServerStarted);
    form.addSwitch(`重生位置：实时位置(关) <=> 原位置(开)`, respawnPosState);

    player.sendForm(form, (pl, response) => {
        if (response == null) return;

        // 更新设置状态
        targetFakePlayer.autoRespawnWhenDie = response[1];
        targetFakePlayer.autoRespawnWhenServerStarted = response[2];
        targetFakePlayer.respawnPos = response[3] ? `origin` : `current`;

        // 写回配置文件
        obj[playerUuid].fakePlayersList = obj[playerUuid].fakePlayersList.map(fp => fp.fpName === fpName ? targetFakePlayer : fp);
        pluginData.write(JSON.stringify(obj, null, 4));

        // 操作反馈
        const statusText = [
            `§6[${fpName}] 设置已更新：§f`,
            `死亡重生：${response[1] ? "§a开启§f" : "§c关闭§f"}`,
            `服务器重启重生：${response[2] ? "§a开启§f" : "§c关闭§f"}`,
            `重生位置: ${response[3] ? `§a原位置§f` : `§c实时位置§f`}`
        ].join("\n");
        feedBack(pl, statusText);
    });
}

/**
 * 假人自动重生设置
 * @param {Player} player 玩家对象
 * @param {string} fpName 假人名称
 */
function renewalRentForm(player, fpName) {
    let obj = JSON.parse(pluginData.read());
    let targetFakePlayer = null;
    let playerUuid = null;

    // 遍历查找目标假人
    outerLoop:
    for (const uuid in obj) {
        if (obj.hasOwnProperty(uuid)) {
            const fakePlayersList = obj[uuid].fakePlayersList;
            for (const fp of fakePlayersList) {
                if (fp.fpName === fpName) {
                    targetFakePlayer = fp;
                    playerUuid = uuid;
                    break outerLoop;
                }
            }
        }
    }

    // 未找到假人的情况处理
    if (!targetFakePlayer) return feedBack(player, `§c未找到假人 ${fpName}`);
    if (targetFakePlayer.status === "destroyed") return feedBack(pl, `§c您的假人已经被彻底销毁，其销毁时间是：${targetFakePlayer.destroyDate}`);

    const form = mc.newCustomForm();
    let content = [
        `正在续租假人：${fpName}`,
        `假人位置：${new IntPos(targetFakePlayer.fpPosX, targetFakePlayer.fpPosY, targetFakePlayer.fpPosZ, targetFakePlayer.fpPosDimid)}`,
        `假人租赁开始时间：${targetFakePlayer.createdTime}`,
        `假人租赁结束时间：${targetFakePlayer.rentEndDate}`,
        `假人彻底销毁时间：${targetFakePlayer.destroyDate}`
    ];
    form.setTitle("B-FakePlayer 假人自动重生设置")
        .addLabel(content.join("\n§f")); // response[0]

    form.addInput("请输入将要续租的天数：", "纯阿拉伯数字");

    player.sendForm(form, (pl, response) => {
        if (response == null) return;

        const renewalDays = Number(response[1]);

        if (response[1].length <= 0 || isNaN(renewalDays) || renewalDays > 30 || renewalDays <= 0) return feedBack(pl, `§c续租天数必须在0~30天之间`);
        if (Economy.get(pl.xuid) < rentPerDay * renewalDays) return feedBack(pl, `§c您的余额不足 ${rentPerDay * renewalDays} ${currencyUnitName}`);

        // 更新设置状态
        const newRentEndDate = addDays(targetFakePlayer.rentEndDate, renewalDays);
        const newDestroyDate = addDays(newRentEndDate, 7); // 此处有待完善（自定义赎回期天数）例如赎回期7天后就是彻底销毁假人数据的日期
        targetFakePlayer.rentEndDate = newRentEndDate;
        targetFakePlayer.destroyDate = newDestroyDate;

        // 写回配置文件
        obj[playerUuid].fakePlayersList = obj[playerUuid].fakePlayersList.map(fp => fp.fpName === fpName ? targetFakePlayer : fp);
        pluginData.write(JSON.stringify(obj, null, 4));

        // 操作反馈
        feedBack(pl, `您的假人${fpName}已成功续租${renewalDays}天，将会在${newRentEndDate}进入赎回期，并将在${newDestroyDate}被彻底销毁`);
    });
}

/**
 * 查询现有假人
 * @param {Player} player 
 */
function queryForm(player) {
    const form = mc.newSimpleForm();
    form.setTitle("B-FakePlayer 查询现有全部假人");
    let content = "";
    let obj = JSON.parse(pluginData.read());
    for (const playerUuid in obj) {
        if (obj.hasOwnProperty(playerUuid)) {
            const fakePlayersList = obj[playerUuid].fakePlayersList;
            for (const fakePlayer of fakePlayersList) {
                const spawnPos = new IntPos(fakePlayer.fpPosX, fakePlayer.fpPosY, fakePlayer.fpPosZ, fakePlayer.fpPosDimid);
                const online = mc.getPlayer(fakePlayer.fpName) ? `§a在线` : `§c离线`;
                const status = fakePlayer.status === `rented` ? `§a租赁中` : fakePlayer.status === `grace` ? `§6赎回期` : `§c已销毁`;
                content += `${obj[playerUuid].ownerName} 的假人：${fakePlayer.fpName} ${spawnPos} ${online} §f假人租赁状态：${status}\n§f`;
            }
        }
    }
    form.setContent(content);
    player.sendForm(form, (pl, id) => {
        if (id == null) return;
    })
}

function addDays(dateTimeStr, n) {
    // 解析传入的日期时间字符串
    const [datePart, timePart] = dateTimeStr.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    // 创建 Date 对象（基于本地时区）
    const baseDate = new Date(year, month - 1, day, hours, minutes, seconds);

    // 计算新日期（增加 n 天）
    const newDate = new Date(baseDate.getTime() + n * 24 * 60 * 60 * 1000);

    // 格式化为 "YYYY-MM-DD HH:mm:ss"
    return [
        `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`,
        `${String(newDate.getHours()).padStart(2, "0")}:${String(newDate.getMinutes()).padStart(2, "0")}:${String(newDate.getSeconds()).padStart(2, "0")}`
    ].join(" ");
}

function isAfter(dateTimeStr) {
    // 将空格替换为T，形成ISO 8601兼容格式（无时区标识）
    const isoStr = dateTimeStr.replace(" ", "T");
    const inputDate = new Date(isoStr);

    // 检查日期是否有效
    if (isNaN(inputDate.getTime())) return false;

    // 直接比较时间戳（自动处理时区转换）
    return Date.now() > inputDate.getTime();
}