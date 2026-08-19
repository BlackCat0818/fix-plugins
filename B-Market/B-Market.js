// LiteLoader-AIDS automatic generated
/// <reference path="c:\LSE-API/dts/helperlib/src/index.d.ts"/> 


const moneyManager = require("./lib/moneyManager");
const { I18nAPI } = require('./GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS'); // 用于获取物品原名称

let getEnchantTypeNameFromId = ll.imports("GMLIB_API", "getEnchantTypeNameFromId");
let getEnchantNameAndLevel = ll.imports("GMLIB_API", "getEnchantNameAndLevel");
//let getItemCategoryName = ll.imports("GMLIB_API", "getItemCategoryName");
let getItemEffecName = ll.imports("GMLIB_API", "getItemEffecName");
//let getItemCustomName = ll.imports("GMLIB_API", "getItemCustomName");
let getItemMaxCount = ll.imports("GMLIB_API", "getItemMaxCount");
let getItemLockMode = ll.imports("GMLIB_API", "getItemLockMode");
let getItemShouldKeepOnDeath = ll.imports("GMLIB_API", "getItemShouldKeepOnDeath");

function sendGroupMsg(msg) {
    ll.imports("SparkAPIEx", "sendGroupMsg")(ll.imports("SparkAPIEx", "getMainGroup")(), msg)
}

const plugin_prefix = `§6[Market] §r`;

let textureData = new JsonConfigFile(`./plugins/B-Market/FinalTexture/config/` + 'texture_path.json', JSON.stringify({}, null, 4));
let default_icon_config = new JsonConfigFile(`./plugins/B-Market/FinalTexture/config/` + 'config.json', JSON.stringify(
    {
        "default": "textures/ui/gift_square"
    }
    , null, 4)
);

function getTextureData(name) {
    return textureData.get(name);
}

/**
 * 
 * @param {String} name 物品类型
 * @returns 
 */
function getTexture(name) {
    let path = getTextureData(name);
    //logger.warn(path);

    if (path == 'null') return default_icon_path;
    if (!path) {
        if (name.includes(':')) {
            textureData.set(name, 'null');
        }
        return default_icon_path;
    }
    return path;
}

const default_icon_path = default_icon_config.get("default")//"textures/ui/promo_gift_small_green";

let config = new JsonConfigFile(`./plugins/B-Market/config/config.json`, JSON.stringify(
    {
        "Economic": {
            "Enable": true,
            "EconomicType": "llmoney",
            "ScoreboardName": "moeny",
            "StoreCreationCost": 1000
        },
        "banItems": [
            "minecraft:clock"
        ]
    }, null, 4
))

let market_data = new JsonConfigFile(`./plugins/B-Market/data/market.json`, JSON.stringify(
    {

    }, null, 4
))

let transactionRecord = new JsonConfigFile(`./plugins/B-Market/data/transactionRecord.json`, JSON.stringify(
    [], null, 4
))

const StoreCreationCost = config.get("Economic")["StoreCreationCost"];

let Economy = config.get("Economic")["Enable"] ? new moneyManager(config.get("Economic")["EconomicType"], config.get("Economic")["ScoreboardName"]) : false;

mc.listen("onServerStarted", () => {
    const market_cmd = mc.newCommand("market", "打开市场", PermType.Any);
    market_cmd.setAlias("mk");
    market_cmd.overload([]);
    market_cmd.setCallback((cmd, ori, out, res) => {
        const player = ori.player;

        if (!player) return out.error("此命令仅限玩家执行!");

        return mainMarketMenu(player);
    })
    market_cmd.setup();
})

/**
 * 打开市场主表单
 * @param {LLSE_Player} player 
 */
function mainMarketMenu(player) {
    let obj = JSON.parse(market_data.read());
    const storeCount = Object.keys(obj).length;
    let totalGoodsCount = 0;
    // 计算所有店铺中商品的总数
    for (const storeUUID in obj) {
        if (obj.hasOwnProperty(storeUUID)) {
            const store = obj[storeUUID];
            store.goods.forEach(item => {
                totalGoodsCount += item.itemCount;
            });
        }
    }
    const fm = mc.newSimpleForm();
    fm.setTitle("市场");
    fm.setContent(`欢迎进入市场：当前有 ${storeCount} 个店铺，共计 ${totalGoodsCount} 件商品`);

    fm.addButton("查看全部商品", "textures/ui/icon_deals");
    fm.addButton("根据商品名称搜索商品", "textures/ui/magnifyingGlass");
    fm.addButton("按店铺查看商品", "textures/ui/icon_hangar");
    fm.addButton("店铺排行榜", "textures/ui/store_filter_icon");
    fm.addButton("查看交易记录", "textures/ui/recipe_book_icon");
    fm.addButton("管理个人店铺", "textures/ui/color_picker"); // 如果没有店铺则进入创建店铺界面、然后：上架商品、下架商品、编辑商品，卷铺跑路、暂时关店

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return;
        }
        switch (id) {
            case 0: // 查看全部商品
                viewAllProducts(pl);
                break;
            case 1: // 根据商品名称搜索商品
                searchAllProducts(pl);
                break;
            case 2: // 按店铺查看商品
                viewAllStores(pl);
                break;
            case 3: // 查看店铺排行榜
                viewAllStoresRanking(pl);
                break;
            case 4: // 查看交易记录
                viewTransactionRecord(pl);
                break;
            case 5: // 管理个人店铺
                if (market_data.get(pl.uuid)) {
                    send_manage_personal_store_menu(pl);
                } else {
                    pl.sendModalForm("创建个人店铺", `您还没有创建个人店铺，是否现在创建一个？\n创建个人店铺需要启动资金 ${StoreCreationCost} 金币\n您的余额：${Economy.get(pl.xuid)} 金币`,
                        "前往创建",
                        "取消",
                        (pl, res) => {
                            if (res) {
                                send_create_personal_store_menu(pl);
                            }
                        }
                    )
                }
                break;
        }
    })
}

/**
 * 查看交易记录
 * @param {LLSE_Player} player 
 */
function viewTransactionRecord(player) {
    const fm = mc.newCustomForm();
    fm.setTitle("查看交易记录");
    JSON.parse(transactionRecord.read()).forEach(r => {
        fm.addLabel(r);
    })
    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return mainMarketMenu(pl);
        }
        return mainMarketMenu(pl);
    })
}

/**
 * 查看全部商品
 * @param {LLSE_Player} player 
 */
