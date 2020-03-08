
const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');

const Form = require('./models/form_schema');
const Sub = require('./models/sub_schema');



const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// this is our MongoDB database
const dbRoute =
  'mongodb+srv://chenmordi99:1325476988cmIsr@cluster0-gmkrd.azure.mongodb.net/Forming?retryWrites=true&w=majority';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });
let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//guide
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));





// Fetching all available forms from DB
router.get('/getForms', (req, res) => {
  Form.find((err, forms) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: forms });
  });
});



// Inserting a form to the DB
router.post('/putForm', (req, res) => {
  let form = new Form();

  const {id, name, ammount, fields, labels, types} = req.body;

  if (id< 0) {
    return res.json({
      success: false,
      error: 'id has a negative number'
    });
  }

  if(name.length>21){
    return res.json({
      success: false,
      error: 'Form name can have maximmum of 20 letters and signs',
    });
  }
  form.id = id;
  form.name = name;
  form.ammount = ammount;
  form.fields= fields;
  form.labels=labels;
  form.types=types

  form.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});



//Getting a specific form from DB by its ID
router.get('/getSpecificForm/:id', (req, res) => {
  
  const form_identifier= parseInt(req.params.id);
  Form.find({id:form_identifier},(err, forms) => {
    
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: forms });
  });
});




// This function increase the number of sumbission of a given form
router.post('/updateData/:id', (req, res) => {
  const iden = parseInt(req.params.id);
  
  Form.findByIdAndUpdate({"id":iden},{$inc:{"ammount":1}}, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});






//this is a get method for submisssions
router.get('/getSub/:id', (req, res) => {
  const form_identifier= parseInt(req.params.id);

  Sub.find({form_id:form_identifier},(err, subs) => {
    
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: subs });
  });
});


router.post('/incAmmount', async (req,res)=>{
  const form_identifier = parseInt(req.query.id);
  const updated = await Form.findOneAndUpdate({ id: form_identifier }, { $inc: {ammount: 1} });
  res.json(updated);
});





router.post('/putSubmission', (req, res) => {
  let sub = new Sub();

  const {id, form_id, results} = req.body;

  if (id< 0) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  sub.id = id;
  sub.form_id = form_id;
  sub.results = results;
  

  sub.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});









// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));













