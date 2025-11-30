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
        'https://bisselfie.uk',
        'https://www.bisselfie.uk'
    ],
    credentials: true
}));

// 📊 تحديد معدل الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

// 🏠 صفحة الرئيسية
app.get('/', (req, res) => {
    res.json({ 
        message: 'BLS Selfie Server - Active 🚀',
        domain: 'bisselfie.uk',
        repository: 'hakotennah31/bls_selvie',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// 📤 رفع جلسة
app.post('/api/sessions/upload', (req, res) => {
    try {
        const sessionData = req.body;
        
        // محاكاة حفظ الجلسة
        const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        console.log('📥 Session received:', sessionId);
        
        res.json({
            success: true,
            sessionId: sessionId,
            shareableUrl: `https://bisselfie.uk/s/${sessionId}`,
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

// 📥 استرجاع جلسة
app.get('/s/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    res.json({
        success: true,
        sessionId: sessionId,
        message: 'Session loaded successfully',
        data: {
            status: 'active',
            createdAt: new Date().toISOString(),
            url: 'https://algeria.blsspainglobal.com/appointment/liveness'
        }
    });
});

// 🚀 تشغيل الخادم
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ BLS Selfie Server running on port ${PORT}`);
    console.log(`🌐 Repository: hakotennah31/bls_selvie`);
    console.log(`🎯 Ready for: bisselfie.uk`);
});