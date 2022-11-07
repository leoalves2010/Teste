import puppeteer from "puppeteer";

let url = "https://www.sesc.com.br/encontre-uma-unidade/page";

let index = 1;

(async () => {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    for (let i = 1; i <= 24; i++) {
        console.log(`${url}/${i}`);        
    }

    await page.goto(url);

    await page.waitForSelector('.titulo-card-encontre-uma-unidade');

    const links = await page.$$eval('.btn-saiba-mais-unidades.more-link', el => el.map(link => link.href));
    
    for(const link of links){
        console.log(`Página ${index}`);
        await page.goto(link);

        await page.waitForSelector('.bg-galeria-unidade.bg-info-unidade');

        const nome = await page.$eval('.bg-galeria-unidade.bg-info-unidade h1', el => el.innerText);
        const endereco = await page.$eval('.bg-galeria-unidade.bg-info-unidade .col-md-6 h2 ~ p', el => el.innerText);
        const telefone = await page.$eval('.bg-galeria-unidade.bg-info-unidade .col-md-3:nth-child(3) p', el => el.innerText);
        const email = await page.$eval('.bg-galeria-unidade.bg-info-unidade .col-md-3:nth-child(4) p', el => el.innerText);

        const obj = {
            nome, endereco, telefone, email
        }

        console.log(obj);

        index++;
    }

    await browser.close();
})();