import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://redeorto.com.br/unidades?page";

(async () => {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    let data = [];

    for (let i = 1; i <= 6; i++) {
        await page.goto(`${url}=${i}`, { waitUntil: "domcontentloaded" });

        const cidades = await page.$$eval(".OGEVR", (el) =>
            el.map((cidade) => cidade.innerText)
        );
        const enderecos = await page.$$eval(".itfSWt:first-child", (el) =>
            el.map((endereco) => endereco.innerText)
        );

        for (const key in cidades) {
            const browser2 = await puppeteer.launch({ headless: false });
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
                `${enderecos[key]} ${cidades[key]}`
            );
            await Promise.all([
                page2.waitForNavigation({ waitUntil: "domcontentloaded" }),
                page2.keyboard.press("Enter"),
            ]);

            const enderecoFull = await page2
                .$eval(".desktop-title-content", (el) => el.innerText)
                .catch((error) => enderecos[key]);
            const cidadeFull = await page2
                .$eval(".desktop-title-subcontent", (el) => el.innerText)
                .catch((error) => `${cidades[key]}`);

            data.push({
                franquia: "RedeOrto",
                enderecoFull,
                cidadeFull,
            });

            console.log(`${enderecoFull} - ${cidadeFull}`);

            await browser2.close();
        }
    }
    console.log(data);
    fs.appendFileSync("../data/redeorto.json", JSON.stringify(data, null, 2));
})();
