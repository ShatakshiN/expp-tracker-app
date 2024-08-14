//for pagination
let currentPage = 1;
let entriesPerPage = 5; // Default entries per page
let expenses = []; // Array to store all expenses

// Function to fetch saved entries per page from local storage
function loadEntriesPerPage() {
    const storedEntriesPerPage = localStorage.getItem('entriesPerPage');
    if (storedEntriesPerPage) {
        entriesPerPage = parseInt(storedEntriesPerPage);
        document.getElementById('entriesSelect').value = entriesPerPage; // Set the select element value
    }
}

// Function to update entries per page and save to local storage
function updateEntriesPerPage() {
    entriesPerPage = parseInt(document.getElementById('entriesSelect').value);
    currentPage = 1; // Reset to the first page when changing entries per page
    localStorage.setItem('entriesPerPage', entriesPerPage);
    displayExpenses();
}

// Add event listener to select element to update entries per page
document.getElementById('entriesSelect').addEventListener('change', updateEntriesPerPage);

// Event listener for page navigation buttons (next and previous)
document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    displayExpenses();
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayExpenses();
    }
});

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get("http://3.81.210.55/check-premium-status", { headers: { 'Authorization': token } });
        
        const isPremium = response.data.isPremium
       
        
        if (isPremium) {
            console.log('hi im premium')
            // User is premium, hide the Go Premium button
            document.getElementById('rzp-button1').style.display = 'none';

            //show you are now a premium user message
            document.getElementById('PremiumTag').classList.remove('visually-hidden');
            //show leaderboard 
            document.getElementById('leaderboardTable').classList.remove('visually-hidden');  

            //show link board
            document.getElementById('linkboardTable').classList.remove('visually-hidden');
            //await showDownloadedLinks();

          
        } else {
            // User is not premium, show the Go Premium button
            document.getElementById('rzp-button1').style.display = 'block'
            

        }

        // Fetch and display user expenses
        const expenseResponse = await axios.get("http://3.81.210.55/daily-expense", { headers: { 'Authorization': token } });

        for (let i = 0; i < expenseResponse.data.allUserOnScreen.length; i++) {
            showExpenseOnScreen(expenseResponse.data.allUserOnScreen[i]);
        }

        // Load entries per page setting from local storage
        loadEntriesPerPage();
        displayExpenses(); // Display expenses with loaded settings

    } catch (error) {
        console.log(error);
    }
});

document.addEventListener('DOMContentLoaded', ()=>{
    const expForm = document.getElementById('expForm');
    expForm.onsubmit = sendData;

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
            const response = await axios.post('http://3.81.210.55/daily-expense',obj, {headers : {'Authorization': token}});
            console.log(response.data.expense)
            showExpenseOnScreen(response.data.expense);
    
    
        }catch(error){
            console.log(error);
        }
    
    }
});



function showExpenseOnScreen(obj){
    expenses.push(obj);
    if (expenses.length <= currentPage * entriesPerPage && expenses.length > (currentPage - 1) * entriesPerPage){

    
        const parentElem = document.getElementById('expenseList');
        const childElem = document.createElement('li');
        childElem.textContent = `${obj.description} - ${obj.amount}`;
        const delButton  = document.createElement('button');
        childElem.className = "list-group-item";
        delButton.textContent = 'DELETE';
        delButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`http://3.81.210.55/delete-expense/${obj.id}`, {
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
}

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    displayExpenses();
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayExpenses();
    }
});

function displayExpenses() {
    const start = (currentPage - 1) * entriesPerPage;
    const end = currentPage * entriesPerPage;
    const visibleExpenses = expenses.slice(start, end);

    const parentElem = document.getElementById('expenseList');
    parentElem.innerHTML = ''; // Clear previous entries

    visibleExpenses.forEach(expense => {
        const childElem = document.createElement('li');
        childElem.textContent = `${expense.description} - ${expense.amount}`;
        childElem.className = "list-group-item";
        const delButton = document.createElement('button');
        delButton.textContent = 'DELETE';
        delButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`http://3.81.210.55/delete-expense/${expense.id}`, {
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
    });
}
/* document.getElementById('entriesSelect').addEventListener('change', (event) => {
    entriesPerPage = parseInt(event.target.value);
    currentPage = 1;
    displayExpenses(); 
}); */



function toggleLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboardTable').parentNode;
    leaderboardDiv.classList.toggle('d-none'); // Toggle Bootstrap class to hide/show
}

