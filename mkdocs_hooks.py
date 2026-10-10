"""Serves the examples and the built library with the documentation, so the live sketches in it work
both with `mkdocs serve` and in the built site."""

from pathlib import Path

from mkdocs.structure.files import File

ROOT = Path(__file__).parent


def on_files(files, config):
    sources = [*(ROOT / "examples").rglob("*"), ROOT / "lib" / "p5.keyed.js"]
    for source in sources:
        if source.is_file() and source.name != ".DS_Store":
            files.append(
                File(
                    source.relative_to(ROOT).as_posix(),
                    str(ROOT),
                    config["site_dir"],
                    config["use_directory_urls"],
                )
            )
    return files
