// LiteLoader-AIDS automatic generated
/// <reference path="d:\LLSE-API/dts/helperlib/src/index.d.ts"/> 


/*
   合并插件：PlayerMonitor（越肩视角） + videoDirector（导播台）
   功能：
   - 越肩视角（支持监控其他玩家）
   - 导播追踪（自动跟随、切换目标、距离/维度检测）
   - 解决服务器重启后玩家仍处于旁观者模式的问题
   作者：合并
*/

// ==================== 插件基本信息 ====================
const PLUGIN_NAME = "CameraDirector";
const PLUGIN_VERSION = [0, 9, 2, Version.Beta];
const PLUGIN_PATH = `./plugins/${PLUGIN_NAME}/`;
const CONFIG_PATH = `${PLUGIN_PATH}config.json`;
const DATA_PATH = `${PLUGIN_PATH}data.json`;

ll.registerPlugin(
    PLUGIN_NAME,
    "越肩视角 + 导播台 合并插件",
    PLUGIN_VERSION,
    { "作者qq": "3096514973" }
);

// ==================== 配置文件 ====================
const CONFIG = new JsonConfigFile(CONFIG_PATH, JSON.stringify(
    { "director": "YuFeng9059" },  // 默认导播员（控制台调用时使用）
    null, 4
));

// ==================== 持久化数据 ====================
/*
  数据结构：
  {
    "monitorStates": {
      "<uuid>": {
        "targetName": "player2",
        "originalPos": { "x": 0, "y": 0, "z": 0, "dimid": 0 },
        "originalGameMode": 0
      }
    },
    "CameraDirector": {
      "task": false,
      "director": "",
      "directedPlayer": ""
    }
  }
*/
const DATA = new JsonConfigFile(DATA_PATH, JSON.stringify(
    {
        "monitorStates": {},
        "CameraDirector": {
            "task": false,
            "director": "",
            "directedPlayer": ""
        }
    },
    null, 4
));

// ==================== 工具函数 ====================
function isValidNumber(v) {
    return typeof v === 'number' && isFinite(v);
}
function isValidPos(pos) {
    return pos && isValidNumber(pos.x) && isValidNumber(pos.y) && isValidNumber(pos.z);
}
function isValidRot(rot) {
    return rot && isValidNumber(rot.pitch) && isValidNumber(rot.yaw);
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return a + diff * t;
}
function getLocalOffset(yawDeg, xOff, yOff, zOff) {
    const yaw = yawDeg * Math.PI / 180;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    return {
        x: xOff * cosY - zOff * sinY,
        y: yOff,
        z: xOff * sinY + zOff * cosY
    };
}
function isSolidBlock(block) {
    if (!block) return false;
    try {
        const name = block.type;
        if (name.includes('air') || name.includes('water') || name.includes('lava')) return false;
        return true;
    } catch {
        try {
            return !block.isAir;
        } catch {
            return true;
        }
    }
}
function isPositionValid(player, pos, eyePos) {
    const bx = Math.floor(pos.x), by = Math.floor(pos.y), bz = Math.floor(pos.z);
    let block;
    try {
        block = mc.getBlock(bx, by, bz, player.pos.dimid);
    } catch {
        return false;
    }
    if (isSolidBlock(block)) return false;

    const dx = pos.x - eyePos.x, dy = pos.y - eyePos.y, dz = pos.z - eyePos.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 0.1) return true;
    const step = 0.2;
    const steps = Math.ceil(len / step);
    for (let i = 1; i <= steps; i++) {
        const t = i * step;
        if (t > len) break;
        const px = eyePos.x + dx / len * t;
        const py = eyePos.y + dy / len * t;
        const pz = eyePos.z + dz / len * t;
        const bx2 = Math.floor(px), by2 = Math.floor(py), bz2 = Math.floor(pz);
        let b;
        try {
            b = mc.getBlock(bx2, by2, bz2, player.pos.dimid);
        } catch { continue; }
        if (isSolidBlock(b)) return false;
    }
    return true;
}
function findValidCameraPos(player, eyePos, desiredPos, searchRadius = 1.0, step = 0.2) {
    if (isPositionValid(player, desiredPos, eyePos)) return desiredPos;
    const candidates = [];
    for (let dx = -searchRadius; dx <= searchRadius; dx += step) {
        for (let dy = -searchRadius; dy <= searchRadius; dy += step) {
            for (let dz = -searchRadius; dz <= searchRadius; dz += step) {
                if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.abs(dz) < 0.01) continue;
                const pos = { x: desiredPos.x + dx, y: desiredPos.y + dy, z: desiredPos.z + dz };
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist > searchRadius) continue;
                if (isPositionValid(player, pos, eyePos)) candidates.push(pos);
            }
        }
    }
    if (candidates.length) {
        let best = candidates[0], bestDist = Infinity;
        for (const p of candidates) {
            const d = (p.x - eyePos.x) ** 2 + (p.y - eyePos.y) ** 2 + (p.z - eyePos.z) ** 2;
            if (d < bestDist) { bestDist = d; best = p; }
        }
        return best;
    }
    return desiredPos;
}

