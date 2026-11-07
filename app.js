const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'noel',
    database: 'laundry'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected');
});

const tables = {
    customers: {
        id: 'customer_id',
        fields: ['name', 'phone', 'email', 'address']
    },
    services: {
        id: 'service_id',
        fields: ['service_name', 'price_per_kg', 'description']
    },
    orders: {
        id: 'order_id',
        fields: ['customer_id', 'service_id', 'clothes_weight',
        'order_date', 'delivery_date', 'total_amount', 'status']
    },
    payments: {
        id: 'payment_id',
        fields: ['order_id', 'amount', 'payment_date',
        'payment_method', 'status']
    }
};

function validateTable(req, res, next) {
    if (!tables[req.params.table]) {
        return res.status(400).send('Invalid Table');
    }
    next();
}

app.post('/insert/:table', validateTable, (req, res) => {
    const table = req.params.table;
    const fields = tables[table].fields;
    const values = fields.map(f => req.body[f]);

    if (values.some(v => v === undefined || v === '')) {
        return res.status(400).send('All fields are required');
    }

    const sql = `INSERT INTO ${table}
    (${fields.join(',')})
    VALUES (${fields.map(() => '?').join(',')})`;

    db.query(sql, values, (err) => {
        if (err) return res.status(400).send(err.message);
        res.send('Inserted Successfully');
    });
});

app.get('/list/:table', validateTable, (req, res) => {
    db.query(`SELECT * FROM ${req.params.table}`, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.json(result);
    });
});

app.get('/listOne/:table/:id', validateTable, (req, res) => {
    const table = req.params.table;
    const id = tables[table].id;

    db.query(`SELECT * FROM ${table} WHERE ${id}=?`,
    [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err.message);
        if (!result.length) return res.status(404).send('Record Not Found');
        res.json(result[0]);
    });
});


app.put('/update/:table/:id', validateTable, (req, res) => {
    const table = req.params.table;
    const fields = tables[table].fields;
    const id = tables[table].id;

    const values = fields.map(f => req.body[f]);

    if (values.some(v => v === undefined || v === '')) {
        return res.status(400).send('All fields are required');
    }

    const set = fields.map(f => `${f} = ?`).join(', ');

    const sql = `UPDATE ${table} SET ${set} WHERE ${id} = ?`;

    db.query(sql, [...values, req.params.id], (err, result) => {
        if (err) {
            return res.status(400).send(err.message);
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Record Not Found');
        }

        res.send('Updated Successfully');
    });
});


app.delete('/delete/:table/:id', validateTable, (req, res) => {
    const table = req.params.table;
    const id = tables[table].id;

    db.query(`DELETE FROM ${table} WHERE ${id}=?`,
    [req.params.id], (err, result) => {
        if (err) return res.status(400).send(err.message);
        if (!result.affectedRows) return res.status(404).send('Record Not Found');
        res.send('Deleted Successfully');
    });
});

app.listen(3004, () => {
    console.log('Server running at http://localhost:3004');
});