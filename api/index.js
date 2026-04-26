// BarFlow API - Configure as variáveis de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://SEU_PROJETO.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'SUA_CHAVE_SECRETA';

async function query(table, filter = '') {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter ? '?' + filter : ''}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        return res.json();
    } catch (e) { return []; }
}

async function insert(table, data) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return res.json();
    } catch (e) { return []; }
}

async function update(table, id, data) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    } catch (e) {}
}

function parseBody(url) {
    const params = {};
    try {
        const queryString = url.split('?')[1] || '';
        const searchParams = new URLSearchParams(queryString);
        for (const [key, value] of searchParams) {
            try { params[key] = JSON.parse(value); } 
            catch { params[key] = value; }
        }
    } catch (e) {}
    return params;
}

module.exports = async (req, res) => {
    const { url } = req;
    const path = url.split('?')[0];
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const body = parseBody(url);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (path === '/api/dashboard') {
        const hoje = new Date().toISOString().split('T')[0];
        const pedidos = await query('pedidos', `created_at=gte.${hoje}T00:00:00`);
        const faturamento = pedidos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0);
        const mesas = await query('mesas');
        
        return res.json({
            pedidos_hoje: pedidos.length,
            faturamento_hoje: faturamento,
            ticket_medio: pedidos.length ? faturamento / pedidos.length : 0,
            mesas_disponiveis: mesas.filter(m => m.status === 'disponivel').length,
            timestamp: new Date().toISOString()
        });
    }
    
    if (path === '/api/categorias') {
        const data = await query('categorias', 'order=ordem.asc&ativo=eq.true');
        return res.json(data);
    }
    
    if (path === '/api/produtos') {
        const data = await query('produtos', 'ativo=eq.true&order=nome.asc');
        return res.json(data);
    }
    
    if (path === '/api/mesas') {
        const data = await query('mesas', 'order=numero.asc');
        return res.json(data);
    }
    
    if (path === '/api/pedidos') {
        const data = await query('pedidos', 'order=created_at.desc&limit=50');
        return res.json(data);
    }
    
    if (path === '/api/pedidos/criar') {
        const item = await insert('pedidos', { 
            mesa_id: body.mesa_id || 1,
            tipo: body.tipo || 'mesa',
            status: 'aberto',
            total: body.total || 0,
            itens: JSON.stringify(body.itens || []),
            created_at: new Date().toISOString()
        });
        return res.json(item);
    }
    
    if (path === '/api/clientes') {
        const data = await query('clientes', 'order=nome.asc&limit=50');
        return res.json(data);
    }
    
    if (path === '/api/clientes/criar') {
        const item = await insert('clientes', { 
            nome: body.nome,
            telefone: body.telefone,
            email: body.email,
            pontos: 0,
            total_gasto: 0,
            visitas: 0
        });
        return res.json(item);
    }
    
    if (path === '/api/cupons') {
        const data = await query('cupons', 'order=codigo.asc');
        return res.json(data);
    }
    
    if (path === '/api/estoque') {
        const data = await query('estoque');
        return res.json(data);
    }
    
    if (path === '/api/financeiro') {
        const data = await query('financeiro', 'order=data.desc&limit=50');
        return res.json(data);
    }
    
    if (path === '/api/reservas') {
        const data = await query('reservas', 'order=data.desc&limit=50');
        return res.json(data);
    }
    
    if (path === '/api/config') {
        const data = await query('config');
        const config = {};
        data.forEach(c => config[c.chave] = c.valor);
        return res.json(config);
    }
    
    if (path === '/api/setup/inicial') {
        await insert('config', { chave: 'empresa', valor: JSON.stringify(body.empresa || {}) });
        await insert('config', { chave: 'modulos', valor: JSON.stringify(body.modulos || {}) });
        return res.json({ sucesso: true });
    }
    
    if (path === '/api/seed') {
        await insert('cupons', { codigo: 'BAR10', tipo: 'percentual', valor: 10, ativo: true });
        await insert('cupons', { codigo: 'FIDELIDADE5', tipo: 'percentual', valor: 5, ativo: true });
        return res.json({ sucesso: true });
    }
    
    res.status(404).json({ erro: 'not found', path });
};