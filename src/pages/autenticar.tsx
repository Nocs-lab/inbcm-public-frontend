import Header from "../components/HeaderAutenticar"
import Footer from "../components/Footer"
import Input from "../components/Input"
import { Link } from "react-router-dom"
import { Button } from "react-dsgov"
import { useState } from "react"
import useHttpClient from "../utils/request"
import { useMutation } from "@tanstack/react-query"

export default function AutenticarPage() {
  const [hashDeclaracao, setHashDeclaracao] = useState("")
  const [validationResult, setValidationResult] = useState<{
    mensagem: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const request = useHttpClient()

  const { mutateAsync: handleValidate } = useMutation({
    mutationFn: async (data: unknown) => {
      const response = await request(
        "/api/public/recibo/validar",
        {
          method: "POST",
          data
        },
        false
      )
      return response.json()
    },
    onSuccess: (data: { mensagem: string }) => {
      setValidationResult(data)
      setMessage(data.mensagem)
      setError(null)
    },
    onError: () => {
      setValidationResult(null)
      setError("Declaração não encontrada.")
    }
  })

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
        {validationResult && message && !error && (
          <div className="mt-6 p-4 border rounded-lg bg-blue-100 text-blue-800 flex items-center space-x-4">
            <i className="fas fa-check-circle text-2xl"></i>
            <div>
              <p>{message}</p>
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="mt-6 p-4 border rounded-lg bg-red-100 text-red-800 flex items-center space-x-4">
            <i className="fas fa-exclamation-circle text-2xl"></i>
            <p>{error}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
