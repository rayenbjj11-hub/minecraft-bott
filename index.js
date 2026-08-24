const mineflayer = require('mineflayer');
const http = require('http');

// ==================== [ خادم وهمي لإبقاء Render شغال ] ====================
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
res.write("Bot Anti-Ban 100% Active!");
res.end();
}).listen(PORT, () => {
console.log(`[+] Web server listening on port ${PORT}`);
});

// ==================== [ إعدادات السيرفر ] ====================
const CONFIG = {
host: 'ray_x111.aternos.me', // IP السيرفر متاعك
port: 33517, // البورت (تأكد منه من Aternos)
username: 'Player_Alex99', // اسم البوت
owner: 'YOUR_MINECRAFT_NAME', // اكتب اسم حسابك أنت في اللعبة
password: 'YourPassword123' // كلمة السر متاع البوت
};

let movementLoopTimeout = null;
let scheduledBreakTimeout = null;

function getRandomInt(min, max) {
return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startBot() {
console.log('[+] جاري الاتصال بالسيرفر بنظام المحاكاة البشرية...');

const bot = mineflayer.createBot({
host: CONFIG.host,
port: CONFIG.port,
username: CONFIG.username,
version: false,
checkTimeoutInterval: 45 * 1000,
hideErrors: true
});

bot.on('spawn', () => {
console.log(`[+] البوت (${bot.username}) دخل السيرفر بنجاح بصفة لاعب عادي.`);

if (movementLoopTimeout) clearTimeout(movementLoopTimeout);
startHumanizedBehavior(bot);
scheduleProactiveBreak(bot);
});

// تسجيل الدخول التلقائي مع التأخير لتبدو كلاعب بشري
bot.on('messagestr', (message) => {
const msg = message.toLowerCase();
if (msg.includes('/register')) {
setTimeout(() => bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`), getRandomInt(1000, 2500));
} else if (msg.includes('/login')) {
setTimeout(() => bot.chat(`/login ${CONFIG.password}`), getRandomInt(1000, 2500));
}
});

// التحكم بالأوامر الخاصة بك فقط
bot.on('chat', (username, message) => {
if (username !== CONFIG.owner) return;

const args = message.split(' ');
const command = args[0].toLowerCase();

switch (command) {
case '!status':
bot.chat(`HP: ${Math.round(bot.health)}/20 | Food: ${Math.round(bot.food)}/20`);
break;
case '!dropall':
for (const item of bot.inventory.items()) {
bot.tossStack(item).catch(() => {});
}
break;
}
});

// إعادة اتصال متدرجة (من 10 لـ 20 ثانية)
bot.on('end', (reason) => {
if (movementLoopTimeout) clearTimeout(movementLoopTimeout);
if (scheduledBreakTimeout) clearTimeout(scheduledBreakTimeout);

const reconnectDelay = getRandomInt(10000, 20000);
console.log(`[-] انقطع الاتصال (${reason}). إعادة محاولة الاتصال بعد ${reconnectDelay / 1000} ثانية...`);
setTimeout(startBot, reconnectDelay);
});

bot.on('error', (err) => {
console.log('[-] خطأ في شبكة الاتصال، جاري المحاولة لاحقاً...');
});
}

// سلوك حركات إنسان طبيعي
function startHumanizedBehavior(bot) {
function cycle() {
if (!bot.entity) return;

const actions = [
() => {
const dir = Math.random() > 0.5 ? 'forward' : 'back';
bot.setControlState(dir, true);
setTimeout(() => bot.setControlState(dir, false), getRandomInt(300, 1200));
},
() => {
const yaw = (Math.random() * Math.PI * 2) - Math.PI;
const pitch = (Math.random() * 0.4) - 0.2;
bot.look(yaw, pitch, false);
},
() => {
const action = Math.random() > 0.5 ? 'jump' : 'sneak';
bot.setControlState(action, true);
setTimeout(() => bot.setControlState(action, false), getRandomInt(200, 600));
},
() => {
bot.swingArm('mainhand');
},
() => {
bot.setQuickBarSlot(getRandomInt(0, 8));
},
() => {}
];

const randomAction = actions[getRandomInt(0, actions.length - 1)];
randomAction();

const nextInterval = getRandomInt(2500, 8000);
movementLoopTimeout = setTimeout(cycle, nextInterval);
}

cycle();
}

// استراحة بشرية أوتوماتيكية كل 3 ساعات
function scheduleProactiveBreak(bot) {
const threeHours = 3 * 60 * 60 * 1000;
scheduledBreakTimeout = setTimeout(() => {
console.log('[*] إجراء استراحة أمان بشرية...');
bot.quit();
}, threeHours + getRandomInt(0, 600000));
}

startBot();