import zipfile
import re

z = zipfile.ZipFile('d:/HOUSEHOLDSURVEY/COMMUNITY CONNECT PPT FORMAT R.VishnuTharan_Provision.pptx')
xml = z.read('ppt/slides/slide2.xml').decode('utf-8')

# The font might be in <a:rPr> or as a bullet font <a:buFont typeface="Noto Sans Symbols"/>
# If it's a bullet font, the symbol is the char attribute of the <a:buChar char="..."/> tag

# search for Noto Sans Symbols
matches = re.finditer(r'<a:[a-zA-Z]+[^>]*typeface="Noto Sans Symbols"[^>]*>', xml)
for m in matches:
    print("Found font usage:", m.group(0))

# Try to find bullet chars
bu_chars = re.finditer(r'<a:buChar char="([^"]+)"', xml)
for m in bu_chars:
    char = m.group(1)
    print("Found bullet char:", char, "Unicode:", hex(ord(char)))

# Try to find text with this font
runs = re.finditer(r'<a:r>.*?<a:rPr[^>]*typeface="Noto Sans Symbols".*?</a:r>', xml, re.DOTALL)
for r in runs:
    text_match = re.search(r'<a:t>([^<]*)</a:t>', r.group(0))
    if text_match:
        char = text_match.group(1)
        print("Found text:", char, "Unicode:", hex(ord(char)))
