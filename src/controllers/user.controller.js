import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { userAttend } from "../models/userAttendecedetail.model.js";
import jwt from "jsonwebtoken";


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

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Update the user's password
  user.password = password;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password Changed"));
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
    "-password"
  );

  const option = {
    httponly: true,
    secure: true,
  };
  
  return res
    .status(200)
    .cookie("accesToken", accessToken, option)
    .json(
      new ApiResponse(200, {
        user:logInUser,accessToken
      },"User logged In succed")
    )

});

// User LogOut
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

// USer attendece 

const userAttendController = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const attendanceRecord = new userAttend({
      user: user._id,
      dateTime: {
        dateTime: req.body.dateTime.date,
        present: req.body.dateTime.present,
        absent: req.body.dateTime.absent,
        leave: req.body.dateTime.leave,
        inTime: req.body.dateTime.inTime,
        outTime: req.body.dateTime.outTime
      }
    });

    await attendanceRecord.save();
    res.status(200).json(new ApiResponse(200," Your attendance record has been successfully updated..." ));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Error: Unable to update attendance. Please try again later..."));
  }
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const { email, username ,fullName} = req.body;

  const token =
    req.cookies?.access_token ||
    req.headers["authorization"]?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
  
    const deCodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(deCodedToken?._id)

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Update the user's password
  if (email) {
    user.email = email;
  }
  if (username) {
    user.username = username;
  }
  if (fullName) {
    user.fullName = fullName;
  }

  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, `${email ? "Email" : null || username ? "Username" : null || fullName ? "Name" : null} has changed`))
});


export { regesterUser, logInUser ,logOutUser,userAttendController,forgotPassword, updateProfile};
