import { useSuspenseQuery } from "@tanstack/react-query"
import DefaultLayout from "../../layouts/default"
import request from "../../utils/request"
import {
  Column,
  ColumnFiltersState,
  RowData,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  useReactTable
} from "@tanstack/react-table"
import { format } from "date-fns"
import React, { useEffect, useMemo, useState } from "react"
import MismatchsModal from "../../components/MismatchsModal"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "select"
  }
}

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
    cell: (info) => format(new Date(info.getValue()), "dd/MM/yyyy - HH:mm"),
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
    meta: {
      filterVariant: "select"
    }
  }),
  columnHelper.accessor("museologico.status", {
    header: "Museológico",
    cell: (info) => (
      <>
        {info.getValue() !== "não enviado" ? (
          <>
            {info.getValue()}{" "}
            <a
              href={`/api/download/${info.row.original.museu_id._id}/${info.row.getValue("anoDeclaracao")}/museologico`}
            >
              (Baixar)
            </a>
          </>
        ) : (
          "-"
        )}
      </>
    ),
    enableColumnFilter: false
  }),
  columnHelper.accessor("bibliografico.status", {
    header: "Bibliográfico",
    meta: {
      filterVariant: "select"
    },
    cell: (info) => (
      <>
        {info.getValue() !== "não enviado" ? (
          <>
            {info.getValue()}{" "}
            <a
              href={`/api/download/${info.row.original.museu_id._id}/${info.row.getValue("anoDeclaracao")}/bibliografico`}
            >
              (Baixar)
            </a>
          </>
        ) : (
          "-"
        )}
      </>
    ),
    enableColumnFilter: false
  }),
  columnHelper.accessor("arquivistico.status", {
    header: "Arquivístico",
    meta: {
      filterVariant: "select"
    },
    cell: (info) => (
      <>
        {info.getValue() !== "não enviado" ? (
          <>
            {info.getValue()}{" "}
            <a
              href={`/api/download/${info.row.original.museu_id._id}/${info.row.getValue("anoDeclaracao")}/arquivistico`}
            >
              (Baixar)
            </a>
          </>
        ) : (
          "-"
        )}
      </>
    ),
    enableColumnFilter: false
  }),
  columnHelper.accessor("_id", {
    header: "Ações",
    enableColumnFilter: false,
    cell: (info) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showModal, setShowModal] = useState(false)

      return (
        <div className="flex gap-1 items-center">
          <a href={`/api/recibo/${info.getValue()}`}>
            <i className="fas fa-file-pdf" aria-hidden="true"></i>
          </a>
          {(info.row.original.museologico.pendencias.length > 0 ||
            info.row.original.bibliografico.pendencias.length > 0 ||
            info.row.original.arquivistico.pendencias.length > 0) && (
            <>
              <button
                className="br-button circle small"
                onClick={() => setShowModal(true)}
              >
                <i
                  className="fas fa-exclamation-triangle"
                  aria-hidden="true"
                ></i>
              </button>
              <MismatchsModal
                opened={showModal}
                onClose={() => setShowModal(false)}
                musologicoErrors={info.row.original.museologico.pendencias}
                bibliograficoErrors={info.row.original.bibliografico.pendencias}
                arquivisticoErrors={info.row.original.arquivistico.pendencias}
              />
            </>
          )}
        </div>
      )
    }
  })
]

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  type = "text",
  placeholder,
  list,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
  type?: "text" | "number"
  placeholder?: string
  list?: string
} & Omit<React.HTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return (
    <input
      {...props}
      value={value}
      type={type}
      placeholder={placeholder}
      list={list}
      onChange={(e) => setValue(e.currentTarget.value)}
    />
  )
}

