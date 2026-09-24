"""Monta a PonteApp de teste: a tela de verdade (docs/controladoria/index.html) com um Cofre
SIMULADO no lugar do /exec (stub.js, dados fictícios). Saída em testes/ponteapp/site/, servida pela
entrada `teste-ponteapp` do .claude/launch.json (http://localhost:8125).

    python testes/ponteapp/montar.py            # a 1ª leitura de dados já vem como página de erro
    python testes/ponteapp/montar.py --limpo    # começa sem cenário

Os cenários mudam no console da página: CENA.dados = ['html', 'ok'] · CENA.recibo = 1 ·
CENA.atraso = {'2026-08': 3000} · CENA.marcar = {4001: 'erro' | 'ok' | 'conflito' | 'sem_mudanca_outro'} ·
CENA.atrasoMarcar = {4001: 2500} · CENA.token = 'recusado' | 'config' · CENA.boleto = 'ok' | 'conflito'.
LOG guarda cada chamada (rota e corpo). Nada aqui toca o Cofre real nem tem dado de cliente.
"""
import io
import os
import shutil
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
TELA = os.path.join(AQUI, '..', '..', 'docs', 'controladoria', 'index.html')
SITE = os.path.join(AQUI, 'site')

src = io.open(TELA, encoding='utf-8').read()
marca = '<script>\n(function () {'
if src.count(marca) != 1:
    sys.exit('não achei o começo do script da tela — o index.html mudou de forma?')
cena = '' if '--limpo' in sys.argv else '<script>CENA.dados = ["html", "ok"];</script>\n'
src = src.replace(marca, '<script src="stub.js"></script>\n' + cena + marca)
os.makedirs(SITE, exist_ok=True)
io.open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8', newline='').write(src)
shutil.copy(os.path.join(AQUI, 'stub.js'), os.path.join(SITE, 'stub.js'))
print('ok: ' + os.path.join(SITE, 'index.html'))
