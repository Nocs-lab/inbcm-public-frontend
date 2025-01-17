import { useMutation, useSuspenseQueries } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { Link } from "react-router-dom"
import Uploader from "../../../components/Uploader"
import DefaultLayout from "../../../layouts/default"
import request from "../../../utils/request"
import useStore from "../../../utils/store"

export default function RetificarDeclaracao() {
  const params = useParams()
  const id = params.id!

  const user = useStore((state) => state.user)

  const navigate = useNavigate()

  const [{ data: museus }, { data: declaracao }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["museus", user?.email],
        queryFn: async () => {
          const res = await request("/api/public/museus")
          return await res.json()
        }
      },
      {
        queryKey: ["declaracao", id],
        queryFn: async () => {
          const res = await request(`/api/public/declaracoes/${id}`)
          return await res.json()
        }
      }
    ]
  })

  const isExist = declaracao !== null

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: {
      museologico: FileList
      bibliografico: FileList
      arquivistico: FileList
    }) => {
      const formData = new FormData()

      if (data.museologico?.length) {
        formData.append("museologico", data.museologico[0])
      }

      if (data.bibliografico?.length) {
        formData.append("bibliografico", data.bibliografico[0])
      }

      if (data.arquivistico?.length) {
        formData.append("arquivistico", data.arquivistico[0])
      }

      return await request(
        `/api/public/declaracoes/retificar/${declaracao.museu_id._id}/${declaracao.anoDeclaracao}/${id}`,
        {
          method: "PUT",
          body: formData
        }
      )
    },
    onSuccess: async (res) => {
      const data = await res.json()
      navigate(`/declaracoes/${data._id}`)
    }
  })
  return (
    <DefaultLayout>
      <Link to={`/declaracoes/${id}`} className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>
        Retificar declaração{" "}
        {declaracao.retificacao
          ? `retificadora 0${declaracao.versao - 1}`
          : "original"}
      </h2>
      <div className="flex gap-10 text-lg mt-5">
        <span>
          <span className="font-bold">Ano: </span>
          {declaracao.anoDeclaracao}
        </span>
        <span>
          <span className="font-bold">Museu: </span>
          {declaracao.museu_id.nome}
        </span>
      </div>
      <hr></hr>
      <Uploader
        onSubmit={(data) =>
          mutate(
            data as unknown as {
              museologico: FileList
              bibliografico: FileList
              arquivistico: FileList
            }
          )
        }
        isLoading={isPending}
        museus={museus}
        anoDeclaracao={declaracao.anoDeclaracao}
        isRetificar={true}
        isExist={isExist}
      />
    </DefaultLayout>
  )
}
