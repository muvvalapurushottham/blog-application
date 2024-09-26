const multer = require('multer');
const path = require('path');
const { User } = require('../models/user');

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

async function handleSignin(req, res) {
    
    return res.render('signin');
}

async function handleSignup(req, res) {
    return res.render('signup');
}

async function handleCreateUser(req, res) {
    
    const { fullName, email, password} = req.body;

    if(!fullName || !email || !password){
        return res.render('signup', {
            error: "All fields are required",
        })
    }

    await User.create({
        fullName,
        email,
        password,
    })
    return res.redirect('/');
}

async function handleUserLogin(req, res) {
    
    const { email, password } = req.body;

    if(!email || !password){
        res.render('signin', {
            error: "All fields are required!"
        })
    }

    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie("token", token).redirect('/')
    } catch (error) {
        return res.render('signin', {
            error: "Incorrect Password",
        })
    }
    
}

async function handleAccountInfo(req, res) {
    
    res.render('accountInfo', { user: req.user });
    
}

async function handleEditAccountInfo(req, res) {
    try {
        const { fullName, email, password } = req.body;
        const currentUserEmail = req.user.email;

        const user = await User.findOne({ email: currentUserEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(req.file, 'req.file');
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.profileImageUrl = `/uploads/${req.file.filename}` || user.profileImageUrl;
        if (password) {
            user.password = password;  
        }

        await user.save();

        return res.status(200).redirect('/');
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

uploadMiddleware = upload.single('profileImage');

async function handleUserLogout(req, res) {
    
    res.clearCookie("token").redirect('/');
    
}

module.exports = {
    handleSignin,
    handleSignup,
    handleCreateUser,
    handleUserLogin,
    handleUserLogout,
    handleAccountInfo,
    handleEditAccountInfo,
    uploadMiddleware
}