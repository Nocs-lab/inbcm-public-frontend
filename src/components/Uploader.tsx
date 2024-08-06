/* eslint-disable react-hooks/exhaustive-deps */
import { z } from "zod"
import { Controller, FieldError, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select } from "react-dsgov"
import Input from "../components/Input"
import clsx from "clsx"
import { useEffect, useState } from "react"
import MismatchsModal from "../components/MismatchsModal"
import {
  validate_museologico,
  validate_bibliografico,
  validate_arquivistico
} from "inbcm-xlsx-validator"

const schema = z
  .object({
    ano: z.enum(["2024", "2023", "2022"], { message: "Ano inválido" }),
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
  onSubmit: (data: FormValues) => void
  isLoading: boolean
  disabled?: boolean
  onChangeAno?: (ano: string) => void
  onChangeMuseu?: (museu: string) => void
}> = ({
  museus,
  onSubmit,
  isLoading,
  disabled = false,
  onChangeAno,
  onChangeMuseu
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
      ano: "2024",
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

  const [showMessage, setShowMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<{
    title: string
    body: string
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const [musologicoErrors, setMuseologicoErrors] = useState<string[]>([])
  const [bibliograficoErrors, setBibliograficoErrors] = useState<string[]>([])
  const [arquivisticoErrors, setArquivisticoErrors] = useState<string[]>([])

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
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [errorMessage])

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
            setIsValidating(false)
          }
        )
        .catch((err) => {
          setValue("museologico", null)
          handlerError(err, "museológicos")
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
            setIsValidating(false)
          }
        )
        .catch((err) => {
          setValue("bibliografico", null)
          handlerError(err, "bibliográficos")
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
            setIsValidating(false)
          }
        )
        .catch((err) => {
          setValue("arquivistico", null)
          handlerError(err, "arquivísticos")
        })
    }
  }, [arquivistico])

  return (
    <>
      <MismatchsModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        musologicoErrors={musologicoErrors}
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
        <div className="flex gap-2 w-full">
          <Controller
            control={control}
            name="ano"
            render={({ field }) => (
              <Select
                label="Ano"
                className="!w-full"
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
                  className="!w-full"
                  options={museus?.map((museu) => ({
                    label: museu.nome,
                    value: museu._id
                  }))}
                  onSelect={console.log}
                  {...field}
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="fields"
            render={({ field }) => (
              <Select
                label="Tipos de acervo"
                type="multiple"
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
        <button
          type="submit"
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
        >
          Enviar
        </button>
      </form>
    </>
  )
}

export default Uploader
