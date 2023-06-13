//Mongodb setup
const path = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config({ path: path.resolve(__dirname, 'credential/.env') })  



const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

 /* Our database and collection */
const databaseAndCollection = {db: "CMSC335_Final", collection:"rideshareApp"};

// adding the information into the data base
//const uri = `mongodb+srv://${userName}:${password}@almamy.gmjmdhq.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${userName}:${password}@cluster0.l60vsvw.mongodb.net/?retryWrites=true&w=majority`  

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
// express setup
const http= require("http");

const express= require("express");
const { setgroups } = require("process");
const app = express();
const bodyParser = require("body-parser"); /*To handle post parameters */




// To do input/ output on the command line
const readline = require('readline');
// To  take information from the command line
const fs= require("fs");
// Getting the port number from command line
const args = process.argv.slice(2);
const portNumber=5001;
console.log(`Web server started and running at http://localhost:${portNumber}`);


const line_read= readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

app.use(express.static('public'));

// input/ output recursive methods
line_read.question("Stop to shutdown the server: ", commandline);

app.use(express.static('images'));

// function to handle the commands
function commandline(input){

    // handle stop input
    if( input==='stop' ) {

        console.log("Shutting down the server");
        process.exit(0);

    }
}

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));
// switching view 
app.set("views", path.resolve(__dirname, "templates"));

// view template engine to ejs file types
app.set("view engine", "ejs");


app.get("/", (request, response) => {

    response.render("index");
})

// Initializes request.body with post information
app.use(bodyParser.urlencoded({extended:false}));

app.get("/signIn.ejs", (request, response) =>{

    response.render("signIn");
})
// When the user submit an application
app.post("/signIn.ejs", async(request, response) => {


    const variables={
        name:request.body.name,
        email:request.body.email,
        password: request.body.password,
        university: request.body.uni,
        year: request.body.year,
        user_type: request.body.user_type,
        latitude: request.body.latitude,
        longitude: request.body.longitude

    }

//    adding into the db
    try{
        await client.connect();

        const result= await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(variables);
    }
    catch(e){
        console.error(e);
    }
    finally{
        await client.close();
    }

    response.render("confirmation", variables);
})

app.get("/login.ejs", (request, response)=>{

    response.render("login");
})

app.post("/login.ejs", async(request, response)=>{

    let result;
    try{
        await client.connect();

        let filter = {email: request.body.email, password:request.body.password};

        result = await client.db(databaseAndCollection.db)
                      .collection(databaseAndCollection.collection)
                      .findOne(filter);        

    }
    catch(e) {
        console.error(e);
    } 
    finally{
        await client.close();
    }

    let {name,
         email,
         university,
         year,
         user_type} = result;

    const variables ={
        name:name,
        email: email,
        university: university,
        user_type: user_type,
        year: year,
        latitude: request.body.latitude,
        longitude: request.body.longitude

        }

        response.render("account_found", variables);

})

app.listen(portNumber);