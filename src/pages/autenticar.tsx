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
        <h2>Validar recibo</h2>

        <div className="space-y-4">
          <Input
            type="text"
            label="Numeração do recibo"
            placeholder="Digite a numeração do recibo"
            value={""}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button primary>Verificar</Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
