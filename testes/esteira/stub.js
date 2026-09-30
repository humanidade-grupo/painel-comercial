/* Cofre SIMULADO para testar a Esteira localmente (30/09) — dados fictícios, nada real.
   A rota ?app=leads&fn=list segue a fila CENA (no endereço: #html,html,ok):
     'html'  → página de erro do Google em 1 s (a falha de entrega medida em 30/09)
     'nunca' → a resposta não chega
     '15000' → responde certo depois de 15 s
     'ok'    → responde certo em 0,3 s (é o padrão quando a fila acaba)
   window.LOG guarda cada chamada (app, passo, tempo, cancelado). */
(function () {
  try { localStorage.setItem('hub_token_gestao', 'TOKEN-TESTE-123'); } catch (e) {}
  window.CENA = (location.hash.slice(1) || 'html,html,ok').split(',');
  window.LOG = [];
  window.TELA = []; setInterval(function () { var a = document.querySelector('#avisos'); if (a) TELA.push(Math.round(performance.now() / 1000) + 's ' + a.innerText.slice(0, 90)); }, 2000);
  var real = window.fetch;
  var leads = [];
  var et = ['Lead Frio','Qualificação','Visita','Proposta','Contrato','Venda Ganha'], vs = ['Ana Luiza Teste','Felipe Teste','Jaime Teste'];
  for (var i = 0; i < 60; i++) leads.push({ 'Deal ID': 4000 + i, 'Cliente': 'Cliente ' + i, 'Criado em': '2026-08-0' + (1 + i % 9) + 'T10:00:00.000000Z',
    'Atualizado em': '2026-09-' + String(10 + i % 19) + 'T10:00:00.000000Z', 'Etapa ID': i % 6, 'Estágio': et[i % 6], 'Status': '', 'Origem do Lead': '',
    'Valor': '0', 'Vendedor': vs[i % 3], 'Funil': 'Funil Vendas Parque da Saudade', 'Empreendimento': 'Parque da Saudade' });
  window.fetch = function (url, o) {
    url = String(url); if (url.indexOf('script.google.com') < 0) return real.apply(this, arguments);
    var app = (url.match(/app=([^&]+)/) || [])[1], t0 = Date.now(), e = { app: app, t: 0, inicio: Math.round(performance.now()) }; LOG.push(e);
    var passo = app === 'leads' ? (CENA.length ? CENA.shift() : 'ok') : 'ok';
    return new Promise(function (res, rej) {
      if (o && o.signal) o.signal.addEventListener('abort', function () { e.cancelado = true; rej(new DOMException('abort', 'AbortError')); });
      if (passo === 'nunca') return;
      var html = passo === 'html', ms = html ? 1000 : (/^\d+$/.test(passo) ? +passo : 300);
      var corpo = html ? '<!DOCTYPE html><html><body>erro</body></html>'
        : app === 'leads' ? JSON.stringify({ ok: true, carimbo: '2026-09-30 05:11', total_aba: leads.length, n: leads.length, truncado: false, leads: leads })
        : JSON.stringify({ ok: false, error: 'stub sem ' + app });
      setTimeout(function () { e.t = (Date.now() - t0); e.passo = passo; res(new Response(corpo, { status: 200 })); }, ms);
    });
  };
})();
