/* Cofre SIMULADO para testar a PonteApp localmente — dados fictícios, nada real.
   window.CENA controla o próximo comportamento de cada rota:
     CENA.dados = ['html', 'ok']        → a 1ª chamada devolve página de erro, a 2ª responde
     CENA.recibo = 1                    → a próxima resposta de dados vem com recibo diferente
     CENA.atraso = { '2026-08': 3000 }  → atraso por mês
     CENA.marcar = { 4001: 'erro', 4002: 'ok', 4003: 'conflito', 4100: 'sem_mudanca_outro' }
     CENA.token = 'recusado' | 'config'
     CENA.boleto = 'ok' | 'conflito' ; CENA.atrasoBoleto = ms
   window.LOG guarda cada chamada (rota, corpo) para a prova. */
(function () {
  'use strict';
  try { localStorage.setItem('hub_token_controladoria', 'TOKEN-DE-TESTE-1234567890'); } catch (e) {}
  window.CENA = { dados: [], marcar: {}, atraso: {}, boleto: 'ok', atrasoBoleto: 300 };
  window.LOG = [];
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var hoje = new Date(), iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var carimbo = iso(hoje) + ' ' + pad(hoje.getHours()) + ':' + pad(Math.max(0, hoje.getMinutes() - 3));

  var venda = function (deal, data, jaz, cli, vend, mod, valor) {
    return { 'Deal ID': deal, 'Data da Venda': data, 'Quadra': jaz.split('-').slice(0, 2).join('-'), 'Jazigo': jaz.split('-')[2] || '',
      'Vendedor': vend, 'Cliente': cli, 'Modalidade': mod, 'Valor Venda': valor, 'Etapa': 'Venda Ganha', 'Valor Face': valor + 500,
      'Desconto %': 5, 'Tabela de Vendas': 'Tabela Teste', 'Fluxo de Pagamento': '1+11', 'Forma Pagamento': 'Boleto',
      'Nº Parcelas': 12, 'Entrada': 100, 'Valor Parcela': 50, '1º Vencimento': data, 'Último Vencimento': '2027-09-05',
      'Dia Vencimento': 5, 'Modelo de Contrato': 9 };
  };
  var VENDAS = {
    '2026-09': [venda(4001, '2026-09-02', 'M-19-101', 'Cliente Um', 'Vendedor A', 'Perpétuo', 10000),
                venda(4002, '2026-09-10', 'M-19-102', 'Cliente Dois', 'Vendedor B', 'Temporário', 8000),
                venda(4003, '2026-09-12', 'M-19-103', 'Cliente Três', 'Vendedor A', 'Perpétuo', 12000),
                venda(4100, '2026-09-20', 'M-19-450', 'Cliente Cinco', 'Vendedor B', 'Perpétuo', 15000)],
    '2026-08': [venda(3900, '2026-08-15', 'M-20-7', 'Cliente Agosto', 'Vendedor C', 'Perpétuo', 9000)]
  };
  var CONTROLE = { 4100: { 'Deal ID': '4100', lancado: 'SIM', data_ivertex: '2026-09-21', quem: 'Bruno', quando: '2026-09-21 10:00', 'Referência Ivertex': 'P20480', Fonte: 'tela' } };
  var MARCAS = {};   // 'deal|n' -> marcação
  var carne = function (deal) {
    var ps = [];
    for (var n = 1; n <= 4; n++) ps.push({ 'Deal ID': deal, 'Nº Parcela': n, 'Vencimento': '2026-' + pad(9 + n) + '-05', 'Valor': 50 + n,
      'Saldo Devedor': 500 - n, 'Tipo': 'monthly', 'Forma': 'x', 'Meio': 'Boleto', classe: 'boleto' });
    return ps;
  };
  var item = function (deal, n) {
    var m = MARCAS[deal + '|' + n] || null;
    return { parcela: n, total: 4, vencimento: '2026-' + pad(9 + n) + '-05', valor: 50 + n, meio_indefinido: false, marcacao: m, carne_mudou: false };
  };
  var dados = function (mes) {
    var vs = VENDAS[mes] || [];
    var boletos = {};
    vs.forEach(function (v) { boletos[v['Deal ID']] = { total: 4, tem_carne: true, tem_mensal: true, boletos: [1, 2, 3, 4].map(function (n) { return item(v['Deal ID'], n); }) }; });
    var recibo = window.CENA.recibo ? (window.CENA.recibo--, 4) : 5;
    return { ok: true, voce: 'Ana', mes: mes, mes_atual: '2026-09',
      competencias: [{ mes: '2026-09', n: 4 }, { mes: '2026-08', n: 1 }],
      vendas: vs, fila: [], corte_d4sign: '2026-08-12',
      controle: vs.map(function (v) { return CONTROLE[v['Deal ID']]; }).filter(Boolean),
      d4sign: { estado: 'ok', contratos: [], total_documentos: 0, sem_casar: 0, erro: '', carimbo: carimbo, ultimo_erro: '', ultima_falha: '' },
      pessoal: vs.map(function (v) { return { 'Deal ID': v['Deal ID'], 'Cliente': v['Cliente'], 'CPF': '000.000.000-00', 'RG': 'MG-0', 'Nascimento': '1980-02-01',
        'Celular': '(32) 90000-0000', 'E-mail': 'x@exemplo.com', 'CEP': '36000-000', 'Logradouro': 'Rua Teste', 'Número': '1', 'Complemento': '', 'Bairro': 'Centro', 'Cidade': 'Juiz de Fora', 'UF': 'MG' }; }),
      pessoal_motivo: '', boletos: boletos, boletos_motivo: '', corte_boleto: '2026-09-25',
      lancadas_sem_venda: [], referencias: { lancados: 1, com_referencia: 1 },
      total_aba: 5, n: vs.length, n_fila: 0, no_recorte: vs.length, teto: 3000, truncado: false,
      contagem: [{ aba: 'Vendas_Facilita', chave: 'facilita.total_vendas_api', esperado: 5, lido: recibo }],
      carimbo_vendas: carimbo, fonte: 'simulado', ms: 900 };
  };
  var resposta = function (corpo, atraso, signal) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { resolve({ text: function () { return Promise.resolve(corpo); } }); }, atraso);
      if (signal) signal.addEventListener('abort', function () { clearTimeout(t); var e = new Error('aborted'); e.name = 'AbortError'; reject(e); });
    });
  };
  var HTML = '<!DOCTYPE html><html><body>Não foi possível abrir o arquivo neste momento.</body></html>';
  var fetchReal = window.fetch;
  window.fetch = function (url, opts) {
    url = String(url);
    if (url.indexOf('script.google.com') < 0) return fetchReal.apply(this, arguments);
    opts = opts || {};
    var q = {}; url.split('?')[1].split('&').forEach(function (kv) { var p = kv.split('='); q[p[0]] = decodeURIComponent(p[1] || ''); });
    var corpo = opts.body ? JSON.parse(opts.body) : {};
    window.LOG.push({ fn: q.fn, mes: q.mes, deal: q.deal || corpo.deal, corpo: corpo });
    var C = window.CENA;
    if (C.token === 'recusado') return resposta(JSON.stringify({ ok: false, codigo: 'token', error: 'token ausente ou inválido' }), 200, opts.signal);
    if (C.token === 'config') return resposta(JSON.stringify({ ok: false, codigo: 'config', error: 'O cadastro de quem usa a PonteApp (Config controladoria.pessoas) está ilegível — avise o Ricardo (o texto não é uma lista JSON válida — confira vírgulas e aspas).' }), 200, opts.signal);
    if (q.fn === 'dados') {
      var passo = C.dados.length ? C.dados.shift() : 'ok';
      if (passo === 'html') return resposta(HTML, 400, opts.signal);
      if (passo === 'nunca') return new Promise(function () {});
      var mes = q.mes || '2026-09';
      return resposta(JSON.stringify(dados(mes)), C.atraso[mes] || 300, opts.signal);
    }
    if (q.fn === 'marcar') {
      var deal = corpo.deal, cena = C.marcar[deal] || 'ok', atraso = C.atrasoMarcar ? C.atrasoMarcar[deal] || 400 : 400;
      if (cena === 'erro') return resposta(JSON.stringify({ ok: false, error: 'falha simulada ao gravar' }), atraso, opts.signal);
      if (cena === 'conflito' && !corpo.forcar) {
        return resposta(JSON.stringify({ ok: false, codigo: 'conflito', deal: deal, error: 'lançada por Bruno em 2026-09-24 09:12, depois que você abriu a tela — nada gravado',
          atual: { lancado: true, data_ivertex: '2026-09-24', referencia: 'P20480', quem: 'Bruno', quando: '2026-09-24 09:12', fonte: 'tela' } }), atraso, opts.signal);
      }
      if (cena === 'sem_mudanca_outro') {
        return resposta(JSON.stringify({ ok: true, sem_mudanca: true, deal: deal, lancado: true, data_ivertex: '2026-09-21', referencia: 'P20480', fonte: 'tela',
          quem: 'Bruno', quando: '2026-09-21 10:00', avisos: [] }), atraso, opts.signal);
      }
      var linha = { 'Deal ID': String(deal), lancado: corpo.lancado ? 'SIM' : 'NÃO', data_ivertex: corpo.lancado ? (corpo.data_ivertex || iso(hoje)) : '',
        quem: 'Ana', quando: carimbo, 'Referência Ivertex': corpo.lancado ? (corpo.referencia || '') : '', Fonte: 'tela' };
      CONTROLE[deal] = linha;
      return resposta(JSON.stringify({ ok: true, deal: deal, lancado: corpo.lancado, data_ivertex: linha.data_ivertex, referencia: linha['Referência Ivertex'],
        fonte: 'tela', quem: 'Ana', quando: carimbo, avisos: [] }), atraso, opts.signal);
    }
    if (q.fn === 'venda') {
      var d = Number(q.deal), v = null;
      Object.keys(VENDAS).forEach(function (k) { VENDAS[k].forEach(function (x) { if (x['Deal ID'] === d) v = x; }); });
      return resposta(JSON.stringify({ ok: true, deal: d, venda: v, pessoal: { 'Deal ID': d, 'Cliente': v ? v['Cliente'] : '', 'CPF': '000.000.000-00', 'Nascimento': '1980-02-01' },
        contratos: [], controle: CONTROLE[d] || null, carne: carne(d), carne_total: 4,
        boletos: Object.keys(MARCAS).filter(function (k) { return MARCAS[k].deal === d; }).map(function (k) { return MARCAS[k]; }),
        motivos: ['Pago por PIX', 'Outro motivo'], corte_boleto: '2026-09-25', avisos: [],
        contagem: [{ aba: 'Vendas_Facilita', chave: 'x', esperado: 5, lido: 5 }] }), 500, opts.signal);
    }
    if (q.fn === 'boleto' || q.fn === 'boleto_lote') {
      var itens = q.fn === 'boleto' ? [corpo] : corpo.itens;
      if (C.boleto === 'conflito' && !corpo.forcar) {
        var alvo = itens[0], m0 = { deal: alvo.deal, parcela: alvo.parcela, venc_foto: '2026-10-05', valor_foto: 51, estado: 'outro', data_envio: '',
          motivo: 'Pago por PIX', obs: '', quem: 'Bruno', quando: '2026-09-24 09:30', fonte: 'tela' };
        MARCAS[alvo.deal + '|' + alvo.parcela] = m0;
        return resposta(JSON.stringify({ ok: false, codigo: 'conflito', error: 'Bruno mudou 1 parcela depois que você abriu a tela — nada foi gravado',
          conflitos: [{ deal: alvo.deal, parcela: alvo.parcela, marcacao: m0 }] }), C.atrasoBoleto, opts.signal);
      }
      var ms = itens.map(function (it) {
        var m = { deal: it.deal, parcela: it.parcela, venc_foto: '2026-10-05', valor_foto: 51, estado: it.estado || 'enviado', data_envio: corpo.data_envio || it.data_envio || iso(hoje),
          motivo: it.motivo || '', obs: '', quem: 'Ana', quando: carimbo, fonte: 'tela' };
        MARCAS[it.deal + '|' + it.parcela] = m;
        return m;
      });
      return resposta(JSON.stringify(q.fn === 'boleto' ? { ok: true, sem_mudanca: false, marcacao: ms[0] } : { ok: true, gravados: ms.length, sem_mudanca: 0, marcacoes: ms }),
        C.atrasoBoleto, opts.signal);
    }
    if (q.fn === 'boletos') {
      var its = [];
      Object.keys(VENDAS).forEach(function (k) { VENDAS[k].forEach(function (v) {
        var it = item(v['Deal ID'], 1); it.deal = v['Deal ID']; it.jazigo = v['Quadra'] + '-' + v['Jazigo']; it.cliente = v['Cliente'];
        it.vendedor = v['Vendedor']; it.modalidade = v['Modalidade']; it.data_venda = v['Data da Venda']; its.push(it);
      }); });
      return resposta(JSON.stringify({ ok: true, mes: q.mes, meses: [{ mes: '2026-10', n: its.length }], itens: its, n: its.length, corte_boleto: '2026-09-25',
        corte_facilita: '2026-04-13', fora_da_regra: { n: 0 }, contagem: [{ aba: 'Vendas_Facilita', chave: 'x', esperado: 5, lido: 5 }], truncado: false, motivos: ['Pago por PIX'] }), 300, opts.signal);
    }
    return resposta(JSON.stringify({ ok: false, codigo: 'invalido', error: 'rota desconhecida' }), 100, opts.signal);
  };
})();
