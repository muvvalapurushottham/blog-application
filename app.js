require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;
const cookieParser = require("cookie-parser");

const { Blog } = require("./models/blog");

const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

const { User } = require("./models/user");
const { connectMongodb } = require("./connection");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const { TokenExpiredError } = require("jsonwebtoken");

//set view
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve("./public")));
app.use(checkForAuthenticationCookie("token"));

//connect mongoDB
connectMongodb(process.env.MONGO_URL).then(() => {
  console.log("MongoDb is connected");
});

app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });

    if (!allBlogs || allBlogs.length === 0) {
      res.render("noBlogs");
      console.log("No Blogs found");
    }
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving blogs");
  }
});

app.use("/user", userRouter);
app.use("/blog", blogRouter);
app.use((req, res, next) => {
  res.status(404).redirect("/");
});

app.listen(port, () => {
  console.log(`Server started at PORT: ${port}`);
});
