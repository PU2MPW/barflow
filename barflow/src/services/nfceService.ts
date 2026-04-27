import type { Order, Payment } from '../types';

interface NFCeConfig {
  companyName: string;
  tradeName: string;
  cnpj: string;
  ie: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  certificatePath?: string;
  certificatePassword?: string;
}

interface NFCeItem {
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  un: string;
  qtd: number;
  valor: number;
  valorTot: number;
  trib: {
    icms: number;
    pis: number;
    cofins: number;
  };
}

interface NFCeResult {
  success: boolean;
  key?: string;
  number?: number;
  series?: number;
  date?: string;
  url?: string;
  error?: string;
}

class NFCeService {
  private config: NFCeConfig | null = null;

  configure(config: NFCeConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  async emitNFCe(order: Order): Promise<NFCeResult> {
    if (!this.config) {
      return { success: false, error: 'NFC-e não configurada' };
    }

    try {
      const items: NFCeItem[] = order.items.map((item, index) => ({
        codigo: `PROD${String(index + 1).padStart(4, '0')}`,
        descricao: item.product_name,
        ncm: '21010000',
        cfop: '5102',
        un: 'UN',
        qtd: item.quantity,
        valor: item.unit_price,
        valorTot: item.total,
        trib: {
          icms: 0,
          pis: 0,
          cofins: 0,
        },
      }));

      const totalPis = items.reduce((sum, item) => sum + (item.valorTot * 0.0065), 0);
      const totalCofins = items.reduce((sum, item) => sum + (item.valorTot * 0.03), 0);

      const xmlPayload = {
        infNFe: {
          ide: {
            cNF: Math.floor(Math.random() * 99999999),
            natOp: 'Venda de mercadoria',
            serie: 1,
            nNF: Math.floor(Math.random() * 999999999),
            dhEmi: new Date().toISOString(),
            tpNF: 1,
            idDest: 1,
            cMunFG: '3550308',
            tpImp: 4,
            tpEmis: 1,
            tpAmb: 2,
            finNFe: 1,
            indFinal: 1,
            indPres: 1,
          },
          emit: {
            CNPJ: this.config.cnpj.replace(/\D/g, ''),
            xNome: this.config.companyName,
            xFant: this.config.tradeName,
            ie: this.config.ie,
            enderEmit: {
              xLgr: this.config.address.split(',')[0] || this.config.address,
              nro: '1',
              xBairro: 'Centro',
              cMun: '3550308',
              xMun: this.config.city,
              UF: this.config.state,
              CEP: '00000000',
              cPais: '1058',
              xPais: 'BRASIL',
              fone: this.config.phone.replace(/\D/g, ''),
            },
          },
          dest: {
            CNPJ: '00000000000000',
            xNome: 'Consumidor Final',
            indIEDest: 9,
          },
          det: items.map((item, index) => ({
            nItem: index + 1,
            prod: {
              cProd: item.codigo,
              cEAN: 'SEM GTIN',
              xProd: item.descricao,
              NCM: item.ncm,
              CFOP: item.cfop,
              uCom: item.un,
              qCom: item.qtd,
              vUnCom: item.valor.toFixed(2),
              vProd: item.valorTot.toFixed(2),
              cEANTrib: 'SEM GTIN',
              uTrib: item.un,
              qTrib: item.qtd,
              vUnTrib: item.valor.toFixed(2),
              indTot: 1,
            },
            imposto: {
              vTotTrib: 0,
              ICMS: {
                orig: '0',
                CST: '00',
                vBC: item.valorTot.toFixed(2),
                pICMS: '0',
                vICMS: '0',
              },
              PIS: {
                CST: '04',
                vBC: item.valorTot.toFixed(2),
                pPIS: '0.65',
                vPIS: (item.valorTot * 0.0065).toFixed(2),
              },
              COFINS: {
                CST: '04',
                vBC: item.valorTot.toFixed(2),
                pCOFINS: '3',
                vCOFINS: (item.valorTot * 0.03).toFixed(2),
              },
            },
          })),
          total: {
            ICMSTot: {
              vBC: order.subtotal.toFixed(2),
              vICMS: '0.00',
              vICMSDeson: '0.00',
              vFCP: '0.00',
              vBCST: '0.00',
              vST: '0.00',
              vFCPST: '0.00',
              vFCPSTRet: '0.00',
              vProd: order.subtotal.toFixed(2),
              vFrete: '0.00',
              vSeg: '0.00',
              vDesc: order.discount > 0 ? order.discount.toFixed(2) : '0.00',
              vII: '0.00',
              vIPI: '0.00',
              vIPIDev: '0.00',
              vPIS: totalPis.toFixed(2),
              vCOFINS: totalCofins.toFixed(2),
              vOutro: '0.00',
              vNF: order.total.toFixed(2),
            },
          },
          pag: {
            detPag: order.payments.map((payment, index) => ({
              indPag: index === 0 ? 0 : 1,
              tPag: this.getFormaPagamento(payment.method),
              vPag: payment.amount.toFixed(2),
            })),
            vTroco: 0,
          },
          infAdic: {
            infCpl: 'BarFlow - Sistema de Gestao para Bares e Restaurantes',
          },
        },
      };

      // PLACEHOLDER: Enviar para SEFAZ real
      // Por enquanto, retorna resultado simulado
      console.log('NFC-e Payload:', JSON.stringify(xmlPayload, null, 2));

      await new Promise(resolve => setTimeout(resolve, 500));

      const simulatedKey = `NFe${Date.now()}${Math.floor(Math.random() * 999999999999)}`;

      return {
        success: true,
        key: simulatedKey,
        number: Math.floor(Math.random() * 999999999),
        series: 1,
        date: new Date().toISOString(),
        url: `https://www.sefaz.rs.gov.br/ASP/NFe/ValidaNFCe.aspx?nRec=${simulatedKey}`,
      };
    } catch (error) {
      console.error('Erro ao emitir NFC-e:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private getFormaPagamento(method: Payment['method']): string {
    if (method === 'pix') return '17';
    if (method === 'credit') return '03';
    if (method === 'debit') return '04';
    if (method === 'cash') return '01';
    return '10';
  }

  async consultNFCe(key: string): Promise<NFCeResult> {
    // PLACEHOLDER: Consultar SEFAZ
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      key,
      url: `https://www.sefaz.rs.gov.br/ASP/NFe/ValidaNFCe.aspx?nRec=${key}`,
    };
  }

  async cancelNFCe(key: string, _reason: string): Promise<NFCeResult> {
    // PLACEHOLDER: Cancelar na SEFAZ
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      key,
    };
  }
}

export const nfceService = new NFCeService();
export type { NFCeConfig, NFCeItem, NFCeResult };