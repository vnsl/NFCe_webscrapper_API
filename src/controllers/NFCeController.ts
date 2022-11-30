import { Request, Response } from "express";
const axios = require('axios');
const cheerio = require('cheerio');

export class NFCeController {
    async getInfo(req: Request, res: Response) {

        const { NFCeCode } = req.body;

        if(!NFCeCode) {
            return res.status(400).json({message: 'NFCeCode is required'});
        }

        try {
            const url = 'https://ww1.receita.fazenda.df.gov.br/DecVisualizador/Nfce/qrcode?p='+NFCeCode;

            axios(url).then((response: any) => {
                const html = response.data;
                const loadedHtml = cheerio.load(html);
            
                const info: any[] = [];
            
                loadedHtml('.list-group-item', '#collapse1').each(function(this: any) {
                    const item = loadedHtml(this).children().find('p').text();
                    const totalValue = loadedHtml(this).find('span').text();
            
                    info.push({
                        item,
                        totalValue
                    })
                })
            
                info.forEach((item, index) => {
                    if(index < info.length-4) {
                        item.item = item.item.slice(0, item.item.lastIndexOf('-')-1);
                        const splitedValue = item.totalValue.split('\n');
                        item.quantity = Number(splitedValue[2].trim());
                        item.unitaryValue = Number(splitedValue[6].slice(0, splitedValue[6].indexOf(',')+3).trim().replace(/,/g, '.'));
                        item.totalValue = Number(splitedValue[6].slice(splitedValue[6].indexOf(',')+3, splitedValue[6].length).trim().replace(/,/g, '.'));
                    } else if (index === info.length-2) {
                        item.item = item.item.slice(item.item.lastIndexOf('o')+1, item.item.length).replace(/,/g, '.')
                        item.value = Number(item.item)
                    } else {
                        item.item = item.item.slice(item.item.lastIndexOf('\n')+20, item.item.length).trim().replace(/,/g, '.')
                        const number = item.item;
                        item.value = Number(item.item)
                    }
                })

                return res.status(200).json(info);
            
            });

        } catch (error) {
            return res.status(500).json({message: 'Internal server error'})
        }

    }

}