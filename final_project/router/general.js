const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let booksbyauthor = [];
  let isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if(books[isbn]["author"] === req.params.author) {
      booksbyauthor.push({"isbn":isbn,
                          "title":books[isbn]["title"],
                          "reviews":books[isbn]["reviews"]});
    }
  });
  res.send(JSON.stringify({booksbyauthor}, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let booksbytitle = [];
  let isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if(books[isbn]["title"] === req.params.title) {
      booksbytitle.push({"isbn":isbn,
                         "author":books[isbn]["author"],
                         "reviews":books[isbn]["reviews"]});
    }
  });
  res.send(JSON.stringify({booksbytitle}, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]["reviews"]);
});

// ============================================================
// Node.js methods using Async/Await or Promises with Axios
// Retrieve all books and details by ISBN, author, and title
// ============================================================

// Task: Get all books using async/await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books retrieved using async/await with Axios:");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error retrieving all books:", error.message);
  }
};

// Task: Get book details based on ISBN using Promises with Axios
const getBookByISBN = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Book details for ISBN ${isbn} retrieved using Promises with Axios:`);
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error retrieving book by ISBN:", error.message);
    });
};

// Task: Get book details based on Author using async/await with Axios
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by author "${author}" retrieved using async/await with Axios:`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error retrieving books by author:", error.message);
  }
};

// Task: Get book details based on Title using Promises with Axios
const getBooksByTitle = (title) => {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      console.log(`Books with title "${title}" retrieved using Promises with Axios:`);
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error retrieving books by title:", error.message);
    });
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
