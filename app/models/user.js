/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// user schema
const userSchema = new Schema({
  fullName: {
	  type: String,
	  required: true,
	  minlength: 2,
	  maxlength: 50,
  },
  email: {
	  type: String,
	  trim: true,
    lowercase: true,
	  required: true,
	  minlength: 5,
	  maxlength: 255,
  },
  password: {
	  type: String,
    default: '',
  },
  clubName: {
    type: String,
    default: 'Live Reail Club',
  },
  university: {
    type: String,
    default: '',
  },
  verificationCode: {
    type: String,
    default: '',
  },
  role: {
	  type: String,
	  default: 'admin',
  },
  blocked: {
	  type: Boolean,
	  default: false,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    default: 'web',
  },
  occupation: {
	  type: String,
	  default: '',
  },
  googleId: {
    type: String,
    default: '',
  },
  facebookId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const User = mongoose.model('user', userSchema);

export default User;
