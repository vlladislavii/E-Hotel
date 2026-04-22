const { Coupon } = require('../models');

exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }

        const coupon = await Coupon.findOne({ 
            where: { 
                number: code.toUpperCase(), 
            } 
        });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid or expired coupon code" });
        }

        res.status(200).json({ 
            percentage: coupon.percentage,
            message: "Coupon applied successfully" 
        });
    } catch (error) {
        res.status(500).json({ message: "Error validating coupon", error: error.message });
    }
};