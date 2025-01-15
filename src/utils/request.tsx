import { pack, unpack } from "msgpackr"
import { useModal } from "./modal"
import { Modal } from "react-dsgov"
import { useNavigate } from "react-router"

export default function useHttpClient() {
  const { openModal, closeModal, setModalContent } = useModal()
  const navigate = useNavigate()

  async function request(
    path: string,
    init?: RequestInit & { data?: unknown },
    handleError: boolean = false
  ): Promise<Response> {
    const headers = { Accept: "application/x-msgpack", ...init?.headers } as {
      [key: string]: string
    }

    if (init?.data !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/x-msgpack"
    }

    const res = await fetch(`${path}`, {
      ...init,
      headers,
      credentials: "include",
      body: init?.data !== undefined ? pack(init.data) : init?.body
    })

    // @ts-expect-error arrayBuffer is correct
    res.json = async () => unpack(await res.arrayBuffer())

    if (res.status === 401) {
      const refreshRes = await fetch("/api/admin/auth/refresh", {
        method: "POST",
        credentials: "include"
      })
      if (refreshRes.ok) {
        return request(path, init, handleError)
      } else {
        navigate("/login")
      }
    } else if (!res.status.toString().startsWith("2") && handleError) {
      let message: string

      try {
        const data = await res.json()
        res.json = async () => data
        message = data.message ?? "Ocorreu um erro inesperado"
      } catch {
        message = "Ocorreu um erro inesperado"
      }

      setModalContent(
        <Modal title="Erro" showCloseButton onCloseButtonClick={closeModal}>
          <Modal.Body>
            <div className="flex items-center space-x-2">
              <i className="fas fa-warning text-danger fa-3x"></i>
              <p className="normal-case text-center">{message}</p>
            </div>
          </Modal.Body>
        </Modal>
      )

      if ((init?.method ?? "GET") === "GET") {
        navigate(`/error?status=${res.status}`, {
          state: { message }
        })
      } else {
        openModal()
      }

      throw new Error(message)
    }

    return res
  }

  return request
}
