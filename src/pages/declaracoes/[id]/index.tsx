import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import clsx from "clsx"
import { format } from "date-fns"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Link } from "react-router-dom"
import MismatchsModal from "../../../components/MismatchsModal"
import TableItens from "../../../components/TableItens"
import DefaultLayout from "../../../layouts/default"
import { getColorStatus } from "../../../utils/colorStatus"
import request from "../../../utils/request"
import toast from "react-hot-toast"
import { Button, Modal } from "react-dsgov"

export default function DeclaracaoPage() {
  const params = useParams()
  const id = params.id!

  const navigate = useNavigate()

  const [modalTimelineAberta, setModalTimelineAberta] = useState(false)

  const [modalExcluirAberta, setModalExcluirAberta] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: deleteDeclaration, isPending: deletingDeclaration } =
    useMutation({
      mutationFn: async () => {
        return await request(`/api/public/declaracoes/${id}`, {
          method: "DELETE"
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["declaracoes"] })
        toast.success("Declaração excluída com sucesso!")
        navigate("/")
      },
      onError: () => {
        toast.error("Erro ao excluir declaração")
      }
    })

  const { data } = useSuspenseQuery({
    queryKey: ["declaracao", id],
    queryFn: async () => {
      const response = await request(`/api/public/declaracoes/${id}`)
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
    "museologico" | "bibliografico" | "arquivistico" | "timeline"
  >(getDefaultTab())

  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2 className="mt-3 mb-0">
        Declaração{" "}
        {data.retificacao ? `retificadora 0${data.versao - 1}` : "original"}
      </h2>
      <span className="br-tag mb-5" style={getColorStatus(data.status)}>
        {data.status}
      </span>
      <div className="flex gap-4">
        <a href={`/api/public/recibo/${id}`} className="text-xl">
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
        <a
          className="br-link text-[#1351B9] hover:bg-blue-200 text-xl"
          href="#"
          onClick={() => setModalTimelineAberta(true)}
        >
          <i className="fas fa-timeline" aria-hidden="true"></i> Histórico
        </a>
        <Modal
          useScrim
          showCloseButton
          modalOpened={modalTimelineAberta}
          onCloseButtonClick={() => setModalTimelineAberta(false)}
        >
          <Modal.Body className="text-center">
            <span className="font-bold text-lg text-left">Histórico</span>
            <nav
              className="br-step vertical"
              data-initial="1"
              data-label="right"
              role="none"
            >
              <div
                className="step-progress"
                role="listbox"
                aria-orientation="vertical"
                aria-label="Lista de Opções"
              >
                {(data.status === "Em conformidade" ||
                  data.status === "Não conformidade") && (
                  <div className="step-progress-btn active">
                    <span className="step-info text-left">
                      Análise finalizada em{" "}
                      {format(data.dataFimAnalise, "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                )}
                {data.status === "Em análise" && (
                  <button className="step-progress-btn" disabled>
                    <span className="step-info text-left opacity-50">
                      Aguardando finalização da análise
                    </span>
                  </button>
                )}
                {data.status === "Recebida" ? (
                  <button className="step-progress-btn" disabled>
                    <span className="step-info text-left opacity-50">
                      Aguardando inicio da análise
                    </span>
                  </button>
                ) : (
                  <div
                    className={clsx(
                      "step-progress-btn",
                      data.status === "Em análise" && "active"
                    )}
                  >
                    <span className="step-info text-left">
                      Análise iniciada
                      <br /> Por {data.responsavelAnaliseNome} em{" "}
                      {format(data.dataEnvioAnalise, "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                  </div>
                )}
                <div
                  className={clsx(
                    "step-progress-btn",
                    data.status === "Recebida" && "active"
                  )}
                >
                  <span className="step-info text-left">
                    Declaração enviada
                    <br /> Por {data.responsavelEnvioNome} em{" "}
                    {format(data.dataCriacao, "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                </div>
              </div>
            </nav>
          </Modal.Body>
          <Modal.Footer justify-content="end">
            <Button
              primary
              small
              m={2}
              onClick={() => navigate(`/declaracoes/${id}/timeline`)}
            >
              Detalhar
            </Button>
          </Modal.Footer>
        </Modal>
        <a
          className="br-link text-[#1351B9] hover:bg-blue-200 text-xl"
          href="#"
          onClick={() => setModalExcluirAberta(true)}
        >
          <i className="fas fa-trash" aria-hidden="true"></i> Excluir
        </a>
        <Modal
          useScrim
          showCloseButton
          title="Excluir declaração"
          modalOpened={modalExcluirAberta}
          onCloseButtonClick={() => setModalExcluirAberta(false)}
        >
          <Modal.Body>
            <div className="flex">
              <i className="fas fa-exclamation-triangle text-danger fa-3x"></i>

              <p className="normal-case text-center">
                Tem certeza que deseja excluir a declaração{" "}
                {data.retificacao ? "retificadora" : "original"} de{" "}
                {data.anoDeclaracao} do {data.museu_id.nome}?
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer justify-content="end">
            <Button
              primary
              small
              m={2}
              loading={deletingDeclaration}
              onClick={() => deleteDeclaration()}
            >
              Confirmar
            </Button>
            <Button
              secondary
              small
              m={2}
              onClick={() => setModalExcluirAberta(false)}
            >
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <div className="flex gap-10 text-lg mt-5">
        <span>
          <span className="font-bold">Envio: </span>
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
                      Acervo arquivístico ({data.arquivistico?.quantidadeItens})
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
                    <span className="font-bold">Situação: </span>
                    <span
                      className="br-tag"
                      style={getColorStatus(data.museologico?.status)}
                    >
                      {data.museologico?.status}
                    </span>
                  </span>
                  <a
                    href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao}/museologico`}
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
                    <span
                      className="br-tag"
                      style={getColorStatus(data.bibliografico?.status)}
                    >
                      {data.bibliografico?.status}
                    </span>
                  </span>
                  <a
                    href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao}/bibliografico`}
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
                    <span
                      className="br-tag"
                      style={getColorStatus(data.arquivistico?.status)}
                    >
                      {data.arquivistico?.status}
                    </span>
                  </span>
                  <a
                    href={`/api/public/declaracoes/download/${data.museu_id._id}/${data.anoDeclaracao}/arquivistico`}
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
