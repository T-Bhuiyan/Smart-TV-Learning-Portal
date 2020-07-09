console.log("Starting server")

/*
Shared secret & consumer key is for Authentification
after authentification, POST parameter is for content retrieval
--------------------------------
LTI POST parameter (Required)
--------------------------------
lti_message_type    = basic-lti-launch-request
lti_version         = LTI-1p0
resource_link_id    = the content unique ID
oauth_consumer_key  = the token
*/

var     express     = require("express");
var     app         = express();
var     mongoose    = require("mongoose");
var     bodyParser  = require("body-parser");
const   jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var     cors        = require('cors');
const port = process.env.PORT || 8080;

// Enable all Cors request
app.use(cors());

// set ejs engine
app.engine('html', require('ejs').renderFile);
app.set("view engine", "html");
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//set static file for assets (for css and other thing)
app.use(express.static(__dirname + "/assets"));

// connect to database
//mongoose.connect("mongodb://localhost:27017/lti", { useNewUrlParser: true });
/*mongoose.connect("mongodb://gie:123asd@ds233320.mlab.com:33320/lti", { useNewUrlParser: true });
*/

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// create user schema (data structure) & model to call
var userSchema = new mongoose.Schema({
    name:       String,
    password:   String,
    email:      String,
});

var User = mongoose.model("User", userSchema);


// The routing activity
// -------------------------------------------

// Main route
app.get("/", function(req, res){
	
    res.render("D:\\tizen-workspace\\tizenTV-LTI-learningapp\\index.html");
});

// Test route
app.get("/test", function(req, res){
    res.render("home.ejs");
});


// Sign up
app.post("/sign_up", function(req, res) {

    // Assign the parameter to the userdata data structure
    var userData = new User({
        name      :req.body.username,
        email     :req.body.email,
        password  :req.body.password
    });
    
    // Save the data to database
    userData.save( function(err, response){
        if(err){
            console.log("hmm looks like error");
            console.log(err)
        } else {
            console.log("ok, saved")
            console.log(response)
        }
    })
    
    return res.render("regLog.ejs");
});


// Login
// Find user in db, create token, send back rendered HTML + token to user
app.post("/verifypin", function(req, res){
    var pin     = req.body.pin;
    if (pin == 1234) {
    	return true;
    }

});
app.post("/login", function(req, res){

    var reqName     = req.body.username_login;
    var reqPass     = req.body.password_login;

    // login validation process
    User.findOne({name:reqName}, function(searchErr, searchRes){
        
        // console.log("you search for: " + reqName);
        // console.log("your result is: " + searchRes);

        // if error
        if(searchErr){
            console.log("hmm looks like error");
            console.log(searchErr);
        } 

        // if nothing found
        if (searchRes == null) {
            errorMessage = "Authentication failed. User not found.";
            console.log(errorMessage);
            return res.render("errorPage.ejs", {errorMessage: errorMessage});
        }
               
        // if found......bad logic but ok....
        if (searchRes.name == reqName) {

                // check if the password correct
                if (searchRes.password != reqPass) {
                    errorMessage = "Authentication failed. Wrong password.";
                    return res.render("errorPage.ejs", {errorMessage: errorMessage});
                }
            
            // login validation succes
            loginResult = true;
            
            const tokenPayload  = {
                name: reqName,
                pass: reqPass
            };
            const token = jwt.sign({name: reqName,
                pass: reqPass}, "lti_SecretKey");
    

            return res.render("errorPage.ejs", {errorMessage: token});
            
        }    

    });

    
    

});

// LTI Request
// send lti post request with lti compliance format
app.post("/lti_request", function(req, res) {

    var reqLti_message_type     = req.body.lti_message_type;
    var reqLti_version          = req.body.lti_version;
    var reqResource_link_id     = req.body.resource_link_id;
    var reqOauth_consumer_key   = req.body.oauth_consumer_key ;
    
    jwt.verify(reqOauth_consumer_key, "lti_SecretKey", function(err, decoded) {
        console.log(decoded) // bar
        return res.render("errorPage.ejs", {errorMessage: decoded.tokenPayload.pass})
    });

});


// return json data for testing use
app.post("/login_test", function(req, res) {


    var reqName     = req.body.username_login;
    var reqPass     = req.body.password_login;

    // login validation process
    User.findOne({name:reqName}, function(searchErr, searchRes){
        
       

        // if error
        if(searchErr){
            console.log("hmm looks like error");
            console.log(searchErr);
        } 

        // if nothing found
        if (searchRes == null) {
            errorMessage = "Authentication failed. User not found.";
            console.log(errorMessage);
            return res.json({ "key": errorMessage});
        }
               
        // if found......bad logic but ok....
        if (searchRes.name == reqName) {

                // check if the password correct
                if (searchRes.password != reqPass) {
                    errorMessage = "Authentication failed. Wrong password.";
                    return res.json({ "key": errorMessage});
                }
            
            // login validation succes
            loginResult = true;
            
            const tokenPayload  = {
                name: reqName,
                pass: reqPass
            };
            const token = jwt.sign({name: reqName,pass: reqPass}, "lti_SecretKey");
    
  
            var vidLink = "https://www.youtube.com/watch?v=ih1CBMoCH8I";
            return res.json({ "key": token, "link": vidLink});
            
        }    

    });



});


// app.listen(port, '192.168.52.128', () => console.log(`Server at port: ${port}!`))
// app.listen(port, () => console.log(`Server at port: ${port}!`))

console.log(port);
if (port === null || port === "") {
  port = 8080;
}
app.listen(port,process.env.PORT,  () => console.log('Server at port: ' + port + '!'));