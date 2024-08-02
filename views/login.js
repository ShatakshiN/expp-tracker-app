/* document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.onsubmit = sendData;
});

async function sendData(event){
    event.preventDefault();
    console.log('Form submitted'); // Check if this gets logged
    const email  = event.target.mail.value;
    const password = event.target.password.value;
    console.log('Email:', email); // Check if email is correct
    console.log('Password:', password); // Check if password is correct
    obj = {
        email,
        password
    }

    try{
        const response  = await axios.post('http://localhost:4000/login',obj);  
        if (response.status ===200){
            //const userId = response.data.id; // Extracting the user id
            //console.log(userId)
            //window.location.href = `daily.html?id=${userId}`;
            localStorage.setItem('token', response.data.token)
            window.location.href = 'daily.html';
        }    
    }
    catch(error){
        console.log(error)
        showAlert(error.response.data.msg);    
        console.log('Login error:', error.response ? error.response.data.msg : error.message);
        showAlert(error.response ? error.response.data.msg : 'An error occurred');
    }
}

function showAlert(str){
    if(str ==="password incorrect"){
        const parentElem = document.getElementById('loginForm');
        const childElem = document.createElement('div');
        childElem.className = 'alert alert-danger';
        childElem.role = 'alert';
        childElem.textContent = 'incorrect Password! please try again';
        const okButton = document.createElement('button');
        okButton.className = 'btn btn-dark';
        okButton.textContent = 'OK';
        // Add click event listener to the OK button
        okButton.addEventListener('click', function() {
            parentElem.removeChild(childElem); // Remove the alert from the DOM
        });
        
        childElem.appendChild(okButton);
        //parentElem.appendChild(childElem);
        parentElem.insertBefore(childElem, parentElem.firstChild);

    }
    if(str=== "user doesn't exist"){
        const parentElem = document.getElementById('loginForm');
        const childElem = document.createElement('div');
        childElem.className = 'alert alert-danger';
        childElem.role = 'alert';
        childElem.textContent = "user Doesn't exists!";
        const okButton = document.createElement('button');
        okButton.className = 'btn btn-dark';
        okButton.textContent = 'OK';
        // Add click event listener to the OK button
        okButton.addEventListener('click', function() {
            parentElem.removeChild(childElem); // Remove the alert from the DOM
        });
        
        childElem.appendChild(okButton);
        //parentElem.appendChild(childElem);
        parentElem.insertBefore(childElem, parentElem.firstChild);

    }
    
}; */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.onsubmit = sendData;

    async function sendData(event) {
        event.preventDefault();
        console.log('Form submitted'); // Check if this gets logged

        const email = event.target.mail.value;
        const password = event.target.password.value;
        console.log('Email:', email); // Check if email is correct
        console.log('Password:', password); // Check if password is correct

        const obj = {
            email,
            password
        };

        try {
            const response = await axios.post('http://localhost:4000/login', obj);
            console.log('Response:', response); // Check the response
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                window.location.href = 'daily.html';
            }    
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data.msg : error.message);
            showAlert(error.response ? error.response.data.msg : 'An error occurred');
        }
    }

    function showAlert(str) {
        const parentElem = document.getElementById('loginForm');
        const childElem = document.createElement('div');
        childElem.className = 'alert alert-danger';
        childElem.role = 'alert';
        childElem.textContent = str;
        const okButton = document.createElement('button');
        okButton.className = 'btn btn-dark';
        okButton.textContent = 'OK';
        okButton.addEventListener('click', () => {
            parentElem.removeChild(childElem);
        });
        childElem.appendChild(okButton);
        parentElem.insertBefore(childElem, parentElem.firstChild);
    }
});
