//framework web backend
const express = require('express');

// cho phep cross-origin req (FE o domain khac goi api nay)
const cors = require('cors');

//load cac bien moi truong tu file .env
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');


// khoi tao server 
const app = express();

app.use(cors());
//parse body json tu request de req.body co data
app.use(express.json());

// gan route tai api/auth
app.use('/api/auth',require('./routes/auth'));

//app.use('/api/users',require('./backend/routes/users'));

app.use('/api/destinations',require('./routes/destination'));

app.use('/api/destinations', require('./routes/destination'));      

app.use('/api/travelcosts', require('./routes/travelCost'));      

app.use('/api/tours', require('./routes/tour'));              
        
app.use('/api/optimize', require('./routes/optimize'));               


//kiem tra
app.get('/',(req,res)=>res.send("Backend running OKEEEE"));


//dat cuoi cung de bat loi next(err) tu cac route
app.use(errorHandler);

// khoi chay server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));