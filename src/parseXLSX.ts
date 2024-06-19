import * as XLSX from "xlsx"

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^(\d)/, "n$1")
    .replace(/(\d)$/, "$1")
}

/*

  Função que verifica se as colunas do arquivo excel são válidas

  headers: Lista de headers do arquivo excel
  headersSchema: Lista de headers do schema

  return: Booleano indicando se os headers são válidos

*/
function validateHeaders(headers: string[], headersSchema: string[]): boolean {
  return (
    headers.length === headersSchema.length &&
    headers.every((header, idx) => header === headersSchema[idx])
  )
}

/*

  Função que valida as linhas do arquivo excel, verificando se os campos obrigatórios estão preenchidos

  rows: Lista de linhas do arquivo excel
  headers: Lista de headers do arquivo excel
  requiredFields: Lista de campos obrigatórios
  json: Lista de objetos gerados a partir das linhas

  return: Objeto com a lista de objetos e a lista de erros

*/
function validateRows(
  rows: string[][],
  headers: string[],
  requiredFields: string[],
  json: { [key: string]: string }[]
): {
  data: { [key: string]: string }[]
  errors: string[]
} {
  const data: { [key: string]: string }[] = []
  const errors: string[] = []

  rows.forEach((row) => {
    const rowData: { [key: string]: string } = {}
    headers.forEach((header, idx) => {
      rowData[header] = row[idx] || ""
    })
    data.push(rowData)

    requiredFields.forEach((field) => {
      if (!rowData[field]) {
        errors.push(field)
      }
    })
  })

  return {
    data: json,
    errors: Array.from(new Set(errors))
  }
}

async function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error("XLSX_ERROR"))
    reader.readAsArrayBuffer(file)
  })
}

/*

  Função que valida um arquivo excel de acordo com o schema passado

  file: Arquivo excel a ser validado
  headersSchema: Lista de headers do arquivo excel
  requiredFields: Lista de campos obrigatórios

  return: Objeto com a lista de objetos e a lista de erros

*/
async function parseExcelFile(
  file: File,
  headersSchema: string[],
  requiredFields: string[]
): Promise<{ data: { [key: string]: string }[]; errors: string[] }> {
  const buffer = await readFile(file)
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const lines = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

  if (!lines.length) throw new Error("INVALID_HEADERS")

  const headers = (lines[0] as string[]).map((header) => slugify(header))
  if (!validateHeaders(headers, headersSchema)) {
    throw new Error("INVALID_HEADERS")
  }

  const rows = lines.slice(1).filter((row) => !!row.length)
  if (!rows.length) throw new Error("EMPTY_ROWS")

  const json = rows.map((row) => {
    if (row.length !== headers.length) throw new Error("INVALID_ROW")

    const obj: { [key: string]: string } = {}
    headers.forEach((header, idx) => {
      obj[header] = row[idx] || ""
    })
    return obj
  })

  return validateRows(rows, headers, requiredFields, json)
}

/*

  Função que valida um arquivo excel do acervo museológico

  file: Arquivo excel a ser validado

  return: Objeto com a lista de objetos e a lista de erros

*/
export async function validate_museologico(
  file: File
): Promise<{ data: { [key: string]: string }[]; errors: string[] }> {
  const REQUIRED_FIELDS = [
    "nderegistro",
    "situacao",
    "denominacao",
    "autor",
    "resumodescritivo",
    "dimensoes",
    "materialtecnica",
    "estadodeconservacao",
    "condicoesdereproducao"
  ]
  const SCHEMA = [
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
    "diametro",
    "espessura",
    "uniddepesagem",
    "peso",
    "materialtecnica",
    "estadodeconservacao",
    "localdeproducao",
    "datadeproducao",
    "condicoesdereproducao",
    "midiasrelacionadas"
  ]

  return parseExcelFile(file, SCHEMA, REQUIRED_FIELDS)
}

/*

  Função que valida um arquivo excel do acervo bibliográfico

  file: Arquivo excel a ser validado

  return: Objeto com a lista de objetos e a lista de erros

*/
export async function validate_bibliografico(
  file: File
): Promise<{ data: { [key: string]: string }[]; errors: string[] }> {
  const REQUIRED_FIELDS = [
    "nderegistro",
    "situacao",
    "titulo",
    "tipo",
    "identificacaoderesponsabilidade",
    "localdeproducao",
    "editora",
    "datadeproducao",
    "dimensaofisica",
    "materialtecnica",
    "encadernacao",
    "resumodescritivo",
    "estadodeconservacao",
    "assuntoprincipal",
    "condicoesdereproducao"
  ]
  const SCHEMA = [
    "nderegistro",
    "outrosnumeros",
    "situacao",
    "titulo",
    "tipo",
    "identificacaoderesponsabilidade",
    "localdeproducao",
    "editora",
    "datadeproducao",
    "dimensaofisica",
    "materialtecnica",
    "encadernacao",
    "resumodescritivo",
    "estadodeconservacao",
    "assuntoprincipal",
    "assuntocronologico",
    "assuntogeografico",
    "condicoesdereproducao",
    "midiasrelacionadas"
  ]

  return parseExcelFile(file, SCHEMA, REQUIRED_FIELDS)
}

/*

  Função que valida um arquivo excel do acervo arquivístico

  file: Arquivo excel a ser validado

  return: Objeto com a lista de objetos e a lista de erros

*/
export async function validate_arquivistico(
  file: File
): Promise<{ data: { [key: string]: string }[]; errors: string[] }> {
  const REQUIRED_FIELDS = [
    "coddereferencia",
    "titulo",
    "data",
    "niveldedescricao",
    "dimensaoesuporte",
    "nomedoprodutor"
  ]
  const SCHEMA = [
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
    "condicoesdereproducao",
    "existenciaelocalizacaodosoriginais",
    "notassobreconservacao",
    "pontosdeacessoeindexacaodeassuntos",
    "midiasrelacionadas"
  ]

  return parseExcelFile(file, SCHEMA, REQUIRED_FIELDS)
}
