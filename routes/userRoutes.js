const express = require("express");
const {registerUser, loginUser, logoutUser, forgetPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUsers, updateUserRole, deleteUserRole, getUserPerPage, initializeAdminUser } = require("../controllers/userControllers");
const { isAuthenticatedUser, checkUserRole} = require("../middlewares/auth");
const router = express.Router();
router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/password/forget").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").get(logoutUser);
router.route("/me").get(checkUserRole("admin"), getUserDetails);
router.route("/password/update").put(checkUserRole("admin"),updatePassword);
router.route("/me/update").put(checkUserRole("admin"),updateProfile);

router.route("/admin/users").get(checkUserRole("admin"),getAllUsers);
router.route("/admin/users-list").get(checkUserRole("admin"),getUserPerPage);

router.route("/admin/user/:id").get(checkUserRole("admin"),getSingleUsers);
router.route("/admin/user/:id").put(checkUserRole("admin"),updateUserRole);
router.route("/admin/user/:id").delete(checkUserRole("admin"),deleteUserRole);

// create admin
router.post("/admin/create", initializeAdminUser);

module.exports = router;