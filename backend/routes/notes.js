const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Route 1: get all the notes using: GET "/api/notes/getUser". Login required.

router.get("/fetchAllNotes", fetchUser, async (req, res) => {
	try {
		const notes = await Notes.find({ user: req.user.id });
		res.json(notes);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error });
	}
});

// Route 2: add a note using: POST "/api/notes/addNote". Login required.

router.post(
	"/addNote",
	fetchUser,
	[
		body("title", "Invalid title.").isLength({ min: 3 }),
		body("description", "Invalid description.").isLength({ min: 5 })
	],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.status(400).json({ errors: errors.array() });
			}
			const { title, description, tags, date } = req.body;
			const note = new Notes({
				title,
				description,
				tags,
				date,
				user: req.user.id
			});
			const savedNote = await note.save();
			res.status(200).json({ savedNote });
		} catch (error) {
			console.log(error);
			res.status(500).json({ error });
		}
	}
);

// Route 3: update a note using: PUT "/api/notes/updateNote". Login required.

router.put(
	"/updateNote/:id",
	fetchUser,
	[
		body("title", "Invalid title.").isLength({ min: 3 }),
		body("description", "Invalid description.").isLength({ min: 5 })
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
		}
		let { title, description, tags } = req.body;
		const newNote = {};
		newNote.title = title ? title : {};
		newNote.description = description ? description : {};
		newNote.tags = tags ? tags : {};
		let note = await Notes.findById(req.params.id);
		if (!note) {
			return res.status(404).json({ error: "Not found" });
		}
		if (note.user.toString() !== req.user.id) {
			return res.status(401).json({ error: "Not allowed." });
		}
		note = await Notes.findByIdAndUpdate(
			req.params.id,
			{ $set: newNote },
			{ new: true }
		);
		res.status(200).json({ note });
	}
);

module.exports = router;
