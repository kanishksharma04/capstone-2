Flex Vault

India’s marketplace for authentic hype culture — verified, curated, and delivered fast.

1. Overview

Flex Vault is a full-stack e-commerce platform designed to simplify buying and selling hype products in India. The platform provides a trusted, fast, and user-friendly ecosystem where users can browse, purchase, and manage high-demand items with confidence.

2. Problem Statement

The Indian hype-product market faces several challenges:

High volume of fake replicas

Expensive international imports

Delayed delivery timelines

Lack of a unified platform for authentic items

Flex Vault solves these issues by offering:

A curated catalogue of authentic hype items

Fast, India-based delivery

A centralized platform for browsing, buying, and managing products

3. System Architecture
Frontend  →  Backend API  →  Database

Stack Breakdown

Frontend: React.js, React Router, TailwindCSS

Backend: Node.js, Express.js

Database: MongoDB Atlas

Authentication: JWT-based authentication

Hosting:

Frontend → Vercel

Backend → Render

Database → MongoDB Atlas

4. Key Features
Authentication & Authorization

JWT-based signup, login, and secure session handling

CRUD Operations

Full create, read, update, delete actions for core entities

Search, Sorting & Filtering

Real-time search

Sorting by price, discount, and other fields

Filtering by category and tags

Pagination

Backend-supported pagination for improved performance

Dynamic Rendering

Lazy-loaded components

React Router for multi-page navigation

Frontend Routing

Pages include Home, Login, Signup, Dashboard, Profile, etc.

UI Design

Clean, minimal, mobile-responsive UI built with TailwindCSS

Hosting

Fully deployed backend and frontend

5. Tech Stack
Layer	Technologies
Frontend	React.js, React Router, Axios, TailwindCSS
Backend	Node.js, Express.js
Database	MongoDB Atlas
Authentication	JWT
Hosting	Vercel (Frontend), Render (Backend)
6. API Overview
Endpoint	Method	Description	Access
/api/auth/signup	POST	Register a new user	Public
/api/auth/login	POST	Authenticate user and return JWT	Public
/api/items	GET	Retrieve all items	Authenticated
/api/items/:id	GET	Retrieve item details	Authenticated
/api/items	POST	Add a new item	Admin only
/api/items/:id	PUT	Update item details	Authenticated
/api/items/:id	DELETE	Delete an item	Admin only
/api/search	GET	Search items by keyword	Authenticated
/api/cart	POST	Add item to cart	Authenticated
/api/cart	GET	View cart items	Authenticated
/api/cart/:id	PUT	Update item quantity in cart	Authenticated
/api/cart/:id	DELETE	Remove item from cart	Authenticated
/api/cart/checkout	POST	Checkout and create order	Authenticated
/api/orders	GET	View past orders	Authenticated
/api/orders/:id	GET	View specific order details	Authenticated
7. Extended API Functionality
GET /api/items — Query Parameters
Parameter	Type	Description	Example
page	Number	Page number for pagination	?page=2&limit=10
limit	Number	Number of items per page	?limit=8
sortBy	String	Sort field	?sortBy=price
order	String	Sorting order (asc, desc)	?sortBy=price&order=desc
category	String	Filter by category	?category=electronics
priceMin	Number	Minimum price	?priceMin=100
priceMax	Number	Maximum price	?priceMax=1000
search	String	Search keyword	?search=phone
