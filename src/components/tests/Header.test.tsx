import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import Header from "../Header"
import { vi, describe, test, expect } from "vitest"

const mockNavigate = vi.fn()
const mockSetUser = vi.fn()

vi.mock("../../utils/store", () => ({
  default: () => ({ setUser: mockSetUser, user: { name: "Test" } })
}))

vi.mock("react-router", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import("react-router")

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" })
  }
})

describe("Header", () => {
  test("Mostra o nome do usuário corretamente", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getByTestId("username")).toHaveTextContent("Test")
  })

  test("Consegue abrir e fechar o menu", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    const avatarButton = screen.getByTestId("avatar-dropdown-trigger")
    fireEvent.click(avatarButton)

    expect(screen.getByRole("menu")).toBeInTheDocument()

    fireEvent.click(avatarButton)

    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  test("O logout funciona corretamente", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    const avatarButton = screen.getByTestId("avatar-dropdown-trigger")
    fireEvent.click(avatarButton)

    const logoutButton = screen.getByText("Sair")
    fireEvent.click(logoutButton)

    expect(mockSetUser).toHaveBeenCalledWith(null)
    expect(mockNavigate).toHaveBeenCalledWith("/login")
  })
})
