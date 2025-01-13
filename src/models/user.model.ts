import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },

  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address']
  },

  password: {
    type: String,
    required: true
  },

  profilePicture: {
    type: String,
    required: false
  },

  uploadedFiles: [{
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: false
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
});

const User = model('User', userSchema);
export default User;
