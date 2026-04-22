const { Cashier } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const cashier = await Cashier.findOne({ where: { username } });
        if (!cashier) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, cashier.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { CNP: cashier.CNP, username: cashier.username },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            cashier: {
                name: cashier.name,
                username: cashier.username,
                CNP: cashier.CNP
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { CNP, name, username, password } = req.body;

        const existingCashier = await Cashier.findOne({ where: { username } });
        if (existingCashier) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newCashier = await Cashier.create({
            CNP,
            name,
            username,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Cashier registered successfully",
            cashier: {
                username: newCashier.username,
                name: newCashier.name
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error registering cashier", error: error.message });
    }
};

exports.deleteCashier = async (req, res) => {
    try {
        const { cnp } = req.params;
        
        const cashier = await Cashier.findOne({ where: { CNP: cnp } });

        if (!cashier) {
            return res.status(404).json({ message: "Cashier was not found." });
        }

        await cashier.destroy();

        res.status(200).json({ message: `Cashier ${cashier.name} was deleted.` });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};