// ==================== 全局内存状态 ====================
// 键均为玩家的 uuid (字符串)
const playerCamState = new Map();    // 平滑状态
const tickTimers = new Map();        // 定时器句柄
const monitorMap = new Map();        // 监控关系：监控者uuid -> 被监控者名字

// ==================== 核心相机控制 ====================

/**
 * 清除玩家的相机并恢复其状态（从持久化数据中读取原始位置/游戏模式）
 * @param {Player} player
 */
function clearPlayerCamera(player) {
    if (!player) return;
    const uuid = player.uuid;
    // 停止定时器
    if (tickTimers.has(uuid)) {
        clearInterval(tickTimers.get(uuid));
        tickTimers.delete(uuid);
    }
    // 清除相机指令
    mc.runcmdEx(`camera "${player.realName}" set minecraft:first_person`);
    mc.runcmdEx(`camera "${player.realName}" clear`);
    player.runcmd(`camera @s clear`);
    // 移除内存状态
    playerCamState.delete(uuid);
    monitorMap.delete(uuid);

    // ----- 从持久化恢复原始位置和游戏模式 -----
    const data = DATA.get("monitorStates") || {};
    if (data[uuid]) {
        const state = data[uuid];
        const pos = state.originalPos;
        const gm = state.originalGameMode;
        // 恢复位置（如果有效）
        if (pos && isValidPos(pos)) {
            try {
                player.teleport(new FloatPos(pos.x, pos.y, pos.z, pos.dimid));
            } catch (e) {
                logger.error(`恢复位置失败: ${e.message}`);
            }
        }
        // 恢复游戏模式
        if (gm !== undefined && gm !== null) {
            try {
                player.setGameMode(gm);
            } catch (e) {
                logger.error(`恢复游戏模式失败: ${e.message}`);
            }
        }
        // 删除该记录
        delete data[uuid];
        DATA.set("monitorStates", data);
        DATA.reload();
    }
}

/**
 * 开启越肩视角（支持监控其他玩家）
 * @param {Player} player 监控者
 * @param {Player} targetPlayer 被监控者（默认为自己）
 */
