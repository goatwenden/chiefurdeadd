const axios = require('axios');
const http = require('http');
const ws = require('ws');

const TOKEN = process.env.TOKEN;
const BASE_URL = 'https://discord.com/api/v9';
const USER_ID = '1522918155444551701';
const TARGET_ID = '1479204404262473845';

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
    'yo\nchief\nur\nworthless\n@target',
    'garbo @target',
    'weak\nass\nvirgin\nass\nnigga\nnamed\nchief\nur\nmiserable\nas\nshit\nfucking\nfaggot',
    'yo chief\nur\na\nfucking\nfaggot\n@target',
    'cringe faggot @target',
    'horrible as fuck @target',
    'yo chief ur a loser @target',
    'yo chief @target bitch',
    'cross\neyed\npedo\nass\nchild\nrapist\n@target',
    'yo chief where u go',
    'yo chief ur fucking ass @target',
    'shut\nthe\nfuck\nup\nright\nnow\npussy\nwake\nup\nchief\nloooool',
    'lame\nass\nweak\nnigga\nchief\nur\na\nfucking\nfaggot',
    'bitch @target',
    'chief\nur\nfucking horrible\n@target',
    'shit\neater\nchief\n@target',
    'yo chief ur a loser @target',
    'LOOOL',
    'faggot @target',
    'chief @target',
    'yo\nchief\nshow\nme\nur\nwrist\nright\nnow\nshitty\nass\nfaggot',
    'LOOOOOOOOL',
    'chief shut up pedo',
    'pedo chief @target',
    'sorry\nass\nnigga\nchief\nur\nnot\nsafe\nfrom\nme\nweak\nvirgin\nass\nnigga',
    'chief\nwake\nup\nand\nfight\nback\nfaggot\n@target',
    'yo chief\nu\nstill\na\nprostitute\n@target',
    'yo\nchief\nur\nass\nshut\nthe\nfuck\nup\n@target',
    'chief the com whore @target',
    'chief aint u a pedo @target',
    'how u been pedo @target',
    'long time no see @target',
    'yo chief @target',
    'yo\nchief\nshut\nthe\nfuck\nup\nwhore\nur\nbreasts\nfucking\nstink\nnigga',
    'ur ass bitch @target\npedo named chief',
    'chief shut the fuck up pedo',
    'weak\nass\nvirgin\nnigga\nur\nmiserable\nas\nshit\nfucking\nfaggot\nchief',
    'harmless @target',
    'faggot ass @target',
    'absolute loser @target',
    'chief ur pussy @target',
    'pedophile\nass\nchild\nrapist\nnigga\nnamed\nchief\nfaggot',
    'loser\nass\nnigga\nur\ntrash\n@target',
    'shitty dork ass nigga @target',
    'weak\nass\nnigga\nshut\nthe\nfuck\nup\nur\nshit\nfaggot',
    'wake\nup\nand\nshow\nme\nyour\nwrist\nright\nthe\nfuck\nnow\n@target',
    'zoophile @target',
    'necrophiliac @target',
    'weak\nass\nnigga\nchief\nshut\nthe\nfuck\nup\nur\nshit\nfaggot\nLOOOL',
    'wake\nup\nand\nfight\nback\nchief\nfaggot',
    'yo btw chief ur actually shitty @target',
    'how u been pedo @target',
    'ur\nembarrassing\nurself\n@target',
    'yo chief\n@target\ndisgusting\npedo',
    'faggot named chief @target',
    'chief\nur\nfucking horrible\n@target',
    'chief shut the fuck up pedo @target',
    'wsg pedo chief',
    'shitbreast @target',
    'pedo chief @target',
    'nigga\nchief\nur\nass\nshut\nthe\nfuck\nup\nwhore\nur\nbreasts\nfucking\nstink\nloser\nass\nnigga\nLOOOL',
    'ur unloved @target',
    'social reject @target',
    'chief\nthe\ncutslut\n@target',
    'chief @target',
    'who asked faggot @target',
    'yo bitch @target',
    'stupid\nfaggot\nnamed\nchief\n@target',
    'ur a queer @target',
    'yo chief where u go pedo @target'
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

                if (msg.author.id === USER_ID && !msg.content.startsWith('!goatwenden') && !msg.content.startsWith('$killchief') && !msg.content.startsWith('$stopkillchief')) {
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
                                await axios.patch(`${BASE_URL}/channels/${targetGC}`, { name: `kick=fold, justiceK, chiefK, federalK ${renameCount}` }, { headers: { Authorization: TOKEN } });
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
                if (msg.author.id === USER_ID && msg.content === '$killchief') {
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

                if (msg.author.id === USER_ID && msg.content === '$stopkillchief') {
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
