async function sendData(event){
    event.preventDefault();
    const date  = event.target.date.value;
    const description = event.target.description.value;
    const amount = event.target.amount.value;
    const category = event.target.categories.value;

    // Extract user ID from URL and parse it as integer
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams)
    const userId = parseInt(urlParams.get('id')); // Parse userId as integer
    console.log(userId)

    obj = {
        date,
        description,
        amount,
        category,
        userId
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