function enableRightShoulderCam(player, targetPlayer = player, saveOriginal = true) {
    if (!player) return;
    const uuid = player.uuid;
    // 清除已有的定时器和相机（但不恢复位置）
    if (tickTimers.has(uuid)) {
        clearInterval(tickTimers.get(uuid));
        tickTimers.delete(uuid);
    }
    mc.runcmdEx(`camera "${player.realName}" set minecraft:first_person`);
    mc.runcmdEx(`camera "${player.realName}" clear`);
    player.runcmd(`camera @s clear`);
    playerCamState.delete(uuid);
    monitorMap.delete(uuid);

    if (saveOriginal) {
        // 监控他人时保存原始位置并设为旁观者
        if (targetPlayer !== player) {
            if (!targetPlayer) {
                player.tell("§c目标玩家不在线");
                return;
            }
            const pos = player.pos;
            const originalPos = { x: pos.x, y: pos.y, z: pos.z, dimid: pos.dimid };
            const originalGameMode = player.gameMode;
            const data = DATA.get("monitorStates") || {};
            data[uuid] = {
                targetName: targetPlayer.realName,
                originalPos: originalPos,
                originalGameMode: originalGameMode
            };
            DATA.set("monitorStates", data);
            DATA.reload();
            player.setGameMode(6);
            monitorMap.set(uuid, targetPlayer.realName);
        }
    } else {
        // 不保存新位置，但确保处于旁观者模式（如果已有监控关系则保留）
        if (player.gameMode !== 6) {
            player.setGameMode(6);
        }
        // 如果目标不是自己且没有监控关系，则建立（但一般重定位时已有）
        if (targetPlayer !== player && !monitorMap.has(uuid)) {
            monitorMap.set(uuid, targetPlayer.realName);
        }
    }

    // 获取目标玩家的初始脚部位置和朝向
    let footPos = targetPlayer.feetPos;
    let pRot = targetPlayer.direction;
    if (!isValidPos(footPos)) footPos = { x: 0, y: 0, z: 0 };
    if (!isValidRot(pRot)) pRot = { pitch: 0, yaw: 0 };
    const eyeHeight = targetPlayer.pos.y - targetPlayer.feetPos.y;

    playerCamState.set(uuid, {
        smoothLoc: { x: footPos.x, y: footPos.y, z: footPos.z },
        smoothRot: { pitch: pRot.pitch, yaw: pRot.yaw },
        baseX: -0.8,
        baseZ: -1.5,
        eyeHeight: eyeHeight,
        logCounter: 0
    });

    const timerId = setInterval(() => {
        try {
            if (!player || typeof player.realName !== 'string' || !player.realName) {
                if (tickTimers.has(uuid)) {
                    clearInterval(tickTimers.get(uuid));
                    tickTimers.delete(uuid);
                }
                playerCamState.delete(uuid);
                monitorMap.delete(uuid);
                return;
            }
            const pl = mc.getPlayer(player.realName);
            if (!pl) {
                if (tickTimers.has(uuid)) {
                    clearInterval(tickTimers.get(uuid));
                    tickTimers.delete(uuid);
                }
                playerCamState.delete(uuid);
                monitorMap.delete(uuid);
                return;
            }
            const state = playerCamState.get(uuid);
            if (!state) {
                clearInterval(timerId);
                tickTimers.delete(uuid);
                return;
            }

            const targetName = monitorMap.get(uuid);
            let targetPl;
            if (targetName) {
                targetPl = mc.getPlayer(targetName);
                if (!targetPl) {
                    pl.tell(`§c目标玩家 ${targetName} 已下线，监控结束`);
                    clearPlayerCamera(player);
                    return;
                }
            } else {
                targetPl = pl;
            }

            if (targetPl !== pl && pl.pos.dimid !== targetPl.pos.dimid) {
                const tpPos = targetPl.feetPos;
                pl.teleport(tpPos, targetPl.pos.dimid);
                return;
            }

            const footPos = targetPl.feetPos;
            const targetRot = targetPl.direction;
            if (!isValidPos(footPos) || !isValidRot(targetRot)) return;

            state.smoothLoc.x = lerp(state.smoothLoc.x, footPos.x, 0.35);
            state.smoothLoc.y = lerp(state.smoothLoc.y, footPos.y, 0.35);
            state.smoothLoc.z = lerp(state.smoothLoc.z, footPos.z, 0.35);
            state.smoothRot.pitch = lerp(state.smoothRot.pitch, targetRot.pitch, 0.25);
            state.smoothRot.yaw = lerpAngle(state.smoothRot.yaw, targetRot.yaw, 0.25);
            state.smoothRot.pitch = Math.max(-90, Math.min(90, state.smoothRot.pitch));

            const pitchNorm = state.smoothRot.pitch / 90;
            let offsetY = state.eyeHeight + pitchNorm * 1.8;
            offsetY = Math.min(offsetY, state.eyeHeight + 1.4);
            if (player.isSwimming || player.isCrawling) {
                offsetY = 0.5;
            }
            const offsetZ = state.baseZ + Math.abs(pitchNorm) * 0.9;
            const offset = getLocalOffset(state.smoothRot.yaw, state.baseX, offsetY, offsetZ);
            const camPos = {
                x: state.smoothLoc.x + offset.x,
                y: state.smoothLoc.y + offset.y,
                z: state.smoothLoc.z + offset.z
            };
            if (!isValidPos(camPos)) return;

            const eyePos = {
                x: state.smoothLoc.x,
                y: state.smoothLoc.y + state.eyeHeight,
                z: state.smoothLoc.z
            };
            const finalPos = findValidCameraPos(pl, eyePos, camPos, 1.0, 0.2);

            const cmd = `camera "${pl.realName}" set minecraft:free ease 0.08 linear pos ${finalPos.x} ${finalPos.y} ${finalPos.z} rot ${state.smoothRot.pitch} ${state.smoothRot.yaw}`;
            mc.runcmdEx(cmd);

        } catch (error) {
            logger.error(error.message);
            logger.error(error.stack);
        }
    }, 50);

    tickTimers.set(uuid, timerId);
    if (targetPlayer === player) {
        player.tell("§a已开启越肩视角");
    } else {
        player.tell(`§a已开启对 ${targetPlayer.realName} 的越肩视角监控`);
    }
}

