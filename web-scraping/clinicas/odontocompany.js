import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://odontocompany.com/clinicas";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let data = [];

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector('.filtro-unidades__control #estado option');

    const estados = await page.$$eval(".filtro-unidades__control #estado option", (el) =>
        el.filter(estado => estado.value != '').map(estado => estado.value)
    );

    for (const estado of estados) {
        const link = `https://odontocompany.com/busca/cidades/${estado}`;
        await page.goto(link, { waitUntil: "domcontentloaded" });
    
        const cidades = await page.$eval("body", el => JSON.parse(el.innerText));

        for(const key in cidades){
            const link = `https://odontocompany.com/busca/unidades/porcidade/${cidades[key].id}`;
            await page.goto(link, { waitUntil: "domcontentloaded" });

            const enderecos = await page.$eval("body", el => JSON.parse(el.innerText));
            for(const key in enderecos){
                data.push({
                    franquia: 'OdontoCompany',
                    cidade: enderecos[key].cidade.nome,
                    estado: enderecos[key].cidade.estado_id,
                    endereco: enderecos[key].endereco,
                    bairro: enderecos[key].bairro,
                    cep: enderecos[key].cep,
                    responsavel_nome: enderecos[key].responsavel_nome,
                    telefone1: (enderecos[key].telefones[0] == undefined) ? null : enderecos[key].telefones[0].telefone,
                    telefone2: (enderecos[key].telefones[1] == undefined) ? null : enderecos[key].telefones[1].telefone,
                })
            }
        }
        console.log(data)
    }
    fs.appendFileSync('../data/odontocompany.json', JSON.stringify(data, null, 2));
})();