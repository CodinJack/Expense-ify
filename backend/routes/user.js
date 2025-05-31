const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");

router
    .post("/create-user", userController.createUser)
    .get("/user/:id", userController.getUserByID)
    .get("/users", userController.getUsers);
// .delete("user/:id", deleteUserByID)

module.exports = router;