// ==================== PlayerMonitor 表单 ====================
function openCamMenu(player) {
    const form = mc.newSimpleForm();
    form.setTitle("§l越肩相机控制面板");
    form.setContent("选择功能开启/关闭相机");
    form.addButton("开启我的越肩视角");
    form.addButton("清除我的相机视角");
    form.addButton("选择监控其他玩家");
    form.addButton("关闭面板");
    player.sendForm(form, (pl, id) => {
        if (id == null) return;
        switch (id) {
            case 0: enableRightShoulderCam(pl); break;
            case 1: clearPlayerCamera(pl); break;
            case 2: chooseOtherPlayer(pl); break;
            default: break;
        }
    });
}
function chooseOtherPlayer(player) {
    let onlinePlayers = mc.getOnlinePlayers().filter(pl => !pl.isSimulatedPlayer() && pl.xuid !== player.xuid);
    onlinePlayers = onlinePlayers.filter(pl => !monitorMap.has(pl.uuid));
    if (onlinePlayers.length === 0) {
        player.tell("§c当前没有可监控的玩家（可能都在监控别人）");
        return;
    }
    onlinePlayers.sort((a, b) => a.realName.localeCompare(b.realName));
    const names = onlinePlayers.map(p => p.realName);
    const form = mc.newCustomForm();
    form.setTitle("§l越肩相机控制面板");
    form.addLabel("可监控的玩家不包含：自己、假人、正在监控其他玩家的玩家");
    form.addDropdown("选择要监控的玩家：", names, 0);
    player.sendForm(form, (pl, id) => {
        if (id == null) return;
        const idx = id[1];
        const target = onlinePlayers[idx];
        enableRightShoulderCam(pl, target);
    });
}

// ==================== CameraDirector 核心 ====================
let pendingStartTask = null;
let lastRelocateTime = 0;
const RELOCATE_COOLDOWN = 5000; // 5秒冷却

/**
 * 导播员传送至目标身后并看向目标（备用函数，可在启动导播前调用）
 */
