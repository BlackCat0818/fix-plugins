// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\20241211\Desktop\LLSE-API/dts/helperlib/src/index.d.ts"/> 


const { JsonConfig/*, JsonI18n, JsonLanguage, I18nAPI*/ } = require("./GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS");

let changelogs = {
    0: [
        `v1.0.0`,
        `1.略微调整了信用分计算机制`,
        `2.给玩家每日信用分评定增加了日志记录`,
        `3.现在玩家每日信用分评定会提示增加或减少了多少分以及当前的信用分`,
        `4.修复了存款判断条件错误导致无法存款的问题`,
        `5.修复了经济类型为llmoney时仍然自动创建计分板的问题`
    ],
    1: [
        `v1.0.2`,
        `1.玩家手动还款后如果银行存款小于等于0那么信用分评定指标——[因还款导致破产次数]也会+1`,
        `2.提现时如果背包空间不足增加判断并提示“你的背包空间不足”`,
        `3.增加一个新的信用分评定指标——[捐款指数] 其计算公式是玩家捐款额度除以1000得到的四舍五入后的整数（捐款额度是玩家捐款的总数目）`,
        `4.新增“银行共同财产”功能，所有人都可以存钱、取钱，取钱后存入自己的银行存款，信用分过低无法取款，存入的钱越多，捐款额度越高，同时也会影响信用分指数`
    ],
    2: [
        `v1.0.3`,
        `1.贷款和还款的使用权限取决于玩家是否开通了贷款功能（目前仅判断玩家银行存款是否大于等于10000）`,
        `2.指令增加：开关贷款功能、设置、增加、减少 玩家的银行存款`
    ],
    3: [
        `v1.0.5`,
        `1.贷款开通条件支持配置文件自定义（贷款开通条件后续肯定会改）`,
        `2.每日存款利息改为千分比，以协调经济膨胀的服务器，更加灵活`,
        `3.修复信誉分排行榜显示undefined和未知的问题`
    ],
    4: [
        `v1.0.6`,
        `1.修复提现时如果提现的数额不是100（现金价值）的倍数时只扣存款不给物品的问题`,
        `2.优化贷款功能开通条件的判断，配置文件自定义开关是否判断存款数额和计分板分数`,
        `3.修改贷款时的贷款逻辑，最新贷款数额必须大于等于500（额度评定系统的最低额度）`,
        `4.贷款主表单如果玩家已经开通了贷款功能则不显示开通贷款功能的按钮`
    ],
    5: [
        `v1.1.0 【特大更新】`,
        `1.删除无用的数据文件中的参数[捐款指数]`,
        `2.修复信用分排行榜排序错乱的问题`,
        `3.再次修复信用分排行榜可能显示为NaN的问题`,
        `4.信用分排行榜每一行的玩家信息后新增一个参数[玩家是否在银行黑名单中]`,
        `5.新增指令/bank ban | unban | banlist 封禁/解封/列出黑名单 用于封禁或解封特定某个玩家，被封禁的玩家无法使用贷款`,
        `（此指令专门用于在开启贷款功能的前提下禁用某个特定玩家的贷款功能）`,
        `6.修复每日信用分评定可能增加/减少NaN的问题`,
        `7.插件每次加载会自动检查并更新配置文件`,
        `8.玩家每日第一次进服将会扣除个人所得税（支持配置文件自定义开关）`,
        `主表单增加银行使用指南按钮（这个表单内还包含多个其他按钮，可以查看多个银行的功能使用说明，部分按钮功能未完善）`
    ],
    6: [
        `v1.1.1`,
        `1.银行税率表在每次开服时进行一次自动检查并打印到控制台，在点击[查看银行个人所得税计算方法按钮]时也会进行检查`,
        `2.修复玩家每日第一次进服是否扣税不受配置文件控制的问题`,
        `3.扣税开关为开启状态下只有当计算后的扣税值大于0时才会进行扣税和发送提示`,
        `4.扣税成功后记录到日志文件`,
        `5.玩家每次进服会检查并自动补充缺少的数据库参数`,
        `6.修复提现时给的现金物品数量不正确的问题`,
        `7.修复提现时只扣存款但是给的物品数量过少的问题`,
        `8.修改提现时的判断逻辑，增加一个新的函数用于判断玩家背包内是否有充足空间放入提现的物品数量`
    ],
    7: [
        `v1.1.2 【热修复】`,
        `1.优化提现部分逻辑，简化代码`,
        `2.修复银行使用指南-[个人所得税计算方法示例说明]中个人所得税最终计算结果为负数的问题`
    ],
    8: [
        `v1.1.3`,
        `1.增加指令/bank tax true | false 开启 | 关闭 全局扣税开关（OP可用）`,
        `2.充值和提现表单中增加提示当前背包内现金物品的数量`,
        `3.银行主表单[查看银行使用详细指南]按钮更名为[帮助]`,
        `4.[帮助]表单增加新按钮[查看历史更新日志]`,
        `5.优化命令注册，修复输入顶层命令但不输入任何枚举参数时的报错问题`,
        `6.此版本开始后不再考虑经济严重膨胀的服务器，经济严重膨胀的问题自行解决，经济膨胀到人均上亿的服务器不推荐使用本插件`
    ],
    9: [
        `v1.2.0 暂未更新`,
        `${Format.Red}更新预告${Format.Clear}`,
        `1.[根据玩家的各项指标计算其信用分指数] 计算方法 支持配置文件自定义`,
        `（玩家每日第一次进服会检查其信用分指数，如果指数有变化那么将进行一次加减信用分）`,
        `2.[根据玩家银行信用分设置其玩家贷款额度] 计算方法 支持配置文件自定义`,
        `3.完善银行使用指南表单中的其他待定按钮（比如信用分计算方法，贷款额度计算方法）`
    ]
};


const plugin_path = `./plugins/B-Bank/`;
const pluginName = `${Format.Bold}[B-Bank] ${Format.Clear}`;
const Y_BANK = `${Format.LightPurple}${pluginName}${Format.White}`;

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
logger.setTitle("B-Bank");

let config = new JsonConfig(plugin_path + "config/config.json",
    {
        "插件基础配置": {
            "指令": "bank",
            "指令描述": "银行",
            "贷款功能": true
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
            "贷款开通条件": {
                "是否判断存款": true,
                "是否判断计分板": false,
                "贷款开通所需存款": 100000,
                "贷款开通所需计分板数额": {
                    "计分板名称": "zxsc",
                    "所需数额": 1440 // 此处需要根据自己的服务器的玩法和规则 增加&减少&设置 该计分板的分数，（比如计分板zxsc用来计算在线时长并且有相应的增加计分板分数的逻辑存在）
                }
            },
            "存款每日利息千分比": 5,
            "存款至少达到此数值才能获取利息": 1000,
            //"贷款最小金额": 1000,
            //"贷款最大金额": 9999999,
            "贷款周期小时数": 24,
            "贷款利息百分比": 45,
            "贷款默认信用分": 70,
            "银行信用分门槛": 70,
            "是否启用个人所得税每日扣除": true,
            "个人所得税起征点": 100000
        },
        "插件配置文件版本": "202407092222" // 勿动
    }
);

const lastestVersion = "202407101507"; // 更新插件如果配置文件有变化则更改此项版本号然后更改manifest.json版本号即可
let old = `config.json[${config.get("插件配置文件版本")}].bak`;

function updateConfigVersion() {
    if (file.exists(plugin_path + "config/config.json") && config.get("插件配置文件版本") !== lastestVersion) {
        if (!file.exists(plugin_path + "config/old_config/")) {
            file.mkdir(plugin_path + "config/old_config/");
        }
        setTimeout(() => {
            file.copy(plugin_path + "config/config.json", plugin_path + "config/old_config/");
            file.delete(plugin_path + "config/config.json");

            file.rename(plugin_path + "config/old_config/config.json", plugin_path + `config/old_config/${old}`);
            logger.warn(plugin_path + "config/config.json" + "旧配置文件已成功备份至" + plugin_path + `config/old_config/${old}`);
            config.init();
            config.set("插件配置文件版本", lastestVersion);
            logger.warn(`检查到新版本插件的配置文件有变化，已自动更新：[最新配置文件版本 - ${lastestVersion}]`);

        }, 1000);
    }
}

updateConfigVersion();

let formConfig = new JsonConfig(plugin_path + "/config/formJSON.json",
    {
        "银行主表单标题": "银行",
        "银行主表单内容": "欢迎来到银行 : {playerName}\n钱包余额 : {walletBalance} | 银行存款 : {bankBalance}", // {playerName} 是 玩家名
        "充值按钮图片路径": "", // 例如 textures/items/apple
        "提现按钮图片路径": "",
        "存款按钮图片路径": "",
        "取款按钮图片路径": "",
        "贷款主表单按钮图片路径": "",
        "贷款按钮图片路径": "",
        "还款按钮图片路径": "",
        "开通贷款功能按钮图片路径": "",
        "查看信用分排行按钮图片路径": "",
        "银行公共财产按钮图片路径": "",
        "银行公共财产存款按钮图片路径": "",
        "银行公共财产取款按钮图片路径": "",
        "查看银行帮助按钮图片路径": "",
        "个人所得税计算方法按钮图片路径": ""
    }
);

