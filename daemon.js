// const https = require('https');
// const fs = require('fs');
// const { spawn } = require('child_process');

// // 启动并监视二进制文件
// function startAndMonitorBinary(binaryPath) {
//     let proc = spawn(binaryPath, ['run']);

//     proc.on('exit', function () {
//         console.log('Process exited. Restarting...');
//         proc = spawn(binaryPath, ['run']);
//     });
// }

// // 下载并启动二进制文件

// startAndMonitorBinary('./myapp');

const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const tmpDir = os.tmpdir();
const binaryPath = path.join(tmpDir, 'myapp');

// 下载二进制文件
function downloadBinary(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    const request = https.get(url, function (response) {
        // 检查响应状态码是否表示成功
        if (response.statusCode === 200) {
            response.pipe(file);
        } else {
            file.close();
            fs.unlink(dest, () => { }); // 如果下载失败，删除创建的文件
            cb(new Error(`下载失败，服务器响应状态码：${response.statusCode}`));
            return;
        }

        file.on('finish', function () {
            file.close(() => {
                // 文件成功关闭后，改变文件权限
                fs.chmod(dest, '755', (err) => {
                    if (err) {
                        cb(new Error(`改变文件权限失败: ${err.message}`));
                    } else {
                        cb(null); // 成功，没有错误
                    }
                });
            });
        });
    });

    // 处理请求错误（例如，DNS解析错误、TCP级错误或实际的HTTP解析错误）
    request.on('error', function (err) {
        file.close();
        fs.unlink(dest, () => { }); // 出错时删除文件
        cb(err);
    });

    // 处理文件流错误（例如，文件写入错误）
    file.on('error', function (err) {
        file.close();
        fs.unlink(dest, () => { }); // 出错时删除文件
        cb(err);
    });
}

// 启动并监视二进制文件
function startAndMonitorBinary(binaryPath) {

    let proc = spawn(binaryPath, ['run']);

    proc.on('exit', function () {
        console.log('Process exited. Restarting...');
        startAndMonitorBinary(binaryPath)
    });
}

// 下载并启动二进制文件
downloadBinary('https://raw.githubusercontent.com/cleverhu/nodejs-proxy/master/myapp', binaryPath, function () {
    console.log('Binary downloaded. Starting...');
    startAndMonitorBinary(binaryPath);
});
const http = require('http');
const httpProxy = require('http-proxy');

// 创建一个代理服务器
const proxy = httpProxy.createProxyServer({});

// 创建一个普通的HTTP服务器，用于处理WebSocket升级请求
const server = http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('This server handles WebSocket requests');
});

// 监听 'upgrade' 事件，处理WebSocket请求
server.on('upgrade', function(req, socket, head) {
  // 代理WebSocket请求到 localhost:3000
  try{
    proxy.ws(req, socket, head, {
        target: 'ws://localhost:3000/',
        ws: true
      });
  }catch(e){
    console.log(e);
  }
});

// 监听端口，你可以根据需要更改端口号
server.listen(8080, function() {
  console.log('Proxy server listening on port 8080');
});
