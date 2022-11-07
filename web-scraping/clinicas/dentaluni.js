import puppeteer from "puppeteer";
import fs from "fs";

let url = "https://www.dentaluni.com.br/encontreseudentistaavancado";
let data = [];

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 968});
    await page.goto(url, { waitUntil: "domcontentloaded" });
  
    const estados = await page.$$eval("#estadoDentista_a option", (el) =>
        el.filter((estado) => estado.value != '').map((estado) => estado.value)
    );

    for(const estado of estados){
        await page.select("#estadoDentista_a", estado);

        await page.waitForTimeout(1000);

        const cidades = await page.$$eval("#cidadeclinica_a option", (el) =>
            el.filter((cidade) => cidade.value != '').map((cidade) => cidade.value)
        );

        for(const cidade of cidades){
            await page.select("#cidadeclinica_a", cidade);
            await page.waitForTimeout(2000);
            await page.evaluate(() => document.querySelector('.btn-consultar').click())
            await page.waitForTimeout(2000);

            const clinicas = await page.$$eval(".encontre", (el) =>
                el.map((cidade) => cidade.innerText.split('\n')).map((cidade) => {
                    const newClinica = {
                        franquia: cidade[0],
                        telefone: cidade[2],
                        endereco: cidade[3]
                    }
                    return newClinica
                }));
                                
            data.push(clinicas);

            console.log(data)

            // await page.evaluate(() => {
            //     document.querySelectorAll('.encontre')[3].querySelector('li:nth-child(4)')
            // });

            // document.querySelectorAll('.encontre')[3].querySelector('li:nth-child(4)')

    //         await page.waitForSelector('.card-p-unidades', {visible: true}).catch((error) => {});

    //         const endereco = await page.evaluate(() => {
    //             try {
    //                 document.querySelectorAll('.card-p-unidades b')[1].remove();
    //                 return document.querySelectorAll('.card-p-unidades')[1].innerText.replace('\n', '');                    
    //             } catch (error) {
    //                 return null
    //             }
    //         })

    //         data.push({
    //             franquia: 'Odonto Excellence',
    //             enderecoFull,
    //             cidadeFull
    //         });

    //         console.log(data);
        }
    }
    fs.appendFileSync('../data/dentaluni.json', JSON.stringify(data, null, 2));
})();