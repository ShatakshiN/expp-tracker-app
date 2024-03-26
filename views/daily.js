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
        const response = await axios.post('http://localhost:4000/daily-expense',obj);
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

window.addEventListener("DOMContentLoaded", async () =>{
    try{
        const response = await axios.get("http://localhost:4000/daily-expense");

        for (let i = 0; i < response.data.allUserOnScreen.length; i++) {
            showExpenseOnScreen(response.data.allUserOnScreen[i]);
        }


    }catch(error){
        console.log(error);

    } 

    
});