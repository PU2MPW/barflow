// BarFlow API - Supabase Configuration
const SUPABASE_URL = 'https://zxfnngivprifccqypzqe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Zm5uZ2l2cHJpZmNjcXlwenFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE1MjAxMCwiZXhwIjoyMDkyNzI4MDEwfQ.HZwrT1k7wJYLeMqVpCUZcCw7Jf8oF4Dv9L2QZO7ZvLs';

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
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        console.log('INSERT', table, data, 'RESULT:', result, 'STATUS:', res.status);
        return result;
    } catch (e) { 
        console.log('INSERT ERROR', e);
        return { error: e.message }; 
    }
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
    
    // ========== FIDELIDADE - PONTOS ==========
    if (path === '/api/fidelidade/pontos') {
        const data = await query('clientes', 'pontos=gt.0&order=pontos.desc&limit=50');
        return res.json(data);
    }
    
    // ========== FIDELIDADE - RESGATE ==========
    if (path === '/api/fidelidade/resgate') {
        const { cliente_id, pontos } = body;
        const clientes = await query('clientes', `id=eq.${cliente_id}`);
        if (clientes.length === 0) {
            return res.json({ sucesso: false, erro: 'Cliente não encontrado' });
        }
        const cliente = clientes[0];
        if (cliente.pontos < pontos) {
            return res.json({ sucesso: false, erro: 'Pontos insuficientes' });
        }
        const novosPontos = cliente.pontos - pontos;
        await update('clientes', cliente_id, { pontos: novosPontos });
        return res.json({ sucesso: true, pontos_restantes: novosPontos });
    }
    
    // ========== FIDELIDADE - ACUMULAR ==========
    if (path === '/api/fidelidade/acumular') {
        const { cliente_id, pontos } = body;
        const clientes = await query('clientes', `id=eq.${cliente_id}`);
        if (clientes.length > 0) {
            const atual = clientes[0].pontos || 0;
            await update('clientes', cliente_id, { pontos: atual + pontos });
        }
        return res.json({ sucesso: true });
    }
    
    // ========== DELIVERY - STATUS ==========
    if (path === '/api/delivery/status') {
        const { pedido_id, status, entregador } = body;
        if (pedido_id && status) {
            await update('pedidos', pedido_id, { 
                status: status,
                entregador: entregador
            });
            return res.json({ sucesso: true });
        }
        return res.json({ sucesso: false, erro: 'Dados incompletos' });
    }
    
    // ========== DELIVERY - LISTAR ENTREGAS ==========
    if (path === '/api/delivery/entregas') {
        const data = await query('pedidos', `tipo=eq.delivery&order=created_at.desc&limit=50`);
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
        await insert('cupons', { codigo: 'LANCHE10', tipo: 'valor', valor: 10, ativo: true });
        
        // Cliente demo com pontos
        await insert('clientes', { nome: 'Cliente VIP', telefone: '11999990001', pontos: 150, total_gasto: 500 });
        await insert('clientes', { nome: 'Maria Silva', telefone: '11999990002', pontos: 75, total_gasto: 250 });
        
        return res.json({ sucesso: true });
    }
    
    res.status(404).json({ erro: 'not found', path });
};