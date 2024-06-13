async function forgotPassword(event){
    event.preventDefault();
    const email=event.target.email.value;
    obj = {
        email
    }
    try{
        const send_email= await axios.post('http://localhost:4000/forgotPassword',obj);
        console.log(send_email)

    }catch(err){
        console.log(err)
    }  
}