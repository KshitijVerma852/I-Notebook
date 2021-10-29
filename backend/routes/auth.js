const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const fetchUser = require("../middleware/fetchUser");

const JWT_SECRET = "ehh";

// ROUTE 1: Create a user using: POST "/api/auth/createUser". Doesn't require Auth.

router.post(
	"/createUser",
	[
		// Validating the request.
		body("name", "Invalid name.").isLength({ min: 3 }),
		body("email", "Invalid email.").isEmail(),
		body("password", "Invalid password.").isLength({ min: 5 })
	],
	async (req, res) => {
		const { name, email, password } = req.body;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ error: "Invalid credentials." });
		}
		// Creating new user.
		try {
			// Hashing password
			const salt = await bcryptjs.genSalt();
			const hashedPassword = await bcryptjs.hash(password, salt);
			user = await User.create({
				name,
				email,
				password: hashedPassword
			});
			// Generating JWT
			const payload = {
				user: {
					id: user.id
				}
			};
			const authToken = jwt.sign(payload, JWT_SECRET);
			res.status(200).json({ authToken });
		} catch (error) {
			console.log(error);
			res.status(500).json({ error });
		}
	}
);

// ROUTE 2: Authenticating a user using POST "/api/auth/login". No login required

router.post(
	"/login",
	[
		// Validating the request.
		body("email", "Invalid email.").isEmail(),
		body("password", "Invalid password.").isLength({ min: 5 })
	],
	async (req, res) => {
		const { email, password } = req.body;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
		}
		const user = await User.findOne({ email });
		// Logging the user in.
		try {
			// Verifying the user.
			const exists = await bcryptjs.compare(password, user.password);
			if (exists) {
				// Generate JWT
				const payload = {
					user: {
						id: user.id
					}
				};
				const authToken = jwt.sign(payload, JWT_SECRET);
				res.status(200).json({ authToken });
			} else {
				res.status(400).json({ error: "Invalid credentials." });
			}
		} catch (error) {
			console.log(error);
			res.status(500).json({ error });
		}
	}
);

// ROUTE 3: Get logged in user details using: POST "/api/auth/getUser". Login required.

router.post("/getUser", fetchUser, async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select("-password");
		console.log(user);
		res.status(200).json({ user });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error });
	}
});

module.exports = router;
