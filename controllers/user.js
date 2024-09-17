const { User } = require('../models/user');

async function handleSignin(req, res) {
    
    return res.render('signin');
}

async function handleSignup(req, res) {
    return res.render('signup');
}

async function handleCreateUser(req, res) {
    
    const { fullName, email, password} = req.body;

    await User.create({
        fullName,
        email,
        password,
    })
    return res.redirect('/');
}

async function handleUserLogin(req, res) {
    
    const { email, password } = req.body;

    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie("token", token).redirect('/')
    } catch (error) {
        return res.render('signin', {
            error: "Incorrect Password",
        })
    }
    
}

async function handleUserLogout(req, res) {
    
    res.clearCookie("token").redirect('/');
}

module.exports = {
    handleSignin,
    handleSignup,
    handleCreateUser,
    handleUserLogin,
    handleUserLogout
}