const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json([{ id: 1, name: "Sunset Hotel", stars: 4 }]);
});

module.exports = router;