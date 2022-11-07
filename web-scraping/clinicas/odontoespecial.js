import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://www.odontospecial.com.br/";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let data = [];

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("div[data-class='wpcf7cf_group']");

    const links = await page.$$eval("div[data-class='wpcf7cf_group'] a[href*='https://g']", (el) =>
        el.map((link) => link.href)
    );

    for (const link of links) {
        await page.goto(link, { waitUntil: "domcontentloaded" });

        await page.waitForSelector("h1");
        await page.waitForSelector("*[data-tooltip='Copiar endereço']");

        const nome = await page.$eval("h1", (el) => el.innerText);
        const endereco = await page.$eval("*[data-tooltip='Copiar endereço']", (el) => el.getAttribute('aria-label'));

        data.push({nome, endereco});
        console.log(data);
    }
    fs.appendFileSync('../data/odontoespecial.json', JSON.stringify(data, null, 2));
})();