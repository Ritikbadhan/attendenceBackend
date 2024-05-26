import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { userAttend } from "../models/userAttendecedetail.model.js";
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";

const generateAccessToken = async (userId) => {
  try {
    const user = await Admin.findById(userId);
    const accessToken = user.generateAccesToken();
    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Token");
  }
};

const regesterAdmin = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if ([fullName, username, email, password].some((i) => i?.trim() === "")) {
    throw new ApiError(400, "All fields should be required");
  }

  const isAdminExist = await Admin.findOne({ $or: [{ email }, { username }] });
  if (isAdminExist) {
    throw new ApiError(409, "Admin is already exist");
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );
  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while regester user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin created succesed"));
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  const admin = await Admin.findOne({ $or: [{ email }, { username }] });
  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }

  // Update the admin's password
  admin.password = password;
  await admin.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password Changed"));
});

// Admin Login
const logInAdmin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  const isAdminExist = await Admin.findOne({ $or: [{ email }, { username }] });
  if (!isAdminExist) {
    throw new ApiError(404, "Admin is not exist");
  }

  const isPasswordCorrect = await isAdminExist.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken } = await generateAccessToken(isAdminExist._id);

  const loggedInAdmin = await Admin.findById(isAdminExist._id).select(
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
      new ApiResponse(
        200,
        {
          user: loggedInAdmin,
          accessToken,
        },
        "Admin logged In succed"
      )
    );
});

// User LogOut
const logOutAdmin = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        accessToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const option = {
    httponly: true,
    secure: true,
  };

  return (
    res
      .status(200)
      .clearCookie("accesToken", option)
      // .clearCookie("refreshToken",option)
      .json(new ApiResponse(200, "User Logged out"))
  );
});

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
        outTime: req.body.dateTime.outTime,
      },
    });

    await attendanceRecord.save();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          " Your attendance record has been successfully updated..."
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(
          500,
          "Error: Unable to update attendance. Please try again later..."
        )
      );
  }
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const { email, username, fullName } = req.body;

  const token =
    req.cookies?.access_token ||
    req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const deCodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(deCodedToken?._id);

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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `${email ? "Email" : null || username ? "Username" : null || fullName ? "Name" : null} has changed`
      )
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  // Fetch all users from the database
  const users = await User.find().select("-password"); // Exclude the password field

  // Construct the custom message
  const message =
    (req.body.email ? "Email" : null) ||
    (req.body.username ? "Username" : null) ||
    (req.body.fullName ? "Name" : null) ||
    "No changes";

  // Return the response with the users and the custom message
  return res
    .status(200)
    .json(new ApiResponse(200, users, `${message} has changed`));
});

export {
  regesterAdmin,
  logInAdmin,
  logOutAdmin,
  userAttendController,
  forgotPassword,
  updateProfile,
  getAllUsers,
};
