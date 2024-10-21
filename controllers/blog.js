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
    console.error(`Error rendering addBlog page: ${error}`);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

async function handleAddBlog(req, res) {
  try {
    const { title, body } = req.body;

    if (!title || !body || !req.file) {
      return res.render("addBlog", {
        error: "All fields are required",
        user: req.user,
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
      error: "Error while adding blog, please try again later",
      user: req.user,
    });
  }
}

uploadMiddleware = upload.single("coverImage");

async function handleReadBlog(req, res) {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.redirect("/");
    }

    const blog = await Blog.findById(blogId).populate("createdBy");

    if (!blog) {
      return res.redirect("/");
    }

    const comments = await Comment.find({ blogId }).populate("createdBy");

    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (error) {
    console.error(`Error while reading blog: ${error}`);
    return res.status(500).render("blog", {
      error: "Error while reading blog, please try again later",
      user: req.user,
    });
  }
}

async function handleComment(req, res) {
  try {
    const { content } = req.body;
    const { blogId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.redirect("/");
    }

    if (!content || content.length < 4) {
      return res.redirect(`/blog/${blogId}`);
    }

    await Comment.create({
      content,
      blogId,
      createdBy: req.user._id,
    });

    return res.redirect(`/blog/${blogId}`);
  } catch (error) {
    console.error(`Error while adding comment: ${error}`);
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  handleAddNewBlog,
  handleAddBlog,
  uploadMiddleware,
  handleReadBlog,
  handleComment,
};
