// server.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 إعدادات الأمان
app.use(helmet());
app.use(cors({
    origin: [
        'https://algeria.blsspainglobal.com',
        'https://blsselfie.uk',
        'https://www.blsselfie.uk'
    ],
    credentials: true
}));

// 📊 تحديد معدل الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

// 🏠 الصفحة الرئيسية
app.get('/', (req, res) => {
    res.json({ 
        message: 'BLS Selfie Server - Active 🚀',
        domain: 'blsselfie.uk',
        repository: 'hakotennah31/bls_selvie',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// 💾 قاعدة بيانات مؤقتة للجلسات
const sessionsDB = {}; // key: sessionId, value: session object

// 📤 رفع جلسة
app.post('/api/sessions/upload', (req, res) => {
    try {
        const sessionData = req.body;

        // إنشاء sessionId عشوائي
        const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // حفظ الجلسة في "DB"
        sessionsDB[sessionId] = {
            ...sessionData,
            sessionId,
            createdAt: new Date().toISOString(),
            url: 'https://algeria.blsspainglobal.com/appointment/liveness' // الرابط النهائي
        };

        console.log('📥 Session received:', sessionId);

        res.json({
            success: true,
            sessionId: sessionId,
            shareableUrl: `https://blsselfie.uk/s/${sessionId}`,
            message: 'Session exported successfully!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🔗 فتح رابط المشاركة (Redirect مباشر)
app.get('/s/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    const session = sessionsDB[sessionId];

    if (!session) {
        return res.status(404).send("Session not found");
    }

    // إعادة توجيه مباشر للرابط الأصلي
    return res.redirect(session.url);
});

// 🚀 تشغيل الخادم
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ BLS Selfie Server running on port ${PORT}`);
    console.log(`🌐 Repository: hakotennah31/bls_selvie`);
    console.log(`🎯 Ready for: blsselfie.uk`);
});
