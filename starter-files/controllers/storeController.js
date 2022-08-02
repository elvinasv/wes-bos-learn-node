const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "File type isn't allowed" }, false);
    }
  },
};

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add store" });
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash("success", `Store "${store.name}" successfully created!`);

  res.redirect(`/store/${store.slug}`);
};

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  // check if there's no new file to resize
  if (!req.file) {
    console.log("no file here");
    next();
    return;
  }

  const extension = req.file.mimetype.split("/")["1"];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  //once we have written the photo to our filesystem, keep going!
  next();
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render("stores", { title: "Stores", stores });
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });

  if (store) {
    res.render("store", { store, tite: store.name });
  } else {
    return next();
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render("editStore", { title: `Edit ${store.name}`, store: store });
};

exports.updateStore = async (req, res) => {
  // set the location point to be a point
  req.body.location.type = "Point";
  const store = await Store.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    req.body,
    {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }
  ).exec();
  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View store -> </a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoresByTag = async (req, res) => {
  const tags = await Store.getTagsList();
  const tag = req.params.tag;
  res.render("tag", { tags, title: "Tags", tag });
};
