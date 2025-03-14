import "@govbr-ds/core/dist/components/select/select.min.css"

import classNames, { clsx } from "clsx"
import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import IMtProps from "./IMtProps"
import { useSpreadProps } from "./Util/useSpreadProps"
import { useMtProps } from "./Util/useMtProps"
import List, { ListRef } from "./List"
import Item from "./Item"
import Radio from "./Radio"
import Checkbox from "./Checkbox"
import useOutsideClick from "./Util/useOutsideClick"
import useCommonProperties from "./Util/useCommonProperties"
import useUniqueId from "./Util/useUniqueId"

export interface SelectOptions {
  label: string
  value: string | number
}

interface SelectProps
  extends React.HTMLAttributes<HTMLSelectElement>,
    IMtProps {
  /** Label do Select. */
  label?: React.ReactNode
  /** ID do Select. */
  id?: string
  /** Valor do select. Pode ser um valor único ou um array, se for select múltiplo. */
  value?: string | string[] | number | number[]
  /** Options do select. */
  options: SelectOptions[]
  /** Função para detectar mudança de valor. O parâmetro não é um evento, e, sim, o valor em si. */
  onChange?: (value: unknown) => void
  /** Se é simples ou múltiple.
   *
   * - single: simples.
   * - multiple: múltiplo.
   */
  type?: "single" | "multiple"
  /** Se existe opção de selecionar todos, se o type="multiple". */
  selectAllText?: string
  /** Se está desabilitado. */
  disabled?: boolean
  /** Placeholder do select. */
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      children,
      id,
      label,
      options,
      value,
      onChange = () => {
        /* */
      },
      placeholder,
      type = "single",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const fid = useUniqueId(id, "select_____")
    const mtProps = useMtProps(props)
    const spreadProps = useSpreadProps(props)
    const [displayValue, setDisplayValue] = useState("")
    const [expanded, setExpanded] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>("")
    const [currentValue, setCurrentValue] = useState<
      string | string[] | number | number[]
    >(value || "")
    const [currentFocus, setCurrentFocus] = useState(-1)

    const refInputWrapper = useRef(null)
    const refWrapper = useRef(null)

    useCommonProperties<HTMLSelectElement>(ref, refWrapper)

    const refList = useRef<ListRef>(null)

    const customAttributes: Record<string, string> = {}

    const handleSelectButtonClick = useCallback(() => {
      if (expanded) {
        setSearchValue("")
      }
      setExpanded(!expanded)
    }, [expanded, setSearchValue, setExpanded])

    const handleSelectClick = useCallback(() => {
      setExpanded(true)
    }, [setExpanded])

    useOutsideClick(refWrapper, () => {
      setExpanded(false)
      setSearchValue("")
      setCurrentFocus(-1)
    })

    const handleChangeSearch = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (expanded) {
          setSearchValue(event.target.value)
        }
      },
      [expanded, setSearchValue]
    )

    const handleFilterSearch = useCallback(
      (option: SelectOptions) => {
        if (searchValue === "") {
          return true
        } else {
          return (
            option.label.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
          )
        }
      },
      [searchValue]
    )

    const handleChangeValue = useCallback(
      (event: React.FormEvent<HTMLInputElement>) => {
        setCurrentValue((event.target as HTMLInputElement).value)
        setExpanded(false)
        onChange((event.target as HTMLInputElement).value)
      },
      [onChange, setCurrentValue, setExpanded]
    )

    const handleChangeValueMultiple = useCallback(
      (event: React.FormEvent<HTMLInputElement>) => {
        if ((event.target as HTMLInputElement).checked) {
          setCurrentValue(
            (oldValues: string | number | string[] | number[]) => {
              if (
                Array.isArray(oldValues) &&
                oldValues.indexOf(
                  (event.target as HTMLInputElement).value as never
                ) === -1
              ) {
                const newValues = [
                  ...oldValues,
                  (event.target as HTMLInputElement).value
                ]
                onChange(newValues)
                return newValues as string[]
              }

              return oldValues
            }
          )
        } else {
          setCurrentValue(
            // @ts-expect-error - oldValues pode ser string ou string[]
            (oldValues: string | number | string[] | number[]) => {
              onChange(
                (Array.isArray(oldValues) ? oldValues : []).filter(
                  (val: string | number) =>
                    val !== (event.target as HTMLInputElement).value
                )
              )
              return Array.isArray(oldValues)
                ? oldValues.filter(
                    (val: string | number) =>
                      val !== (event.target as HTMLInputElement).value
                  )
                : oldValues
            }
          )
        }
      },
      [setCurrentValue]
    )

    useEffect(() => {
      setCurrentValue(value || "")
    }, [value])

    useEffect(() => {
      // Encontra o valor na lista de options
      if (type === "single") {
        const option = options.find((opt) => String(opt.value) === currentValue)
        setDisplayValue(option?.label || "")
      } else {
        // Verifica o tamanho da lista de valores
        const length = (currentValue as string[] | number[]).length

        // Se estiver vazio, o display value é vazio
        if (length === 0) {
          setDisplayValue("")
        } else {
          // Do contrário, o display value é o primeiro da lista
          // + um número dizendo quantos foram selecionados.
          const option = options.find(
            (opt) =>
              String(opt.value) === (currentValue as string[] | number[])[0]
          )
          let displayValue = option?.label || ""
          if (length >= 2) {
            displayValue += `+ (${length - 1})`
          }

          setDisplayValue(displayValue)
        }
      }
    }, [currentValue])

    useEffect(() => {
      if (value) {
        setCurrentValue(value as string)
      }
    }, [value])

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === "ArrowDown") {
          event.preventDefault()
          setExpanded(true)

          setCurrentFocus((oldCurrentFocus) => {
            if (
              type === "single" &&
              oldCurrentFocus == options.filter(handleFilterSearch).length - 1
            ) {
              return oldCurrentFocus
            }

            if (
              type === "multiple" &&
              oldCurrentFocus == options.filter(handleFilterSearch).length
            ) {
              return oldCurrentFocus
            }

            ;(
              refList.current?.element.querySelectorAll(".br-item")[
                oldCurrentFocus + 1
              ] as HTMLElement
            ).focus()
            return oldCurrentFocus + 1
          })
        } else if (event.key === "ArrowUp") {
          event.preventDefault()
          setExpanded(true)

          setCurrentFocus((oldCurrentFocus) => {
            if (oldCurrentFocus == 0 || oldCurrentFocus == -1) {
              return oldCurrentFocus
            }

            ;(
              refList.current?.element.querySelectorAll(".br-item")[
                oldCurrentFocus - 1
              ] as HTMLElement
            ).focus()
            return oldCurrentFocus - 1
          })
        } else if (
          event.key === " " &&
          (event.target as HTMLElement).tagName === "DIV"
        ) {
          event.preventDefault()
          ;(
            refList.current?.element.querySelectorAll(".br-item")[
              currentFocus
            ] as HTMLElement
          )
            .querySelector("input")
            ?.click()
          setCurrentFocus(-1)
        } else if (event.key === "Escape") {
          setExpanded(false)
          setCurrentFocus(-1)
        }
      },
      [setCurrentFocus, setExpanded, setCurrentFocus]
    )

    if (type === "multiple") {
      customAttributes["multiple"] = "multiple"
    }

    return (
      <div
        ref={refWrapper}
        {...spreadProps}
        {...customAttributes}
        className={classNames("br-select", className, ...mtProps)}
      >
        <div ref={refInputWrapper} className="br-input">
          {label && <label htmlFor={fid}>{label}</label>}
          <input
            onClick={handleSelectClick}
            onFocus={handleSelectClick}
            id={`${fid}_____select`}
            type="text"
            data-value={value}
            data-displayvalue={displayValue}
            value={expanded ? searchValue : displayValue}
            onChange={handleChangeSearch}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={classNames({ disabled: disabled })}
          />
          <button
            onClick={handleSelectButtonClick}
            className={clsx("br-button", disabled && "opacity-50")}
            type="button"
            aria-label="Exibir lista"
            tabIndex={-1}
            data-trigger="data-trigger"
            disabled={disabled}
          >
            <i className="fas fa-angle-down" aria-hidden="true"></i>
          </button>
        </div>

        <List
          tabIndex={0}
          role=""
          expanded={expanded}
          ref={refList}
          onKeyDown={handleKeyDown}
        >
          {options.filter(handleFilterSearch).map((elemento, index) => (
            <Item
              key={elemento.value}
              tabIndex={-1}
              divider
              role=""
              className={classNames({
                selected:
                  currentValue === String(elemento.value) ||
                  ((currentValue as string[]).length > 0 &&
                    (currentValue as string[]).indexOf(
                      String(elemento.value)
                    ) !== -1)
              })}
              {...(index === currentFocus && {
                "data-focus-visible": "data-focus-visible"
              })}
            >
              {type === "single" && (
                <Radio
                  id={`${fid}____${elemento.value}`}
                  name={fid}
                  label={elemento.label}
                  checked={currentValue === String(elemento.value)}
                  value={String(elemento.value)}
                  onChange={handleChangeValue}
                />
              )}
              {type === "multiple" && (
                <Checkbox
                  id={`${fid}____${elemento.value}`}
                  name={String(elemento.value)}
                  label={elemento.label}
                  checked={
                    (currentValue as string[]).length > 0 &&
                    (currentValue as string[]).indexOf(
                      String(elemento.value)
                    ) !== -1
                  }
                  value={String(elemento.value)}
                  onChange={handleChangeValueMultiple}
                />
              )}
            </Item>
          ))}
        </List>
        {children}
      </div>
    )
  }
)

Select.displayName = "Select"

export default memo(Select)
