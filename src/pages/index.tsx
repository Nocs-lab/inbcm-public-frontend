import { useSuspenseQuery } from "@tanstack/react-query"
import DefaultLayout from "../layouts/default"
import request from "../utils/request"
import { createColumnHelper } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import Table from "../components/Table"

const columnHelper = createColumnHelper<{
  _id: string
  dataCriacao: Date
  anoDeclaracao: string
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
  columnHelper.accessor("dataCriacao", {
    header: "Data de envio",
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
    header: "Status",
    enableColumnFilter: false
  }),
  columnHelper.accessor("_id", {
    header: "Ações",
    enableColumnFilter: false,
    cell: (info) => (
      <div className="flex gap-1 items-center">
        <Link
          to={`/declaracoes/${info.getValue()}`}
          className="flex items-center justify-center gap-1"
        >
          <i className="fas fa-eye" aria-hidden="true"></i>
          Detalhar
        </Link>
      </div>
    )
  })
]

export default function Declaracoes() {
  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request("/api/declaracoes")
      return response.json()
    }
  })

  return (
    <DefaultLayout>
      <div className="flex items-center justify-between">
        <h2>Minhas declarações</h2>
        <Link to="/declaracoes/novo" className="btn text-xl">
          <i className="fa-solid fa-file-lines p-2"></i>
          Nova declaração
        </Link>
      </div>
      <div
        className="br-table overflow-auto"
        data-search="data-search"
        data-selection="data-selection"
        data-collapse="data-collapse"
        data-random="data-random"
      >
        <Table columns={columns} data={data} />
      </div>
      <div className="h-10" />
    </DefaultLayout>
  )
}
