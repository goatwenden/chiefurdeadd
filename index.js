
const axios = require('axios');
const http = require('http');
const ws = require('ws');

const TOKEN = process.env.TOKEN;
const BASE_URL = 'https://discord.com/api/v9';
const USER_ID = '1520682184241975429';
const TARGET_ID = '1446641976538697759';

let renameActive = false;
let renameInterval = null;
let renameCount = 1;
let targetGC = null;

let spamActive = false;
let spamInterval = null;
let spamIndex = 0;
let targetChannel = null;

const messages = [
    '@target\nfight\nme\nfaggot',
    'yo\nvirtus\nur\nworthless\n@target',
    'garbo @target',
    'weak\nass\nvirgin\nass\nnigga\nnamed\nvirtus\nur\nmiserable\nas\nshit\nfucking\nfaggot',
    'yo virtus\nur\na\nfucking\nfaggot\n@target',
    'cringe faggot @target',
    'horrible as fuck @target',
    'yo virtus ur a loser @target',
    'yo virtus @target bitch',
    'cross\neyed\npedo\nass\nchild\nrapist\n@target',
    'yo virtus where u go',
    'yo virtus ur fucking ass @target',
    'shut\nthe\nfuck\nup\nright\nnow\npussy\nwake\nup\nvirtus\nloooool',
    'lame\nass\nweak\nnigga\nvirtus\nur\na\nfucking\nfaggot',
    'bitch @target',
    'virtus\nur\nfucking horrible\n@target',
    'shit\neater\nvirtus\n@target',
    'yo virtus ur a loser @target',
    'LOOOL',
    'faggot @target',
    'virtus @target',
    'yo\nvirtus\nshow\nme\nur\nwrist\nright\nnow\nshitty\nass\nfaggot',
    'LOOOOOOOOL',
    'virtus shut up pedo',
    'pedo virtus @target',
    'sorry\nass\nnigga\nvirtus\nur\nnot\nsafe\nfrom\nme\nweak\nvirgin\nass\nnigga',
    'virtus\nwake\nup\nand\nfight\nback\nfaggot\n@target',
    'yo virtus\nu\nstill\na\nprostitute\n@target',
    'yo\nvirtus\nur\nass\nshut\nthe\nfuck\nup\n@target',
    'virtus the com whore @target',
    'virtus aint u a pedo @target',
    'how u been pedo @target',
    'long time no see @target',
    'yo virtus @target',
    'yo\nvirtus\nshut\nthe\nfuck\nup\nwhore\nur\nbreasts\nfuckign\nstink\nnigga',
    'ur ass bitch @target\npedo named virtus',
    'virtus shut the fuck up pedo',
    'weak\nass\nvirgin\nnigga\nur\nmiserable\nas\nshit\nfucking\nfaggot\nvirtus',
    'harmless @target',
    'faggot ass @target',
    'absolute loser @target',
    'virtus ur pussy @target',
    'pedophile\nass\nchild\nrapist\nnigga\nnamed\nvirtus\nfaggot',
    'loser\nass\nnigga\nur\ntrash\n@target',
    'shitty dork ass nigga @target',
    'weak\nass\nnigga\nshut\nthe\nfuck\nup\nur\nshit\nfaggot',
    'wake\nup\nand\nshow\nme\nyour\nwrist\nright\nthe\nfuck\nnow\n@target',
    'zoophile @target',
    'necrophiliac @target',
    'weak\nass\nnigga\nvirtus\nshut\nthe\nfuck\nup\nur\nshit\nfaggot\nLOOOL',
    'wake\nup\nand\nfight\nback\nvirtus\nfaggot',
    'yo btw virtus ur actually shitty @target',
    'how u been pedo @target',
    'ur\nembarrassing\nurself\n@target',
    'yo virtus\n@target\ndisgusting\npedo',
    'faggot named virtus @target',
    'virtus\nur\nfucking horrible\n@target',
    'virtus shut the fuck up pedo @target',
    'wsg pedo virtus',
    'shitbreast @target',
    'pedo virtus @target',
    'nigga\nvirtus\nur\nass\nshut\nthe\nfuck\nup\nwhore\nur\nbreasts\nfucking\nstink\nloser\nass\nnigga\nLOOOL',
    'ur unloved @target',
    'social reject @target',
    'virtus\nthe\ncutslut\n@target',
    'virtus @target',
    'who asked faggot @target',
    'yo bitch @target',
    'stupid\nfaggot\nnamed\nvirtus\n@target',
    'ur a queer @target',
    'yo virtus where u go pedo @target'
];

const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('bot running');
}).listen(PORT, '0.0.0.0', () => {
    console.log('HTTP server on port ' + PORT);
});

setInterval(() => {
    http.get(`http://localhost:${PORT}`, (res) => {});
}, 240000);

const WebSocket = new ws('wss://gateway.discord.gg/?v=9&encoding=json');

let heartbeatInterval;
let seq = null;

