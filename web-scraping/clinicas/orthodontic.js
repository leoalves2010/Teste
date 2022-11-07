import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://www.orthodonticbrasil.com.br/encontre-uma-orthodontic/";
let data = [];

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 968 });
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector(".apply-filters .apply-filters__button", {
        visible: true,
    });
    await page.click(".apply-filters .apply-filters__button");

    await autoScroll(page);

    const cidades = await page.$$eval("h1.elementor-heading-title", (el) =>
        el.map((endereco) => endereco.innerText)
    );

    const enderecos = await page.$$eval(
        ".elementor-widget-wrap.elementor-element-populated .elementor-widget-heading:nth-child(5)",
        (el) => el.map((endereco) => endereco.innerText)
    );

    const telefones = await page.$$eval(
        ".elementor-widget-wrap.elementor-element-populated .elementor-widget-heading:nth-child(4)",
        (el) => el.map((endereco) => endereco.innerText)
    );

    const emails = await page.$$eval(
        ".elementor-widget-wrap.elementor-element-populated .elementor-widget-heading:nth-child(6)",
        (el) => el.map((endereco) => endereco.innerText)
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
            franquia: "OrthoDontic",
            enderecoFull,
            cidadeFull,
        });

        await browser2.close();
    }

    console.log(data);
    fs.appendFileSync("../data/orthodontic.js", JSON.stringify(data, null, 2));

    async function autoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight - window.innerHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 300);
            });
        });
    }
})();
