import Input from "../components/Input"
import { Link } from "react-router"
import Table from "../components/Table"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { useSuspenseQuery, useMutation } from "@tanstack/react-query"
import request from "../utils/request"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"

// Definindo o esquema de validação
const schema = z
  .object({
    email: z
      .string()
      .min(1, "Este campo é obrigatório")
      .email("E-mail inválido"),
    nome: z.string().min(1, "Este campo é obrigatório"),
    password: z.string().min(1, "Este campo é obrigatório"),
    newPassword: z.string().min(1, "Este campo é obrigatório"),
    confirmPassword: z.string().min(1, "Este campo é obrigatório")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"]
  })

type FormData = z.infer<typeof schema>

interface Museu {
  nome: string
  regiao: string
  uf: string
}

const PerfilPage = () => {
  const columnHelper = createColumnHelper<Museu>()

  const columns: ColumnDef<Museu>[] = [
    columnHelper.accessor("nome", {
      header: "Nome",
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor("regiao", {
      header: "Região",
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor("uf", {
      header: "UF",
      cell: (info) => info.getValue()
    })
  ]

  const { data: user } = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await request("/api/public/users")
      return response.json()
    }
  })

  const museus: Museu[] = user.museus.map((museu) => ({
    nome: museu.nome,
    regiao: museu.endereco.municipio,
    uf: museu.endereco.uf
  }))

  // Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: user.email,
      nome: user.nome,
      newPassword: "",
      password: ""
    }
  })

  // Função para enviar os dados atualizados
  const { mutate } = useMutation({
    mutationFn: async (updateData: {
      email: string
      nome: string
      senhaAtual: string
      senha: string
    }) => {
      console.log("Enviando dados:", updateData)
      const res = await request(`/api/admin/users/${user._id}`, {
        method: "PUT",
        data: updateData
      })
      return res.json()
    },
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!")
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    },
    onError: (error) => {
      console.error("Erro na mutation:", error)
      toast.error("Erro ao atualizar perfil")
    }
  })

  const onSubmit = (data: FormData) => {
    const updateData = {
      email: data.email,
      nome: data.nome,
      senhaAtual: data.password,
      senha: data.newPassword
    }

    mutate(updateData)
  }

  const formatCPF = (cpf: string): string => {
    cpf = cpf.replace(/\D/g, "")
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  return (
    <>
      <Link to={"/"} className="text-lg"></Link>
      <h2>Editar meu perfil</h2>
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="font-extrabold px-3 m-0">Dados pessoais</legend>
            <div>
              <div className="grid grid-cols-3 gap-2 w-full">
                <Input
                  label="CPF"
                  value={
                    user.cpf
                      ? formatCPF(user.cpf)
                      : "Este usuário não possui CPF cadastrado."
                  }
                  rows={1}
                  readOnly
                  disabled
                  className="text-gray-500 italic opacity-50"
                />
                <Input
                  type="text"
                  label="Nome"
                  placeholder="Digite o nome"
                  error={errors.nome}
                  {...register("nome")}
                  className="w-full"
                />
                <Input
                  type="email"
                  label="Email"
                  placeholder="Digite o email"
                  error={errors.email}
                  {...register("email")}
                  className="w-full"
                />
              </div>
            </div>
          </fieldset>

          <fieldset
            className="rounded-lg p-3"
            style={{ border: "2px solid #e0e0e0" }}
          >
            <legend className="text-lg font-extrabold px-3 m-0">
              Controle de acesso
            </legend>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Input
                type="password"
                label={
                  <span>
                    Senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha"
                error={errors.password}
                {...register("password")}
              />
              <Input
                type="password"
                label={
                  <span>
                    Senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha"
                error={errors.newPassword}
                {...register("newPassword")}
              />
              <Input
                type="password"
                label={
                  <span>
                    Confirmar senha <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Digite sua senha novamente"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
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
            <div className="br-table overflow-auto">
              <Table
                data={museus}
                columns={columns}
                showSearch={false}
                showSelectedBar={false}
                className="justify-center"
              />
            </div>
          </fieldset>

          <div className="flex space-x-4 justify-end">
            <Link to="/" className="br-button secondary mt-5">
              Voltar
            </Link>
            <button
              className={`br-button primary mt-5 ${isSubmitting && "loading"}`}
              type="submit"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default PerfilPage
