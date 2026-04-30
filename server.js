const express = require('express');
const cors = require('cors');
const path = require('path');
const { analyzeDocuments } = require('./lcs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/compare', (req, res) => {
    try {
        const { text1, text2 } = req.body;
        
        if (typeof text1 !== 'string' || typeof text2 !== 'string') {
            return res.status(400).json({ error: 'Both text1 and text2 must be provided as strings.' });
        }

        const result = analyzeDocuments(text1, text2);
        res.json(result);
    } catch (error) {
        console.error('Error in /api/compare:', error);
        res.status(500).json({ error: 'Internal server error processing documents.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
