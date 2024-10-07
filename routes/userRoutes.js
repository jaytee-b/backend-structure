//users endpoint will be defined here

const express = require("express")


const { registerUser, loginUser,logoutUser, forgotPassword, registerAdmin, loginAdmin,logoutAdmin,resetPasswordUser,resetPasswordAdmin,forgotPasswordAdmin, getAllUsers, getSingleUser, updateUserProfile } = require("../controllers/userController");


const { protect, admin } = require("../middleWear/authMiddleware");



const router= express.Router()






// user route
router.post("/register", registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

//
router.post("/forgot-password",forgotPassword);
router.post("/forgot-password/admin",forgotPasswordAdmin);
router.put("/reset-password/:resetToken",resetPasswordUser);


//admin route
router.post("/register/admin", registerAdmin);
router.post("/login/admin", loginAdmin);
router.post("/logout/admin", logoutAdmin);
router.put("/admin/reset-password/:resetToken", resetPasswordAdmin);



router.get('/get-all-users',protect,admin, getAllUsers);
router.get("/get-single-user/:id",protect, getSingleUser);
router.put("/update-user-profile/:id",protect,updateUserProfile);





module.exports = router