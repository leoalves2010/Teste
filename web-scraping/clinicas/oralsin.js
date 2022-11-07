import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://www.oralsin.com.br/clinicas/";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    let data = [];

    await page.goto(url, { waitUntil: "domcontentloaded" });

    //await page.waitForSelector('.box-unidade .elementor-button-wrapper > a');

    const links = await page.$$eval(".ctn-clinics a", (el) =>
        el.map((link) => link.href)
    );

    for (const link of links) {
        await page.goto(link, { waitUntil: "domcontentloaded" });

        const links2 = await page.$$eval(".clinics-item.card a", (el) =>
            el.map((link) => link.href)
        );

        for(const link2 of links2){
            await page.goto(link2, { waitUntil: "domcontentloaded" });

            //await page.waitForTimeout(3000);

            await page.waitForSelector("img[src='https://maps.gstatic.com/mapfiles/transparent.png']", {visible: true}).catch((error) => {});
            
            await page.evaluate(() => {
                document.querySelector("img[src='https://maps.gstatic.com/mapfiles/transparent.png']").click();
            }).catch((error) => {});

            await page.waitForTimeout(2000);
            
            data.push(
                await page.evaluate(() => {
                    return {
                        franquia: "Oral Sin Implantes",
                        endereco: document.querySelector(".gm-style-iw-d").innerText,
                        telefone1: document.querySelectorAll('.ctn-footer-2 a')[0].innerText,
                        telefone2: document.querySelectorAll('.ctn-footer-2 a')[1].innerText,
                        dentistaResponsavel: document.querySelectorAll('.ctn-footer-1 .sponsor')[0].innerText
                    };
                }).catch((error) => {})
            );
            console.log(data);
        }
    }
    fs.appendFileSync('../data/oralsin.json', JSON.stringify(data, null, 2));
})();