// LiteLoader-AIDS automatic generated
/// <reference path="d:\LLSE-API/dts/helperlib/src/index.d.ts"/> 


const moneyManager = require("./lib/moneyManager");
const { I18nAPI } = require('./GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS');

let getEnchantTypeNameFromId = ll.imports("GMLIB_API", "getEnchantTypeNameFromId");
let getEnchantNameAndLevel = ll.imports("GMLIB_API", "getEnchantNameAndLevel");
let getItemEffecName = ll.imports("GMLIB_API", "getItemEffecName");
let getItemMaxCount = ll.imports("GMLIB_API", "getItemMaxCount");
let getItemLockMode = ll.imports("GMLIB_API", "getItemLockMode");
let getItemShouldKeepOnDeath = ll.imports("GMLIB_API", "getItemShouldKeepOnDeath");

function sendGroupMsg(msg) {
    ll.imports("SparkAPIEx", "sendGroupMsg")(ll.imports("SparkAPIEx", "getMainGroup")(), msg)
}

const plugin_prefix = `§6[Market] §r`;

// ======================= 日志系统 =======================
const PLUGIN_NAME = "B-Market";
const LOG_DIR = `./plugins/${PLUGIN_NAME}/logs/`;

function getTodayLogPath(type) {
    return `${LOG_DIR}${PLUGIN_NAME}-${type}-${system.getTimeStr().substr(0, 10)}.csv`;
}

function writeLog(type, ...args) {
    const logPath = getTodayLogPath(type);
    const headerMap = {
        "createStore": "\ufeff时间,玩家,店铺名,消耗金币\n",
        "upload": "\ufeff时间,玩家,商品名,数量,单价\n",
        "remove": "\ufeff时间,玩家,商品名,数量\n",
        "replenish": "\ufeff时间,玩家,商品名,补货数量\n",
        "buy": "\ufeff时间,买家,卖家,商品名,数量,单价,总价\n"
    };
    const fileExists = File.readFrom(logPath);
    if (!fileExists) {
        logger.warn(`已创建今日${type}日志：${logPath}`);
        File.writeTo(logPath, headerMap[type]);
    }
    const timeStr = system.getTimeStr();
    const line = timeStr + "," + args.join(",") + "\n";
    File.writeLine(logPath, line);
}
// ======================================================

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

function getTexture(name) {
    let path = getTextureData(name);
    if (path == 'null') return default_icon_path;
    if (!path) {
        if (name.includes(':')) {
            textureData.set(name, 'null');
        }
        return default_icon_path;
    }
    return path;
}

const default_icon_path = default_icon_config.get("default")

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

let market_data = new JsonConfigFile(`./plugins/B-Market/data/market.json`, JSON.stringify({}, null, 4))
let transactionRecord = new JsonConfigFile(`./plugins/B-Market/data/transactionRecord.json`, JSON.stringify([], null, 4))

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

// ======================= 原有辅助函数（保持不变） =======================
function getPlayerAllInventoryItems(player) {
    return player.getInventory().getAllItems().filter(
        it => !it.isNull() && !config.get("banItems").includes(it.type) && getItemLockMode(it) === 0 && getItemShouldKeepOnDeath(it) === false
    );
}

function getEnchantmentsInfoFromItem(item) {
    let enchantmentsLength = 0;
    let enchantmentsString = [];
    let durable = "";
    let itemName = "";
    if (!item.isNull()) {
        itemName = I18nAPI.get(item.getTranslateKey(), [], "zh_CN");
        let nbt = item.getNbt();
        let tag = nbt.getKeys().includes("tag") ? nbt.getTag("tag") : null;
        let enchList = tag ? tag.getTag("ench") : null;
        if (nbt && tag && enchList && tag.getType("ench") == NBT.Compound) {
            for (const ench of JSON.parse(enchList)) {
                enchantmentsLength += 1;
                let nameSpaceId = getEnchantTypeNameFromId(ench.id);
                let itemEnc = getEnchantNameAndLevel(nameSpaceId, ench.lvl);
                enchantmentsString.push(`${itemEnc}§f`);
            }
        }
        durable = (item.isDamageableItem && item.isDamaged) ? `-§3(耐久:${item.maxDamage - item.damage}/${item.maxDamage})§f` :
            (item.isDamageableItem && !item.isDamaged) ? `-§6(满耐久)§f` : `§f`;
    } else {
        logger.error(`getEnchantmentsInfoFromItem: item 为空`);
        return null;
    }
    return [enchantmentsLength, enchantmentsString, durable, itemName];
}

function getShulkerBoxItemCount(item) {
    if (item.isNull() || !item.type.endsWith("_shulker_box")) {
        return [0, []];
    }
    const tag = item.getNbt().getData("tag");
    if (!tag) return [0, []];
    const items = JSON.parse(tag).Items;
    if (!items) return [0, []];
    return [items.length, items];
}

