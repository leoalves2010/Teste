import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://odontoexcellence.com.br/unidades-franqueadas/";
let data = [];

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 968});
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector('#selectPaisFranquias', {visible: true});
    await page.select("#selectPaisFranquias", "Brasil");

    await page.waitForTimeout(1000);
    
    const estados = await page.$$eval("#selectEstadoFranquias option", (el) =>
        el.filter((estado) => estado.value != -1).map((estado) => estado.value)
    );

    for(const estado of estados){
        await page.select("#selectEstadoFranquias", estado);

        await page.waitForTimeout(1000);

        const cidades = await page.$$eval("#selectCidadeFranquias option", (el) =>
            el.filter((cidade) => cidade.value != -1).map((cidade) => cidade.value)
        );

        for(const cidade of cidades){
            await page.select("#selectCidadeFranquias", cidade);
            await page.waitForTimeout(1000);

            await page.waitForSelector('.card-p-unidades', {visible: true}).catch((error) => {});

            const endereco = await page.evaluate(() => {
                try {
                    document.querySelectorAll('.card-p-unidades b')[1].remove();
                    return document.querySelectorAll('.card-p-unidades')[1].innerText.replace('\n', '');                    
                } catch (error) {
                    return null
                }
            })

            const browser2 = await puppeteer.launch({ headless: true });
            const page2 = await browser2.newPage();
            await page2.setViewport({ width: 1366, height: 968});
            await page2.goto('https://www.google.com.br/', { waitUntil: "domcontentloaded" });
            await page2.waitForSelector('input[aria-label="Pesquisar"]', {visible: true});
            await page2.type('input[aria-label="Pesquisar"]', `${endereco} ${cidade} ${estado}`);
            await Promise.all([
                page2.waitForNavigation({waitUntil: "domcontentloaded"}),
                page2.keyboard.press("Enter"),
            ]);

            // await page2.waitForSelector(".desktop-title-content", {visible: true});
            // await page2.waitForSelector(".desktop-title-subcontent", {visible: true});

            const enderecoFull = await page2.$eval(".desktop-title-content", (el) => el.innerText).catch((error) => endereco);
            const cidadeFull = await page2.$eval(".desktop-title-subcontent", (el) => el.innerText).catch((error) => `${cidade} - ${estado}`);

            data.push({
                franquia: 'Odonto Excellence',
                enderecoFull,
                cidadeFull
            });

            console.log(data);

            await browser2.close();
        }
    }
    fs.appendFileSync('../data/odontoexcellence.js', JSON.stringify(data, null, 2));
})();