import { useEffect, useRef, useState, type ComponentProps } from "react"

type Props = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  onChange: (files: File[]) => void
  value?: File[]
  error?: string
  multiple?: boolean
}

const Upload: React.FC<Props> = ({
  onChange,
  value,
  error,
  multiple = false,
  ...props
}) => {
  const [files, setFiles] = useState<File[]>(value || [])

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFiles(value || [])
  }, [value])

  return (
    <div>
      <div className="br-upload">
        <label className="upload-label" htmlFor="multiple-files">
          <span>Envio de arquivos</span>
        </label>
        <input
          className="upload-input"
          id="multiple-files"
          type="file"
          multiple={multiple}
          aria-hidden
          aria-label="enviar arquivo"
          ref={ref}
          onChange={(e) => {
            const fileList = Array.from(e.target.files || [])
            setFiles(fileList)
            onChange(fileList)
          }}
          {...props}
        />
        <button
          className="upload-button"
          type="button"
          aria-hidden="true"
          onClick={() => ref.current?.click()}
        >
          <i className="fas fa-upload" aria-hidden="true"></i>
          <span>Selecione {multiple ? "os arquivos" : "o arquivo"}</span>
        </button>
        <div className="upload-list">
          {(files !== null
            ? Array.isArray(files)
              ? files
              : [files]
            : []
          )?.map((file) => (
            <div key={file.name} className="br-item d-flex">
              <div className="content text-primary-default mr-auto">
                {file.name}
              </div>
              <div className="support mr-n2">
                <span className="mr-1">{(file.size / 1024).toFixed(2)} KB</span>
                <button
                  className="br-button"
                  type="button"
                  aria-label={`Remover ${file.name}`}
                  onClick={() => {
                    setFiles((old) => old.filter((f) => f.name !== file.name))
                    onChange(files.filter((f) => f.name !== file.name))
                  }}
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {error && (
        <span className="feedback danger mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default Upload
