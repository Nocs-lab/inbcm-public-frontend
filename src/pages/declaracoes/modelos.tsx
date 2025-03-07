import { useState } from "react"
import clsx from "clsx"

export default function ModelosDeclaracaoPage() {
  const [currentTab, setCurrentTab] = useState<
    "museologico" | "bibliografico" | "arquivistico"
  >("museologico")

  return (
    <>
      <h2 className="mt-3 mb-0">Download dos modelos de planilhas</h2>
      <div className="br-tab mt-10" data-counter="true">
        <nav className="tab-nav">
          <ul>
            <li
              className={clsx(
                "tab-item",
                currentTab === "museologico" && "is-active"
              )}
              title="Acervo museológico"
            >
              <button
                type="button"
                onClick={() => setCurrentTab("museologico")}
              >
                <span className="name">Acervo museológico</span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                currentTab === "bibliografico" && "is-active"
              )}
              title="Acervo bibliográfico"
            >
              <button
                type="button"
                onClick={() => setCurrentTab("bibliografico")}
              >
                <span className="name">Acervo bibliográfico</span>
              </button>
            </li>
            <li
              className={clsx(
                "tab-item",
                currentTab === "arquivistico" && "is-active"
              )}
              title="Arcevo arquivístico"
            >
              <button
                type="button"
                onClick={() => setCurrentTab("arquivistico")}
              >
                <span className="name">Acervo arquivístico</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="tab-content">
          <div
            className={clsx(
              "tab-panel",
              currentTab === "museologico" && "active"
            )}
          >
            <div className="flex items-center justify-end">
              <a href="/INBCM_Museologia.xlsx" className="mb-2">
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                modelo de planilha museológico
              </a>
            </div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Metadado</th>
                  <th scope="col">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Nº de Registro <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do registro individual definido pelo
                    museu para identificação e controle do objeto dentro do
                    acervo.
                  </td>
                </tr>
                <tr>
                  <td>Outros números</td>
                  <td>
                    Informação facultativa de numerações anteriores atribuídas
                    ao objeto, tais como números antigos e números patrimoniais.
                  </td>
                </tr>
                <tr>
                  <td>
                    Situação <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória da situação em que se encontra o
                    objeto, o seu status dentro do acervo do museu, com a
                    marcação das seguintes opções: a) localizado, b) não
                    localizado, c) excluído.
                  </td>
                </tr>
                <tr>
                  <td>
                    Denominação <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do nome que identifica o objeto.
                  </td>
                </tr>
                <tr>
                  <td>Título</td>
                  <td>
                    Informação facultativa da denominação dada ao objeto
                    atribuído pelo autor, curador ou pelo profissional da
                    documentação.
                  </td>
                </tr>
                <tr>
                  <td>
                    Autor <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do nome do autor do objeto
                    (individual ou coletivo).
                  </td>
                </tr>
                <tr>
                  <td>Classificação</td>
                  <td>
                    Informação facultativa da classificação do objeto segundo o
                    "Thesaurus” para Acervos Museológicos ou outros vocabulários
                    controlados.
                  </td>
                </tr>
                <tr>
                  <td>
                    Resumo Descritivo <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do resumo da descrição textual do
                    objeto, apresentando as características que o identifique
                    inequivocamente e sua função original.
                  </td>
                </tr>
                <tr>
                  <td>
                    Dimensões <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória das dimensões físicas do objeto,
                    considerando-se as medidas bidimensionais (altura x
                    largura), tridimensionais (altura x largura x profundidade),
                    circulares (diâmetro x espessura) e peso.
                  </td>
                </tr>
                <tr>
                  <td>
                    Material/técnica <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória dos materiais do suporte que compõem
                    o objeto, hierarquizando sempre a sua maior área
                    confeccionada/manufaturada e a técnica empregada na sua
                    manufatura.
                  </td>
                </tr>
                <tr>
                  <td>
                    Estado de Conservação{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do estado de conservação em que se
                    encontra o objeto, na data da inserção das informações.
                  </td>
                </tr>
                <tr>
                  <td>Local de Produção</td>
                  <td>
                    Informação facultativa da indicação geográfica do local onde
                    o objeto foi confeccionado.
                  </td>
                </tr>
                <tr>
                  <td>Data de Produção</td>
                  <td>
                    Informação facultativa da data ou período de
                    confecção/produção/manufatura do objeto.
                  </td>
                </tr>
                <tr>
                  <td>
                    Condições de Reprodução{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória com a descrição das condições de
                    reprodução do objeto, indicando se há alguma restrição que
                    possa impedir a reprodução/divulgação da imagem do objeto
                    nos meios ou ferramentas de divulgação.
                  </td>
                </tr>
                <tr>
                  <td>Mídias Relacionadas</td>
                  <td>
                    Informação facultativa acerca da inserção de arquivos de
                    imagem, sons, vídeos e/ou textuais relacionados ao objeto
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            className={clsx(
              "tab-panel",
              currentTab === "bibliografico" && "active"
            )}
          >
            <div className="flex items-center justify-end">
              <a href="/INBCM_Biblioteconomia.xlsx" className="mb-2">
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                modelo de planilha bibliográfico
              </a>
            </div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Metadado</th>
                  <th scope="col">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Nº de Registro <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do registro individual definido pela
                    biblioteca do museu para identificação e controle do
                    exemplar dentro do acervo.
                  </td>
                </tr>
                <tr>
                  <td>Outros números</td>
                  <td>
                    Informação facultativa da numeração anterior atribuída ao
                    objeto, tais como números antigos e números patrimoniais.
                  </td>
                </tr>
                <tr>
                  <td>
                    Situação <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória da situação em que se encontra o
                    objeto, ou seja, seu status dentro do acervo da biblioteca
                    do museu com a marcação das seguintes opções: a) localizado;
                    b) não localizado; c) excluído;
                  </td>
                </tr>
                <tr>
                  <td>
                    Título <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do título principal, do subtítulo, da
                    série ou da coleção e da edição para os casos que houver.
                  </td>
                </tr>
                <tr>
                  <td>
                    Tipo <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória da Designação Geral do Material (DGM)
                    com as informações a cerca da classe geral do material que
                    pertence o objeto (mapa, livro, periódico e outros).
                  </td>
                </tr>
                <tr>
                  <td>
                    Identificação de responsabilidade{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória de todos os responsáveis pela obra,
                    tais como: autor, ilustrador, entidade responsável, editor e
                    outros.
                  </td>
                </tr>
                <tr>
                  <td>
                    Local de produção <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória da indicação geográfica do local onde
                    a obra foi publicada.
                  </td>
                </tr>
                <tr>
                  <td>
                    Editora <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do nome da editora ou distribuidora
                    da obra.
                  </td>
                </tr>
                <tr>
                  <td>Local de produção</td>
                  <td>
                    Informação facultativa da indicação geográfica do local onde
                    o objeto foi confeccionado.
                  </td>
                </tr>
                <tr>
                  <td>
                    Data de produção <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória da data de publicação da edição.
                  </td>
                </tr>
                <tr>
                  <td>
                    Dimensão física <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do tamanho do objeto e da extensão do
                    item de acordo com a terminologia sugerida no próprio
                    objeto, em números arábicos correspondentes ao número das
                    partes físicas tais como: páginas, folhas, lâminas,
                    cadernos.
                  </td>
                </tr>
                <tr>
                  <td>
                    Material / técnica <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória das características físicas do
                    objeto, como materiais do suporte no qual é constituído,
                    presença de ilustrações e materiais adicionais.
                  </td>
                </tr>
                <tr>
                  <td>
                    Encadernação <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória das características físicas da
                    encadernação referentes às obras raras.
                  </td>
                </tr>
                <tr>
                  <td>
                    Resumo descritivo <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória da descrição textual do objeto
                    apresentando as características que o identifique,
                    inequivocamente, assim como sua função original.
                  </td>
                </tr>
                <tr>
                  <td>
                    Estado de conservação{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do estado de conservação em que se
                    encontra o objeto na data da inserção das informações.
                  </td>
                </tr>
                <tr>
                  <td>
                    Assunto principal <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória dos termos que indicam os assuntos
                    principais tratados pelo objeto.
                  </td>
                </tr>
                <tr>
                  <td>Assunto cronológico</td>
                  <td>
                    Informação facultativa dos termos que indicam o período
                    tratado pela obra, caso haja.
                  </td>
                </tr>
                <tr>
                  <td>Assunto geográfico</td>
                  <td>
                    Informação facultativa dos termos que indicam a área
                    geográfica tratada pela obra, caso haja.
                  </td>
                </tr>
                <tr>
                  <td>
                    Condições de reprodução{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória das condições de reprodução do bem
                    cultural, informação se há alguma restrição que possa
                    impedir a reprodução/divulgação da imagem do bem em meios ou
                    ferramentas de divulgação.
                  </td>
                </tr>
                <tr>
                  <td>Mídias relacionadas</td>
                  <td>
                    Informação facultativa acerca da inserção de arquivos de
                    imagem, sons, vídeos e/ou textuais relacionados ao objeto.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            className={clsx(
              "tab-panel",
              currentTab === "arquivistico" && "active"
            )}
          >
            <div className="flex items-center justify-end">
              <a href="/INBCM_Arquivologia.xlsx" className="mb-2">
                <i className="fas fa-download" aria-hidden="true"></i> Baixar
                modelo de planilha arquivístico
              </a>
            </div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Metadado</th>
                  <th scope="col">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Código de referência <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória de identificação da unidade de
                    descrição a ser empreendida utilizando-se padrão do Código
                    de Entidade Custodiadora de Acervos Arquivísticos (CODEARQ)
                  </td>
                </tr>
                <tr>
                  <td>
                    Título <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória que identifica nominalmente a unidade
                    de descrição, devendo ser registrado o título original. No
                    nível de descrição 0 (acervo da entidade custodiadora)
                    deverá ser registrado como título o nome da entidade e, no
                    nível de descrição 1 (fundo) o título deverá representar o
                    produtor. No caso de uma coleção, o título deverá
                    representar o colecionador ou o tema da coleção
                  </td>
                </tr>
                <tr>
                  <td>
                    Data <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória da(s) data(s) de produção da unidade
                    de descrição. Opcionalmente, registre outras datas crônicas
                    pertinentes, como data(s) de acumulação ou data(s)-assunto.
                    Caso seja relevante, poderá ser registrado também a(s)
                    data(s) tópica(s) de produção da unidade de descrição.
                    Pode-se, neste elemento, trabalhar com períodos, ou seja,
                    datas-limite
                  </td>
                </tr>
                <tr>
                  <td>
                    Nível de descrição <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do nível da unidade de descrição em
                    relação às demais, com as seguintes definições: nível 0 =
                    acervo da entidade custodiadora e nível 1 = fundo ou coleção
                  </td>
                </tr>
                <tr>
                  <td>
                    Dimensão e suporte <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória das dimensões físicas ou lógicas e o
                    suporte da unidade de descrição. As dimensões tornam-se mais
                    precisas quando associadas a informações relativas ao
                    gênero, espécie ou tipo de documentos. O registro das
                    dimensões deve ser feito por gênero documental, variando
                    conforme o nível de descrição. São considerados os seguintes
                    gêneros documentais: bibliográfico, cartográfico,
                    eletrônico, filmográfico, iconográfico, micrográfico,
                    sonoro, textual, tridimensional. Em caso de acervo
                    predominantemente textual e na ausência de informação
                    discriminada dos demais gêneros que compõem o acervo, deverá
                    indicar as dimensões em metros lineares
                  </td>
                </tr>
                <tr>
                  <td>
                    Nome do produtor <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória do(s) produtor(es) da unidade de
                    descrição. Registrar a(s) forma(s) normalizada(s) do(s)
                    nome(s) da(s) entidade(s) produtora(s) da unidade de
                    descrição. O produtor é a entidade singular ou coletiva
                    responsável, em última instância, pela acumulação do acervo.
                    Ao longo do seu tempo de atividade, o produtor, seja uma
                    entidade coletiva, pessoa ou família, pode ter seu nome
                    modificado. O produtor e autor devem ser considerados
                    figuras distintas, conforme prescrito pela Norma
                    Internacional de Registro de autoridade arquivística para
                    entidades coletivas, pessoas e famílias (ISAAR - CPF),
                    estabelecendo as relações pertinentes com este elemento de
                    descrição
                  </td>
                </tr>
                <tr>
                  <td>História administrativa / biografia</td>
                  <td>
                    Informação facultativa de referenciais sistematizadas da
                    trajetória do(s) produtor(es), da sua criação ou nascimento
                    até a sua extinção ou falecimento. Registrar, de maneira
                    concisa, informações relacionadas à história da entidade
                    coletiva, família ou pessoa produtora da unidade de
                    descrição
                  </td>
                </tr>
                <tr>
                  <td>História arquivística</td>
                  <td>
                    Informação facultativa de referenciais sistematizados sobre
                    a história da produção e acumulação da unidade de descrição,
                    bem como sobre a sua custódia. Informar também sobre
                    extravios, sinistros e ocorrências similares de que se tenha
                    notícia, se possível com datas precisas e outras referências
                  </td>
                </tr>
                <tr>
                  <td>Procedência</td>
                  <td>
                    Informação facultativa para identificar a origem imediata de
                    aquisição ou transferência da unidade de descrição.
                    Registrar o nome da entidade que encaminhou, a forma e data
                    de aquisição, podendo também incluir outras referências
                    pertinentes
                  </td>
                </tr>
                <tr>
                  <td>Âmbito e conteúdo</td>
                  <td>
                    Informações facultativas relevantes ou complementares, ao
                    Título (b) da unidade de descrição. Informar, de acordo com
                    o nível, o âmbito (contexto histórico e geográfico) e o
                    conteúdo (tipologia documental, assunto e estrutura da
                    informação) da unidade de descrição
                  </td>
                </tr>
                <tr>
                  <td>Sistema de arranjo</td>
                  <td>
                    Informação facultativa sobre a estrutura interna, ordem e/ou
                    sistema de arranjo da unidade de descrição. Informar sobre a
                    organização da unidade de descrição, especialmente quanto ao
                    estágio de tratamento técnico. Os estágios de tratamento
                    mais usuais são: identificado, organizado e descrito,
                    parcial ou totalmente
                  </td>
                </tr>
                <tr>
                  <td>
                    Condições de reprodução{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td>
                    Informação obrigatória das condições de reprodução do bem
                    cultural. Registra se há alguma restrição, a exemplo das
                    leis, que possam impedir a reprodução/divulgação da imagem
                    do bem em meios ou ferramentas de divulgação
                  </td>
                </tr>
                <tr>
                  <td>Existência e localização dos originais</td>
                  <td>
                    Informação facultativa acerca da existência e a localização,
                    ou inexistência, dos originais de uma unidade de descrição
                    constituída por cópias, bem como registrar quaisquer números
                    de controle significativos, se o original pertencer à
                    entidade custodiadora ou a outra entidade. No caso dos
                    originais não existirem ou ser desconhecida a sua
                    localização, registre essa informação
                  </td>
                </tr>
                <tr>
                  <td>Notas sobre conservação</td>
                  <td>
                    Informação facultativa sobre o estado de conservação em que
                    se encontra o fundo ou coleção na data da inserção das
                    informações
                  </td>
                </tr>
                <tr>
                  <td>Pontos de acesso e indexação de assuntos</td>
                  <td>
                    Informação facultativa dos procedimentos para recuperação do
                    conteúdo de determinados elementos de descrição, por meio da
                    geração e elaboração de índices baseados em entradas
                    autorizadas e no controle do vocabulário
                  </td>
                </tr>
                <tr>
                  <td>Mídias relacionadas</td>
                  <td>
                    Informação facultativa acerca da inserção de arquivos de
                    imagem, sons, vídeos e/ou textuais relacionados ao objeto
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
