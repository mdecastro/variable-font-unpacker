# Variable Font Unpacker

Inspecciona fuentes variables (`.ttf` / `.otf`) y extrae instancias estáticas
a partir de sus ejes de variación. El frontend es Next.js (App Router); el
trabajo pesado sobre las fuentes lo hace un backend FastAPI en Python que usa
[fontTools](https://github.com/fonttools/fonttools).

## Arquitectura

- `app/` — UI en Next.js (App Router) + Tailwind CSS.
- `app/api/inspect`, `app/api/extract` — route handlers que actúan como
  proxy hacia el backend FastAPI (reenvían el `multipart/form-data`).
- `components/` — `Dropzone`, `FontPreview`, `InstanceList`, `DownloadButton`.
- `python/` — backend FastAPI (`main.py`) con la lógica de inspección
  (`font_inspect.py`) y extracción (`extract.py`, vía `fontTools.varLib.instancer`).

> El módulo de inspección se llama `font_inspect.py` (no `inspect.py`) porque
> ese nombre colisiona con el módulo `inspect` de la librería estándar de
> Python, del cual dependen `fastapi`/`starlette`/`pydantic` internamente.

## Requisitos

- Node.js 20+
- Python 3.10+

## Setup

### 1. Backend Python (FastAPI)

```bash
cd python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

El servidor queda escuchando en `http://localhost:8000`.

### 2. Frontend (Next.js)

En otra terminal, desde la raíz del proyecto:

```bash
npm install
cp .env.local.example .env.local   # define FASTAPI_URL si no usás el default
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Flujo de uso

1. Subís una fuente variable en el Dropzone.
2. El frontend llama a `/api/inspect`, que reenvía el archivo al backend;
   se muestran los ejes de variación y las instancias con nombre definidas
   en la fuente (`fvar`).
3. Elegís una instancia con nombre o ajustás los ejes manualmente. El
   preview se actualiza en vivo usando `font-variation-settings`.
4. Al descargar, el frontend llama a `/api/extract`, que reenvía el archivo
   y los valores de los ejes al backend. Este usa
   `fontTools.varLib.instancer` para generar una fuente estática y la
   devuelve como archivo descargable.

## Variables de entorno

| Variable      | Default                 | Descripción                                   |
| ------------- | ------------------------ | ---------------------------------------------- |
| `FASTAPI_URL` | `http://localhost:8000` | URL base del backend FastAPI usada por los proxies en `app/api/*`. |
