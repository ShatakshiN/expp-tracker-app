async function sendUserData(event){
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.mail.value; 
    const password = event.target.password.value;
    
    obj = {
        name,
        email,
        password
    }

    try{
        const response = await axios.post('http://localhost:4000/signUp',obj)
        if(response.data.includes('user already exists !')){
            alert("user already exists !")
        } 

    }catch(error){
        console.log(error)
        
    }
};