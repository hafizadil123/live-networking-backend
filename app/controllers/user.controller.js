/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */
import BaseController from './base.controller';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Constants from '../config/constants';
import { generateSixDigitCode } from '../helpers/index';
import { sendInquiryEmail } from '../lib/util';
const stripe = require('stripe')('sk_test_nhfdyw1ShOeXXEuZ9KoJzQXe');
import { v4 as uuidv4 } from 'uuid';
const client = require('twilio')(Constants.twilioSMS.accountSid, Constants.twilioSMS.authToken);

class UsersController extends BaseController {
	whitelist = [
	  'fullName',
	  'email',
	  'password',
	  'clubName',
	  'university',
	  'verificationCode',
	  'state',
	  'city',
	  'zipCode',
	  'occupation',
	  'blocked',
	  'termsAndCondition',
	  'mobileNumber',
	  'gender',
	  'role',
	  'verificationCode',
	  'source',
	  'googleId',
	  'facebookId',
	  'organizationName',
	  'industry',
	  'ClubCategories',
	];

	register = async (req, res, next) => {
	  const params = this.filterParams(req.body, this.whitelist);
	  console.log('paramss', params);
	  try {
	      // See if user exist
	      const user = await User.findOne({ email: params['email'] });
	      if (user) {
	        return res.status(200).json({ message: Constants.messages.userExist, success: 0 });
		  }
	    // Encrypt password
	    if (params['password']) {
	      const salt = await bcrypt.genSalt(10);
	      const hash = await bcrypt.hash(params['password'], salt);
	      params['password'] = hash;
	    }

	    const newUser = new User(
	        {
	          ...params,
	        },
	    );
	        await newUser.save();
	    jwt.sign(params, Constants.security.sessionSecret, { expiresIn: Constants.security.sessionExpiration },
	        (err, token) => {
			  if (err) throw err;
	          return res.status(200).json({
	        token,
	        newUser,
	        success: 1,
			  });
	        });
	  } catch (err) {
	    err.status = 200;
	    next(err);
	  }
	};

	login = async (req, res, next) => {
	  const { email, password } = req.body;

	  try {
	    // See if user exist
	    const user = await User.findOne({ email });
	    if (!user) {
		  return res.status(400).json({ msg: 'Incorrect username or password', success: 0 });
	    }

	    const isMatch = await bcrypt.compare(password, user.password);
	    if (!isMatch) {
	      return res.status(400).json({ msg: 'Incorrect username or password', success: 0 });
	    }
	    jwt.sign({ user }, Constants.security.sessionSecret, { expiresIn: Constants.security.sessionExpiration },
	        (err, token) => {
		  if (err) throw err;
	      return res.status(200).json({ token, success: 1 });
	    });
	  } catch (error) {
	    error.status = 400;
	    next(error);
	  }
	};

