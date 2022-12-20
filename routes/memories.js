const express = require('express');
const memories = require('../models/memories');
const cors = require('cors');

const router = express.Router();

const memory = require('../models/memories')
const Memory = require('../models/memories')
const memoryModel = require("../models/memories.js");

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
        let memories = await memoryModel.find();

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
            pagination: "Will be added soon!"
        }

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

// create Route
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

module.exports = router;