function getItemDisplayName(item, displayItemDetails) {
    const itemInfo = getEnchantmentsInfoFromItem(item);
    if (Array.isArray(itemInfo) && itemInfo.length === 4) {
        const enchLength = itemInfo[0];
        const enchStringArr = itemInfo[1];
        const tempStr = displayItemDetails ? "\n" : "";
        let enchString = tempStr;
        for (const enc of enchStringArr) {
            enchString += `${enc}${tempStr}`;
        }
        const durable = itemInfo[2];
        const itemName = itemInfo[3];
        if (item.isPotionItem) {
            return `${itemName}§f-${getItemEffecName(item).trim()}`;
        } else if (item.type.endsWith("_shulker_box")) {
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
        } else if (item.type === "minecraft:ominous_bottle") {
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
        logger.error(`getItemDisplayName: 参数错误`);
        return `获取失败`;
    }
}

function checkAvailableSpace(player, SNBT, checkNum) {
    let items = player.getInventory().getAllItems();
    let emptySlots = 0;
    let availableSpace = 0;
    let item = mc.newItem(NBT.parseSNBT(SNBT));
    let itemName = item.type;
    let maxStack = 64;
    for (let i = 0; i < items.length; i++) {
        if (items[i].isNull()) {
            emptySlots++;
        } else if (items[i].type == itemName) {
            maxStack = getItemMaxCount(items[i]);
            if (items[i].count < maxStack) {
                availableSpace += (maxStack - items[i].count);
            }
        }
    }
    availableSpace += emptySlots * maxStack;
    if (availableSpace < checkNum) return false;
    return availableSpace;
}

function addItemToPlayer(player, SNBT, addCount) {
    let inventory = player.getInventory();
    let item = mc.newItem(NBT.parseSNBT(SNBT));
    let remainingCount = addCount;
    if (checkAvailableSpace(player, SNBT, addCount) === false) return false;
    while (remainingCount > 0) {
        let maxStack = getItemMaxCount(item);
        let addAmount = Math.min(remainingCount, maxStack);
        if (inventory.addItem(item, addAmount)) {
            remainingCount -= addAmount;
        } else {
            if (inventory.addItemToFirstEmptySlot(item)) {
                remainingCount -= addAmount;
            } else {
                return false;
            }
        }
    }
    player.refreshItems();
    return true;
}

// ======================= 新增：合并工具 =======================
function groupAndMergeGoods(goodsArray) {
    const map = new Map();
    for (const entry of goodsArray) {
        const item = entry.item;
        if (!item || !item.itemTypeName) continue;
        const store = entry.store;
        const storeUUID = entry.storeUUID;
        const key = item.itemTypeName.trim();
        if (!map.has(key)) {
            map.set(key, {
                itemTypeName: key,
                totalCount: 0,
                minPrice: Infinity,
                maxPrice: -Infinity,
                sumPrice: 0,
                sources: [],
                isStackable: item.isStackable
            });
        }
        const group = map.get(key);
        group.totalCount += item.itemCount;
        group.minPrice = Math.min(group.minPrice, item.itemUnitPrice);
        group.maxPrice = Math.max(group.maxPrice, item.itemUnitPrice);
        group.sumPrice += item.itemUnitPrice * item.itemCount;
        group.sources.push({ store, storeUUID, item });
    }
    const result = [];
    for (const [key, group] of map) {
        group.avgPrice = Math.round(group.sumPrice / group.totalCount);
        result.push(group);
    }
    result.sort((a, b) => a.itemTypeName.localeCompare(b.itemTypeName));
    return result;
}
// 获取标准化 NBT 字符串（忽略 Count）
function getNormalizedSNBT(snbt) {
    try {
        let nbt = NBT.parseSNBT(snbt);
        nbt.setByte("Count", 1);
        return nbt.toSNBT();
    } catch (e) {
        return snbt; // 解析失败则原样返回
    }
}
// 批量购买专用：按 itemTypeName + 价格 + NBT（忽略Count）合并
function groupAndMergeGoodsForBatch(goodsArray) {
    const map = new Map();
    for (const entry of goodsArray) {
        const item = entry.item;
        if (!item || !item.itemTypeName) continue;
        const store = entry.store;
        const storeUUID = entry.storeUUID;

        // 生成唯一键：类型 + 价格 + 标准化NBT
        const normalizedNBT = getNormalizedSNBT(item.itemSNBT);
        const key = item.itemTypeName.trim() + "|" + item.itemUnitPrice + "|" + normalizedNBT;

        if (!map.has(key)) {
            map.set(key, {
                itemTypeName: item.itemTypeName,
                unitPrice: item.itemUnitPrice,
                totalCount: 0,
                sources: [],
                normalizedNBT: normalizedNBT,
                displayName: item.itemName || item.itemTypeName
            });
        }
        const group = map.get(key);
        group.totalCount += item.itemCount;
        group.sources.push({ store, storeUUID, item });
    }
    const result = [];
    for (const [key, group] of map) {
        result.push(group);
    }
    // 按类型名排序
    result.sort((a, b) => a.itemTypeName.localeCompare(b.itemTypeName));
    return result;
}

function showProductSources(player, mergedItem, backFunction) {
    // 获取中文名称
    let displayName = mergedItem.itemTypeName;
    if (mergedItem.sources.length > 0 && mergedItem.sources[0].item && mergedItem.sources[0].item.itemName) {
        displayName = mergedItem.sources[0].item.itemName;
    }
    const fm = mc.newCustomForm();
    fm.setTitle(`批量购买 ${displayName}`);
    // 统计不同店铺数量
    const storeSet = new Set();
    mergedItem.sources.forEach(src => storeSet.add(src.store.storeName));
    fm.addLabel(`共有 ${mergedItem.sources.length} 个商品来源（来自 ${storeSet.size} 个店铺），请输入每个要购买的数量（0表示不购买）：`);
    mergedItem.sources.forEach((src, index) => {
        const store = src.store;
        const item = src.item;
        const label = `${item.itemName} §6(${store.storeName})§f 单价: §e${item.itemUnitPrice}§f 库存: §c${item.itemCount}${item.itemInfo ? "\n" + item.itemInfo : ""}`;
        fm.addInput(label, "数量", "0");
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) return backFunction(pl);
        // 解析各店铺购买数量
        const purchases = [];
        let totalCost = 0;
        let hasError = false;
        for (let i = 1; i < id.length; i++) { // id[0] 是 label
            const qty = parseInt(id[i]);
            if (!isNaN(qty) && qty > 0) {
                const src = mergedItem.sources[i - 1];
                const item = src.item;
                const store = src.store;
                // 检查是否为自己的店铺
                if (pl.realName === store.storeOwnerName) {
                    pl.tell(plugin_prefix + `§c不能购买自己店铺的商品（${store.storeName}）。`);
                    hasError = true;
                    break;
                }
                if (qty > item.itemCount) {
                    pl.tell(plugin_prefix + `§c店铺 ${store.storeName} 的 ${item.itemName} 库存不足（需要 ${qty}，现有 ${item.itemCount}）。`);
                    hasError = true;
                    break;
                }
                purchases.push({ source: src, qty: qty });
                totalCost += qty * item.itemUnitPrice;
            }
        }
        if (hasError) return;
        if (purchases.length === 0) return pl.tell(plugin_prefix + "§c请至少选择一个商品购买。");
        if (Economy.get(pl.xuid) < totalCost) return pl.tell(plugin_prefix + `§c余额不足，共需 ${totalCost} 金币。`);

        // 读取当前数据（确保是最新）
        let obj = JSON.parse(market_data.read());
        let buySuccess = true;
        const involvedStores = new Set();
        for (const p of purchases) {
            const src = p.source;
            const qty = p.qty;
            // 从 obj 中根据 storeUUID 找到正确的店铺
            const storeUUID = src.storeUUID;
            const storeObj = obj[storeUUID];
            if (!storeObj) {
                pl.tell(plugin_prefix + `§c找不到店铺 ${src.store.storeName}，数据可能已变更。`);
                buySuccess = false;
                break;
            }
            // 在店铺商品中查找匹配的商品（通过标准化NBT和价格）
            const targetItem = src.item;
            const normalizedTarget = getNormalizedSNBT(targetItem.itemSNBT);
            let foundItem = null;
            let foundIndex = -1;
            for (let idx = 0; idx < storeObj.goods.length; idx++) {
                const g = storeObj.goods[idx];
                if (g.itemTypeName === targetItem.itemTypeName &&
                    g.itemUnitPrice === targetItem.itemUnitPrice &&
                    getNormalizedSNBT(g.itemSNBT) === normalizedTarget) {
                    foundItem = g;
                    foundIndex = idx;
                    break;
                }
            }
            if (!foundItem) {
                pl.tell(plugin_prefix + `§c在店铺 ${src.store.storeName} 中找不到匹配的商品，可能已被移除。`);
                buySuccess = false;
                break;
            }
            if (qty > foundItem.itemCount) {
                pl.tell(plugin_prefix + `§c店铺 ${src.store.storeName} 的 ${foundItem.itemName} 库存不足（需要 ${qty}，现有 ${foundItem.itemCount}）。`);
                buySuccess = false;
                break;
            }
            const price = foundItem.itemUnitPrice;
            if (addItemToPlayer(pl, foundItem.itemSNBT, qty)) {
                Economy.reduce(pl.xuid, price * qty);
                storeObj.revenue += price * qty;
                storeObj.tradeCount++;
                foundItem.itemCount -= qty;
                const nbt = NBT.parseSNBT(foundItem.itemSNBT);
                nbt.setByte("Count", foundItem.itemCount);
                foundItem.itemSNBT = nbt.toSNBT();
                if (foundItem.itemCount === 0) {
                    storeObj.goods.splice(foundIndex, 1);
                }
                writeLog("buy", pl.realName, storeObj.storeOwnerName, foundItem.itemName, qty, price, price * qty);
                involvedStores.add(storeObj.storeName);
            } else {
                buySuccess = false;
                pl.tell(plugin_prefix + `§c购买 ${foundItem.itemName} 失败（背包空间不足）。`);
                break;
            }
        }
        if (buySuccess) {
            // 保存数据
            market_data.write(JSON.stringify(obj, null, 4));
            market_data.reload();
            // 记录交易记录
            let record = JSON.parse(transactionRecord.read());
            for (const p of purchases) {
                const src = p.source;
                const item = src.item;
                const qty = p.qty;
                const price = item.itemUnitPrice;
                record.push(`§b[${system.getTimeStr()}] §d${pl.realName} §f从 §a${src.store.storeOwnerName} §f的店铺 <${src.store.storeName}> §a购买了 §c${qty} §f个 §3${item.itemName}，花费 §6${price * qty} 金币`);
            }
            transactionRecord.write(JSON.stringify(record, null, 4));
            transactionRecord.reload();
            // 给店主加钱并通知
            for (const p of purchases) {
                const src = p.source;
                const store = src.store;
                const item = src.item;
                const qty = p.qty;
                const price = item.itemUnitPrice;
                if (data.name2xuid(store.storeOwnerName)) {
                    Economy.add(data.name2xuid(store.storeOwnerName), price * qty);
                }
                const ownerPlayer = mc.getPlayer(store.storeOwnerName);
                if (ownerPlayer) {
                    ownerPlayer.tell(plugin_prefix + `§a您的店铺售出 ${qty} 个 ${item.itemName}，收入 ${price * qty} 金币，买家：${pl.realName}`);
                }
            }
            const storeCount = involvedStores.size;
            pl.tell(plugin_prefix + `§a成功从 ${purchases.length} 个商品来源（来自 ${storeCount} 个店铺）购买了 ${displayName}，共花费 ${totalCost} 金币。`);
        } else {
            pl.tell(plugin_prefix + `§c购买过程中出现错误，部分商品可能未购买。`);
        }
        //backFunction(pl);
    });
}

