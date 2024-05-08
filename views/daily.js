

async function sendData(event){
    event.preventDefault();
    const date  = event.target.date.value;
    const description = event.target.description.value;
    const amount = event.target.amount.value;
    const category = event.target.categories.value;


    obj = {
        date,
        description,
        amount,
        category,
       
    }

    try{
        const token = localStorage.getItem('token')
        const response = await axios.post('http://localhost:4000/daily-expense',obj, {headers : {'Authorization': token}});
        console.log(response.data.expense)
        showExpenseOnScreen(response.data.expense);


    }catch(error){
        console.log(error);
    }

};



function showExpenseOnScreen(obj){
    const parentElem = document.getElementById('expenseList');
    const childElem = document.createElement('li');
    childElem.textContent = `${obj.description} - ${obj.amount}`;
    const delButton  = document.createElement('button');
    childElem.className = "list-group-item";
    delButton.textContent = 'DELETE';
    childElem.appendChild(delButton);

    delButton.onclick =async(event)=>{
        try{
            await axios.delete(`http://localhost:4000/delete-expense/${obj.id}`);
            event.target.parentNode.remove();
            //parentElem.remove(childElem)
        }catch(err){
            console.log(err)
        }     
       
    }
    parentElem.appendChild(childElem)
}

document.getElementById("rzp-button1").onclick = async function (e){
    const token = localStorage.getItem('token');
    //console.log(token);
    const response = await axios.get('http://localhost:4000/buy-premium',   {headers : {'Authorization': token}});
    //console.log(response);
    console.log('payment id' +  response.razorpay_payment_id)
    var options = {
        'key' : response.data.key_id,
        'order_id' : response.data.order.id,
        //this handler function will handle the success payment
        'handler' : async function (response){
            console.log('payment id' + response.razorpay_payment_id)
            await axios.post('http://localhost:4000/updatetransectionstatus', {
                order_id : options.order_id,
                payment_id : response.razorpay_payment_id,

            }, {headers : {'Authorization' : token}})

            alert('You are now a Premium user')
        },

    };
    const rzpl  = new Razorpay(options);
    rzpl.open();
    e.preventDefault();

    //if Payment fails
    rzpl.on('payment.failed', function (response){
        console.log(response)
        alert('OOPS! Something went wrong')
    });

    //if Payment is Successful
    rzpl.on('payment.successful', function(response) {
        console.log(response); 
        alert('Payment successful!'); 

    });
    
        
}

window.addEventListener("DOMContentLoaded", async () =>{
    const token = localStorage.getItem('token')
    try{
        const response = await axios.get("http://localhost:4000/daily-expense" , {headers : {'Authorization': token}});

        for (let i = 0; i < response.data.allUserOnScreen.length; i++) {
            showExpenseOnScreen(response.data.allUserOnScreen[i]);
        }


    }catch(error){
        console.log(error);

    } 

    
});