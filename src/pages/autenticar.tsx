import Header from "../components/HeaderAutenticar"
import Footer from "../components/Footer"
import Input from "../components/Input"
import { Link } from "react-router-dom"
import { Button } from "react-dsgov"

export default function AutenticarPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <Link to="/" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2>Autenticar recibo</h2>

        <div className="space-y-4">
          <div className="w-1/3">
            <Input
              type="date"
              label="Data do recibo"
              placeholder="Escolha a data do recibo"
              value={""}
            />
          </div>
          <Input
            type="text"
            label="Numeração do recibo"
            placeholder="Digite a numeração do recibo"
            value={""}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button primary onClick={() => console.log("Verificar")}>
            Verificar
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
