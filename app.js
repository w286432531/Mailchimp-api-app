require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");

app.use(bodyParser.urlencoded({ extended: true }));
// to use static file make a folder name public
// then use app.use(express.static(file folder name))
app.use(express.static(__dirname + "/public"));
//mailchimp set up

//
// mailchimp.setConfig({
//   apiKey: process.env.API_KEY,
//   server: "us2",
// });

async function run() {
  const response = await mailchimp.ping.get();
  console.log(response);
}
//  check if mailchimp is working
// const run = async () => {
//   const response = await mailchimp.lists.getAllLists();
//   console.log(response);
// };
//
// run();

// get root html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

// app.post("/", function(req,res){
//   var firstName = req.body.firstName;
//   var lastName = req.body.lastName;
//   var email = req.body.email;
//   async function addmember() {
//     const response = await mailchimp.lists.setListMember(process.env.LIST_ID, {email_address: email,
//         status: "subscribed",
//         merge_fields: {
//           FNAME: firstName,
//           LNAME: lastName
//         }
//       });
//     console.log(response);
//   }
//   addmember();
//   res.sendFile(__dirname+"/success.html")
// });

app.post("/", function (req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  const jsonData = JSON.stringify(data);
  //add api url
  const url = process.env.URL;
  //add method to options
  const options = {
    method: "post",
    auth: process.env.AUTH,
  };
  const request = https.request(url, options, function (response) {
    console.log(response.statusCode);
    if (response.statusCode == 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function (data) {
      const parseData = JSON.parse(data);
      // console.log(parseData);
    });
  });
  request.write(jsonData);
  request.end();
});

app.post("/failure", function (req, res) {
  res.redirect("/");
});

// port must be in CAPS

app.listen(process.env.PORT || 3000, function () {
  console.log("server is running");
});

