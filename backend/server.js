const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin:      true,
    credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/fuel',     require('./routes/fuel'));
app.use('/api/reports',  require('./routes/reports'));


// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});