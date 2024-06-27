import { useParams } from "react-router"
import DefaultLayout from "../../../layouts/default"
import { useState } from "react"
import clsx from "clsx"
import request from "../../../utils/request"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import MismatchsModal from "../../../components/MismatchsModal"

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

  const [currentTab, setCurrentTab] = useState<
    "museologico" | "bibliografico" | "arquivistico"
  >("museologico")

  return (
    <DefaultLayout>
      <Link to="/declaracoes" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2 className="mt-3 mb-0">Declaração #{id}</h2>
      <span className="br-tag mb-5">{data.status}</span>
      <div className="flex gap-4">
        <Link to={`/declaracoes/${id}/recibo`} className="text-xl">
          <i className="fas fa-file-pdf" aria-hidden="true"></i> Baixar recibo
        </Link>
        <a href={`/api/recibo/${id}`} className="text-xl">
          <i className="fas fa-edit" aria-hidden="true"></i> Retificar
        </a>
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
              musologicoErrors={data.museologico.pendencias}
              bibliograficoErrors={data.bibliografico.pendencias}
              arquivisticoErrors={data.arquivistico.pendencias}
            />
          </>
        )}
      </div>
      <div className="flex gap-10 text-lg mt-5">
        <span>
          <span className="font-bold">Data de envio: </span>
          {data.dataCriacao}
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
            {data.museologico.status !== "não enviado" && (
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
                  <span className="name">Acervo museológico (10)</span>
                </button>
              </li>
            )}
            {data.bibliografico.status !== "não enviado" && (
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
                  <span className="name">Acervo bibliográfico (20)</span>
                </button>
              </li>
            )}
            {data.arquivistico.status !== "não enviado" && (
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
                  <span className="name">Acervo arquivistico (30)</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
        <div className="tab-content">
          {data.museologico.status !== "não enviado" && (
            <div
              className={clsx(
                "tab-panel",
                currentTab === "museologico" && "active"
              )}
            >
              <span className="mb-3 flex items-center justify-start gap-1">
                <span className="font-bold">Status: </span>
                <span className="br-tag">{data.museologico.status}</span>
              </span>
              <a
                href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/museologico`}
              >
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                planilha
              </a>
            </div>
          )}
          {data.bibliografico.status !== "não enviado" && (
            <div
              className={clsx(
                "tab-panel",
                currentTab === "bibliografico" && "active"
              )}
            >
              <span className="mb-3 flex items-center justify-start gap-1">
                <span className="font-bold">Status: </span>
                <span className="br-tag">{data.bibliografico.status}</span>
              </span>
              <a
                href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/bibliografico`}
              >
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                planilha
              </a>
            </div>
          )}
          {data.arquivistico.status !== "não enviado" && (
            <div
              className={clsx(
                "tab-panel",
                currentTab === "arquivistico" && "active"
              )}
            >
              <span className="mb-3 flex items-center justify-start gap-1">
                <span className="font-bold">Status: </span>
                <span className="br-tag">{data.arquivistico.status}</span>
              </span>
              <a
                href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/arquivistico`}
              >
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                planilha
              </a>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  )
}
