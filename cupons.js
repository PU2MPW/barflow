import { getDb, getCollection, setData } from './_db.js';

export default function handler(req, res) {
    const { method, query, body } = req;
    
    try {
        const db = getDb();
        const cupons = getCollection('cupons');
        
        if (method === 'GET') {
            const { ativo } = query;
            let resultados = [...cupons];
            
            if (ativo !== undefined) resultados = resultados.filter(c => c.ativo == ativo);
            resultados.sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
            return res.json(resultados);
        }
        
        if (method === 'POST' && query.validar) {
            const { codigo, valor_pedido } = query;
            if (!codigo) return res.status(400).json({ error: 'codigo obrigatorio' });
            
            const cupom = cupons.find(c => c.codigo === codigo && c.ativo === 1);
            if (!cupom) return res.status(404).json({ error: 'Cupom invalido' });
            
            let desconto = 0;
            if (cupom.tipo === 'porcentagem') {
                desconto = (valor_pedido || 0) * (cupom.valor / 100);
            } else {
                desconto = cupom.valor;
            }
            
            return res.json({ valido: true, cupom, desconto });
        }
        
        if (method === 'POST') {
            const { codigo, tipo, valor } = body;
            if (!codigo || !tipo || valor === undefined) {
                return res.status(400).json({ error: 'codigo, tipo e valor obrigatorios' });
            }
            
            if (!['porcentagem', 'fixo'].includes(tipo)) {
                return res.status(400).json({ error: 'tipo deve ser porcentagem ou fixo' });
            }
            
            const newId = cupons.length > 0 ? Math.max(...cupons.map(c => c.id)) + 1 : 1;
            const newCupom = { id: newId, codigo, tipo, valor, ativo: 1 };
            cupons.push(newCupom);
            
            return res.status(201).json({ id: newId, message: 'Cupom criado' });
        }
        
        if (method === 'PUT') {
            const id = parseInt(query.id);
            if (!id) return res.status(400).json({ error: 'id obrigatorio' });
            
            const index = cupons.findIndex(c => c.id === id);
            if (index === -1) return res.status(404).json({ error: 'Cupom nao encontrado' });
            
            if (body.codigo !== undefined) cupons[index].codigo = body.codigo;
            if (body.tipo !== undefined) cupons[index].tipo = body.tipo;
            if (body.valor !== undefined) cupons[index].valor = body.valor;
            if (body.ativo !== undefined) cupons[index].ativo = body.ativo;
            
            return res.json({ message: 'Cupom atualizado' });
        }
        
        if (method === 'DELETE') {
            const id = parseInt(query.id);
            if (!id) return res.status(400).json({ error: 'id obrigatorio' });
            
            const index = cupons.findIndex(c => c.id === id);
            if (index === -1) return res.status(404).json({ error: 'Cupom nao encontrado' });
            
            cupons.splice(index, 1);
            return res.json({ message: 'Cupom deletado' });
        }
        
        res.status(405).json({ error: 'Metodo nao permitido' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}