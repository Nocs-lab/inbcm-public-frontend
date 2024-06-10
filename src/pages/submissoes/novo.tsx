import DefaultLayout from "../../layouts/default"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { z } from "zod"
import { Controller, FieldError, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, Modal } from "react-dsgov"
import Input from "../../components/Input"
import clsx from "clsx"
import { useNavigate } from "react-router"
import request from "../../utils/request"
import useStore from "../../utils/store"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import init, { validate_arquivistico, validate_bibliografico, validate_museologico } from "../../../parse-xlsx/pkg"

init()

const schema = z.object({
  ano: z.enum(["2024", "2023", "2022"], { message: "Ano inválido" }),
  museologico: z.instanceof(FileList).nullable(),
  bibliografico: z.instanceof(FileList).nullable(),
  arquivistico: z.instanceof(FileList).nullable(),
  museu: z.string().min(1, "Este campo é obrigatório")
})
  .superRefine(({ museologico, bibliografico, arquivistico }, ctx) => {
    if (!museologico?.length && !bibliografico?.length && !arquivistico?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Você precisa submeter pelo menos 1 arquivo",
      })
    }
  })

type FormValues = z.infer<typeof schema>

const NovoSubmissaoPage = () => {
  const navigate = useNavigate()

  const { user } = useStore()

  const { data: museus } = useSuspenseQuery<{ nome: string, _id: string }[]>({ queryKey: ["museus", user?.email], queryFn: async () => {
    const res = await request("/api/museus")
    return await res.json()
  }})

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      ano: "2024",
      museu: museus?.[0]?._id,
      museologico: null,
      bibliografico: null,
      arquivistico: null
    }
  })

  const ano = watch("ano")
  const museu = watch("museu")

  const { data: declaracao } = useSuspenseQuery<{ _id: string } | null>({
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
    mutationFn: async (data: FormValues) => {
      const formData = new FormData()

      if (data.museologico?.length && data.museologico.length > 0) {
        formData.append("museologicoArquivo", data.museologico[0])
        formData.append("museologico", JSON.stringify(museologicoData))
        formData.append("museologicoErros", JSON.stringify(musologicoErrors))
      }

      if (data.bibliografico?.length && data.bibliografico.length > 0) {
        formData.append("bibliograficoArquivo", data.bibliografico[0])
        formData.append("bibliografico", JSON.stringify(bibliograficoData))
        formData.append("bibliograficoErros", JSON.stringify(bibliograficoErrors))
      }

      if (data.arquivistico?.length && data.arquivistico.length > 0) {
        formData.append("arquivisticoArquivo", data.arquivistico[0])
        formData.append("arquivistico", JSON.stringify(arquivisticoData))
        formData.append("arquivisticoErros", JSON.stringify(arquivisticoErrors))
      }

      await request(
        `/api/uploads/${data.museu}/${data.ano}`,
        {
          method: "PUT",
          body: formData
        }
      )
    },
    onSuccess: () => {
      navigate("/submissoes")
    }
  })

  const onSubmit = async (data: FormValues) => {
    mutate(data)
  }

  const [museologico, bibliografico, arquivistico] = watch(["museologico", "bibliografico", "arquivistico"])

  const totalFiles = [museologico, bibliografico, arquivistico].filter((file) => file?.length).length

  const [showMessage, setShowMessage] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const [museologicoData, setMuseologicoData] = useState<{ [key: string]: string }[]>([])
  const [bibliograficoData, setBibliograficoData] = useState<{ [key: string]: string }[]>([])
  const [arquivisticoData, setArquivisticoData] = useState<{ [key: string]: string }[]>([])

  const [musologicoErrors, setMuseologicoErrors] = useState<string[]>([])
  const [bibliograficoErrors, setBibliograficoErrors] = useState<string[]>([])
  const [arquivisticoErrors, setArquivisticoErrors] = useState<string[]>([])

  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (museologico?.length) {
      setIsValidating(true)
      validate_museologico(museologico[0])
        .then((result: { [key: string]: (string | { [key: string]: string })[] }) => {
          if (result.errors.length > 0) {
            setMuseologicoErrors(result.errors as string[])
            setShowMessage(true)
          }
          setMuseologicoData(result.data as { [key: string]: string }[])
          setIsValidating(false)
        })
    }
  }, [museologico])

  useEffect(() => {
    if (bibliografico?.length) {
      setIsValidating(true)
      validate_bibliografico(bibliografico[0])
      .then((result: { [key: string]: (string | { [key: string]: string })[] }) => {
        if (result.errors.length > 0) {
            setBibliograficoErrors(result.errors as string[])
            setShowMessage(true)
          }
          setBibliograficoData(result.data as { [key: string]: string }[])
          setIsValidating(false)
        })
    }
  }, [bibliografico])

  useEffect(() => {
    if (arquivistico?.length) {
      setIsValidating(true)
      validate_arquivistico(arquivistico[0])
      .then((result: { [key: string]: (string | { [key: string]: string })[] }) => {
        if (result.errors.length > 0) {
            setArquivisticoErrors(result.errors as string[])
            setShowMessage(true)
          }
          setArquivisticoData(result.data as { [key: string]: string }[])
          setIsValidating(false)
        })
    }
  }, [arquivistico])

  return (
    <DefaultLayout>
      <Modal title="Pedências" useScrim showCloseButton modalOpened={modalOpen} onCloseButtonClick={() => setModalOpen(false)} className="min-w-1/2">
        <Modal.Body>
          {musologicoErrors.length > 0 && (
            <>
              <h3>Museológico</h3>
              Os campos {musologicoErrors.map(field => `"${field}"`).join(", ")} não foram totalmente preenchidos e são obrigatórios
            </>
          )}
          {bibliograficoErrors.length > 0 && (
            <>
              <h2>Bibliográfico</h2>
              Os campos {bibliograficoErrors.map(field => `"${field}"`).join(", ")} não foram totalmente preenchidos e são obrigatórios
            </>
          )}
          {arquivisticoErrors.length > 0 && (
            <>
              <h2>Arquivístico</h2>
              Os campos {arquivisticoErrors.map(field => `"${field}"`).join(", ")} não foram totalmente preenchidos e são obrigatórios
            </>
          )}
        </Modal.Body>
      </Modal>
      <h1>Submeter</h1>
      As planilhas devem ser preenchidas possível os padrões estabelecidos, que podem ser acessados{" "}
      <a
        href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/resolucao-normativa-ibram-no-6-de-31-de-agosto-de-2021"
        target="_blank"
      >
        clicando aqui
      </a>
      . Devem ser enviados até 3 arquivos, sendo um para cada tipo de acervo. Um modelo de planilha para cada tipo de acervo pode ser baixado clicando nos links abaixo:
      <ul className="list-disc list-inside pl-0 mt-2">
        <li>
          <a href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/modelo-planilha-museologico.xlsx" target="_blank">
            Museológico
          </a>
        </li>
        <li>
          <a href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/modelo-planilha-bibliografico.xlsx" target="_blank">
            Bibliográfico
          </a>
        </li>
        <li>
          <a href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/modelo-planilha-arquivistico.xlsx" target="_blank">
            Arquivístico
          </a>
        </li>
      </ul>
      Não é necessário enviar todos os arquivos, apenas os que forem aplicáveis. Também não é necessário enviar todos os arquivos de uma vez, você pode enviar outros arquivos posteriormente, desde que seja dentro do prazo estabelecido.
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
        {showMessage && (
          <div className="br-message warning">
            <div className="icon"><i className="fas fa-warning fa-lg" aria-hidden="true"></i>
            </div>
            <div className="content" aria-label="Data de início do afastamento inválida. A data não pode ser superior à data atual." role="alert">
              <span className="message-title">Foram detectados erros nos arquivos submetidos. {" "}</span>
              <span className="message-body">
                Você pode prosseguir mesmo assim, mas recomendamos que você veja as pêndencias <button className="text-blue-600" onClick={() => setModalOpen(true)} type="button">clicando aqui</button> e as resolva, antes de enviar os arquivos</span>
            </div>
            <div className="close">
              <button className="br-button circle small" type="button" aria-label="Fechar a messagem alterta" onClick={() => setShowMessage(false)}>
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )}
        {retificacao && (
          <div className="br-message warning">
            <div className="icon"><i className="fas fa-warning fa-lg" aria-hidden="true"></i>
            </div>
            <div className="content" aria-label="Data de início do afastamento inválida. A data não pode ser superior à data atual." role="alert">
              <span className="message-title">Está declaração já foi enviada. {" "}</span>
              <span className="message-body">Caso deseje fazer alguma alteração, faça uma retificação <Link to={`/submissoes/retificar/${declaracao?._id}`}>Clicando aqui</Link></span>
            </div>
            <div className="close">
              <button className="br-button circle small" type="button" aria-label="Fechar a messagem alterta" onClick={() => setShowMessage(false)}>
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )}
        <Controller
          control={control}
          name="ano"
          render={({ field }) => (
            <Select
              label="Ano"
              options={[{ label: "2024", value: "2024" }, { label: "2023", value: "2023" }, { label: "2022", value: "2022" }]}
              {...field}
            />
          )}
        />
        {museus.length > 0 && (
          <Controller
            control={control}
            name="museu"
            render={({ field }) => (
              <Select
                label="Museu"
                options={museus?.map(museu => ({ label: museu.nome, value: museu._id }))}
                {...field}
              />
            )}
          />
        )}
        <div className={clsx("grid grid-cols-1 gap-4 md:grid-cols-3 mt-3", retificacao && "opacity-50")}>
          <Input label="Museológico" type="file" error={errors.museologico as FieldError} {...register("museologico")} accept=".xlsx" disabled={retificacao} />
          <Input label="Bibliográfico" type="file" error={errors.bibliografico as FieldError} {...register("bibliografico")} accept=".xlsx" disabled={retificacao} />
          <Input label="Arquivístico" type="file" error={errors.arquivistico as FieldError} {...register("arquivistico")} accept=".xlsx" disabled={retificacao} />
        </div>
        <button type="submit" className={clsx("br-button primary mt-5", isValidating || isPending && "loading")} disabled={retificacao || totalFiles < 1 || isValidating || isPending}>Enviar</button>
      </form>
    </DefaultLayout>
  )
}

export default NovoSubmissaoPage
