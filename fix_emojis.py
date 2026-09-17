import sys

with open('video.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<div class="fc-icon">?</div>', '<div class="fc-icon">?</div>')
html = html.replace('<div class="fc-icon">??</div>\n            <h3 class="fc-title">Smart Workflows</h3>', '<div class="fc-icon">??</div>\n            <h3 class="fc-title">Smart Workflows</h3>')
html = html.replace('<div class="fc-icon">??</div>\n            <h3 class="fc-title">AI VFX', '<div class="fc-icon">??</div>\n            <h3 class="fc-title">AI VFX')

with open('video.html', 'w', encoding='utf-8') as f:
    f.write(html)
