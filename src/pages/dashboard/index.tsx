import DefaultLayout from "../../layouts/default"
import { Chart } from "react-google-charts"
import { Select } from "react-dsgov"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import request from "../../utils/request"

export default function Dashboard() {
  const [museu, setMuseu] = useState("")
  const [anoInicio, setAnoInicio] = useState("2024")
  const [anoFim, setAnoFim] = useState("2024")

  const { data: museus, isLoading: isLoadingMuseus } = useQuery({
    queryKey: ["museus"],
    queryFn: async () => {
      const res = await request("/api/public/museus")
      return await res.json()
    }
  })

  const {
    data: dadosGrafico,
    isLoading: isLoadingGrafico,
    error
  } = useQuery({
    queryKey: ["dadosGrafico", museu, anoInicio, anoFim],
    queryFn: async () => {
      if (!museu) return []
      const res = await request(
        `/api/public/declaracoes/${museu}/itens/${anoInicio}/${anoFim}`
      )
      return await res.json()
    },
    enabled: !!museu && !!anoInicio && !!anoFim
  })

  useEffect(() => {
    if (museus && museus.length > 0) {
      setMuseu(museus[0]._id)
    }
  }, [museus])

  const handleMuseuChange = (value) => setMuseu(value)
  const handleAnoInicioChange = (value) => setAnoInicio(value)
  const handleAnoFimChange = (value) => setAnoFim(value)

  return (
    <DefaultLayout>
      <h1>Painel para acompanhamento de itens no acervo</h1>

      <div className="flex items-center justify-center p-3 gap-16">
        <Select
          id="select-simples"
          label="Museu"
          className="!w-full"
          options={
            museus?.map((museu) => ({
              label: museu.nome,
              value: museu._id
            })) ?? []
          }
          value={museu}
          onChange={handleMuseuChange}
          disabled={isLoadingMuseus}
        />
        <Select
          label="Início"
          className="!w-full"
          options={[
            { label: "2024", value: "2024" },
            { label: "2023", value: "2023" },
            { label: "2022", value: "2022" },
            { label: "2021", value: "2021" }
          ]}
          value={anoInicio}
          onChange={handleAnoInicioChange}
        />
        <Select
          label="Fim"
          className="!w-full"
          options={[
            { label: "2024", value: "2024" },
            { label: "2023", value: "2023" },
            { label: "2022", value: "2022" },
            { label: "2021", value: "2021" }
          ]}
          value={anoFim}
          onChange={handleAnoFimChange}
        />
      </div>
      {isLoadingGrafico ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>Erro ao carregar os dados do gráfico.</p>
      ) : (
        <Chart
          chartType="ColumnChart"
          data={[
            ["Ano", "Museológico", "Arquivístico", "Bibliográfico"],
            ...(dadosGrafico?.map((item) => [
              item.anoDeclaracao,
              item.totalMuseologico,
              item.totalArquivistico,
              item.totalBibliografico
            ]) ?? [])
          ]}
          width="100%"
          height="350px"
          legendToggle
          options={{
            legend: {
              position: "bottom",
              alignment: "center",
              textStyle: { fontSize: "22" }
            },
            colors: [
              "#3f51b5",
              "#2196f3",
              "#03a9f4",
              "#00bcd4",
              "#009688",
              "#4caf50",
              "#8bc34a",
              "#cddc39"
            ]
          }}
        />
      )}
    </DefaultLayout>
  )
}
