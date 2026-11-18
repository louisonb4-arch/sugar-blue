"""Génère index.html : injecte le logo vectorisé (src/logo-parts.json) dans src/index.html
et versionne les fichiers CSS/JS pour éviter le cache des téléphones.
Usage : python3 build.py"""
import json, re, hashlib, pathlib
root = pathlib.Path(__file__).parent
p = json.loads((root / 'src/logo-parts.json').read_text())
html = (root / 'src/index.html').read_text()
for k, v in {'W': p['W'], 'H': p['H'], 'RING': p['ring'], 'SUGAR': p['sugar'], 'BLUE': p['blue'], 'BASE': p['base']}.items():
    html = html.replace('{{' + k + '}}', str(v))
assert '{{' not in html
def ver(m):
    path = m.group(2)
    h = hashlib.md5((root / path).read_bytes()).hexdigest()[:8]
    return f'{m.group(1)}="{path}?v={h}"'
html = re.sub(r'(href|src)="((?:css|js)/[^"?]+\.(?:css|js))"', ver, html)
(root / 'index.html').write_text(html)
print('index.html ok')