function Director(director, target, distance = 10) {
    if (!director || !target) return false;
    const tPos = target.pos;
    const tDir = target.direction;
    if (!tDir || tDir.yaw === undefined) {
        director.teleport(tPos);
        const dx = tPos.x - director.pos.x;
        const dy = (tPos.y + 1.6) - director.pos.y;
        const dz = tPos.z - director.pos.z;
        const horiz = Math.sqrt(dx * dx + dz * dz);
        const yaw = -Math.atan2(dx, dz) * 180 / Math.PI;
        const pitch = -Math.atan2(dy, horiz) * 180 / Math.PI;
        director.teleport(director.pos, new DirectionAngle(pitch, yaw));
        return true;
    }
    const yawRad = tDir.yaw * Math.PI / 180;
    const fwdX = -Math.sin(yawRad);
    const fwdZ = -Math.cos(yawRad);
    const newX = tPos.x - fwdX * distance;
    const newZ = tPos.z - fwdZ * distance;
    const newY = tPos.y + 1.6;
    const destPos = new FloatPos(newX, newY, newZ, tPos.dimid);
    const dx = tPos.x - destPos.x;
    const dy = (tPos.y + 1.6) - destPos.y;
    const dz = tPos.z - destPos.z;
    const horiz = Math.sqrt(dx * dx + dz * dz);
    const yaw = -Math.atan2(dx, dz) * 180 / Math.PI;
    const pitch = -Math.atan2(dy, horiz) * 180 / Math.PI;
    director.teleport(destPos, new DirectionAngle(pitch, yaw));
    return true;
}

/**
 * 开始导播追踪
 * @param {string} directorName
 * @param {string} targetName
 * @param {boolean} keepPos 是否保留原始位置（用于重定位）
 * @returns {boolean}
 */
function startDirector(directorName, targetName, keepPos = false) {
    if (DATA.get("CameraDirector").task) {
        stopDirector(!keepPos);
    }
    const director = mc.getPlayer(directorName);
    const target = mc.getPlayer(targetName);
    if (!director || !target) return false;

    const vdData = DATA.get("CameraDirector") || {};
    vdData.task = true;
    vdData.director = directorName;
    vdData.directedPlayer = targetName;
    DATA.set("CameraDirector", vdData);
    DATA.reload();

    // 先传送导播员到目标身后
    Director(director, target);

    // 清除旧的延迟任务
    if (pendingStartTask) {
        clearInterval(pendingStartTask);
        pendingStartTask = null;
    }

    // 延迟 3 秒后启动越肩视角（保存原始位置）
    pendingStartTask = setTimeout(() => {
        pendingStartTask = null;
        const vd = DATA.get("CameraDirector") || {};
        if (!vd.task || vd.director !== directorName || vd.directedPlayer !== targetName) return;
        const dirNow = mc.getPlayer(directorName);
        const tarNow = mc.getPlayer(targetName);
        if (dirNow && tarNow) {
            enableRightShoulderCam(dirNow, tarNow, true);
        } else {
            stopDirector();
        }
    }, 3000);

    return true;
}

/**
 * 停止导播追踪
 * @param {boolean} clearData 是否清除任务元数据（默认为 true）
 * @returns {boolean}
 */
function stopDirector(clearData = true) {
    const vdData = DATA.get("CameraDirector") || {};
    if (!vdData.task) return false;

    // 清除延迟任务
    if (pendingStartTask) {
        clearInterval(pendingStartTask);
        pendingStartTask = null;
    }

    const directorName = vdData.director;
    const director = mc.getPlayer(directorName);
    if (director) {
        // 清除相机并恢复（clearPlayerCamera 会从持久化恢复）
        clearPlayerCamera(director);
        // 额外强制清除
        mc.runcmdEx(`camera "${director.realName}" set minecraft:first_person`);
        mc.runcmdEx(`camera "${director.realName}" clear`);
    }

    if (clearData) {
        vdData.task = false;
        vdData.director = "";
        vdData.directedPlayer = "";
        DATA.set("CameraDirector", vdData);
        DATA.reload();
    } else {
        // 只清任务状态，保留导演和目标的记录（用于后续恢复？一般不用）
        vdData.task = false;
        DATA.set("CameraDirector", vdData);
        DATA.reload();
    }
    return true;
}

/**
 * 切换导播目标到随机在线玩家
 */
