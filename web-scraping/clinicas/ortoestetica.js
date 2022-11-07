import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://redeortoestetica.com.br/franquia/page";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let data = [];

    for (let i = 1; i <= 26; i++) {
        await page.goto(`${url}/${i}`, { waitUntil: "domcontentloaded" });

        const links = await page.$$eval(".entry-title > a", (el) =>
            el.map((link) => link.href)
        );

        for (const link of links) {
            await page.goto(link, { waitUntil: "domcontentloaded" });
            data.push(
                await page.evaluate(() => {
                    return {
                        franquia: "Ortoestética Clínicas Odontológicas",
                        nome: document.querySelector("h3").innerText || '',
                        endereco: document.querySelectorAll(".elementor-text-editor")[1].innerText,
                        cidade: document.querySelectorAll(".elementor-text-editor")[2].innerText,
                        estado: document.querySelectorAll(".elementor-text-editor")[3].innerText,
                        cep: document.querySelectorAll(".elementor-text-editor")[4].innerText,
                        telefone: document.querySelectorAll(".elementor-text-editor")[6].innerText,
                        email: document.querySelectorAll(".elementor-text-editor")[8].innerText,
                    };
                }).catch((error) => {})
            );
            console.log(data);
        }
    }
    fs.appendFileSync('ortoestetica.json', JSON.stringify(data, null, 2));
})();