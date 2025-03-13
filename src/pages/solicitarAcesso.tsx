import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import Input from "../components/Input"
import { Row, Col, Button, Modal } from "react-dsgov"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router"
import request from "../utils/request"
import toast from "react-hot-toast"
import { debounce } from "lodash"
import Select from "../components/MultiSelect"
import { useModal } from "../utils/modal"
import Upload from "../components/Upload"
import { useHookFormMask } from "use-mask-input"

const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, "")
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false

  const cpfDigits = cpf.split("").map((el) => +el)
  const rest = (count: number) => {
    return (
      ((cpfDigits
        .slice(0, count - 12)
        .reduce((soma, el, index) => soma + el * (count - index), 0) *
        10) %
        11) %
      10
    )
  }

  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10]
}

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório"),
  cpf: z
    .string()
    .min(1, "Este campo é obrigatório")
    .refine((cpf) => validateCPF(cpf), {
      message: "CPF inválido"
    }),
  museus: z.array(z.string()).optional(),
  file: z.instanceof(File)
})
type FormData = z.infer<typeof schema>

interface Endereco {
  logradouro: string
  numero: string
  municipio: string
  uf: string
}

interface Museu {
  _id: string
  nome: string
  endereco: Endereco
}
interface Paginacao {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface RespostaMuseus {
  museus: Museu[]
  pagination: Paginacao
}

const fetchMuseus = async (
  search: string,
  page: number
): Promise<RespostaMuseus> => {
  const response = await request(
    `/api/admin/museus?semVinculoUsuario=true&search=${search}&page=${page}`
  )
  if (!response.ok) throw new Error("Erro ao carregar museus")

  const data = await response.json()

  return {
    museus: data.museus || [],
    pagination: data.pagination || {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 0
    }
  }
}

const CreateUser: React.FC = () => {
  const [selectedMuseus, setSelectedMuseus] = useState<string[]>([])
  const [selectedMuseusNames, setSelectedMuseusNames] = useState<Museu[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: museusData, isLoading } = useQuery<RespostaMuseus>({
    queryKey: ["museus", search, page],
    queryFn: () => fetchMuseus(search, page),
    enabled: !!search
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const museus = museusData?.museus || []

  const debounceSearch = debounce((value: string) => {
    setSearch(value)
    setPage(1)
  }, 500)

  useEffect(() => {
    if (selectedMuseus.length > 0) {
      const museusSelecionados = selectedMuseus
        .map((item) => {
          const [id] = item.split(",")
          return (
            museus.find((m) => m._id === id) ||
            selectedMuseusNames.find((m) => m._id === id)
          )
        })
        .filter((m) => m !== undefined) as Museu[]

      setSelectedMuseusNames(museusSelecionados)
    }
  }, [selectedMuseus, museus, selectedMuseusNames])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    trigger,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const registerWithMask = useHookFormMask(register)

  const navigate = useNavigate()

  const { mutateAsync } = useMutation({
    mutationFn: async ({
      email,
      nome,
      cpf,
      museus,
      file
    }: FormData & { museus: string[] }) => {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("nome", nome)
      formData.append("cpf", cpf)
      museus.forEach((museu) => {
        formData.append("museus", museu)
      })
      formData.append("arquivo", file!)

      const res = await request("/api/public/users/registro", {
        method: "POST",
        body: formData
      })

      return res.json()
    },
    onSuccess: () => {
      navigate("/login")
    }
  })

  const formData = watch()

  const { openModal, closeModal } = useModal((close) => (
    <Modal
      title="Confirmar Solicitação"
      showCloseButton
      onCloseButtonClick={close}
    >
      <Modal.Body>
        <div className="text-left">
          <p>Confira atentamente os dados que serão enviados:</p>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">CPF:</td>
                <td className="p-2">{formData.cpf}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">Nome:</td>
                <td className="p-2">{formData.nome}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-semibold bg-gray-100">E-mail:</td>
                <td className="p-2">{formData.email}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold bg-gray-100">Museus:</td>
                <td className="p-2">
                  {selectedMuseusNames.length > 0 ? (
                    <ul className="flex flex-wrap gap-2 list-disc pl-3">
                      {selectedMuseusNames.map((museu) => (
                        <li>
                          {museu.nome}
                          <br />
                          <span className="text-xs font-gray-500">
                            {museu.endereco.logradouro}, {museu.endereco.numero}{" "}
                            - {museu.endereco.municipio}/{museu.endereco.uf}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "Nenhum museu selecionado."
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-semibold bg-gray-100">Documento:</td>
                <td className="p-2">{formData.file?.name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer justify-content="end">
        <Button primary small m={2} onClick={() => handleSubmit(onSubmit)()}>
          Confirmar
        </Button>
        <Button secondary small m={2} onClick={close}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  ))

  const onSubmit = async (formData: FormData) => {
    closeModal()
    const museusIds = selectedMuseus.map((item) => item.split(",")[0])
    await toast.promise(
      mutateAsync({
        ...formData,
        museus: museusIds
      }),
      {
        loading: "Enviando solicitação",
        success: (data) => data.message,
        error: (error) => error.message
      }
    )
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <Link to={-1 as unknown as string} className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Solicitação de cadastro para novo usuário</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">Dados pessoais</legend>
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              <Input
                type="text"
                label={
                  <span>
                    CPF <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="000.000.000-00"
                error={errors.cpf}
                {...registerWithMask("cpf", ["999.999.999-99"])}
              />
              <Input
                type="text"
                label={
                  <span>
                    Nome <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite o nome do usuário"
                error={errors.nome}
                {...register("nome")}
                className="capitalize"
              />
              <Input
                type="email"
                label={
                  <span>
                    E-mail <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite o email do usuário"
                error={errors.email}
                {...register("email")}
              />
            </div>
          </fieldset>
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">
              Museus associados
            </legend>
            <div className="flex flex-col w-full items-center p-2">
              <div className="w-full">
                <Row>
                  <Col>
                    <Controller
                      control={control}
                      name="museus"
                      render={({ field }) => (
                        <>
                          <Select
                            type="multiple"
                            selectAllText={""}
                            label={
                              <span>
                                Nome <span className="text-red-500">*</span>
                              </span>
                            }
                            placeholder="Digite para buscar..."
                            options={
                              museus.length > 0
                                ? museus.map((m: Museu) => ({
                                    label: m.nome,
                                    value: `${m._id},${m.nome}`
                                  }))
                                : []
                            }
                            className="!w-full"
                            {...field}
                            value={selectedMuseus}
                            onInput={(e) => {
                              const inputValue = (e.target as HTMLInputElement)
                                .value
                              debounceSearch(inputValue)
                            }}
                            onChange={(value: unknown) => {
                              const selected = value as string[]
                              field.onChange(selected)

                              setSelectedMuseus((prev) => {
                                const newSelection = selected.filter(
                                  (s) => !prev.includes(s)
                                )
                                return [...prev, ...newSelection]
                              })

                              setSelectedMuseusNames((prev) => {
                                const newMuseus = selected
                                  .map((item) => {
                                    const [id] = item.split(",")
                                    return museus.find((m) => m._id === id)
                                  })
                                  .filter((m) => m !== undefined) as Museu[]

                                return [...prev, ...newMuseus]
                              })
                            }}
                          />
                          {isLoading && (
                            <p className="text-sm text-gray-500 mt-2">
                              Carregando museus...
                            </p>
                          )}
                        </>
                      )}
                    />
                  </Col>
                </Row>
              </div>

              <div className="mt-4 w-full grid">
                {selectedMuseusNames.length > 0 && (
                  <>
                    <p className="text-sm text-gray-500 mb-2">
                      {selectedMuseusNames.length} museu(s) selecionado(s):
                    </p>
                    <div className="flex flex-wrap gap-2 p-2">
                      {selectedMuseusNames.map((museu, index) => (
                        <Button
                          key={index}
                          className="gap-2 flex items-center justify-between p-4"
                          primary
                          inverted
                        >
                          <i
                            className="fa-solid fa-xmark ml-2 cursor-pointer pr-4"
                            onClick={() => {
                              setSelectedMuseus((prev) =>
                                prev.filter(
                                  (m) => m.split(",")[0] !== museu._id
                                )
                              )
                              setSelectedMuseusNames((prev) =>
                                prev.filter((m) => m._id !== museu._id)
                              )
                            }}
                          ></i>

                          <div className="flex flex-col">
                            <div className="text-left font-semibold">
                              {museu?.nome}
                            </div>
                            {museu && (
                              <div className="text-sm text-left text-gray-500">
                                {museu.endereco.logradouro},{" "}
                                {museu.endereco.numero} -{" "}
                                {museu.endereco.municipio}/{museu.endereco.uf}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">
              Documento comprobatório
            </legend>
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              <Controller
                control={control}
                name="file"
                render={({ field }) => (
                  <Upload
                    onChange={(files) => field.onChange(files[0])}
                    error={errors.file?.message}
                    accept=".pdf"
                  />
                )}
              />
            </div>
          </fieldset>
          <div className="flex justify-end space-x-4">
            <Link to="/login" className="br-button secondary">
              Voltar
            </Link>
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="button"
              onClick={async () => {
                if (await trigger(["cpf", "nome", "email", "museus", "file"])) {
                  openModal()
                }
              }}
              disabled={isSubmitting}
            >
              Solicitar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateUser
