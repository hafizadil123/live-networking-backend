/* eslint-disable max-len */
import { Router } from 'express';
import UsersController from '../controllers/user.controller';
import authenticate from '../middleware/authenticate';
import profile from '../middleware/profile-media';
import errorHandler from '../middleware/error-handler';


const users = new Router();

// Users Routes
users.get('/test', (req, res) => {
  res.json({
    message: 'welcome in express way',
  });
});
users.post('/register', UsersController.register);
users.post('/login', UsersController.login);
users.post('/verify-user', UsersController.sendSMS);
users.put('/verify-code', UsersController.verifyCode);
users.post('/reset-password', UsersController.resetPassword);
users.post('/get-user-email', UsersController.userEmail);
users.post('/changeProfile', authenticate, UsersController.changeProfile);
users.get('/deactivateAccount', authenticate, UsersController.deactivateAccount);
users.get('/allusers', UsersController.getUsers);
users.post('/send-email', UsersController.sendMail);
users.get('/getProfile', authenticate, UsersController.getProfile);
users.post('/checkout', UsersController.checkout);
users.post('/changePicture', [authenticate, profile.fields( [
  {
    name: 'imageUrl',
    maxCount: 1,
  },
])], UsersController.changePicture);

users.use(errorHandler);

export default users;
