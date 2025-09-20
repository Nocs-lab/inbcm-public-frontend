import { createBrowserRouter } from "react-router"
import routes from "~react-pages"
import DefaultLayout from "../layouts/default"

const loginRoute = routes.find((route) => route.path === "login")!
const solicitarAcessoRoute = routes.find(
  (route) => route.path === "solicitarAcesso"
)!
const solicitarSenhaRoute = routes.find(
  (route) => route.path === "solicitarSenha"
)!
const resetarSenhaRoute = routes.find((route) => route.path === "resetarSenha")!

const autenticarRoute = routes.find((route) => route.path === "autenticar")!
routes.splice(routes.indexOf(loginRoute), 1)
routes.splice(routes.indexOf(solicitarAcessoRoute), 1)
routes.splice(routes.indexOf(autenticarRoute), 1)
routes.splice(routes.indexOf(solicitarSenhaRoute), 1)
routes.splice(routes.indexOf(resetarSenhaRoute), 1)

const router = createBrowserRouter([
  { children: routes, element: <DefaultLayout /> },
  loginRoute,
  solicitarAcessoRoute,
  autenticarRoute,
  solicitarSenhaRoute,
  resetarSenhaRoute
])

export default router
