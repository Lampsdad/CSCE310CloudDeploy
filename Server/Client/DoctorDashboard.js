async function viewAppointments() {
    const response = await fetch('/viewAppointments', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
            'AccountType': `Doctor`
        }
    });

    const data = await response.json();

    const appointmentResults = document.getElementById('appointmentResults');
    appointmentResults.innerHTML = '';

    if (data.length > 0) {
        data.forEach(appointment => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Patient: ${appointment.patientid}, Date: ${appointment.appointmentdate}, Description: ${appointment.description}</p>`;
            appointmentResults.appendChild(div);
        });
    } else {
        appointmentResults.innerHTML = '<p>No appointments found</p>';
    }
}

async function createBill(){
    const patientid = document.getElementById('patientId').value;
    const bill = document.getElementById('billAmount').value;

    // Check if any of the fields are empty
    if (!patientid || !bill) {
        alert('Please fill out all fields');
        return;
    }

    const response = await fetch('/createBill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ patientid, bill})
    });

    const data = await response.json();

    if (data.success) {
        alert('Bill created successfully');
    } else {
        alert('Failed to create bill');
    }
}

async function deleteBill(){
    const billid = document.getElementById('billId').value;

    const response = await fetch('/deleteBill', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ billid })
    });

    const data = await response.json();

    if (data.success) {
        alert('Bill deleted successfully');
    } else {
        alert('Failed to delete bill');
    }
}

async function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

async function getAccountInfo(){
    const response = await fetch('/getAccountInfo', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
            'AccountType': `Doctor`,
        },
    });

    const data = await response.json();
    
    const accountInfo = document.getElementById('accountInfo');
    accountInfo.innerHTML = '';

    if (data.length > 0) {
        data.forEach(account => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Name: ${account.name}, Specialty: ${account.specialty}, Location: ${account.loc}, Phone: ${account.phone}, Email: ${account.email}</p>`;
            accountInfo.appendChild(div);
        });
    } else {
        accountInfo.innerHTML = '<p>No account found</p>';
    }
}

async function editProfile() {
    const name = document.getElementById('name').value;
    const specialty = document.getElementById('specialty').value;
    const loc = document.getElementById('location').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Check if any of the fields are empty
    if (!name || !specialty || !loc || !phone || !email || !password) {
        alert('Please fill out all fields');
        return;
    }

    const response = await fetch('/editProfile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
            'AccountType': `Doctor`,
        },
        body: JSON.stringify({ name, specialty, loc, phone, email, password })
    });

    const data = await response.json();

    if (data.success) {
        alert('Profile updated successfully');
        //clear token and push back to login
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    } else {
        alert('Failed to update profile');
    }
}

async function deleteAccount() {
    const response = await fetch('/deleteAccount', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
            'AccountType': `Doctor`,
        }
    });

    const data = await response.json();

    if (data.success) {
        alert('Account deleted successfully');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    } else {
        alert('Failed to delete account');
    }
}