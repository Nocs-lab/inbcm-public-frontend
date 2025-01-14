import { useParams } from "react-router"
import DefaultLayout from "../../../layouts/default"
import { useSuspenseQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import useHttpClient from "../../../utils/request"

const DeclaracaoPage: React.FC = () => {
  const params = useParams()
  const request = useHttpClient()
  const id = params.id!

  const { data: timeline } = useSuspenseQuery({
    queryKey: ["timeline", id],
    queryFn: async () => {
      const response = await request(`/api/public/timeline/${id}`)
      return response.json()
    }
  })

  const { data: declaracao } = useSuspenseQuery({
    queryKey: ["declaracoes", id],
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
      <h2 className="mt-3 mb-0">
        Histórico da declaração{" "}
        {declaracao.retificacao
          ? `retificadora 0${declaracao.versao - 1}`
          : "original"}
      </h2>
      <span className="br-tag mb-5">{declaracao.status}</span>
      <div className="flex gap-10 text-lg">
        <span>
          <span className="font-bold">Ano: </span>
          {declaracao.anoDeclaracao}
        </span>
        <span>
          <span className="font-bold">Museu: </span>
          {declaracao.museu_id.nome}
        </span>
      </div>
      <div className="col-auto mx-5">
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
            {[...timeline]
              .reverse()
              .map((item: { dataEvento: Date; nomeEvento: string }) => (
                <button
                  key={item.dataEvento.toISOString() + item.nomeEvento}
                  className="step-progress-btn"
                  role="option"
                  aria-posinset={3}
                  aria-setsize={3}
                  type="button"
                >
                  <span className="step-info text-left">
                    {item.nomeEvento}
                    <br /> Em {format(item.dataEvento, "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                </button>
              ))}
          </div>
        </nav>
      </div>
    </DefaultLayout>
  )
}

export default DeclaracaoPage
