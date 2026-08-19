// LiteLoader-AIDS automatic generated
/// <reference path="d:\LLS/dts/helperlib/src/index.d.ts"/> 


/*

    todo:
    1.支持转账、查询转账记录
    2.充值、提现 支持 在同一个按钮中使用开关来控制选择是否充值还是提现，减少主表单按钮数量
    3.插件改为多文件：语言文件、各个功能性模块
    4.充值、提现、存款、取款、领取每日利息 记录到日志文件并支持表单内查询
    5.贷款额度与信誉分挂钩：根据用户的信誉分设定贷款额度，信誉分较低时贷款额度也较低，同时提高信誉分需要更长时间的正常还款记录。

    改善进服自动强制还款逻辑：贷款时间距离现在是否超过了24小时支持自定义小时数（配置文件）
    改善每次手动还款增加贷款信誉分的逻辑：并不是每次手动还款无论还款多少都增加信誉分，而是根据指定公式或比例增加信誉分

    
*/
const { JsonConfig/*, JsonI18n, JsonLanguage, I18nAPI*/ } = require("./GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS");
class moneyManager {
    constructor(type, object = "") {
        this.type = type;
        this.object = object;
    }
    mType() {
        switch (this.type) {
            case "llmoney":
                return "llmoney";
            case "scoreboard":
                return "scoreboard";
            default:
                //return logger.error(`未知的经济类型 : ${this.type}`);
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
    set(xuid, value) {
        switch (this.type) {
            case "llmoney":
                return money.set(xuid, value);
            case "scoreboard":
                //return Scoreboard.setPlayerScore(data.xuid2uuid(xuid), this.object, value);
                return mc.setPlayerScore(data.xuid2uuid(xuid), this.object, value);
            default:
                //return logger.error(`未知的经济类型 : ${this.type}`);
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
    add(xuid, value) {
        switch (this.type) {
            case "llmoney":
                return money.add(xuid, value);
            case "scoreboard":
                //return Scoreboard.addPlayerScore(data.xuid2uuid(xuid), this.object, value);
                return mc.addPlayerScore(data.xuid2uuid(xuid), this.object, value);
            default:
                //return logger.error(`未知的经济类型 : ${this.type}`);  
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
    reduce(xuid, value) {
        switch (this.type) {
            case "llmoney":
                return money.reduce(xuid, value);
            case "scoreboard":
                //return Scoreboard.reducePlayerScore(data.xuid2uuid(xuid), this.object, value);
                return mc.reducePlayerScore(data.xuid2uuid(xuid), this.object, value);
            default:
                //return logger.error(`未知的经济类型 : ${this.type}`);
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
    trans(xuid1, xuid2, value, PayNote) {
        switch (this.type) {
            case "llmoney":
                return money.trans(xuid1, xuid2, value, PayNote);
            case "scoreboard":
                //Scoreboard.addPlayerScore(data.xuid2uuid(xuid2), this.object, value);
                //return Scoreboard.reducePlayerScore(data.xuid2uuid(xuid1), this.object, value);
                return mc.reducePlayerScore(data.xuid2uuid(xuid1), this.object, value) && mc.addPlayerScore(data.xuid2uuid(xuid2), this.object, value);
            default:
                //return logger.error(`未知的经济类型 : ${this.type}`);
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
    get(xuid) {
        switch (this.type) {
            case "llmoney":
                return money.get(xuid);
            case "scoreboard":
                //return Scoreboard.getPlayerScore(data.xuid2uuid(xuid), this.object);
                return mc.getPlayerScore(data.xuid2uuid(xuid), this.object);
            default:
                //throw new Error("未知的经济类型" + this.type);
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
    getHistory(xuid, time = 86400 * 1) {
        switch (this.type) {
            case "llmoney":
                let record = money.getHistory(xuid, 86400 * time); // 1 天 = 86400 秒
                let resultArray = record.map(transaction => {
                    let from = transaction.from === "System" ? "系统" : transaction.from;
                    let to = transaction.to === "System" ? "系统" : transaction.to;
                    let note;
                    switch (transaction.note) {
                        case "TPRConsume":
                            note = "随机传送消耗经济";
                            break;
                        case "RefreshChunkConsume":
                            note = "刷新区块消耗经济";
                            break;
                        default:
                            note = transaction.note;
                            break;
                    }
                    return `付款人: ${from}, 收款人: ${to}, 金额: ${transaction.money}, 时间: ${transaction.time}, 备注: ${note}`;
                });
                return resultArray.join('\n');
            case "scoreboard":
                //return logger.error(`计分板经济暂不支持查询历史账单!`);
                //throw new Error("计分板经济暂不支持查询历史账单");
                return `计分板经济暂不支持查询历史账单!`;
            default:
                //return logger.error(`未知的经济类型 : ${this.type}`);
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
    clearHistory(time = 86400 * 1) {
        switch (this.type) {
            case "llmoney":
                return money.clearHistory(time);
            case "scoreboard":
                //return logger.error(`计分板经济暂不支持删除历史账单记录!`);
                //throw new Error("计分板经济暂不支持删除历史账单记录");
                return `计分板经济暂不支持删除历史账单记录!`;
            default:
                //return logger.error(`未知的经济类型 : ${this.type}`);
                //return `未知的经济类型 : ${this.type}`;
                throw new Error("未知的经济类型" + this.type);
        }
    }
}

const plugin_path = "./plugins/Y-Bank/";

/*
const en_US = {
    "test.lang.a": "114514",
    "test.lang.b": "1919810",
    "test.lang.c": "aaaaaaaaaaaaaaaaaaaaa",
    "test.lang.d": "test {1} {2} {2} {1} {3}....."
};

const zh_CN = {
    "test.lang.a": "听我说谢谢你",
    "test.lang.b": "因为有你",
    "test.lang.c": "温暖了四季",
    "test.lang.d": "测试翻译 {1} {2} {2} {1} {3}....."
};

const I18n = new JsonI18n(plugin_path + "language/", "zh_CN");

I18n.loadLanguage("en_US", en_US);
I18n.loadLanguage("zh_CN", zh_CN);

//logger.warn(I18n.translate("test.lang.a"));
//logger.warn(I18n.translate("test.lang.d", ["jb", "sb"]));

I18n.chooseLanguage("zh_CN");
*/

logger.setConsole(true);
logger.setFile("./logs/bank.log");
logger.setTitle("Y-Bank");

let config = new JsonConfig(plugin_path + "/config/config.json",
    {
        "插件基础配置": {
            "指令": "bank",
            "指令描述": "银行",
        },
        "银行相关配置": {
            "经济类型": "llmoney", // scoreboard 或 llmoney
            "计分板名称": "money",
            "货币名称": "金币",
            "现金物品": "minecraft:emerald", // 可以使用addon的物品作为自定义货币物品
            "现金价值": 100,
            "提现最小金额": 100,
            "每日充值限额": 100000,
            "每日提现限额": 100000,
            "存款最小金额": 10,
            "取款最小金额": 10,
            "存款每日利息百分比": 15,
            "存款至少达到此数值才能获取利息": 10,
            "贷款最小金额": 1000,
            //"贷款最大金额": 9999999,
            "贷款利息百分比": 30,
            "贷款默认信誉分": 100,
            "贷款信誉分门槛": 70,
        },
        "日期检查": getCurrentDate(), // 勿动
        "插件配置文件版本": "1.0.0" // 勿动
    }
);

let formConfig = new JsonConfig(plugin_path + "/config/formJSON.json",
    {
        "银行主表单标题": "银行",
        "银行主表单内容": "欢迎来到银行 : {playerName}\n钱包余额 : {walletBalance} | 银行存款 : {bankBalance}", // {playerName} 是 玩家名
        "充值按钮图片路径": "", // 例如 textures/items/apple
        "提现按钮图片路径": "",
        "存款按钮图片路径": "",
        "取款按钮图片路径": "",
        "贷款按钮图片路径": "",
        "贷款-手动还款按钮图片路径": "",
    }
);

let playerData = new JsonConfig(plugin_path + "data/playerData.json",
    {
        "玩家贷款数据": {},
        "玩家充值数据": {},
        "玩家提现数据": {},
        "玩家存款数据": {},
        //"玩家取款数据": {},
    }
);


let moneyType = config.get("银行相关配置")["经济类型"],
    scoreName = config.get("银行相关配置")["计分板名称"],
    monetaryUnit = config.get("银行相关配置")["货币名称"],
    minDepositForInterest = config.get("银行相关配置")["存款至少达到此数值才能获取利息"],
    ratio = config.get("银行相关配置")["现金价值"],
    moneyItemType = config.get("银行相关配置")["现金物品"],
    minRechargeAmount = ratio,
    minWithdrawAmount = config.get("银行相关配置")["提现最小金额"],
    minLoanAmount = config.get("银行相关配置")["贷款最小金额"],
    minWithdrawalAmount = config.get("银行相关配置")["取款最小金额"],
    minDepositAmount = config.get("银行相关配置")["存款最小金额"],
    loanCreditScoreThreshold = config.get("银行相关配置")["贷款信誉分门槛"]

const Economy = new moneyManager(moneyType, scoreName);

/** 
 * @returns 当前时间字符串 例如 "2024-6-27"
 */
function getCurrentDate() {
    return system.getTimeStr().split(" ")[0];
}

/**
 * @returns 当前时间具体字符串 例如 "2024-06-24 19:28:30"
 */
function getdetailCurrentTime() {
    return system.getTimeStr();
}

/**
 * @description 银行主表单
 * @param {LLSE_Player} player 玩家对象
 */
function mainBankForm(player) {

    let fm = mc.newSimpleForm();
    fm.setTitle(formConfig.get("银行主表单标题"));
    let contentStr = `${formConfig.get("银行主表单内容")
        .replace("{playerName}", player.realName)
        .replace("{walletBalance}", Economy.get(player.xuid))
        .replace("{bankBalance}", playerData.get("玩家存款数据")[player.realName]["玩家银行存款"])}`
    fm.setContent(contentStr);
    //--------------------------
    fm.addButton(`充值-物品换${monetaryUnit}`, formConfig.get("充值按钮图片路径"));
    fm.addButton(`提现-${monetaryUnit}换物品`, formConfig.get("提现按钮图片路径"));
    fm.addButton(`存款`, formConfig.get("存款按钮图片路径"));
    fm.addButton(`取款`, formConfig.get("取款按钮图片路径"));
    fm.addButton(`贷款`, formConfig.get("贷款按钮图片路径"));
    fm.addButton(`贷款-手动还款`, formConfig.get("贷款-手动还款按钮图片路径"));

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return;
        }
        switch (id) {
            case 0: // 充值
                recharge(pl);
                break;
            case 1: // 提现
                cashWithdrawal(pl);
                break;
            case 2: // 存款
                depositMoney(pl);
                break;
            case 3: // 取款
                withDrawMoney(pl);
                break;
            case 4: // 贷款
                loan(pl);
                break;
            case 5: // 贷款-手动还款
                loanManualRepayment(pl);
                break;
        }
    })

}

/**
 * @description 检查玩家的背包并清除指定数量的物品，如果玩家背包内没有指定数量的物品，函数将返回缺少的数量；如果有足够的物品，函数将返回 true，表示成功移除物品
 * @param {LLSE_Player} player 玩家对象
 * @param {String} itemName 物品标准类型名
 * @param {Number} requiredCount 要检查和清除的物品的数量
 * @returns 如果满足条件则返回 true，否则返回 false
 */
function checkAndRemoveItem(player, itemName, requiredCount) {
    // 获取玩家物品栏容器对象
    let inventory = player.getInventory();

    let totalCount = 0; // 计数变量

    // 获取玩家物品栏中的所有物品对象
    let items = inventory.getAllItems();

    // 遍历物品栏中的物品，计算指定物品的总数量
    for (let i = 0; i < items.length; i++) {
        if (items[i].type == itemName) {
            totalCount += items[i].count;
        }
    }

    // 判断是否满足指定数量
    if (totalCount >= requiredCount) {
        // 玩家背包内有指定个数的物品，开始移除物品
        let remainingCount = requiredCount;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type == itemName && remainingCount > 0) {
                if (items[i].count <= remainingCount) {
                    remainingCount -= items[i].count;
                    inventory.removeItem(i, items[i].count); // 移除当前格子的所有该物品
                } else {
                    inventory.removeItem(i, remainingCount); // 只移除所需数量的物品
                    remainingCount = 0;
                }
            }
        }

        // 刷新玩家物品栏显示
        player.refreshItems();
        // 通知玩家已清除指定数量的物品
        //player.tell(`已清除你背包中的 ${requiredCount} 个 ${itemName}"。`);
        return true;

    } else {
        // 如果玩家背包内没有指定数量的物品，函数将返回缺少的数量
        //return player.tell(`你没有足够的 ${itemName}。`);
        //return false;
        return requiredCount - totalCount;
    }
}

/**
 * @description 充值表单
 * @param {LLSE_Player} player 玩家对象
 */
function recharge(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-充值`);
    //--------------------------
    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get("玩家存款数据")[playerName]["玩家银行存款"];
    //let itemName = mc.newItem(moneyItemType, 1).name;

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}`);
    fm.addInput(`请输入想要充值的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);
        let [num, remainder] = checkPositiveInteger2(inputAmount, ratio);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Format.Red}` + `请输入正整数!`);

        if (inputAmount < minRechargeAmount) return pl.tell(`${Format.Red}` + `请至少充值 ${minRechargeAmount} ${monetaryUnit}`);

        if (playerData.get("玩家充值数据")[playerName]["当日充值额"] <= 0) return pl.tell(`${Format.Red}` + `你的当日充值额度为0，请等待次日再进行充值!`);

        if (remainder !== 0) return pl.tell(`${Format.Red}` + `想要充值的金额必须能被 ${ratio} 整除!`);

        let result = checkAndRemoveItem(pl, moneyItemType, num);

        if (result !== true) return pl.tell(`${Format.Red}` + `你没有足够的现金(${moneyItemType})，想充值${inputAmount}${monetaryUnit}至少还需${result}个现金!`);

        playerData.get("玩家存款数据")[playerName]["玩家银行存款"] += inputAmount;
        playerData.get("玩家充值数据")[playerName]["当日充值额"] -= inputAmount;
        pl.tell(`已成功充值 ${inputAmount} ${monetaryUnit} 消耗 ${num} 个 现金(${moneyItemType})`);
        logger.info(`玩家 ${playerName} 已成功充值 ${inputAmount} ${monetaryUnit} 消耗 ${num} 个 现金(${moneyItemType})`);
        playerData.save();
    })
}

/**
 * @description 提现表单
 * @param {LLSE_Player} player 玩家对象
 */
function cashWithdrawal(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-提现`);
    //--------------------------
    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get("玩家存款数据")[playerName]["玩家银行存款"];
    //let itemName = mc.newItem(moneyItemType, 1).name;

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}`);
    fm.addInput(`请输入想要提现的数额：`, `请输入正整数`);

    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Format.Red}` + `请输入正整数!`);

        if (inputAmount > bankDeposit) return pl.tell(`${Format.Red}` + `你没有那么多存款!`);

        if (inputAmount < minWithdrawAmount) return pl.tell(`${Format.Red}` + `请至少提现 ${minWithdrawAmount} ${monetaryUnit}`);

        if (playerData.get("玩家提现数据")[playerName]["当日提现额"] <= 0) return pl.tell(`${Format.Red}` + `你的当日提现额度为0，请等待次日再进行提现!`);

        let [num, remainder] = checkPositiveInteger2(inputAmount, ratio);
        let consume = inputAmount - remainder;

        if (remainder !== 0) { // 商不是0，有余数
            playerData.get("玩家存款数据")[playerName]["玩家银行存款"] -= consume;
            playerData.get("玩家提现数据")[playerName]["当日提现额"] -= consume;
            pl.tell(`已成功从银行提现 ${num} 个 现金(${moneyItemType}) 消耗 ${consume} ${monetaryUnit}`);
            logger.info(`玩家 ${playerName} 已成功从银行提现 ${num} 个 现金(${moneyItemType}) 消耗存款 ${consume} ${monetaryUnit}`);
        } else { // 商是0
            let item = mc.newItem(moneyItemType, num);
            pl.giveItem(item);
            pl.refreshItems();
            playerData.get("玩家存款数据")[playerName]["玩家银行存款"] -= inputAmount;
            playerData.get("玩家提现数据")[playerName]["当日提现额"] -= inputAmount;
            pl.tell(`已成功从银行提现 ${num} 个 现金(${moneyItemType}) 消耗 ${inputAmount} ${monetaryUnit}`);
            logger.info(`玩家 ${playerName} 已成功从银行提现 ${num} 个 现金(${moneyItemType}) 消耗存款 ${inputAmount} ${monetaryUnit}`);
        }
        playerData.save();
    });
}

/**
 * @description 存款表单
 * @param {LLSE_Player} player 玩家对象
 */
function depositMoney(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-存款`);
    //--------------------------
    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get("玩家存款数据")[playerName]["玩家银行存款"];

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}`);
    fm.addInput(`请输入想要存入的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Format.Red}` + `请输入正整数!`);

        if (inputAmount < minDepositAmount) return pl.tell(`${Format.Red}` + `请至少存入 ${minDepositAmount} ${monetaryUnit}`);

        if (inputAmount > playerData.get("玩家存款数据")[playerName]["玩家银行存款"]) return pl.tell(`${Format.Red}` + `你没有那么多存款!`);

        playerData.get("玩家存款数据")[playerName]["玩家银行存款"] += inputAmount;
        playerData.save();
        Economy.reduce(pl.xuid, inputAmount);
        pl.tell(`已成功向银行存入 ${inputAmount} ${monetaryUnit}`);
        logger.info(`玩家 ${playerName} 向银行存入 ${inputAmount} ${monetaryUnit}`);
    })
}

/**
 * @description 取款表单
 * @param {LLSE_Player} player 玩家对象
 */
function withDrawMoney(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-取款`);
    //--------------------------
    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get("玩家存款数据")[playerName]["玩家银行存款"];

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}`);
    fm.addInput(`请输入想要取出的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Format.Red}` + `请输入正整数!`);

        if (inputAmount < minWithdrawalAmount) return pl.tell(`${Format.Red}` + `请至少取出 ${minWithdrawalAmount} ${monetaryUnit}`);

        if (inputAmount > playerData.get("玩家存款数据")[playerName]["玩家银行存款"]) return pl.tell(`${Format.Red}` + `你没有那么多存款!`);

        playerData.get("玩家存款数据")[playerName]["玩家银行存款"] -= inputAmount;
        playerData.save();
        Economy.add(pl.xuid, inputAmount);
        pl.tell(`已成功从银行取出 ${inputAmount} ${monetaryUnit}`);
        logger.info(`玩家 ${playerName} 从银行取出 ${inputAmount} ${monetaryUnit}`);
    })
}

/**
 * @description 贷款表单
 * @param {LLSE_Player} player 玩家对象
 */
function loan(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-贷款`);
    //--------------------------
    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get("玩家存款数据")[playerName]["玩家银行存款"];
    let canPlayerLoan = !playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] ? `${Format.Green}是${Format.Clear}` : `${Format.Red}` + `否${Format.Clear}`;
    let hasLoan = playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] ? `${Format.Red}` + `是${Format.Clear}` : `${Format.Green}否${Format.Clear}`;
    let remainingRepaymentAmount = playerData.get("玩家贷款数据")[playerName]["负债数额"];
    let currentLoanLimit = playerData.get("玩家贷款数据")[player.realName]["当前贷款额度"];
    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的贷款信誉分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信誉分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.White}你的贷款额度 : ${Format.Green}${currentLoanLimit}${Format.Clear}`,
        `${Format.White}当前是否背负贷款 : ${hasLoan} | 当前是否可以贷款 : ${canPlayerLoan}${Format.Clear}`,
        `${Format.White}剩余需要还款的余额 : ${remainingRepaymentAmount}${Format.Clear}`
    ]
    fm.addLabel(arr.join("\n"));
    fm.addInput(`请输入想要贷款的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);
        let loanDataConfig = playerData.get("玩家贷款数据")[playerName];
        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Format.Red}` + `请输入正整数!`);

        if (inputAmount < minLoanAmount) return pl.tell(`${Format.Red}` + `请至少贷款 ${minLoanAmount} ${monetaryUnit}`);

        //此处需要修改，根据玩家的信誉分设置其贷款额度（玩家贷款额度变量）

        if (inputAmount > currentLoanLimit) return pl.tell(`${Format.Red}` + `你的贷款额度只有 ${currentLoanLimit} ${monetaryUnit}`);

        if (loanDataConfig["当前贷款信誉分"] <= loanCreditScoreThreshold) return pl.tell(`${Format.Red}` + `你的贷款信誉分过低，请及时还款!`);

        if (playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"]) return pl.tell(`${Format.Red}` + `你当前有未还清的贷款，请及时还款!`);

        if (bankDeposit <= 0) return pl.tell(`${Format.Red}` + `请确保你的银行存款为正数，否则无法进行贷款!`);

        //贷款的逻辑...
        playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] = true;
        playerData.get("玩家存款数据")[playerName]["玩家银行存款"] += inputAmount;
        playerData.get("玩家贷款数据")[playerName]["负债数额"] = inputAmount;
        playerData.get("玩家贷款数据")[playerName]["贷款金额"] = inputAmount;
        playerData.get("玩家贷款数据")[playerName]["贷款时间"] = getdetailCurrentTime();
        let repaymentDueDate = addHoursToDate(getdetailCurrentTime(), 24)
        playerData.get("玩家贷款数据")[playerName]["贷款预期还款时间"] = repaymentDueDate;
        pl.tell(`已成功贷款：${inputAmount} ${monetaryUnit}，请在 ${repaymentDueDate} 之前还款!`);
        playerData.save();
    })
}

/**
 * @description 贷款-手动还款表单
 * @param {LLSE_Player} player 玩家对象
 */
function loanManualRepayment(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-贷款-手动还款`);
    //--------------------------
    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get("玩家存款数据")[playerName]["玩家银行存款"];
    let canPlayerLoan = !playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] ? `${Format.Green}` + `是${Format.Clear}` : `${Format.Red}` + `否${Format.Clear}`;
    let hasLoan = playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] ? `${Format.Red}` + `是${Format.Clear}` : `${Format.Green}` + `否${Format.Clear}`;
    let remainingRepaymentAmount = playerData.get("玩家贷款数据")[playerName]["负债数额"];
    let currentLoanLimit = playerData.get("玩家贷款数据")[player.realName]["当前贷款额度"];
    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的贷款信誉分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信誉分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.White}你的贷款额度 : ${Format.Green}${currentLoanLimit}${Format.Clear}`,
        `${Format.White}当前是否背负贷款 : ${hasLoan} | 当前是否可以贷款 : ${canPlayerLoan}${Format.Clear}`,
        `${Format.White}剩余需要还款的余额 : ${remainingRepaymentAmount}${Format.Clear}`
    ]
    fm.addLabel(arr.join("\n"));
    fm.addInput(`请输入想要还款的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Format.Red}` + `请输入正整数!`);

        if (!playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"]) return pl.tell(`${Format.Red}` + `你当前没有贷款!`);

        if (inputAmount > remainingRepaymentAmount) return pl.tell(`${Format.Red}` + `你当前负债数额为 ${remainingRepaymentAmount}，不能输入比此数值更大的数字!`);

        //贷款-手动还款的逻辑...
        //还款成功增加贷款信誉分
        playerData.get("玩家存款数据")[playerName]["玩家银行存款"] -= inputAmount;
        playerData.get("玩家贷款数据")[playerName]["负债数额"] -= inputAmount;
        if (playerData.get("玩家贷款数据")[playerName]["负债数额"] === 0) {
            playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] = false;
            playerData.get("玩家贷款数据")[playerName]["贷款金额"] = 0;
            playerData.get("玩家贷款数据")[playerName]["贷款时间"] = null;
            playerData.get("玩家贷款数据")[playerName]["贷款实际还款时间"] = getdetailCurrentTime();
        }
        let increaseCreditScoreAmount = (playerData.get("玩家存款数据")[playerName]["玩家银行存款"] >= 0) ? 10 : 5
        // 如果手动还款之后银行存款不是负数，那么说明无压力还款，贷款信誉分+10，反之如果还款之后银行存款是负数，那么说明还款有压力，信誉分+5
        playerData.get("玩家贷款数据")[playerName]["当前贷款信誉分"] += increaseCreditScoreAmount;

        pl.tell(`已成功还款 ${inputAmount} ${monetaryUnit} 贷款信誉分+${increaseCreditScoreAmount}`);

        playerData.save();
    })
}

/**
 * @description 根据玩家贷款信誉分设置其玩家贷款额度
 * @param {LLSE_Player} player 玩家对象
 */
function setLoanLimitBasedOnCreditScore(player) {
    let playerCreditData = playerData.get("玩家贷款数据")[player.realName];
    let currentCreditScore = playerCreditData["当前贷款信誉分"];
    let newLoanLimit;

    switch (true) {
        case (currentCreditScore < 50):
            newLoanLimit = 5000;
            break;
        case (currentCreditScore >= 50 && currentCreditScore < 70):
            newLoanLimit = 7000;
            break;
        case (currentCreditScore >= 70 && currentCreditScore < 100):
            newLoanLimit = 10000;
            break;
        case (currentCreditScore >= 100 && currentCreditScore < 150):
            newLoanLimit = 15000;
            break;
        case (currentCreditScore >= 150 && currentCreditScore < 200):
            newLoanLimit = 20000;
            break;
        case (currentCreditScore >= 200 && currentCreditScore < 250):
            newLoanLimit = 30000;
            break;
        case (currentCreditScore >= 250 && currentCreditScore < 300):
            newLoanLimit = 40000;
            break;
        case (currentCreditScore >= 300 && currentCreditScore < 350):
            newLoanLimit = 80000;
            break;
        case (currentCreditScore >= 350 && currentCreditScore < 450):
            newLoanLimit = 200000;
            break;
        case (currentCreditScore >= 450 && currentCreditScore < 500):
            newLoanLimit = 500000;
            break;
        default:
            newLoanLimit = 500000; // 如果评分超过500，设置一个默认值
            break;
    }

    // 保存新的贷款额度
    playerCreditData["当前贷款额度"] = newLoanLimit;
    playerData.save();
}

/**
 * @description 根据玩家对象获取玩家当前贷款信誉分
 * @param {LLSE_Player} player 玩家对象
 */
function getLoanCreditScore(player) {
    let loanCreditScore = playerData.get("玩家贷款数据")[player.realName]["当前贷款信誉分"];
    let creditScoreDescription;
    switch (true) {
        case loanCreditScore < 50:
            creditScoreDescription = `${Format.Red}` + `${loanCreditScore} (极差)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 50 && loanCreditScore < 70):
            creditScoreDescription = `${Format.Yellow}` + `${loanCreditScore} (较差)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 70 && loanCreditScore < 100):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 100 && loanCreditScore < 150):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 150 && loanCreditScore < 200):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 200 && loanCreditScore < 250):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 250 && loanCreditScore < 300):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 300 && loanCreditScore < 350):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 350 && loanCreditScore < 450):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        case (loanCreditScore >= 400 && loanCreditScore < 500):
            creditScoreDescription = `${Format.Green}` + `${loanCreditScore} (良好)` + `${Format.Clear}`;
            break
        default:
            creditScoreDescription = `${Format.Gray}` + `${loanCreditScore} (未知)` + `${Format.Clear}`;
            break;
    }
    return creditScoreDescription;
}

function isPositiveInteger(num) {
    // 正整数的正则表达式
    const positiveIntegerPattern = /^[1-9]\d*$/;

    // 使用test方法检查num是否符合正整数的模式
    return positiveIntegerPattern.test(num.toString());
}

function checkPositiveInteger2(num, divisor) {
    if (num % divisor === 0 && num / divisor > 0) {
        return [num / divisor, 0];
    } else {
        let remainder = num % divisor;
        return [Math.floor(num / divisor), remainder];  // 返回余数
    }
}

mc.listen("onJoin", (player) => {
    try {
        let playerName = player.realName;
        if (!playerData.get("玩家贷款数据")[playerName]) {
            playerData.get("玩家贷款数据")[playerName] = {
                "当前贷款信誉分": config.get("银行相关配置")["贷款默认信誉分"],
                "当前是否正在贷款": false,
                "负债数额": 0,
                "贷款金额": 0,
                "贷款时间": null
            }
            playerData.get("玩家充值数据")[playerName] = {
                "当日充值额": config.get("银行相关配置")["每日充值限额"],
            }
            playerData.get("玩家提现数据")[playerName] = {
                "当日提现额": config.get("银行相关配置")["每日提现限额"]
            }
            playerData.get("玩家存款数据")[playerName] = {
                "玩家银行存款": 0
            }
        }
        let bankConfig = config.get("银行相关配置");
        if (config.get("日期检查") !== getCurrentDate()) {
            config.set("日期检查", getCurrentDate());
            playerData.get("玩家充值数据")[playerName] = {
                "当日充值额": bankConfig["每日充值限额"],
            };
            playerData.get("玩家提现数据")[playerName] = {
                "当日提现额": bankConfig["每日提现限额"]
            };
            // 计算利息
            let depositInterestRate = bankConfig["存款每日利息百分比"];
            let currentDeposit = playerData.get("玩家存款数据")[playerName]["玩家银行存款"];
            if (currentDeposit > minDepositForInterest) {
                let interestAmount = Math.floor(currentDeposit * depositInterestRate / 100);
                playerData.get("玩家存款数据")[playerName]["玩家银行存款"] += interestAmount;
                player.tell(`已自动获取存款利息 : ${interestAmount} , 存款: ${playerData.get("玩家存款数据")[playerName]["玩家银行存款"]}`);
                logger.info(`玩家 ${playerName} 领取今日存款利息 ${interestAmount} 存款: ${playerData.get("玩家存款数据")[playerName]["玩家银行存款"]}`);
            } else {
                player.tell(`你的银行存款少于 ${minDepositForInterest} ${monetaryUnit} 无法获取每日利息!`);
            }
        }
        if (playerData.get("玩家贷款数据")[playerName]["当前贷款信誉分"] < loanCreditScoreThreshold) {
            player.tell(`你的当前贷款信誉分 : ${Format.Red}${playerData.get("玩家贷款数据")[playerName]["当前贷款信誉分"]}`);
        }
        /*
        if (playerData.get("玩家贷款数据")[playerName]["负债数额"] <= 0) {
            playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] = false;
        }
        */
        if (playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"]) {
            let targetDate = playerData.get("玩家贷款数据")[playerName]["贷款时间"];

            let diff = calculateHoursDifference(targetDate, getdetailCurrentTime());
            //logger.warn(`diff : `, diff);
            if (diff >= 24) { // 此处需要修改为 支持自定义小时数的检查（配置文件）
                let loanInterestRate = bankConfig["贷款利息百分比"];
                let loanAmount = playerData.get("玩家贷款数据")[playerName]["贷款金额"];
                let loanInterestAmount = Math.floor(loanAmount * loanInterestRate / 100);
                let deductionAmount = loanAmount + loanInterestAmount;
                playerData.get("玩家存款数据")[playerName]["玩家银行存款"] -= deductionAmount;
                playerData.get("玩家贷款数据")[playerName]["当前是否正在贷款"] = false;
                playerData.get("玩家贷款数据")[playerName]["负债数额"] = 0;
                playerData.get("玩家贷款数据")[playerName]["贷款金额"] = 0;
                playerData.get("玩家贷款数据")[playerName]["贷款时间"] = null;
                playerData.get("玩家贷款数据")[playerName]["贷款实际还款时间"] = getdetailCurrentTime();
                let increaseCreditScoreAmount = (playerData.get("玩家存款数据")[playerName]["玩家银行存款"] >= 0) ? 5 : 0
                // 如果强制还款之后银行存款不是负数，那么说明无压力还款，贷款信誉分+5，反之如果还款之后银行存款是负数，那么说明还款有压力，信誉分+0(不加信誉分)
                playerData.get("玩家贷款数据")[playerName]["当前贷款信誉分"] += increaseCreditScoreAmount;
                player.tell(`你的上一个贷款已强制还款 ${deductionAmount} ${monetaryUnit}(含利息${loanInterestAmount}) 贷款信誉分+${increaseCreditScoreAmount}，存款：${playerData.get("玩家存款数据")[playerName]["玩家银行存款"]}`);
            }
        }
        setLoanLimitBasedOnCreditScore(player); // 初始化玩家贷款额度（根据玩家贷款信誉分设置其贷款额度）
        playerData.save();
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        logger.error(error.stack);
    }
});

function calculateHoursDifference(dateString1, dateString2) {
    // 解析日期字符串为Date对象
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);

    // 计算两个日期之间的毫秒差
    const timeDifference = date2 - date1;

    // 将毫秒差转换为小时差
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference;
}

mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand(config.get("插件基础配置")["指令"], config.get("插件基础配置")["指令描述"], PermType.Any);
    cmd.setEnum("ReloadAction", ["gui", "reload", "help"]);
    cmd.mandatory("action", ParamType.Enum, "ReloadAction", 1);
    cmd.overload(["ReloadAction"]);
    cmd.overload([]);
    cmd.setCallback((_cmd, ori, out, res) => {
        let player = ori.player;
        let helpStr = [
            `${Format.Aqua}` + `<< Y-Bank 银行 使用详细指南 >>`,
            `${Format.Yellow}` + `/bank 或 /bank gui 打开银行主菜单`,
            `${Format.Yellow}` + `/bank help 查看银行使用详细指南`,
            `${Format.Yellow}` + ` 充值 : 使用现金物品兑换虚拟金币(兑换的资金会存入银行)`,
            `${Format.Yellow}` + ` 提现 : 使用银行内存款兑换实体现金物品(兑换的现金会存入背包)`,
            `${Format.Yellow}` + ` 存款 : 将钱包里的金币存储到银行存款`,
            `${Format.Yellow}` + ` 取款 : 将银行里的存款转移到钱包余额`,
            `${Format.Yellow}` + ` 贷款 : 顾名思义`,
            `${Format.Yellow}` + ` 还款 : 顾名思义`,
            `${Format.Yellow}` + ` 还款 : 顾名思义`,
            `${Format.Gold}` + ` 注意1 : 充值和提现都是直接对于银行存款里的资金进行操作，并非钱包余额`,
            `${Format.Gold}` + ` 注意2 : 银行存款和钱包余额是两种分开并且独立存储的，不要混淆`,
            `${Format.Gold}` + ` 注意3 : 若你进行了贷款，请及时还款`,
            `${Format.Aqua}` + `+========================+`,
        ];

        if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
            helpStr.splice(3, 0, `${Format.Yellow}` + `/bank reload 热重载银行插件配置文件`);
        }

        const reloadConfig = () => {
            config.save();
            playerData.save();
            formConfig.save();
            return out.success(`已成功热重载插件配置文件!`);
        };

        switch (res["action"]) {
            case "gui":
                return mainBankForm(player);
            case "reload":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    return reloadConfig();
                } else {
                    return out.error(`你没有执行这个指令的权限!`);
                }
            case "help":
                return out.success(helpStr.join("\n"));
            default:
                return mainBankForm(player);
        }
    })
    cmd.setup();

    if (!mc.getScoreObjective(scoreName)) {
        mc.newScoreObjective(scoreName, monetaryUnit);
        logger.warn(`计分项 ${scoreName} 不存在，已自动创建 : ${scoreName} - ${monetaryUnit}`);
    }
    /*
    setInterval(() => {
        let pls = mc.getOnlinePlayers().filter(p => !p.isSimulatedPlayer());
        if (pls.length <= 0) {
            return;
        }
        //贷款到期的逻辑...
        for (const pl of pls) {
            let playerName = pl.realName;

        }

    }, 1000 * 5);
    */
    //clearInterval()
})

function addHoursToDate(dateString, hours) {
    // 解析日期字符串为Date对象
    const date = new Date(dateString);

    // 向日期对象添加指定的小时数
    date.setHours(date.getHours() + hours);

    // 将日期对象转换回格式化的字符串
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}