const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

// server port and hostname
const port = 3000;
const hostname = 'localhost';
const secretKey = 'AIUdlHDSFIUh)*Q@U$ORFSJNDKJF';


// setting up the connection to the PSQL database
const client = new Client({
    connectionString: 'postgresql://postgres1:OFxTqKxLDjCirxD3lmh1CSzYavgof1yU@dpg-cqg321dds78s73c8721g-a.oregon-postgres.render.com/postgres1_h1qw',
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Connection error', err.stack));

// Function to handle serving static files
function serveStaticFile(filePath, contentType, res) {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Function to parse cookies from the request header
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, ...rest] = cookie.split('=');
            cookies[name.trim()] = rest.join('=').trim();
        });
    }
    return cookies;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'POST' && (pathname === '/login' || pathname === '/register')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const data = JSON.parse(body);
            const { userType, email, password } = data;

            if (pathname === '/register') {
                //print to console that a new user is being registered
                console.log('A new user is being registered');
                var registrationChecker = 1;
                // check if the email already exists in the database
                if (userType === 'doctor') {
                    try {
                        const result = await client.query('SELECT * FROM doctors WHERE email = $1', [email]);
                        if (result.rows.length > 0) {
                            res.writeHead(409, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Email already exists' }));
                            registrationChecker = 0;
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Database error' }));
                        registrationChecker = 0;
                    }
                }
                else if (userType === 'patient') {
                    try {
                        const result = await client.query('SELECT * FROM patients WHERE email = $1', [email]);
                        if (result.rows.length > 0) {
                            res.writeHead(409, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Email already exists' }));
                            registrationChecker = 0;
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Database error' }));
                        registrationChecker = 0;
                    }
                }
                
                if (userType === 'doctor' && registrationChecker == 1) {
                    const { name, specialty, loc, phone } = data;
                    try {
                        await client.query('INSERT INTO doctors (name, specialty, loc, phone, email, password) VALUES ($1, $2, $3, $4, $5, $6)', 
                        [name, specialty, loc, phone, email, password]);
                        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ token }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Registration failed' }));
                    }
                } else if (userType === 'patient' && registrationChecker == 1) {
                    const { name, phone } = data;
                    try {
                        await client.query('INSERT INTO patients (name, phone, email, password) VALUES ($1, $2, $3, $4)', 
                        [name, phone, email, password]);
                        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ token }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Registration failed' }));
                    }
                }
            } else if (pathname === '/login') {
                //print to console that a user is logging in
                console.log('A user is logging in');
                if (userType === 'doctor') {
                    try {
                        const result = await client.query('SELECT * FROM doctors WHERE email = $1 AND password = $2', [email, password]);
                        if (result.rows.length > 0) {
                            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, token }));
                        } else {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Login failed' }));
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Database error' }));
                    }
                } else if (userType === 'patient') {
                    try {
                        const result = await client.query('SELECT * FROM patients WHERE email = $1 AND password = $2', [email, password]);
                        if (result.rows.length > 0) {
                            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, token }));
                        } else {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Login failed' }));
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Database error' }));
                    }
                }
            }
        });
    } else if (pathname === '/getDoctors' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const data = JSON.parse(body);
            const { location, specialty } = data;
            //print to console that the doctors are being retrieved
            console.log('Doctors are being retrieved');
            if (!location || !specialty) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing location or specialty' }));
                return;
            }
            try {
                const result = await client.query('SELECT * FROM doctors WHERE loc = $1 AND specialty = $2', [location, specialty]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database query failed' }));
            }
        });
        } else if (pathname === '/leaveReview' && req.method === 'POST') {
        //print to console that a review is being left
        console.log('A review is being left');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const data = JSON.parse(body);
            const { doctorId, rating, review } = data;
            try {
                console.log('making query: ', 'INSERT INTO reviews (doctorID, rating, review) VALUES ($1, $2, $3)', [doctorId, rating, review]);
                await client.query('INSERT INTO reviews (doctorID, rating, review) VALUES ($1, $2, $3)', [doctorId, rating, review]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to leave review' }));
            }
        });
    } else if (pathname === '/createAppointment' && req.method === 'POST') {
        //print to console that an appointment is being created
        console.log('An appointment is being created');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                try {
                    const result = await client.query('SELECT patientID FROM patients WHERE email = $1', [email]);
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    patientid = result.rows[0].patientid;
                    req.on('end', async () => {
                        const data = JSON.parse(body);
                        const { doctorId, appointmentDate, description } = data;
                        try {
                            await client.query('INSERT INTO appointments (doctorID, patientid, appointmentDate, description) VALUES ($1, $2, $3, $4)', [doctorId, patientid, appointmentDate, description]);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        } catch (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to create appointment' }));
                        }
                    });
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to retrieve patientID' }));
                }
            }
        });
    } else if (pathname == '/createBill' && req.method === 'POST'){
        // print to the console that a bill is being created
        console.log('A bill is being created');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', async () => {
                    const data = JSON.parse(body);
                    const { patientid, bill} = data;
                    try {
                        await client.query('INSERT INTO bills (patientid, bill) VALUES ($1, $2)', [patientid, bill]);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to create bill' }));
                    }
                });
            }
        });
    } else if (pathname === '/deleteBill' && req.method === 'DELETE') {
        //print to console that the bill is being deleted
        console.log('Bill is being deleted');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const data = JSON.parse(body);
            const { billid } = data;
            try {
                await client.query('DELETE FROM bills WHERE billid = $1', [billid]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to delete bill' }));
            }
        });
    } else if (pathname === '/viewBills' && req.method === 'GET') {
        //print to console that the bills are being retrieved
        console.log('Bills are being retrieved');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                try {
                    const result = await client.query('SELECT * FROM bills WHERE patientID = (SELECT patientID FROM patients WHERE email = $1)', [email]);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result.rows));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to retrieve bills' }));
                }
            }
        });
    } else if (pathname === '/getDoctorReviews' && req.method === 'POST') {
        // print to console that the reviews are being retrieved
        console.log('Reviews are being retrieved');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const data = JSON.parse(body);
            const { doctorId } = data;

            try {
                const result = await client.query('SELECT * FROM reviews WHERE doctorID = $1', [doctorId]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows));
            }
            catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to retrieve reviews' }));
            }
        }
        );
    } else if (pathname === '/editProfile' && req.method === 'GET') {
        //print to console that the profile is being edited
        console.log('Profile is being edited');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                try {
                    const result = await client.query('SELECT * FROM patients WHERE email = $1', [email]);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result.rows));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to retrieve profile' }));
                }
            }
        });
    } else if (pathname === '/viewAppointments' && req.method === 'GET') {
        // print to console that the appointments are being retrieved
        console.log('Appointments are being retrieved');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                try {
                    // Check if the request has the AccountType header of Patient or Doctor
                    const accountType = req.headers.accounttype;
                    if (accountType === 'Patient') {
                        const result = await client.query('SELECT * FROM appointments WHERE patientID = (SELECT patientID FROM patients WHERE email = $1)', [email]);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result.rows));
                    } else if (accountType === 'Doctor') {
                        const result = await client.query('SELECT * FROM appointments WHERE doctorID = (SELECT doctorID FROM doctors WHERE email = $1)', [email]);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result.rows));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing AccountType header' }));
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to retrieve appointments' }));
                }
            }
        });
    } else if (pathname === '/getAccountInfo' && req.method === 'GET') {
        // print to console that the account info is being retrieved
        console.log('Account info is being retrieved');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                try {
                    // Check if the request has the AccountType header of Patient or Doctor
                    const accountType = req.headers.accounttype;
                    if (accountType === 'Patient') {
                        const result = await client.query('SELECT * FROM patients WHERE email = $1', [email]);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result.rows));
                    } else if (accountType === 'Doctor') {
                        const result = await client.query('SELECT * FROM doctors WHERE email = $1', [email]);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result.rows));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing AccountType header' }));
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to retrieve account info' }));
                }
            }
        });
    } else if (pathname === '/editProfile' && req.method === 'POST') {
        //print to console that the profile is being edited
        console.log('Profile is being edited');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', async () => {
    
                    try {
                        // Check if the request has the AccountType header of Patient or Doctor
                        const accountType = req.headers.accounttype;
                        if (accountType === 'Patient') {
                            const data = JSON.parse(body);
                            const { name, phone, email, password } = data;
                            await client.query('UPDATE patients SET name = $1, phone = $2, email = $3, password = $4 WHERE email = $5', [name, phone, email, password, email]);
                            //return success
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        } else if (accountType === 'Doctor') {
                            const data = JSON.parse(body);
                            const { name, specialty, loc, phone, email, password } = data;
                            console.log("Updating doctor profile");
                            await client.query('UPDATE doctors SET name = $1, specialty = $2, loc = $3, phone = $4, email = $5, password = $6 WHERE email = $5', [name, specialty, loc, phone, email, password]);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        } else {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Missing AccountType header' }));
                        }
                    } catch (err) {
                        console.log(err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to update profile' }));
                    }
                });
            }
        });
    } else if (pathname === '/deleteAccount' && req.method === 'DELETE') {
        //print to console that the account is being deleted
        console.log('Account is being deleted');
        // Retrieve the patientID associated with the email in the token
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                const email = decoded.email;
                try {
                    // Check if the request has the AccountType header of Patient or Doctor
                    const accountType = req.headers.accounttype;
                    if (accountType === 'Patient') {
                        await client.query('DELETE FROM patients WHERE email = $1', [email]);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } else if (accountType === 'Doctor') {
                        await client.query('DELETE FROM doctors WHERE email = $1', [email]);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing AccountType header' }));
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to delete account' }));
                }
            }
        });
    } else if (pathname === '/') {
        //print to console that the main page is being served
        console.log('Default Reference Page is being served');
        serveStaticFile(path.join(__dirname, 'Client', 'login.html'), 'text/html', res);
    } else if (pathname === '/login.html') {
        //print to console that the login page is being served
        console.log('Login page is being served');
        serveStaticFile(path.join(__dirname, 'Client', 'login.html'), 'text/html', res);
    } else if (pathname === '/PatientDashboard.html') {
        //print to console that the dashboard page is being served
        // Extract the token from cookies
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        console.log('Token:', token);
        jwt.verify(token, secretKey, (err, decoded) => {
            // If the token is invalid, return an error
            if (err) {
                //print to console that the token is invalid
                console.log('Invalid token');
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                //print to console that the dashboard page is being served and the decoded email
                console.log('Patient Dashboard page is being served');
                console.log('Decoded email:', decoded.email);
                serveStaticFile(path.join(__dirname, 'Client', 'PatientDashboard.html'), 'text/html', res);
            }
        });
    } else if (pathname === '/DoctorDashboard.html') {
        //print to console that the dashboard page is being serv
        // Extract the token from cookies
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token;
        console.log('Token:', token);
        jwt.verify(token, secretKey, (err, decoded) => {
            // If the token is invalid, return an error
            if (err) {
                //print to console that the token is invalid
                console.log('Invalid token');
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid token' }));
            } else {
                //print to console that the dashboard page is being served and the decoded email
                console.log('Doctor Dashboard page is being served');
                console.log('Decoded email:', decoded.email);
                serveStaticFile(path.join(__dirname, 'Client', 'DoctorDashboard.html'), 'text/html', res);
            }
        });
    } else {
        serveStaticFile(path.join(__dirname, 'Client', pathname), getContentType(pathname), res);
    } 
});

function getContentType(filePath) {
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };
    return mimeTypes[extname] || 'application/octet-stream';
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