function purchaseProduct(player, item, store, obj, backFunction) {
    const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;
    const totalGoodsCount = store.goods.reduce((sum, g) => sum + g.itemCount, 0);

    const form = mc.newCustomForm();
    form.setTitle("购买商品");
    let arr = [
        `§6商品所在店铺: ${store.storeName}§r§f`,
        `§b[共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件商品]`,
        `§e店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
        `店铺创建日期: ${store.createDate}`,
        `访问量: ${store.visits} | 交易次数: ${store.tradeCount} | 营业额: ${store.revenue}`,
        `平均每笔交易额: ${averageTransactionAmount}`,
        `§d===============================§f`,
        `§c【§a商品介绍：${item.itemName} | 库存：${item.itemCount} | 单价: ${item.itemUnitPrice}§c】`,
        `§6商品备注：§r§f${item.itemRemark}`,
        `§b上架时间：${item.itemUploadTime ?? '未记录'}`,
        `§a商品详情：`,
        `${getItemDisplayName(mc.newItem(NBT.parseSNBT(item.itemSNBT)), true)}`
    ];
    form.addLabel(arr.join("\n").trim());
    form.addInput(`请输入购买数量： §7| §e余额： ${Economy.get(player.xuid)}`, `正整数`, `1`);

    player.sendForm(form, (pl, id2) => {
        if (id2 == null) return backFunction(pl);
        const num = Number(id2[1]);
        if (isNaN(num) || num <= 0) return pl.tell(plugin_prefix + "§c请输入正整数!");
        const needMoney = item.itemUnitPrice * num;
        if (Economy.get(pl.xuid) < needMoney) return pl.tell(plugin_prefix + `§c余额不足!`);
        if (pl.realName === store.storeOwnerName) return pl.tell(plugin_prefix + `§c禁止购买自己的商品!`);
        if (num > item.itemCount) return pl.tell(plugin_prefix + `§c库存不足!`);

        if (addItemToPlayer(pl, item.itemSNBT, num)) {
            Economy.reduce(pl.xuid, needMoney);
            store.revenue += needMoney;
            store.tradeCount++;
            item.itemCount -= num;
            const nbt = NBT.parseSNBT(item.itemSNBT);
            nbt.setByte("Count", item.itemCount);
            item.itemSNBT = nbt.toSNBT();
            if (item.itemCount === 0) {
                const idx = store.goods.indexOf(item);
                if (idx !== -1) store.goods.splice(idx, 1);
            }
            // 保存
            let storeKey = null;
            for (const key in obj) {
                if (obj[key] === store) { storeKey = key; break; }
            }
            if (!storeKey) {
                for (const key in obj) {
                    if (obj[key].storeOwnerName === store.storeOwnerName) { storeKey = key; break; }
                }
            }
            if (storeKey) {
                obj[storeKey] = store;
                market_data.write(JSON.stringify(obj, null, 4));
            } else {
                logger.error("无法找到店铺key，保存失败");
            }

            writeLog("buy", pl.realName, store.storeOwnerName, item.itemName, num, item.itemUnitPrice, needMoney);

            pl.tell(plugin_prefix + `§a成功购买 ${num} 个 ${item.itemName}，消费 ${needMoney} 金币。`);
            if (data.name2xuid(store.storeOwnerName)) {
                Economy.add(data.name2xuid(store.storeOwnerName), needMoney);
            }
            const ownerPlayer = mc.getPlayer(store.storeOwnerName);
            if (ownerPlayer) {
                ownerPlayer.tell(plugin_prefix + `§a您的店铺售出 ${num} 个 ${item.itemName}，收入 ${needMoney} 金币，买家：${pl.realName}`);
            }

            let record = JSON.parse(transactionRecord.read());
            record.push(`§b[${system.getTimeStr()}] §d${pl.realName} §f在 §a${store.storeOwnerName} §f的店铺 <${store.storeName}> §a花费 §6${needMoney} 金币 §a购买了 §c${num} §f个 §3${item.itemName}`);
            transactionRecord.write(JSON.stringify(record, null, 4));
            transactionRecord.reload();

            //backFunction(pl);
        } else {
            pl.tell(plugin_prefix + `§c背包空间不足!`);
        }
    });
}

// ======================= 主菜单 =======================
function mainMarketMenu(player) {
    let obj = JSON.parse(market_data.read());
    const storeCount = Object.keys(obj).length;
    let totalGoodsCount = 0;
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

    fm.addButton("批量购买", "textures/ui/craft_toggle_on_hover");   // 新增
    fm.addButton("查看全部商品", "textures/ui/icon_deals");
    fm.addButton("根据商品名称搜索商品", "textures/ui/magnifyingGlass");
    fm.addButton("按店铺查看商品", "textures/ui/Envelope");
    fm.addButton("店铺排行榜", "textures/ui/FriendsDiversity");
    fm.addButton("查看交易记录", "textures/ui/recipe_book_icon");
    fm.addButton("管理个人店铺", "textures/ui/Feedback");

    player.sendForm(fm, (pl, id) => {
        if (id == null) return;
        switch (id) {
            case 0: batchBuyProductsMain(pl); break;
            case 1: viewAllProducts(pl); break;
            case 2: searchAllProducts(pl); break;
            case 3: viewAllStores(pl); break;
            case 4: viewAllStoresRanking(pl); break;
            case 5: viewTransactionRecord(pl); break;
            case 6: manageStore(pl); break;
        }
    });
}

// ======================= 查看全部商品（合并） =======================
function viewAllProducts(player) {
    let obj = JSON.parse(market_data.read());
    let allGoods = [];
    for (const storeUUID in obj) {
        const store = obj[storeUUID];
        if (store.isOpen) {
            store.goods.forEach(item => {
                allGoods.push({ item, store, storeUUID });
            });
        }
    }
    if (allGoods.length === 0) return player.tell(plugin_prefix + "§c当前没有商品。");
    const merged = groupAndMergeGoods(allGoods);
    const fm = mc.newSimpleForm();
    fm.setTitle("全部商品（合并显示）");
    fm.setContent(`共有 ${allGoods.length} 个商品条目，合并后为 ${merged.length} 组。请选择：`);
    merged.forEach(group => {
        const priceRange = (group.minPrice === group.maxPrice) ? `单价 ${group.minPrice}` : `单价 ${group.minPrice}~${group.maxPrice}`;
        // 使用第一个来源的 itemName（已保存为中文名）
        let displayName = group.itemTypeName;
        if (group.sources.length > 0 && group.sources[0].item && group.sources[0].item.itemName) {
            displayName = group.sources[0].item.itemName;
        }
        fm.addButton(`${displayName} x ${group.totalCount} (${priceRange})`, getTexture(group.itemTypeName));
    });
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        const group = merged[id];
        if (group.sources.length === 1) {
            purchaseProduct(pl, group.sources[0].item, group.sources[0].store, JSON.parse(market_data.read()), () => viewAllProducts(pl));
        } else {
            showProductSources(pl, group, () => viewAllProducts(pl));
        }
    });
}

// ======================= 搜索商品（合并） =======================
function searchAllProducts(player) {
    const fm = mc.newCustomForm();
    fm.setTitle(`搜索商品`);
    fm.addInput(`根据商品名称模糊搜索：`, `字符串`, `附魔书`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        let input = id[0];
        if (!input || input.length <= 0) return pl.tell(`§c请输入搜索词!`);
        let obj = JSON.parse(market_data.read());
        let searchedGoods = [];
        for (const storeUUID in obj) {
            const store = obj[storeUUID];
            if (store.isOpen) {
                store.goods.forEach(item => {
                    if (item.itemName.includes(input)) {
                        searchedGoods.push({ item, store, storeUUID });
                    }
                });
            }
        }
        if (searchedGoods.length === 0) return pl.tell(`§c未找到 "${input}" 相关商品!`);
        const merged = groupAndMergeGoods(searchedGoods);
        const resultForm = mc.newSimpleForm();
        resultForm.setTitle(`搜索结果 - ${input}`);
        resultForm.setContent(`找到 ${searchedGoods.length} 个条目，合并为 ${merged.length} 组。`);
        merged.forEach(group => {
            const priceRange = (group.minPrice === group.maxPrice) ? `单价 ${group.minPrice}` : `单价 ${group.minPrice}~${group.maxPrice}`;
            // 使用中文名称（优先取第一个来源的 itemName）
            let displayName = group.itemTypeName;
            if (group.sources.length > 0 && group.sources[0].item && group.sources[0].item.itemName) {
                displayName = group.sources[0].item.itemName;
            }
            resultForm.addButton(`${displayName} x ${group.totalCount} (${priceRange})`, getTexture(group.itemTypeName));
        });
        pl.sendForm(resultForm, (pl2, id2) => {
            if (id2 == null) return searchAllProducts(pl2);
            const group = merged[id2];
            if (group.sources.length === 1) {
                purchaseProduct(pl2, group.sources[0].item, group.sources[0].store, JSON.parse(market_data.read()), () => searchAllProducts(pl2));
            } else {
                showProductSources(pl2, group, () => searchAllProducts(pl2));
            }
        });
    });
}

// ======================= 查看店铺、排行榜（合并） =======================
function viewAllStores(player) {
    const fm = mc.newSimpleForm();
    fm.setTitle("查看店铺");
    fm.setContent("请选择要查看的店铺：");
    let obj = JSON.parse(market_data.read());
    const icon_steve = `textures/ui/icon_steve`;
    const icon_alex = `textures/ui/icon_alex`;
    const iconPaths = [icon_steve, icon_alex];
    let iconIndex = 0;

    // 构建店铺列表并计算总件数
    const storeList = [];
    for (const uuid in obj) {
        const store = obj[uuid];
        if (store.isOpen) {
            let totalCount = 0;
            store.goods.forEach(item => { totalCount += item.itemCount; });
            storeList.push({
                uuid: uuid,
                store: store,
                totalCount: totalCount,
                itemCount: store.goods.length
            });
        }
    }
    // 按总件数降序排序
    storeList.sort((a, b) => b.totalCount - a.totalCount);

    // 添加按钮
    for (const entry of storeList) {
        const store = entry.store;
        const buttonText = `${store.storeOwnerName} 的小店\n§f[§e${entry.itemCount} §f项商品 | 共 §c${entry.totalCount} §f件]`;
        fm.addButton(buttonText, iconPaths[iconIndex % iconPaths.length]);
        iconIndex++;
    }

    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        const selected = storeList[id];
        if (!selected) return;
        const store = selected.store;
        const storeUUID = selected.uuid;
        if (pl.uuid !== storeUUID) {
            store.visits++;
            market_data.write(JSON.stringify(obj, null, 4));
        }
        showStoreDetails(pl, store, obj, 'viewAllStores');
    });
}

function viewAllStoresRanking(player) {
    const fm = mc.newSimpleForm();
    fm.setTitle("店铺排行榜");
    fm.setContent("按平均每笔交易额降序排列");
    let obj = JSON.parse(market_data.read());
    const icon_steve = `textures/ui/icon_steve`;
    const icon_alex = `textures/ui/icon_alex`;
    const iconPaths = [icon_steve, icon_alex];
    let iconIndex = 0;
    const storesArray = Object.entries(obj).filter(([uuid, store]) => store.isOpen).map(([uuid, store]) => {
        const revenue = Number(store.revenue);
        const tradeCount = Number(store.tradeCount);
        const avg = tradeCount > 0 ? Number((revenue / tradeCount).toFixed(0)) : 0;
        return { uuid, ...store, avg };
    });
    storesArray.sort((a, b) => b.avg - a.avg);
    storesArray.forEach(store => {
        fm.addButton(`${store.storeOwnerName} 的小店 §r§f(§e平均交易额: §c${store.avg}§f)`, iconPaths[iconIndex % iconPaths.length]);
        iconIndex++;
    });
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        const selected = storesArray[id];
        if (selected) {
            const store = obj[selected.uuid];
            if (pl.uuid !== selected.uuid) {
                store.visits++;
                market_data.write(JSON.stringify(obj, null, 4));
            }
            showStoreDetails(pl, store, obj, 'viewAllStoresRanking');
        }
    });
}

function showStoreDetails(player, store, obj, type) {
    const goodsEntries = store.goods.map(item => ({ item, store, storeUUID: player.uuid }));
    const merged = groupAndMergeGoods(goodsEntries);
    let totalGoodsCount = store.goods.reduce((sum, g) => sum + g.itemCount, 0);
    const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;

    const fm = mc.newSimpleForm();
    fm.setTitle(store.storeName);
    let list = [
        `店铺名称: ${store.storeName}§r§f [共计${store.goods.length} 项商品，合计 ${totalGoodsCount} 件]`,
        `店主: ${store.storeOwnerName} 宣传语：${store.storeInfo}§r§f`,
        `创建日期: ${store.createDate}`,
        `访问量：${store.visits}`,
        `交易次数: ${store.tradeCount}`,
        `营业额: ${store.revenue} 金币`,
        `平均每笔交易额: ${averageTransactionAmount}`
    ];
    fm.setContent(list.join("\n").trim());

    merged.forEach(group => {
        const priceRange = (group.minPrice === group.maxPrice) ? `单价 ${group.minPrice}` : `单价 ${group.minPrice}~${group.maxPrice}`;
        // 使用中文名称（优先取第一个来源的 itemName）
        let displayName = group.itemTypeName;
        if (group.sources.length > 0 && group.sources[0].item && group.sources[0].item.itemName) {
            displayName = group.sources[0].item.itemName;
        }
        fm.addButton(`${displayName} x ${group.totalCount} (${priceRange})`, getTexture(group.itemTypeName));
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) {
            if (type === "viewAllStores") return viewAllStores(pl);
            else if (type === "viewAllStoresRanking") return viewAllStoresRanking(pl);
            else return mainMarketMenu(pl);
        }
        const group = merged[id];
        if (group.sources.length === 1) {
            purchaseProduct(pl, group.sources[0].item, group.sources[0].store, JSON.parse(market_data.read()), () => showStoreDetails(pl, store, obj, type));
        } else {
            showProductSources(pl, group, () => showStoreDetails(pl, store, obj, type));
        }
    });
}

// ======================= 交易记录 =======================
function viewTransactionRecord(player) {
    const fm = mc.newCustomForm();
    fm.setTitle("交易记录");
    JSON.parse(transactionRecord.read()).forEach(r => {
        fm.addLabel(r);
    });
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        return mainMarketMenu(pl);
    });
}

// ======================= 管理个人店铺 =======================
function manageStore(player) {
    if (!market_data.get(player.uuid)) {
        player.sendModalForm("创建个人店铺", `您还没有店铺，是否创建？需要 ${StoreCreationCost} 金币`,
            "前往创建", "取消",
            (pl, res) => {
                if (res) send_create_personal_store_menu(pl);
            }
        );
        return;
    }
    send_manage_personal_store_menu(player);
}

function send_create_personal_store_menu(player) {
    const fm = mc.newCustomForm();
    fm.setTitle("创建个人店铺");
    fm.addLabel(`创建店铺需要启动资金 ${StoreCreationCost} 金币`);
    fm.addInput("店铺名称：", "起个名字", `${player.realName} 的小店`);
    fm.addInput("店铺介绍：", "宣传语", `欢迎光临~`);
    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        if (id[1].length <= 0) return pl.tell(plugin_prefix + "§c请输入店铺名称!");
        let storeInfo = !id[2] || id[2].length <= 0 ? "" : id[2].trim();
        if (Economy.get(player.xuid) < StoreCreationCost) {
            return pl.tell(plugin_prefix + `§c余额不足 ${StoreCreationCost} 金币!`);
        }
        Economy.reduce(player.xuid, StoreCreationCost);
        market_data.init(pl.uuid, {
            "storeOwnerName": pl.realName,
            "storeName": id[1],
            "storeInfo": storeInfo,
            "isOpen": true,
            "createDate": system.getTimeStr(),
            "visits": 0,
            "tradeCount": 0,
            "revenue": 0,
            "goods": []
        });
        mc.broadcast(plugin_prefix + `§d${pl.realName} §a创建了店铺：${id[1]}，输入 /mk 进入！`);
        sendGroupMsg(`${pl.realName} 创建了店铺：${id[1]}，输入 /mk 进入！`);
        writeLog("createStore", pl.realName, id[1], StoreCreationCost);
    });
}

// ======================= 店铺管理菜单（含批量功能） =======================
function send_manage_personal_store_menu(player) {
    const fm = mc.newSimpleForm();
    fm.setTitle("管理个人店铺");
    fm.setContent(`在售 ${market_data.get(player.uuid)["goods"].length} 件商品`);

    fm.addButton("批量上架商品", "textures/ui/jump_boost_effect");
    fm.addButton("下架现有商品", "textures/ui/world_download");
    fm.addButton("编辑现有商品", "textures/ui/video_glyph_color_2x");
    fm.addButton("补货", "textures/ui/refresh");
    fm.addButton("一键开店", "textures/ui/mute_off");
    fm.addButton("一键关店", "textures/ui/mute_on");
    fm.addButton("编辑店铺信息", "textures/ui/multiselection");
    fm.addButton("卷铺跑路", "textures/ui/speed_effect");
    fm.addButton("返回上一页", "textures/ui/icon_import");

    player.sendForm(fm, (pl, id) => {
        if (id == null) return;
        switch (id) {
            case 0: batchUploadProducts(pl); break; // 批量上架功能
            case 1: removeProducts(pl, market_data.get(pl.uuid), JSON.parse(market_data.read())); break;
            case 2: editProductInfo(pl, market_data.get(pl.uuid), JSON.parse(market_data.read())); break;
            case 3: replenishProduct(pl); break; // 补货功能
            case 4: {
                let temp = market_data.get(pl.uuid);
                if (!temp["isOpen"]) {
                    temp["isOpen"] = true;
                    //pl.tell(plugin_prefix + "§b店铺已恢复营业!");
                    mc.broadcast(plugin_prefix + `§a${pl.realName} 的店铺已恢复营业!`);
                } else {
                    pl.tell(plugin_prefix + "§c店铺已是营业状态!");
                }
                market_data.set(pl.uuid, temp);
                market_data.reload();
                break;
            }
            case 5: {
                let temp = market_data.get(pl.uuid);
                if (temp["isOpen"]) {
                    temp["isOpen"] = false;
                    //pl.tell(plugin_prefix + "§b店铺已打烊!");
                    mc.broadcast(plugin_prefix + `§a${pl.realName} 的店铺已打烊!`);
                } else {
                    pl.tell(plugin_prefix + "§c店铺已是打烊状态!");
                }
                market_data.set(pl.uuid, temp);
                market_data.reload();
                break;
            }
            case 6: editStoreInfo(pl, market_data.get(pl.uuid), JSON.parse(market_data.read())); break;
            case 7: pl.tell(plugin_prefix + "卷铺跑路 功能正在开发..."); break;
            case 8: mainMarketMenu(pl); break;
        }
    });
}

// ======================= 批量上架 =======================
function batchUploadProducts(player) {
    const invItems = getPlayerAllInventoryItems(player);
    if (invItems.length === 0) {
        return player.tell(plugin_prefix + "§c背包没有任何可上架物品!");
    }
    const fm = mc.newCustomForm();
    fm.setTitle("批量上架商品");
    fm.addLabel("请选择要上架的物品（可多选），并设置统一单价：");
    const itemNames = invItems.map((it, idx) => {
        const display = getItemDisplayName(it, false);
        return `${idx + 1}. ${display} (数量: ${it.count})`;
    });
    for (let i = 0; i < invItems.length; i++) {
        fm.addSwitch(itemNames[i], false);
    }
    fm.addInput("统一售价（每个物品单价）：", "正整数", "10");
    player.sendForm(fm, (pl, id) => {
        if (id == null) return send_manage_personal_store_menu(pl);
        const price = parseInt(id[id.length - 1]);
        if (isNaN(price) || price <= 0) return pl.tell(plugin_prefix + "§c请输入有效价格!");
        if (price > 999999999) return pl.tell(plugin_prefix + "§c价格不能超过999999999!");
        const selected = [];
        for (let i = 0; i < invItems.length; i++) {
            if (id[i + 1] === true) {
                selected.push(invItems[i]);
            }
        }
        if (selected.length === 0) return pl.tell(plugin_prefix + "§c请至少选择一个物品!");
        let store = market_data.get(pl.uuid);
        let successCount = 0;
        selected.forEach(item => {
            const count = item.count;
            const nbtString = item.clone().getNbt().setByte("Count", count).toSNBT();
            store["goods"].push({
                "itemName": I18nAPI.get(item.getTranslateKey(), [], "zh_CN"),
                "itemTypeName": item.type,
                "itemCount": count,
                "itemUnitPrice": price,
                "itemInfo": getItemDisplayName(item, true).replace(/§[a-zA-Z0-9]/g, ''),
                "itemRemark": "批量上架",
                "itemSNBT": nbtString,
                "itemUploadTime": system.getTimeStr()
            });
            const nbt = item.getNbt().setByte("Count", 0);
            item.setNbt(nbt);
            item.setNull();
            successCount++;
            writeLog("upload", pl.realName, item.type, count, price);
        });
        market_data.set(pl.uuid, store);
        market_data.reload();
        pl.refreshItems();
        //pl.tell(plugin_prefix + `§a成功批量上架 ${successCount} 种物品，单价 ${price}。`);
        mc.broadcast(plugin_prefix + `§a${pl.realName} 批量上架了 ${successCount} 种商品，单价 ${price}。`);
        //send_manage_personal_store_menu(pl);
    });
}

// ======================= 批量购买 =======================
function batchBuyProductsMain(player) {
    let obj = JSON.parse(market_data.read());
    let allGoods = [];
    for (const storeUUID in obj) {
        const store = obj[storeUUID];
        if (store.isOpen) {
            store.goods.forEach(item => {
                allGoods.push({ item, store, storeUUID });
            });
        }
    }
    if (allGoods.length === 0) return player.tell(plugin_prefix + "§c市场暂无商品。");

    const merged = groupAndMergeGoodsForBatch(allGoods);
    const fm = mc.newCustomForm();
    fm.setTitle("批量购买");
    fm.addLabel("请输入每个商品要购买的数量（0表示不购买）：");
    merged.forEach((group) => {
        const price = group.unitPrice;
        const displayName = group.displayName;
        // 取第一个商品的 itemInfo（物品详细信息，如附魔、潜影盒内容等）
        let itemInfo = "";
        if (group.sources.length > 0 && group.sources[0].item && group.sources[0].item.itemInfo) {
            itemInfo = group.sources[0].item.itemInfo;
        }
        // 构建标签：名称、库存、单价，如果有 itemInfo 则换行附加
        const labelText = `${displayName} §f单价: §e${price} §f库存: §c${group.totalCount} ${itemInfo ? "\n" + "§6" + itemInfo : ""}`;
        fm.addInput(labelText, "数量", "0");
    });

    player.sendForm(fm, (pl, id) => {
        if (id == null) return mainMarketMenu(pl);
        let totalCost = 0;
        const purchases = [];
        for (let i = 1; i < id.length; i++) {
            const qty = parseInt(id[i]);
            if (!isNaN(qty) && qty > 0) {
                const group = merged[i - 1];
                let totalStock = 0;
                for (const src of group.sources) {
                    totalStock += src.item.itemCount;
                }
                if (totalStock < qty) {
                    pl.tell(plugin_prefix + `§c商品 ${group.displayName} 总库存不足（需要 ${qty}，现有 ${totalStock}）。`);
                    continue;
                }
                const sortedSources = group.sources.slice().sort((a, b) => a.item.itemUnitPrice - b.item.itemUnitPrice);
                let need = qty;
                for (const src of sortedSources) {
                    if (need <= 0) break;
                    const take = Math.min(need, src.item.itemCount);
                    if (take > 0) {
                        purchases.push({ source: src, qty: take, price: src.item.itemUnitPrice });
                        need -= take;
                        totalCost += take * src.item.itemUnitPrice;
                    }
                }
                if (need > 0) {
                    pl.tell(plugin_prefix + `§c商品 ${group.displayName} 库存不足，无法满足购买数量。`);
                    return;
                }
            }
        }
        if (purchases.length === 0) return pl.tell(plugin_prefix + "§c请至少购买一种商品。");
        if (Economy.get(pl.xuid) < totalCost) return pl.tell(plugin_prefix + `§c余额不足，共需 ${totalCost} 金币。`);

        let buySuccess = true;
        for (const p of purchases) {
            const src = p.source;
            const store = src.store;
            const item = src.item;
            const qty = p.qty;
            const price = p.price;
            if (addItemToPlayer(pl, item.itemSNBT, qty)) {
                Economy.reduce(pl.xuid, price * qty);
                store.revenue += price * qty;
                store.tradeCount++;
                item.itemCount -= qty;
                const nbt = NBT.parseSNBT(item.itemSNBT);
                nbt.setByte("Count", item.itemCount);
                item.itemSNBT = nbt.toSNBT();
                if (item.itemCount === 0) {
                    const idx = store.goods.indexOf(item);
                    if (idx !== -1) store.goods.splice(idx, 1);
                }
                writeLog("buy", pl.realName, store.storeOwnerName, item.itemName, qty, price, price * qty);
            } else {
                buySuccess = false;
                pl.tell(plugin_prefix + `§c购买 ${item.itemName} 失败（背包空间不足）。`);
            }
        }
        if (buySuccess) {
            market_data.write(JSON.stringify(obj, null, 4));
            pl.tell(plugin_prefix + `§a批量购买成功，${purchases.length} 种商品，共花费 ${totalCost} 金币。`);
            //mc.broadcast(plugin_prefix + `§a${pl.realName} 批量购买了 ${purchases.length} 种商品。`);
        }
        //mainMarketMenu(pl);
    });
}

// ======================= 补货 =======================
function replenishProduct(player) {
    let obj = JSON.parse(market_data.read());
    const store = obj[player.uuid];
    if (!store || store.goods.length === 0) {
        return player.tell(plugin_prefix + "§c您的店铺没有商品可补货。");
    }
    const fm = mc.newSimpleForm();
    fm.setTitle("补货 - 选择商品");
    fm.setContent("请选择要补货的商品：");
    store.goods.forEach((item, idx) => {
        fm.addButton(`${item.itemName} (库存 ${item.itemCount}, 单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });
    player.sendForm(fm, (pl, idx) => {
        if (idx == null) return send_manage_personal_store_menu(pl);
        const selectedItem = store.goods[idx];
        const form = mc.newCustomForm();
        form.setTitle("补货");
        form.addLabel(`商品：${selectedItem.itemName}，当前库存 ${selectedItem.itemCount}`);
        form.addInput("请输入补货数量：", "正整数", "1");
        pl.sendForm(form, (pl2, id2) => {
            if (id2 == null) return replenishProduct(pl2);
            const qty = parseInt(id2[1]);
            if (isNaN(qty) || qty <= 0) return pl2.tell(plugin_prefix + "§c请输入正整数!");
            const inventory = pl2.getInventory();
            const allItems = inventory.getAllItems();
            let need = qty;
            let found = 0;
            for (let i = 0; i < allItems.length; i++) {
                const it = allItems[i];
                if (it.isNull()) continue;
                if (it.type === selectedItem.itemTypeName) {
                    const nbt1 = it.getNbt();
                    const nbt2 = NBT.parseSNBT(selectedItem.itemSNBT);
                    nbt1.setByte("Count", 1);
                    nbt2.setByte("Count", 1);
                    if (nbt1.toSNBT() === nbt2.toSNBT()) {
                        const take = Math.min(need, it.count);
                        const newCount = it.count - take;
                        if (newCount <= 0) {
                            it.setNull();
                        } else {
                            const nbt = it.getNbt().setByte("Count", newCount);
                            it.setNbt(nbt);
                        }
                        need -= take;
                        found += take;
                        if (need <= 0) break;
                    }
                }
            }
            if (found === 0) return pl2.tell(plugin_prefix + "§c背包中没有足够的相同物品（需匹配NBT）！");
            selectedItem.itemCount += found;
            const nbt = NBT.parseSNBT(selectedItem.itemSNBT);
            nbt.setByte("Count", selectedItem.itemCount);
            selectedItem.itemSNBT = nbt.toSNBT();
            // 直接写回 obj，因为 store 是 obj 中的引用
            market_data.write(JSON.stringify(obj, null, 4));
            pl2.refreshItems();
            pl2.tell(plugin_prefix + `§a成功补货 ${found} 个 ${selectedItem.itemName}，当前库存 ${selectedItem.itemCount}`);
            writeLog("replenish", pl2.realName, selectedItem.itemName, found);
            send_manage_personal_store_menu(pl2);
        });
    });
}

