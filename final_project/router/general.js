const express = require('express');
const axios = require('axios');

const books = require("./booksdb.js");
const isValid = require("./auth_users.js").isValid;
const users = require("./auth_users.js").users;

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});
      }
    
    return res.status(404).json({message: "Unable to register user."});
});

// Get all books available
public_users.get('/', (req, res) => {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const bookDetails = books[isbn];
    if (bookDetails) {
        return res.status(200).json(bookDetails);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    if (booksByAuthor.length > 0) {
        return res.status(200).json({ author, books: booksByAuthor });
    } else {
        return res.status(404).json({ message: "No books found for the author" });
    }
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title === title);
    if (booksByTitle.length > 0) {
        return res.status(200).json({ title, books: booksByTitle });
    } else {
        return res.status(404).json({ message: "No books found for the title" });
    }
});

// Get book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        return res.status(200).json({ review: book.reviews });
    } else {
        return res.status(404).json({ message: "No review found for the book" });
    }
});

// Search by ISBN – Using Promises
function searchByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book not found"));
            }
        }, 1000);
    });
}

searchByISBN(isbn)
    .then(book => {
        console.log("Book found:", book);
    })
    .catch(error => {
        console.error("Error:", error.message);
    });

// Search by Author using async-await with Axios
async function searchByAuthor(author) {
    try {
        const response = await axios.get(`https://realogbinary-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books?author=${author}`);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to search books by author ${author}: ${error.message}`);
    }
}


searchByAuthor(author)
    .then(books => {
        console.log("Books by", author, ":", books);
    })
    .catch(error => {
        console.error("Error:", error.message);
    });

// Search by Title using async-await with Axios
async function searchByTitle(title) {
    try {
        const response = await axios.get(`https://realogbinary-5000.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books?title=${title}`);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to search books by title ${title}: ${error.message}`);
    }
}


searchByTitle(title)
    .then(books => {
        console.log("Books by", title, ":", books);
    })
    .catch(error => {
        console.error("Error:", error.message);
    });

module.exports.general = public_users;