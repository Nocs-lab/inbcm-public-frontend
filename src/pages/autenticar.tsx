import Header from "../components/HeaderAutenticar"
import Footer from "../components/Footer"
import Input from "../components/Input"
import { Link } from "react-router"
import { Button } from "react-dsgov"
import { useState } from "react"
import request from "../utils/request"

export default function AutenticarPage() {
  const [hashDeclaracao, setHashDeclaracao] = useState("")
  const [validationResult, setValidationResult] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const [menssage, setMenssage] = useState(null)

  const handleValidate = async () => {
    try {
      const response = await request(
        `/api/public/recibo/validar/${hashDeclaracao}`
      )
      const result = await response.json()
      setValidationResult(result)
      setMenssage(result.mensagem)
      setError(null)
    } catch (err) {
      setValidationResult(null)
      setError("Declaração não encontrada.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto p-6 bg-white rounded-lg">
        <Link to="/login" className="text-lg">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </Link>
        <h2 className="text-2xl font-bold mb-4">
          Verificação de autenticidade do recibo
        </h2>

        <div className="space-y-4">
          <Input
            type="text"
            label="Numeração do recibo"
            placeholder="Digite a numeração do recibo"
            value={hashDeclaracao}
            onChange={(e) => setHashDeclaracao(e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button primary onClick={handleValidate}>
            Verificar
          </Button>
        </div>

        {/* Mensagem de sucesso */}
        {validationResult && menssage && !error && (
          <div className="mt-6 p-4 border rounded-lg bg-green-100 text-green-800 flex items-center space-x-4">
            <i className="fas fa-check-circle text-2xl flex-shrink-0"></i>
            <div>
              <p className="m-0 leading-relaxed">{menssage}</p>
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="mt-6 p-4 border rounded-lg bg-red-100 text-red-800 flex items-center space-x-4">
            <i className="fas fa-exclamation-circle text-2xl flex-shrink-0"></i>
            <div>
              <p className="m-0 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