function switchDirector() {
    const vdData = DATA.get("CameraDirector") || {};
    if (!vdData.task) return false;
    const directorName = vdData.director;
    const currentTarget = vdData.directedPlayer;
    const director = mc.getPlayer(directorName);
    if (!director) return false;
    const candidates = mc.getOnlinePlayers()
        .filter(p => !p.isSimulatedPlayer() && p.realName !== directorName && p.realName !== currentTarget);
    if (candidates.length === 0) {
        stopDirector();
        return false;
    }
    const newTarget = candidates[Math.floor(Math.random() * candidates.length)];
    // 重新启动（不保留位置，因为切换时应该重新定位）
    return startDirector(directorName, newTarget.realName);
}

// ==================== 导播表单 ====================
function sendVideoDirectorForm(player) {
    const form = mc.newCustomForm();
    form.setTitle("导播台");
    form.addLabel("请选择一个玩家进行导播追踪（越肩视角）：");
    const onlinePlayers = mc.getOnlinePlayers().filter(p => !p.isSimulatedPlayer() && p.realName !== player.realName);
    const names = onlinePlayers.map(p => p.realName).sort((a, b) => a.localeCompare(b));
    form.addDropdown("选择玩家", names);
    player.sendForm(form, (pl, id) => {
        if (id == null) return;
        const idx = id[1];
        if (idx < 0 || idx >= names.length) return;
        const targetName = names[idx];
        if (startDirector(pl.realName, targetName)) {
            pl.sendText(`§a开始导播追踪 ${targetName}（越肩视角）`);
        } else {
            pl.sendText(`§c无法开始导播追踪，请确保目标玩家在线。`);
        }
    });
}

// ==================== 持久化恢复（玩家加入时） ====================
function restorePlayerOnJoin(player) {
    if (!player || player.isSimulatedPlayer()) return;
    const uuid = player.uuid;
    // 检查是否有残留的监控状态
    const data = DATA.get("monitorStates") || {};
    if (data[uuid]) {
        const state = data[uuid];
        // 恢复游戏模式和位置（clearPlayerCamera 会做，但我们必须先清理相机，再恢复）
        // 直接调用 clearPlayerCamera 会从 data 中读取并恢复，然后删除记录。
        // 但这里我们手动做，避免重复清除相机。
        const pos = state.originalPos;
        const gm = state.originalGameMode;
        if (pos && isValidPos(pos)) {
            try {
                player.teleport(new FloatPos(pos.x, pos.y, pos.z, pos.dimid));
            } catch (e) { }
        }
        if (gm !== undefined && gm !== null) {
            try {
                player.setGameMode(gm);
            } catch (e) { }
        }
        // 清除相机（可能还残留）
        mc.runcmdEx(`camera "${player.realName}" set minecraft:first_person`);
        mc.runcmdEx(`camera "${player.realName}" clear`);
        player.runcmd(`camera @s clear`);
        // 删除记录
        delete data[uuid];
        DATA.set("monitorStates", data);
        DATA.reload();
        // 清除内存状态
        if (tickTimers.has(uuid)) {
            clearInterval(tickTimers.get(uuid));
            tickTimers.delete(uuid);
        }
        playerCamState.delete(uuid);
        monitorMap.delete(uuid);
        player.tell("§a检测到残留监控状态，已为你恢复游戏模式");
    }

    // 检查是否导播任务中的导演
    const vdData = DATA.get("CameraDirector") || {};
    if (vdData.task && vdData.director === player.realName) {
        // 导播任务存在，但导演刚刚上线，可能是服务器崩溃导致任务未清除
        // 清除任务，因为导演状态已被恢复
        vdData.task = false;
        vdData.director = "";
        vdData.directedPlayer = "";
        DATA.set("CameraDirector", vdData);
        DATA.reload();
        player.tell("§c检测到残导播任务，已自动清除");
    }
}

