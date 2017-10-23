// load http module: 
var http = require('http');

// accessing files in node module. 
var fs = require('fs');

// express module: 
var express = require('express');
var app = express();

// formidable module.
var formidable = require('formidable');

// cookies module.
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// specify the app should use body parser for reading
var bodyParser = require('body-parser');

// allows us to read forms submitted with post Request.
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
// adding external css sheet: 
app.use(express.static(path.join(__dirname + '/public')));

// set port for app.
app.set('port', process.env.PORT || 3000);

// App should use handlebars. 
var handlebars = require('express-handlebars');
app.engine('handlebars', handlebars({ defaultLayout: 'task1/main' }))// need to create default layout
app.set('view engine', 'handlebars');

// copied from lecy slides 12 using get method, but why? specifies what to do when the server gets the matching route with get as teh HTTP request method. 
app.get('/', function (request, response) { // app.get(<route>), function(req,res)

    fs.readFile(__dirname + "/employees.json", function (err, data) {

        //parse data in the file to JSON. 
        var employees = JSON.parse(data);

        //sorting 
        if (request.query.sort == 'ascending') {
            employees.sort(function (a, b) { return a.lname > b.lname });
            var order = "sort=descending";
        }
        else if (request.query.sort == 'descending') {
            employees.sort(function (a, b) { return a.lname < b.lname });
        }
        else {
            order = "sort=ascending";
        }
        var data = {
            homepage: true,
            employees: employees,
            order: order
        }
        response.render('task1/homepage', data)
    });
});

// Task 2 removing employees: 
app.get('/remove', function (request, response) {

    fs.readFile(__dirname + "/employees.json", function (err, data) {

        //parse data
        var employees = JSON.parse(data);
        var employeesToRemove;
        // console.log(request.query)
        if (request.query.options) {

            if (Array.isArray(request.query.options)) {

                employeesToRemove = request.query.options;
            } else {

                employeesToRemove = [request.query.options];
            }
            // console.log(employeesToRemove);
            // console.log("length: " + employeesToRemove.length);
            for (var i = 0; i < employeesToRemove.length; i++) {

                var idToRemove = employeesToRemove[i];

                // console.log(employeesToRemove[i]);
                employees = employees.filter(function (employee) { console.log(employee.id + " being compared to " + idToRemove); return employee.id != idToRemove });
            }
        }
        //saving array
        fs.writeFile("employees.json", JSON.stringify(employees), function (error, request) {

        })
        response.redirect("/");
    });
});

//task 2 adding employees; 
app.get('/add', function (request, response) {
     
    //retreive a partial completed form: 
    var cookie;

    if (request.cookies){
        cookie = request.cookies["unfinished"];   

    }
    else {
        cookies = response.clearCookie("unfinished");
        console.log('hello world');
    }
    response.render("task2/add", cookie);
});

//Task 2 and Task 3: 
app.post('/save', function (request, response) {

    //Load the employees list from employees.json, like in task one. 
    fs.readFile(__dirname + "/employees.json", function (err, data) {
        //parsing data
        var employees = JSON.parse(data);

        //add the new employee(specified by the POST from data to the list)
        var newid = 0;
        var ids = [];
        for (var employee in employees) {
            ids.push(employee.id);
        }
        // console.log(ids)
        while (newid in ids) {
            newid++;
            // console.log(newid);
        }

        var newemployee = {
            id: newid,
            lname: request.body.lname,
            fname: request.body.fname,
            email: request.body.email,
            ph: request.body.ph,
            address: request.body.address,
            title: request.body.title
        }

        //task 3.2 if the form has missing fields.
        var emptyProp = false;
        for (var prop in newemployee) {
            console.log(prop + ": " + newemployee[prop]);
            if (!newemployee[prop]) {
                emptyProp = true;
                response.redirect("/");
                break;
                
                console.log("hello");
            }
            
        }
    
        
        //check for empty property;
        if (emptyProp) {
            // create cookie
            response.cookie("unfinished", newemployee);
            response.redirect("/add");

        } else {
            // save information into employees.json
            employees.push(newemployee);

            //save the list back to employees.json
            fs.writeFile("employees.json", JSON.stringify(employees), function (err, request) { 
                if (err){
                    return console.log(err);
                }
            });
            response.clearCookie("unfinished");
            response.redirect('/')
        }
    });
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port'));
});
