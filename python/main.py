"""FastAPI backend for the variable font unpacker.

Run with: uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import json

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from extract import detect_extension, extract_instance, instance_filename
from font_inspect import inspect_font

app = FastAPI(title="Variable Font Unpacker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.post("/inspect")
async def inspect_endpoint(file: UploadFile = File(...)) -> dict:
    font_bytes = await file.read()
    try:
        return inspect_font(font_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/extract")
async def extract_endpoint(
    file: UploadFile = File(...),
    axisValues: str = Form(...),
    styleName: str = Form("Custom"),
) -> Response:
    font_bytes = await file.read()

    try:
        axis_values = json.loads(axisValues)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail="axisValues must be valid JSON") from exc

    try:
        info = inspect_font(font_bytes)
        static_font_bytes = extract_instance(font_bytes, axis_values, styleName)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    extension = detect_extension(static_font_bytes)
    media_type = "font/otf" if extension == "otf" else "font/ttf"
    filename = instance_filename(info["familyName"], styleName, extension)
    return Response(
        content=static_font_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
