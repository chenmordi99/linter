
const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { zip } = require('ramda')
const Form = require('./models/form_schema');
const Sub = require('./models/sub_schema');

const { check, validationResult } = require('express-validator');
let validator = require('validator');

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

const idCounterCtor = async (idCounter) => {
  const forms = await Form.find({});
  let c = forms.length;
  idCounter.getNextId = () => c++;
}

const idCounter = {};
idCounterCtor(idCounter);



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

  const {name, ammount, fields, labels, types} = req.body;

  form.id = idCounter.getNextId();
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





router.post('/putSubmission', async (req, res) => {
  


  const {form_id, results, types} = req.body;
  const zipped = zip(results, types);
  let isValid = true;
  for(let i=0; i<zipped.length && isValid; i++){
    let field = zipped[i][0];
    let type = zipped[i][1];
    
    
    isValid = type === 'email' ? validator.isEmail(field) :
    type === 'tel' ? validator.isMobilePhone(field) :
    type === 'text' ? validator.isLength(field, {min:1}):
    type === 'color' ? validator.isLength(field, {min:1}):
    type === 'date' ? validator.isLength(field, {min:1}):
    type === 'number' ? validator.isDecimal(field):
    "";
    console.log(`field: ${field}, type: ${type}, res: ${isValid}`)
  }
  
  if (!isValid) {
    return res.status(422).json({ success: false });
  }

  let identifier = parseInt(form_id);
  const updated = await Form.findOneAndUpdate({ id: identifier }, { $inc: {ammount: 1} });
  let sub = new Sub(); 
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













