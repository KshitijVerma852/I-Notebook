const jwt = require("jsonwebtoken");
const JWT_SECRET = "ehh";

const fetchUser = (req, res, next) => {
	const authToken = req.header("auth-token");
	try {
		if (!authToken) {
			res.status(401).json({error: "Unauthorized access"});
		}
		const data = jwt.verify(authToken, JWT_SECRET);
		req.user = data.user;
		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({error})
	}
}

module.exports = fetchUser;
