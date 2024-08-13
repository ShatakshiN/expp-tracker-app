async function forgotPassword(event){
    event.preventDefault();
    const email=event.target.email.value;
    obj = {
        email
    }
    try{
        const send_email= await axios.post('http://3.81.210.55/forgotPassword',obj);
        console.log(send_email)

    }catch(err){
        console.log(err)
    }  
}