let playerData = new JsonConfig(plugin_path + "data/playerData.json", {});

function getPlayerBankMoney(playerName) {
    return playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] || 0;
}
ll.exports(getPlayerBankMoney, `B-Bank`, `getPlayerBankMoney`);
let bankData = new JsonConfig(plugin_path + "data/bankData.json", {
    "银行公共存款": 0
})

let blacklist = new JsonConfig(plugin_path + "data/blacklist.json", []);

let taxBracketsConfig = new JsonConfig(plugin_path + "data/taxBrackets.json", [ // 支持配置文件自定义，但是不建议自己乱改，需要严格按照要求格式改，否则改坏了不能用
    {
        "upperLimit": 3000,
        "rate": 0.03,
        "quickDeduction": 0
    },
    {
        "upperLimit": 12000,
        "rate": 0.05,
        "quickDeduction": 500
    },
    {
        "upperLimit": 25000,
        "rate": 0.08,
        "quickDeduction": 1600
    },
    {
        "upperLimit": 35000,
        "rate": 0.12,
        "quickDeduction": 3000
    },
    {
        "upperLimit": 55000,
        "rate": 0.18,
        "quickDeduction": 5000
    },
    {
        "upperLimit": 80000,
        "rate": 0.20,
        "quickDeduction": 7500
    },
    {
        "upperLimit": 100000,
        "rate": 0.25,
        "quickDeduction": 16000
    },
    {
        "upperLimit": 500000,
        "rate": 0.30,
        "quickDeduction": 25000
    },
    {
        "upperLimit": "Infinity",
        "rate": 0.35,
        "quickDeduction": 28000
    }
])

let moneyType = config.get("银行相关配置")["经济类型"],
    scoreName = config.get("银行相关配置")["计分板名称"],
    monetaryUnit = config.get("银行相关配置")["货币名称"],
    minDepositForInterest = config.get("银行相关配置")["存款至少达到此数值才能获取利息"],
    ratio = config.get("银行相关配置")["现金价值"],
    moneyItemType = config.get("银行相关配置")["现金物品"],
    minRechargeAmount = ratio,
    minWithdrawAmount = config.get("银行相关配置")["提现最小金额"],
    //minLoanAmount = config.get("银行相关配置")["贷款最小金额"],
    minWithdrawalAmount = config.get("银行相关配置")["取款最小金额"],
    minDepositAmount = config.get("银行相关配置")["存款最小金额"],
    loanCreditScoreThreshold = config.get("银行相关配置")["银行信用分门槛"],
    loanPeriodHours = config.get("银行相关配置")["贷款周期小时数"]

const moneyManager = require("./lib/moneyManager");
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

    let contentStr = formConfig.get("银行主表单内容")
        .replace("{playerName}", player.realName)
        .replace("{walletBalance}", Economy.get(player.xuid))
        .replace("{bankBalance}", playerData.get(player.realName)["玩家存款数据"]["玩家银行存款"]);
    fm.setContent(contentStr);

    // Add buttons
    fm.addButton(`充值-现金换${monetaryUnit}`, formConfig.get("充值按钮图片路径")); // 对应id 0
    fm.addButton(`提现-${monetaryUnit}换现金`, formConfig.get("提现按钮图片路径")); // 对应id 1
    fm.addButton(`存款`, formConfig.get("存款按钮图片路径")); // 对应id 2
    fm.addButton(`取款`, formConfig.get("取款按钮图片路径")); // 对应id 3

    let hasLoanFeature = config.get("插件基础配置")["贷款功能"];
    if (hasLoanFeature) {
        fm.addButton(`贷款`, formConfig.get("贷款主表单按钮图片路径")); // 贷款主表单 对应id 4
        fm.addButton(`银行-公共财产`, formConfig.get("银行公共财产按钮图片路径")); // 对应id 5
        fm.addButton(`查看信用分排行`, formConfig.get("查看信用分排行按钮图片路径")); // 对应id 6
        fm.addButton(`帮助`, formConfig.get("查看银行帮助按钮图片路径")); // 对应id 7
    } else {
        fm.addButton(`银行-公共财产`, formConfig.get("银行公共财产按钮图片路径")); // 对应id 4
        fm.addButton(`查看信用分排行`, formConfig.get("查看信用分排行按钮图片路径")); // 对应id 5
        fm.addButton(`帮助`, formConfig.get("查看银行帮助按钮图片路径")); // 对应id 6
    }

    player.sendForm(fm, (pl, id) => {
        if (id == null) return;
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
            case 4:
                if (hasLoanFeature) {
                    loanMainForm(pl);
                } else {
                    createPublicAssetsForm(pl);
                }
                break;
            case 5:
                if (hasLoanFeature) {
                    createPublicAssetsForm(pl);
                } else {
                    viewAllPlayersCreditScoresForm(pl);
                }
                break;
            case 6:
                if (hasLoanFeature) {
                    viewAllPlayersCreditScoresForm(pl);
                } else {
                    bankGuide(pl);
                }
                break;
            case 7:
                bankGuide(pl);
                break;
        }
    });
}

/**
 * @description 查看银行使用指南表单
 * @param {LLSE_Player} player 玩家对象
 */
function bankGuide(player) {
    let fm = mc.newSimpleForm();
    fm.setTitle(`查看银行使用指南`);
    fm.setContent(`查看银行使用指南`);

    fm.addButton(`个人所得税计算方法`, formConfig.get("个人所得税计算方法按钮图片路径"));
    fm.addButton(`待定1`, ``); // 此处需要完善，包括表单按钮图片路径配置文件初始化
    fm.addButton(`待定2`, ``);
    fm.addButton(`待定3`, ``);
    fm.addButton(`更新日志`, ``);
    player.sendForm(fm, (pl, id) => {
        //if (id == null) return mainBankForm(pl);
        switch (id) {
            case 0:
                getPersonalIncomeTaxCalculation(pl);
                break;
            case 1:
                player.tell(`待定1`);
                break;
            case 2:
                player.tell(`待定2`);
                break;
            case 3:
                player.tell(`待定3`);
                break;
            case 4:
                updateLog(pl);
                break;
            default:
                mainBankForm(pl);
                break;
        }
    })
}

/**
 * @description 拼接字符串然后发送给玩家表单
 * @param {LLSE_Player} player 玩家对象
 * @param {Array} str 包含字符串的数组
 */
function formatFormStr(player, arr) {
    let fm = mc.newCustomForm();
    let new_str = arr.join("\n");
    fm.setTitle(arr[0]); // 使用数组的第一个元素作为标题
    fm.addLabel(new_str);
    player.sendForm(fm, (pl, id) => {
        return updateLog(pl);
    })
}

/**
 * @description
 *  更新日志表单
 * @param {LLSE_Player} player 玩家对象
 */
function updateLog(player) {
    let fm = mc.newSimpleForm();
    fm.setTitle(`更新日志`);
    fm.setContent(`查看历史更新日志`);

    Object.keys(changelogs).forEach(key => fm.addButton(/*Format.Bold + */changelogs[key][0]));

    player.sendForm(fm, (pl, id) => {
        if (changelogs[id]) {
            formatFormStr(pl, changelogs[id]);
        } else {
            bankGuide(pl);
        }
    })
}

/**
 * @description 查看个人所得税计算方法表单
 * @param {LLSE_Player} player 玩家对象
 */
