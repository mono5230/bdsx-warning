// 본 플러그인은 MIT 라이센스가 있습니다.
// 만든사람: mumyung (https://omlet.gg/profile/mumyung1507)

// This plugin is licensed under MIT.
// Created by: mumyung (https://omlet.gg/profile/mumyung1507)

import { ActorCommandSelector, CommandPermissionLevel } from "bdsx/bds/command";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { CxxString, int32_t } from "bdsx/nativetype";
import * as fs from "fs"

// 경고가 몇이면 자동으로 밴 할지 써주세요. (권장: 5)

const warningban = 5

//////////////////////////////////////////////////

// 밴 메시지

const BanTitle = "§l§c당신은 경고가 5회가 넘어 서버에서 차단 당했습니다!"

/////////////////////////////////////////////////

//밴을 풀려면 해당 유저파일을 지우세요!

events.packetAfter(MinecraftPacketIds.Login).on((ev, ni) => {
    const Conq = ev.connreq
    if (Conq === null) return;
    const cert = Conq.cert
    const username = cert.getId();
    const UserJSON = `../plugins/warning/Warningplayer/${username}.json`

    let Save = {};
    Save = { deviceId: Conq.getDeviceId(), playerName: username, warning: 0 }
    !fs.existsSync(UserJSON) ? fs.writeFileSync(UserJSON, JSON.stringify(Save)) : null;

    const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))

    if (read.warning >= warningban) {
        bedrockServer.serverInstance.disconnectClient(ni, BanTitle)
    }
})

command.register("경고", "플레이어에게 경고를 줍니다.", CommandPermissionLevel.Operator).overload((params, origin, output) => {
    for(const player of params.WarningPlayer.newResults(origin, ServerPlayer)) {
        if (params.WarningPlayer !== undefined) {
            const actor = origin.getEntity();
            if (actor?.isPlayer()) {
                let ni = actor.getNetworkIdentifier();
                const UserJSON = `../plugins/warning/Warningplayer/${params.WarningPlayer.getName()}.json`
                const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"));
                if (params.WarningNumber < 0) {
                    bedrockServer.executeCommand(`tellraw "${actor.getName()}" {"rawtext":[{"text":"§l§d[ §fServer §d] §r: 음수는 쓸수없습니다!"}]}`)
                } else {
                    let addwarning = {};
                    addwarning = { deviceId: player.deviceId, playerName: params.WarningPlayer.getName(), warning: read.warning + params.WarningNumber }
                    fs.writeFileSync(UserJSON, JSON.stringify(addwarning))

                    const read1 = JSON.parse(fs.readFileSync(UserJSON, "utf8"));

                    bedrockServer.executeCommand(`tellraw @a[name=!"${params.WarningPlayer.getName()}"] {"rawtext":[{"text":"§l§d[ §fServer §d] §r: ${params.WarningPlayer.getName()}님이 관리자에 의해 경고를 당했습니다. 사유: ${params.message}"}]}`)
                    bedrockServer.executeCommand(`tellraw "${params.WarningPlayer.getName()}" {"rawtext":[{"text":"§l§d[ §fServer §d] §r: 당신은 관리자에 의해 경고를 당했습니다. 이유: ${params.message} §c현재 경고 수: §f( ${read1.warning}/${warningban} )"}]}`)

                    if (read1.warning >= warningban) {
                        bedrockServer.serverInstance.disconnectClient(ni, BanTitle)
                        bedrockServer.executeCommand(`tellraw @a {"rawtext":[{"text":"§l§d[ §fServer §d] §r: ${params.WarningPlayer.getName()}님이 관리자에 의해 밴당했습니다."}]}`)
                    }
                }
            }
        }
    }
}, {
    WarningPlayer: ActorCommandSelector,
    WarningNumber: int32_t,
    message: CxxString,
})

command.register("경고확인", "플레이어의 경고를 확인 합니다.").overload((params, origin, output) => {
    for(const player of params.target.newResults(origin, ServerPlayer)) {
        if (params.target !== undefined) {
            const actor = origin.getEntity();
            if (actor?.isPlayer()) {
                let ni = actor.getNetworkIdentifier();
                const UserJSON = `../plugins/warning/Warningplayer/${params.target.getName()}.json`
                const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))

                bedrockServer.executeCommand(`tellraw "${ni.getActor()?.getName()}" {"rawtext":[{"text":"${read.playerName}님의 경고 횟수: ${read.warning}"}]}`)
            }
        }
    }
}, {
    target: ActorCommandSelector
})

command.register("경고차감", "플레이어의 경고를 차감 시킵니다.", CommandPermissionLevel.Operator).overload((params, o, op) => {
    for(const player of params.target.newResults(o, ServerPlayer)) {
        if (params.target !== undefined) {
            const actor = o.getEntity();
            if (actor?.isPlayer()) {
                let ni = actor.getNetworkIdentifier();
                const UserJSON = `../plugins/warning/Warningplayer/${params.target.getName()}.json`
                const read = JSON.parse(fs.readFileSync(UserJSON, "utf8"))

                if (params.WarningScore < 0) {
                    bedrockServer.executeCommand(`tellraw "${actor.getName()}" {"rawtext":[{"text":"§l§d[ §fServer §d] §r: 음수는 쓸수없습니다!"}]}`)
                } else {
                    let deletewarning = {};
                    deletewarning = { deviceId: player.deviceId, playerName: player.getName(), warning: read.warning - params.WarningScore }
                    fs.writeFileSync(UserJSON, JSON.stringify(deletewarning))
    
                    const read1 = JSON.parse(fs.readFileSync(UserJSON, "utf8"))

                    if (read.warning < 0) {
                        let reCreate = {};
                        reCreate = { deviceId: player.deviceId, playerName: params.target, warning: 0 }
                        fs.writeFileSync(UserJSON, JSON.stringify(reCreate))

                        bedrockServer.executeCommand(`tellraw "${params.target.getName()}" {"rawtext":[{"text":"§l§d[ §fServer §d] §r: 당신의 경고가 ${params.WarningScore}차감 되었습니다! §c현재 경고 수: §f( ${read1.warning}/${warningban} )"}]}`)
                        bedrockServer.executeCommand(`tellraw "${actor.getName()}" {"rawtext":[{"text":"§l§d[ §fServer §d] §r: 해당 유저의 경고가 음수이기때문에 0으로 바꿨습니다! §c해당 유저의 현재 경고 수: §f( ${read1.warning}/${warningban} )"}]}`)
                    } else {
                        bedrockServer.executeCommand(`tellraw "${params.target.getName()}" {"rawtext":[{"text":"§l§d[ §fServer §d] §r: 당신의 경고가 ${params.WarningScore}차감 되었습니다! §c현재 경고 수: §f( ${read1.warning}/${warningban} )"}]}`)
                    }
                }
            }
        }
    }
}, {
    target: ActorCommandSelector,
    WarningScore: int32_t
})
