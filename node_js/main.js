const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcrypt');
const { URL } = require('url');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');

require('dotenv').config()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  
}));
const port = process.env.PORT || 3000; 


app.use(express.json());


app.use(express.static(path.join('C:/xampp/htdocs/Quiz', 'code')));


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'quiz', 
  charset: 'utf8mb4',
};


async function dbConnect() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MariaDB/MySQL database');
    return connection;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Error handling function
function error_message(res, text, errorCode = null) {
  const response = {
    status: 0,
    error_message: text,
  };
  if (errorCode) {
    response.error_code = errorCode;
  }
  res.status(500).json(response);
}

// Function to get URL source
function URL_source(username) {
  const url = new URL(`/users/${username}`, 'http://localhost:3000'); 
  return url.toString();
}


async function user_already_exists(username, connection) {
  try {
    const [rows, fields] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
}

// Route to add a new user
app.post('/api/users', async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error_message: 'Missing username, email, or password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    if (await user_already_exists(username, connection)) {
      return res.status(409).json({ error_message: 'User already exists!' });
    }

    const [result] = await connection.execute('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [
      username,
      email,
      hashedPassword,
    ]);
    const insertedUserId = result.insertId;

    // Generate JWT token
    const accessToken = jwt.sign({ username: username}, process.env.ACCESS_TOKEN_SECRET);
      
  
    // Send the JWT token as the response
    res.status(200).json({ accessToken });

  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({ error_message: 'Error adding user', error_code: 123 });
  } /*finally {
    connection.end();
  }*/
});

// Route to get all users
app.get('/api/users', async (req, res) => {
const connection = await dbConnect();
try {
  if (req.query.username) {
    const username = req.query.username;
    const [rows, fields] = await connection.execute('SELECT username, email, password FROM user WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]); // Return the first row found
    } else {
      res.status(404).json({ error_message: 'User not found' }); 
    }
  } else {
    const [rows, fields] = await connection.execute('SELECT username, email, password FROM user');
    res.status(200).json(rows); // Return all users
  }
} catch (error) {
  console.error('Error fetching users:', error);
  error_message(res, 'Error fetching users', 666);
} /*finally {
  connection.end();
}*/
});

// Route to get a specific user by username
app.get('/api/users/:username', async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username } = req.params;
    const [rows, fields] = await connection.execute('SELECT username, email FROM user WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]); // Return the user details
    } else {
      res.status(404).json({ error_message: 'User not found' }); 
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    error_message(res, 'Error fetching user', 666);
  } /*finally {
    connection.end();
  }*/
});

// Route to get profile info based on authenticated user's token
app.get('/api/profile', authenticateToken, async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username } = req.user; 
    const [rows] = await connection.execute(
      `SELECT user.username, COUNT(quiz.result) AS quiz_count, MAX(quiz.result) AS max_result, user.registration_time 
       FROM user 
       LEFT JOIN quiz ON user.username = quiz.username 
       WHERE user.username = ?`,
      [username]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]); // Return the first row as JSON
    } else {
      res.status(404).json({ error_message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error_message: 'Error fetching profile' });
  } /*finally {
    connection.end(); // Close the database connection
  }*/
});



// Route to get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  const connection = await dbConnect();
  try {
    
    const [rows, fields] = await connection.execute('SELECT username, result FROM quiz ORDER BY result DESC LIMIT 25');
    connection.end(); 

    if (rows.length > 0) {
      res.status(200).json(rows); // Return top 25 results
    } else {
      res.status(404).json({ error_message: 'No results found' }); // Handle case where no results are found
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error_message: 'Error fetching leaderboard', error_code: 666 });
  }
});

