"""Extract a static instance out of a variable font using fontTools' instancer."""

from __future__ import annotations

from io import BytesIO
from typing import Any

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from otf2ttf.cli import otf_to_ttf


def extract_instance(
    font_bytes: bytes, axis_values: dict[str, float], style_name: str = "Custom"
) -> bytes:
    """Pin the given axes to fixed values and return the resulting static font bytes.

    `axis_values` maps axis tags (e.g. "wght", "wdth") to the desired value.
    Any axis not present keeps its default value.
    """
    font = TTFont(BytesIO(font_bytes))

    if "fvar" not in font:
        raise ValueError("This font has no 'fvar' table, so it is not a variable font.")

    valid_tags = {axis.axisTag for axis in font["fvar"].axes}
    unknown_tags = set(axis_values) - valid_tags
    if unknown_tags:
        raise ValueError(f"Unknown axis tag(s): {', '.join(sorted(unknown_tags))}")

    try:
        # updateFontNames rewrites the name table (and head/OS2 style bits) to
        # match the pinned coordinates via the STAT table's Axis Value
        # records. Without it every exported instance keeps the source
        # font's generic default-instance identity (e.g. every weight is
        # named "Regular"), so installing two different instances collides.
        # downgradeCFF2 turns a CFF2 source into a classic CFF table, since
        # CFF2 is meant for variable fonts and isn't understood by all
        # downstream tooling even once fully pinned.
        instantiateVariableFont(
            font,
            axis_values,
            inplace=True,
            updateFontNames=True,
            downgradeCFF2=True,
        )
    except ValueError:
        # No STAT Axis Value record covers this exact combination of axis
        # coordinates (e.g. a custom slider position), which is what
        # updateFontNames requires. Fall back to plain instancing and stamp
        # the caller-provided style name instead, so this instance still
        # gets an identity distinct from every other export of this font.
        font = TTFont(BytesIO(font_bytes))
        instantiateVariableFont(font, axis_values, inplace=True, downgradeCFF2=True)
        _rename_instance(font, style_name)

    _finalize_static_font(font)

    out = BytesIO()
    font.save(out)
    return out.getvalue()


def _finalize_static_font(font: TTFont) -> None:
    """Make a pinned instance compatible with macOS, Cloudinary and other consumers.

    CFF2→CFF downgrade leaves a placeholder PostScript FontName ("CFF2Font") in
    the CFF table and renames every glyph to cid00001, cid00002, …  macOS
    Font Book reports "contains no fonts which can be installed" for such OTF
    files. Browsers are more lenient, which is why canvas preview still works.

    The instanced CFF OTF is therefore converted to TrueType outlines (glyf),
    which installs and uploads correctly everywhere TTF is accepted.
    """
    if "CFF " in font:
        postscript_name = font["name"].getDebugName(6)
        if postscript_name:
            font["CFF "].cff.fontNames = [postscript_name]

    # Fully pinned instances are static fonts. Reference fonts do not ship a
    # STAT table; keeping the variable-font STAT metadata confuses some tools.
    if "fvar" not in font and "STAT" in font:
        stat_name_ids = _stat_name_ids(font["STAT"].table)
        del font["STAT"]
        name_table = font["name"]
        for name_id in stat_name_ids:
            name_table.removeNames(nameID=name_id)

    # Variation-specific name records are meaningless on a static instance.
    font["name"].removeNames(nameID=25)

    if "CFF " in font:
        otf_to_ttf(font)


def _stat_name_ids(stat) -> set[int]:
    """Return name IDs referenced only by the STAT table (axis labels, etc.)."""
    name_ids: set[int] = set()
    if stat.DesignAxisRecord:
        for axis in stat.DesignAxisRecord.Axis:
            name_ids.add(axis.AxisNameID)
    if stat.AxisValueArray and stat.AxisValueArray.AxisValue:
        for axis_value in stat.AxisValueArray.AxisValue:
            for attr in (
                "ValueNameID",
                "SecondAxisValueNameID",
                "ThirdAxisValueNameID",
                "FourthAxisValueNameID",
            ):
                value = getattr(axis_value, attr, None)
                if value:
                    name_ids.add(value)
    return name_ids


def _rename_instance(font: TTFont, style_name: str) -> None:
    name_table = font["name"]
    family = name_table.getDebugName(1) or name_table.getDebugName(16) or "Instance"
    full_name = f"{family} {style_name}"
    postscript_name = "".join(ch for ch in full_name if ch.isalnum())
    for name_id, value in (
        (1, family),
        (2, style_name),
        (4, full_name),
        (6, postscript_name),
        (16, family),
        (17, style_name),
    ):
        name_table.setName(value, name_id, 3, 1, 0x409)


def detect_extension(font_bytes: bytes) -> str:
    """Return the extension matching the font's actual sfnt flavor."""
    return "otf" if font_bytes[:4] == b"OTTO" else "ttf"


def instance_filename(family_name: str, style_name: str, extension: str) -> str:
    safe = "-".join((family_name + " " + style_name).split())
    return f"{safe}.{extension}"
