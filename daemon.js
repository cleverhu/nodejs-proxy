const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

// 下载二进制文件
function downloadBinary(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);
        });
    });
}

// 启动并监视二进制文件
function startAndMonitorBinary(binaryPath) {
    let proc = spawn(binaryPath, ['run']);

    proc.on('exit', function () {
        console.log('Process exited. Restarting...');
        proc = spawn(binaryPath, ['run']);
    });
}

// 下载并启动二进制文件
downloadBinary('https://github.com/cleverhu/nodejs-proxy/raw/master/myapp', 'myapp', function () {
    console.log('Binary downloaded. Starting...');
    startAndMonitorBinary('./myapp');
});