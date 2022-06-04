const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    fname: {
        type: String,
        required: 'First Name is required',
        trim: true
    },
    lname: {
        type: String,
        required: 'Last Name is required',
        trim: true
    },
    email: {
        type: String,
        required: 'Email is required',
        unique: true,
        lowercase:true,
        trim: true
    },
    profileImage: {
        type: String,
        required: 'Profile Image is required',
        trim: true
    }, // s3 link
    phone: {
        type: String,
        required: 'Phone Number is required',
        unique: true,
        trim: true
    },//valid Indian mobile number}, 
    password: {
        type: String,
        required: 'Password is required',
        trim: true
        // minlength: 8,
        // maxlength: 15,
    }, // encrypted password
    address: {
        shipping: {
            street: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            pincode: {
                type: Number,
                required: true,
                trim: true
            },
        },
        billing: {
            street: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            pincode: {
                type: Number,
                required: true,
                trim: true
            },
        }
    },


},
    { timestamps: true });

module.exports = mongoose.model('user', userSchema)