function getPersonalIncomeTaxCalculation(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`查看个人所得税计算方法`);

    const taxThreshold = config.get("银行相关配置")["个人所得税起征点"];
    //const taxBrackets = JSON.parse(file.readFrom(plugin_path + "data/taxBrackets.json"));
    const taxBrackets = taxBracketsConfig.getData();

    // 转换 "Infinity" 为实际的 Infinity 值
    taxBrackets.forEach(bracket => {
        if (bracket["upperLimit"] === "Infinity") {
            bracket["upperLimit"] = Infinity;
        }
    });

    //let minUpperLimit = Math.min(...taxBrackets.map(b => b.upperLimit));
    let maxUpperLimit = Math.max(...taxBrackets.filter(b => b.upperLimit !== Infinity).map(b => b.upperLimit));

    let maxBracket = taxBrackets.find(bracket => bracket.upperLimit === Infinity);

    let taxBracketStr = taxBrackets
        .filter(bracket => bracket.upperLimit !== Infinity)
        .map((bracket, index) => {
            if (index === 0) {
                return `${Format.Green}不超过${bracket.upperLimit} ${Format.Yellow}税率 ${bracket.rate} ${Format.Blue}速算扣除数 ${bracket.quickDeduction}${Format.Clear}`;
            } else {
                let lowerLimit = taxBrackets[index - 1].upperLimit;
                let lowerRate = taxBrackets[index - 1].rate;
                let lowerQuickDeduction = taxBrackets[index - 1].quickDeduction;
                if (lowerLimit >= bracket.upperLimit || lowerRate >= bracket.rate || lowerQuickDeduction >= bracket.quickDeduction) {
                    player.tell(`${Format.Red}税率表生成区间错误!请联系服务器管理员!`);
                    throw new Error(`税率表生成区间错误! lowerLimit 必须小于 bracket.upperLimit , 请检查配置文件taxBrackets.json中的upperLimit、rate、quickDeduction从上到下是否依次为递增规律!`);
                }
                return `${lowerLimit}~${bracket.upperLimit} ${Format.Yellow}税率 ${bracket.rate} ${Format.Blue}速算扣除数 ${bracket.quickDeduction}${Format.Clear}`;
            }
        }).join("\n");

    if (maxBracket) {
        taxBracketStr += `\n${Format.Red}超过${maxUpperLimit} ${Format.Yellow}税率 ${maxBracket.rate} ${Format.Blue}速算扣除数 ${maxBracket.quickDeduction}${Format.Clear}`;
    }

    //logger.warn(minUpperLimit);
    //logger.warn(maxUpperLimit);

    let calculationExampleIncome = 50000;
    let taxableIncome = calculationExampleIncome - taxThreshold;
    let exampleBracket = taxBrackets.find(bracket => taxableIncome <= bracket.upperLimit) || taxBrackets[taxBrackets.length - 1];
    let exampleTax = taxableIncome * exampleBracket.rate - exampleBracket.quickDeduction;
    //let temp = calculatePersonalIncomeTax(50000, taxThreshold);
    let str = [
        `${Format.Red}注意：理解此处需要一定数学基础和思维逻辑能力`,
        `${Format.Aqua}①个人所得税的起征点（即免税额）为${taxThreshold}${monetaryUnit}。`,
        `②也就是说，当玩家的存款超过${taxThreshold}时，超出部分才需要缴纳个人所得税。`,
        `③具体的税率是累进税率，根据收入的不同，税率分为以下几个档次：`,
        `${Format.Gold}个人存款所得税率表：`,
        `应纳税所得额（每日，单位：${monetaryUnit}） 税率（百分比） 速算扣除数（${monetaryUnit}）`,
        taxBracketStr,
        `计算方式：`,
        `应纳税所得额 = 存款 - 起征点（${taxThreshold}${monetaryUnit}） - 各项扣除`,
        `${Format.LightPurple}举个例子，如果一个人的存款为${calculationExampleIncome}${monetaryUnit}：`,
        `计算应纳税所得额：${calculationExampleIncome} - ${taxThreshold} = ${taxableIncome}${monetaryUnit}`,
        `查表得知${taxableIncome}${monetaryUnit}对应的税率为${exampleBracket.rate}（百分比），速算扣除数为${exampleBracket.quickDeduction}${monetaryUnit}`,
        `计算应纳税额：${taxableIncome} × ${exampleBracket.rate}（百分比） - ${exampleBracket.quickDeduction} = ${exampleTax}${monetaryUnit}`,
        `${Format.DarkAqua}因此，该玩家的个人所得税为${Math.max(Math.round(exampleTax), 0)}${monetaryUnit}。`,
        `${Format.Red}有时候最终计算后的结果可能是负数，如果是负数，那么会自动转化为0，并且不会扣除玩家个人所得税`,
        `${Format.Green}玩家会在每日第一次进服后被扣除个人所得税`
    ].join("\n");

    //logger.warn(Math.max(Math.round(exampleTax), 0));
    //logger.warn(str);

    fm.addLabel(str);
    player.sendForm(fm, (pl, id) => {
        return bankGuide(pl);
    });
}

/**
 * @description 检查玩家的背包中的指定物品，函数将返回物品的数量
 * @param {LLSE_Player} player 玩家对象
 * @param {String} itemName 物品标准类型名
 * @returns 物品的数量
 */
function checkPlayerInventoryItem(player, itemName) {
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
    return totalCount;
}
/**
 * @description 检查玩家的背包并清除指定数量的物品，如果玩家背包内没有指定数量的物品，函数将返回缺少的数量；如果有足够的物品，函数将返回 true，表示成功移除物品
 * @param {LLSE_Player} player 玩家对象
 * @param {String} itemName 物品标准类型名
 * @param {Number} requiredCount 要检查和清除的物品的数量
 * @returns 如果满足条件则返回 true，否则返回 缺少的数量
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
        //player.tell(`${Y_BANK}` +`已清除你背包中的 ${requiredCount} 个 ${itemName}"。`);
        return true;

    } else {
        // 如果玩家背包内没有指定数量的物品，函数将返回缺少的数量
        //return player.tell(`${Y_BANK}` +`你没有足够的 ${itemName}。`);
        //return false;
        return requiredCount - totalCount;
    }
}

/**
 * @description 计算玩家背包中还可以放入多少指定数量的物品
 * @param {LLSE_Player} player 玩家对象
 * @param {String} itemName 物品标准类型名
 * @param {Number} checkNum 要添加的物品数量
 * @returns 指定物品数量的可用空间（数字）若空间不足则返回false
 */
function checkAvailableSpace(player, itemName, checkNum) {
    // 计算背包中可用的空间
    let items = player.getInventory().getAllItems();
    let emptySlots = 0;
    let availableSpace = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].isNull()) {
            emptySlots++;
        } else if (items[i].type == itemName && items[i].count < 64) {
            availableSpace += (64 - items[i].count);
        }
    }

    // 计算空格子能放多少物品
    availableSpace += emptySlots * 64;

    // 如果可用空间不足，返回 false
    if (availableSpace < checkNum) {
        return false;
    }
    return availableSpace;
}

/**
 * @description 给与玩家背包指定数量的物品，如果玩家背包有空格子则放入空格子，如果背包已有同类物品且未堆叠满，则优先堆叠；每个格子最多堆叠64个物品
 * @param {LLSE_Player} player 玩家对象
 * @param {String} itemName 物品标准类型名
 * @param {Number} addCount 要添加的物品数量
 * @returns {Boolean} 添加是否成功
 */