// ==================== 事件监听 ====================
mc.listen("onServerStarted", () => {
    // ---------- 注册 /cameradirector 指令 ----------
    const cmdCam = mc.newCommand("cameradirector", "打开越肩相机控制面板", PermType.GameMasters);
    cmdCam.setAlias("cam");
    cmdCam.overload([]);
    cmdCam.setCallback((_cmd, origin, out, _res) => {
        const pl = origin.player;
        if (!pl) return out.error("仅玩家可执行此指令");
        openCamMenu(pl);
    });
    cmdCam.setup();

    // ---------- 注册 /videodirector 指令 ----------
    const cmdVd = mc.newCommand("videodirector", "导播台指令", PermType.GameMasters);
    cmdVd.setAlias("vd");
    cmdVd.setEnum("Action", ["menu", "start", "switch", "stop"]);
    cmdVd.mandatory("action", ParamType.Enum, "Action", 1);
    cmdVd.overload(["Action"]);
    cmdVd.setCallback((_cmd, origin, out, res) => {
        const player = origin.player;
        const action = res.action;
        switch (action) {
            case "menu": {
                if (!player) return out.error("仅玩家可使用");
                sendVideoDirectorForm(player);
                break;
            }
            case "start": {
                if (DATA.get("CameraDirector").task) {
                    out.error("当前正在进行导播");
                    return;
                }
                if (player) {
                    const candidates = mc.getOnlinePlayers().filter(p => !p.isSimulatedPlayer() && p.realName !== player.realName);
                    if (candidates.length === 0) {
                        out.error("没有其他在线玩家");
                        return;
                    }
                    const target = candidates[Math.floor(Math.random() * candidates.length)];
                    if (startDirector(player.realName, target.realName)) {
                        out.success(`§a开始导播追踪 ${target.realName}`);
                    } else {
                        out.error("启动失败");
                    }
                } else {
                    // 控制台执行
                    const directorName = CONFIG.get("director");
                    const director = mc.getPlayer(directorName);
                    if (!director) {
                        out.error(`导播员 ${directorName} 不在线`);
                        return;
                    }
                    const candidates = mc.getOnlinePlayers().filter(p => !p.isSimulatedPlayer() && p.realName !== directorName);
                    if (candidates.length === 0) {
                        out.error("没有其他在线玩家");
                        return;
                    }
                    const target = candidates[Math.floor(Math.random() * candidates.length)];
                    if (startDirector(directorName, target.realName)) {
                        out.success(`§a开始导播追踪 ${target.realName}`);
                    } else {
                        out.error("启动失败");
                    }
                }
                break;
            }
            case "switch": {
                if (switchDirector()) {
                    const vd = DATA.get("CameraDirector");
                    out.success(`§a已切换至 ${vd.directedPlayer}`);
                } else {
                    out.error("切换失败或无导播任务");
                }
                break;
            }
            case "stop": {
                if (stopDirector()) {
                    out.success("§a已停止导播");
                } else {
                    out.error("当前未在导播中");
                }
                break;
            }
            default: out.error("未知子命令");
        }
    });
    cmdVd.setup();

    // ---------- 导播定时检查（每5秒） ----------
    setInterval(() => {
        const vdData = DATA.get("CameraDirector") || {};
        if (!vdData.task) return;
        const directorName = vdData.director;
        const targetName = vdData.directedPlayer;
        const director = mc.getPlayer(directorName);
        const target = mc.getPlayer(targetName);

        if (!director) {
            stopDirector();
            return;
        }
        if (!target) {
            // 尝试切换
            const candidates = mc.getOnlinePlayers().filter(p => !p.isSimulatedPlayer() && p.realName !== directorName);
            if (candidates.length) {
                const newTarget = candidates[Math.floor(Math.random() * candidates.length)];
                startDirector(directorName, newTarget.realName);
            } else {
                stopDirector();
            }
            return;
        }

        // 冷却检测
        const now = Date.now();
        if (now - lastRelocateTime < RELOCATE_COOLDOWN) return;

        const dist = Math.sqrt(
            (director.pos.x - target.pos.x) ** 2 +
            (director.pos.y - target.pos.y) ** 2 +
            (director.pos.z - target.pos.z) ** 2
        );
        const dimChanged = director.pos.dimid !== target.pos.dimid;
        if (dist > 150 || dimChanged) {
            lastRelocateTime = now;
            // 传送导播员到目标身后
            Director(director, target);
            // 清除相机
            mc.runcmdEx(`camera "${director.realName}" clear`);
            // 清除旧的定时器
            if (tickTimers.has(director.uuid)) {
                clearInterval(tickTimers.get(director.uuid));
                tickTimers.delete(director.uuid);
            }
            playerCamState.delete(director.uuid);
            // 清除旧的延迟任务
            if (pendingStartTask) {
                clearInterval(pendingStartTask);
                pendingStartTask = null;
            }
            // 延迟 3 秒后重新启动越肩视角（不保存新位置）
            pendingStartTask = setTimeout(() => {
                pendingStartTask = null;
                const vd = DATA.get("CameraDirector") || {};
                if (!vd.task || vd.director !== directorName || vd.directedPlayer !== targetName) return;
                const dirNow = mc.getPlayer(directorName);
                const tarNow = mc.getPlayer(targetName);
                if (dirNow && tarNow) {
                    enableRightShoulderCam(dirNow, tarNow, false);
                } else {
                    stopDirector();
                }
            }, 3000);
        }
    }, 5000);

    // ---------- 启动时清理可能残留的数据（导播任务） ----------
    // 如果导播任务开启，但导演不在线，清除任务（但保留监控状态？监控状态会在导演上线时恢复）
    const vdData = DATA.get("CameraDirector") || {};
    if (vdData.task) {
        const director = mc.getPlayer(vdData.director);
        if (!director) {
            // 导演不在线，清除任务，但监控状态保留（导演上线时恢复）
            vdData.task = false;
            vdData.director = "";
            vdData.directedPlayer = "";
            DATA.set("CameraDirector", vdData);
            DATA.reload();
        }
    }
});

