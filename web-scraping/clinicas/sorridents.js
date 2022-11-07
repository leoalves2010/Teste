import puppeteer from "puppeteer-extra";
import fs from "fs";
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

let url = "https://sorridents.com.br/clinicas";
let cont = 1;

(async () => {
    const browser = await puppeteer.use(StealthPlugin()).launch({ headless: true });
    const page = await browser.newPage();
    let data = [];

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector('.box-unidade .elementor-button-wrapper > a', {visible: true});

    const links = await page.$$eval(".box-unidade .elementor-button-wrapper > a", (el) =>
        el.map((link) => link.href)
    );

    for (const link of links) {
        if(cont % 30 === 0){
            await page.waitForTimeout(60000);
        }
        await page.goto(link, { waitUntil: "domcontentloaded" });

        const endereco = await page.$$eval(".quadro-endereco", (el) =>
            el.map((link) => link.innerText)
        );

        const telefone = await page.$$eval(".elementor-icon-list-item:first-child .unidade-whatsapp .elementor-icon-list-text", (el) =>
            el.map((link) => link.innerText)
        ).catch(async (error) => {
            await page.$$eval(".quadro-contatos .elementor-icon-list-item:first-child .elementor-icon-list-text:nth-child(2)", (el) =>
            el.map((link) => link.innerText))
        });

        const email = await page.$$eval(".quadro-contatos a[href*='mailto']", (el) =>
            el.map((link) => link.innerText)
        );

        const dentistaResponsavel = await page.$$eval(".quadro-resp-tec-nome", (el) =>
            el.map((link) => link.innerText)
        );

        const browser2 = await puppeteer.launch({ headless: true });
        const page2 = await browser2.newPage();
        await page2.setViewport({ width: 1366, height: 968 });
        await page2.goto("https://www.google.com.br/", {
            waitUntil: "domcontentloaded",
        });
        await page2.waitForSelector('input[aria-label="Pesquisar"]', {
            visible: true,
        });
        await page2.type(
            'input[aria-label="Pesquisar"]',
            `${endereco}`
        );
        
        await page.waitForTimeout(1000);

        await Promise.all([
            page2.waitForNavigation({ waitUntil: "domcontentloaded" }),
            page2.keyboard.press("Enter"),
        ]);

        await page.waitForTimeout(1000);
        
        const enderecoFull = await page2
            .$eval(".desktop-title-content", (el) => el.innerText)
            .catch((error) => endereco);
        const cidadeFull = await page2
            .$eval(".desktop-title-subcontent", (el) => el.innerText)
            .catch((error) => "");

        data.push({
            franquia: "Sorridents Clínicas Odontológicas",
            enderecoFull,
            cidadeFull,
            telefone,
            email,
            dentistaResponsavel
        });

        console.log({
            franquia: "Sorridents Clínicas Odontológicas",
            enderecoFull,
            cidadeFull,
            telefone,
            email,
            dentistaResponsavel
        });
        cont = cont + 1;

        await browser2.close();
    }
    fs.appendFileSync('../data/sorridents.json', JSON.stringify(data, null, 2));
})();