function addItemToPlayer(player, itemName, addCount) {
    // 获取玩家物品栏容器对象
    let inventory = player.getInventory();
    let items = inventory.getAllItems();
    let remainingCount = addCount;

    // 计算背包中可用的空间
    // 如果可用空间不足，返回 false
    if (checkAvailableSpace(player, itemName, addCount) === false) {
        return false;
    }

    // 优先堆叠已有的同类物品
    for (let i = 0; i < items.length; i++) {
        if (items[i].type == itemName && items[i].count < 64) {
            let stackableCount = 64 - items[i].count;
            if (remainingCount <= stackableCount) {
                inventory.setItem(i, mc.newItem(itemName, items[i].count + remainingCount));
                remainingCount = 0;
                break;
            } else {
                inventory.setItem(i, mc.newItem(itemName, 64));
                remainingCount -= stackableCount;
            }
        }
    }

    // 如果还有剩余的物品，放入空格子
    while (remainingCount > 0) {
        let addAmount = Math.min(remainingCount, 64);
        let success = inventory.addItemToFirstEmptySlot(mc.newItem(itemName, addAmount));
        if (!success) {
            //return false; // 如果没有空格子，则添加失败
            return player.tell(`${Format.Red}添加剩余的 ${addAmount} 个物品失败!`);
        }
        remainingCount -= addAmount;
    }

    // 刷新玩家物品栏显示
    player.refreshItems();

    return true;
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
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let cashAmount = checkPlayerInventoryItem(player, moneyItemType);
    //let itemName = mc.newItem(moneyItemType, 1).name;

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}\n背包内所拥有的现金数量 : ${cashAmount}`);
    fm.addInput(`请输入想要充值的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);
        let [num, remainder] = checkPositiveInteger2(inputAmount, ratio);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (inputAmount < minRechargeAmount) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请至少充值 ${minRechargeAmount} ${monetaryUnit}`);

        if (playerData.get(playerName)["玩家充值数据"]["当日充值额"] <= 0) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的当日充值额度已用完，请等待次日再进行充值`);

        if (inputAmount > playerData.get(playerName)["玩家充值数据"]["当日充值额"]) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的当日充值额度为 ${playerData.get(playerName)["玩家充值数据"]["当日充值额"]}`);

        if (remainder !== 0) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `想要充值的金额必须能被 ${ratio} 整除`);

        let result = checkAndRemoveItem(pl, moneyItemType, num);

        if (result !== true) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你没有足够的现金(${moneyItemType})，想充值${inputAmount}${monetaryUnit}至少还需${result}个现金`);

        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] += inputAmount;
        playerData.get(playerName)["玩家充值数据"]["当日充值额"] -= inputAmount;

        pl.tell(`${Y_BANK}` + `已成功充值 ${inputAmount} ${monetaryUnit} 消耗 ${num} 个 现金(${moneyItemType})`);
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
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let cashAmount = checkPlayerInventoryItem(player, moneyItemType);
    //let itemName = mc.newItem(moneyItemType, 1).name;

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}\n背包内所拥有的现金数量 : ${cashAmount}`);
    fm.addInput(`请输入想要提现的数额：`, `请输入正整数`);

    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (inputAmount > bankDeposit) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你没有那么多存款`);

        if (inputAmount < minWithdrawAmount) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请至少提现 ${minWithdrawAmount} ${monetaryUnit}`);

        if (playerData.get(playerName)["玩家提现数据"]["当日提现额"] <= 0) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的当日提现额度已用完，请等待次日再进行提现`);

        if (inputAmount > playerData.get(playerName)["玩家提现数据"]["当日提现额"]) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的当日提现额度为 ${playerData.get(playerName)["玩家充值数据"]["当日充值额"]}`);

        let [num, remainder] = checkPositiveInteger2(inputAmount, ratio);
        let consume = inputAmount - remainder; // num是整数，remainder是余数，只扣除整数部分的经济数额，例如提现6405，则扣除6400并给64个物品

        let actualConsume = remainder !== 0 ? consume : inputAmount;

        if (checkAvailableSpace(pl, moneyItemType, num) === false) {
            return pl.tell(`${Y_BANK}${Format.Red}提现失败，你的背包空间不足以放下 ${num} 个物品`);
        }

        addItemToPlayer(pl, moneyItemType, num);
        pl.refreshItems();

        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] -= actualConsume;
        playerData.get(playerName)["玩家提现数据"]["当日提现额"] -= actualConsume;

        pl.tell(`${Y_BANK}已成功从银行提现 ${num} 个 现金(${moneyItemType}) 消耗 ${actualConsume} ${monetaryUnit}`);
        logger.info(`玩家 ${playerName} 已成功从银行提现 ${num} 个 现金(${moneyItemType}) 消耗存款 ${actualConsume} ${monetaryUnit}`);
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
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}`);
    fm.addInput(`请输入想要存入的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (inputAmount < minDepositAmount) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请至少存入 ${minDepositAmount} ${monetaryUnit}`);

        if (inputAmount > playerBalance) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的钱包没有那么多余额`);

        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] += inputAmount;
        playerData.save();
        Economy.reduce(pl.xuid, inputAmount);
        pl.tell(`${Y_BANK}` + `已成功向银行存入 ${inputAmount} ${monetaryUnit}`);
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
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];

    fm.addLabel(`欢迎来到银行 : ${playerName} | ${currentTime}\n钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}`);
    fm.addInput(`请输入想要取出的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (inputAmount < minWithdrawalAmount) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请至少取出 ${minWithdrawalAmount} ${monetaryUnit}`);

        if (inputAmount > bankDeposit) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你没有那么多存款`);

        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] -= inputAmount;
        playerData.save();
        Economy.add(pl.xuid, inputAmount);
        pl.tell(`${Y_BANK}` + `已成功从银行取出 ${inputAmount} ${monetaryUnit}`);
        logger.info(`玩家 ${playerName} 从银行取出 ${inputAmount} ${monetaryUnit}`);
    })
}

/**
 * @description 贷款主表单
 * @param {LLSE_Player} player 玩家对象
 */
