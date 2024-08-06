async function searchDoctors() {
    const specialty = document.getElementById('specialty').value;
    const location = document.getElementById('location').value;
    const data2 = {specialty, location};

    const response = await fetch(`/getDoctors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify(data2)
    });

    const data = await response.json();
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (data.length > 0) {
        data.forEach(doctor => {
            const div = document.createElement('div');
            div.innerHTML = `<p>${doctor.doctorid} - {doctor.name} - ${doctor.specialty} - ${doctor.loc} - ${doctor.phone}</p>`;
            searchResults.appendChild(div);
        });
    } else {
        searchResults.innerHTML = '<p>No doctors found</p>';
    }
}

async function leaveReview() {
    const doctorId = document.getElementById('ReviewdoctorId').value;
    const rating = document.getElementById('Reviewrating').value;
    const review = document.getElementById('Reviewreview').value;

    const response = await fetch('/leaveReview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ doctorId, rating, review })
    });

    const data = await response.json();

    if (data.success) {
        alert('Review submitted successfully');
    } else {
        alert('Failed to submit review');
    }
};

async function getDoctorReviews() {
    const doctorId = document.getElementById('doctorId').value;
    const data2 = {doctorId};

    const response = await fetch(`/getDoctorReviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify(data2)
    });

    const data = await response.json();

    const reviewResults = document.getElementById('reviewResults');
    reviewResults.innerHTML = '';

    if (data.length > 0) {
        data.forEach(review => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Rating: ${review.rating}, Review: ${review.review}</p>`;
            reviewResults.appendChild(div);
        });
    } else {
        reviewResults.innerHTML = '<p>No reviews found</p>';
    }
}


async function createAppointment() {
    const doctorId = document.getElementById('appointmentDoctorId').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const description = document.getElementById('description').value;

    const response = await fetch('/createAppointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ doctorId, appointmentDate, description })
    });

    const data = await response.json();

    if (data.success) {
        alert('Appointment created successfully');
    } else {
        alert('Failed to create appointment');
    }
};


async function viewBills() {
    const response = await fetch('/viewBills', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        }
    });

    const data = await response.json();

    const billResults = document.getElementById('billResults');
    billResults.innerHTML = '';

    if (data.length > 0) {
        data.forEach(bill => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Bill ID: ${bill.billid}, Amount: $${bill.bill}</p>`;
            billResults.appendChild(div);
        });
    } else {
        billResults.innerHTML = '<p>No bills found</p>';
    }
}

async function viewAppointments() {
    const response = await fetch('/viewAppointments', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
            'AccountType': `Patient`
        }
    });

    const data = await response.json();

    const appointmentResults = document.getElementById('appointmentResults');
    appointmentResults.innerHTML = '';

    if (data.length > 0) {
        data.forEach(appointment => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Doctor: ${appointment.doctorid}, Date: ${appointment.appointmentdate}, Description: ${appointment.description}</p>`;
            appointmentResults.appendChild(div);
        });
    } else {
        appointmentResults.innerHTML = '<p>No appointments found</p>';
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
            'AccountType': `Patient`,
        },
    });

    const data = await response.json();
    
    const accountInfo = document.getElementById('accountInfo');
    accountInfo.innerHTML = '';

    if (data.length > 0) {
        data.forEach(account => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Name: ${account.name}, Phone: ${account.phone}, Email: ${account.email}</p>`;
            accountInfo.appendChild(div);
        });
    } else {
        accountInfo.innerHTML = '<p>No account found</p>';
    }
}

async function editProfile() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Check if any of the fields are empty
    if (!name || !phone || !email || !password) {
        alert('Please fill out all fields');
        return;
    }

    const response = await fetch('/editProfile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
            'AccountType': `Patient`,
        },
        body: JSON.stringify({ name, phone, email, password })
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
            'AccountType': `Patient`,
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