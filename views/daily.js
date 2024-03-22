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
        category
    }

    try{
        const response = axios.post('http://localhost:4000/daily-expense',obj);
        showExpenseOnScreen(response.data.expenseData)

    }catch(error){
        console.log(error);
    }

};

function showExpenseOnScreen(obj){
    

}