document.getElementById('leaderboardbtn').addEventListener('click', showLeaderboard);

async function showLeaderboard() {
        const token = localStorage.getItem('token');
        
        try {
            const userLeaderboard = await axios.get('http://3.81.210.55/premium/LeaderBoard', {
                headers: { "Authorization": token }
            });
    
            console.log("userLeaderboard", userLeaderboard);
    
            //var leaderboard_UL = document.getElementById('leaderboardTable');//abhi comm kiya
            const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];

             // Clear previous content
            leaderboardTable.innerHTML = '';
    
            // Populate the table with leaderboard data
            userLeaderboard.data.forEach((user) => {
                const row = leaderboardTable.insertRow();
                const nameCell = row.insertCell(0);
                const expenseCell = row.insertCell(1);

                nameCell.textContent = user.name;
                nameCell.style.color = 'white' 
                expenseCell.textContent = user.total_cost;
            });

            // Show the leaderboard table
            const leaderboardDiv = document.getElementById('leaderboardTable').parentNode;
            leaderboardDiv.classList.remove('d-none');


        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }

// Event listener for close button
document.getElementById('closeLeaderboardBtn').addEventListener('click', toggleLeaderboard);

// Initial call to hide leaderboard table on page load
toggleLeaderboard();


document.getElementById("rzp-button1").onclick = async function (e){
    const token = localStorage.getItem('token');
    //console.log(token);
    const response = await axios.get('http://3.81.210.55/buy-premium', {headers : {'Authorization': token}});
    //console.log(response);
    console.log('payment id' +  response.razorpay_payment_id)
    var options = {
        'key' : response.data.key_id,
        'order_id' : response.data.order.id,
        //this handler function will handle the success payment
        'handler' : async function (response){
            console.log('payment id' + response.razorpay_payment_id)
            await axios.post('http://3.81.210.55/updatetransectionstatus', {
                order_id : options.order_id,
                payment_id : response.razorpay_payment_id,

            }, {headers : {'Authorization' : token}})

            alert('You are now a Premium user');
            document.getElementById('rzp-button1').style.display = 'none';
            document.getElementById('PremiumTag').classList.remove('visually-hidden');
            document.getElementById('downloadBtn').classList.remove('visually-hidden'); 
            document.getElementById('leaderboardTable').classList.remove('visually-hidden');

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

//downloading expense of each user
document.getElementById('downloadBtn1').addEventListener('click', async()=>{
    const token = localStorage.getItem('token');
    try{
        const response  = await axios.get('http://3.81.210.55/download-expense',{headers : {'Authorization': token}})
        const a = document.createElement('a')
        a.href = response.data.fileURL;
        a.download = 'expense.csv';
        
        a.click()
    }
    catch(error){
        console.log(error)
    }
})

function toggleLinkboard(){
    // Show the linkboard table
    const linkboardDiv = document.getElementById('linkboardTable').parentNode;
    linkboardDiv.classList.toggle('d-none');
}


document.getElementById('downloadBtnShow').addEventListener('click', showDownloadedLinks);

async function showDownloadedLinks(){


    const token = localStorage.getItem('token');
    try {
        const response = await axios.get("http://3.81.210.55/downloaded-files", { headers: { 'Authorization': token } });
        const links = response.data;

        const linkboardTable = document.getElementById('linkboardTable').getElementsByTagName('tbody')[0];
        linkboardTable.innerHTML = '';  // Clear any existing rows

        links.forEach(link => {
            const row = linkboardTable.insertRow();
            const linkCell = row.insertCell(0);
            const dateCell = row.insertCell(1);

            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.textContent = link.url;
            linkElement.target = "_blank";  // Open link in new tab

            linkCell.appendChild(linkElement);
            dateCell.textContent = new Date(link.createdAt).toLocaleDateString();
        });

        // Show the linkboard table
        const linkboardDiv = document.getElementById('linkboardTable').parentNode;
        linkboardDiv.classList.remove('d-none'); 
    } catch (error) {
        console.error('Error fetching downloaded links:', error);
    }
};

document.getElementById('closeLinkboardBtn').addEventListener('click', toggleLinkboard);

// Initial call to hide linkboard table on page load
toggleLinkboard();
