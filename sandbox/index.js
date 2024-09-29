const xlsx = require('xlsx');

// Load the workbook
const workbook = xlsx.readFile('./stocks.xlsx');

// Select the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON format
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const tickers = [];

jsonData.forEach((stock, index) => {
    if (index != 0) {
        tickers.push(stock[1])
    }
})

console.log(JSON.stringify(tickers))