function loanMainForm(player) {
    let fm = mc.newSimpleForm();
    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let canPlayerLoan = !playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] ? `${Format.Green}是${Format.Clear}` : `${Format.Red}` + `否${Format.Clear}`;
    let hasLoan = playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] ? `${Format.Red}` + `是${Format.Clear}` : `${Format.Green}否${Format.Clear}`;
    let remainingRepaymentAmount = playerData.get(playerName)["玩家贷款数据"]["负债数额"];
    let currentLoanLimit = playerData.get(player.realName)["玩家贷款数据"]["当前贷款额度"];
    let loanStatus = playerData.get(playerName)["玩家贷款数据"]["贷款功能是否已开通"] ? `${Format.Green}已开通` : `${Format.Red}未开通`;

    fm.setTitle(`贷款`);
    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的银行信用分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信用分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.White}你的贷款额度 : ${Format.Green}${currentLoanLimit}${Format.Clear}`,
        `${Format.White}当前是否背负贷款 : ${hasLoan} | 当前是否可以贷款 : ${canPlayerLoan}${Format.Clear}`,
        `${Format.White}剩余需要还款的余额 : ${remainingRepaymentAmount}${Format.Clear}`,
        `贷款开通状态 : ${loanStatus}`
    ];
    fm.setContent(arr.join("\n"));
    fm.addButton(`贷款`, formConfig.get("贷款按钮图片路径"));
    fm.addButton(`还款`, formConfig.get("还款按钮图片路径"));

    if (!playerData.get(playerName)["玩家贷款数据"]["贷款功能是否已开通"]) {
        fm.addButton(`开通贷款功能`, formConfig.get("开通贷款功能按钮图片路径"));
    }

    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);
        switch (id) {
            case 0: // 贷款
                if (!playerData.get(playerName)["玩家贷款数据"]["贷款功能是否已开通"]) {
                    return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你并未开通贷款功能`);
                }
                if (blacklist.getData().includes(playerName)) {
                    return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你在银行黑名单中，请联系服务器管理员获得更多信息`);
                }
                loan(pl);
                break;
            case 1: // 贷款 - 手动还款
                if (!playerData.get(playerName)["玩家贷款数据"]["贷款功能是否已开通"]) {
                    return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你并未开通贷款功能`);
                }
                loanManualRepayment(pl);
                break;
            case 2:
                if (playerData.get(playerName)["玩家贷款数据"]["贷款功能是否已开通"]) {
                    return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你已经开通贷款功能`);
                }
                // 此处的开通贷款功能的条件判断可能需要修改、优化，用更加合理的方式进行判断
                let c1 = config.get("银行相关配置")["贷款开通条件"]["是否判断存款"];
                let c2 = config.get("银行相关配置")["贷款开通条件"]["是否判断计分板"];
                let need_money = config.get("银行相关配置")["贷款开通条件"]["贷款开通所需存款"];
                let tempScore = config.get("银行相关配置")["贷款开通条件"]["贷款开通所需计分板数额"]["计分板名称"];
                let tempNum = config.get("银行相关配置")["贷款开通条件"]["贷款开通所需计分板数额"]["所需数额"];

                let isDepositEligible = true;
                let isScoreEligible = true;
                
                if (c1) isDepositEligible = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] >= need_money;

                if (c2) isScoreEligible = pl.getScore(tempScore) >= tempNum;

                let isLoanEligible = (c1 ? isDepositEligible : true) && (c2 ? isScoreEligible : true);

                if (isLoanEligible) {

                    playerData.get(playerName)["玩家贷款数据"]["贷款功能是否已开通"] = true;
                    pl.tell(`${Y_BANK}` + `${Format.Green}` + `贷款功能已开通成功`);

                } else {

                    //logger.warn(`${Y_BANK}` + `${Format.Red}` + `贷款功能开通失败 : ${pl.realName} | ${isLoanEligible} | ${(c1 ? isDepositEligible : true)} | ${(c2 ? isScoreEligible : true)}`);
                    return pl.tell(`${Y_BANK}` + `${Format.Red}` + `贷款功能开通失败`);
                }
                
                playerData.save();

                break;
        }
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
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let canPlayerLoan = !playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] ? `${Format.Green}是${Format.Clear}` : `${Format.Red}` + `否${Format.Clear}`;
    let hasLoan = playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] ? `${Format.Red}` + `是${Format.Clear}` : `${Format.Green}否${Format.Clear}`;
    let remainingRepaymentAmount = playerData.get(playerName)["玩家贷款数据"]["负债数额"];
    let currentLoanLimit = playerData.get(player.realName)["玩家贷款数据"]["当前贷款额度"];
    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的银行信用分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信用分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.White}你的贷款额度 : ${Format.Green}${currentLoanLimit}${Format.Clear}`,
        `${Format.White}当前是否背负贷款 : ${hasLoan} | 当前是否可以贷款 : ${canPlayerLoan}${Format.Clear}`,
        `${Format.White}剩余需要还款的余额 : ${remainingRepaymentAmount}${Format.Clear}`
    ]
    fm.addLabel(arr.join("\n"));
    fm.addInput(`请输入想要贷款的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);
        let loanDataConfig = playerData.get(playerName)["玩家贷款数据"];
        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (inputAmount < 500) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请至少贷款 500 ${monetaryUnit}`);

        if (inputAmount > currentLoanLimit) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的贷款额度只有 ${currentLoanLimit} ${monetaryUnit}`);

        if (loanDataConfig["当前银行信用分"] < loanCreditScoreThreshold) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的银行信用分过低，请保持及时还款的好习惯`);

        if (playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"]) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你当前有未还清的贷款，请及时还款`);

        if (bankDeposit <= 0) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请确保你的银行存款为正数，否则无法进行贷款`);

        //贷款的逻辑...
        playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] = true;
        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] += inputAmount;
        playerData.get(playerName)["玩家贷款数据"]["负债数额"] = inputAmount;
        playerData.get(playerName)["玩家贷款数据"]["贷款金额"] = inputAmount;
        playerData.get(playerName)["玩家贷款数据"]["贷款时间"] = getdetailCurrentTime();
        playerData.get(playerName)["玩家贷款数据"]["日期检查"] = getCurrentDate();
        let repaymentDueDate = addHoursToDate(getdetailCurrentTime(), loanPeriodHours)
        playerData.get(playerName)["玩家贷款数据"]["贷款预期还款时间"] = repaymentDueDate;
        pl.tell(`${Y_BANK}` + `已成功贷款：${inputAmount} ${monetaryUnit}，请在 ${repaymentDueDate} 之前还款`);
        logger.info(`玩家已成功贷款：${inputAmount} ${monetaryUnit}，请在 ${repaymentDueDate} 之前还款`);
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
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let canPlayerLoan = !playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] ? `${Format.Green}` + `是${Format.Clear}` : `${Format.Red}` + `否${Format.Clear}`;
    let hasLoan = playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] ? `${Format.Red}` + `是${Format.Clear}` : `${Format.Green}` + `否${Format.Clear}`;
    let remainingRepaymentAmount = playerData.get(playerName)["玩家贷款数据"]["负债数额"];
    let currentLoanLimit = playerData.get(player.realName)["玩家贷款数据"]["当前贷款额度"];
    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的银行信用分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信用分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.White}你的贷款额度 : ${Format.Green}${currentLoanLimit}${Format.Clear}`,
        `${Format.White}当前是否背负贷款 : ${hasLoan} | 当前是否可以贷款 : ${canPlayerLoan}${Format.Clear}`,
        `${Format.White}剩余需要还款的余额 : ${remainingRepaymentAmount}${Format.Clear}`
    ]
    fm.addLabel(arr.join("\n"));
    fm.addInput(`请输入想要还款的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);

        let inputAmount = Number(id[1]);
        let targetDate = playerData.get(playerName)["玩家贷款数据"]["贷款时间"];
        let diff = calculateHoursDifference(targetDate, getdetailCurrentTime());

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (!playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"]) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你当前没有贷款`);

        if (playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] && diff < 1) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请至少1小时后再来还款`);

        if (inputAmount > remainingRepaymentAmount) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你当前负债数额为 ${remainingRepaymentAmount}，不能输入比此数值更大的数字`);

        if (inputAmount > bankDeposit) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你没有那么多存款`);

        //贷款-手动还款的逻辑...
        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] -= inputAmount;
        playerData.get(playerName)["玩家贷款数据"]["负债数额"] -= inputAmount;
        if (playerData.get(playerName)["玩家贷款数据"]["负债数额"] === 0) {
            playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] = false;
            playerData.get(playerName)["玩家贷款数据"]["贷款金额"] = 0;
            playerData.get(playerName)["玩家贷款数据"]["贷款时间"] = "";
            playerData.get(playerName)["玩家贷款数据"]["贷款实际还款时间"] = getdetailCurrentTime();
        }
        let check = (inputAmount === playerData.get(playerName)["玩家贷款数据"]["玩家贷款金额"]) ? true : false;
        if (check) { // 判断是否是全款还款
            playerData.get(playerName)["玩家贷款数据"]["主动还款次数"] += 1;
            playerData.get(playerName)["玩家贷款数据"]["全款还款次数"] += 1;
        } else {
            // 不是全款还款...
        }
        if (playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] <= 0) {
            playerData.get(playerName)["玩家贷款数据"]["因还款导致破产次数"] += 1;
        }
        let tell_str = `已成功还款 ${inputAmount} ${monetaryUnit}`;
        pl.tell(`${Y_BANK}` + `[主动还款]` + tell_str);
        logger.info(`[主动还款]玩家` + tell_str);

        playerData.save();
    })
}

/**
 * @description 查看所有玩家的银行信用分表单
 * @param {LLSE_Player} player 玩家对象
 */
function viewAllPlayersCreditScoresForm(player) {

    let dat = playerData.getData();
    let list = [];
    // 将玩家名和信用分存储到数组中
    for (let pl_name in dat) {
        if (Object.hasOwnProperty.call(dat, pl_name) && pl_name) {
            //logger.warn(pl_name);
            let isInBlacklist = blacklist.getData().includes(pl_name) ? `${Format.Gray}黑名单用户` : ``;
            list.push({ name: pl_name, score: dat[pl_name]["玩家贷款数据"]["当前银行信用分"], bl: isInBlacklist/*getLoanCreditScore(pl_name)*/ });
        }
    }

    // 按信用分降序排列
    list.sort((a, b) => b.score - a.score);

    // 生成排序后的字符串列表
    let resultList = ``;
    list.forEach((item, index) => {
        //resultList += `${index + 1}. ${item.name} - ${item.score}\n`;
        resultList += `${index + 1}. ${item.name} - ${getLoanCreditScore(item.name)} ${item.bl}\n`;
    });

    let fm = mc.newCustomForm();
    fm.setTitle(`银行-查看信用分排行`);
    fm.addLabel(resultList.trim());
    player.sendForm(fm, (pl, id) => {
        return mainBankForm(pl);
    });
}

/**
 * @description 银行公共存款表单
 * @param {LLSE_Player} player 玩家对象
 */
function createPublicAssetsForm(player) {
    let fm = mc.newSimpleForm();
    fm.setTitle(`银行-公共财产`);

    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let publicAssets = bankData.get("银行公共存款");

    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的银行信用分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信用分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.Green}银行公共存款 : ${Format.Yellow}${publicAssets}${Format.Clear}`
    ]
    fm.setContent(arr.join("\n"));
    fm.addButton(`存款`, formConfig.get("银行公共财产存款按钮图片路径"));
    fm.addButton(`取款`, formConfig.get("银行公共财产取款按钮图片路径"));

    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainBankForm(pl);
        switch (id) {
            case 0: // 银行 公共财产 存款
                depositPublicAssets(pl);
                break;
            case 1: // 银行 公共财产 取款
                let loanDataConfig = playerData.get(playerName)["玩家贷款数据"];
                if (loanDataConfig["当前银行信用分"] < loanCreditScoreThreshold) {
                    return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的银行信用分过低，请保持及时还款的好习惯`);
                }
                withdrawPublicAssets(pl);
                break;
        }
    })
}

/**
 * @description 存入银行公共财产表单
 * @param {LLSE_Player} player 玩家对象
 */
function depositPublicAssets(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-公共财产-存款`);

    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let publicAssets = bankData.get("银行公共存款");

    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的银行信用分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信用分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.Green}银行公共存款 : ${Format.Yellow}${publicAssets}${Format.Clear}`
    ]
    fm.addLabel(arr.join("\n"));
    fm.addInput(`请输入想要存入的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return createPublicAssetsForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (inputAmount > bankDeposit) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `你的银行存款不足 ${inputAmount}`);

        bankData.set("银行公共存款", bankData.get("银行公共存款") + inputAmount);

        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] -= inputAmount;

        // 捐款越多，捐款额度越高，也会影响到信用分计算指数
        playerData.get(playerName)["玩家贷款数据"]["捐款额度"] += inputAmount;

        bankData.save();
        playerData.save();
        pl.tell(`${Y_BANK}` + `已成功向银行公共财产存入 ${inputAmount} ${monetaryUnit}`);
        logger.info(`玩家 ${playerName} 向银行公共财产存入 ${inputAmount} ${monetaryUnit}`);
    })
}

/**
 * @description 从银行公共财产中取款表单
 * @param {LLSE_Player} player 玩家对象
 */
