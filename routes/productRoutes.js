//defining product endpoints
const express = require("express")


//import the controllers to us them in the endpoints
const {getAllProducts,createProduct, getTopProducts, deleteProduct, updateProduct, getSingleProduct} = require("../controllers/productController")
const { admin, protect } = require("../middleWear/authMiddleware")


const router = express.Router()

//1.createNewProduct. get req
router.post("/",protect,admin, createProduct)

//not a protected route. Anyone should be able to get all products
router.get("/get-all-products", protect, admin ,getAllProducts)



// Route to get a single product by ID
router.get("/products/:id", getSingleProduct);

// Route to update a product by ID
router.put("/products/:id",protect,admin, updateProduct);

// Route to delete a product by ID
router.delete("/products/:id",protect,admin, deleteProduct);

// Route to get top-rated products
router.get("/products/top",protect, getTopProducts); 



module.exports = router