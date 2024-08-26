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
  identificacaoderesponsabilidade: "Identificação da Responsabilidade",
  localdeproducao: "Local de Produção",
  editora: "Editora",
  datadeproducao: "Data de Produção",
  dimensaofisica: "Dimensão física",
  materialtecnica: "Material/Técnica",
  encadernacao: "Encadernação",
  resumodescritivo: "Resumo Descritivo",
  estadodeconservacao: "Estado de Conservação",
  assuntoprincipal: "Assunto Principal",
  assuntocronologico: "Assunto Cronológico",
  assuntogeografico: "Assunto Geográfico",
  condicoesdereproducao: "Condições de Reprodução",
  midiasrelacionadas: "Mídias Relacionadas"
}

const arquivisticoFields = {
  coddereferencia: "Código de Referência",
  titulo: "Título",
  data: "Data",
  niveldedescricao: "Nível de Descrição",
  dimensaoesuporte: "Dimensão e Suporte",
  nomedoprodutor: "Nome do Produtor",
  historiaadministrativabiografia: "História Administrativa/Biografia",
  historiaarquivistica: "História Arquivística",
  procedencia: "Procedência",
  ambitoeconteudo: "Âmbito e Conteúdo",
  sistemadearranjo: "Sistema de Arranjo",
  condicoesdereproducao: "Condições de Reprodução",
  existenciaelocalizacaodosoriginais: "Existência e Localização dos Originais",
  notassobreconservacao: "Notas sobre Conservação",
  pontosdeacessoeindexacaodeassuntos:
    "Pontos de Acesso e Indexação de Assuntos",
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
  const handleScrimClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Verifica se o clique foi no scrim e não dentro do modal
    if (event.target === event.currentTarget) {
      onClose()
    }
  }
  return (
    <Modal
      useScrim
      modalOpened={opened}
      onCloseButtonClick={() => onClose()}
      className="min-w-1/2"
      onClick={handleScrimClick}
    >
      <Modal.Body>
        <h3 className="text-2xl font-semibold mb-4">Listagem de Pendências</h3>
        <p className="text-gray-600 mb-6">
          Abaixo, seguem as pendências que foram encontradas no envio da sua
          declaração. Há linhas em que campos obrigatórios não foram
          preenchidos. Observe o resumo a seguir:
        </p>
        <table className="w-full table-auto border-collapse mb-6 shadow-sm">
          <thead className="bg-black">
            <tr>
              <th className="border-b border-gray-300 px-6 py-3 text-left bg-gray-500 text-white">
                Tipo de Acervo
              </th>
              <th className="border-b border-gray-300 px-6 py-3 text-left bg-gray-500 text-white">
                Campos não preenchidos
              </th>
            </tr>
          </thead>
          <tbody>
            {musologicoErrors.length > 0 && (
              <tr>
                <td className="border-t border-gray-200 px-6 py- bg-gray-20">
                  Museológico
                </td>
                <td className="border-t border-gray-200 px-6 py-4 text-gray-800">
                  {musologicoErrors
                    .map(
                      (field) =>
                        `"${museologicoFields[field as keyof typeof museologicoFields] ?? field}"`
                    )
                    .join(", ")}
                </td>
              </tr>
            )}
            {bibliograficoErrors.length > 0 && (
              <tr>
                <td className="border-t border-gray-200 px-6 py-4 bg-gray-20">
                  Bibliográfico
                </td>
                <td className="border-t border-gray-200 px-6 py-4 text-gray-800">
                  {bibliograficoErrors
                    .map(
                      (field) =>
                        `"${bibliograficoFields[field as keyof typeof bibliograficoFields]}"`
                    )
                    .join(", ")}
                </td>
              </tr>
            )}
            {arquivisticoErrors.length > 0 && (
              <tr>
                <td className="border-t border-gray-200 px-6 py-4 bg-gray-20">
                  Arquivístico
                </td>
                <td className="border-t border-gray-200 px-6 py-4 text-gray-800">
                  {arquivisticoErrors
                    .map(
                      (field) =>
                        `"${arquivisticoFields[field as keyof typeof arquivisticoFields]}"`
                    )
                    .join(", ")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onClose}
          className="border border-black px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
        >
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default MismatchsModal
