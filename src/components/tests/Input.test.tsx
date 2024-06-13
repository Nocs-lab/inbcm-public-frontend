import { render, screen, fireEvent } from "@testing-library/react"
import { describe, test, expect } from "vitest"
import Input from "../Input"

describe("Input Component", () => {
  test("Renders with label", () => {
    render(<Input label="Username" name="username" />)
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument()
  })

  test("O campo de senha funciona corretamente", () => {
    render(<Input label="Password" type="password" name="password" />)
    const passwordInput = screen.getByLabelText(/Password/)
    expect(passwordInput).toHaveAttribute("type", "password")

    const toggleButton = screen.getByRole("switch")
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "text")

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  //TODO: Transferir para um componente exclusivo para upload de arquivos
  /*
  test("O campo de arquivo funciona corretamente", () => {
    render(<Input label="Upload File" type="file" name="file" />)
    const fileInput = screen.getByLabelText(/Upload File/)
    expect(fileInput).toHaveAttribute("type", "file")

    const file = new File(["a".repeat(1024)], "example.txt", {
      type: "text/plain"
    })
    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(screen.getAllByText("example.txt")).toHaveLength(2)
    expect(screen.getByText("1.00 KB")).toBeInTheDocument()
  })

  test("A remoção de arquivo funciona", () => {
    render(<Input label="Upload File" type="file" name="file" />)
    const fileInput = screen.getByLabelText(/Upload File/)
    const file = new File(["file content"], "example.txt", {
      type: "text/plain"
    })
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getAllByText("example.txt")).toHaveLength(2)

    const removeButton = screen.getByLabelText(/Remover example.txt/)
    fireEvent.click(removeButton)

    expect(screen.queryByText("example.txt")).not.toBeInTheDocument()
  })

  test("Mostra as mensagens de erro", () => {
    render(
      <Input
        label="Username"
        name="username"
        error={{ type: "required", message: "Required field" }}
      />
    )
    expect(screen.getByText("Required field")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
  */
})
