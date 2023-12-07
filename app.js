const path = require('path')
const express = require('express');
const jobRouter = require('./routes/jobRoutes')
const viewsRouter = require('./routes/viewsRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const app = express();
const paypal = require("@paypal/checkout-server-sdk")
const catchAsync = require('./utils/catchAsync');
const Transaction = require('./models/transactionModel')
const Newsletter = require('./models/newsletterModel')
const fetch = require('node-fetch')
const RateLimit = require('express-rate-limit')

// MIDDLEWARES
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))


app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


// ROUTES
app.use('/api/v1/jobs', jobRouter)
app.use('/', viewsRouter)

const limiter = RateLimit({
  windowMs : 15*60*1000,
  max : 100,
  delayMs : 0,
})


app.use(limiter);

app.post('/newsletter', catchAsync(async(req, res, next)=> {
  const email = req.body;
  await Newsletter.create(req.body)
  
  res.status(201).json({
    status: 'success'
  })

}))


const { CLIENT_ID, APP_SECRET } = process.env;
const baseURL = {
    sandbox: "https://api-m.sandbox.paypal.com",
    production: "https://api-m.paypal.com"
};



// create a new order
app.post("/create-paypal-order", catchAsync(async (req, res, next) => {
  const order = await createOrder();
  res.json(order);
}));

// capture payment & store order information or fullfill order
app.post("/capture-paypal-order", catchAsync(async (req, res, next) => {
  const { orderID } = req.body;
  const captureData = await capturePayment(orderID);
  
  // TODO: store payment information such as the transaction ID
  await Transaction.create({transactionId: captureData.id})
  res.json(captureData);
}));

app.get("/paypal", (req, res) => {

  res.render("paypal", {
    paypalClientId: process.env.CLIENT_ID,
  })
})



//////////////////////
// PayPal API helpers
//////////////////////

// use the orders api to create an order
async function createOrder() {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100.00",
          },
        },
      ],
    }),
  });
  const data = await response.json();
  return data;
}

// use the orders api to capture payment for an order
async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
  const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}


// NON EXISTING ROUTES
app.all('*', (req, res, next)=> {

    next(new AppError(`Oh no! The page does not exist ${req.originalUrl}`, 404))
})


app.use(globalErrorHandler)

// Remember that the middleware is called and passed the args by express
module.exports = app