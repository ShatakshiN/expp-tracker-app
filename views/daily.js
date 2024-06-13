
window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get("http://localhost:4000/check-premium-status", { headers: { 'Authorization': token } });
        
        const isPremium = response.data.isPremium
       
        
        if (isPremium) {
            console.log('hi im premium')
            // User is premium, hide the Go Premium button
            document.getElementById('rzp-button1').style.display = 'none';

            //show you are now a premium user message
            document.getElementById('PremiumTag').classList.remove('visually-hidden');

            document.getElementById('downloadBtn').classList.remove('visually-hidden');

            //document.getElementById('showDownloadedLinksBtn').classList.remove('visually-hidden');

            //show leaderboard
            //document.getElementById('leaderBoardTag').classList.remove('visually-hidden');

            // Fetch and display the list of downloaded files
            const filesResponse = await axios.get("http://localhost:4000/downloaded-files", { headers: { 'Authorization': token } });
            displayDownloadedFiles(filesResponse.data); 
          
        } else {
            // User is not premium, show the Go Premium button
            document.getElementById('rzp-button1').style.display = 'block';
        

        }

        // Fetch and display user expenses
        const expenseResponse = await axios.get("http://localhost:4000/daily-expense", { headers: { 'Authorization': token } });

        for (let i = 0; i < expenseResponse.data.allUserOnScreen.length; i++) {
            showExpenseOnScreen(expenseResponse.data.allUserOnScreen[i]);
        }

    } catch (error) {
        console.log(error);
    }
});

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
    delButton.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:4000/delete-expense/${obj.id}`, {
                headers: { 'Authorization': token }
            });
            // If successful, remove the expense item from the DOM
            parentElem.removeChild(childElem);
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    });
    childElem.appendChild(delButton);
    parentElem.appendChild(childElem);
}



/* document.getElementById('leaderboardbtn').addEventListener('click' , showLeaderboard)
    async function showLeaderboard(){
        const token=localStorage.getItem('token');
        const userLeaderboard= await axios.get('http://localhost:4000/premium/LeaderBoard',{headers:{"Authorization":token}});
        console.log("userLeaderboard",userLeaderboard);
        var leaderboard_UL= document.getElementById('leaderboardTable');
        leaderboard_UL.innerHTML+='<h5>Leader Board</h5>';
        userLeaderboard.data.forEach((user) => {
            const leaderboard_LI= document.createElement('li');
            leaderboard_LI.innerText=`Name--${user.name} Total Expense--${user.total_cost}`
            leaderboard_LI.style.color = 'white';
            leaderboard_UL.appendChild(leaderboard_LI);
        })
    }; */

    document.getElementById('leaderboardbtn').addEventListener('click', showLeaderboard);

    async function showLeaderboard() {
        const token = localStorage.getItem('token');
        
        try {
            const userLeaderboard = await axios.get('http://localhost:4000/premium/LeaderBoard', {
                headers: { "Authorization": token }
            });
    
            console.log("userLeaderboard", userLeaderboard);
    
            var leaderboard_UL = document.getElementById('leaderboardTable');
            
            // Clear previous content
            leaderboard_UL.innerHTML = '';
    
            // Create and append the heading with white text color
            const leaderboardHeading = document.createElement('h5');
            leaderboardHeading.textContent = 'Leader Board';
            leaderboardHeading.style.color = 'white';
            leaderboard_UL.appendChild(leaderboardHeading);
    
            // Iterate over each user and create list items with white text color
            userLeaderboard.data.forEach((user) => {
                const leaderboard_LI = document.createElement('li');
                leaderboard_LI.innerText = `Name--${user.name}  Total Expense--${user.total_cost}`;
                leaderboard_LI.style.color = 'white';
                leaderboard_UL.appendChild(leaderboard_LI);
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }
    


document.getElementById("rzp-button1").onclick = async function (e){
    const token = localStorage.getItem('token');
    //console.log(token);
    const response = await axios.get('http://localhost:4000/buy-premium', {headers : {'Authorization': token}});
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

            alert('You are now a Premium user');
            document.getElementById('rzp-button1').style.display = 'none';
            document.getElementById('PremiumTag').classList.remove('visually-hidden');
            document.getElementById('downloadBtn').classList.remove('visually-hidden');
           
            

            //document.getElementById('leaderBoardTag').classList.remove('visually-hidden');

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

       // Update local storage to mark user as premium
       localStorage.setItem('isPremium', 'true'); 

       // Hide the Go Premium button after successful payment
       //document.getElementById('rzp-button1').style.display = 'none';
       //document.getElementById('PremiumTag').classList.remove('visually-hidden');
       //document.getElementById('leaderBoardTag').classList.remove('visually-hidden');
      
    

    });
    
        
}



function displayDownloadedFiles(files) {
    const fileList = document.getElementById('downloadedFilesList');
    fileList.innerHTML = '';
    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = file.url;
        link.textContent = `${file.url} - ${new Date(file.createdAt).toLocaleString()}`;
        link.target = '_blank'; // Open link in a new tab
        link.style.color = 'white';
        listItem.appendChild(link);
        fileList.appendChild(listItem);
    });
}

//downloading expense of each user
document.getElementById('downloadBtn1').addEventListener('click', async()=>{
    const token = localStorage.getItem('token');
    try{
        const response  = await axios.get('http://localhost:4000/download-expense',{headers : {'Authorization': token}})
        const a = document.createElement('a')
        a.href = response.data.fileURL;
        a.download = 'expense.csv'; 
        a.click() 
         // Fetch and update the list of downloaded files
        const filesResponse = await axios.get("http://localhost:4000/downloaded-files", { headers: { 'Authorization': token } });
        displayDownloadedFiles(filesResponse.data); 

       
    }

    catch(error){
        console.log(error)
    }
})








