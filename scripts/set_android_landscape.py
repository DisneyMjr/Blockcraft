from pathlib import Path
import sys
import xml.etree.ElementTree as ET

manifest = Path(sys.argv[1])
assert manifest.exists(), f"Manifest inexistente: {manifest}"
ns = "http://schemas.android.com/apk/res/android"
ET.register_namespace("android", ns)
tree = ET.parse(manifest)
root = tree.getroot()
app = root.find("application")
assert app is not None, "AndroidManifest sem application"
activities = app.findall("activity")
assert activities, "AndroidManifest sem Activity"
for activity in activities:
    activity.set(f"{{{ns}}}screenOrientation", "landscape")
tree.write(manifest, encoding="utf-8", xml_declaration=True)
print(f"Orientacao landscape aplicada em {len(activities)} Activity(s)")
