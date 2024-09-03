import { useParams } from "react-router"
import DefaultLayout from "../../../layouts/default"
import { useState } from "react"
import clsx from "clsx"
import request from "../../../utils/request"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import MismatchsModal from "../../../components/MismatchsModal"
import { format } from "date-fns"
import TableItens from "../../../components/TableItens"

export default function DeclaracaoPage() {
  const params = useParams()
  const id = params.id!

  const { data } = useSuspenseQuery({
    queryKey: ["declaracao", id],
    queryFn: async () => {
      const response = await request(`/api/declaracoes/${id}`)
      return response.json()
    }
  })

  const [showModal, setShowModal] = useState(false)

  const getDefaultTab = () => {
    if (data.museologico?.status) {
      return "museologico"
    } else if (data.bibliografico?.status) {
      return "bibliografico"
    } else if (data.arquivistico?.status) {
      return "arquivistico"
    } else {
      return "museologico"
    }
  }

  const [currentTab, setCurrentTab] = useState<
    "museologico" | "bibliografico" | "arquivistico"
  >(getDefaultTab())

  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2 className="mt-3 mb-0">Declaração #{id}</h2>
      <span className="br-tag mb-5">{data.status}</span>
      <div className="flex gap-4">
        <a href={`/api/recibo/${id}`} className="text-xl">
          <i className="fas fa-file-pdf" aria-hidden="true"></i> Baixar recibo
        </a>

        {data.status !== "Em análise" ? (
          <Link to={`/declaracoes/${id}/retificar`} className="text-xl">
            <i className="fas fa-edit" aria-hidden="true"></i> Retificar
          </Link>
        ) : (
          <span className="text-xl text-gray-500 cursor-not-allowed">
            <i className="fas fa-edit" aria-hidden="true"></i> Retificar
          </span>
        )}

        {(data.museologico?.pendencias.length > 0 ||
          data.bibliografico?.pendencias.length > 0 ||
          data.arquivistico?.pendencias.length > 0) && (
          <>
            <a
              className="text-xl"
              href="#"
              onClick={() => setShowModal(true)}
              role="button"
            >
              <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>{" "}
              Visualizar pendências
            </a>
            <MismatchsModal
              opened={showModal}
              onClose={() => setShowModal(false)}
              museologicoErrors={data.museologico?.pendencias ?? []}
              bibliograficoErrors={data.bibliografico?.pendencias ?? []}
              arquivisticoErrors={data.arquivistico?.pendencias ?? []}
            />
          </>
        )}
      </div>
      <div className="flex gap-10 text-lg mt-5">
        <span>
          <span className="font-bold">Tipo: </span>
          {data.retificacao ? "Retificada" : "Original"}
        </span>
        <span>
          <span className="font-bold">Data de envio: </span>
          {format(data.dataCriacao, "dd/MM/yyyy HH:mm")}
        </span>
        <span>
          <span className="font-bold">Ano: </span>
          {data.anoDeclaracao}
        </span>
        <span>
          <span className="font-bold">Museu: </span>
          {data.museu_id.nome}
        </span>
      </div>
      <div className="br-tab mt-10" data-counter="true">
        <nav className="tab-nav">
          <ul>
            {data.museologico?.status &&
              data.museologico.status !== "Não enviada" && (
                <li
                  className={clsx(
                    "tab-item",
                    currentTab === "museologico" && "is-active"
                  )}
                  title="Acervo museológico"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentTab("museologico")}
                  >
                    <span className="name">
                      Acervo museológico ({data.museologico?.quantidadeItens})
                    </span>
                  </button>
                </li>
              )}
            {data.bibliografico?.status &&
              data.bibliografico.status !== "Não enviada" && (
                <li
                  className={clsx(
                    "tab-item",
                    currentTab === "bibliografico" && "is-active"
                  )}
                  title="Acervo bibliográfico"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentTab("bibliografico")}
                  >
                    <span className="name">
                      Acervo bibliográfico (
                      {data.bibliografico?.quantidadeItens})
                    </span>
                  </button>
                </li>
              )}
            {data.arquivistico?.status &&
              data.arquivistico.status !== "Não enviada" && (
                <li
                  className={clsx(
                    "tab-item",
                    currentTab === "arquivistico" && "is-active"
                  )}
                  title="Arcevo arquivístico"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentTab("arquivistico")}
                  >
                    <span className="name">
                      Acervo arquivistico ({data.arquivistico?.quantidadeItens})
                    </span>
                  </button>
                </li>
              )}
          </ul>
        </nav>
        <div className="tab-content">
          {data.museologico?.status &&
            data.museologico.status !== "Não enviada" && (
              <div
                className={clsx(
                  "tab-panel",
                  currentTab === "museologico" && "active"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="mb-3 flex items-center justify-start gap-1">
                    <span className="font-bold">Status: </span>
                    <span className="br-tag">{data.museologico?.status}</span>
                  </span>
                  <a
                    href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/museologico`}
                    className="mb-2"
                  >
                    <i className="fas fa-download" aria-hidden="true"></i>{" "}
                    Baixar planilha
                  </a>
                </div>
                <TableItens
                  acervo="museologico"
                  ano={data.anoDeclaracao}
                  museuId={data.museu_id._id}
                />
              </div>
            )}
          {data.bibliografico?.status &&
            data.bibliografico.status !== "Não enviada" && (
              <div
                className={clsx(
                  "tab-panel",
                  currentTab === "bibliografico" && "active"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="mb-3 flex items-center justify-start gap-1">
                    <span className="font-bold">Status: </span>
                    <span className="br-tag">{data.bibliografico?.status}</span>
                  </span>
                  <a
                    href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/bibliografico`}
                    className="mb-2"
                  >
                    <i className="fas fa-download" aria-hidden="true"></i>{" "}
                    Baixar planilha
                  </a>
                </div>
                <TableItens
                  acervo="bibliografico"
                  ano={data.anoDeclaracao}
                  museuId={data.museu_id._id}
                />
              </div>
            )}
          {data.arquivistico?.status &&
            data.arquivistico.status !== "Não enviada" && (
              <div
                className={clsx(
                  "tab-panel",
                  currentTab === "arquivistico" && "active"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="mb-3 flex items-center justify-start gap-1">
                    <span className="font-bold">Status: </span>
                    <span className="br-tag">{data.arquivistico?.status}</span>
                  </span>
                  <a
                    href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/arquivistico`}
                    className="mb-2"
                  >
                    <i className="fas fa-download" aria-hidden="true"></i>{" "}
                    Baixar planilha
                  </a>
                </div>
                <TableItens
                  acervo="arquivistico"
                  ano={data.anoDeclaracao}
                  museuId={data.museu_id._id}
                />
              </div>
            )}
        </div>
      </div>
    </DefaultLayout>
  )
}