function withdrawPublicAssets(player) {
    let fm = mc.newCustomForm();
    fm.setTitle(`银行-公共财产-取款`);

    let playerName = player.realName;
    let currentTime = getdetailCurrentTime();
    let playerBalance = Economy.get(player.xuid);
    let bankDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
    let publicAssets = bankData.get("银行公共存款");

    let arr = [
        `${Format.White}欢迎来到银行 : ${playerName} | ${currentTime}${Format.Clear}`,
        `${Format.White}钱包余额 : ${playerBalance} | 银行存款 : ${bankDeposit}${Format.Clear}`,
        `${Format.White}你的银行信用分 : ${getLoanCreditScore(player)}${Format.Clear}`,
        `${Format.White}贷款最低要求信用分 : ${Format.Green}${loanCreditScoreThreshold}${Format.Clear}`,
        `${Format.Green}银行公共存款 : ${Format.Yellow}${publicAssets}${Format.Clear}`
    ]
    fm.addLabel(arr.join("\n"));
    fm.addInput(`请输入想要取出的数额：`, `请输入正整数`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return createPublicAssetsForm(pl);

        let inputAmount = Number(id[1]);

        if (!isPositiveInteger(inputAmount)) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `请输入正整数`);

        if (inputAmount > publicAssets) return pl.tell(`${Y_BANK}` + `${Format.Red}` + `银行公共财产不足 ${inputAmount}`);

        playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] += inputAmount;

        bankData.set("银行公共存款", bankData.get("银行公共存款") - inputAmount);
        // 向银行公共财产存钱也会增加信用分指数
        bankData.save();
        playerData.save();
        pl.tell(`${Y_BANK}` + `已成功从银行公共财产中取出 ${inputAmount} ${monetaryUnit}`);
        logger.info(`玩家 ${playerName} 从银行公共财产中取出 ${inputAmount} ${monetaryUnit}`);
    })
}

/**
 * @description 根据玩家银行信用分设置其玩家贷款额度
 * @param {LLSE_Player} player 玩家对象
 */
function setLoanLimitBasedOnCreditScore(player) {
    let playerCreditData = playerData.get(player.realName)["玩家贷款数据"];
    let currentCreditScore = playerCreditData["当前银行信用分"];
    let newLoanLimit;

    switch (true) {
        case (currentCreditScore < 50):
            newLoanLimit = 100;
            break;
        case (currentCreditScore >= 50 && currentCreditScore < 70):
            newLoanLimit = 200;
            break;
        case (currentCreditScore >= 70 && currentCreditScore <= 100):
            newLoanLimit = 500;
            break;
        case (currentCreditScore >= 101 && currentCreditScore < 150):
            newLoanLimit = 1000;
            break;
        case (currentCreditScore >= 150 && currentCreditScore < 200):
            newLoanLimit = 2000;
            break;
        case (currentCreditScore >= 200 && currentCreditScore < 250):
            newLoanLimit = 5000;
            break;
        case (currentCreditScore >= 250 && currentCreditScore < 300):
            newLoanLimit = 10000;
            break;
        case (currentCreditScore >= 300 && currentCreditScore < 350):
            newLoanLimit = 30000;
            break;
        case (currentCreditScore >= 350 && currentCreditScore < 450):
            newLoanLimit = 80000;
            break;
        case (currentCreditScore >= 450 && currentCreditScore < 500):
            newLoanLimit = 100000;
            break;
        default:
            newLoanLimit = 200000; // 如果评分超过500，设置一个默认值
            break;
    }

    // 保存新的贷款额度
    playerCreditData["当前贷款额度"] = newLoanLimit;
    playerData.save();
}

/**
 * @description 根据玩家对象获取玩家当前银行信用分
 * @param player 玩家对象 或 玩家名
 */
