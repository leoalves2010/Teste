import puppeteer from "puppeteer";
import fs from "fs";

let url = "http://www.amigaodontologia.com.br/clinicas/";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let data = [];

    await page.goto(url, { waitUntil: "domcontentloaded" });

    //await page.waitForSelector('.box-unidade .elementor-button-wrapper > a');

    const links = await page.$$eval(".nectar-button.medium.see-through-2.has-icon", (el) =>
        el.map((link) => link.href)
    );

    for (const link of links) {
        await page.goto(link, { waitUntil: "domcontentloaded" });
        data.push(
            await page.evaluate(() => {
                return {
                    franquia: "Amiga Odontologia",
                    nome: document.querySelector('.heading-line h1').innerText,
                    endereco: document.querySelectorAll('.iwithtext > .iwt-text')[4].innerText,
                    telefone1: document.querySelectorAll('.iwithtext > .iwt-text > a')[0].innerText,
                    telefone2: document.querySelectorAll('.iwithtext > .iwt-text > a')[1].innerText,
                    dentistaResponsavel: document.querySelector('.iwithtext strong').innerText
                };
            }).catch((error) => {})
        );
        console.log(data);
    }
    fs.appendFileSync('../data/amigaodontologia.json', JSON.stringify(data, null, 2));
})();