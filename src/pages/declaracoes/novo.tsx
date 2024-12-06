/* eslint-disable react-hooks/exhaustive-deps */
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import Uploader from "../../components/Uploader"
import DefaultLayout from "../../layouts/default"
import request from "../../utils/request"
import useStore from "../../utils/store"

const NovoDeclaracaoPage = () => {
  const navigate = useNavigate()

  const { user } = useStore()

  const { data: museus } = useSuspenseQuery<{ nome: string; _id: string }[]>({
    queryKey: ["museus", user?.email],
    queryFn: async () => {
      const res = await request("/api/public/museus")
      return await res.json()
    }
  })

  const [ano, setAno] = useState("")
  const [museu, setMuseu] = useState("")

  const { data: declaracao, isLoading } = useQuery<{ _id: string } | null>({
    queryKey: ["declaracao", ano, museu],
    queryFn: async () => {
      try {
        const res = await request(`/api/public/declaracoes/${museu}/${ano}`)

        return await res.json()
      } catch (e) {
        return null
      }
    }
  })

  console.log(declaracao)

  const isExist = declaracao !== null
  //const isRetificar = declaracao?.retificacao
  const DeclaracaoStatus = declaracao?.status

  // console.log(isExist)
  // console.log(isRetificar)
  // console.log(DeclaracaoStatus)
  // console.log("Status da declaração:", declaracao?.status)

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

      await request(
        `/api/public/declaracoes/uploads/${data.museu}/${data.ano}`,
        {
          method: "POST",
          body: formData
        }
      )
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
      {DeclaracaoStatus == "Recebida" && (
        <div className="br-message warning">
          <div className="icon">
            <i className="fas fa-warning fa-lg" aria-hidden="true"></i>
          </div>
          <div
            className="content"
            aria-label="Data de início do afastamento inválida. A data não pode ser superior à data atual."
            role="alert"
          >
            <span className="message-title">
              Já foi enviada uma declaração para o ano {ano}.{" "}
            </span>
            <span className="message-body">
              Para baixar o recibo correspondente,{" "}
              <a href={`/api/public/recibo/${declaracao?._id}`}>clique aqui</a>.
              Caso deseje fazer alguma alteração, você pode enviar uma
              declaração retificadora{" "}
              <Link to={`/declaracoes/${declaracao?._id}/retificar`}>
                clicando aqui
              </Link>
              , ou excluir a declaração do museu e ano referente dependendo do
              nível de alteração.
            </span>
          </div>
        </div>
      )}
      {isExist &&
        DeclaracaoStatus !== "Recebida" &&
        DeclaracaoStatus !== "Excluída" && (
          <div className="br-message warning">
            <div className="icon">
              <i className="fas fa-warning fa-lg" aria-hidden="true"></i>
            </div>
            <div
              className="content"
              aria-label="Data de início do afastamento inválida. A data não pode ser superior à data atual."
              role="alert"
            >
              <span className="message-title">
                Esta declaração está em {DeclaracaoStatus} e não pode ser
                alterada.{" "}
              </span>
              <span className="message-body">
                Para baixar o recibo correspondente,{" "}
                <a href={`/api/public/recibo/${declaracao?._id}`}>
                  clique aqui
                </a>
                .
              </span>
            </div>
          </div>
        )}
      <Uploader
        onChangeAno={setAno}
        onChangeMuseu={setMuseu}
        anoDeclaracao={ano}
        onSubmit={(data) => mutate(data)}
        isLoading={isPending || isLoading}
        museus={museus}
        isExist={isExist}
        DeclaracaoStatus={DeclaracaoStatus}
      />
    </DefaultLayout>
  )
}

export default NovoDeclaracaoPage
