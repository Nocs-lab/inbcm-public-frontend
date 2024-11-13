import { z } from "zod"
import { Controller, FieldError, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, Button, Modal } from "react-dsgov"
import Input from "../components/Input"
import clsx from "clsx"
import { useEffect, useState } from "react"
import MismatchsModal from "../components/MismatchsModal"
import {
  validate_museologico,
  validate_bibliografico,
  validate_arquivistico,
  readFile
} from "inbcm-xlsx-validator"

const schema = z
  .object({
    ano: z.enum(["2024", "2023", "2022", "2021"], { message: "Ano inválido" }),
    museologico: z.instanceof(FileList).nullable(),
    bibliografico: z.instanceof(FileList).nullable(),
    arquivistico: z.instanceof(FileList).nullable(),
    museu: z.string().min(1, "Este campo é obrigatório"),
    fields: z.array(z.enum(["museologico", "bibliografico", "arquivistico"]))
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

const Uploader: React.FC<{
  museus: { _id: string; nome: string }[]
  anoDeclaracao: string
  isRetificar?: boolean
  isExcluded?: string
  isExist?: boolean
  onSubmit: (data: FormValues) => void
  isLoading: boolean
  disabled?: boolean
  onChangeAno?: (ano: string) => void
  onChangeMuseu?: (museu: string) => void
}> = ({
  museus,
  anoDeclaracao,
  isRetificar,
  isExcluded,
  onSubmit,
  isLoading,
  disabled = false,
  onChangeAno,
  onChangeMuseu,
  isExist
}) => {
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
      ano: anoDeclaracao || "2024",
      museu: museus[0]?._id,
      museologico: null,
      bibliografico: null,
      arquivistico: null,
      fields: []
    }
  })

  const [museologico, bibliografico, arquivistico, ano, museu, fields] = watch([
    "museologico",
    "bibliografico",
    "arquivistico",
    "ano",
    "museu",
    "fields"
  ])

  useEffect(() => {
    if (onChangeAno) {
      onChangeAno(ano)
    }
  }, [ano])

  useEffect(() => {
    if (onChangeMuseu) {
      onChangeMuseu(museu)
    }
  }, [museu])

  const totalFiles = [museologico, bibliografico, arquivistico].filter(
    (file) => file?.length
  ).length

  const [showMessage, setShowMessage] = useState<{
    show: boolean
    type: string
  } | null>(null)

  const [errorMessage, setErrorMessage] = useState<{
    title: string
    body: string
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const [museologicoErrors, setMuseologicoErrors] = useState<string[]>([])
  const [museologicoFields, setMuseologicoFields] = useState<string[]>([])

  const [bibliograficoErrors, setBibliograficoErrors] = useState<string[]>([])
  const [bibliograficoFields, setBibliograficoFields] = useState<string[]>([])

  const [arquivisticoErrors, setArquivisticoErrors] = useState<string[]>([])
  const [arquivisticoFields, setArquivisticoFields] = useState<string[]>([])

  const [modalOpen, setModalOpen] = useState(false)

  const handlerError = (err: unknown, typePlanilha: string) => {
    if (err instanceof Error) {
      switch (err.message) {
        case "XLSX_ERROR":
          return setErrorMessage({
            title: "Erro ao ler o arquivo.",
            body: "Verifique se o arquivo abre corretamente no Excel ou similar."
          })
        case "INVALID_HEADERS":
          return setErrorMessage({
            title: `A planilha de bens ${typePlanilha} está fora do padrão definido pelo IBRAM.`,
            body: "Envie os bens de acordo com o formato definido."
          })
        case "EMPTY_ROWS":
          return setErrorMessage({
            title: `A planilha de bens ${typePlanilha} está vazia.`,
            body: "Envie o arquivo com os bens do museu."
          })
      }
    }

    setErrorMessage({
      title: "Ocorreu um erro.",
      body: "Ocorreu um erro ao validar o arquivo. Tente novamente."
    })
  }

  useEffect(() => {
    if (museologico?.length) {
      setIsValidating(true)
      readFile(museologico[0]).then((result) =>
        validate_museologico(result)
          .then(
            (result: {
              [key: string]: (string | { [key: string]: string })[]
            }) => {
              if (result.errors.length > 0) {
                setMuseologicoErrors(result.errors as string[])
                setMuseologicoFields(result.data as string[])
                setShowMessage({
                  show: true,
                  type: "museológico"
                })
              }
              setIsValidating(false)
              setErrorMessage(null)
            }
          )
          .catch((err) => {
            setValue("museologico", null)
            handlerError(err, "museológicos")
          })
      )
    }
  }, [museologico])

  console.log(museologicoFields.length)

  useEffect(() => {
    if (bibliografico?.length) {
      setIsValidating(true)
      validate_bibliografico(bibliografico[0])
      readFile(bibliografico[0]).then((result) =>
        validate_bibliografico(result)
          .then(
            (result: {
              [key: string]: (string | { [key: string]: string })[]
            }) => {
              if (result.errors.length > 0) {
                setBibliograficoErrors(result.errors as string[])
                setBibliograficoFields(result.data as string[])
                setShowMessage({
                  show: true,
                  type: "bibliográfico"
                })
              }
              setIsValidating(false)
              setErrorMessage(null)
            }
          )
          .catch((err) => {
            setValue("bibliografico", null)
            handlerError(err, "bibliográficos")
          })
      )
    }
  }, [bibliografico])

  console.log(bibliograficoFields.length)

  useEffect(() => {
    if (arquivistico?.length) {
      setIsValidating(true)
      readFile(arquivistico[0]).then((result) =>
        validate_arquivistico(result)
          .then(
            (result: {
              [key: string]: (string | { [key: string]: string })[]
            }) => {
              if (result.errors.length > 0) {
                setArquivisticoErrors(result.errors as string[])
                setArquivisticoFields(result.data as string[])
                setShowMessage({
                  show: true,
                  type: "arquivístico"
                })
              }
              setIsValidating(false)
              setErrorMessage(null)
            }
          )
          .catch((err) => {
            setValue("arquivistico", null)
            handlerError(err, "arquivísticos")
          })
      )
    }
  }, [arquivistico])

  console.log(arquivisticoFields.length)

  const navigate = useNavigate()

  const handleCancelClick = () => {
    navigate("/")
  }

  const [modalAberto, setModalAberto] = useState(false)

  const handleSendClick = () => {
    setModalAberto(false)
  }

  return (
    <>
      <MismatchsModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        museologicoErrors={museologicoErrors}
        bibliograficoErrors={bibliograficoErrors}
        arquivisticoErrors={arquivisticoErrors}
      />
      As planilhas devem ser preenchidas de acordo com os modelos definidos na{" "}
      <a
        target="_blank"
        href="https://www.gov.br/museus/pt-br/assuntos/legislacao-e-normas/outros-instrumentos-normativo/resolucao-normativa-ibram-no-6-de-31-de-agosto-de-2021"
      >
        Resolução Normativa do Ibram nº 6, de 31 de agosto de 2021
      </a>
      . Você pode enviar até 03 arquivos, sendo um para cada tipo de acervo. Um
      modelo de planilha, para cada tipo de acervo, pode ser obtido clicando nos
      seguintes hiperlinks: <a href="/INBCM_Museologia.xlsx">Museológico</a>,{" "}
      <a href="/INBCM_Biblioteconomia.xlsx">Bibliográfico</a> e{" "}
      <a href="/INBCM_Arquivologia.xlsx">Arquivístico</a>.
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
                Há pendências na planilha selecionada para bens do tipo{" "}
                {showMessage.type}.{" "}
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
        <div className="flex gap-2 w-full">
          <Controller
            control={control}
            name="ano"
            render={({ field }) =>
              !isRetificar ? (
                <Select
                  label="Ano"
                  className="!w-full"
                  options={[
                    { label: "2024", value: "2024" },
                    { label: "2023", value: "2023" },
                    { label: "2022", value: "2022" },
                    { label: "2021", value: "2021" }
                  ]}
                  {...field}
                />
              ) : (
                <div />
              )
            }
          />
          {museus.length > 0 && (
            <Controller
              control={control}
              name="museu"
              render={({ field }) =>
                !isRetificar ? (
                  <Select
                    label="Museu"
                    className="!w-full"
                    disabled={isRetificar} //desabilita parcialmente
                    options={museus?.map((museu) => ({
                      label: museu.nome,
                      value: museu._id
                    }))}
                    onSelect={console.log}
                    {...field}
                  />
                ) : (
                  <div />
                )
              }
            />
          )}
          <Controller
            control={control}
            name="fields"
            render={({ field }) => (
              <Select
                label="Tipos de acervo"
                type="multiple"
                selectAllText={""}
                placeholder="Seleciona o(s) tipo(s)"
                options={[
                  { label: "Museológico", value: "museologico" },
                  { label: "Bibliográfico", value: "bibliografico" },
                  { label: "Arquivistico", value: "arquivistico" }
                ]}
                className="!w-full"
                {...field}
              />
            )}
          />
        </div>
        <div
          className={clsx(
            "grid grid-cols-1 gap-4 md:grid-cols-3 mt-3",
            isLoading || (disabled && "opacity-50 cursor-not-allowed")
          )}
        >
          {fields.includes("museologico") && (
            <Input
              label="Museológico"
              type="file"
              error={errors.museologico as FieldError}
              {...register("museologico")}
              accept=".xlsx"
              disabled={isLoading || disabled}
              file={museologico?.[0] ?? null}
              setFile={(file) =>
                setValue(
                  "museologico",
                  file ? ([file] as unknown as FileList) : null
                )
              }
            />
          )}
          {fields.includes("bibliografico") && (
            <Input
              label="Bibliográfico"
              type="file"
              error={errors.bibliografico as FieldError}
              {...register("bibliografico")}
              accept=".xlsx"
              disabled={isLoading || disabled}
              file={bibliografico?.[0] ?? null}
              setFile={(file) =>
                setValue(
                  "bibliografico",
                  file ? ([file] as unknown as FileList) : null
                )
              }
            />
          )}
          {fields.includes("arquivistico") && (
            <Input
              label="Arquivístico"
              type="file"
              error={errors.arquivistico as FieldError}
              {...register("arquivistico")}
              accept=".xlsx"
              disabled={isLoading || disabled}
              file={arquivistico?.[0] ?? null}
              setFile={(file) =>
                setValue(
                  "arquivistico",
                  file ? ([file] as unknown as FileList) : null
                )
              }
            />
          )}
        </div>
        <Modal
          useScrim
          showCloseButton
          title="Confirmar envio da declaração"
          modalOpened={modalAberto}
          onCloseButtonClick={() => setModalAberto(false)}
        >
          <Modal.Body>
            <p>Verifique a quantidade de itens por acervo</p>
            <table>
              <thead>
                <tr>
                  <th>Tipo de Acervo</th>
                  <th>Quantidade de itens</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Museológico</td>
                  <td>{museologicoFields.length}</td>
                </tr>
                <tr>
                  <td>Bibliográfico</td>
                  <td>{bibliograficoFields.length}</td>
                </tr>
                <tr>
                  <td>Arquivístico</td>
                  <td>{arquivisticoFields.length}</td>
                </tr>
              </tbody>
            </table>
          </Modal.Body>

          <Modal.Footer justify-content="center">
            <p>Tem certeza que deseja enviar esta declaração?</p>
            <Button
              primary
              small
              m={2}
              loading={isLoading}
              onClick={handleSendClick}
            >
              Confirmar
            </Button>
            <Button
              secondary
              small
              m={2}
              onClick={(e) => {
                e.preventDefault()
                setModalAberto(false)
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="flex space-x-4">
          {((isExist === true && isExcluded === "Excluída") ||
            (isExist === true && isRetificar) ||
            isExist === false) && (
            <button
              type="button"
              className={clsx(
                "br-button primary mt-5",
                isValidating || (isLoading && "loading")
              )}
              disabled={
                isLoading ||
                totalFiles !== fields.length ||
                isValidating ||
                disabled
              }
              onClick={() => setModalAberto(true)}
            >
              Enviar
            </button>
          )}
          <Button primary inverted onClick={handleCancelClick} className="mt-5">
            Cancelar
          </Button>
        </div>
      </form>
    </>
  )
}

export default Uploader
