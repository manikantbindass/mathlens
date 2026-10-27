"""Assemble pre-rendered SVG frames and an ICO. Does not draw presentation imagery."""
from pathlib import Path
from PIL import Image
for name in ['header','footer']:
    frames=[Image.open(p).convert('RGB') for p in sorted(Path('assets/readme/frames',name).glob('*.png'))]
    frames[0].save(Path('assets/readme',name+'.gif'),save_all=True,append_images=frames[1:],duration=[150]*23+[1400],loop=0,optimize=True,disposal=2)
Image.open('apps/desktop/assets/icon.png').save('apps/desktop/assets/icon.ico',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
print('README GIF animations and Windows ICO written.')
