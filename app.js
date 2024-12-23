 const express = require('express');
 const mongoose = require('mongoose');
 const bodyParser = require('body-parser');
 const prompt=require('prompt-sync')();
 const path=require('path');
 mongoose.set('strictQuery',false);
 const app = express();
 const port = process.env.PORT || 3002;
 app.use(bodyParser.urlencoded({ extended: true }));


 app.use(express.static(path.join(__dirname, 'public')));

 // Connect to your MongoDB instance (replace 'mongodb://localhost/mydatabase' with your MongoDB URL)
 mongoose.connect('mongodb://127.0.0.1:27017/hospital', { useNewUrlParser: true, 
useUnifiedTopology: true });

 // Create a Mongoose model (schema)
 const hospital = mongoose.model('app1', {
first_name:String,
last_name:String,
gender:String,
phone:Number,
    username: String,
    email: String,
    password: String
 });
 

// Create a Mongoose model for appointment registration (schema)
const appointments  = mongoose.model('appointments', {
 
  first_name: String,
    last_name: String,
    gender: String,
    phone: Number,
    DOB: Date,
    username: String,
    email: String,
    password: String
});


 // Middleware for parsing form data
 app.use(bodyParser.urlencoded({ extended: true }));

 app.use(express.static(path.join(__dirname, 'public')));
 
 // Serve the Sign-up form
 app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/public/signup.html'));
 });
 

 // Handle form submission
 app.post('/Sign-up', (req, res) => {
 const { first_name, last_name, gender, phone, DOB, username, email, password } = req.body;
console.log('Request Body:', req.body);
 
 // Create a new User document and save it to MongoDB
 
const user = new appointments({ first_name, last_name, gender, phone, DOB, username, email, password });
    user.save()
        .then(() => {
            const successMessage = 'Registration Done Successfully!';
            return res.status(200).send(`
                <script>
                    alert("${successMessage}");
                    window.location.href = "/login.html";
                </script>
            `);
        })
        .catch(err => {
            // Handle any potential errors here
            console.error(err);
            // Respond with an error message
            res.status(500).send('An error occurred while saving the user.');
        });
});

// Serve the login form

app.get('/login', (req, res) => {
    const { email, password } = req.query;
  
    // Check if the entered details exist in the database
    hospital.findOne({email, password }).exec()
    .then(data => {
      if (data) {
        const errorMessage = 'Login Succesfully!';
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/app2.html";
        </script>
        `);
      } else {
        const errorMessage = 'INVALID LOGIN CREDENTIALS';
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>
        `);
      }
    })
    .catch(err => {
      console.error(err);
      const errorMessage = 'INVALID LOGIN CREDENTIALS';
      res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>`);
      /*res.send('Error occurred while checking login details.');*/
    });
});

// Handle form submission for tickets
app.post('/appoint', (req, res) => {
  const { name,email,phone,datetime,doctor,location,reason,notes} = req.body;
  
  // Create a new User document and save it to MongoDB
  const user = new appointments({ name,email,phone,datetime,doctor,location,reason,notes });
     user.save()
     .then(() => {
         
         const errorMessage = 'Thank You!';
         return res.status(400).send(`
         <script>
             alert("${errorMessage}");
             window.location.href = "/app2.html";
         </script>
         `);
  })
 
  .catch((err) => {
  console.error(err);
     res.status(500).send('Error saving data to MongoDB.');
  });
  });

// viewing all users
app.get('/users', async (req, res) => {
    try {
      const users = await hospital.find({}); // Find all users in the database
      res.json(users); // Send the users as a JSON response
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
    }
  });

// updating a value
// Serve the HTML form for resetting the password
app.get('/forgotpwd.html', (req, res) => {
    res.sendFile(__dirname + '/forgotpwd.html'); // Make sure the HTML file is in the same directory
});

app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Access the "app1" collection and update the password
        const result = await mongoose.connection.collection('app1').findOneAndUpdate(
            { email },
            { $set: { password: newPassword } },
            { returnOriginal: false }
        );

        if (!result.value) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Deleting a record
app.delete('/delete', async (req, res) => {
    try {
        // Find the last appointment and delete it
        const lastappointments = await appointments.findOneAndDelete({}, { sort: { _id: -1 } });

        if (!lastappointments) {
            return res.status(404).send("No appointment found to delete.");
        }

        return res.status(200).send(`Deleted: ${lastappointments.patientName}, ${lastappointments.date}`);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});


 // Start the server
 app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
 });
