const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 إعدادات الأمان
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));
app.use(express.json({ limit: '20mb' }));

// تخزين الجلسات مؤقتاً في الذاكرة (يمكن استبداله بقاعدة بيانات)
const sessions = {}; 

// 🏠 صفحة رئيسية
app.get('/', (req, res) => {
    res.json({ message: "BLS Selfie Server - Active 🚀", timestamp: new Date().toISOString() });
});

// 📤 رفع جلسة Admin
app.post('/api/sessions/upload', (req, res) => {
    try {
        const sessionData = req.body;
        const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
        sessions[sessionId] = { ...sessionData, selfies: [] };

        console.log(`📥 Session uploaded: ${sessionId}`);

        res.json({
            success: true,
            sessionId,
            shareableUrl: `https://blsselfie.uk/s/${sessionId}`,
            message: "Session exported successfully!",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 📥 استرجاع جلسة (HTML friendly)
app.get('/s/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = sessions[sessionId];

    if (!session) return res.status(404).send("Session not found");

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Session ${sessionId}</title>
            <style>
                body { font-family: Arial; display:flex; flex-direction:column; align-items:center; padding:20px; }
                .selfie-container { margin-top:20px; }
            </style>
        </head>
        <body>
            <h2>Session Loaded ✅</h2>
            <p><strong>Session ID:</strong> ${sessionId}</p>
            <p><strong>Status:</strong> active</p>
            <p><strong>Created At:</strong> ${session.timestamp || new Date().toISOString()}</p>

            <div class="selfie-container">
                <p>Take your selfie:</p>
                <video id="video" width="320" height="240" autoplay></video><br>
                <button id="capture">Capture & Send</button>
                <p id="status"></p>
            </div>

            <script>
                const video = document.getElementById("video");
                const captureBtn = document.getElementById("capture");
                const status = document.getElementById("status");

                navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                    video.srcObject = stream;
                });

                captureBtn.onclick = async () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 320;
                    canvas.height = 240;
                    canvas.getContext("2d").drawImage(video, 0, 0, 320, 240);
                    const selfieData = canvas.toDataURL("image/jpeg");

                    const res = await fetch("/s/${sessionId}/selfie", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ selfie: selfieData })
                    });

                    const data = await res.json();
                    if (data.success) {
                        status.textContent = "Selfie sent successfully!";
                    } else {
                        status.textContent = "Failed to send selfie.";
                    }
                };
            </script>
        </body>
        </html>
    `);
});

// 📤 رفع سيلفي من العميل
app.post('/s/:sessionId/selfie', (req, res) => {
    const { sessionId } = req.params;
    const { selfie } = req.body;
    const session = sessions[sessionId];

    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    session.selfies.push({ selfie, timestamp: new Date().toISOString() });
    console.log(`📸 Selfie received for session ${sessionId}`);

    // يمكن هنا إضافة إشعار للـ Admin (مثلاً Telegram / Webhook)
    // مثال بسيط: console.log
    console.log(`🔔 Admin notified: New selfie for session ${sessionId}`);

    res.json({ success: true, message: "Selfie uploaded successfully" });
});

// 🚀 تشغيل السيرفر
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ BLS Selfie Server running on port ${PORT}`);
});
