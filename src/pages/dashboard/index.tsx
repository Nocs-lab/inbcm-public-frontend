/* eslint-disable prettier/prettier */
import DefaultLayout from '../../layouts/default';
import { Chart } from "react-google-charts";
import { Select } from "react-dsgov"

export default function Dashboard() {

  return (
    <DefaultLayout>
      <h1>Painel para acompanhamento de itens no acervo</h1>

        <div className="flex items-center justify-center p-3 gap-16">
          <Select
              id="select-simples"
              label="Museu"
              className="!w-full"
              options={[
                { label: "Museu X", value: "2024" },
                { label: "Museu Y", value: "2023" },
                { label: "Museu Z", value: "2022" },
              ]}        
          />
          <Select
            label="Início"
            className="!w-full"
            options={[
              { label: "2024", value: "2024" },
              { label: "2023", value: "2023" },
              { label: "2022", value: "2022" },
              { label: "2021", value: "2021" },
            ]}        
          />
          <Select
            label="Fim"
            className="!w-full"
            options={[
              { label: "2024", value: "2024" },
              { label: "2023", value: "2023" },
              { label: "2022", value: "2022" },
              { label: "2021", value: "2021" },
            ]}        
          />
        </div>
      <Chart
        chartType="ColumnChart"
        data={[
          ["Ano", "Museológico", "Arquivístico", "Bibliográfico"],
          ["2021", 1000, 400, 200],
          ["2022", 1170, 460, 250],
          ["2023", 660, 1120, 300],
          ["2024", 1030, 540, 350],

        ]}
        width="100%"
        height="400px"
        legendToggle
        options={{
          legend: {position: 'bottom', alignment: 'center', textStyle: {color:'#607d8b', fontName: 'Roboto', fontSize: '22'} },
          colors: ["#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39"],
        }}
      />
    </DefaultLayout>
  )
}
