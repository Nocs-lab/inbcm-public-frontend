import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import Input from "../components/Input"
import { Row, Col, Button } from "react-dsgov"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { Link } from "react-router-dom"
import request from "../utils/request"
import toast from "react-hot-toast"
import { debounce } from "lodash"
import Select from "../components/MultiSelect"

const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório"),
  nome: z.string().min(1, "Este campo é obrigatório"),
  cpf: z.string().min(1, "Este campo é obrigatório"),
  museus: z.array(z.string()).optional()
})
type FormData = z.infer<typeof schema>

interface Museu {
  _id: string
  nome: string
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
  const [selectedMuseusNames, setSelectedMuseusNames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: museusData } = useQuery<RespostaMuseus>({
    queryKey: ["museus", search, page],
    queryFn: () => fetchMuseus(search, page),
    enabled: !!search
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const museus = museusData?.museus || []

  const debounceSearch = debounce((value: string) => {
    console.log(value)
    setIsLoading(true)
    setSearch(value)
    setPage(1)
  }, 500)

  useEffect(() => {
    if (museus.length > 0) {
      setIsLoading(false)
    }
  }, [museus])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  })

  const navigate = useNavigate()

  const { mutate } = useMutation({
    mutationFn: async ({
      email,
      nome,
      cpf,
      museus
    }: FormData & { museus: string[] }) => {
      const res = await request("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nome,
          cpf,
          museus: museus
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erro ao criar usuário")
      }

      return res.json()
    },
    onSuccess: () => {
      navigate("/usuarios")
      toast.success("Usuário criado com sucesso")
    }
  })

  const onSubmit = ({ email, nome, cpf }: FormData) => {
    const museusIds = selectedMuseus.map((item) => item.split(",")[0])
    mutate({
      email,
      nome,
      cpf,
      museus: museusIds
    })
  }

  return (
    <>
      <div className="container mx-auto p-8">
        <Link to="/login" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Solicitação de cadastro para novo usuário</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="text-lg font-extrabold px-3 m-0">
              Dados pessoais
            </legend>
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
                {...register("cpf")}
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
            <legend className="text-lg font-extrabold px-3 m-0">
              Museus associados
            </legend>
            <div className="flex flex-col w-full items-center">
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
                            onChange={(selected: string[]) => {
                              field.onChange(selected)
                              const nomesMuseus = selected.map(
                                (item) => item.split(",")[1]
                              )
                              setSelectedMuseus(selected)
                              setSelectedMuseusNames(nomesMuseus)
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
                      {selectedMuseusNames.map((name, index) => (
                        <Button
                          key={index}
                          className="gap-2 flex items-center justify-between"
                          primary
                          inverted
                        >
                          <i
                            className="fa-solid fa-xmark ml-2 cursor-pointer"
                            onClick={() => {
                              const updatedMuseus = selectedMuseus.filter(
                                (_, i) => i !== index
                              )
                              const updatedNames = selectedMuseusNames.filter(
                                (_, i) => i !== index
                              )

                              setSelectedMuseus(updatedMuseus)
                              setSelectedMuseusNames(updatedNames)
                            }}
                          ></i>
                          {name}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </fieldset>
          <div className="flex justify-end space-x-4">
            <Link to="/login" className="br-button secondary">
              Voltar
            </Link>
            <button
              className={clsx("br-button primary", isSubmitting && "loading")}
              type="submit"
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