WebSocket.on('open', () => {
    WebSocket.send(JSON.stringify({
        op: 2,
        d: {
            token: TOKEN,
            capabilities: 125,
            properties: {
                os: 'Windows',
                browser: 'Chrome',
                device: '',
                system_locale: 'en-US',
                browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                browser_version: '126.0.0.0',
                os_version: '10',
                release_channel: 'stable',
                client_build_number: 9999,
                client_event_source: null
            },
            presence: {
                status: 'online',
                since: null,
                activities: [],
                afk: false
            }
        }
    }));
});

WebSocket.on('message', async (data) => {
    const payload = JSON.parse(data);
    const { op, t, s, d } = payload;

    if (s) seq = s;

    switch (op) {
        case 10:
            heartbeatInterval = setInterval(() => {
                WebSocket.send(JSON.stringify({ op: 1, d: seq }));
            }, d.heartbeat_interval);
            break;

        case 0:
            if (t === 'MESSAGE_CREATE') {
                const msg = d;

                if (msg.author.id === USER_ID && !msg.content.startsWith('!goatwenden') && !msg.content.startsWith('$killvirtus') && !msg.content.startsWith('$stopkillvirtus')) {
                    axios.put(
                        `${BASE_URL}/channels/${msg.channel_id}/messages/${msg.id}/reactions/%F0%9F%94%AA/%40me`,
                        {},
                        { headers: { Authorization: TOKEN } }
                    ).then(() => console.log('🔪')).catch(() => {});
                }

                if (msg.mentions && msg.mentions.some(m => m.id === USER_ID)) {
                    axios.post(
                        `${BASE_URL}/channels/${msg.channel_id}/typing`,
                        {},
                        { headers: { Authorization: TOKEN } }
                    ).then(() => console.log('⌨️')).catch(() => {});
                }

                // Rename loop
                if (msg.author.id === USER_ID && msg.content === '!goatwenden') {
                    try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${msg.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {}

                    const channel = await axios.get(`${BASE_URL}/channels/${msg.channel_id}`, { headers: { Authorization: TOKEN } });
                    if (channel.data.type === 3) {
                        targetGC = msg.channel_id;
                        renameCount = 1;
                        renameActive = true;

                        const sent = await axios.post(`${BASE_URL}/channels/${msg.channel_id}/messages`, { content: '✅ Rename loop started' }, { headers: { Authorization: TOKEN } });
                        setTimeout(async () => { try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${sent.data.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {} }, 5000);

                        renameInterval = setInterval(async () => {
                            if (!renameActive || !targetGC) return;
                            try {
                                await axios.patch(`${BASE_URL}/channels/${targetGC}`, { name: `kick=fold, justiceK, virtusK, federalK ${renameCount}` }, { headers: { Authorization: TOKEN } });
                                console.log(`Renamed: ${renameCount}`);
                                renameCount++;
                            } catch (e) { console.log('Rename failed, retrying...'); }
                        }, 3000);
                    }
                }

                if (msg.author.id === USER_ID && msg.content === '!goatwenden stop') {
                    try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${msg.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {}
                    renameActive = false;
                    if (renameInterval) clearInterval(renameInterval);
                    targetGC = null;
                    const sent = await axios.post(`${BASE_URL}/channels/${msg.channel_id}/messages`, { content: '✅ Rename loop stopped' }, { headers: { Authorization: TOKEN } });
                    setTimeout(async () => { try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${sent.data.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {} }, 5000);
                }

                // Spam loop
                if (msg.author.id === USER_ID && msg.content === '$killvirtus') {
                    try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${msg.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {}

                    targetChannel = msg.channel_id;
                    spamIndex = 0;
                    spamActive = true;

                    const sent = await axios.post(`${BASE_URL}/channels/${msg.channel_id}/messages`, { content: '✅ Spam process started' }, { headers: { Authorization: TOKEN } });
                    setTimeout(async () => { try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${sent.data.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {} }, 5000);

                    spamInterval = setInterval(async () => {
                        if (!spamActive || !targetChannel) return;
                        try {
                            let msgToSend = messages[spamIndex].replace(/@target/g, `<@${TARGET_ID}>`);
                            await axios.post(`${BASE_URL}/channels/${targetChannel}/messages`, { content: msgToSend }, { headers: { Authorization: TOKEN } });
                            console.log(`Sent: ${spamIndex + 1}/${messages.length}`);
                            spamIndex++;
                            if (spamIndex >= messages.length) spamIndex = 0;
                        } catch (e) { console.log('Send failed, retrying...'); }
                    }, 1500);
                }

                if (msg.author.id === USER_ID && msg.content === '$stopkillvirtus') {
                    try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${msg.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {}
                    spamActive = false;
                    if (spamInterval) clearInterval(spamInterval);
                    targetChannel = null;
                    const sent = await axios.post(`${BASE_URL}/channels/${msg.channel_id}/messages`, { content: '✅ Spam process stopped' }, { headers: { Authorization: TOKEN } });
                    setTimeout(async () => { try { await axios.delete(`${BASE_URL}/channels/${msg.channel_id}/messages/${sent.data.id}`, { headers: { Authorization: TOKEN } }); } catch (e) {} }, 5000);
                }
            }
            break;
    }
});
