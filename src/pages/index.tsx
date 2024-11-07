import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import {
  CellContext,
  type ColumnDef,
  createColumnHelper
} from "@tanstack/react-table"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import Table from "../components/Table"
import DefaultLayout from "../layouts/default"
import request from "../utils/request"
import { useState } from "react"
import { Button, Modal } from "react-dsgov"
import toast from "react-hot-toast"

const Acoes = ({
  info
}: {
  info: CellContext<
    {
      _id: string
      dataCriacao: Date
      anoDeclaracao: string
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
    },
    string
  >
}) => {
  const [modalAberta, setModalAberta] = useState(false)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await request(`/api/public/declaracoes/${info.getValue()}`, {
        method: "DELETE"
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["declaracoes"] })
      toast.success("Declaração excluída com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao excluir declaração")
    }
  })

  return (
    <div className="flex gap-2">
      <Link to={`/declaracoes/${info.getValue()}`} className="br-link">
        <i className="fas fa-eye" aria-hidden="true"></i> Exibir
      </Link>
      <button
        className="br-link text-[#1351B9] hover:bg-blue-200"
        onClick={() => setModalAberta(true)}
        disabled={
          info.row.original.retificacao ||
          info.row.original.status !== "Recebida"
        }
      >
        <i className="fas fa-trash" aria-hidden="true"></i> Excluir
      </button>
      <Modal
        useScrim
        showCloseButton
        modalOpened={modalAberta}
        onCloseButtonClick={() => setModalAberta(false)}
      >
        <Modal.Body className="text-center">
          <i className="fas fa-exclamation-triangle text-danger fa-3x"></i>
          <h5 className="normal-case">
            Tem certeza que deseja excluir a declaração{" "}
            {info.row.original.retificacao ? "retificadora" : "original"} de{" "}
            {info.row.original.anoDeclaracao} do museu{" "}
            {info.row.original.museu_id.nome}?
          </h5>
        </Modal.Body>
        <Modal.Footer justify-content="end">
          <Button secondary small m={2} onClick={() => setModalAberta(false)}>
            Cancelar
          </Button>
          <Button
            primary
            small
            m={2}
            loading={isPending}
            onClick={() => mutate()}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

const columnHelper = createColumnHelper<{
  _id: string
  dataCriacao: Date
  anoDeclaracao: string
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
  columnHelper.accessor("anoDeclaracao", {
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
    cell: (info) => <Acoes info={info} />
  })
]

export default function Declaracoes() {
  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request("/api/public/declaracoes")
      return response.json()
    }
  })

  return (
    <DefaultLayout>
      <div className="flex items-center justify-between">
        <h2>Minhas declarações</h2>
        <div>
          <Link to="/declaracoes/novo" className="btn text-xl p-3">
            <i className="fa-solid fa-file-lines p-2"></i>
            Nova declaração
          </Link>
          <Link to="/dashboard" className="btn text-xl">
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
    </DefaultLayout>
  )
}
