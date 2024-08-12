import { render, screen, fireEvent } from "@testing-library/react"
import { describe, test, expect } from "vitest"
import Select from "../Select"

describe("Select Component", () => {
  const options = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" }
  ]

  test("Renderiza as opções corretamente", () => {
    render(<Select label="Select an option" name="select" options={options} />)

    expect(screen.getByText(/Select an option/)).toBeInTheDocument()
    options.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  test("Abre e fecha corretamente", () => {
    render(<Select label="Select an option" name="select" options={options} />)

    const combobox = screen.getByRole("combobox")
    fireEvent.click(combobox)
    expect(combobox.getAttribute("aria-expanded")).toBe("true")

    fireEvent.click(combobox)
    expect(combobox.getAttribute("aria-expanded")).toBe("false")
  })

  test("Seleciona uma opção", () => {
    render(<Select label="Select an option" name="select" options={options} />)

    const combobox = screen.getByRole("combobox")
    fireEvent.click(combobox)

    const option = screen.getByText("Option 2")
    fireEvent.click(option)

    expect(screen.getByDisplayValue("2")).toBeInTheDocument()
  })

  test("Mostra mensagem de erro", () => {
    render(
      <Select
        label="Select an option"
        name="select"
        options={options}
        error={{ type: "required", message: "Required field" }}
      />
    )

    expect(screen.getByText("Required field")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
