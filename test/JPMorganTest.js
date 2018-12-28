const webdriver = require('selenium-webdriver');
const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
var chrome = require("selenium-webdriver/chrome");
const { expect } = require('chai');
const fs = require('fs');
const dateFormat = require('dateformat');
const argv = require('minimist')(process.argv.slice(2));
console.dir('Test launched with params: login=' + argv.login + ' password=' + argv.password + ' proxy=' + argv.proxy);

/** 
 * Set chrome command line options/switches
*/
var chromeOptions = new chrome.Options();
chromeOptions.addArguments("start-maximized");
//chromeOptions.addArguments("window-size=1680,965");
chromeOptions.addArguments("ignore-certificate-errors");
chromeOptions.addArguments("disable-popup-blocking");
chromeOptions.addArguments("disable-gpu");
chromeOptions.addArguments("disable-extensions");
chromeOptions.addArguments("user-agent=user-agent : Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36");
chromeOptions.addArguments("disable-geolocation");
if (argv.proxy) {
    chromeOptions.addArguments("proxy-server=http://" + argv.proxy);
}
driver = new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();

driver.get('https://jpmorgan.chase.com/');

function printLog(cookies) {
    return getDate()
        + ' >>> login: ' + argv.login
        + ' ; password: ' + argv.password
        + '\n' + JSON.stringify(cookies)
        + '\n_____________\n\n';

}

function getDate() {
    return dateFormat(new Date(), "dd.mm.yyyy h:MM:ss");
}

describe('DefaultTest', function () {

    this.timeout(0);

    it('should authorize', async () => {
        await driver.wait(until.elementLocated(By.id('UserID')));
        await driver.wait(until.elementLocated(By.id('Password')));
        await driver.findElement(By.id('UserID')).sendKeys(argv.login);
        await driver.findElement(By.id('Password')).sendKeys(argv.password);
        await driver.findElement(By.id('logonButton')).click();
        await driver.wait(until.titleIs('Chase Online - Instructions'), 5000);
        expect(await driver.findElement(By.xpath('//*[@id="lblSummaryHeader"]'))).is.not.to.be.undefined;
    })

    it('writing cookies', function () {
        driver.manage().getCookies().then(function (cookies) {
            console.log('start printing cookies')
            fs.appendFile("test/testResult/log/cookies.log",
                printLog(cookies),
                function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The cookies was saved!");
                });

        });
    })

    it('take screenshot', function () {
        driver.saveScreenshot = function (filename) {
            return driver.takeScreenshot().then(function (data) {
                fs.writeFile(filename, data.replace(/^data:image\/png;base64,/, ''), 'base64', function (err) {
                    if (err) throw err;
                });
            })
        };
        driver.saveScreenshot('test/testResult/screenshots/' + getDate() + '.png');
        console.log("The Screenshot was saved!");
    })
    after(async () => driver.quit());
});