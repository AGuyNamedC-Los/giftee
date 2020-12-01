module.exports = (req, res, next) => {
	if (!req.session.user) {
		req.session.user = {
            role: "guest", 
            firstname: "", 
            lastname: "", 
            email: "", 
            username: ""
        };
	}
	next();
};