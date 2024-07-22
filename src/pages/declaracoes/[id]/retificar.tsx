import DefaultLayout from "../../../layouts/default"
import { useMutation, useSuspenseQueries } from "@tanstack/react-query"
import { useParams } from "react-router"
import request from "../../../utils/request"
import { Link } from "react-router-dom"
import Uploader from "../../../components/Uploader"
import useStore from "../../../utils/store"

export default function RetificarDeclaracao() {
  const params = useParams()
  const id = params.id!

  const user = useStore((state) => state.user)

  const [{ data: museus }, { data: declaracao }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["museus", user?.email],
        queryFn: async () => {
          const res = await request("/api/museus")
          return await res.json()
        }
      },
      {
        queryKey: ["declaracao", id],
        queryFn: async () => {
          const res = await request(`/api/declaracoes/${id}`)
          return await res.json()
        }
      }
    ]
  })

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

      await request(
        `/api/retificar/${declaracao.museu_id._id}/${declaracao.anoDeclaracao}/${id}`,
        {
          method: "PUT",
          body: formData
        }
      )
    }
  })
  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Retificar declaração</h2>
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
      />
    </DefaultLayout>
  )
}
