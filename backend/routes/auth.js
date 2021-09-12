const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "ehh";

// Create a user using: POST "/api/auth/createUser". Doesn't require Auth.

router.post(
    "/createUser",
    [
        body("email", "Please enter a valid email").isEmail(),
        body("name", "Please enter a valid name.").isLength({ min: 3 }),
        body("password", "Please enter a valid password.").isLength({ min: 5 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Creating user
            let user = await User.findOne({ email: req.body.email });
            if (user)
                return res
                    .status(400)
                    .json({ error: "A user with this email already exists." });
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email
            });
            // Creating JWT
            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({authToken});
        } catch (err) {
            console.error(err.message);
            res.status(500).send("An error occured.");
        }
    }
);

module.exports = router;
