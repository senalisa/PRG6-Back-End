const express = require('express');

const router = express.Router();

const Memory = require('../models/memories')
const memoryModel = require("../models/memories.js");

//CORS
router.use('/', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Methods", "Origin, Content-Type, Accept");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");

    next()
})


//ROUTES
//GET
//Checkt HEADER Accept, het moet json zijn
router.get("/", (req, res, next) => {
    console.log('GET middleware to check Accept')

    if (req.header('Accept') === "application/json") {
        next();
    } else {
        res.status(400).send();
    }
})

// GET all Route
router.get('/', async (req,res) => {
    console.log("GET");

    try {

        let start = req.query.start
        let limit = req.query.limit
        let totalItems = await memoryModel.estimatedDocumentCount();  
        console.log("total items:" + totalItems, "start:" + start, "limit:" + limit)

        start = start ? parseInt(start) : 1;
        limit = limit ? parseInt(limit) : totalItems;

        const memories = await memoryModel.find({}, null, {skip: start - 1, limit: limit})

        let memoriesCollection = {
            items: memories,
            _links: {
                self: {
                    href: `${process.env.BASE_URI}`
                },
                collection: {
                    href: `${process.env.BASE_URI}`
                }
            },
            pagination: generatePagination(totalItems, start, parseInt(limit), req, res)
        }

        res.status(200).json(memoriesCollection)

        res.json(memoriesCollection)
    } catch {
        res.status(500).send();
    }
    
})


//DETAIL
//Checkt HEADER Accept, het moet json zijn
router.get("/:id", (req, res, next) => {
    console.log('GET middleware to check Accept')

    if (req.header('Accept') === "application/json") {
        next();
    } 
    else {
        res.status(400).send();
    }
})

// DETAIL Route
router.get('/:id', getMemory, (req,res) => {
    console.log("GET");
    res.json(res.memory);
})


//CREATE
//Middelware om lege velden te checken
router.post("/", (req, res, next) => {
   console.log('POST middelware to check empty values')

   if (req.body.title && req.body.author && req.body.memory && req.body.date && req.body.points) {
        next();
   } else {
        res.status(400).send();
   }
})

//Create Route
router.post('/', async (req,res) => {
    console.log("POST");

    let memory = memoryModel({
        title: req.body.title,
        memory: req.body.memory,
        points: req.body.points,
        date: req.body.date,
        author: req.body.author
    })

    try {
        await memory.save();
        res.status(201).json(memory);
    } catch {
        res.status(500).send();
    }
})


//UPDATE
//Middelware om lege velden te checken
router.put("/:id", getMemory, (req, res, next) => {
    console.log('PUT middelware to check empty values')
 
    if (req.body.title && req.body.author && req.body.memory && req.body.date && req.body.points) {
         next();
    } else {
         res.status(400).send();
    }
 })

//Update Route
router.put('/:id', getMemory, async (req, res) => {
    if (req.body.title != null) {
        res.memory.title = req.body.title
    }
    if (req.body.memory != null) {
        res.memory.memory = req.body.memory
    }
    if (req.body.points != null) {
        res.memory.points = req.body.points
    }
    if (req.body.date != null) {
        res.memory.date = req.body.date
    }
    if (req.body.author != null) {
        res.memory.author = req.body.author
    }

    try {
        const updatedMemory = await res.memory.save()
        res.json(updatedMemory)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})


//DELETE
router.delete('/:id', getMemory, async (req, res) => {
    try {
        await res.memory.remove()
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//OPTIONS
router.options("/", (req, res) => {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.send();
})

//OPTIONS
router.options("/:id", (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.send();
})


//MIDDLEWARE
//Function for a middleware to get the memory with id
async function getMemory(req, res, next) {

    let memory

    try {
        memory = await Memory.findById(req.params.id)
        if (memory == null) {
            return res.status(404).json({ message: 'Cannot find your Memory :('})
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.memory = memory
    next()
}


//PAGINATION
//Functions
const hasStartAndLimit = (start, limit) => !isNaN(start) && !isNaN(limit);

function getTotalPages(totalItems, start, limit) {
    let totalPages

    if (limit == null) {
        totalPages = 1
    }

    totalPages = Math.ceil(totalItems / limit)

    return totalPages
}

function getCurrentPage(totalItems, start, limit) {
    const currentPage = Math.floor((start - 1) / limit) + 1;
    return currentPage
}

const getFirstQueryString = (total, start, limit) =>
  hasStartAndLimit(start, limit) ? `?start=1&limit=${limit}` : "";

function getLastPageItem(totalItems, start, limit) {
    let lastPageItem = (Math.ceil(totalItems / limit) - 1) * limit + 1;
    return lastPageItem
}

const getLastQueryString = (totalItems, start, limit) =>
  hasStartAndLimit(start, limit)
    ? `?start=${getLastPageItem(totalItems, start, limit)}&limit=${limit}`
    : "";

function getPreviousPageItem(totalItems, start, limit) {
    let previousPageItem = start - limit 
    return previousPageItem
}

const getPreviousQueryString = (totalItems, start, limit) =>
  hasStartAndLimit(start, limit)
    ? `?start=${getPreviousPageItem(totalItems, start, limit)}&limit=${limit}`
    : "";


function getNextPageItem(totalItems, start, limit) {
    let nextPageItem = start + limit 
    return nextPageItem
}

const getNextQueryString = (totalItems, start, limit) =>
  hasStartAndLimit(start, limit)
    ? `?start=${getNextPageItem(totalItems, start, limit)}&limit=${limit}`
    : "";

function getPageNumber(totalItems, start, limit, itemNumber) {
    let pageNumber = Math.ceil(totalItems / limit)
    return pageNumber
}

function generatePagination(totalItems, start, limit, req, res) {

    try {
        const pagenumber = getPageNumber(totalItems, start, limit);
        const currentpage = getCurrentPage(totalItems, start, limit);

        let pagination = {
            "currentPage": getCurrentPage(totalItems, start, limit),
            "currentItems": limit,
            "totalPages": getTotalPages(totalItems, start, limit),
            "totalItems": totalItems,
            "_links": {
                "first": {
                    "page": 1,
                    "href": `${process.env.BASE_URI}${getFirstQueryString(
                        totalItems,
                        start,
                        limit
                      )}`,
                },
                "last": {
                    "page": getPageNumber(totalItems, start, limit),
                    "href": `${process.env.BASE_URI}${getLastQueryString(
                        totalItems,
                        start,
                        limit
                      )}`,
                },
                "previous": {
                    "page": currentpage - 1 <= 1 ? 1 : currentpage - 1,
                    "href": `${process.env.BASE_URI}${getPreviousQueryString(
                        totalItems,
                        start,
                        limit
                      )}`,
                },
                "next": {
                    "page": currentpage + 1 > pagenumber ? currentpage : currentpage + 1,
                    "href": `${process.env.BASE_URI}${getNextQueryString(
                        totalItems,
                        start,
                        limit
                      )}`,
                }
            }
        }
        return pagination
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
}

module.exports = router;