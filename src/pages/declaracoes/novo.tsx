/* eslint-disable react-hooks/exhaustive-deps */
import DefaultLayout from "../../layouts/default"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import request from "../../utils/request"
import useStore from "../../utils/store"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import Uploader from "../../components/Uploader"

const NovoDeclaracaoPage = () => {
  const navigate = useNavigate()

  const { user } = useStore()

  const { data: museus } = useSuspenseQuery<{ nome: string; _id: string }[]>({
    queryKey: ["museus", user?.email],
    queryFn: async () => {
      const res = await request("/api/museus")
      return await res.json()
    }
  })

  const { data: declaracao, isLoading } = useQuery<{ _id: string } | null>({
    queryKey: ["declaracao", ano, museu],
    queryFn: async () => {
      try {
        const res = await request(`/api/declaracoes/${museu}/${ano}`)

        return await res.json()
      } catch (e) {
        return null
      }
    }
  })

  const retificacao = declaracao !== null

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: {
      museu: string
      ano: string
      museologico: FileList | null
      bibliografico: FileList | null
      arquivistico: FileList | null
    }) => {
      const formData = new FormData()

      if (data.museologico?.length && data.museologico.length > 0) {
        formData.append("museologico", data.museologico[0])
      }

      if (data.bibliografico?.length && data.bibliografico.length > 0) {
        formData.append("bibliografico", data.bibliografico[0])
      }

      if (data.arquivistico?.length && data.arquivistico.length > 0) {
        formData.append("arquivistico", data.arquivistico[0])
      }

      await request(`/api/uploads/${data.museu}/${data.ano}`, {
        method: "POST",
        body: formData
      })
    },
    onSuccess: () => {
      toast.success("Declaração enviada com sucesso!")
      navigate("/")
    }
  })

  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Nova declaração</h2>
      <Uploader
        onSubmit={(data) => mutate(data)}
        disabled={retificacao}
        isLoading={isPending || isLoading}
        museus={museus}
      />
    </DefaultLayout>
  )
}

export default NovoDeclaracaoPage
