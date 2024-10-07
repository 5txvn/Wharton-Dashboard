//init puppeteer shit
const puppeteer = require("puppeteer")
const { exec } = require("node:child_process")
const { promisify } = require("node:util");
//init express and socketio
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);
const chalk = require("chalk");
require('dotenv').config();

async function startPuppeteer() {
  //const { stdout: chromiumPath } = await promisify(exec)("which chromium")
  global.browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  //log in to wharton
  global.page = await browser.newPage()
  await page.goto("https://www.stocktrak.com/dashboard/standard");
  const usernameInput = await page.waitForSelector("#tbLoginUserName");
  await usernameInput.type(process.env.WHARTONUSERNAME);
  const passwordInput = await page.waitForSelector("#Password");
  await passwordInput.type(process.env.WHARTONPASSWORD);
  const rememberMe = await page.waitForSelector("#RememberMe");
  await rememberMe.evaluate(checkbox => checkbox.click());
  const loginButton = await page.waitForSelector("body > section > div > div.login-box > form > div > div.small-12.cell.text-right > button");
  await loginButton.evaluate(button => button.click());
  //close popups
  const skipTour = await page.waitForSelector("body > div.shepherd-has-cancel-icon.shepherd-has-title.shepherd-element.onboarding-tour.shepherd-centered.shepherd-enabled > div > header > button");
  await skipTour.evaluate(button => button.click());
  const announcement = await page.$("#OverlayModalPopup > div.modal-title > div > div.cell.shrink > a > i");
  await announcement.evaluate(icon => icon.click());
  await main();
}

async function main() {
  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  })

  io.on("connection", (socket) => {
    //getting information about our team
    socket.on("portfolio value", async () => {
        io.emit("busy")
        await page.goto("https://www.stocktrak.com/dashboard/standard");
        const portfolioValueElement = await page.waitForSelector("::-p-xpath(//div[@class='title' and text()='Portfolio Value']/following-sibling::*[1])");
        const portfolioValue = await (await portfolioValueElement.getProperty("textContent")).jsonValue();
        socket.emit("portfolio value", portfolioValue); io.emit("notBusy")
    });
    socket.on("portfolio return", async () => {
        io.emit("busy")
        await page.goto("https://www.stocktrak.com/dashboard/standard");
        const portfolioReturnElement = await page.waitForSelector("::-p-xpath(//div[@class='title' and text()='Portfolio Return']/following-sibling::*[1])");
        const portfolioReturn = await (await portfolioReturnElement.getProperty("textContent")).jsonValue();
        socket.emit("portfolio return", portfolioReturn); io.emit("notBusy")
    });
    socket.on("cash balance", async () => {
        io.emit("busy")
        await page.goto("https://www.stocktrak.com/dashboard/standard");
        const cashBalanceElement = await page.waitForSelector("::-p-xpath(//div[@class='title' and text()='Cash Balance']/following-sibling::*[1])");
        const cashBalance = await (await cashBalanceElement.getProperty("textContent")).jsonValue();
        socket.emit("cash balance", cashBalance); io.emit("notBusy")
    });
    socket.on("buying power", async () => {
        io.emit("busy")
        await page.goto("https://www.stocktrak.com/dashboard/standard");
        const buyingPowerElement = await page.waitForSelector("::-p-xpath(//div[@class='title' and text()='Buying Power']/following-sibling::*[1])");
        const buyingPower = await (await buyingPowerElement.getProperty("textContent")).jsonValue();
        socket.emit("buying power", buyingPower); io.emit("notBusy")
    });
    socket.on("ranking", async () => {
        io.emit("busy")
        await page.goto("https://www.stocktrak.com/dashboard/standard");
        const rankingElement = await page.waitForSelector("::-p-xpath(//div[@class='title' and text()='My Ranking']/following-sibling::*[1])");
        const ranking = await (await rankingElement.getProperty("textContent")).jsonValue();
        socket.emit("ranking", ranking); io.emit("notBusy")
    });
    socket.on("trades made", async () => {
        io.emit("busy")
        await page.goto("https://www.stocktrak.com/dashboard/standard");
        const tradesMadeElement = await page.waitForSelector("::-p-xpath(//div[@class='title' and text()='Trades Made']/following-sibling::*[1])");
        const tradesMade = await (await tradesMadeElement.getProperty("textContent")).jsonValue();
        socket.emit("trades made", tradesMade); io.emit("notBusy")
    });
    //getting any sort of stock information
    socket.on("ticker price", async(ticker) => {
        try {
            io.emit("busy");
            await page.goto(`https://www.stocktrak.com/trading/equities?securitysymbol=${ticker}`);
            const priceElement = await page.waitForSelector("::-p-xpath(//div[text()='Last Price']/following-sibling::*[1]/span)");
            const price = await (await priceElement.getProperty("textContent")).jsonValue();
            socket.emit("ticker price", [ticker, price]); io.emit("notBusy");
        } catch(error) {
            socket.emit("ticker price", false); io.emit("notBusy");
        }
    })
    socket.on("ticker day change", async(ticker) => {
        try {
            io.emit("busy");
            await page.goto(`https://www.stocktrak.com/trading/equities?securitysymbol=${ticker}`);
            const dayChangeElement = await page.waitForSelector("#symbol-market-details > div > div > div:nth-child(3) > span.value");
            const dayChange = await (await dayChangeElement.getProperty("textContent")).jsonValue();
            socket.emit("ticker day change", [ticker, dayChange]); io.emit("notBusy");
        } catch(error) {
            socket.emit("ticker day change", false); io.emit("notBusy");
        }
    })
  })

  server.listen(3000, () => {
    console.log(chalk.bgGreen("Puppeteer has started up and the server is now ready..."));
  })
}

startPuppeteer();