function viewAllProducts(player) {
    const fm = mc.newSimpleForm();
    fm.setTitle("购买商品");
    fm.setContent("请选择您要购买的商品：");

    let obj = JSON.parse(market_data.read());
    let allGoods = [];

    for (const storeUUID in obj) {
        if (obj.hasOwnProperty(storeUUID)) {
            const store = obj[storeUUID];
            if (store.isOpen) {
                store.goods.forEach(item => {
                    allGoods.push({ item, store, storeUUID });
                });
            }
        }
    }

    // 按照 item.itemTypeName 进行排序
    allGoods.sort((a, b) => {
        if (a.item.itemTypeName < b.item.itemTypeName) return -1;
        if (a.item.itemTypeName > b.item.itemTypeName) return 1;
        return 0;
    });

    allGoods.forEach(({ item, store, storeUUID }) => {
        const enBook = item.itemName === `附魔书` ? item.itemInfo.replace(`\n`, ``).replace(`附魔书`, ``) : item.itemName;
        fm.addButton(`${enBook} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return mainMarketMenu(pl);
        }
        // 处理选择的商品
        if (id < allGoods.length) {
            const { item, store } = allGoods[id];

            const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

            const form = mc.newCustomForm();
            form.setTitle("购买商品");

            let arr = [
                `§6商品所在店铺名称: ${store.storeName}§r§f`,
                `店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
                `§e店铺创建日期: ${store.createDate}`,
                `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
                `平均每笔交易额: ${averageTransactionAmount}`,
                `§d===============================§f`,
                `§c【§a商品介绍：${item.itemName} | 库存：${item.itemCount} | 单价: ${item.itemUnitPrice}§c】`,
                `§6商品备注：§r§f${item.itemRemark}`,
                `§b上架时间：${item.itemUploadTime ?? `未记录上架时间`}`,
                `§a商品详情：`,
                `${getItemDisplayName(mc.newItem(NBT.parseSNBT(item.itemSNBT)), true)}`
            ];

            form.addLabel(arr.join("\n").trim());
            form.addInput(`请输入要购买的数量： §7| §e您的余额： ${Economy.get(pl.xuid)}`, `正整数`, `1`);

            pl.sendForm(form, (pl2, id2) => {
                if (id2 == null) {
                    return viewAllProducts(pl2);
                }
                const num = Number(id2[1]);
                if (isNaN(num) || num <= 0) {
                    return pl2.tell(plugin_prefix + "§c请输入正整数!");
                }
                const needMoney = item.itemUnitPrice * num;
                if (Economy.get(pl2.xuid) < needMoney) {
                    return pl2.tell(plugin_prefix + `§c您的余额不足以购买 ${num} 个 ${item.itemName}!`);
                }
                if (pl2.realName === store.storeOwnerName) {
                    return pl2.tell(plugin_prefix + `§c禁止购买自己店铺内的商品!`);
                }
                if (num <= item.itemCount) {
                    // 此处添加给予物品的逻辑：先检查背包可用空间，然后给予指定数量的物品
                    if (addItemToPlayer(pl2, item.itemSNBT, num)) {
                        Economy.reduce(pl2.xuid, needMoney);
                        store.revenue += needMoney;
                        store.tradeCount++;
                        item.itemCount -= num;
                        item.itemSNBT = NBT.parseSNBT(item.itemSNBT).setByte("Count", item.itemCount).toSNBT();
                        if (item.itemCount === 0) {
                            const index = store.goods.indexOf(item);
                            if (index !== -1) {
                                store.goods.splice(index, 1);
                            }
                        }

                        market_data.write(JSON.stringify(obj, null, 4));

                        let transactionRecordObj = JSON.parse(transactionRecord.read());
                        transactionRecordObj.push(`§b[${system.getTimeStr()}] §d${pl2.realName} §f在 §a${store.storeOwnerName} §r§f的店铺 <${store.storeName}§r§f> §r§a花费 §6${needMoney} 金币 §r§a购买了 §c${num} §f个 §3${item.itemName}`);
                        transactionRecord.write(JSON.stringify(transactionRecordObj, null, 4));
                        transactionRecord.reload();

                        pl2.tell(plugin_prefix + `§a成功购买 ${num} 个 ${item.itemName}，消费了 ${needMoney} 金币。`);

                        if (data.name2xuid(store.storeOwnerName)) {
                            Economy.add(data.name2xuid(store.storeOwnerName), needMoney); // 给店主加钱
                        }

                        if (mc.getPlayer(store.storeOwnerName) != null) {
                            mc.getPlayer(store.storeOwnerName).tell(plugin_prefix + `§a您的小店刚刚出售了 ${num} 个 ${item.itemName} 净赚 ${needMoney} 金币，买家：${pl2.realName}!`);
                        }
                    } else {
                        return pl2.tell(plugin_prefix + `§c您的背包空间不足!`);
                    }
                } else {
                    return pl2.tell(plugin_prefix + `§c商品库存不足!`);
                }
            });
        }
    });
}

/**
 * 搜索全部商品
 * @param {LLSE_Player} player 
 */
function searchAllProducts(player) {
    const fm = mc.newCustomForm();
    fm.setTitle(`搜索商品`);
    fm.addInput(`根据商品名称模糊搜索现有的商品：`, `字符串`, `附魔书`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        let input = id[0];
        if (!input || input.length <= 0) return pl.tell(`§c请输入要搜索的商品名称!`);

        // 从 market_data 中读取所有商品
        let obj = JSON.parse(market_data.read());
        let searchedGoods = [];

        for (const storeUUID in obj) {
            if (obj.hasOwnProperty(storeUUID)) {
                const store = obj[storeUUID];
                if (store.isOpen) {
                    store.goods.forEach(item => {
                        if (item.itemName.includes(input)) {
                            searchedGoods.push({ item, store, storeUUID });
                        }
                    });
                }
            }
        }

        // 按照 item.itemTypeName 进行排序
        searchedGoods.sort((a, b) => {
            if (a.item.itemTypeName < b.item.itemTypeName) return -1;
            if (a.item.itemTypeName > b.item.itemTypeName) return 1;
            return 0;
        });

        if (searchedGoods.length === 0) {
            return pl.tell(`§c未找到与 "${input}" 相关的商品!`);
        }

        // 创建新的 simple 表单显示搜索结果
        const resultForm = mc.newSimpleForm();
        resultForm.setTitle(`搜索结果 - ${input}`);
        resultForm.setContent(`请选择您要购买的商品：`);

        searchedGoods.forEach(({ item, store }) => {
            const enBook = item.itemName === `附魔书` ? item.itemInfo.replace(`\n`, ``).replace(`附魔书`, ``) : item.itemName;
            resultForm.addButton(`${enBook} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
        });

        pl.sendForm(resultForm, (pl2, id2) => {
            if (id2 == null) {
                return mainMarketMenu(pl2);
            }
            // 处理选择的商品
            if (id2 < searchedGoods.length) {
                const { item, store } = searchedGoods[id2];

                const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

                const form = mc.newCustomForm();
                form.setTitle("购买商品");

                let arr = [
                    `§6商品所在店铺名称: ${store.storeName}§r§f`,
                    `§b[共计${store.goods.length} 项商品，合计 ${store.goods.reduce((total, g) => total + g.itemCount, 0)} 件商品]`,
                    `§e店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
                    `店铺创建日期: ${store.createDate}`,
                    `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
                    `平均每笔交易额: ${averageTransactionAmount}`,
                    `§d===============================§f`,
                    `§c【§a商品介绍：${item.itemName} | 库存：${item.itemCount} | 单价: ${item.itemUnitPrice}§c】`,
                    `§6商品备注：§r§f${item.itemRemark}`,
                    `§b上架时间：${item.itemUploadTime ?? `未记录上架时间`}`,
                    `§a商品详情：`,
                    `${getItemDisplayName(mc.newItem(NBT.parseSNBT(item.itemSNBT)), true)}`
                ];

                form.addLabel(arr.join("\n").trim());
                form.addInput(`请输入要购买的数量： §7| §e您的余额： ${Economy.get(pl2.xuid)}`, `正整数`, `1`);

                pl2.sendForm(form, (pl3, id3) => {
                    if (id3 == null) {
                        return sendSearchResultsForm(pl3, input, searchedGoods); // 返回到展示搜索结果的表单
                    }
                    const num = Number(id3[1]);
                    if (isNaN(num) || num <= 0) {
                        return pl3.tell(plugin_prefix + "§c请输入正整数!");
                    }
                    const needMoney = item.itemUnitPrice * num;
                    if (Economy.get(pl3.xuid) < needMoney) {
                        return pl3.tell(plugin_prefix + `§c您的余额不足以购买 ${num} 个 ${item.itemName}!`);
                    }
                    if (pl3.realName === store.storeOwnerName) {
                        return pl3.tell(plugin_prefix + `§c禁止购买自己店铺内的商品!`);
                    }
                    if (num <= item.itemCount) {
                        // 此处添加给予物品的逻辑：先检查背包可用空间，然后给予指定数量的物品
                        if (addItemToPlayer(pl3, item.itemSNBT, num)) {
                            Economy.reduce(pl3.xuid, needMoney);
                            store.revenue += needMoney;
                            store.tradeCount++;
                            item.itemCount -= num;
                            item.itemSNBT = NBT.parseSNBT(item.itemSNBT).setByte("Count", item.itemCount).toSNBT();
                            if (item.itemCount === 0) {
                                const index = store.goods.indexOf(item);
                                if (index !== -1) {
                                    store.goods.splice(index, 1);
                                }
                            }

                            market_data.write(JSON.stringify(obj, null, 4));

                            let transactionRecordObj = JSON.parse(transactionRecord.read());
                            transactionRecordObj.push(`§b[${system.getTimeStr()}] §d${pl3.realName} §f在 §a${store.storeOwnerName} §r§f的店铺 <${store.storeName}> §r§a花费 §6${needMoney} 金币 §r§a购买了 §c${num} §f个 §3${item.itemName}`);
                            transactionRecord.write(JSON.stringify(transactionRecordObj, null, 4));
                            transactionRecord.reload();

                            pl3.tell(plugin_prefix + `§a成功购买 ${num} 个 ${item.itemName}，消费了 ${needMoney} 金币。`);

                            if (data.name2xuid(store.storeOwnerName)) {
                                Economy.add(data.name2xuid(store.storeOwnerName), needMoney); // 给店主加钱
                            }

                            if (mc.getPlayer(store.storeOwnerName) != null) {
                                mc.getPlayer(store.storeOwnerName).tell(plugin_prefix + `§a您的小店刚刚出售了 ${num} 个 ${item.itemName} 净赚 ${needMoney} 金币，买家：${pl3.realName}!`);
                            }

                            // 发送搜索结果表单
                            sendSearchResultsForm(pl3, input, searchedGoods);
                        } else {
                            return pl3.tell(plugin_prefix + `§c您的背包空间不足!`);
                        }
                    } else {
                        return pl3.tell(plugin_prefix + `§c商品库存不足!`);
                    }
                });
            }
        });
    });
}

