document.addEventListener("DOMContentLoaded", () => {
    const expenseList = document.getElementById("yearExpense-list");

    // Function to fetch and display monthly expenses
    async function fetchyearlyExpenses() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://3.81.210.55:4000/yearly-expense', {
                headers: {
                    "Authorization": token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch yearly expenses');
            }

            const data = await response.json();
            displayyearlyExpenses(data.yearlyExpenses);
        } catch (error) {
            console.error('Error fetching yearly expenses:', error);
        }
    }

    // Function to display the fetched expenses
    function displayyearlyExpenses(expenses) {
        expenseList.innerHTML = ''; // Clear the previous table rows

        if (expenses.length === 0) {
            expenseList.innerHTML = '<tr><td colspan="2">No expenses for this year.</td></tr>';
            return;
        }

        expenses.forEach(expense => {
            const row = document.createElement("tr");

            // Create a cell for the month
            const yrCell = document.createElement("td");
            yrCell.textContent = new Date(expense.year).toLocaleString('default', {  year: 'numeric' });
            row.appendChild(yrCell);

            // Create a cell for the total expense
            const expenseCell = document.createElement("td");
            expenseCell.textContent = `₹${expense.totalExpense}`;
            row.appendChild(expenseCell);

            // Append the row to the table body
            expenseList.appendChild(row);
        });
    }

    fetchyearlyExpenses();
});
