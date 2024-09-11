document.addEventListener("DOMContentLoaded", () => {
    const expenseList = document.getElementById("expense-list");

    // Function to fetch and display monthly expenses
    async function fetchMonthlyExpenses() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://http://3.81.210.55:4000/monthly-expense', {
                headers: {
                    "Authorization": token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch monthly expenses');
            }

            const data = await response.json();
            displayMonthlyExpenses(data.monthlyExpenses);
        } catch (error) {
            console.error('Error fetching monthly expenses:', error);
        }
    }

    // Function to display the fetched expenses
    function displayMonthlyExpenses(expenses) {
        expenseList.innerHTML = ''; // Clear the previous table rows

        if (expenses.length === 0) {
            expenseList.innerHTML = '<tr><td colspan="2">No expenses for this month.</td></tr>';
            return;
        }

        expenses.forEach(expense => {
            const row = document.createElement("tr");

            // Create a cell for the month
            const monthCell = document.createElement("td");
            monthCell.textContent = new Date(expense.month).toLocaleString('default', { month: 'long', year: 'numeric' });
            row.appendChild(monthCell);

            // Create a cell for the total expense
            const expenseCell = document.createElement("td");
            expenseCell.textContent = `₹${expense.totalExpense}`;
            row.appendChild(expenseCell);

            // Append the row to the table body
            expenseList.appendChild(row);
        });
    }

    fetchMonthlyExpenses();
});
