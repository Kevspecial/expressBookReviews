const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("Customer successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.username; 
  const isbn = req.params.isbn;
  const book = books[isbn];
  const review = req.query.review;
  if (books[isbn]) {
      if (books[isbn].reviews && books[isbn].reviews[username]) {
          // Modify existing review
          books[isbn].reviews[username] = review;
          return res.status(200).json({ message: "Review modified successfully" });
      } else {
          // Add new review
          if (!books[isbn].reviews) {
              books[isbn].reviews = {};
          }
          books[isbn].reviews[username] = review;
          return res.status(200).json({ message: "Review added successfully" });
      }
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.username; 
  const isbn = req.params.isbn;
  const book = books[isbn];
  const review = req.query.review;
  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has posted a review for the given ISBN
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for this user and ISBN" });
  }

  // Delete the review
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review for ISBN ! has been deleted successfully" });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
