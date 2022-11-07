import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://www.sesc.com.br/encontre-uma-unidade/page";

(async () => {
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    let data = [];

    for (let i = 1; i <= 24; i++) {

        await page.goto(`${url}/${i}`, {waitUntil: 'domcontentloaded'});

        const links = await page.$$eval('.btn-saiba-mais-unidades.more-link', el => el.map(link => link.href));
        
        for(const link of links){
            await page.goto(link, {waitUntil: 'domcontentloaded'});

            data.push(await page.evaluate(() => {
                return {
                    nome: document.querySelector('.breadcrumb_last').innerText,
                    endereco: document.querySelectorAll('p.ml-4')[0].innerText,
                    telefone: document.querySelectorAll('p.ml-4')[1].innerText,
                    email: document.querySelectorAll('p.ml-4')[2].innerText,
                }
            }));
            console.log(data);    
        }
    }
    fs.appendFileSync('unidadesSesc.json', JSON.stringify(data, null, 2));
    
    await browser.close();
})();