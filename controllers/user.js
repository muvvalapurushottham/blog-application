const multer = require("multer");
const path = require("path");
const { User } = require("../models/user");
const { Blog } = require("../models/blog");
const { error, log } = require("console");

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

async function handleSignin(req, res) {
  try {
    return res.render("signin");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function handleSignup(req, res) {
  return res.render("signup");
}

async function handleCreateUser(req, res) {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.render("signup", {
        alert: "All fields are required",
        email,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.render("signup", {
        alert: "User with this email already exists!",
      });
    }

    await User.create({
      fullName,
      email,
      password,
    });

    return res.status(201).redirect("/");
  } catch (error) {
    console.error("Error creating user: ", error);
    return res.render("signup", {
      alert: "An error occurred while creating the user. Please try again.",
    });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.render("signin", {
      error: "All fields are required!",
    });
  }

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
}

async function handleAccountInfo(req, res) {
  res.render("accountInfo", { user: req.user });
}

async function handleEditAccountInfo(req, res) {
  try {
    const { fullName, email, password } = req.body;
    const currentUserEmail = req.user.email;

    const user = await User.findOne({ email: currentUserEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    if (req.file && req.file.filename) {
      user.profileImageUrl = `/uploads/${req.file.filename}`;
    }
    if (password) {
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(user._id);
    const allBlogs = await Blog.find({ createdBy: user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).render("home", {
      user: updatedUser,
      blogs: allBlogs,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const uploadMiddleware = upload.single("profileImage");

async function handleUserLogout(req, res) {
  res.clearCookie("token").redirect("/");
}

async function handleUserBlogInfo(req, res) {
  try {
    if (!req.user) {
      return res.status(400).send("Invalid User ID");
    }

    const user = await User.findById(req.user._id);
    const allBlogs = await Blog.find({ createdBy: user._id }).sort({
      createdAt: -1,
    });

    res.render("userBlogInfo", {
      user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving blogs");
  }
}

async function handleUserBlog(req, res) {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    return res.render("userBlog", {
      user: req.user,
      blog: blog,
    });
  } catch (error) {
    console.error(`Error while reading blog: ${error.message}`);
    return res.status(500).render("blog", {
      error: "Error while reading blog please try again later",
      user: req.user,
    });
  }
}

async function handleUserBlogUpdate(req, res) {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.render("userBlog", {
        error: "Title and body are required",
        blog: { title, body },
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).render("userBlog", {
        error: "Blog not found",
        user: req.user,
      });
    }

    const updateData = {
      title,
      body,
      createdBy: req.user._id,
    };

    if (req.file) {
      updateData.coverImageUrl = `/uploads/${req.file.filename}`;
    } else {
      updateData.coverImageUrl = blog.coverImageUrl;
    }

    await Blog.findByIdAndUpdate(req.params.id, updateData);

    const updatedBlog = await Blog.findById(req.params.id);

    return res.status(200).render("userBlog", {
      user: req.user,
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(`Error updating blog: ${error.message}`);
    return res.status(500).render("userBlog", {
      error: "Error while updating blog, please try again later",
      user: req.user,
    });
  }
}

async function handleUserBlogDelete(req, res) {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(`Error deleting blog: ${error.message}`);
    return res.status(500).json({ message: "Error deleting blog" });
  }
}

module.exports = {
  handleSignin,
  handleSignup,
  handleCreateUser,
  handleUserLogin,
  handleUserLogout,
  handleAccountInfo,
  handleEditAccountInfo,
  uploadMiddleware,
  handleUserBlogInfo,
  handleUserBlog,
  handleUserBlogUpdate,
  handleUserBlogDelete,
};
