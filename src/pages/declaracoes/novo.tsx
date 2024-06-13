/* eslint-disable react-hooks/exhaustive-deps */
import DefaultLayout from "../../layouts/default"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { z } from "zod"
import { Controller, FieldError, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select } from "react-dsgov"
import Input from "../../components/Input"
import clsx from "clsx"
import { useNavigate } from "react-router"
import request from "../../utils/request"
import useStore from "../../utils/store"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import init, {
  validate_arquivistico,
  validate_bibliografico,
  validate_museologico
} from "../../../parse-xlsx/pkg/parse_xlsx"
import MismatchsModal from "../../components/MismatchsModal"

init()

const schema = z
  .object({
    ano: z.enum(["2024", "2023", "2022"], { message: "Ano inválido" }),
    museologico: z.instanceof(FileList).nullable(),
    bibliografico: z.instanceof(FileList).nullable(),
    arquivistico: z.instanceof(FileList).nullable(),
    museu: z.string().min(1, "Este campo é obrigatório")
  })
  .superRefine(({ museologico, bibliografico, arquivistico }, ctx) => {
    if (
      !museologico?.length &&
      !bibliografico?.length &&
      !arquivistico?.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Você precisa submeter pelo menos 1 arquivo"
      })
    }
  })

type FormValues = z.infer<typeof schema>

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

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue
  } = useForm<FormValues>({
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
        formData.append(
          "bibliograficoErros",
          JSON.stringify(bibliograficoErrors)
        )
      }

      if (data.arquivistico?.length && data.arquivistico.length > 0) {
        formData.append("arquivisticoArquivo", data.arquivistico[0])
        formData.append("arquivistico", JSON.stringify(arquivisticoData))
        formData.append("arquivisticoErros", JSON.stringify(arquivisticoErrors))
      }

      await request(`/api/uploads/${data.museu}/${data.ano}`, {
        method: "PUT",
        body: formData
      })
    },
    onSuccess: () => {
      navigate("/submissoes")
    }
  })

  const onSubmit = async (data: FormValues) => {
    mutate(data)
  }

  const [museologico, bibliografico, arquivistico] = watch([
    "museologico",
    "bibliografico",
    "arquivistico"
  ])

  const totalFiles = [museologico, bibliografico, arquivistico].filter(
    (file) => file?.length
  ).length

  const [showMessage, setShowMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<{
    title: string
    body: string
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const [museologicoData, setMuseologicoData] = useState<
    { [key: string]: string }[]
  >([])
  const [bibliograficoData, setBibliograficoData] = useState<
    { [key: string]: string }[]
  >([])
  const [arquivisticoData, setArquivisticoData] = useState<
    { [key: string]: string }[]
  >([])

  const [musologicoErrors, setMuseologicoErrors] = useState<string[]>([])
  const [bibliograficoErrors, setBibliograficoErrors] = useState<string[]>([])
  const [arquivisticoErrors, setArquivisticoErrors] = useState<string[]>([])

  const [modalOpen, setModalOpen] = useState(false)

  const handlerError = (err: unknown) => {
    if (err instanceof String) {
      switch (err) {
        case "XLSX_ERROR":
          return setErrorMessage({
            title: "Erro ao ler o arquivo.",
            body: "Verifique se o arquivo abre corretamente no Excel ou similar"
          })
        case "INVALID_HEADERS":
          return setErrorMessage({
            title: "A planilha está fora do padrão definido pelo IBRAM.",
            body: "Envie os bens de acordo com o formato definido."
          })
        case "EMPTY_ROWS":
          return setErrorMessage({
            title: "A planilha está vazia.",
            body: "Envie o arquivo com os bens do museu."
          })
      }
    }

    setErrorMessage({
      title: "Ocorreu um erro",
      body: "Ocorreu um erro ao validar o arquivo. Tente novamente."
    })
  }

  useEffect(() => {
    if (museologico?.length) {
      setIsValidating(true)
      validate_museologico(museologico[0])
        .then(
          (result: {
            [key: string]: (string | { [key: string]: string })[]
          }) => {
            if (result.errors.length > 0) {
              setMuseologicoErrors(result.errors as string[])
              setShowMessage(true)
            }
            setMuseologicoData(result.data as { [key: string]: string }[])
            setIsValidating(false)
          }
        )
        .catch((err) => {
          setValue("museologico", null)
          handlerError(err)
        })
    }
  }, [museologico])

  useEffect(() => {
    if (bibliografico?.length) {
      setIsValidating(true)
      validate_bibliografico(bibliografico[0])
        .then(
          (result: {
            [key: string]: (string | { [key: string]: string })[]
          }) => {
            if (result.errors.length > 0) {
              setBibliograficoErrors(result.errors as string[])
              setShowMessage(true)
            }
            setBibliograficoData(result.data as { [key: string]: string }[])
            setIsValidating(false)
          }
        )
        .catch((err) => {
          setValue("bibliografico", null)
          handlerError(err)
        })
    }
  }, [bibliografico])

  useEffect(() => {
    if (arquivistico?.length) {
      setIsValidating(true)
      validate_arquivistico(arquivistico[0])
        .then(
          (result: {
            [key: string]: (string | { [key: string]: string })[]
          }) => {
            if (result.errors.length > 0) {
              setArquivisticoErrors(result.errors as string[])
              setShowMessage(true)
            }
            setArquivisticoData(result.data as { [key: string]: string }[])
            setIsValidating(false)
          }
        )
        .catch((err) => {
          setValue("arquivistico", null)
          handlerError(err)
        })
    }
  }, [arquivistico])

  return (
    <DefaultLayout>
      <MismatchsModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        musologicoErrors={musologicoErrors}
        bibliograficoErrors={bibliograficoErrors}
        arquivisticoErrors={arquivisticoErrors}
      />
      <h1>Submeter</h1>
      As planilhas devem ser preenchidas possível os padrões estabelecidos, que
      podem ser acessados{" "}
      <a
        href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/resolucao-normativa-ibram-no-6-de-31-de-agosto-de-2021"
        target="_blank"
      >
        clicando aqui
      </a>
      . Devem ser enviados até 3 arquivos, sendo um para cada tipo de acervo. Um
      modelo de planilha para cada tipo de acervo pode ser baixado clicando nos
      links abaixo:
      <ul className="list-disc list-inside pl-0 mt-2">
        <li>
          <a
            href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/modelo-planilha-museologico.xlsx"
            target="_blank"
          >
            Museológico
          </a>
        </li>
        <li>
          <a
            href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/modelo-planilha-bibliografico.xlsx"
            target="_blank"
          >
            Bibliográfico
          </a>
        </li>
        <li>
          <a
            href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/modelo-planilha-arquivistico.xlsx"
            target="_blank"
          >
            Arquivístico
          </a>
        </li>
      </ul>
      Não é necessário enviar todos os arquivos, apenas os que forem aplicáveis.
      Também não é necessário enviar todos os arquivos de uma vez, você pode
      enviar outros arquivos posteriormente, desde que seja dentro do prazo
      estabelecido.
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
        {showMessage && (
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
                Encontramos inconsistências no(s) arquivo(s) enviado(s).{" "}
              </span>
              <span className="message-body">
                Você pode corrigi-las antes de enviar ou, se preferir 1) cancele
                o envio; 2) preencha os campos corretamente e; 3) mais tarde,
                retorne para enviar sua declaração. Para visualizar as
                inconsistências,{" "}
                <button
                  className="text-blue-600"
                  onClick={() => setModalOpen(true)}
                  type="button"
                >
                  clique aqui
                </button>
                .
              </span>
            </div>
            <div className="close">
              <button
                className="br-button circle small"
                type="button"
                aria-label="Fechar a messagem alterta"
                onClick={() => setShowMessage(false)}
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="br-message danger">
            <div className="icon">
              <i
                className="fas fa-exclamation-triangle fa-lg"
                aria-hidden="true"
              ></i>
            </div>
            <div
              className="content"
              aria-label="Data de início do afastamento inválida. A data não pode ser superior à data atual."
              role="alert"
            >
              <span className="message-title">{errorMessage.title} </span>
              <span className="message-body">{errorMessage.body}</span>
            </div>
            <div className="close">
              <button
                className="br-button circle small"
                type="button"
                aria-label="Fechar a messagem alterta"
                onClick={() => setErrorMessage(null)}
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )}
        {retificacao && (
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
                Já foi enviada uma declaração de ajuste para o ano {ano}.{" "}
              </span>
              <span className="message-body">
                Para baixar o recibo correspondente,{" "}
                <a href={`/api/recibo/${declaracao?._id}`}>clique aqui</a>. Caso
                deseje fazer alguma alteração, você deve enviar uma declaração
                retificadora{" "}
                <Link to={`/submissoes/retificar/${declaracao?._id}`}>
                  clicando aqui
                </Link>
                .
              </span>
            </div>
            <div className="close">
              <button
                className="br-button circle small"
                type="button"
                aria-label="Fechar a messagem alterta"
                onClick={() => setShowMessage(false)}
              >
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
              options={[
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },
                { label: "2022", value: "2022" }
              ]}
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
                options={museus?.map((museu) => ({
                  label: museu.nome,
                  value: museu._id
                }))}
                {...field}
              />
            )}
          />
        )}
        <div
          className={clsx(
            "grid grid-cols-1 gap-4 md:grid-cols-3 mt-3",
            isLoading || (retificacao && "opacity-50 cursor-not-allowed")
          )}
        >
          <Input
            label="Museológico"
            type="file"
            error={errors.museologico as FieldError}
            {...register("museologico")}
            accept=".xlsx"
            disabled={isLoading || retificacao}
          />
          <Input
            label="Bibliográfico"
            type="file"
            error={errors.bibliografico as FieldError}
            {...register("bibliografico")}
            accept=".xlsx"
            disabled={isLoading || retificacao}
          />
          <Input
            label="Arquivístico"
            type="file"
            error={errors.arquivistico as FieldError}
            {...register("arquivistico")}
            accept=".xlsx"
            disabled={isLoading || retificacao}
          />
        </div>
        <button
          type="submit"
          className={clsx(
            "br-button primary mt-5",
            isValidating || (isPending && "loading")
          )}
          disabled={
            isLoading ||
            retificacao ||
            totalFiles < 1 ||
            isValidating ||
            isPending
          }
        >
          Enviar
        </button>
      </form>
    </DefaultLayout>
  )
}

export default NovoDeclaracaoPage
