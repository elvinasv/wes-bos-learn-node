const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "Email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req
    .checkBody("password", "Password cannot be less than 4 characters")
    .isLength({ min: 4 });
  req
    .checkBody("password-confirm", "Password cannot be less than 4 characters")
    .isLength({ min: 4 });
  req
    .checkBody("password-confirm", "Oops! Passwords do not match")
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash(
      "error",
      errors.map((err) => err.msg)
    );

    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash(),
    });

    return; // stop the fn from running
  }

  next(); // no errors - continue
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
  });

  const register = promisify(User.register, User);
  await register(user, req.body.password);

  next();
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit your account" });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    {
      new: true, // return the new store instead of the old one
      runValidators: true,
      context: "query",
    }
  );

  req.flash("success", "Updated the profile!");
  // Go to the previous page
  res.redirect("back");
};
