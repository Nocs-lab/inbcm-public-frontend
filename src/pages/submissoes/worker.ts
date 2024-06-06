import init, { validate_arquivistico, validate_bibliografico, validate_museologico } from "../../../parse-xlsx/pkg";

init();

const museologicoFields = {
  numeroderegistro: "Número de Registro",
  outrosnumeros: "Outros Números",
  situacao: "Situação",
  denominacao: "Denominação",
  titulo: "Título",
  autor:  "Autor",
  classificacao: "Classificação",
  resumodescritivo:  "Resumo Descritivo",
  dimensoes: "Dimensões",
  materialtecnica: "Material/Técnica",
  estadodeconservacao: "Estado de Conservação",
  localdeproducao: "Local de Produção",
  datadeproducao: "Data de produção",
  assuntoprincipal: "Assunto Principal",
  condicoesdereproducao: "Condições de Reprodução",
  midiasrelacionadas: "Mídias Relacionadas"
}

const bibliograficoFields = {
  numeroderegistro: "Número de Registro",
  outrosnumeros: "Outros Números",
  situacao: "Situação",
  titulo: "Título",
  tipo: "Tipo",
  identificacaoresponsabilidade: "Identificação da Responsabilidade",
  localproducao: "Local de Produção",
  editora: "Editora",
  data: "Data",
  dimensoes: "Dimensões",
  materialtecnica: "Material/Técnica",
  encardenacao: "Encadernação",
  resumodescritivo: "Resumo Descritivo",
  assuntoprincipal: "Assunto Principal",
  assuntocronologico: "Assunto Cronológico",
  assuntogeografico: "Assunto Geográfico",
  condicoesreproducao: "Condições de Reprodução",
  midiasrelacionadas: "Mídias Relacionadas"
}

const arquivisticoFields = {
  codigoreferencia: "Código de Referência",
  titulo: "Título",
  data: "Data",
  niveldescricao: "Nível de Descrição",
  dimensaoesuporte: "Dimensão e Suporte",
  nomeprodutor: "Nome do Produtor",
  historiaadministrativabiografia: "História Administrativa/Biografia",
  historiaarquivistica: "História Arquivística",
  procedencia: "Procedência",
  ambitoconteudo: "Âmbito e Conteúdo",
  sistemaarranjo: "Sistema de Arranjo",
  condicoesreproducao: "Condições de Reprodução",
  existencialocalizacao_originais: "Existência e Localização dos Originais",
  notassobreconservacao: "Notas sobre Conservação",
  pontosacessoindexacaoassuntos: "Pontos de Acesso e Indexação de Assuntos",
  midiasrelacionadas: "Mídias Relacionadas"
}

export { validate_arquivistico, validate_bibliografico, validate_museologico, museologicoFields, bibliograficoFields, arquivisticoFields };