// 玩家加入时恢复
mc.listen("onJoin", (player) => {
    restorePlayerOnJoin(player);
});

// ==================== 修正：玩家离开时无条件清除定时器和内存状态 ====================
mc.listen("onLeft", (player) => {
    if (player.isSimulatedPlayer()) return;
    const uuid = player.uuid;
    // 清除该玩家的所有定时器和内存状态（无论是否监控他人）
    if (tickTimers.has(uuid)) {
        clearInterval(tickTimers.get(uuid));
        tickTimers.delete(uuid);
    }
    playerCamState.delete(uuid);
    monitorMap.delete(uuid);
    // 注意：不调用 clearPlayerCamera 以避免清除持久化数据（保留以便重进恢复）
});

// 插件卸载清理
ll.onUnload(() => {
    // 清除所有定时器
    for (const timer of tickTimers.values()) {
        clearInterval(timer);
    }
    tickTimers.clear();
    playerCamState.clear();
    monitorMap.clear();

    // 如果有导播任务，清理并恢复导演状态
    const vdData = DATA.get("CameraDirector") || {};
    if (vdData.task) {
        const director = mc.getPlayer(vdData.director);
        if (director) {
            clearPlayerCamera(director);
            mc.runcmdEx(`camera "${director.realName}" set minecraft:first_person`);
            mc.runcmdEx(`camera "${director.realName}" clear`);
        }
        // 清除任务元数据，但保留监控状态（以便玩家上线恢复）
        vdData.task = false;
        vdData.director = "";
        vdData.directedPlayer = "";
        DATA.set("CameraDirector", vdData);
        DATA.reload();
    }

    // 不清理 monitorStates，因为玩家重进需要恢复
});

// ==================== 导出（供其他插件调用） ====================
ll.exports(enableRightShoulderCam, "CameraDirector", "enableRightShoulderCam");
ll.exports(clearPlayerCamera, "CameraDirector", "clearPlayerCamera");
ll.exports(startDirector, "CameraDirector", "startDirector");
ll.exports(stopDirector, "CameraDirector", "stopDirector");