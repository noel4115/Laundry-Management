
// DISPLAY ALL RECORDS
function loadRecords() {
    const table = document.getElementById("table").value;
    const result = document.getElementById("result");

    if (!table) {
        result.innerHTML = "";
        return;
    }

    fetch(`/list/${table}`)
        .then(response => {
            if (!response.ok) throw new Error("Unable to load records");
            return response.json();
        })
        .then(data => {
            if (!data.length) {
                result.innerHTML = "<h3>No Records Found</h3>";
                return;
            }

            let html = "<table border='1' cellpadding='10'><tr>";

            Object.keys(data[0]).forEach(key => {
                html += `<th>${key}</th>`;
            });

            html += "</tr>";

            data.forEach(row => {
                html += "<tr>";
                Object.values(row).forEach(value => {
                    html += `<td>${value ?? ""}</td>`;
                });
                html += "</tr>";
            });

            html += "</table>";
            result.innerHTML = html;
        })
        .catch(error => {
            console.log(error);
            result.innerHTML = "<h3>Error Loading Records</h3>";
        });
}


// SEARCH ONE RECORD
function loadOneRecord() {
    const table = document.getElementById("table").value;
    const id = document.getElementById("recordId").value;
    const result = document.getElementById("result");

    if (!id) {
        result.innerHTML = "<p>Please Enter ID</p>";
        return;
    }

    fetch(`/listOne/${table}/${id}`)
        .then(async response => {
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    typeof data === "string" ? data : "Record Not Found"
                );
            }
            return data;
        })
        .then(data => {
            let html = "<table border='1' cellpadding='10'>";

            Object.entries(data).forEach(([key, value]) => {
                html += `<tr>
                    <th>${key}</th>
                    <td>${value ?? ""}</td>
                </tr>`;
            });

            html += "</table>";
            result.innerHTML = html;
        })
        .catch(error => {
            result.innerHTML = `<h3>${error.message}</h3>`;
        });
}


// LOAD RECORD FOR UPDATE
function loadUpdateRecord() {
    const table = document.getElementById("table").value;
    const id = document.getElementById("recordId").value;
    const fields = document.getElementById("fields");
    const message = document.getElementById("message");

    if (!id) {
        message.innerText = "Please Enter ID";
        return;
    }
console.log("Loading update record...");
    fetch(`/listOne/${table}/${id}`)
        .then(async response => {
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error("Record Not Found");
            }
            return data;
        })
        .then(data => {
            fields.innerHTML = "";

            const primaryKey = {
                customers: "customer_id",
                services: "service_id",
                orders: "order_id",
                payments: "payment_id"
            };

            Object.entries(data).forEach(([key, value]) => {
                if (key === primaryKey[table]) return;

                fields.innerHTML += `
                    <label>${key}</label>
                    <input
                        type="text"
                        name="${key}"
                        value="${String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"
                        required
                    >
                    <br><br>
                `;
            });

            message.innerText = "Record Loaded. Edit details and click Update.";
            
            document.getElementById("updateForm").onsubmit = function(event) {
                event.preventDefault();

                const inputs = fields.querySelectorAll("input");
                const updatedData = {};

                inputs.forEach(input => {
                    updatedData[input.name] = input.value;
                });

                fetch(`/update/${table}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedData)
                })
                .then(async response => {
                    const text = await response.text();
                    if (!response.ok) throw new Error(text);
                    return text;
                })
                .then(data => {
                    message.innerText = data;
                })
                .catch(error => {
                    message.innerText = "Update Error: " + error.message;
                });
            };
        })
        .catch(error => {
            fields.innerHTML = "";
            message.innerText = error.message;
        });
}


// DELETE RECORD
function deleteRecord() {
    const table = document.getElementById("table").value;
    const id = document.getElementById("recordId").value;
    const message = document.getElementById("message");

    if (!id) {
        message.innerText = "Please Enter ID";
        return;
    }

    if (!confirm("Are you sure you want to delete this record?")) {
        return;
    }

    fetch(`/delete/${table}/${id}`, {
        method: "DELETE"
    })
    .then(async response => {
        const text = await response.text();

        if (!response.ok) throw new Error(text);
        return text;
    })
    .then(data => {
        message.innerText = data;
    })
    .catch(error => {
        message.innerText = "Delete Error: " + error.message;
    });
}
function changeTable() {
    const table = document.getElementById("table").value;

    const ids = {
        customers: "Customer ID",
        services: "Service ID",
        orders: "Order ID",
        payments: "Payment ID"
    };

    document.getElementById("recordId").placeholder =
        "Enter " + ids[table];

    document.getElementById("recordId").value = "";
    document.getElementById("fields").innerHTML = "";
    document.getElementById("message").innerText = "";
}