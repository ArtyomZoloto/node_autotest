const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const proxy = require('selenium-webdriver/proxy');
const { expect } = require('chai');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
console.dir('Test launched with params: login='+argv.login+' password='+argv.password+' proxy='+argv.proxy);

describe('DefaultTest', function () {
    this.timeout(0); // turn on timeout if needed
    let capabilities = new Capabilities();
    capabilities.setProxy(proxy.manual({ http: argv.proxy }));
    const driver = new Builder().withCapabilities(capabilities).forBrowser('chrome').build();

    driver.get('https://jpmorgan.chase.com/');


    it('should authorize', async () => {
        await driver.wait(until.elementLocated(By.id('UserID')));
        await driver.wait(until.elementLocated(By.id('Password')));
        await driver.findElement(By.id('UserID')).sendKeys(argv.login);
        await driver.findElement(By.id('Password')).sendKeys(argv.password);
        await driver.findElement(By.id('logonButton')).click();
        await driver.wait(until.titleIs('Chase Online - Instructions'), 5000);
    })

    it('writing cookies', async () => {
        driver.manage().getCookies().then(function (cookies) {
            console.log('start printing cookies')
            fs.writeFile("test/TestResult/cookies.json",
                JSON.stringify(cookies),
                function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The cookies was saved!");
                });

        });
    })

    it('take screenshot', async () => {
        driver.saveScreenshot = function (filename) {
            return driver.takeScreenshot().then(function (data) {
                fs.writeFile(filename, data.replace(/^data:image\/png;base64,/, ''), 'base64', function (err) {
                    if (err) throw err;
                });
            })
        };
        driver.saveScreenshot('snapshot1.png');
    })
    after(async () => driver.quit());
});