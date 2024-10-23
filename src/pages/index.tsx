import { useSuspenseQuery } from "@tanstack/react-query"
import {
  type CellContext,
  type ColumnDef,
  createColumnHelper
} from "@tanstack/react-table"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import Table from "../components/Table"
import DefaultLayout from "../layouts/default"
import request from "../utils/request"
import { useFloating, autoUpdate } from "@floating-ui/react"
import { useState } from "react"
import { Button, Modal } from "react-dsgov"

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

const Acoes: React.FC<{ info: CellContext<unknown, unknown> }> = ({ info }) => {
  const [isOpen1, setIsOpen1] = useState(false)
  const [isOpen2, setIsOpen2] = useState(false)
  const [isOpen3, setIsOpen3] = useState(false)

  const { refs: refs1, floatingStyles: floatingStyles1 } = useFloating({
    whileElementsMounted: autoUpdate,
    open: isOpen1,
    onOpenChange: setIsOpen1,
    placement: "top"
  })
  const { refs: refs2, floatingStyles: floatingStyles2 } = useFloating({
    whileElementsMounted: autoUpdate,
    open: isOpen2,
    onOpenChange: setIsOpen2,
    placement: "top"
  })
  const { refs: refs3, floatingStyles: floatingStyles3 } = useFloating({
    whileElementsMounted: autoUpdate,
    open: isOpen3,
    onOpenChange: setIsOpen3,
    placement: "top"
  })

  const [modalAberta, setModalAberta] = useState(false)

  return (
    <div className="flex gap-1 items-center">
      <Link
        to={`/declaracoes/${info.getValue()}`}
        className="flex items-center justify-center gap-1 br-button p-0"
        ref={refs1.setReference}
        onMouseEnter={() => setIsOpen1(true)}
        onMouseLeave={() => setIsOpen1(false)}
      >
        <i className="fas fa-eye" aria-hidden="true"></i>
      </Link>
      {isOpen1 && (
        <div
          className="p-1 rounded shadow bg-white"
          role="tooltip"
          ref={refs1.setFloating}
          style={floatingStyles1}
        >
          Detalhar
        </div>
      )}
      <Link
        to={`/declaracoes/${info.getValue()}/timeline`}
        className="flex items-center justify-center gap-1 br-button p-0"
        ref={refs2.setReference}
        onMouseEnter={() => setIsOpen2(true)}
        onMouseLeave={() => setIsOpen2(false)}
      >
        <i className="fas fa-timeline" aria-hidden="true"></i>
      </Link>
      {isOpen2 && (
        <div
          className="p-1 rounded shadow bg-white"
          role="tooltip"
          ref={refs2.setFloating}
          style={floatingStyles2}
        >
          Timeline
        </div>
      )}
      <button
        className="flex items-center justify-center gap-1 br-button p-0"
        ref={refs3.setReference}
        onMouseEnter={() => setIsOpen3(true)}
        onMouseLeave={() => setIsOpen3(false)}
        onClick={() => setModalAberta(true)}
      >
        <i className="fas fa-trash" aria-hidden="true"></i>
      </button>
      {isOpen3 && (
        <div
          className="p-1 rounded shadow bg-white"
          role="tooltip"
          ref={refs3.setFloating}
          style={floatingStyles3}
        >
          Deletar
        </div>
      )}
      <Modal
        useScrim
        showCloseButton
        modalOpened={modalAberta}
        onCloseButtonClick={() => setModalAberta(false)}
      >
        <Modal.Body>
          <i className="fas fa-exclamation-triangle text-danger fa-3x"></i>
          <h5 className="normal-case">
            Tem certeza que deseja excluir esta declaração?
          </h5>
          <h6 className="normal-case">Esta ação não pode ser desfeita!</h6>
        </Modal.Body>
        <Modal.Footer justify-content="end">
          <Button secondary small m={2} onClick={() => setModalAberta(false)}>
            Cancelar
          </Button>
          <Button primary small m={2}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

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
    cell: (info) => <Acoes info={info as CellContext<unknown, unknown>} />
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
