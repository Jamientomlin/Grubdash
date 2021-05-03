const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const create = (req, res, next) => {
  const id = nextId();
  const newOrder = { ...res.locals.validOrder.data, id };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};


const list = (req, res, next ) =>{
res.json({data: orders})
}
const checkStatus = (req, res, next) => {
    const { data: { status } } = req.body;
  if (!status || status === 'invalid')
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
    if(status === 'delivered') return next({
        status: 400,
        message:
          "A delivered order cannot be changed",
      })
  next();
};

const checkDishes = (req, res, next) => {
  const dishes = res.locals.validOrder.data.dishes;
  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity !== "number"
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
};



const read = (req, res, next) => {
  res.json({ data: res.locals.order });
};

const isFound = (req, res, next) => {
  const found = orders.find((order) => order.id === req.params.orderId);
  if (!found) {
      return next({ 
          status: 404, 
          message: `Order id: ${req.params.orderId} not found.` });
  }
  res.locals.order = found;
  next();
};

const isDishValid = (req, res, next) => {
  const {data: {deliverTo, mobileNumber, dishes } } = req.body;
  const requiredFields = ["deliverTo", "mobileNumber", "dishes" ];
  for (const field of requiredFields) {
    if(!req.body.data[field]) {
      return next({status: 400,
                  message: `Order must include a ${field}.`});  
    }
  }
if (dishes.length === 0 || !Array.isArray(dishes))
  return next({
    status: 400,
    message: "Order must include one dish"
  })
  res.locals.validOrder = req.body
  next()
}

const destroy = (req, res, next) => {
    let index = orders.indexOf(res.locals.order);
    if (orders[index].status === "pending") {
      orders.filter((order, orderIndex) => orderIndex !== index);
      res.sendStatus(204);
    }else{
        next({status: 400, message: 'An order cannot be deleted unless it is pending'})
    }
  };

  const update = (req, res, next) => {
    let index = orders.indexOf(res.locals.order);
    if (req.body.data.id && req.body.data.id !== orders[index].id)
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orders[index].id}`,
      });
    orders[index] = { ...req.body.data, id: orders[index].id };
    res.json({ data: orders[index] });
  }

module.exports = {
    list,
    read: [isFound, read],
    create: [isDishValid, checkDishes, create],
    update: [isFound, isDishValid, checkDishes, checkStatus, update],
    destory: [isFound, destroy]
}