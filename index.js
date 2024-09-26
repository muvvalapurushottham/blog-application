const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');

const { Blog } = require('./models/blog')

const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');

const { User } = require('./models/user');
const { connectMongodb } = require('./connection');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const { TokenExpiredError } = require('jsonwebtoken');


//set view
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));
app.use(checkForAuthenticationCookie('token'));

//connect mongoDB
connectMongodb('mongodb://127.0.0.1:27017/blOG').then(() => {
    console.log("MOongoDb is connected");
})

app.get('/', async (req, res) => {
    
    try {
        const allBlogs = await Blog.find({}).sort({"createdAt": -1});

        if(!allBlogs || allBlogs.length === 0){
            console.log("No Blogs found");
        }
        res.render('home', {
            user: req.user,
            blogs: allBlogs,
        });
    } catch (error) {
        console.error(err);
        res.status(500).send("Error retrieving blogs");
    }
})

app.use('/user', userRouter);
app.use('/blog', blogRouter);


app.listen(PORT, () => {
    console.log(`Server started at PORT: ${PORT}`);
})