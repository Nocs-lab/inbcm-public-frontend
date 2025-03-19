import { useSuspenseQuery } from "@tanstack/react-query"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { useNavigate, Link } from "react-router"
import { Modal, Button } from "react-dsgov"
import Table from "../components/Table"
import request from "../utils/request"
import { useModal } from "../utils/modal"

const columnHelper = createColumnHelper<{
  _id: string
  dataCriacao: Date
  anoDeclaracao: {
    ano: number
  }
  retificacao: boolean
  museu_id: {
    _id: string
    nome: string
  }
  responsavelEnvio: {
    nome: string
  }
  status: string
  museologico: {
    status: string
    pendencias: string[]
  }
  bibliografico: {
    status: string
    pendencias: string[]
  }
  arquivistico: {
    status: string
    pendencias: string[]
  }
  refificacao: boolean
}>()

const columns = [
  columnHelper.accessor("retificacao", {
    header: "Tipo",
    cell: (info) => (info.getValue() ? "Retificadora" : "Original"),
    enableColumnFilter: false
  }),
  columnHelper.accessor("dataCriacao", {
    header: "Envio",
    cell: (info) => format(info.getValue(), "dd/MM/yyyy HH:mm"),
    enableColumnFilter: false
  }),
  columnHelper.accessor("anoDeclaracao.ano", {
    header: "Ano",
    meta: {
      filterVariant: "select"
    }
  }),
  columnHelper.accessor("museu_id.nome", {
    header: "Museu",
    meta: {
      filterVariant: "select"
    }
  }),
  columnHelper.accessor("status", {
    header: "Situação",
    enableColumnFilter: false
  }),
  columnHelper.accessor("_id", {
    header: "Ações",
    enableColumnFilter: false,
    enableSorting: false,
    cell: (info) => (
      <Link to={`/declaracoes/${info.getValue()}`} className="br-link">
        <i className="fas fa-eye" aria-hidden="true"></i> Exibir
      </Link>
    )
  })
]

export default function Declaracoes() {
  const navigate = useNavigate()

  const { data: museus } = useSuspenseQuery({
    queryKey: ["museus"],
    queryFn: async () => {
      const response = await request("/api/public/museus")
      return response.json()
    }
  })

  const { openModal: openNoMuseusModal } = useModal((close) => (
    <Modal
      showCloseButton
      title="Museu não associado"
      onCloseButtonClick={close}
    >
      <Modal.Body>
        <p>
          Não há museus associados ao seu perfil. Entre em contato com o
          administrador do sistema solicitando esse vínculo.
        </p>
      </Modal.Body>
      <Modal.Footer justify-content="center">
        <Button primary onClick={close}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  ))

  const { data: anoDeclaracao } = useSuspenseQuery({
    queryKey: ["anoDeclaracao"],
    queryFn: async () => {
      // Mockando a resposta da API
      return {
        _id: "676d672f56847ce3126cb679",
        ano: 2025,
        dataInicioSubmissao: new Date("2025-02-16T03:00:00.000Z"),
        dataFimSubmissao: new Date("2026-01-01T02:59:00.000Z"),
        dataInicioRetificacao: new Date("2025-03-01T03:00:00.000Z"),
        dataFimRetificacao: new Date("2026-01-01T02:59:00.000Z"),
        metaDeclaracoesEnviadas: 23,
        declaracaoVinculada: true,
        updatedAt: new Date("2025-02-28T10:49:27.676Z")
      }
    }
  })

  const { openModal: openImportantDatesModal } = useModal((close) => (
    <Modal showCloseButton title="Datas importantes" onCloseButtonClick={close}>
      <Modal.Body>
        <div className="text-left">
          <p> Períodos de envio de declarações:</p>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">Ano:</td>
                <td className="p-2">{anoDeclaracao.ano}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">
                  Início do envio:
                </td>
                <td className="p-2">
                  {anoDeclaracao.dataInicioSubmissao.toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">Fim do envio:</td>
                <td className="p-2">
                  {anoDeclaracao.dataFimSubmissao.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">
                  Início da retificação:
                </td>
                <td className="p-2">
                  {anoDeclaracao.dataInicioRetificacao.toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">
                  Fim da retificação:
                </td>
                <td className="p-2">
                  {anoDeclaracao.dataFimRetificacao.toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal.Body>
      <Modal.Footer justify-content="center">
        <Button primary onClick={close}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  ))

  const handleNavigation = (path: string) => {
    if (!museus || museus.length === 0) {
      openNoMuseusModal()
    } else {
      navigate(path)
    }
  }

  const handleModalData = () => {
    openImportantDatesModal()
  }

  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request("/api/public/declaracoes")
      return response.json()
    }
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <h2>Minhas declarações</h2>
        <div>
          <Link
            to="#"
            className="btn text-xl p-3"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/declaracoes/novo")
            }}
          >
            <i className="fa-solid fa-file-lines p-2"></i>
            Nova
          </Link>
          <Link
            to="#"
            className="btn text-xl p-3"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation(handleModalData())
            }}
          >
            <i className="fa-solid fa-calendar-days p-2"></i>
            Datas
          </Link>
          <Link
            to="#"
            className="btn text-xl p-3"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/dashboard")
            }}
          >
            <i className="fa-solid fa-chart-line p-2"></i>
            Painel
          </Link>
        </div>
      </div>
      <div
        className="br-table overflow-auto"
        data-search="data-search"
        data-selection="data-selection"
        data-collapse="data-collapse"
        data-random="data-random"
      >
        <Table columns={columns as ColumnDef<unknown>[]} data={data} />
      </div>
      <div className="h-10" />
    </>
  )
}
