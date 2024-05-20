import mongoose, { Schema } from "mongoose";

const userAttendScheme = new Schema(
  {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User" // Reference to the User model
      },
    dateTime:{
        dateTime:{
            date:String
        },
        present:{
            type: Boolean
          },
          absent:{
            type:Boolean
          },
          leave:{
            type :Boolean
          },
          inTime:{
            type :String
          },
          outTime:{
            type:String
          }
    }
  },
  {timestamps:true}
);


export const userAttend = mongoose.model("userAttend", userAttendScheme);