const multer = require("multer");
const { Blog } = require("../models/blog");
const Comment = require("../models/comment");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/uploads/`);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

async function handleAddNewBlog(req, res) {
  try {
    return res.render("addBlog", {
      user: req.user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function handleAddBlog(req, res) {
  try {
    const { title, body } = req.body;

    if (!title || !body || !req.file) {
      req.render("addBlog", {
        error: "All fields are required",
      });
    }

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageUrl: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error(`Error adding blog: ${error.message}`);
    return res.status(500).render("addBlog", {
      error: "Error while adding blog, Please try again later",
      user: req.user,
    });
  }
}

uploadMiddleware = upload.single("coverImage");

async function handleReadBlog(req, res) {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate(
      "createdBy"
    );
    return res.render("blog", {
      user: req.user,
      blog: blog,
      comments: comments,
    });
  } catch (error) {
    console.error(`Error while reading blog: error.message`);
    return res.status(500).render("blog", {
      error: "Error while reading blog please try again later",
      user: req.user,
    });
  }
}

async function handleComment(req, res) {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  handleAddNewBlog,
  handleAddBlog,
  uploadMiddleware,
  handleReadBlog,
  handleComment,
};
