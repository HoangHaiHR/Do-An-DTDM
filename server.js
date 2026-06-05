const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose'); // 1. Tích hợp Mongoose

app.use(express.static('public'));

// 2. KẾT NỐI ĐẾN MONGODB ATLAS (Thay chuỗi kết nối của bạn vào đây)
// NHỚ: Thay <username> và <password> bằng tài khoản bạn tạo ở Bước 1
const MONGO_URI = "mongodb+srv://hoanghai006_db_server:<Hai@120906*>@hoanghai.73jerar.mongodb.net/?appName=HoangHai";

mongoose.connect(MONGO_URI)
  .then(() => console.log("👉 Đã kết nối thành công tới MongoDB Atlas Cloud!"))
  .catch(err => console.error("❌ Lỗi kết nối Database: ", err));

// 3. ĐỊNH NGHĨA KHUÔN MẪU DỮ LIỆU (Schema) ĐỂ LƯU TIN NHẮN
const MessageSchema = new mongoose.Schema({
    user: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);


io.on('connection', async (socket) => {
    console.log('Có người kết nối: ' + socket.id);

    // 4. LẤY LỊCH SỬ TIN NHẮN TỪ CLOUD DB VÀ GỬI CHO NGƯỜI MỚI VÀO
    try {
        const oldMessages = await Message.find().sort({ timestamp: 1 }).limit(50); // Lấy 50 tin gần nhất
        socket.emit('load_history', oldMessages);
    } catch (err) {
        console.error("Không lấy được lịch sử: ", err);
    }

    // Lắng nghe tin nhắn từ client
    socket.on('send_message', async (data) => {
        if (data.user !== "Hệ thống") {
            // 5. LƯU TIN NHẮN VÀO MONGODB CLOUD
            try {
                const newMessage = new Message({ user: data.user, text: data.text });
                await newMessage.save(); 
            } catch (err) {
                console.error("Lỗi khi lưu tin nhắn: ", err);
            }
        }
        
        // Phát tin nhắn đến tất cả mọi người
        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Người dùng đã ngắt kết nối');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server đang chạy ở port ${PORT}`);
});