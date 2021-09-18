const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const JWT_SECRET = "ehh";

// Create a user using: POST "/api/auth/createUser". Doesn't require Auth.

router.post(
    "/createUser",
    [
        body("name", "Enter a vaild name.").isLength({ min: 3 }),
        body("email", "Enter a valid email.").isEmail(),
        body("password", "Enter a valid password.").isLength({ min: 5 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { name, email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user)
                return res
                    .status(400)
                    .json({ error: "A user with that email already exists." });
            // Hashing password
            const salt = await bcryptjs.genSalt();
            const hashedPassword = await bcryptjs.hash(password, salt);
            // Creating user
            user = await User.create({
                name,
                email,
                password: hashedPassword
            });
            // Generate JWT
            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.status(200).json({ authToken });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Internal server error." });
        }
    }
);

// Authenticating a user using POST "/api/auth/login". No login required

router.post(
    "/login",
    [
        body("email", "Enter a valid email.").isEmail(),
        body("password", "Password can't be blank.").exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user)
                return res
                    .status(400)
                    .json({ error: "Incorrect credentials." });
            // Comparing passwords
            const passwordCompare = await bcryptjs.compare(
                password,
                user.password
            );
            if (!passwordCompare)
                return res
                    .status(400)
                    .json({ error: "Incorrect credentials." });
            // Generating JWT
            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({ authToken });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Internal server error." });
        }
    }
);

module.exports = router;
