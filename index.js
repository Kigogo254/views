const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv');


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
};
// Check if a user with the same phone number exists
app.post("/checkuser", (req, res) => {
  const { phone } = req.body;

  const checkUserQuery = `
    SELECT * FROM users
    WHERE phone = ?
  `;

  db.query(checkUserQuery, [phone], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking existing user:', checkErr);
      res.status(500).send('Error checking existing user');
    } else {
    if (checkResult.length > 0) {
        // User with the same phone number already exists
        res.status(200).json({ exists: true, user: checkResult[0] });
      } else {
        // User does not exist
        console.log('New user');
        res.status(200).json({ exists: false });
      }
    }
  });
});

app.post("/checkreferral", (req, res) => {
  const { referralCode } = req.body;

  const checkReferralQuery = `
    SELECT * FROM users
    WHERE referralCode = ?
  `;

  db.query(checkReferralQuery, [referralCode], (err, result) => {
    if (err) {
      console.error('Error checking referral:', err);
      res.status(500).send('Error checking referral');
    } else {
      if (result.length > 0) {
        // Referral code is associated with the given phone number
        res.status(200).json({ exists: true });
      } else {
        // Referral code does not exist or is not associated with the given phone number
        res.status(200).json({ exists: false });
      }
    }
  });
});
app.post("/updatereferrals", (req, res) => {
  const { referralCode } = req.body;

  const updateReferralCountQuery = `
    UPDATE users
    SET referrals = referrals + 1
    WHERE referralCode = ?
  `;

  db.query(updateReferralCountQuery, [referralCode], (err, result) => {
    if (err) {
      console.error('Error updating referral count:', err);
      res.status(500).send('Error updating referral count');
    } else {
      res.status(200).json({ message: 'Referral count updated successfully' });
    }
  });
});
app.post("/updatebalance", (req, res) => {
  const { referralCode, newbalance } = req.body;

  const updateBalanceQuery = `
    UPDATE users
    SET balance = ?
    WHERE referralCode = ?
  `;

  db.query(updateBalanceQuery, [newbalance, referralCode], (err, result) => {
    if (err) {
      console.error('Error updating balance:', err);
      res.status(500).send('Error updating balance');
    } else {
      res.status(200).json({ message: 'Balance updated successfully' });
    }
  });
});

app.post('/signup', (req, res) => {
  const {
    phone,
    password,
    tiktokName,
    instagramName,
    youtubeName,
    referrals,
    bonusAmountTL,
    bonusAmountRefs,
    balance,
    bonusAmountTasks,
    userName,
    userEmail,
  } = req.body;

  const referralCode = generateReferralCode();

  const insertUserQuery = `
    INSERT INTO users (
      phone,
      password,
      referralCode,
      tiktokName,
      instagramName,
      youtubeName,
      referrals,
      bonusAmountTL,
      bonusAmountRefs,
      balance,
      bonusAmountTasks,
      userName,
      userEmail
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertUserQuery,
    [
      phone,
      password,
      referralCode,
      tiktokName,
      instagramName,
      youtubeName,
      referrals,
      bonusAmountTL,
      bonusAmountRefs,
      balance,
      bonusAmountTasks,
      userName,
      userEmail,
    ],
    (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Error creating user');
      } else {
        res.status(201).json({ message: 'User created successfully' });
      }
    }
  );
});

app.post("/signin", (req, res) => {
  const { phone, password } = req.body;

  const checkUserQuery = `
    SELECT * FROM users
    WHERE phone = ? AND password = ?
  `;

  db.query(checkUserQuery, [phone, password], (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      res.status(500).send('Error checking user');
    } else {
      if (result.length > 0) {
        const userData = result[0];
        res.status(200).send(userData);
      } else {
        res.status(401).send('Invalid credentials');
      }
    }
  });
});

app.post("/submitTasks", (req, res) => {
  const { id } = req.body;

  // Validate input if needed

  const submitTaskQuery = `
    UPDATE users
    SET submitted = true
    WHERE id = ?
  `;

  db.query(submitTaskQuery, [id], (err, result) => {
    if (err) {
      console.error('Error submitting task:', err);
      res.status(500).json({ error: 'Error submitting task' });
    } else {
      res.status(200).json({ message: 'Task submitted successfully' });
    }
  });
});

app.post("/submitDeal", (req, res) => {

 const { dealCode, email, name, phoneNumber, accountName } = req.body;

  // Validate input if needed

  const insertDealQuery = `
    INSERT INTO deals
    ( dealCode, email, name, phoneNumber, accountName)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    insertDealQuery,
    [dealCode, email, name, phoneNumber, accountName],
    (err, result) => {
      if (err) {
        console.error('Error submitting deal:', err);
        res.status(500).send('Error submitting deal');
      } else {
        res.status(200).json({ message: 'Deal submitted successfully' });
      }
    }
  );
});

app.post("/submitWithdrawal", (req, res) => {
  const { phone, amount } = req.body;

  // Validate input if needed

  const insertWithdrawalQuery = `
    INSERT INTO withdrawals
    (phone, amount)
    VALUES (?, ?)
  `;

  db.query(insertWithdrawalQuery, [phone, amount], (err, result) => {
    if (err) {
      console.error('Error submitting withdrawal:', err);
      res.status(500).send('Error submitting withdrawal');
    } else {
      res.status(200).json({ message: 'Withdrawal submitted successfully' });
    }
  });
});

app.get("/teams", (req, res) => {
  // Your logic for fetching and returning teams data from the "users" table
  const query = "SELECT id, referralCode FROM users WHERE referralCode IS NOT NULL";

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching teams:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Organize the fetched data into teams
      const userTeams = {};

      result.forEach(user => {
        const { id, referralCode } = user;

        // If the user has a referralCode
        if (referralCode) {
          // If the referralCode is not in userTeams, add an empty array
          userTeams[referralCode] = userTeams[referralCode] || [];
          
          // Add the user id to the team
          userTeams[referralCode].push({ id, accountLabel })
        }
      });

      // Convert the userTeams object to an array of team objects
      const teamsArray = Object.entries(userTeams).map(([referralCode, teamMembers]) => ({
        teamLeader: referralCode,
        teamMembers,
      }));

      res.json(teamsArray);
    }
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});