function getLoanCreditScore(param) {
    let loanCreditScore = (typeof param === "object")
        ? playerData.get(param.realName)["玩家贷款数据"]["当前银行信用分"]
        : playerData.get(param)["玩家贷款数据"]["当前银行信用分"]
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

/**
 * @description 根据玩家的各项指标计算其信用分指数
 * @param {Number} activeRepayments 主动还款次数
 * @param {Number} passiveRepayments 被动还款次数
 * @param {Number} fullRepayments 全款还款次数
 * @param {Number} bankruptcyFrequency 因还款导致破产次数
 * @param {Number} donationCount 捐款额度
 * @returns 信用分重新计算后的值 数字
 */
function calculateCreditScore(activeRepayments, passiveRepayments, fullRepayments, bankruptcyFrequency, donationCount) {
    // 定义每种还款类型的加权值
    const ACTIVE_REPAYMENT_POINTS = 3;
    const PASSIVE_REPAYMENT_POINTS = 2;
    const FULL_REPAYMENT_POINTS = 5;
    const RUPTCY_POINTS = -10;
    const DONATION_POINTS = 1000;

    // 计算信用分增加值
    let creditScoreIncrease =
        (activeRepayments * ACTIVE_REPAYMENT_POINTS) +
        (passiveRepayments * PASSIVE_REPAYMENT_POINTS) +
        (fullRepayments * FULL_REPAYMENT_POINTS) +
        (bankruptcyFrequency * RUPTCY_POINTS) +
        Math.round((donationCount / DONATION_POINTS))

    return creditScoreIncrease;
}

mc.listen("onJoin", (player) => {
    try {
        if (player.isSimulatedPlayer()) {
            return;
        }
        if (config.get("银行相关配置")["个人所得税起征点"] > 100000) {
            config.get("银行相关配置")["个人所得税起征点"] = 100000;
            logger.warn(`不是哥们，起征点 ${config.get("银行相关配置")["个人所得税起征点"]} 设这么高没意义了哦~已自动更改为 100000 经济膨胀自己解决，谁让你加商店的？`);
            config.save();
        }

        let playerName = player.realName;
        //logger.warn(playerData.get(playerName)["玩家贷款数据"]["测试"]);
        //logger.warn(checkPlayerInventoryItem(player, moneyItemType));
        let defaultConfig = {
            "玩家贷款数据": {
                "当前银行信用分": config.get("银行相关配置")["贷款默认信用分"],
                "贷款功能是否已开通": false,
                "当前是否正在贷款": false,
                "负债数额": 0,
                "贷款金额": 0,
                "贷款时间": "",
                "主动还款次数": 0,
                "被动还款次数": 0,
                "全款还款次数": 0,
                "因还款导致破产次数": 0,
                "捐款额度": 0,
                "信用分计算指数": 0,
                "日期检查": ""
            },
            "玩家充值数据": {
                "当日充值额": config.get("银行相关配置")["每日充值限额"],
                "日期检查": ""
            },
            "玩家提现数据": {
                "当日提现额": config.get("银行相关配置")["每日提现限额"],
                "日期检查": ""
            },
            "玩家存款数据": {
                "玩家银行存款": 0,
                "日期检查": ""
            }
        }

        if (!playerData.get(playerName)) {
            playerData.set(playerName, defaultConfig)
        }

        let categories = ["玩家贷款数据", "玩家充值数据", "玩家提现数据", "玩家存款数据"];
        let bankConfig = config.get("银行相关配置");

        categories.forEach(category => {
            for (let key in defaultConfig[category]) {
                if (playerData.get(playerName)[category][key] == null) {
                    playerData.get(playerName)[category][key] = defaultConfig[category][key];
                    logger.warn(`检查到玩家 ${playerName} 的数据库缺少默认参数 : playerData.get(${playerName})[${category}][${key}] , 已自动初始化 : ${defaultConfig[category][key]}`);
                }
            }
        });

        // 此处是检查玩家是否背负贷款并且贷款周期是否超过24小时
        if (playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"]) {
            let targetDate = playerData.get(playerName)["玩家贷款数据"]["贷款时间"];
            let diff = calculateHoursDifference(targetDate, getdetailCurrentTime());

            if (diff >= loanPeriodHours) {
                let loanInterestRate = bankConfig["贷款利息百分比"];
                let loanAmount = playerData.get(playerName)["玩家贷款数据"]["贷款金额"];
                let loanInterestAmount = Math.floor(loanAmount * (loanInterestRate / 100));
                let deductionAmount = loanAmount + loanInterestAmount;
                playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] -= deductionAmount;
                playerData.get(playerName)["玩家贷款数据"]["当前是否正在贷款"] = false;
                playerData.get(playerName)["玩家贷款数据"]["负债数额"] = 0;
                playerData.get(playerName)["玩家贷款数据"]["贷款金额"] = 0;
                playerData.get(playerName)["玩家贷款数据"]["贷款时间"] = "";
                playerData.get(playerName)["玩家贷款数据"]["被动还款次数"] += 1;
                playerData.get(playerName)["玩家贷款数据"]["贷款实际还款时间"] = getdetailCurrentTime();

                player.tell(`${Y_BANK}你的上一个贷款已强制还款 ${deductionAmount} (含利息${loanInterestAmount})，存款：${playerData.get(playerName)["玩家存款数据"]["玩家银行存款"]}`);
                logger.info(`玩家 ${playerName} 的上一个贷款已强制还款 ${deductionAmount} (含利息${loanInterestAmount})，存款：${playerData.get(playerName)["玩家存款数据"]["玩家银行存款"]}`);

                if (playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] <= 0) {
                    playerData.get(playerName)["玩家贷款数据"]["因还款导致破产次数"] += 1;
                }
            }
        }

        // 此处是评定玩家银行信用分的逻辑...
        // 此处的逻辑大概是：先检查玩家是否今日第一次进服
        if (playerData.get(playerName)["玩家贷款数据"]["日期检查"] !== getCurrentDate()) {
            playerData.get(playerName)["玩家贷款数据"]["日期检查"] = getCurrentDate();
            // 然后从各个维度的玩家的还款记录（履约能力）计算并设置该玩家的信用分指数
            let updateScore = calculateCreditScore(
                playerData.get(playerName)["玩家贷款数据"]["主动还款次数"], // 3
                playerData.get(playerName)["玩家贷款数据"]["被动还款次数"], // 2
                playerData.get(playerName)["玩家贷款数据"]["全款还款次数"], // 1
                playerData.get(playerName)["玩家贷款数据"]["因还款导致破产次数"], // 1
                playerData.get(playerName)["玩家贷款数据"]["捐款额度"] // 1
            ); // 3 * 2 + 2 * 1 + 1 * 5 + 1 * -10 + 1 * 4 = 7

            let currentScore = playerData.get(playerName)["玩家贷款数据"]["信用分计算指数"]; // 0 或 更高
            if (currentScore !== updateScore) { // 然后判断玩家当前的信用分指数有没有变化
                playerData.get(playerName)["玩家贷款数据"]["信用分计算指数"] = updateScore;

                // 如果有变化，那么更新其信用分指数
                playerData.get(playerName)["玩家贷款数据"]["当前银行信用分"] += updateScore; // 100 + 7 = 107

                let scoreDifference = updateScore - currentScore;
                if (scoreDifference === NaN || playerData.get(playerName)["玩家贷款数据"]["当前银行信用分"] === NaN) {
                    throw new Error(`发现错误: scoreDifference 为 NaN , playerData.get(playerName)["玩家贷款数据"]["当前银行信用分"] 为NaN , 请检查数据文件是否缺少参数! 请提供报错截图和playerData.json文件内容截图反馈给插件作者!`);
                }
                if (scoreDifference > 0) {
                    let tell_str = `的信用分增加了 ${scoreDifference} 分(当前${playerData.get(playerName)["玩家贷款数据"]["当前银行信用分"]})`;
                    player.tell(`${Y_BANK}` + `[每日信用分评定]你` + tell_str);
                    logger.info(`[每日信用分评定]玩家` + tell_str);
                } else {
                    let tell_str = `的信用分减少了 ${Math.abs(scoreDifference)} 分(当前${playerData.get(playerName)["玩家贷款数据"]["当前银行信用分"]})`;
                    player.tell(`${Y_BANK}` + `[每日信用分评定]你` + tell_str);
                    logger.info(`[每日信用分评定]玩家` + tell_str);
                }
            }
        }

        setLoanLimitBasedOnCreditScore(player); // 重新评定玩家贷款额度（根据玩家银行信用分设置其贷款额度）

        if (playerData.get(playerName)["玩家充值数据"]["日期检查"] !== getCurrentDate()) {
            playerData.get(playerName)["玩家充值数据"]["日期检查"] = getCurrentDate();
            playerData.get(playerName)["玩家充值数据"]["当日充值额"] = bankConfig["每日充值限额"];
        }
        if (playerData.get(playerName)["玩家提现数据"]["日期检查"] !== getCurrentDate()) {
            playerData.get(playerName)["玩家提现数据"]["日期检查"] = getCurrentDate();
            playerData.get(playerName)["玩家提现数据"]["当日提现额"] = bankConfig["每日提现限额"];
        }

        if (playerData.get(playerName)["玩家存款数据"]["日期检查"] !== getCurrentDate()) {
            playerData.get(playerName)["玩家存款数据"]["日期检查"] = getCurrentDate();

            // 计算每日存款利息
            let depositInterestRate = bankConfig["存款每日利息千分比"];
            let currentDeposit = playerData.get(playerName)["玩家存款数据"]["玩家银行存款"];
            if (currentDeposit > minDepositForInterest) {
                let interestAmount = Math.floor(currentDeposit * (depositInterestRate / 1000));
                playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] += interestAmount;
                player.tell(`${Y_BANK}` + `已自动获取存款利息 : ${interestAmount} , 存款: ${playerData.get(playerName)["玩家存款数据"]["玩家银行存款"]}`);
                logger.info(`玩家 ${playerName} 领取今日存款利息 ${interestAmount} 存款: ${playerData.get(playerName)["玩家存款数据"]["玩家银行存款"]}`);
            } else {
                player.tell(`${Y_BANK}` + `你的银行存款少于 ${minDepositForInterest} ${monetaryUnit} 无法获取每日利息`);
            }

            // 计算个人所得税
            if (config.get("银行相关配置")["是否启用个人所得税每日扣除"]) {
                let tax = calculatePersonalIncomeTax(playerData.get(playerName)["玩家存款数据"]["玩家银行存款"], config.get("银行相关配置")["个人所得税起征点"]);
                if (/*tax !== 0 && */tax > 0) {
                    playerData.get(playerName)["玩家存款数据"]["玩家银行存款"] -= tax;
                    player.tell(`${Y_BANK}` + `已成功扣除个人所得税 ${tax} , 你的存款 : ${playerData.get(playerName)["玩家存款数据"]["玩家银行存款"]}`);
                    logger.info(`已成功扣除玩家 ${playerName} 的个人所得税 ${tax} , 他的存款 : ${playerData.get(playerName)["玩家存款数据"]["玩家银行存款"]}`);
                }
            }
        }

        if (playerData.get(playerName)["玩家贷款数据"]["当前银行信用分"] < loanCreditScoreThreshold) {
            player.tell(`${Y_BANK}` + `你的当前银行信用分过低 : ${getLoanCreditScore(playerName)}, 请保持及时还款的好习惯`);
        }

        playerData.save();
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        logger.error(error.stack);
    }
});

function calculatePersonalIncomeTax(deposit, threshold) {
    /*
    模拟中国的个人所得税扣除方法
    在中国，个人所得税的起征点（即免税额）为每日5000金币人民币。也就是说，当个人的存款超过5000金币时，超出部分才需要缴纳个人所得税。
    具体的税率是累进税率，根据收入的不同，税率分为以下几个档次：

    工资薪金所得税率表
    应纳税所得额（每日，单位：金币）	税率（%）	速算扣除数（金币）
    不超过3000	3	0
    3000～12000	10	210
    12000～25000	20	1410
    25000～35000	25	2660
    35000～55000	30	4410
    55000～80000	35	7160
    超过80000	45	15160
    计算方式
    应纳税所得额 = 存款 - 起征点（5000金币） - 各项扣除

    举个例子，如果一个人的存款为15000金币：

    计算应纳税所得额：15000 - 5000 = 10000金币
    查表得知10000金币对应的税率为10%，速算扣除数为210金币
    计算应纳税额：10000 × 10% - 210 = 790金币
    因此，该人的个人所得税为790金币。
    */

    // 把 所有的 rate 调小（0~1之间的小数），把所有的 quickDeduction（正整数） 调大 最终扣除的个人所得税越小
    //const taxBrackets = JSON.parse(file.readFrom(plugin_path + "data/taxBrackets.json"));
    const taxBrackets = taxBracketsConfig.getData();
    //logger.warn(JSON.stringify(taxBrackets, null, 4));
    //logger.warn(typeof taxBrackets);

    // 转换 "Infinity" 为实际的 Infinity 值
    taxBrackets.forEach(bracket => {
        if (bracket["upperLimit"] === "Infinity") {
            bracket["upperLimit"] = Infinity;
        }
    });

    const taxableIncome = deposit - threshold;
    if (taxableIncome <= 0) return 0;
    let tax = 0;
    for (let i = 0; i < taxBrackets.length; i++) {
        if (taxableIncome <= taxBrackets[i].upperLimit) {
            tax = taxableIncome * taxBrackets[i].rate - taxBrackets[i].quickDeduction;
            break;
        }
    }
    return Math.max(Math.round(tax), 0);
}

//logger.warn(calculatePersonalIncomeTax(50000, 10000));

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

