import DefaultLayout from "../../../layouts/default"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { z } from "zod"
import { FieldError, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Input from "../../../components/Input"
import clsx from "clsx"
import { useNavigate, useParams } from "react-router"
import request from "../../../utils/request"
import { useEffect, useState } from "react"
import MismatchsModal from "../../../components/MismatchsModal"
import init, {
  validate_arquivistico,
  validate_bibliografico,
  validate_museologico
} from "../../../../parse-xlsx/pkg/parse_xlsx"

init()

const schema = z
  .object({
    museologico: z.instanceof(FileList).nullable(),
    bibliografico: z.instanceof(FileList).nullable(),
    arquivistico: z.instanceof(FileList).nullable()
  })
  .superRefine(({ museologico, bibliografico, arquivistico }, ctx) => {
    if (!museologico && !bibliografico && !arquivistico) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Você precisa submeter pelo menos 1 arquivo"
      })
    }
  })

type FormValues = z.infer<typeof schema>

export default function RetificarDeclaracao() {
  const navigate = useNavigate()

  const params = useParams()
  const id = params.declaracaoId!

  const { data: declaracao } = useSuspenseQuery<{
    museu_id: { _id: string; nome: string }
    anoDeclaracao: string
  }>({
    queryKey: ["declaracao", id],
    queryFn: async () => {
      const res = await request(`/api/declaracoes/${id}`)
      return await res.json()
    }
  })

  const { mutateAsync } = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData()

      if (data.museologico?.length) {
        formData.append("museologicoArquivo", data.museologico[0])
        formData.append("museologico", JSON.stringify(museologicoData))
        formData.append("museologicoErros", JSON.stringify(musologicoErrors))
      }

      if (data.bibliografico?.length) {
        formData.append("bibliograficoArquivo", data.bibliografico[0])
        formData.append("bibliografico", JSON.stringify(bibliograficoData))
        formData.append(
          "bibliograficoErros",
          JSON.stringify(bibliograficoErrors)
        )
      }

      if (data.arquivistico?.length) {
        formData.append("arquivisticoArquivo", data.arquivistico[0])
        formData.append("arquivistico", JSON.stringify(arquivisticoData))
        formData.append("arquivisticoErros", JSON.stringify(arquivisticoErrors))
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await mutateAsync(data)
      navigate("/declaracoes")
    } catch (error) {
      console.error("Error:", error)
    }
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

  const [errorMessage, setErrorMessage] = useState<{
    title: string
    body: string
  } | null>(null)

  const handlerError = (err: unknown) => {
    switch (err) {
      case "XLSX_ERROR":
        setErrorMessage({
          title: "Erro ao ler o arquivo.",
          body: "Verifique se o arquivo abre corretamente no Excel ou similar."
        })
        break
      case "INVALID_HEADERS":
        setErrorMessage({
          title: "A planilha está fora do padrão definido pelo IBRAM.",
          body: "Envie os bens de acordo com o formato definido."
        })
        break
      case "EMPTY_ROWS":
        setErrorMessage({
          title: "A planilha está vazia.",
          body: "Envie o arquivo com os bens do museu."
        })
        break
      default:
        setErrorMessage({
          title: "Ocorreu um erro.",
          body: "Ocorreu um erro ao validar o arquivo. Tente novamente."
        })
        break
    }
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

  if (!declaracao) {
    return (
      <DefaultLayout>
        <h1>Declaração não encontrada</h1>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <MismatchsModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        musologicoErrors={musologicoErrors}
        bibliograficoErrors={bibliograficoErrors}
        arquivisticoErrors={arquivisticoErrors}
      />
      <h1>Retificar Declaração</h1>
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
                Foram detectados erros nos arquivos submetidos.
              </span>
              <span className="message-body">
                Você pode prosseguir mesmo assim, mas recomendamos que você veja
                as inconsistências{" "}
                <button
                  className="text-blue-600"
                  onClick={() => setModalOpen(true)}
                  type="button"
                >
                  clicando aqui
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-3">
          <Input
            label="Museológico"
            type="file"
            error={errors.museologico as FieldError}
            {...register("museologico")}
            accept=".xlsx"
            file={museologico?.[0] ?? null}
            setFile={(file) =>
              setValue(
                "museologico",
                file ? ([file] as unknown as FileList) : null
              )
            }
          />
          <Input
            label="Bibliográfico"
            type="file"
            error={errors.bibliografico as FieldError}
            {...register("bibliografico")}
            accept=".xlsx"
            file={bibliografico?.[0] ?? null}
            setFile={(file) =>
              setValue(
                "bibliografico",
                file ? ([file] as unknown as FileList) : null
              )
            }
          />
          <Input
            label="Arquivístico"
            type="file"
            error={errors.arquivistico as FieldError}
            {...register("arquivistico")}
            accept=".xlsx"
            file={arquivistico?.[0] ?? null}
            setFile={(file) =>
              setValue(
                "arquivistico",
                file ? ([file] as unknown as FileList) : null
              )
            }
          />
        </div>
        <button
          type="submit"
          className={clsx(
            "br-button primary mt-5",
            isSubmitting || (isValidating && "loading")
          )}
          disabled={totalFiles < 1}
        >
          Enviar
        </button>
      </form>
    </DefaultLayout>
  )
}
