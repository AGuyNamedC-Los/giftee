module.exports = (req, res, next) => {
	if (req.session.user.role != "user") {
		res.render("response.njk", {user: req.session.user, title: "Users Only", link: "/", message: "Sorry, only users may view this page", buttonMsg: "GO TO HOMEPAGE"});
	} else {
		next();
	}
};