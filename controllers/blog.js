const multer = require('multer');
const { Blog } = require('../models/blog');
const Comment = require('../models/comment');

async function handleAddNewBlog(req, res) {
  return res.render('addBlog', {
    user: req.user,
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/uploads/`);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
})

const upload = multer({ storage: storage })

async function handleAddBlog(req, res) {


  const { title, body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageUrl: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
}

uploadMiddleware = upload.single('coverImage');

async function handleReadBlog(req, res) {

  const blog = await Blog.findById(req.params.id).populate('createdBy');
  const comments = await Comment.find({ blogId: req.params.id}).populate('createdBy')
  console.log(comments, 'comment');
  return res.render('blog', {
    user: req.user,
    blog: blog,
    comments: comments,
  });
}


async function handleComment (req, res) {

  const comment = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  console.log(comment, 'comment');
  return res.redirect(`/blog/${req.params.blogId}`);
}

module.exports = {
  handleAddNewBlog,
  handleAddBlog,
  uploadMiddleware,
  handleReadBlog,
  handleComment
}