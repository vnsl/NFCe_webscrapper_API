import { Request, Response } from "express";
const axios = require('axios');
const cheerio = require('cheerio');

export class NFCeController {

    classify(items: any[]) {

    }

    async getInfo(req: Request, res: Response) {
        
        const { NFCeCode } = req.body;

        if(!NFCeCode) {
            return res.status(400).json({message: 'NFCe Code is required'});
        }

        try {
            const url = 'https://ww1.receita.fazenda.df.gov.br/DecVisualizador/Nfce/qrcode?p='+NFCeCode;

            axios(url).then((response: any) => {
                const html = response.data;
                const loadedHtml = cheerio.load(html);

                const info: any = {
                    storeName: '',
                    date: '',
                    numberitems: 0,
                    totalValue: 0,
                    taxesPaid: 0,
                    items: [],
                    invalid: false,
                };

                loadedHtml('.alert').each(function(this:any) {
                    const alert = loadedHtml(this).children().text();
                    if(alert.includes('inválida' || 'inválido')) {
                       info.invalid = true;
                    }
                })

                if(info.invalid) {
                    return res.status(404).json({message: 'NFCe Not Found'})
                }
            
                loadedHtml('.list-group-item', '#collapse1').each(function(this: any) {
                    const item = loadedHtml(this).children().find('p').text();
                    const totalValue = loadedHtml(this).find('span').text();
            
                    info.items.push({
                        item,
                        totalValue
                    })
                })
            
                info.items.forEach((item: any, index: any) => {
                    item.key = index+1;
                    if(index < info.items.length-4) {
                        item.item = item.item.slice(0, item.item.lastIndexOf('-')-1);
                        const splitedValue = item.totalValue.split('\n');
                        item.quantity = Number(splitedValue[2].trim());
                        item.unitaryValue = Number(splitedValue[6].slice(0, splitedValue[6].indexOf(',')+3).trim().replace(/,/g, '.'));
                        item.totalValue = Number(splitedValue[6].slice(splitedValue[6].indexOf(',')+3, splitedValue[6].length).trim().replace(/,/g, '.'));
                    } else if (index === info.items.length-2) {
                        item.item = item.item.slice(item.item.lastIndexOf('o')+1, item.item.length).replace(/,/g, '.')
                        item.value = Number(item.item)
                    } else {
                        item.item = item.item.slice(item.item.lastIndexOf('\n')+20, item.item.length).trim().replace(/,/g, '.')
                        item.value = Number(item.item)
                    }
                })

                const length = info.items.length
                info.taxesPaid = info.items[length-1].value;
                info.totalValue = info.items[length-3].value;
                info.numberitems = info.items[length-4].value;

                info.items.splice(-4);

                loadedHtml('#heading1').each(function(this: any) {
                    const item = loadedHtml(this).children().text();
                    info.storeName = item.slice(0, item.lastIndexOf('CNPJ')).trim();
                })

                loadedHtml('.list-group-item', '#collapse6').each(function(this: any) {
                    const item = loadedHtml(this).children().find('p').text();
                    const index = item.lastIndexOf('Emissão: ')+9;
                    info.date = item.slice(index, index+10);
            
                })

                return res.status(200).json(info);
            
            });

        } catch (error) {
            return res.status(500).json({message: 'Internal server error'})
        }

    }

}