	sendSMS = async (req, res, next) => {
	  try {
	    const params = this.filterParams(req.body, this.whitelist);
	    const user = await User.findOne({ email: params['email'] });
	    const verificationCode = generateSixDigitCode();
	    client.messages
	        .create({
			 from: Constants.twilioSMS.fromNumber,
			 to: user.mobileNumber,
			 body: `Your Verification Code: ${verificationCode}`,
		   })
	        .then(async (message) => {
			  const updated = await User.findByIdAndUpdate(
				  user._id,
				  {
	                $set: {
					  verificationCode,
	                },
				  },
				  { new: true },
			  );
			  if (updated) {
	            return res.status(200).json({
				  success: 1,
				  message: `verification message has been sent to ${user.mobileNumber}`,
				  messageId: message.sid,
	            });
			  }
	        })
	        .done();
	  } catch (error) {
	    next(error);
	  }
	}
	verifyCode = async (req, res, next) => {
	  try {
	    const params = this.filterParams(req.body, this.whitelist);
	    const user = await User.findOne({
		  verificationCode: params['verificationCode'],
	    });
	    if (!user) {
	      return res.status(400).json({
	        success: 0,
	        message: 'Invalid Code',

	      });
	    }
	    const updatedUser = await User.findByIdAndUpdate(
	        user._id,
	        {
			  $set: {
	            verificationCode: null,
			  },
	        },
	        { new: true },
	    );
	    return res.status(200).json({
	      success: 1,
		  message: 'code is verified',
		  user: updatedUser,
	    });
	  } catch (error) {
	    next(error);
	  }
	}
	// send forget pass email to user
	sendForgetPassEmail = async (req, res, next) => {
	  const { email } = req.body;
	  try {
	    // find user by its email
	    const user = await User.findOne({ email: email }).select('firstName lastName email');
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    // signed a user token by its id
	    const payload = { id: user._id };
	    const token = jwt.sign(payload, Constants.security.sessionSecret, {
	      expiresIn: '2m', // 2 minutes
	    });
	    const link = `${Constants.messages.productionLinkFrontend}update-password/${user._id}/${token}`;
	    // await sendResetPassEmail(user, link);
	    return res.status(200).json({ msg: 'Email Sent!' });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};
	// forget password
	forgetPassword = async (req, res, next) => {
	  const { password } = req.body;
	  try {
	    // find user by its id
	    const user = await User.findOne({ _id: req.params.userId }).select('password');
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    const decode = jwt.verify(req.params.token, Constants.security.sessionSecret);
	    if (!decode) {
	      return res.status(400).json({ msg: Constants.messages.linkExpire });
	    }

	    const salt = await bcrypt.genSalt(10);
	    user.password = await bcrypt.hash(password, salt);
	    await user.save();

	    return res.status(200).json({ msg: Constants.messages.userPasswordChangeSuccess });
	  } catch (err) {
	    if (err.message === 'jwt expired' || err.message === 'jwt malformed') {
	      return res.status(400).json({ msg: Constants.messages.linkExpire });
	    }
	    err.status = 400;
	    next(err);
	  }
	};
	// reset user password
	resetPassword = async (req, res, next) => {
	  const { newPassword, userId } = req.body;

	  try {
	    const user = await User.findById({ _id: userId });
	    if (!user) {
	      return res.status(400).json({ message: Constants.messages.userNotFound, success: 0 });
	    }
	      const salt = await bcrypt.genSalt(10);
	      const updatedUser = await User.findByIdAndUpdate(
	          userId,
	          {
	            $set: {
	              password: await bcrypt.hash(newPassword, salt),
	            },
	          },
	          { new: true },
	      );
		  return res.status(200).json({ message: Constants.messages.userPasswordChangeSuccess,
	         success: 1,
			 user: updatedUser });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};
	// Dispaly email
	userEmail = async (req, res, next) => {
	  try {
	    const { mobileNumber, companyName, zipCode, firstName } = req.body;
	    const user = await User.findOne({
	      mobileNumber,
	      zipCode,
		  companyName,
		  firstName,
	    });
	    if (!user) {
	      return res.status(400).json({
	        message: 'user not found',
	        success: 0,
		  });
	    }
	    return res.status(200).json({
	      success: 1,
	      email: user.email,
	    });
	  } catch (error) {
	    next(error);
	  }
	}
	// upload user profile image
	changePicture = async (req, res, next) => {
	  try {
	    // find user by its id
	    const user = await User.findById({ _id: req.user.id }).select('imageUrl');
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    user.imageUrl = `${req.files.imageUrl[0].filename}`;
	    await user.save();
	    return res.status(200).json({ msg: 'Profile Uploaded Successfully!', imageUrl: user.imageUrl });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	// update user profile
	changeProfile = async (req, res, next) => {
	  // filter body data with whitelist data
	  const params = this.filterParams(req.body, this.whitelist);
	  try {
	    // find user by its id and update
	    const user = await User.findByIdAndUpdate({ _id: req.user.id }, { $set: params }, { new: true });
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    const data = {
	      id: user._id,
	      email: user.email,
	      firstName: user.firstName,
	      lastName: user.lastName,
	      address: user.address,
	      mobileNumber: user.mobileNumber,
	      blocked: user.blocked,
	      city: user.city,
	      country: user.country,
	      imageUrl: user.imageUrl,
	      userReferenceId: user.userId,
	    };
	    return res.status(200).json({ msg: 'Profile Updated Successfully!', user: data });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	// upload user profile image
	deactivateAccount = async (req, res, next) => {
	  try {
	    // find user by its id
	    // find user by its id and update
	    const user = await User.findByIdAndUpdate({ _id: req.user.id }, { $set: { blocked: true } }, { new: true });
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    const data = {
	      id: user._id,
	      email: user.email,
	      firstName: user.firstName,
	      lastName: user.lastName,
	      address: user.address,
	      mobileNumber: user.mobileNumber,
	      blocked: user.blocked,
	      city: user.city,
	      country: user.country,
	      imageUrl: user.imageUrl,
	      userReferenceId: user.userId,
	    };

	    return res.status(200).json({ msg: 'Account Deactivated Successfully!', user: data });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};
	checkout = async (req, res, next) => {
	  let error;
	  let status;
	  try {
		  const { product, token } = req.body;

		  const customer = await stripe.customers.create({
	      email: token.email,
	      source: token.id,
		  });

		  const idempotency_key = uuidv4();
		  const charge = await stripe.charges.create(
	        {
			  amount: product.price * 100,
			  currency: 'usd',
			  customer: customer.id,
			  receipt_email: token.email,
			  description: `Purchased the ${product.name}`,
			  shipping: {
	            name: token.card.name,
	            address: {
				  line1: token.card.address_line1,
				  line2: token.card.address_line2,
				  city: token.card.address_city,
				  country: token.card.address_country,
				  postal_code: token.card.address_zip,
	            },
			  },
	        },
	        {
			  idempotency_key,
	        },
		  );
		  console.log('Charge:', { charge });
		  status = 'success';
	  } catch (error) {
		  console.error('Error:', error);
		  status = 'failure';
	  }

	  res.json({ error, status });
	}
	// get user profile
	getUsers = async (req, res, next) => {
	  try {
	    const firstRole = req.query.q1;
	    const secondRole = req.query.q2;
	    const category = req.query.category;
	    const club = req.query.club;
	    console.log('dddd', firstRole, secondRole);
	    const firstRow = await User.find({ role: firstRole, ClubCategories: category, clubName: club });
	    const secondRow = await User.find({ role: secondRole, ClubCategories: category, clubName: club });
	    res.status(200).json({
	      creators: firstRow,
	      storeOwnerUser: secondRow,
	    });
	  } catch (err) {
	    next(err);
	  }
	}
	sendMail = async (req, res, next) => {
	  try {
	    const user ={
	      fromEmail: req.body.fromEmail,
	      toEmail: req.body.toEmail,
	      text: req.body.text,
	    };
	    await sendInquiryEmail(user);
	    res.status(200).json({
	      message: 'message has been sent',
	      success: 1,
	    });
	  } catch (err) {
	    next(err);
	  }
	}
	getProfile = async (req, res, next) => {
	  try {
	    // find user by its id
	    // find user by its id and update
	    const user = await User.findById({ _id: req.user.id }).select('-password');
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }

	    return res.status(200).json({ msg: Constants.messages.success, user: user });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};
}

export default new UsersController();