/**
 * 重新发送展示搜索结果的表单
 * @param {LLSE_Player} player 
 * @param {string} input 
 * @param {Array} searchedGoods 
 */
function sendSearchResultsForm(player, input, searchedGoods) {
    const resultForm = mc.newSimpleForm();
    resultForm.setTitle(`搜索结果 - ${input}`);
    resultForm.setContent(`请选择您要购买的商品：`);

    searchedGoods.forEach(({ item, store }) => {
        const enBook = item.itemName === `附魔书` ? item.itemInfo.replace(`\n`, ``).replace(`附魔书`, ``) : item.itemName;
        resultForm.addButton(`${enBook} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });

    player.sendForm(resultForm, (pl2, id2) => {
        if (id2 == null) {
            return searchAllProducts(pl2);
        }
        if (id2 < searchedGoods.length) {
            const { item, store } = searchedGoods[id2];

            const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

            const form = mc.newCustomForm();
            form.setTitle("购买商品");

            let arr = [
                `§6商品所在店铺名称: ${store.storeName}§r§f`,
                `§b[共计${store.goods.length} 项商品，合计 ${store.goods.reduce((total, g) => total + g.itemCount, 0)} 件商品]`,
                `§e店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
                `店铺创建日期: ${store.createDate}`,
                `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
                `平均每笔交易额: ${averageTransactionAmount}`,
                `§d===============================§f`,
                `§c【§a商品介绍：${item.itemName} | 库存：${item.itemCount} | 单价: ${item.itemUnitPrice}§c】`,
                `§6商品备注：§r§f${item.itemRemark}`,
                `§b上架时间：${item.itemUploadTime ?? `未记录上架时间`}`,
                `§a商品详情：`,
                `${getItemDisplayName(mc.newItem(NBT.parseSNBT(item.itemSNBT)), true)}`
            ];

            form.addLabel(arr.join("\n").trim());
            form.addInput(`请输入要购买的数量： §7| §e您的余额： ${Economy.get(pl2.xuid)}`, `正整数`, `1`);

            pl2.sendForm(form, (pl3, id3) => {
                if (id3 == null) {
                    return searchAllProducts(pl3);
                }
                const num = Number(id3[1]);
                if (isNaN(num) || num <= 0) {
                    return pl3.tell(plugin_prefix + "§c请输入正整数!");
                }
                const needMoney = item.itemUnitPrice * num;
                if (Economy.get(pl3.xuid) < needMoney) {
                    return pl3.tell(plugin_prefix + `§c您的余额不足以购买 ${num} 个 ${item.itemName}!`);
                }
                if (pl3.realName === store.storeOwnerName) {
                    return pl3.tell(plugin_prefix + `§c禁止购买自己店铺内的商品!`);
                }
                if (num <= item.itemCount) {
                    // 此处添加给予物品的逻辑：先检查背包可用空间，然后给予指定数量的物品
                    if (addItemToPlayer(pl3, item.itemSNBT, num)) {
                        Economy.reduce(pl3.xuid, needMoney);
                        store.revenue += needMoney;
                        store.tradeCount++;
                        item.itemCount -= num;
                        item.itemSNBT = NBT.parseSNBT(item.itemSNBT).setByte("Count", item.itemCount).toSNBT();
                        if (item.itemCount === 0) {
                            const index = store.goods.indexOf(item);
                            if (index !== -1) {
                                store.goods.splice(index, 1);
                            }
                        }

                        market_data.write(JSON.stringify(obj, null, 4));

                        let transactionRecordObj = JSON.parse(transactionRecord.read());
                        transactionRecordObj.push(`§b[${system.getTimeStr()}] §d${pl3.realName} §f在 §a${store.storeOwnerName} §r§f的店铺 <${store.storeName}> §r§a花费 §6${needMoney} 金币 §r§a购买了 §c${num} §f个 §3${item.itemName}`);
                        transactionRecord.write(JSON.stringify(transactionRecordObj, null, 4));
                        transactionRecord.reload();

                        pl3.tell(plugin_prefix + `§a成功购买 ${num} 个 ${item.itemName}，消费了 ${needMoney} 金币。`);

                        if (data.name2xuid(store.storeOwnerName)) {
                            Economy.add(data.name2xuid(store.storeOwnerName), needMoney); // 给店主加钱
                        }

                        if (mc.getPlayer(store.storeOwnerName) != null) {
                            mc.getPlayer(store.storeOwnerName).tell(plugin_prefix + `§a您的小店刚刚出售了 ${num} 个 ${item.itemName} 净赚 ${needMoney} 金币，买家：${pl3.realName}!`);
                        }

                        // 重新发送搜索结果表单
                        sendSearchResultsForm(pl3, input, searchedGoods);
                    } else {
                        return pl3.tell(plugin_prefix + `§c您的背包空间不足!`);
                    }
                } else {
                    return pl3.tell(plugin_prefix + `§c商品库存不足!`);
                }
            });
        }
    });
}

/**
 * 查看所有店铺-默认按创建日期排序
 * @param {LLSE_Player} player 
 */
function viewAllStores(player) {
    const fm = mc.newSimpleForm();
    fm.setTitle("查看店铺");
    fm.setContent("请选择您要查看的店铺：根据店铺创建日期排列");

    let obj = JSON.parse(market_data.read());
    const icon_steve = `textures/ui/icon_steve`;
    const icon_alex = `textures/ui/icon_alex`;
    const iconPaths = [icon_steve, icon_alex];
    let iconIndex = 0;

    for (const storeUUID in obj) {
        if (obj.hasOwnProperty(storeUUID)) {
            const store = obj[storeUUID];
            if (store.isOpen) {
                fm.addButton(`${store.storeOwnerName} 的小店`, iconPaths[iconIndex]);
                iconIndex = (iconIndex + 1) % iconPaths.length; // 交替图标路径
            }
        }
    }

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return mainMarketMenu(pl);
        }
        // 处理选择的店铺
        // 例如，您可以在这里记录被选择的店铺ID，然后执行相应的操作

        const storeUUIDs = Object.keys(obj);
        if (id < storeUUIDs.length) {
            const selectedStoreUUID = storeUUIDs[id];
            const selectedStore = obj[selectedStoreUUID];

            //logger.warn(selectedStoreUUID);
            //logger.warn(pl.uuid);

            // 增加访问量（访问的人是其他人才增加访问量）
            if (pl.uuid !== selectedStoreUUID) {
                selectedStore.visits++;
                market_data.write(JSON.stringify(obj, null, 4));
            }

            // 您可以在这里添加代码来显示所选店铺的详细信息
            showStoreDetails(pl, selectedStore, obj, `viewAllStores`);
        }
    });
}

/**
 * 查看所有店铺-按平均每笔交易额排序
 * @param {LLSE_Player} player 
 */
function viewAllStoresRanking(player) {
    const fm = mc.newSimpleForm();
    fm.setTitle("店铺排行榜");
    fm.setContent("以下店铺的顺序为根据其§e平均每笔交易额§f降序排列");

    let obj = JSON.parse(market_data.read());
    const icon_steve = `textures/ui/icon_steve`;
    const icon_alex = `textures/ui/icon_alex`;
    const iconPaths = [icon_steve, icon_alex];
    let iconIndex = 0;

    // 将对象转换为数组并计算平均每笔交易额，同时保留键名 (即 UUID)
    const storesArray = Object.entries(obj).filter(([uuid, store]) => store.isOpen).map(([uuid, store]) => {
        const revenue = Number(store.revenue);
        const tradeCount = Number(store.tradeCount);

        if (tradeCount === 0) {
            //logger.warn(`店铺 ${store.storeOwnerName} 的交易次数为 0，无法计算平均每笔交易额`);
            return { uuid, ...store, averageTransactionAmount: 0 }; // 返回 0 作为默认值并保留 UUID
        }

        const averageTransactionAmount = Number((revenue / tradeCount).toFixed(0));
        return { uuid, ...store, averageTransactionAmount };
    });

    // 按平均每笔交易额降序排序
    storesArray.sort((a, b) => b.averageTransactionAmount - a.averageTransactionAmount);

    // 遍历排序后的数组并添加按钮
    storesArray.forEach(store => {
        fm.addButton(`${store.storeOwnerName} 的小店 §r§f(§r§e平均每笔交易额: §c${store.averageTransactionAmount}§f)`, iconPaths[iconIndex]);
        iconIndex = (iconIndex + 1) % iconPaths.length; // 交替图标路径
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return mainMarketMenu(pl);
        }

        // 使用排序后的数组中的 UUID 来获取选中的商店
        if (id < storesArray.length) {
            const selectedStoreUUID = storesArray[id].uuid;

            // 确保 selectedStoreUUID 存在于 obj 中
            if (obj[selectedStoreUUID]) {
                const selectedStore = obj[selectedStoreUUID];

                if (pl.uuid !== selectedStoreUUID) {
                    selectedStore.visits = (selectedStore.visits || 0) + 1;
                    market_data.write(JSON.stringify(obj, null, 4));
                }

                showStoreDetails(pl, selectedStore, obj, `viewAllStoresRanking`);
            } else {
                // 处理找不到商店的情况
                logger.warn(`找不到 UUID 为 ${selectedStoreUUID} 的商店`);
                pl.tell("§c找不到该店铺的信息，请稍后再试。");
            }
        }
    });
}

/**
 * 浏览店铺详细信息
 * @param {LLSE_Player} player 
 * @param {object} store 
 * @param {object} obj 
 * @param {string} type 
 */
function showStoreDetails(player, store, obj, type) {
    let totalGoodsCount = 0;
    store.goods.forEach(item => {
        totalGoodsCount += item.itemCount;
    });

    const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

    const fm = mc.newSimpleForm();
    fm.setTitle(store.storeName);
    let list = [
        `店铺名称: ${store.storeName}§r§f [共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
        `店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
        `创建日期: ${store.createDate}`,
        `访问量：${store.visits}`,
        `交易次数: ${store.tradeCount}`,
        `营业额: ${store.revenue} 金币`,
        `平均每笔交易额: ${averageTransactionAmount}`
    ]
    fm.setContent(list.join("\n").trim());

    // 按照 item.itemTypeName 进行排序
    store.goods.sort((a, b) => {
        if (a.itemTypeName < b.itemTypeName) return -1;
        if (a.itemTypeName > b.itemTypeName) return 1;
        return 0;
    });

    store.goods.forEach(item => {
        const enBook = item.itemName === `附魔书` ? item.itemInfo.replace(`\n`, ``).replace(`附魔书`, ``) : item.itemName;
        fm.addButton(`${enBook} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            if (type === "viewAllStores") {
                return viewAllStores(pl);
            } else if (type === "viewAllStoresRanking") {
                return viewAllStoresRanking(pl);
            } else if (type === "searchAllProducts") {
                return searchAllProducts(pl);
            }
        }
        // 处理选择的商品
        if (id < store.goods.length) {
            const item = store.goods[id];

            const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

            const form = mc.newCustomForm();
            form.setTitle("购买商品");

            let arr = [
                `§6商品所在店铺名称: ${store.storeName}§r§f`,
                `§b[共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
                `§e店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
                `店铺创建日期: ${store.createDate}`,
                `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
                `平均每笔交易额: ${averageTransactionAmount}`,
                `§d===============================§f`,
                `§c【§a商品介绍：${item.itemName} | 库存：${item.itemCount} | 单价: ${item.itemUnitPrice}§c】`,
                `§6商品备注：§r§f${item.itemRemark}`,
                `§b上架时间：${item.itemUploadTime ?? `未记录上架时间`}`,
                `§a商品详情：`,
                `${getItemDisplayName(mc.newItem(NBT.parseSNBT(item.itemSNBT)), true)}`
            ];

            form.addLabel(arr.join("\n").trim());
            form.addInput(`请输入要购买的数量： §7| §e您的余额： ${Economy.get(pl.xuid)}`, `正整数`, `1`);

            pl.sendForm(form, (pl2, id2) => {
                if (id2 == null) {
                    return showStoreDetails(pl2, store, obj, type);
                }
                const num = Number(id2[1]);
                if (isNaN(num) || num <= 0) {
                    return pl2.tell(plugin_prefix + "§c请输入正整数!");
                }
                const needMoney = item.itemUnitPrice * num;
                if (Economy.get(pl2.xuid) < needMoney) {
                    return pl2.tell(plugin_prefix + `§c您的余额不足以购买 ${num} 个 ${item.itemName}!`);
                }
                if (pl2.realName === store.storeOwnerName) {
                    return pl2.tell(plugin_prefix + `§c禁止购买自己店铺内的商品!`);
                }
                if (num <= item.itemCount) {
                    // 此处添加给予物品的逻辑：先检查背包可用空间，然后给予指定数量的物品
                    if (addItemToPlayer(pl2, item.itemSNBT, num)) {
                        Economy.reduce(pl2.xuid, needMoney);
                        store.revenue += needMoney;
                        store.tradeCount++;
                        item.itemCount -= num;
                        item.itemSNBT = NBT.parseSNBT(item.itemSNBT).setByte("Count", item.itemCount).toSNBT();
                        if (item.itemCount === 0) {
                            const index = store.goods.indexOf(item);
                            if (index !== -1) {
                                store.goods.splice(index, 1);
                            }
                        }

                        market_data.write(JSON.stringify(obj, null, 4));

                        let transactionRecordObj = JSON.parse(transactionRecord.read());
                        transactionRecordObj.push(`§b[${system.getTimeStr()}] §d${pl2.realName} §f在 §a${store.storeOwnerName} §r§f的店铺 <${store.storeName}> §r§a花费 §6${needMoney} 金币 §r§a购买了 §c${num} §f个 §3${item.itemName}`);
                        transactionRecord.write(JSON.stringify(transactionRecordObj, null, 4));
                        transactionRecord.reload();

                        pl2.tell(plugin_prefix + `§a成功购买 ${num} 个 ${item.itemName}，消费了 ${needMoney} 金币。`);

                        if (data.name2xuid(store.storeOwnerName)) {
                            Economy.add(data.name2xuid(store.storeOwnerName), needMoney); // 给店主加钱
                        }

                        if (mc.getPlayer(store.storeOwnerName) != null) {
                            mc.getPlayer(store.storeOwnerName).tell(plugin_prefix + `§a您的小店刚刚出售了 ${num} 个 ${item.itemName} 净赚 ${needMoney} 金币，买家：${pl2.realName}!`);
                        }
                    } else {
                        return pl2.tell(plugin_prefix + `§c您的背包空间不足!`);
                    }
                } else {
                    return pl2.tell(plugin_prefix + `§c商品库存不足!`);
                }
            });
        }
    });
}

/**
 * 上架商品-单独上架单组物品
 * @param {LLSE_Player} player 
 */
function uploadProduct(player) {
    const invItems = getPlayerAllInventoryItems(player);

    if (invItems.length === 0) {
        return player.tell(plugin_prefix + "§c您的背包中没有任何物品!");
    }

    const fm = mc.newCustomForm();
    fm.setTitle("上架商品-单组物品");

    //fm.addLabel("请选择您要上架的商品：");

    const itemNames = invItems.map((it, index) => {
        const displayName = getItemDisplayName(it, false);
        return `${index + 1}. ${displayName} §ax ${it.count}`;
    });

    fm.addDropdown("§e§l请选择要上架的物品：", itemNames);
    fm.addInput("§e§l请输入出售价格（物品单价）：", "正整数");
    fm.addInput("§e§l请输入要上架的数量：", "正整数");
    fm.addInput("§e§l请输入物品备注信息（可选，最多50字符）：", "备注信息", "很好的商品");

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return send_manage_personal_store_menu(pl);
        }

        const selectedIndex = id[0];
        const price = parseInt(id[1]);
        const quantity = parseInt(id[2]);
        const remark = id[3]?.trim() || '';

        if (isNaN(price) || price <= 0) return pl.tell(plugin_prefix + '§c§l价格必须是正整数！');
        if (price > 999999999) return pl.tell(plugin_prefix + '§c§l价格必须小于999999999！');

        if (isNaN(quantity) || quantity <= 0) return pl.tell(plugin_prefix + '§c§l数量必须是正整数！');

        if (remark.length > 50) return pl.tell(plugin_prefix + '§c§l备注信息不能超过50个字符！');;

        const selectedKey = invItems[selectedIndex];
        const item = selectedKey;
        const count = item.count;

        if (quantity > count) return pl.tell(plugin_prefix + '§c§l您没有足够的物品！');

        const nbtString = item.clone().getNbt().setByte("Count", quantity).toSNBT();

        //logger.warn(item.type);
        //logger.warn(price);
        //logger.warn(quantity);
        //logger.warn(remark);
        //logger.warn(nbtString);

        // 将商品信息记录到数据文件
        let tempdata = market_data.get(pl.uuid);
        tempdata["goods"].push(
            {
                "itemName": I18nAPI.get(item.getTranslateKey(), [], "zh_CN"),
                "itemTypeName": item.type,
                "itemCount": quantity,
                "itemUnitPrice": price,
                "itemInfo": getItemDisplayName(item, true).replace(/§[a-zA-Z0-9]/g, ''),
                "itemRemark": remark,
                "itemSNBT": nbtString,
                "itemUploadTime": system.getTimeStr()
            }
        )
        market_data.set(pl.uuid, tempdata);
        market_data.reload();

        //logger.warn(getItemDisplayName(item, true).replace(/§[a-zA-Z0-9]/g, ''));
        //logger.warn(getItemDisplayName(item, false).replace(/§[a-zA-Z0-9]/g, ''));

        pl.tell(plugin_prefix + `上架成功：${getItemDisplayName(item, false).replace(/§[a-zA-Z0-9]/g, '')} 上架数量：${quantity} 个。`);
        mc.broadcast(plugin_prefix + `§a${pl.realName} 的店铺上架了新商品：${getItemDisplayName(item, false).replace(/§[a-zA-Z0-9]/g, '')} 数量：${quantity} 个，单价：${price}。`);

        const nbt = item.getNbt().setByte("Count", item.count - quantity);
        item.setNbt(nbt);
        if (item.count == 0) item.setNull();
        pl.refreshItems();

    })
}

/**
 * 上架商品-上架背包内全部物品
 * @param {LLSE_Player} player 
 */
function uploadProductFromPlayerInventory(player) {
    const invItems = getPlayerAllInventoryItems(player);

    if (invItems.length === 0) {
        return player.tell(plugin_prefix + "§c您的背包中没有任何物品!");
    }

    const fm = mc.newCustomForm();
    fm.setTitle("上架商品-背包内全部物品");

    //fm.addLabel("请选择您要上架的商品：");

    fm.addInput("§e§l请输入出售价格（物品单价）：", "正整数");
    fm.addInput("§e§l请输入物品备注信息（可选，最多50字符）：", "备注信息", "很好的商品");
    fm.addLabel(`§a背包内现有 §e${invItems.length} §a项可上架物品\n§d注意：此功能仅适合用于批量上架大量相同物品时使用，例如：背包内塞满圆石，输入的单价为背包内全部物品的单价`);

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return send_manage_personal_store_menu(pl);
        }

        const price = parseInt(id[0]);
        const remark = id[1]?.trim() || '';

        if (isNaN(price) || price <= 0) return pl.tell(plugin_prefix + '§c§l价格必须是正整数！');
        if (price > 999999999) return pl.tell(plugin_prefix + '§c§l价格必须小于999999999！');

        if (remark.length > 50) return pl.tell(plugin_prefix + '§c§l备注信息不能超过50个字符！');;

        let total = 0;
        let tempdata = market_data.get(pl.uuid);

        invItems.forEach(item => {
            total += item.count;
            const nbtString = item.clone().getNbt().toSNBT();

            // 将商品信息记录到数据文件

            tempdata["goods"].push(
                {
                    "itemName": I18nAPI.get(item.getTranslateKey(), [], "zh_CN"),
                    "itemTypeName": item.type,
                    "itemCount": item.count,
                    "itemUnitPrice": price,
                    "itemInfo": getItemDisplayName(item, true).replace(/§[a-zA-Z0-9]/g, ''),
                    "itemRemark": remark,
                    "itemSNBT": nbtString,
                    "itemUploadTime": system.getTimeStr()
                }
            )
        })

        market_data.set(pl.uuid, tempdata);
        market_data.reload();

        pl.tell(plugin_prefix + `上架成功：共计上架数量：${total} 个物品。`);
        mc.broadcast(plugin_prefix + `§a${pl.realName} 的店铺上架了新商品：一次性上架了 ${total} 个物品，单价：${price}。`);

        pl.getInventory().getAllItems().forEach(it => {
            if (!it.isNull() && !config.get("banItems").includes(it.type) && getItemLockMode(it) === 0 && getItemShouldKeepOnDeath(it) === false) {
                it.setNull();
            }
        });
        pl.refreshItems();
    })
}

/**
 * 下架商品
 * @param {LLSE_Player} player 
 * @param {object} store 
 * @param {object} obj 
 */
function removeRroducts(player, store, obj) {
    let totalGoodsCount = 0;
    store.goods.forEach(item => {
        totalGoodsCount += item.itemCount;
    });

    const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

    const fm = mc.newSimpleForm();
    fm.setTitle(store.storeName);
    let list = [
        `店铺名称: ${store.storeName}§r§f [共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
        `店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
        `创建日期: ${store.createDate}`,
        `访问量：${store.visits}`,
        `交易次数: ${store.tradeCount}`,
        `营业额: ${store.revenue} 金币`,
        `平均每笔交易额: ${averageTransactionAmount}`,
        `§c请选择要下架的商品：§f`
    ]
    fm.setContent(list.join("\n").trim());

    store.goods.forEach(item => {
        fm.addButton(`${item.itemName} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return send_manage_personal_store_menu(pl);
        }
        // 处理选择的商品
        if (id < store.goods.length) {
            const item = store.goods[id];

            const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

            const form = mc.newCustomForm();
            form.setTitle("下架商品");

            let arr = [
                `§6商品所在店铺名称: ${store.storeName}§r§f`,
                `§b[共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
                `§e店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
                `店铺创建日期: ${store.createDate}`,
                `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
                `平均每笔交易额: ${averageTransactionAmount}`,
                `§d===============================§f`,
                `§c【§a商品介绍：${item.itemName} | 库存：${item.itemCount} | 单价: ${item.itemUnitPrice}§c】`,
                `§6商品备注：§r§f${item.itemRemark}`,
                `§b上架时间：${item.itemUploadTime ?? `未记录上架时间`}`,
                `§a商品详情：`,
                `${getItemDisplayName(mc.newItem(NBT.parseSNBT(item.itemSNBT)), true)}`
            ];

            form.addLabel(arr.join("\n").trim());
            form.addInput("请输入要下架的数量", "正整数", "1");

            pl.sendForm(form, (pl2, id2) => {
                if (id2 == null) {
                    return removeRroducts(pl2, store, obj);
                }
                const num = Number(id2[1]);
                if (isNaN(num) || num <= 0) {
                    return pl2.tell(plugin_prefix + "§c请输入正整数!");
                }

                if (num <= item.itemCount) {
                    // 此处添加给予物品的逻辑：先检查背包可用空间，然后给予指定数量的物品
                    if (addItemToPlayer(pl2, item.itemSNBT, num)) {

                        item.itemCount -= num;
                        item.itemSNBT = NBT.parseSNBT(item.itemSNBT).setByte("Count", item.itemCount).toSNBT();
                        if (item.itemCount === 0) {
                            const index = store.goods.indexOf(item);
                            if (index !== -1) {
                                store.goods.splice(index, 1);
                            }
                        }

                        // 更新数据文件
                        obj[pl2.uuid] = store;
                        market_data.write(JSON.stringify(obj, null, 4));
                        pl2.tell(plugin_prefix + `§a成功下架了 ${num} 个 ${item.itemName}`);
                    } else {
                        return pl2.tell(plugin_prefix + `§c您的背包空间不足!`);
                    }
                } else {
                    return pl2.tell(plugin_prefix + `§c商品库存不足!`);
                }
            });
        }
    });
}

/**
 * 编辑商品信息（单价）
 * @param {LLSE_Player} player 
 * @param {object} store 
 * @param {object} obj 
 */
function editProductInfo(player, store, obj) {
    let totalGoodsCount = 0;
    store.goods.forEach(item => {
        totalGoodsCount += item.itemCount;
    });

    const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

    const fm = mc.newSimpleForm();
    fm.setTitle(store.storeName);
    let list = [
        `店铺名称: ${store.storeName}§r§f [共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
        `店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
        `创建日期: ${store.createDate}`,
        `访问量：${store.visits}`,
        `交易次数: ${store.tradeCount}`,
        `营业额: ${store.revenue} 金币`,
        `平均每笔交易额: ${averageTransactionAmount}`,
        `§c请选择要编辑的商品：§f`
    ]
    fm.setContent(list.join("\n").trim());

    store.goods.forEach(item => {
        fm.addButton(`${item.itemName} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return send_manage_personal_store_menu(pl);
        }
        // 处理选择的商品
        if (id < store.goods.length) {
            const item = store.goods[id];

            const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

            const form = mc.newCustomForm();
            form.setTitle("编辑商品");

            let arr = [
                `§6商品所在店铺名称: ${store.storeName}§r§f`,
                `§b[共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
                `§e店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
                `店铺创建日期: ${store.createDate}`,
                `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
                `平均每笔交易额: ${averageTransactionAmount}`,
                `§d===============================§f`,
                `§c【§a商品介绍：${item.itemName} | 库存：${item.itemCount} | 单价: ${item.itemUnitPrice}§c】`,
                `§6商品备注：§r§f${item.itemRemark}`,
                `§b上架时间：${item.itemUploadTime ?? `未记录上架时间`}`,
                `§a商品详情：`,
                `${getItemDisplayName(mc.newItem(NBT.parseSNBT(item.itemSNBT)), true)}`
            ];

            form.addLabel(arr.join("\n").trim());
            form.addInput("请输入修改后的商品单价", "正整数", "1");
            form.addInput("请输入修改后的商品备注", "字符串", "买不了吃亏买不了上当!");

            pl.sendForm(form, (pl2, id2) => {
                if (id2 == null) return editProductInfo(pl2, store, obj);

                const num = Number(id2[1]);
                if (isNaN(num) || num <= 0) return pl2.tell(plugin_prefix + "§c请输入正整数!");
                if (num > 999999999) return pl2.tell(plugin_prefix + "§c单价不能超过999999999!");
                if (id2[2].length <= 0) return pl2.tell(plugin_prefix + "§c请输入修改后的商品备注!");

                item.itemRemark = id2[2];
                item.itemUnitPrice = num;

                // 更新数据文件
                obj[pl2.uuid] = store;
                market_data.write(JSON.stringify(obj, null, 4));
                pl2.tell(plugin_prefix + `§a${item.itemCount} 个 ${item.itemName} 的单价现已调整为 ${num}/个`);
            });
        }
    });
}

/**
 * 编辑店铺信息（宣传语）
 * @param {LLSE_Player} player 
 * @param {object} store 
 * @param {object} obj 
 */
function editStoreInfo(player, store, obj) {
    let totalGoodsCount = 0;
    store.goods.forEach(item => {
        totalGoodsCount += item.itemCount;
    });

    const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

    const form = mc.newCustomForm();
    form.setTitle("编辑商品");

    let arr = [
        `§6店铺名称: ${store.storeName}§r§f`,
        `§b[共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
        `§e店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
        `店铺创建日期: ${store.createDate}`,
        `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
        `平均每笔交易额: ${averageTransactionAmount}`,
        `§d===============================§f`,
    ];

    form.addLabel(arr.join("\n").trim());
    form.addInput("请输入修改后的店铺名称", "字符串", `${player.realName} 的小店`);
    form.addInput("请输入修改后的店铺宣传语", "字符串", "欢迎光临我的小店~");

    player.sendForm(form, (pl, id) => {
        if (id == null) {
            return send_manage_personal_store_menu(pl);
        }
        const str = id[1];
        const str2 = id[2];
        if (str.length <= 0) {
            return pl.tell(plugin_prefix + "§c请输入修改后的店铺名称!"); // editStoreInfo(pl, store, obj)
        }

        if (str2.length <= 0) {
            return pl.tell(plugin_prefix + "§c请输入修改后的店铺宣传语!"); // editStoreInfo(pl, store, obj)
        }

        store.storeName = str;
        store.storeInfo = str2;

        // 更新数据文件
        obj[pl.uuid] = store;
        market_data.write(JSON.stringify(obj, null, 4));
        pl.tell(plugin_prefix + `§a您的店铺名称和宣传语已更新!`);
    });
}

/**
 * 获取玩家物品栏中所有物品及其堆叠数量的对象
 * 
 * @param {LLSE_Player} player - 玩家对象
 * @returns 
 */
function getPlayerAllInventoryItems(player) {
    return player.getInventory().getAllItems().filter(
        it => !it.isNull() && !config.get("banItems").includes(it.type) && getItemLockMode(it) === 0 && getItemShouldKeepOnDeath(it) === false
    );
}

/**
 * @description 传入物品对象，返回一个数组，这个数组一共包含4个元素，分别是：物品的附魔属性的数量、物品的所有附魔属性名称数组、物品耐久、物品原名称
 * @param {LLSE_Item} item 
 * @returns {Array} 物品信息
 * @returns {number} [0] 物品的附魔属性的数量
 * @returns {Array.<string>} [1] 物品的所有附魔属性名称数组
 * @returns {string} [2] 物品耐久
 * @returns {string} [3] 物品原名称
 */
function getEnchantmentsInfoFromItem(item) {
    let enchantmentsLength = 0;
    let enchantmentsString = [];
    let durable = "";
    let itemName = "";
    if (!item.isNull()) {
        itemName = I18nAPI.get(item.getTranslateKey(), [], "zh_CN"); // item.getTranslateName("zh_CN") | I18nAPI.get(item.getTranslateKey(), [], "zh_CN");
        let nbt = item.getNbt();
        let tag = nbt.getKeys().includes("tag") ? nbt.getTag("tag") : null;
        let enchList = tag ? tag.getTag("ench") : null;
        if (nbt && tag && enchList && tag.getType("ench") == NBT.Compound) {
            for (const ench of JSON.parse(enchList)) {
                enchantmentsLength += 1;
                let nameSpaceId = getEnchantTypeNameFromId(ench.id); // 根据附魔ID获取附魔命名空间ID
                let itemEnc = getEnchantNameAndLevel(nameSpaceId, ench.lvl); // 根据附魔命名空间ID和附魔等级获取附魔名称和等级
                enchantmentsString.push(`${itemEnc}§f`);
            }
        }
        durable = (item.isDamageableItem && item.isDamaged) ? `-§3(耐久:${item.maxDamage - item.damage}/${item.maxDamage})§f` :
            (item.isDamageableItem && !item.isDamaged) ? `-§6(满耐久)§f` : `§f`;
        //logger.warn(`传入的参数正常 : item : ${item} | ${item.type} | ${typeof item}`);
    } else {
        logger.error(`传入的参数有错误 : item : ${item} | ${item.type} | ${typeof item}`);
        return null;
    }
    return [enchantmentsLength, enchantmentsString, durable, itemName];
}
/**
 * @param {LLSE_Item} item 潜影盒物品对象
 * @returns {Array} 该潜影盒物品对象所拥有的物品组数量及每个物品的NBT中tag内的Items数据[数组]
 */
function getShulkerBoxItemCount(item) {
    if (item.isNull() || !item.type.endsWith("_shulker_box")) {
        return `该物品对象为空或不为潜影盒!`; // [0, []];
    }
    const tag = item.getNbt().getData("tag");
    if (!tag) {
        return [0, []];
    }
    const items = JSON.parse(tag).Items;
    if (!items) {
        return [0, []];
    }
    const itemCount = items.length;
    return [itemCount, /*itemCounts*/items];
}
/**
 * 
 * @param {LLSE_Item} item 物品对象
 * @param {boolean} displayItemDetails 是否显示详细物品信息（如附魔名称、潜影盒内物品信息）
 * @returns {string} 物品信息（包含附魔数量或附魔名称、耐久）
 */
function getItemDisplayName(item, displayItemDetails) {
    const itemInfo = getEnchantmentsInfoFromItem(item);
    if (Array.isArray(itemInfo) && itemInfo.length === 4) {
        const enchLength = itemInfo[0];  // 附魔数量
        const enchStringArr = itemInfo[1]; // 附魔名称
        const tempStr = displayItemDetails ? "\n" : "";
        let enchString = tempStr;
        for (const enc of enchStringArr) {
            enchString += `${enc}${tempStr}`;
        }
        const durable = itemInfo[2];    // 耐久信息
        const itemName = itemInfo[3];   // 物品名称
        if (item.isPotionItem) { // 药水
            return `${itemName}§f-${getItemEffecName(item).trim()}`;
        } else if (item.type.endsWith("_shulker_box")) { // 潜影盒
            let shulkerBoxItemCount = getShulkerBoxItemCount(item)[0];
            let shulkerBoxItems = getShulkerBoxItemCount(item)[1];
            let shulkerBoxInfoDetails = `\n`;
            for (const it of shulkerBoxItems) {
                let tempItem = mc.newItem(NBT.parseSNBT(JSON.stringify(it)));
                shulkerBoxInfoDetails += `-${getItemDisplayName(tempItem, displayItemDetails)} * ${it.Count}\n`;
            }
            let shulkerBoxInfo = (displayItemDetails && shulkerBoxItemCount > 0)
                ? shulkerBoxInfoDetails.trimEnd() : shulkerBoxItemCount <= 0
                    ? `空盒` : `${shulkerBoxItemCount} 项物品`;
            return `${itemName}§f- (${shulkerBoxInfo})`;
        } else if (item.type === "minecraft:ominous_bottle") { // 不详之瓶
            const auxObj = {
                0: "§7凶兆 I (100:00)§f",
                1: "§7凶兆 II (100:00)§f",
                2: "§7凶兆 III (100:00)§f",
                3: "§7凶兆 IV (100:00)§f",
                4: "§7凶兆 V (100:00)§f"
            }
            return `${itemName} §f${auxObj[item.aux]}`;
        } else {
            const ench = (displayItemDetails && enchLength > 0) ? `${enchString.trimEnd()}` : enchLength === 0 ? `§f` : `-§f(§c${enchLength}个§d附魔§f)${enchString.trimEnd()}§f`;
            const lore = (item.type.includes(`ed:ball`) && item.lore.length > 0 && displayItemDetails)
                ? ` ` + item.lore.join("\n").trim()
                : (item.type.includes(`ed:ball`) && item.lore.length > 0 && !displayItemDetails)
                    ? ` ` + item.name.trim()
                    : ``;
            return `${itemName}§f${durable}§f${ench}${lore}`;
        }
    } else {
        logger.error(`getItemDisplayName(item, displayItemDetails) : 请检查传入的参数 item 是否为 null !`);
        return `该物品信息获取失败!`;
    }
}

/**
 * 
 * @param {LLSE_Player} player 
 */
function send_create_personal_store_menu(player) {
    const fm = mc.newCustomForm();
    fm.setTitle("创建个人店铺");

    fm.addLabel(`创建店铺需要启动资金 ${StoreCreationCost} 金币`);
    fm.addInput("请输入店铺名称：", "给店铺起个名字", `${player.realName} 的小店`);
    fm.addInput("请输入店铺介绍：", "给店铺起个宣传语", `欢迎光临~`);

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return mainMarketMenu(pl);
        }

        if (id[1].length <= 0) {
            return pl.tell(plugin_prefix + "§c请输入店铺名称!");
        }
        let storeInfo = !id[2] || id[2].length <= 0 ? "" : id[2].trim();
        //logger.warn(Economy.get(player.xuid));
        //logger.warn(StoreCreationCost);

        if (Economy.get(player.xuid) < StoreCreationCost) {
            return pl.tell(plugin_prefix + `§c您的余额不足 ${StoreCreationCost} 金币，无法创建店铺!`);
        }

        Economy.reduce(player.xuid, StoreCreationCost);
        market_data.init(pl.uuid,
            {
                "storeOwnerName": pl.realName,
                "storeName": id[1],
                "storeInfo": storeInfo,
                "isOpen": true,
                "createDate": system.getTimeStr(),
                "visits": 0,
                "tradeCount": 0,
                "revenue": 0,
                "goods": []
            }
        );
        mc.broadcast(plugin_prefix + `§d${pl.realName} §a创建了店铺：${id[1]}§a，快输入/mk进入Ta的小店看看吧~`);
        sendGroupMsg(`${pl.realName} 创建了店铺：${id[1]}，快输入/mk进入Ta的小店看看吧~`);
    })
}

/**
 * 
 * @param {LLSE_Player} player 
 */
function send_manage_personal_store_menu(player) {
    const fm = mc.newSimpleForm();
    fm.setTitle("管理个人店铺");
    fm.setContent(`在售共计 ${market_data.get(player.uuid)["goods"].length} 件商品`);

    fm.addButton("上架新商品-单组物品", "textures/ui/jump_boost_effect");
    fm.addButton("上架新商品-背包内全部物品", "textures/ui/jump_boost_effect");
    fm.addButton("下架现有商品", "textures/ui/world_download");
    fm.addButton("编辑现有商品", "textures/ui/video_glyph_color_2x");
    fm.addButton("一键开店", "textures/ui/mute_off");
    fm.addButton("一键关店", "textures/ui/mute_on");
    fm.addButton("编辑店铺信息", "textures/ui/multiselection");
    fm.addButton("卷铺跑路", "textures/ui/speed_effect");
    fm.addButton("返回上一页", "textures/ui/icon_import");

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            return;
        }
        switch (id) {
            case 0: // 上架新商品-单组物品
                uploadProduct(pl);
                break;
            case 1: // 上架新商品-玩家背包内全部物品
                uploadProductFromPlayerInventory(pl);
                break;
            case 2: // 下架现有商品
                removeRroducts(pl, market_data.get(pl.uuid), JSON.parse(market_data.read()));
                break;
            case 3:
                editProductInfo(pl, market_data.get(pl.uuid), JSON.parse(market_data.read()));
                break;
            case 4:
                let tempData = market_data.get(pl.uuid);
                if (!tempData["isOpen"]) {
                    tempData["isOpen"] = true;
                    pl.tell(plugin_prefix + "§b您的店铺已恢复营业!");
                    mc.broadcast(plugin_prefix + `§a${pl.realName} §a的店铺已恢复营业!`);
                } else {
                    pl.tell(plugin_prefix + "§c您的店铺目前已经是营业状态!");
                }
                market_data.set(pl.uuid, tempData);
                market_data.reload();
                break;
            case 5:
                let tempData2 = market_data.get(pl.uuid);
                if (tempData2["isOpen"]) {
                    tempData2["isOpen"] = false;
                    pl.tell(plugin_prefix + "§b您的店铺已打烊!");
                    mc.broadcast(plugin_prefix + `§a${pl.realName} §a的店铺已打烊!`);
                } else {
                    pl.tell(plugin_prefix + "§c您的店铺目前已经是打烊状态!");
                }
                market_data.set(pl.uuid, tempData2);
                market_data.reload();
                break;
            case 6:
                editStoreInfo(pl, market_data.get(pl.uuid), JSON.parse(market_data.read()));
                break;
            case 7:
                pl.tell(plugin_prefix + "卷铺跑路 功能正在制作中...");
                break;
            case 8:
                mainMarketMenu(pl);
                break;
        }
    })
}

/**
 * @description 计算玩家背包中还可以放入多少指定数量的物品
 * @param {LLSE_Player} player 玩家对象
 * @param {string} SNBT 物品的SNBT
 * @param {Number} checkNum 要添加的物品数量
 * @returns 指定物品数量的可用空间（数字）若空间不足则返回false
 */
function checkAvailableSpace(player, SNBT, checkNum) {
    // 计算背包中可用的空间
    let items = player.getInventory().getAllItems();
    let emptySlots = 0;
    let availableSpace = 0;

    let item = mc.newItem(NBT.parseSNBT(SNBT));
    let itemName = item.type;

    // 默认最大堆叠数量为64
    let maxStack = 64;

    for (let i = 0; i < items.length; i++) {
        if (items[i].isNull()) {
            emptySlots++;
        } else if (items[i].type == itemName) {
            // 获取当前物品的最大堆叠数量
            maxStack = getItemMaxCount(items[i]);
            if (items[i].count < maxStack) {
                availableSpace += (maxStack - items[i].count);
            }
        }
    }

    // 计算空格子能放多少物品
    availableSpace += emptySlots * maxStack;

    // 如果可用空间不足，返回 false
    if (availableSpace < checkNum) {
        return false;
    }
    return availableSpace;
}

/**
 * @description 给与玩家背包指定数量的物品，如果玩家背包有空格子则放入空格子，如果背包已有同类物品且未堆叠满，则优先堆叠；每个格子最多堆叠物品最大堆叠数量
 * @param {LLSE_Player} player 玩家对象
 * @param {string} SNBT 物品的SNBT
 * @param {number} addCount 给予的物品数量
 * @returns {Boolean} 添加是否成功
 */
function addItemToPlayer(player, SNBT, addCount) {
    // 获取玩家物品栏容器对象
    let inventory = player.getInventory();
    // 生成指定的物品对象
    let item = mc.newItem(NBT.parseSNBT(SNBT));
    let remainingCount = addCount;

    if (checkAvailableSpace(player, SNBT, addCount) === false) {
        return false;
    }

    // 尝试将新增的物品数量堆叠到现有的同类物品中
    while (remainingCount > 0) {
        if (inventory.addItem(item, remainingCount)) {
            remainingCount -= addCount;
        } else {
            let maxStack = getItemMaxCount(item); // 获取指定物品对象的最大堆叠数量
            let addAmount = Math.min(remainingCount, maxStack - item.count); // 计算此次能添加的数量
            if (inventory.addItem(item, addAmount)) {
                remainingCount -= addAmount;
            } else {
                // 如果 add 方法失败，可能是因为 tmpItem 的 count 已经是 maxStack，所以这里尝试将剩余的物品数量放入第一个空格子
                if (inventory.addItemToFirstEmptySlot(item)) {
                    remainingCount -= addAmount;
                } else {
                    return false; // 如果没有空格子，并且堆叠也失败了，返回 false
                }
            }
        }
    }

    // 检查是否所有要添加的物品都已经被处理
    if (remainingCount > 0) {
        return false; // 还有剩余的物品无法添加，返回 false
    }

    // 刷新玩家物品栏显示
    player.refreshItems();

    return true;
}