// Route to get quizzes
app.get('/api/quiz', async (req, res) => {
    const connection = await dbConnect();
    try {
      const [rows, fields] = await connection.execute('SELECT quiz_id, username, result FROM quiz');
      connection.end(); 
  
      if (rows.length > 0) {
        res.status(200).json(rows); // Return all quizzes
      } else {
        res.status(404).json({ error_message: 'No results found' }); 
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      error_message(res, 'Error fetching quizzes', 666);
    }
  });

// Route to get all quizzes by user
app.get('/api/quiz/:username', authenticateToken, async (req, res) => {
    try {
      const connection = await dbConnect();
      const { username } = req.params;
      const [rows, fields] = await connection.execute(
        'SELECT quiz_id, result FROM quiz WHERE username= ?', [username]
      );
      await connection.end(); // Close connection
  
      if (rows.length > 0) {
        res.status(200).json(rows); // Return all rows found
      } else {
        res.status(404).json({ error_message: 'No details found' }); 
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      res.status(500).json({ error_message: 'Error fetching quiz details' }); 
    }
  });

// Route to add quiz results
app.post('/api/quiz', async (req, res) => {
    const connection = await dbConnect();
    try {
      const { username, result } = req.body;
  
      if (!username || !result) {
        return res.status(400).json({ error_message: 'username and result are required' });
      }
  
      const [output] = await connection.execute('INSERT INTO quiz (username, result) VALUES (?, ?)', [username, result]);
  
      res.status(201).json({ message: 'Quiz result added successfully', output });
    } catch (error) {
      console.error('Error adding details:', error);
      return res.status(500).json({ error_message: 'Error adding details', error_code: 123 });
    } 
  });

// Route to get all templates
app.get('/api/template', async (req, res) => {
    const connection = await dbConnect();
    try {
      const [rows, fields] = await connection.execute('SELECT template FROM template');
      connection.end(); 
  
      if (rows.length > 0) {
        res.status(200).json(rows); // Return all templates
      } else {
        res.status(404).json({ error_message: 'No templates found' }); 
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      error_message(res, 'Error fetching templates', 666);
    }
  });
  
// Route to get a specific template by template_id
app.get('/api/template/:template_id', async (req, res) => {
const connection = await dbConnect();
try {
    const { template_id } = req.params;
    const [rows, fields] = await connection.execute('SELECT template FROM template WHERE template_id = ?', [template_id]);
    if (rows.length > 0) {
    res.status(200).json(rows[0]); // Return the template details
    } else {
    res.status(404).json({ error_message: 'User not found' });
    }
} catch (error) {
    console.error('Error fetching template:', error);
    error_message(res, 'Error fetching template', 666);
} /*finally {
    connection.end();
}*/
});

// Route to get all countries
app.get('/api/country', async (req, res) => {
    const connection = await dbConnect();
    try {
        const [rows, fields] = await connection.execute('SELECT country, capital_city, flag, region FROM country');
        connection.end(); // Close connection after query is executed
    
        if (rows.length > 0) {
        res.status(200).json(rows); // Return all countries
        } else {
        res.status(404).json({ error_message: 'No templates found' }); 
        }
    } catch (error) {
        console.error('Error fetching countries:', error);
        error_message(res, 'Error fetching countries', 666);
    }
    });

// Route to get a specific country by country_id
app.get('/api/country/:country_id', async (req, res) => {
    const connection = await dbConnect();
    try {
        const { country_id } = req.params;
        const [rows, fields] = await connection.execute('SELECT country, capital_city, flag, region FROM country WHERE country_id = ?', [country_id])
        if (rows.length > 0) {
        res.status(200).json(rows[0]); // Return the profile details
        } else {
        res.status(404).json({ error_message: 'Country not found' }); 
        }
    } catch (error) {
        console.error('Error fetching country:', error);
        error_message(res, 'Error fetching country', 666);
    } /*finally {
        connection.end();
    }*/
    });

// Route to get a specific capital city by country_id
app.get('/api/capital/:country_id', async (req, res) => {
    const connection = await dbConnect();
    try {
        const { country_id } = req.params;
        const [rows, fields] = await connection.execute('SELECT capital_city FROM country WHERE country_id = ?', [country_id])
        if (rows.length > 0) {
        res.status(200).json(rows[0]); // Return the capital city
        } else {
        res.status(404).json({ error_message: 'Country not found' }); // Handle case where no country found
        }
    } catch (error) {
        console.error('Error fetching capital:', error);
        error_message(res, 'Error fetching capital', 666);
    } /*finally {
        connection.end();
    }*/
    });

// Route to get details by quiz_id
app.get('/api/details/:username', async (req, res) => {
  let connection;
  try {
    connection = await dbConnect();
    const { username } = req.params; 
    const [rows, fields] = await connection.execute(
      'SELECT qd.quiz_id, qd.question, qd.answer, qd.correct ' +
      'FROM quiz_details qd ' +
      'JOIN quiz q ON qd.quiz_id = q.quiz_id ' +
      'JOIN user u ON q.username = u.username ' +
      'WHERE u.username = ?',
      [username]
    );

    if (rows.length > 0) {
      res.status(200).json(rows); // Return all rows found
    } else {
      res.status(404).json({ error_message: 'No details found' }); 
    }
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    res.status(500).json({ error_message: 'Error fetching quiz details' }); 
  } finally {
    if (connection) {
      await connection.end(); 
    }
  }
});

// Route to add quiz details
app.post('/api/details', async (req, res) => {
    let connection;
    try {
      connection = await dbConnect();
      const { quiz_id, template_id, country_id, question, answer, correct } = req.body;
  
      if (!quiz_id || !template_id || !country_id || !question || !answer || typeof correct === 'undefined') {
        return res.status(400).json({ error_message: 'Missing quiz_id, template_id, country_id, question, answer, correct' });
      }
  
      const [result] = await connection.execute(
        'INSERT INTO quiz_details (quiz_id, template_id, country_id, question, answer, correct) VALUES (?, ?, ?, ?, ?, ?)',
        [quiz_id, template_id, country_id, question, answer, correct]
      );
  
      res.status(201).json({ message: 'Quiz details added successfully', result });
    } catch (error) {
      console.error('Error adding details:', error.message); 
      return res.status(500).json({ error_message: 'Error adding details', error_code: 123, error_detail: error.message });
    } finally {
      if (connection) {
        connection.end(); 
      }
    }
  });
  
app.post('/api/login', async (req, res) => {
  const connection = await dbConnect();
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error_message: 'Missing username or password' });
    }

    
    const [rows] = await connection.execute('SELECT * FROM user WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ error_message: 'User not found' });
    }

    const user = rows[0];

    // Compare the plain text password from the request with the hashed password from the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error_message: 'Incorrect password' });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ username: user.username}, process.env.ACCESS_TOKEN_SECRET);
    

    // Send the JWT token as the response
    res.status(200).json({ accessToken });

    
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ error_message: 'Error logging in user', error_code: 456 });
  } /*finally {
    connection.end();
  }*/
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // If no token, return Unauthorized status

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // If token is invalid, return Forbidden status
    req.user = user;
    next(); // Pass the execution to the next middleware/route handler
  });
}
  

// Route to handle GET request to /leaderboard/ (render leaderboard.html)
  app.get('/leaderboard/',  (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'leaderboard.html'));
});

// Route to handle GET request to /profile/ (render profile.html)
  app.get('/profile',  (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'profile.html'));
});

// Route to handle GET request to /quiz/ (render quiz.html)
app.get('/quiz/', authenticateToken, (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'quiz.html'));
});

// Route to handle GET request to /index/ (render index.html)
app.get('/index/', authenticateToken, (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'index.html'));
});

// Route to handle GET request to /login/ (render index.html)
app.get('/login/', (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'login.html'));
});

app.get('/documentation/', (req, res) => {
  res.sendFile(path.join('C:/xampp/htdocs/Quiz', 'code', 'documentation.html'));
});
  


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
