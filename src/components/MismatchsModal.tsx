import { Modal } from "react-dsgov"

const museologicoFields = {
  nderegistro: "Nº de Registro",
  outrosnumeros: "Outros Números",
  situacao: "Situação",
  denominacao: "Denominação",
  titulo: "Título",
  autor: "Autor",
  classificacao: "Classificação",
  resumodescritivo: "Resumo Descritivo",
  dimensoes: "Dimensões",
  materialtecnica: "Material/Técnica",
  estadodeconservacao: "Estado de Conservação",
  localdeproducao: "Local de Produção",
  datadeproducao: "Data de produção",
  condicoesdereproducao: "Condições de Reprodução",
  midiasrelacionadas: "Mídias Relacionadas"
}

const bibliograficoFields = {
  nderegistro: "Nº de Registro",
  outrosnumeros: "Outros Números",
  situacao: "Situação",
  titulo: "Título",
  tipo: "Tipo",
  identificacaoresponsabilidade: "Identificação da Responsabilidade",
  localproducao: "Local de Produção",
  editora: "Editora",
  datadeproducao: "Data de Produção",
  dimensaofisica: "Dimensão física",
  materialtecnica: "Material/Técnica",
  encardenacao: "Encadernação",
  resumodescritivo: "Resumo Descritivo",
  estadodeconservacao: "Estado de Conservação",
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

const MismatchsModal: React.FC<{
  opened: boolean
  onClose: () => void
  musologicoErrors: string[]
  bibliograficoErrors: string[]
  arquivisticoErrors: string[]
}> = ({
  opened,
  onClose,
  musologicoErrors,
  bibliograficoErrors,
  arquivisticoErrors
}) => {
  return (
    <Modal
      title="INCONSISTÊNCIAS ENCONTRADAS"
      useScrim
      showCloseButton
      modalOpened={opened}
      onCloseButtonClick={() => onClose()}
      className="min-w-1/2"
    >
      <Modal.Body>
        <p>Abaixo, as inconsistências são agrupadas por tipo de acervo. </p>
        {musologicoErrors.length > 0 && (
          <>
            <h2 className="text-lg font-bold">Acervo museológico</h2>
            Os campos{" "}
            {musologicoErrors
              .map(
                (field) =>
                  `"${museologicoFields[field as keyof typeof museologicoFields] ?? field}"`
              )
              .join(", ")}{" "}
            não foram totalmente preenchidos e são obrigatórios
          </>
        )}
        {bibliograficoErrors.length > 0 && (
          <>
            <h2 className="text-lg font-bold">Acervo ibliográfico</h2>
            Os campos{" "}
            {bibliograficoErrors
              .map(
                (field) =>
                  `"${bibliograficoFields[field as keyof typeof bibliograficoFields]}"`
              )
              .join(", ")}{" "}
            não foram totalmente preenchidos e são obrigatórios
          </>
        )}
        {arquivisticoErrors.length > 0 && (
          <>
            <h2 className="text-lg font-bold">Acervo arquivístico</h2>
            Os campos{" "}
            {arquivisticoErrors
              .map(
                (field) =>
                  `"${arquivisticoFields[field as keyof typeof arquivisticoFields]}"`
              )
              .join(", ")}{" "}
            não foram totalmente preenchidos e são obrigatórios
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default MismatchsModal
