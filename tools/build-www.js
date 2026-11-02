// Gathers what the Android app needs into www/. The site itself runs straight
// from the project folder, so only the APK build uses this.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www);
fs.copyFileSync(path.join(root, 'index.html'), path.join(www, 'index.html'));
['shared', 'games'].forEach((dir) => fs.cpSync(path.join(root, dir), path.join(www, dir), { recursive: true }));
fs.cpSync(path.join(root, 'assets', 'fonts'), path.join(www, 'assets', 'fonts'), { recursive: true });
fs.copyFileSync(path.join(root, 'assets', 'icon.svg'), path.join(www, 'assets', 'icon.svg'));
