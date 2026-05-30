const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

// Phục vụ các file tĩnh ở thư mục 'public' (giao diện)
app.use(express.static('public'));

// Lắng nghe kết nối từ người dùng
io.on('connection', (socket) => {
    console.log('Có người kết nối: ' + socket.id);

    // Lắng nghe tin nhắn từ một client
    socket.on('send_message', (data) => {
        // Gửi lại tin nhắn đó cho tất cả mọi người khác
        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Người dùng đã ngắt kết nối');
    });
});

// Render yêu cầu ứng dụng chạy trên Port do họ cấp, hoặc mặc định 3000 ở local
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server đang chạy ở port ${PORT}`);
});