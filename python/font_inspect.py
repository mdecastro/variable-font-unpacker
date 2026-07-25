"""Inspect a variable font and report its axes and named instances."""

from __future__ import annotations

from io import BytesIO
from typing import Any

from fontTools.ttLib import TTFont


def _name_string(font: TTFont, name_id: int | None) -> str | None:
    if name_id is None:
        return None
    record = font["name"].getDebugName(name_id)
    return record


def inspect_font(font_bytes: bytes) -> dict[str, Any]:
    """Return family/style names, variation axes, and named instances.

    Raises ValueError if the font has no `fvar` table (i.e. it is not variable).
    """
    font = TTFont(BytesIO(font_bytes), lazy=True)

    if "fvar" not in font:
        raise ValueError("This font has no 'fvar' table, so it is not a variable font.")

    fvar = font["fvar"]

    axes = [
        {
            "tag": axis.axisTag,
            "name": _name_string(font, axis.axisNameID) or axis.axisTag,
            "minValue": axis.minValue,
            "defaultValue": axis.defaultValue,
            "maxValue": axis.maxValue,
        }
        for axis in fvar.axes
    ]

    named_instances = [
        {
            "name": _name_string(font, instance.subfamilyNameID) or f"Instance {i + 1}",
            "coordinates": dict(instance.coordinates),
        }
        for i, instance in enumerate(fvar.instances)
    ]

    return {
        "familyName": _name_string(font, 16) or _name_string(font, 1) or "Unknown",
        "styleName": _name_string(font, 17) or _name_string(font, 2) or "Regular",
        "axes": axes,
        "namedInstances": named_instances,
    }
