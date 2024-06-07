
//save cookie date 
const sendToken = (user, statusCode, res, msg) => {
  const token = user.getJWTToken();
  console.log(token,"jjjjjjjjjjj");

  //options for cookies
  const options = {
      expire: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({ success: true, user, token, message: msg });
};
module.exports = sendToken;
