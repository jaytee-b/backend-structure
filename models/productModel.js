const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productName:{
        type: String,
        required: true,
        trim: true,
    },

    productDescription: {
        type: String,
        required: true,
        trim: true,
    },

    productPrice:{
        type: Number,
        required: true,
        min: 0,
    },

    category:{
        type: String,
        required: true,
        trim: true,
    }, //enum is used to give options. and an error will be thrown if an option stated in the enum is not specified. if you want the admin to be able to create a category name, you have to create a category model.

    subCategory:{
        type: String,
        trim: true,
    },

    brand: {
        type: String,
        trim: true,
    },

    stock:{
        type: String,
        required: true,
        min:0
    },

    imageUrl:{
        type: String,
        required: true,
    },

    additionalImages: [{
        type: String,
    }],

    sku:{
        type: String,
        unique:true,
    },

    colorOptions:[{
        type:String,

    }],

    sizeOptions:[{
        type: String,
    }],

    rating:{
        type: Number,
        default: 0,
        min:0,
        max: 5,
    },

    reviews:[{
        userId: {type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        content:{
            type: String,
            trim: true,
        },
        createdAt:{
            type: Date,
            default: Date.now
        },
    }],

    tags:[{
        type: String,
        trim: true
    }],

    isFeatured:{
        type: Boolean,
        default: false,
    },

    createdBy:{
        //only for the admin platform
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
},{
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema)