import DefaultLayout from "../layouts/default"
import Input from "../components/Input"
import { Link } from "react-router-dom"
import Table from "../components/Table"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { useSuspenseQuery } from "@tanstack/react-query"
import request from "../utils/request"

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

  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Perfil</h2>
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <form className="space-y-6">
          <div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Input
                type="text"
                label="Nome"
                placeholder="Digite o nome"
                className="w-full"
                value={user.nome}
              />
              <Input
                type="email"
                label="Email"
                placeholder="Digite o email"
                className="w-full"
                value={user.email}
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
            <button className="br-button primary mt-5" type="submit">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  )
}

export default PerfilPage
