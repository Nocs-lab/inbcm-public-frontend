import { useParams } from "react-router"
import DefaultLayout from "../../../layouts/default"
import { useState } from "react"
import clsx from "clsx"
import request from "../../../utils/request"
import { useSuspenseQuery } from "@tanstack/react-query"
import { format } from "date-fns"
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
      <h2 className="mt-3">Declaração #{id}</h2>
      <div className="flex gap-4">
        <a href={`/api/recibo/${id}`} className="text-xl">
          <i className="fas fa-file-pdf" aria-hidden="true"></i> Baixar recibo
        </a>
        <Link to={`/declaracoes/${id}/retificar`} className="text-xl">
          <i className="fas fa-edit" aria-hidden="true"></i> Retificar
        </Link>
        {(data.museologico?.pendencias.length > 0 ||
          data.bibliografico?.pendencias.length > 0 ||
          data.arquivistico?.pendencias.length > 0) && (
          <>
            <button
              className="br-link text-xl text-blue-800"
              type="button"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>{" "}
              Visualizar pendências
            </button>
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
      <div className="br-table mt-3">
        <table>
          <tbody className="border-top">
            <tr>
              <th className="border-right max-w-1" scope="rowgroup">
                Data de envio
              </th>
              <td>
                {format(new Date(data.dataCriacao), "dd/MM/yyyy - HH:mm")}
              </td>
            </tr>
          </tbody>
          <tbody className="border-top">
            <tr>
              <th className="border-right max-w-1" scope="rowgroup">
                Ano
              </th>
              <td>{data.anoDeclaracao}</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th className="border-right" scope="rowgroup">
                Museu
              </th>
              <td>{data.museu_id.nome}</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th className="border-right" scope="rowgroup">
                Status
              </th>
              <td>{data.status}</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th className="border-right" scope="rowgroup">
                Status museológico
              </th>
              <td>
                {data.museologico.status !== "não enviado" ? (
                  <>
                    {data.museologico.status}{" "}
                    <a
                      href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/museologico`}
                      className="anchor__planilha"
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>{" "}
                      Baixar planilha
                    </a>
                  </>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th className="border-right" scope="rowgroup">
                Status bibliográfico
              </th>
              <td>
                {data.bibliografico.status !== "não enviado" ? (
                  <>
                    {data.bibliografico.status}{" "}
                    <a
                      href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/bibliografico`}
                      className="anchor__planilha"
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>{" "}
                      Baixar planilha
                    </a>
                  </>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th className="border-right" scope="rowgroup">
                Status arquivístico
              </th>
              <td>
                {data.arquivistico.status !== "não enviado" ? (
                  <>
                    {data.arquivistico.status}{" "}
                    <a
                      href={`/api/download/${data.museu_id._id}/${data.anoDeclaracao}/arquivistico`}
                      className="anchor__planilha"
                    >
                      <i className="fas fa-download" aria-hidden="true"></i>{" "}
                      Baixar planilha
                    </a>
                  </>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="pt-8 mb-1 pb-1">Acervo</h2>
      <div className="br-tab" data-counter="true">
        <nav className="tab-nav">
          <ul>
            <li
              className={clsx(
                "tab-item",
                currentTab === "museologico" && "is-active"
              )}
              title="Museológico"
            >
              <button
                type="button"
                onClick={() => setCurrentTab("museologico")}
              >
                <span className="name">Museológico</span>
              </button>
              <span className="results">(124)</span>
            </li>
            <li
              className={clsx(
                "tab-item",
                currentTab === "bibliografico" && "is-active"
              )}
              title="Bibliográfico"
            >
              <button
                type="button"
                onClick={() => setCurrentTab("bibliografico")}
              >
                <span className="name">Bibliográfico</span>
              </button>
              <span className="results">(74)</span>
            </li>
            <li
              className={clsx(
                "tab-item",
                currentTab === "arquivistico" && "is-active"
              )}
              title="Arquivístico"
            >
              <button
                type="button"
                onClick={() => setCurrentTab("arquivistico")}
              >
                <span className="name">Arquivistico</span>
              </button>
              <span className="results">(16)</span>
            </li>
          </ul>
        </nav>
        <div className="tab-content">
          <div
            className={clsx(
              "tab-panel",
              currentTab === "museologico" && "active"
            )}
          >
            <p>Aqui vai o painel do acervo museológico</p>
          </div>
          <div
            className={clsx(
              "tab-panel",
              currentTab === "bibliografico" && "active"
            )}
          >
            <p>Aqui vai o painel do acervo bibliográfico</p>
          </div>
          <div
            className={clsx(
              "tab-panel",
              currentTab === "arquivistico" && "active"
            )}
          >
            <p>Aqui vai o painel do acervo arquivístico</p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
