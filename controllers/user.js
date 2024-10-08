const multer = require("multer");
const path = require("path");
const { User } = require("../models/user");
const { Blog } = require("../models/blog");
const { error } = require("console");

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

    return res
      .status(201)
      .redirect("/");
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

    console.log(req.user._id, "req.user.id");
    const user = await User.findOne({ email: currentUserEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(req.file, "req.file");
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    if (req.file && req.file.filename) {
      user.profileImageUrl = `/uploads/${req.file.filename}`;
    } else {
      user.profileImageUrl = user.profileImageUrl;
    }
    if (password) {
      user.password = password;
    }

    await user.save();

    return res.status(200).redirect("/");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

uploadMiddleware = upload.single("profileImage");

async function handleUserLogout(req, res) {
  res.clearCookie("token").redirect("/");
}

async function handleUserBlog(req, res) {
  try {
    if (!req.user) {
      console.log(req.user._id, "req.user._id");
      return res.status(400).send("Invalid User ID");
    }

    const allBlogs = await Blog.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    if (!allBlogs || allBlogs.length === 0) {
      console.log("No Blogs found");
    }

    res.render("userBlogs", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving blogs");
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
  handleUserBlog,
};
