export default function usePaths() {
  const pathList = [
    { path: "/", name: "Inicio" },
    { path: "/declaracoes/novo", name: "Nova declaração" },
    { path: "/declaracoes", name: "Minhas declarações" }
  ]
  const pathMap: { [key: string]: string } = {}

  pathList.forEach((item) => {
    pathMap[item.path] = item.name
  })

  return { pathMap, pathList }
}
