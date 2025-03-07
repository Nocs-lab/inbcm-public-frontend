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
const schema = z.object({
  email: z.string().min(1, "Este campo é obrigatório").email("Email inválido"),
  nome: z.string().min(1, "Este campo é obrigatório")
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
      nome: user.nome
    }
  })

  // Função para enviar os dados atualizados
  const { mutate } = useMutation({
    mutationFn: async ({ email, nome }: FormData) => {
      const res = await request(`/api/admin/users/${user._id}`, {
        method: "PUT",
        data: { email, nome }
      })
      return res.json()
    },
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso")
      window.location.reload()
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil")
    }
  })

  const onSubmit = ({ email, nome }: FormData) => {
    mutate({ email, nome })
  }

  return (
    <>
      <h2>Perfil</h2>
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <div className="grid grid-cols-3 gap-2 w-full">
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
              <Input
                label="CPF"
                value={user.cpf || "Este usuário não possui CPF cadastrado."}
                rows={1}
                readOnly
                disabled
                className="text-gray-500 italic opacity-50"
              />
            </div>
          </div>
          <div className="br-table overflow-auto">
            <Table
              data={museus}
              columns={columns}
              showSearch={false}
              showSelectedBar={false}
              className="justify-center"
            />
          </div>
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
