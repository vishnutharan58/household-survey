import zipfile
in_pptx = 'd:/HOUSEHOLDSURVEY/COMMUNITY CONNECT PPT FORMAT R.VishnuTharan_Provision.pptx'
out_pptx = 'd:/HOUSEHOLDSURVEY/COMMUNITY CONNECT PPT FORMAT R.VishnuTharan_Provision_Fixed.pptx'
with zipfile.ZipFile(in_pptx, 'r') as zin, zipfile.ZipFile(out_pptx, 'w') as zout:
    for i in zin.infolist():
        if i.filename.startswith('ppt/slides/slide') and i.filename.endswith('.xml'):
            content = zin.read(i.filename).decode('utf-8')
            content = content.replace('typeface="Noto Sans Symbols"', 'typeface="Arial"')
            content = content.replace('char="\\u2756"', 'char="\\u2022"')
            content = content.replace('char="\u2756"', 'char="\u2022"')
            zout.writestr(i, content.encode('utf-8'))
        else:
            zout.writestr(i, zin.read(i.filename))
print("Done")
