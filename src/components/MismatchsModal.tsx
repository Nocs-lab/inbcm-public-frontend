import { Modal, Button } from "react-dsgov"
import {
  museologicoFields,
  bibliograficoFields,
  arquivisticoFields
} from "./Util/fieldMappings"

const MismatchsModal: React.FC<{
  opened: boolean
  onClose: () => void
  museologicoErrors: string[]
  bibliograficoErrors: string[]
  arquivisticoErrors: string[]
}> = ({
  opened,
  onClose,
  museologicoErrors,
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
      title="Listagem de pendências"
      showCloseButton
      onCloseButtonClick={() => onClose()}
      className="min-w-1/2"
      onClick={handleScrimClick}
    >
      <Modal.Body>
        <p className="text-gray-600 mb-6">
          Abaixo, seguem as pendências que foram encontradas no envio da sua
          declaração. Há linhas em que campos obrigatórios não foram
          preenchidos. Observe o resumo a seguir:
        </p>
        <table className="w-full table-auto border-collapse mb-6 shadow-sm">
          <thead className="bg-black">
            <tr>
              <th className="border-bottom" border-left scope="col">
                Tipo de Acervo
              </th>
              <th className="border-bottom" border-left scope="col">
                Campos não preenchidos
              </th>
            </tr>
          </thead>
          <tbody>
            {museologicoErrors.length > 0 && (
              <tr>
                <td className="border-right" scope="rowgroup">
                  Museológico
                </td>
                <td>
                  {museologicoErrors
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
                <td className="border-right" scope="rowgroup">
                  Bibliográfico
                </td>
                <td>
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
                <td className="border-right" scope="rowgroup">
                  Arquivístico
                </td>
                <td>
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
      <Modal.Footer justify-content="center">
        <Button primary onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MismatchsModal
