async function sendData(event){
    event.preventDefault();

    const email  = event.target.mail.value;
    const password = event.target.password.value;
    obj = {
        email,
        password
    }

    try{
        const response  = await axios.post('http://localhost:4000/login',obj);  
        if (response.status ===200){
            //const userId = response.data.id; // Extracting the user id
            console.log(userId)
            //window.location.href = `daily.html?id=${userId}`;
            window.location.href = 'daily.html';
        }    
    }
    catch(error){
        console.log(error)
        showAlert(error.response.data.msg);    
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
    
};