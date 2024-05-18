import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccesToken();

    // user.refreshToken = refreshToken;
    // await user.save({ validateBeforeSave: false });

    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Token");
  }
};


// User Regester code
const regesterUser = asyncHandler(async (req, res) => {

  const { fullName, username, email, password } = req.body;

  if ([fullName, username, email, password].some((i) => i?.trim() === "")) {
    throw new ApiError(400, "All fields should be required");
  }

  const isUserExist = await User.findOne({ $or: [{ email }, { username }] });
  if (isUserExist) {
    throw new ApiError(409, "User is already exist");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regester user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created succesed"));
});


// User Login
const logInUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  const isUserExist = await User.findOne({ $or: [{ email }, { username }] });
  if (!isUserExist) {
    throw new ApiError(404, "User is not exist");
  }

  const isPasswordCorrect = await isUserExist.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken } =
    await generateAccessToken(isUserExist._id);

  const loggedInUser = await User.findById(isUserExist._id).select(
    "-password -refreshToken"
  );

  const option = {
    httponly: true,
    secure: true,
  };
  
  return res
    .status(200)
    .cookie("accesToken", accessToken, option)
    // .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(200, {
        user:logInUser,accessToken
      },"User logged In succed")
    )

});

const logOutUser = asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      accessToken:undefined
    }
  },
  {
    new:true
  }
)
const option = {
  httponly: true,
  secure: true,
}

return res
.status(200)
.clearCookie("accesToken",option)
// .clearCookie("refreshToken",option)
.json(new ApiResponse(200, "User Logged out"))



})



export { regesterUser, logInUser ,logOutUser};
