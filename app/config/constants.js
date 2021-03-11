import path from 'path';
import merge from 'lodash/merge';

// Default configuations applied to all environments
const defaultConfig = {
  env: process.env.NODE_ENV,
  get envs() {
    return {
      test: process.env.NODE_ENV === 'test',
      development: process.env.NODE_ENV === 'development',
      production: process.env.NODE_ENV === 'production',
    };
  },
  tokenExpireIn: '1h',
  twilioSMS: {
    accountSid: 'AC4935ac486947126adc0232422c835bf2',
    authToken: 'c02b5556a0f928241f04ee67cf77d459',
    fromNumber: '(773) 321-8606',

  },
  version: require('../../package.json').version,
  root: path.normalize(__dirname + '/../../..'),
  port: process.env.PORT || 5000,
  ip: process.env.IP || '0.0.0.0',
  apiPrefix: '/api/v1', // Could be /api/resource or /api/v2/resource
  userRoles: ['service_provider', 'service_seeker', 'admin', 'employee'],

  /**
   * MongoDB configuration options
   */
  mongo: {
    seed: true,
    uri: 'mongodb+srv://adilsikandar:adil1234@cluster0.c77nh.mongodb.net/fiver-client',
    options: {
      db: {
        safe: true,
      },
    },
  },

  /**
   * Security configuation options regarding sessions, authentication and hashing
   */
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'i-am-the-secret-key-of-unnic-project',
    sessionExpiration: process.env.SESSION_EXPIRATION || '1h', // 1 hour
    saltRounds: process.env.SALT_ROUNDS || 12,
  },

  /**
   * Api Response messages
   */
  messages: {
    userNotFound: 'User Not Found!',
    userRemoved: 'User Removed Successfully!',
    employeeAdd: 'Employee Added Successfully!',
    employeeDelete: 'Employee Removed Successfully!',
    userPasswordSuccess: 'Password Set Successfully!',
    userPasswordChangeSuccess: 'Password Change Successfully!',
    userInvalidPassword: 'Invalid Password!',
    userInvalidCredentials: 'Invalid Credentials!',
    linkExpire: 'Link Expired,Please Generate Again!',
    userExist: 'User Already Exist!',
    imageUploadSuccess: 'Image Uploaded Successfully!',
    imageActiveSuccess: 'Image Active Successfully!',
    emailSuccess: 'Email Sent!',
    noAppointmentFound: 'No Appointment Found!',
    rateAppointmentFailure: 'You Already Rate This Appointment!',
    rateAppointmentSuccess: 'You Rated Appointment Successfully!',
    noCategoryFound: 'No Contact Us Found!',
    noExpertFound: 'No Experts Found!',
    appointmentAssignSuccess: 'Appointment Assigned Successfully!',
    paymentSuccess: 'Payment Charged Successfully!',
    accountAcceptSuccess: 'Account Accepted Successfully!',
    accountRejectedSuccess: 'Account Blocked Successfully!',
    success: 'success',
    email: 'ahafiz167@gmail.com',
    password: 'Ddp-sp14-bse-099',
    contactUsAddedSuccess: 'Contacted Successfully!',
    contactUsRemovedSuccess: 'Contact Us Removed Successfully!',
    contactUsNotFound: 'Contact Us Not Found!',
    contactUsStatsNotFound: 'Contact Us Stats Not Found!',
    servicesNotFound: 'Services Not Found!',
    highlightImagesCheck: 'Highlight Images Must Be Less Than 5!',
    highlightImagesBelongedCheck: 'All Images Must Be Belonged To The Same User!',
    supervisionReqSuccess: 'Supervision Request Sent!',
    supervisionReqNotFound: 'Supervision Request Not Found!',
    supervisionReqFail: 'You Already Makes Supervision Request!',
    highlightAddedSuccess: 'Highlight Created Successfully!',
    highlightRemovedSuccess: 'Highlight Removed Successfully!',
    resetPasswordEmailSubject: 'Link To Reset Password',
    historyNotFound: 'History Not Found!',
    conversationNotFound: 'Conversation Not Found!',
    chatNotFound: 'Chat Not Found!',
    eventNotFound: 'Event Not Found!',
    settingsNotFound: 'Settings Not Found!',
    invalidEventType: 'Invalid Event Type!',
    stripeSceretKey: 'sk_test_nxJqnIMdYpm8n6fVQvxGFeGU00FWevmEYX',
    s3AccessKeyId: 'AKIARHHKSX2XQBEMXMZD',
    s3SecretAccessKey: 'acceZdtzq5ody36jtjSbaY2gywaitdBzP007fnHSssKeyId',
    s3Region: 'us-west-2',
    paypalMode: 'sandbox',
    paypalClientId: 'Ads_PX1qhMjgBBOvBcz-zBQ24GB_qrZm6xS4FWvS0NEjwUY07IAGbO5FotIl4m75OoR6jJjIpn97WjFj',
    paypalClientSecret: 'EPswChI9g19ivu_EQFj5VbOspxZZ8yE4KhwnfkVAXaDCNqakYLhtdG22j6jx3w-wZByLNXkdXbTDceGk',
    dataSecret: 'data-secret-key-is-here-euy26eviy923',
    productionLinkFrontend: 'http://localhost:3000/',
    productionLink: 'https://d1enl2tjj7x5i0.cloudfront.net/',

  },
  USER_SERVICE: {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    USER_EXISTS_FAIL: 'USER_EXISTS_FAIL',
    INCORRECT_PASS: 'INCORRECT_PASS',
    UPDATE_USER_ACTIVITY_FAIL: 'CANNOT_UPDATE_USER_ACTIVITY_FAIL',
    FETCH_USERS_LIST_FAIL: 'FETCH_USERS_LIST_FAIL',
    PASSWORD_UPDATE_SUCCESS: 'PASSWORD_UPDATE_SUCCESS',
    PASSWORD_UPDATE_FAIL: 'PASSWORD_UPDATE_FAIL',
    VERIFICATION_CODE_FAIL: 'VERIFICATION_CODE_FAIL',
    UPDATE_FROM_SERVER_FAIL: 'UPDATE_FROM_SERVER_FAIL',
    SERVER_FAIL: 'SERVER_FAIL',
    GET_PROFILE: 'GET_PROFILE',
    FETCH_USERS_LIST_SUCCESS: 'FETCH_USERS_LIST_SUCCESS',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  },
};
// Environment specific overrides
const environmentConfigs = {
  development: {
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb+srv://adilsikandar:adil1234@cluster0.c77nh.mongodb.net/fiver-client',
    },
    security: {
      saltRounds: 4,
    },
  },
  test: {
    port: 27017,
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb+srv://adilsikandar:adil1234@cluster0.c77nh.mongodb.net/fiver-client',
    },
    security: {
      saltRounds: 4,
    },
  },
  production: {
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb+srv://adilsikandar:adil1234@cluster0.c77nh.mongodb.net/fiver-client',
      seed: false,
    },
  },
};

// Recursively merge configurations
export default merge(defaultConfig, environmentConfigs[process.env.NODE_ENV] || {});
