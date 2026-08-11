import zipfile
import xml.etree.ElementTree as ET
import os

def docx_to_txt(docx_path):
    # Namespace
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text = []
    with zipfile.ZipFile(docx_path) as docx:
        # Read main document XML
        xml_content = docx.read('word/document.xml')
        root = ET.fromstring(xml_content)
        # Find all paragraph elements
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            p_text = []
            # Find all text elements within the paragraph
            for text_elem in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                if text_elem.text:
                    p_text.append(text_elem.text)
            text.append(''.join(p_text))
    return '\n'.join(text)

docx_path = r'd:\HOUSEHOLDSURVEY\CARE - Mobile App Modification Requirements.docx'
if os.path.exists(docx_path):
    content = docx_to_txt(docx_path)
    # Print the content to stdout (UTF-8)
    import sys
    sys.stdout.buffer.write(content.encode('utf-8'))
else:
    print("File not found")
