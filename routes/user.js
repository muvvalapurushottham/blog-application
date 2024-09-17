const { Router} = require('express');

const { handleSignin, handleSignup, handleCreateUser, handleUserLogin, handleUserLogout } = require('../controllers/user');
const router = Router();

router.get('/signin', handleSignin);

router.get('/signup', handleSignup);

router.get('/logout', handleUserLogout);

router.post('/signup', handleCreateUser);

router.post('/signin', handleUserLogin);


module.exports = router;