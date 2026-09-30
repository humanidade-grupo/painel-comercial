"""Monta a Esteira de teste: a tela de verdade (docs/esteira/index.html) com um Cofre SIMULADO no
lugar do /exec (stub.js, dados fictícios). Saída em testes/esteira/site/, servida pela entrada
`teste-esteira` do .claude/launch.json (http://localhost:8126). O cenário vai no endereço:
http://localhost:8126/#html,html,ok  (ver stub.js). Nada aqui toca o Cofre real.
"""
import io
import os
import shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
TELA = os.path.join(AQUI, '..', '..', 'docs', 'esteira', 'index.html')
SITE = os.path.join(AQUI, 'site')

src = io.open(TELA, encoding='utf-8').read()
marca = '<head>'
if src.count(marca) != 1:
    raise SystemExit('não achei o <head> da tela — o index.html mudou de forma?')
src = src.replace(marca, marca + '\n<script src="stub.js"></script>')
os.makedirs(SITE, exist_ok=True)
io.open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8', newline='').write(src)
shutil.copy(os.path.join(AQUI, 'stub.js'), os.path.join(SITE, 'stub.js'))
print('ok:', os.path.join(SITE, 'index.html'))
