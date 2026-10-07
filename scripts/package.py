"""Build the Firefox signing ZIP and the Chrome folder/ZIP from extension/."""
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "extension"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

for browser in ("firefox", "chrome"):
    files = {path.name: path.read_bytes() for path in SOURCE.iterdir() if path.is_file()}
    files["LICENSE"] = (ROOT / "LICENSE").read_bytes()
    manifest = json.loads(files["manifest.json"])
    if browser == "chrome":
        manifest.pop("browser_specific_settings", None)
    files["manifest.json"] = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    if browser == "chrome":
        folder = DIST / "chrome"
        folder.mkdir(exist_ok=True)
        for name, data in files.items():
            (folder / name).write_bytes(data)
    suffix = "-unsigned" if browser == "firefox" else ""
    package = DIST / f"scholar-citation-filter-{browser}{suffix}.zip"
    with zipfile.ZipFile(package, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(files.items()):
            archive.writestr(name, data)
    print(f"Built {package.name}")
