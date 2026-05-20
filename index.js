// For mongodb DNS error
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const app = express()
const port = 5000



app.get('/', (req, res) => {
    res.send('Petora server is running successfully!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})