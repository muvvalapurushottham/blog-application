const { Router } = require("express");

const {
  handleSignin,
  handleSignup,
  handleCreateUser,
  handleUserLogin,
  handleUserLogout,
  handleAccountInfo,
  handleEditAccountInfo,
  uploadProfileImageMiddleware,
  uploadBlogImageMiddleware,
  handleUserBlogInfo,
  handleUserBlog,
  handleUserBlogUpdate,
  handleUserBlogDelete,
} = require("../controllers/user");
const router = Router();

router.get("/signin", handleSignin);

router.get("/signup", handleSignup);

router.get("/logout", handleUserLogout);

router.get("/accountInfo", handleAccountInfo);

router.post("/signup", handleCreateUser);

router.post("/signin", handleUserLogin);

router.post(
  "/accountInfo",
  uploadProfileImageMiddleware,
  handleEditAccountInfo
);

router.get("/userBlogInfo", handleUserBlogInfo);

router.get("/userBlog/:id", handleUserBlog);

router.post("/userBlog/:id", uploadBlogImageMiddleware, handleUserBlogUpdate);

router.post("/userBlog/delete/:id", handleUserBlogDelete);

module.exports = router;
