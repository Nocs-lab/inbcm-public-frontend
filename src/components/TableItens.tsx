import { useSuspenseQuery } from "@tanstack/react-query"
import Table from "./Table"
import { createColumnHelper } from "@tanstack/react-table"
import {
  museologico,
  bibliografico,
  arquivistico
} from "inbcm-xlsx-validator/schema"
import request from "../utils/request"

const columnHelper = createColumnHelper()

const museologicoColumns = [
  columnHelper.accessor("nderegistro", {
    header: museologico.fields["nderegistro"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("situacao", {
    header: museologico.fields["situacao"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("denominacao", {
    header: museologico.fields["denominacao"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("autor", {
    header: museologico.fields["autor"],
    enableColumnFilter: false
  })
]

const bibliograficoColumns = [
  columnHelper.accessor("nderegistro", {
    header: bibliografico.fields["nderegistro"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("situacao", {
    header: bibliografico.fields["situacao"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("titulo", {
    header: bibliografico.fields["titulo"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("localdeproducao", {
    header: bibliografico.fields["localdeproducao"],
    enableColumnFilter: false
  })
]

const arquivisticoColumns = [
  columnHelper.accessor("coddereferencia", {
    header: arquivistico.fields["coddereferencia"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("titulo", {
    header: arquivistico.fields["titulo"],
    enableColumnFilter: false
  }),
  columnHelper.accessor("nomedoprodutor", {
    header: arquivistico.fields["nomedoprodutor"],
    enableColumnFilter: false
  })
]

const TableItens: React.FC<{
  acervo: "museologico" | "bibliografico" | "arquivistico"
  ano: string
  museuId: string
}> = ({ acervo, ano, museuId }) => {
  const { data } = useSuspenseQuery({
    queryKey: ["itens", acervo],
    queryFn: async () => {
      const res = await request(`/api/${acervo}/${museuId}/${ano}/`)

      return await res.json()
    }
  })

  let columns

  if (acervo === "museologico") {
    columns = museologicoColumns
  } else if (acervo === "bibliografico") {
    columns = bibliograficoColumns
  } else {
    columns = arquivisticoColumns
  }

  return <Table title="Bens" data={data} columns={columns} />
}

export default TableItens