function removeProducts(player, store, obj) {
    let totalGoodsCount = 0;
    store.goods.forEach(item => { totalGoodsCount += item.itemCount; });
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
    ];
    fm.setContent(list.join("\n").trim());
    store.goods.forEach(item => {
        fm.addButton(`${item.itemName} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });
    player.sendForm(fm, (pl, id) => {
        if (id == null) return send_manage_personal_store_menu(pl);
        if (id < store.goods.length) {
            const item = store.goods[id];
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
                if (id2 == null) return removeProducts(pl2, store, obj);
                const num = Number(id2[1]);
                if (isNaN(num) || num <= 0) return pl2.tell(plugin_prefix + "§c请输入正整数!");
                if (num <= item.itemCount) {
                    if (addItemToPlayer(pl2, item.itemSNBT, num)) {
                        item.itemCount -= num;
                        item.itemSNBT = NBT.parseSNBT(item.itemSNBT).setByte("Count", item.itemCount).toSNBT();
                        if (item.itemCount === 0) {
                            const index = store.goods.indexOf(item);
                            if (index !== -1) store.goods.splice(index, 1);
                        }
                        obj[pl2.uuid] = store;
                        market_data.write(JSON.stringify(obj, null, 4));
                        pl2.tell(plugin_prefix + `§a成功下架了 ${num} 个 ${item.itemName}`);
                        writeLog("remove", pl2.realName, item.itemName, num);
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

function editProductInfo(player, store, obj) {
    let totalGoodsCount = 0;
    store.goods.forEach(item => { totalGoodsCount += item.itemCount; });
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
    ];
    fm.setContent(list.join("\n").trim());
    store.goods.forEach(item => {
        fm.addButton(`${item.itemName} x ${item.itemCount}\n(单价 ${item.itemUnitPrice})`, getTexture(item.itemTypeName));
    });
    player.sendForm(fm, (pl, id) => {
        if (id == null) return send_manage_personal_store_menu(pl);
        if (id < store.goods.length) {
            const item = store.goods[id];
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
                obj[pl2.uuid] = store;
                market_data.write(JSON.stringify(obj, null, 4));
                pl2.tell(plugin_prefix + `§a${item.itemCount} 个 ${item.itemName} 的单价现已调整为 ${num}/个`);
                // 编辑不记录日志？可根据需要添加
            });
        }
    });
}

function editStoreInfo(player, store, obj) {
    let totalGoodsCount = 0;
    store.goods.forEach(item => { totalGoodsCount += item.itemCount; });
    const averageTransactionAmount = (store.tradeCount > 0) ? Number((store.revenue / store.tradeCount).toFixed(0)) : 0;
    const form = mc.newCustomForm();
    form.setTitle("编辑店铺信息");
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
        if (id == null) return send_manage_personal_store_menu(pl);
        const str = id[1];
        const str2 = id[2];
        if (str.length <= 0) return pl.tell(plugin_prefix + "§c请输入修改后的店铺名称!");
        if (str2.length <= 0) return pl.tell(plugin_prefix + "§c请输入修改后的店铺宣传语!");
        store.storeName = str;
        store.storeInfo = str2;
        obj[pl.uuid] = store;
        market_data.write(JSON.stringify(obj, null, 4));
        pl.tell(plugin_prefix + `§a您的店铺名称和宣传语已更新!`);
    });
}

logger.info("B-Market 已加载，使用 /market 打开市场");