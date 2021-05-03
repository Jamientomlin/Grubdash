const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


// VALIDATION MIDDLEWARE
function isValidDish(req, res, next) {
    const { data: { description, name, price, image_url } = { } } = req.body;

    if(isNaN(price) || price <=0) {
        return next({
            status: 400, message: "Dish must have a price that is an integer greater than 0."
        })
    }
    const requiredFields = ["description", "name", "price", "image_url"];
    for (const field of requiredFields) {
        if(!req.body.data[field]) {
            return next({ status: 400, message: `Dish must include a ${field}.`})
        }
    }
    res.locals.validDish = req.body;
    next();
};

function dishExists(req, res, next) {
    // const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === req.params.dishId);
    if (!foundDish) {
        return next({ status: 404, message: "No matching dish found"})
    }

    res.locals.dish = foundDish;
    next();
}



// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
    res.json({ data: dishes })
};

function create(req, res, next) {
    const { data: { description, name, price, image_url } = { } } = req.body;
    const newDish = {
        id: nextId(),
        description,
        name,
        price,
        image_url,
    };

    dishes.push(newDish);
    // console.log(newDish);
    res.status(201).json({ data: newDish })
};

function read(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    res.json({ data: foundDish })
};

function update(req, res, next) {
    const index = dishes.indexOf(res.locals.dish);
    if (req.body.data.id && req.body.data.id !== dishes[index].id)
        return next({ 
            status: 400,
            message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${dishes[index].id}`
        });
    

    if (typeof dishes[index].price !== "number")
        return next({ status: 400, message: "price" });
    

    dishes[index] = { ...req.body.data, id: dishes[index].id };
    res.json({ data: dishes[index] })
}

module.exports = {
    list,
    create: [isValidDish, create],
    read: [dishExists, read],
    update: [dishExists, isValidDish, update],
}