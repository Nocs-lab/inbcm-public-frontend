import DefaultLayout from "../layouts/default"
import Input from "../components/Input"
import { Button } from "react-dsgov"

export default function AutenticarPage() {
  return (
    <DefaultLayout>
      <h1>Autenticar recibo</h1>

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
    </DefaultLayout>
  )
}