function Filter({ column }: { column: Column<unknown, unknown> }) {
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnFilterValue = column.getFilterValue()
  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues(), column]
  )

  return filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.currentTarget.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">Todos</option>
      {sortedUniqueValues.map((value) => (
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.map((value: string) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Pesquisar... (${column.getFacetedUniqueValues().size})`}
        className="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  )
}

export default function Declaracoes() {
  const { data } = useSuspenseQuery({
    queryKey: ["declaracoes"],
    queryFn: async () => {
      const response = await request("/api/declaracoes")
      return response.json()
    }
  })

  console.log(data)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <DefaultLayout>
      <div
        className="br-table overflow-auto"
        data-search="data-search"
        data-selection="data-selection"
        data-collapse="data-collapse"
        data-random="data-random"
      >
        <div className="table-header">
          <div className="top-bar">
            <div className="table-title">Declarações recebidas</div>
            <div className="actions-trigger text-nowrap">
              <button
                className="br-button circle"
                type="button"
                id="button-dropdown-density"
                title="Ver mais opções"
                data-toggle="dropdown"
                data-target="target01-3415"
                aria-label="Definir densidade da tabela"
                aria-haspopup="true"
                aria-live="polite"
              >
                <i className="fas fa-ellipsis-v" aria-hidden="true"></i>
              </button>
              <div
                className="br-list"
                id="target01-3415"
                role="menu"
                aria-labelledby="button-dropdown-density"
                hidden
              >
                <button
                  className="br-item"
                  type="button"
                  data-density="small"
                  role="menuitem"
                >
                  Densidade alta
                </button>
                <span className="br-divider"></span>
                <button
                  className="br-item"
                  type="button"
                  data-density="medium"
                  role="menuitem"
                >
                  Densidade média
                </button>
                <span className="br-divider"></span>
                <button
                  className="br-item"
                  type="button"
                  data-density="large"
                  role="menuitem"
                >
                  Densidade baixa
                </button>
              </div>
            </div>
            <div className="search-trigger">
              <button
                className="br-button circle"
                type="button"
                id="button-input-search"
                data-toggle="search"
                aria-label="Abrir busca"
                aria-controls="table-searchbox-3415"
              >
                <i className="fas fa-search" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <div className="search-bar">
            <div className="br-input">
              <label htmlFor="table-searchbox-3415">Buscar na tabela</label>
              <input
                id="table-searchbox-3415"
                type="search"
                placeholder="Buscar na tabela"
                aria-labelledby="button-input-search"
                aria-label="Buscar na tabela"
              />
              <button className="br-button" type="button" aria-label="Buscar">
                <i className="fas fa-search" aria-hidden="true"></i>
              </button>
            </div>
            <button
              className="br-button circle"
              type="button"
              data-dismiss="search"
              aria-label="Fechar busca"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div className="selected-bar">
            <div className="info">
              <span className="count">0</span>
              <span className="text">item selecionado</span>
            </div>
            <div className="actions-trigger text-nowrap">
              <button
                className="br-button circle inverted"
                type="button"
                id="button-dropdown-selection"
                data-toggle="dropdown"
                data-target="target02-3415"
                aria-controls="target02-3415"
                aria-label="Ver mais opções de ação"
                aria-haspopup="true"
              >
                <i className="fas fa-ellipsis-v" aria-hidden="true"></i>
              </button>
              <div
                className="br-list"
                id="target02-3415"
                role="menu"
                aria-labelledby="button-dropdown-selection"
                hidden
              >
                <button
                  className="br-item"
                  type="button"
                  data-toggle=""
                  role="menuitem"
                >
                  Ação 1
                </button>
                <span className="br-divider"></span>
                <button className="br-item" type="button" role="menuitem">
                  Ação 2
                </button>
              </div>
            </div>
          </div>
        </div>
        <table>
          <caption>Título da Tabela</caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan} scope="col">
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler()
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " 🔼",
                              desc: " 🔽"
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                          <Filter
                            column={header.column as Column<unknown, unknown>}
                          />
                        </>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} data-th={cell.column.columnDef.header}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer">
          <nav
            className="br-pagination"
            aria-label="paginação"
            data-total="50"
            data-current="1"
            data-per-page="20"
          >
            <div className="pagination-per-page">
              <div className="br-select">
                <div className="br-input">
                  <label htmlFor="per-page-selection-random-90012">
                    Exibir
                  </label>
                  <input
                    id="per-page-selection-random-90012"
                    type="text"
                    placeholder=" "
                  />
                  <button
                    className="br-button"
                    type="button"
                    aria-label="Exibir lista"
                    tabIndex={-1}
                    data-trigger="data-trigger"
                  >
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                  </button>
                </div>
                <div className="br-list" tabIndex={0}>
                  <div className="br-item" tabIndex={-1}>
                    <div className="br-radio">
                      <input
                        id="per-page-10-random-90012"
                        type="radio"
                        name="per-page-random-90012"
                        value="per-page-10-random-90012"
                        checked
                      />
                      <label htmlFor="per-page-10-random-90012">10</label>
                    </div>
                  </div>
                  <div className="br-item" tabIndex={-1}>
                    <div className="br-radio">
                      <input
                        id="per-page-20-random-90012"
                        type="radio"
                        name="per-page-random-90012"
                        value="per-page-20-random-90012"
                      />
                      <label htmlFor="per-page-20-random-90012">20</label>
                    </div>
                  </div>
                  <div className="br-item" tabIndex={-1}>
                    <div className="br-radio">
                      <input
                        id="per-page-30-random-90012"
                        type="radio"
                        name="per-page-random-90012"
                        value="per-page-30-random-90012"
                      />
                      <label htmlFor="per-page-30-random-90012">30</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span className="br-divider d-none d-sm-block mx-3"></span>
            <div className="pagination-information d-none d-sm-flex">
              <span className="current">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>
              &ndash;
              <span className="per-page">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length
                )}
              </span>
              &nbsp;de&nbsp;<span className="total">{data.length}</span>
              &nbsp;itens
            </div>
            <div className="pagination-go-to-page d-none d-sm-flex ml-auto">
              <div className="br-select">
                <div className="br-input">
                  <label htmlFor="go-to-selection-random-55067">Página</label>
                  <input
                    id="go-to-selection-random-55067"
                    type="text"
                    placeholder=" "
                  />
                  <button
                    className="br-button"
                    type="button"
                    aria-label="Exibir lista"
                    tabIndex={-1}
                    data-trigger="data-trigger"
                  >
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                  </button>
                </div>
                <div className="br-list" tabIndex={0}>
                  <div className="br-item" tabIndex={-1}>
                    <div className="br-radio">
                      <input
                        id="go-to-1-random-55067"
                        type="radio"
                        name="go-to-random-55067"
                        value="go-to-1-random-55067"
                        checked
                      />
                      <label htmlFor="go-to-1-random-55067">1</label>
                    </div>
                  </div>
                  <div className="br-item" tabIndex={-1}>
                    <div className="br-radio">
                      <input
                        id="go-to-2-random-55067"
                        type="radio"
                        name="go-to-random-55067"
                        value="go-to-2-random-55067"
                      />
                      <label htmlFor="go-to-2-random-55067">2</label>
                    </div>
                  </div>
                  <div className="br-item" tabIndex={-1}>
                    <div className="br-radio">
                      <input
                        id="go-to-3-random-55067"
                        type="radio"
                        name="go-to-random-55067"
                        value="go-to-3-random-55067"
                      />
                      <label htmlFor="go-to-3-random-55067">3</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span className="br-divider d-none d-sm-block mx-3"></span>
            <div className="pagination-arrows ml-auto ml-sm-0">
              <button
                className="br-button circle"
                type="button"
                aria-label="Voltar página"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <i className="fas fa-angle-left" aria-hidden="true"></i>
              </button>
              <button
                className="br-button circle"
                type="button"
                aria-label="Página seguinte"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <i className="fas fa-angle-right" aria-hidden="true"></i>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </DefaultLayout>
  )
}
