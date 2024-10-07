//product controllers.....
//getAllProducts
const Product = require("../models/productModel")

 // Create a new product
const createProduct = async (req, res) => {
    try {
        const {
            productName,
            productDescription,
            productPrice,
            category,
            subCategory,
            brand = [],
            stock = [],
            imageUrl,
            additionalImages = [],
            sku,
            colorOptions = [],
            sizeOptions = [],
            rating = [],
            reviews = [],
            tags = [],
            isFeatured = false,
            createdBy
        } = req.body;

        // Validating required fields
        if (!productName || !productDescription || !productPrice || !category || !subCategory || !imageUrl || !sku || !createdBy) {
            return res.status(400).json({
                message: "Mandatory fields are required"
            });
        }

        // New product instance
        const newProduct = new Product({
            productName,
            productDescription,
            productPrice,
            category,
            subCategory,
            brand,
            stock,
            imageUrl,
            additionalImages,
            sku,
            colorOptions,
            sizeOptions,
            rating,
            reviews,
            tags,
            isFeatured,
            createdBy
        });

        // Save new product to database
        await newProduct.save();

        // Respond with success message and created product data
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error("Error creating product", error);

        if (error.code === 11000) { // Handle duplicate SKU error
            return res.status(400).json({ message: "SKU already exists" });
        }
        res.status(500).json({ error: "Server error, please try again" });
    }
};      


const getAllProducts = async(req,res) =>{
    try {
        const products =await Product.find({});

        res.status(200).json({
            success:true,
            data:products,
        })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success:false,
            message:"server error"
        })
    }
};

const getSingleProduct=  async (req, res) => {
    const { id } = req.params; // Get the product ID from the request parameters

    try {
        const product = await Product.findById(id); // Fetch the product by ID

        if (!product) {
            return res.status(404).json({ message: "Product not found" }); // Handle case where product does not exist
        }

        res.status(200).json(product); // Send the product as a JSON response
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error" }); // Handle errors
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params; // Get the product ID from the request parameters
    const updatedData = req.body; // Get the updated data from the request body

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" }); // Handle case where product does not exist
        }

        res.status(200).json(updatedProduct); // Send the updated product as a JSON response
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error" }); // Handle errors
    }
};


//delete product route
const deleteProduct = async (req, res) => {
    const { id } = req.params; // Get the product ID from the request parameters

    try {
        const deletedProduct = await Product.findByIdAndDelete(id); // Delete the product by ID

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" }); // Handle case where product does not exist
        }

        res.status(200).json({ message: "Product deleted successfully" }); // Respond with success message
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error" }); // Handle errors
    }
};


// Get top-rated products (example)
const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Product.find({})
                                          .sort({ rating: -1 }) // Sort by rating in descending order
                                          .limit(5); // Limit to top 5 products

        res.status(200).json({
            success: true,
            data: topProducts,
        });
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    getAllProducts,
    createProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getTopProducts

};