const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
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
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    let review = req.query.review || (req.body && req.body.review);
    let reviewer = req.session.authorization['username'];
    if (review) {
      book['reviews'][reviewer] = review;
      return res.status(200).json({
        message: `The review for the book with ISBN  ${isbn} has been added/updated.`,
        reviews: book.reviews
      });
    } else {
      return res.status(400).json({message: "Review is required"});
    }
  } else {
    return res.status(404).json({message: "Unable to find this ISBN!"});
  }
});

// Delete a book review (logged-in user can delete only their own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let reviewer = req.session.authorization['username'];
  let book = books[isbn];
  if (book) {
    if (book.reviews[reviewer]) {
      delete book.reviews[reviewer];
      return res.status(200).send(`Reviews for the ISBN  ${isbn} posted by the user ${reviewer} deleted.`);
    } else {
      return res.status(404).json({message: "Review not found for this user"});
    }
  } else {
    return res.status(404).json({message: "Unable to find this ISBN!"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
