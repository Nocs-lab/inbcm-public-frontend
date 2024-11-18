import { useSuspenseQuery } from "@tanstack/react-query"
import clsx from "clsx"
import { format } from "date-fns"
import { useParams } from "react-router"
import request from "../../../utils/request"
import DefaultLayout from "../../../layouts/default"
import { Link } from "react-router-dom"

export default function Timeline() {
  const params = useParams()
  const id = params.id!

  const { data } = useSuspenseQuery({
    queryKey: ["declaracao", id],
    queryFn: async () => {
      const response = await request(`/api/public/declaracoes/${id}`)
      return response.json()
    }
  })

  return (
    <DefaultLayout>
      <Link to={`/declaracoes/${id}`} className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
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
    </DefaultLayout>
  )
}
