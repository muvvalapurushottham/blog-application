const { Router } = require('express');
const { handleAddNewBlog, handleAddBlog, uploadMiddleware, handleReadBlog, handleComment } = require('../controllers/blog');

const router = Router();

router.get('/add-new-blog', handleAddNewBlog);

router.get('/:id', handleReadBlog);

router.post('/', uploadMiddleware, handleAddBlog);

router.post('/comment/:blogId', handleComment);

module.exports = router;