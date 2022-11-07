import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://odontoclinic.com.br/clinicas/";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let data = [];

    await page.goto(url, { waitUntil: "domcontentloaded" });

    //await page.waitForSelector('.box-unidade .elementor-button-wrapper > a');

    const links = await page.$$eval("#js-main-search-content > a", (el) =>
        el.map((link) => link.href)
    );

    for (const link of links) {
        await page.goto(link, { waitUntil: "domcontentloaded" });
        data.push(
            await page.evaluate(() => {
                return {
                    franquia: "Odontoclinic S.A.",
                    nome: document.querySelector(".elementor-widget-container h1").innerText || '',
                    endereco: document.querySelectorAll(".elementor-text-editor.elementor-clearfix")[3].innerText,
                    telefone: document.querySelectorAll(".elementor-text-editor.elementor-clearfix")[4].innerText,
                    dentistaResponsavel: document.querySelectorAll(".elementor-text-editor.elementor-clearfix")[7].innerText
                };
            }).catch((error) => {})
        );
        console.log(data);
    }
    fs.appendFileSync('../data/odontoclinic.json', JSON.stringify(data, null, 2));
})();