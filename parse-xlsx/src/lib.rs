use calamine::{open_workbook_auto_from_rs, Reader};
use std::io::Cursor;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use gloo_utils::format::JsValueSerdeExt;
use jsonschema::JSONSchema;
use serde_json::{json, Value};
use slug::slugify;
use regex::Regex;

async fn read_excel_file(file: web_sys::File) -> Result<Vec<std::collections::HashMap<String, String>>, JsValue> {
  let buffer = file.slice()?;
  let buffer = JsFuture::from(buffer.array_buffer()).await?;
  let buffer = js_sys::Uint8Array::new(&buffer).to_vec();
  let cursor = Cursor::new(buffer);
  let mut xl = open_workbook_auto_from_rs(cursor)
    .map_err(|e| JsValue::from_str(&format!("Xlsx-error: {:?}", e)))?;

  let mut result = Vec::new();

  let sheets = xl.sheet_names().to_owned();
  let sheet_name = sheets.get(0).unwrap();

  let range = xl.worksheet_range(&sheet_name).unwrap();
  let headers: Vec<String> = range.rows().next().unwrap()
    .iter()
    .map(|cell| slugify(cell.to_string()).replace("_", ""))
    .collect();
  for row in range.rows().skip(1) {
    let obj = headers.iter().zip(row.iter())
      .map(|(header, cell)| (header.clone(), cell.to_string()))
      .collect::<std::collections::HashMap<String, String>>();

    result.push(obj);
  }

  Ok(result)
}

async fn validate_from_schema(file: web_sys::File, schema: Value) -> Result<JsValue, JsValue> {
  let result = read_excel_file(file).await?;
  let json_result = serde_json::to_value(&result).unwrap();

  let compiled = JSONSchema::compile(&schema).unwrap();

  let result = compiled.validate(&json_result);

  let mut mapped_wrong_fields = Vec::new();
  let re = Regex::new(r#""(.+?)""#).unwrap();

  if let Err(errors) = result {
    for error in errors {
      let field = re.captures(&error.to_string()).unwrap().get(1).unwrap().as_str().to_string();
      if !mapped_wrong_fields.contains(&field) {
        mapped_wrong_fields.push(field);
      }
    }
  }

  Ok(JsValue::from_serde(&json!({ "data": json_result, "errors": mapped_wrong_fields })).unwrap())
}

#[wasm_bindgen]
pub async fn validate_museologico(file: web_sys::File) -> Result<JsValue, JsValue> {
  let schema = json!({
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "numeroderegistro": { "type": "string" },
        "outrosnumeros": { "type": "string" },
        "situacao": { "type": "string" },
        "titulo": { "type": "string" },
        "tipo": { "type": "string" },
        "autor": { "type": "string" },
        "localproducao": { "type": "string" },
        "editora": { "type": "string" },
        "datadeproducao": { "type": "string" },
        "dimensoes": { "type": "string" },
        "materialtecnica": { "type": "string" },
        "estadodeconservacao": { "type": "string" },
        "assuntoprincipal": { "type": "string" },
        "condicoesreproducao": { "type": "string" },
        "midiasrelacionadas": { "type": "string" }
      },
      "required": ["numeroderegistro", "situacao", "titulo", "identificacaoresponsabilidade", "dimensaofisica", "materialtecnica", "estadoconservacao"]
    }
  });

  Ok(validate_from_schema(file, schema).await?)
}

#[wasm_bindgen]
pub async fn validate_bibliografico(file: web_sys::File) -> Result<JsValue, JsValue> {
  let schema = json!({
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "numeroderegistro": { "type": "string" },
        "outrosnumeros": { "type": "string" },
        "situacao": { "type": "string" },
        "titulo": { "type": "string" },
        "tipo": { "type": "string" },
        "identificacaoresponsabilidade": { "type": "string" },
        "localproducao": { "type": "string" },
        "editora": { "type": "string" },
        "data": { "type": "string" },
        "dimensoes": { "type": "string" },
        "materialtecnica": { "type": "string" },
        "estadoconservacao": { "type": "string" },
        "assuntoprincipal": { "type": "string" },
        "condicoesreproducao": { "type": "string" },
        "midiasrelacionadas": { "type": "string" }
      },
      "required": ["numero_registro", "situacao", "titulo", "identificacao_responsabilidade", "dimensao_fisica", "material_tecnica", "estado_conservacao"]
    }
  });

  Ok(validate_from_schema(file, schema).await?)
}

#[wasm_bindgen]
pub async fn validate_arquivistico(file: web_sys::File) -> Result<JsValue, JsValue> {
  let schema = json!({
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "codigoreferencia": { "type": "string" },
        "titulo": { "type": "string" },
        "data": { "type": "string" },
        "niveldescricao": { "type": "string" },
        "dimensaoesuporte": { "type": "string" },
        "nomeprodutor": { "type": "string" },
        "historiaadministrativabiografia": { "type": "string" },
        "historiaarquivistica": { "type": "string" },
        "procedencia": { "type": "string" },
        "ambitoconteudo": { "type": "string" },
        "sistemaarranjo": { "type": "string" },
        "condicoesreproducao": { "type": "string" },
        "existencialocalizacao_originais": { "type": "string" },
        "notassobreconservacao": { "type": "string" },
        "pontosacessoindexacaoassuntos": { "type": "string" },
        "midiasrelacionadas": { "type": "string" }
      },
      "required": ["codigoreferencias", "titulo", "niveldescricao", "dimensaoesuporte", "nomeprodutor", "procedencia"]
    }
  });

  Ok(validate_from_schema(file, schema).await?)
}
