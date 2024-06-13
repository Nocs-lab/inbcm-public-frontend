use calamine::{open_workbook_auto_from_rs, Reader};
use std::io::Cursor;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use gloo_utils::format::JsValueSerdeExt;
use serde_json::json;
use slug::slugify;
use std::collections::{HashSet, HashMap};

async fn read_excel_file(file: web_sys::File, headers_schema: HashSet<&str>) -> Result<Vec<HashMap<String, String>>, JsValue> {
  let buffer = file.slice()?;
  let buffer = JsFuture::from(buffer.array_buffer()).await?;
  let buffer = js_sys::Uint8Array::new(&buffer).to_vec();
  let cursor = Cursor::new(buffer);
  let mut xl = open_workbook_auto_from_rs(cursor)
    .map_err(|_| JsValue::from_str("XLSX_ERROR"))?;

  let mut result = Vec::new();

  let sheets = xl.sheet_names().to_owned();
  let sheet_name = sheets.get(0).unwrap();

  let range = xl.worksheet_range(&sheet_name).unwrap();
  let headers: Vec<String> = range.rows().next().unwrap()
    .iter()
    .map(|cell| slugify(cell.to_string()).replace("_", ""))
    .collect();

  let headers_set: HashSet<&str> = headers.iter().map(|s| s.as_str()).collect();

  if headers_schema != headers_set {
    return Err(JsValue::from_str("INVALID_HEADERS"));
  }

  for row in range.rows().skip(1) {
    let obj = headers.iter().zip(row.iter())
      .map(|(header, cell)| (header.clone(), cell.to_string()))
      .collect::<HashMap<String, String>>();

    result.push(obj);
  }

  if result.is_empty() {
    return Err(JsValue::from_str("EMPTY_ROWS"));
  }

  Ok(result)
}

async fn validate_from_schema(file: web_sys::File, headers_schema: HashSet<&str>, required_fields: &[&str]) -> Result<JsValue, JsValue> {
  let result = read_excel_file(file, headers_schema).await?;

  let mut mapped_wrong_fields = Vec::new();

  for (i, row) in result.iter().enumerate() {
    for field in required_fields {
      if row.get(*field).unwrap().is_empty() {
        if !mapped_wrong_fields.contains(&i) {
          mapped_wrong_fields.push(i);
        }
      }
    }
  }

  Ok(JsValue::from_serde(&json!({ "data": serde_json::to_value(&result).unwrap(), "errors": mapped_wrong_fields })).unwrap())
}

#[wasm_bindgen]
pub async fn validate_museologico(file: web_sys::File) -> Result<JsValue, JsValue> {
  const REQUIRED_FIELDS: &[&str] = &[
    "nderegistro",
    "situacao",
    "denominacao",
    "autor",
    "resumodescritivo",
    "dimensoes",
    "materialtecnica",
    "estadodeconsrvacao",
    "condicoesdereproducao"
  ];
  let headers_schema = HashSet::from([
    "nderegistro",
    "outrosnumeros",
    "situacao",
    "denominacao",
    "titulo",
    "autor",
    "classificacao",
    "resumodescritivo",
    "dimensoes",
    "altura",
    "largura",
    "profundidade",
    "diâmetro",
    "espressura",
    "uniddepesagem",
    "peso",
    "materialtecnica",
    "estadodeconservacao",
    "localdeproducao",
    "datadeproducao",
    "condicoesdereproducao",
    "midiasrelacionadas"
  ]);

  Ok(validate_from_schema(file, headers_schema, REQUIRED_FIELDS).await?)
}

#[wasm_bindgen]
pub async fn validate_bibliografico(file: web_sys::File) -> Result<JsValue, JsValue> {
  const REQUIRED_FIELDS: &[&str] = &[
    "numeroderegistro",
    "situacao",
    "titulo",
    "tipo",
    "identificacaoresponsabilidade",
    "localdeproducao",
    "editora",
    "datadeproducao",
    "dimensaofisica",
    "materialtecnica",
    "encardenacao",
    "resumodescritivo",
    "estadodeconservacao",
    "assuntoprincipal",
    "condicoesdereproducao"
  ];
  let headers_schema = HashSet::from([
    "nderegistro",
    "outrosnumeros",
    "situacao",
    "titulo",
    "tipo",
    "identificacaoresponsabilidade",
    "localproducao",
    "editora",
    "datadeproducao",
    "dimensaofisica",
    "materialtecnica",
    "encardenacao",
    "resumodescritivo",
    "estadodeconservacao",
    "assuntoprincipal",
    "assuntocronologico",
    "assuntogeografico",
    "condicoesdereproducao",
    "midiasrelacionadas"
  ]);

  Ok(validate_from_schema(file, headers_schema, REQUIRED_FIELDS).await?)
}

#[wasm_bindgen]
pub async fn validate_arquivistico(file: web_sys::File) -> Result<JsValue, JsValue> {
  const REQUIRED_FIELDS: &[&str] = &[
    "coddereferencia",
    "titulo",
    "data",
    "niveldedescricao",
    "dimensaoesuporte",
    "nomedoprodutor"
  ];
  let headers_schema = HashSet::from([
    "coddereferencia",
    "titulo",
    "data",
    "niveldedescricao",
    "dimensaoesuporte",
    "nomedoprodutor",
    "historiaadministrativabiografia",
    "historiaarquivistica",
    "procedencia",
    "ambitoeconteudo",
    "sistemadearranjo",
    "condicoesreproducao",
    "existenciaelocalizacaodosoriginais",
    "notassobreconservacao",
    "pontosacessoeindexacaodeassuntos",
    "midiasrelacionadas"
  ]);

  Ok(validate_from_schema(file, headers_schema, REQUIRED_FIELDS).await?)
}