let command = config.get("插件基础配置")["指令"];
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand(command, config.get("插件基础配置")["指令描述"], PermType.Any);

    cmd.setEnum("ReloadAction", ["gui", "reload", "help", "banlist"]);
    cmd.setEnum("ChangeAction", ["set", "add", "reduce"]);
    cmd.setEnum("BanAction", ["ban", "unban"])
    cmd.setEnum("LoanAction", ["loan"]);
    cmd.setEnum("TaxAction", ["tax"]);

    cmd.mandatory("action", ParamType.Enum, "ReloadAction", 1);
    cmd.mandatory("action", ParamType.Enum, "ChangeAction", 1);
    cmd.mandatory("action", ParamType.Enum, "BanAction", 1);
    cmd.mandatory("action", ParamType.Enum, "LoanAction", 1);
    cmd.mandatory("action", ParamType.Enum, "TaxAction", 1);

    cmd.mandatory("playerName", ParamType.String);
    cmd.mandatory("number", ParamType.Int);
    cmd.mandatory("enable", ParamType.Bool);

    cmd.overload(["ReloadAction"]);
    cmd.overload(["ChangeAction", "playerName", "number"]);
    cmd.overload(["BanAction", "playerName"]);
    cmd.overload(["LoanAction", "enable"]);
    cmd.overload(["TaxAction", "enable"]);
    cmd.overload([]);

    cmd.setCallback((_cmd, ori, out, res) => {
        let player = ori.player;
        let helpStr = [
            `${Format.Aqua}` + `<< B-Bank 银行 使用详细指南 >>`,
            `${Format.Yellow}` + `/${command} 或 /${command} gui 打开银行主菜单`,
            `${Format.Yellow}` + `/${command} help 查看银行使用详细指南`,
            `${Format.Yellow}` + ` 充值 : 使用现金物品兑换虚拟 ${monetaryUnit} (兑换的资金会存入银行)`,
            `${Format.Yellow}` + ` 提现 : 使用银行内存款兑换实体现金物品(兑换的现金会存入背包)`,
            `${Format.Yellow}` + ` 存款 : 将钱包里的 ${monetaryUnit} 存储到银行存款`,
            `${Format.Yellow}` + ` 取款 : 将银行里的存款转移到钱包余额`,
            `${Format.Yellow}` + ` 贷款 : 顾名思义`,
            `${Format.Yellow}` + ` 还款 : 顾名思义`,
            `${Format.Yellow}` + ` 公共财产 : 任何人都可以存款、取款(信用分过低的不能取款)`,
            `${Format.Gold}` + ` 注意1 : 充值和提现都是直接对于银行存款里的资金进行操作，并非钱包余额`,
            `${Format.Gold}` + ` 注意2 : 银行存款和钱包余额是两种分开并且独立存储的，不要混淆`,
            `${Format.Gold}` + ` 注意3 : 若你进行了贷款，请及时还款`,
            `${Format.Aqua}` + `+========================+`,
        ];

        if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
            helpStr.splice(3, 0, `${Format.Yellow}` + `/${command} reload 热重载银行插件配置文件`);
        }

        const reloadConfig = () => {
            config.save();
            playerData.save();
            bankData.save();
            formConfig.save();

            return out.success(`${Y_BANK}已成功热重载插件配置文件`);
        };

        switch (res["action"]) {
            case "gui":
                return mainBankForm(player);
            case "reload":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    return reloadConfig();
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "help":
                return out.success(`${Y_BANK}` + helpStr.join("\n"));
            case "set":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    playerData.get(res["playerName"])["玩家存款数据"]["玩家银行存款"] = res["number"];
                    playerData.save();
                    return out.success(`${Y_BANK}玩家 ${res["playerName"]} 的银行存款已成功设置为 ${res["number"]}`);
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "add":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    playerData.get(res["playerName"])["玩家存款数据"]["玩家银行存款"] += res["number"];
                    playerData.save();
                    return out.success(`${Y_BANK}玩家 ${res["playerName"]} 的银行存款已成功增加 ${res["number"]}`);
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "reduce":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    playerData.get(res["playerName"])["玩家存款数据"]["玩家银行存款"] -= res["number"];
                    playerData.save();
                    return out.success(`${Y_BANK}玩家 ${res["playerName"]} 的银行存款已成功减少 ${res["number"]}`);
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "loan":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    config.get("插件基础配置")["贷款功能"] = res["enable"];
                    config.save();
                    let loan_enable = (res["enable"] === true) ? `${Format.Green}开启` : `${Format.Red}关闭`;
                    return out.success(`${Y_BANK}全局贷款功能已设置为 ${loan_enable}`);
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "tax":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    config.get("银行相关配置")["是否启用个人所得税每日扣除"] = res["enable"];
                    config.save();
                    let tax_enable = (res["enable"] === true) ? `${Format.Green}开启` : `${Format.Red}关闭`;
                    return out.success(`${Y_BANK}全局扣税开关已设置为 ${tax_enable}`);
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "ban":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    if (blacklist.getData().includes(res["playerName"])) {
                        return out.error(`玩家 ${res["playerName"]} 已经在银行黑名单中`);
                    }
                    blacklist.getData().push(res["playerName"]);
                    blacklist.save();
                    return out.success(`${Y_BANK}已成功将玩家 ${res["playerName"]} 拉入银行黑名单`);
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "unban":
                if (ori.type === 7 || (ori.type === 0 && player.isOP())) {
                    if (!blacklist.getData().includes(res["playerName"])) {
                        return out.error(`玩家 ${res["playerName"]} 不在银行黑名单中`);
                    }
                    let array = blacklist.getData();
                    array.splice(array.indexOf(res["playerName"]), 1);
                    blacklist.save();
                    return out.success(`${Y_BANK}已成功解除玩家 ${res["playerName"]} 的银行黑名单`);
                } else {
                    return out.error(`你没有执行这个指令的权限`);
                }
            case "banlist":
                return out.success(`${Y_BANK}银行黑名单：${blacklist.getData()}`);
            default:
                if (ori.player) {
                    return mainBankForm(player);
                } else {
                    return out.error(`此命令仅限玩家执行!`);
                }
        }
    })
    cmd.setup();

    if (Economy.mType() === "scoreboard" && !mc.getScoreObjective(scoreName)) {
        mc.newScoreObjective(scoreName, monetaryUnit);
        logger.warn(`计分项 ${scoreName} 不存在，已自动创建 : ${scoreName} - ${monetaryUnit}`);
    }
    let tempScoreName = config.get("银行相关配置")["贷款开通条件"]["贷款开通所需计分板数额"]["计分板名称"];
    if (config.get("银行相关配置")["贷款开通条件"]["是否判断计分板"] && !mc.getScoreObjective(tempScoreName)) {
        mc.newScoreObjective(tempScoreName, "§e在线时长§b_分§r"); // zxsc - 贷款开通所需计分板
        logger.warn(`计分项 ${tempScoreName} 不存在，已自动创建 : ${tempScoreName} - §e在线时长§b_分§r`); // zxsc - 贷款开通所需计分板
    }
    const taxBrackets = taxBracketsConfig.getData();

    // 转换 "Infinity" 为实际的 Infinity 值
    taxBrackets.forEach(bracket => {
        if (bracket["upperLimit"] === "Infinity") {
            bracket["upperLimit"] = Infinity;
        }
    });
    let maxUpperLimit = Math.max(...taxBrackets.filter(b => b.upperLimit !== Infinity).map(b => b.upperLimit));

    let maxBracket = taxBrackets.find(bracket => bracket.upperLimit === Infinity);
    let taxBracketStr = taxBrackets
        .filter(bracket => bracket.upperLimit !== Infinity)
        .map((bracket, index) => {
            if (index === 0) {
                return `${Format.Green}不超过${bracket.upperLimit} ${Format.Yellow}税率 ${bracket.rate} ${Format.Blue}速算扣除数 ${bracket.quickDeduction}${Format.Clear}`;
            } else {
                let lowerLimit = taxBrackets[index - 1].upperLimit;
                let lowerRate = taxBrackets[index - 1].rate;
                let lowerQuickDeduction = taxBrackets[index - 1].quickDeduction;
                if (lowerLimit >= bracket.upperLimit || lowerRate >= bracket.rate || lowerQuickDeduction >= bracket.quickDeduction) {
                    throw new Error(`税率表生成区间错误! lowerLimit 必须小于 bracket.upperLimit , 请检查配置文件taxBrackets.json中的upperLimit、rate、quickDeduction从上到下是否依次为递增规律!`);
                }
                return `${lowerLimit}~${bracket.upperLimit} ${Format.Yellow}税率 ${bracket.rate} ${Format.Blue}速算扣除数 ${bracket.quickDeduction}${Format.Clear}`;
            }
        }).join("\n");
    if (maxBracket) {
        taxBracketStr += `\n${Format.Red}超过${maxUpperLimit} ${Format.Yellow}税率 ${maxBracket.rate} ${Format.Blue}速算扣除数 ${maxBracket.quickDeduction}${Format.Clear}`;
    }
    //log(`银行税率表：\n` + taxBracketStr);
    //log(`银行税率表生成区间格式检查成功!`);
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

/**
 * @description 根据玩家对象获取玩家当前是否背负贷款
 * @param {LLSE_Player} player 玩家对象
 * @returns {Boolean} 玩家当前是否背负贷款
 */
function hasExistingLoan(player) {
    return playerData.get(player.realName)["玩家贷款数据"]["当前是否正在贷款"];
}

ll.exports(hasExistingLoan, "B-Bank", "hasExistingLoan");
