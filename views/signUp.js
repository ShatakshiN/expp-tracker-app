/* async function sendUserData(event){
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.mail.value; 
    const password = event.target.password.value;
    
    console.log('frontend', { name, email, password }); 
    
    obj = {
        name,
        email,
        password
    }

    try{
        const response = await axios.post('http://localhost:4000/signUp',obj)
        if(response.data.message === 'user already exists'){
            alert("user already exists !")
        }
        else{
            alert('successfully signed in!')
            window.location.href = 'login.html';

        }

    }catch(error){
        console.log(error)
        
    }
}; */
document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('signUpForm');
    signUpForm.onsubmit = sendUserData;

    async function sendUserData(event) {
        event.preventDefault();
        const name = event.target.name.value;
        const email = event.target.mail.value; 
        const password = event.target.password.value;

        console.log('frontend', { name, email, password });

        const obj = {
            name,
            email,
            password
        };

        try {
            const response = await axios.post('http://3.81.210.55/signUp', obj);
            if (response.data.message === 'user already exists') {
                alert("User already exists!");
            } else {
                alert('Successfully signed in!');
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.log(error);
        }
    }
});
