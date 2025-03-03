import DefaultLayout from "../../layouts/default"
import { Chart } from "react-google-charts"
import { Select } from "react-dsgov"
import { useState, useEffect, SetStateAction } from "react"
import { useQuery, useSuspenseQueries } from "@tanstack/react-query"
import request from "../../utils/request"
import { Link } from "react-router-dom"

export default function Dashboard() {
  const [museu, setMuseu] = useState("")

  const [{ data: museus }, { data: anos }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["museus"],
        queryFn: async () => {
          const res = await request("/api/public/museus")
          return await res.json()
        }
      },
      {
        queryKey: ["anos"],
        queryFn: async () => {
          const res = await request("/api/public/periodos")
          return await res.json()
        }
      }
    ]
  })

  const currentYear = new Date().getFullYear()
  const ano = anos.find((ano: { ano: number }) => ano.ano === currentYear)

  const [anoInicio, setAnoInicio] = useState(ano.ano.toString())
  const [anoFim, setAnoFim] = useState(ano.ano.toString())

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

  const handleMuseuChange = (value: SetStateAction<string>) => setMuseu(value)
  const handleAnoInicioChange = (value: SetStateAction<string>) =>
    setAnoInicio(value)
  const handleAnoFimChange = (value: SetStateAction<string>) => setAnoFim(value)

  return (
    <DefaultLayout>
      <Link to="/" className="text-lg">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Voltar
      </Link>
      <h2>Painel analítico</h2>

      <div className="flex items-center justify-center p-3 gap-16">
        <Select
          id="select-simples"
          label="Museu"
          className="!w-full"
          options={
            museus?.map((museu: { nome: string; _id: string }) => ({
              label: museu.nome,
              value: museu._id
            })) ?? []
          }
          value={museu}
          onChange={handleMuseuChange}
        />
        <Select
          label="Início"
          className="!w-full"
          options={anos.map(({ ano }: { ano: number }) => ({
            label: ano.toString(),
            value: ano.toString()
          }))}
          value={anoInicio}
          onChange={handleAnoInicioChange}
        />
        <Select
          label="Fim"
          className="!w-full"
          options={anos.map(({ ano }: { ano: number }) => ({
            label: ano.toString(),
            value: ano.toString()
          }))}
          value={anoFim}
          onChange={handleAnoFimChange}
        />
      </div>
      {isLoadingGrafico ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>Não há dados a serem exibidos com os filtros informados.</p>
      ) : (
        <Chart
          chartType="ColumnChart"
          data={[
            [
              "Ano",
              "Museológico",
              { role: "annotation" },
              "Arquivístico",
              { role: "annotation" },
              "Bibliográfico",
              { role: "annotation" }
            ],
            ...(dadosGrafico?.data?.map(
              (item: {
                ano: number
                totalMuseologico: number
                totalArquivistico: number
                totalBibliografico: number
              }) => [
                item.ano.toString(),
                item.totalMuseologico,
                item.totalMuseologico > 0
                  ? item.totalMuseologico.toString()
                  : "", // Anotação para Museológico
                item.totalArquivistico,
                item.totalArquivistico > 0
                  ? item.totalArquivistico.toString()
                  : "",
                item.totalBibliografico,
                item.totalBibliografico > 0
                  ? item.totalBibliografico.toString()
                  : ""
              ]
            ) ?? [])
          ]}
          width="100%"
          height="400px"
          legendToggle
          options={{
            hAxis: {
              titleTextStyle: { color: "#607d8b" },
              gridlines: { count: 0 },
              textStyle: {
                color: "#78909c",
                fontName: "Roboto",
                fontSize: "15",
                bold: true
              }
            },
            vAxis: {
              minValue: 0,
              gridlines: { color: "#cfd8dc", count: 4 },
              baselineColor: "transparent"
            },
            legend: {
              position: "bottom",
              alignment: "center",
              textStyle: {
                color: "#607d8b",
                fontName: "Roboto",
                fontSize: "15"
              }
            },
            annotations: {
              alwaysOutside: true,
              textStyle: {
                fontSize: 12,
                bold: true,
                color: "#000"
              }
            },
            colors: ["#3f51b5", "#2196f3", "#33F8FF"],
            chartArea: {
              backgroundColor: "transparent",
              width: "100%",
              height: "80%"
            },
            bar: { groupWidth: "100" },
            focusTarget: "category",
            backgroundColor: "transparent"
          }}
        />
      )}
    </DefaultLayout>
  )
}
