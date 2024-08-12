import { unpack, pack } from "msgpackr"

export default async function request(
  path: string,
  init?: RequestInit & { data?: { [key: string]: string | number | boolean } }
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

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include"
    })
    if (refreshRes.ok) {
      return request(path, init)
    } else {
      location.href = "/login"
    }
  } else if (!res.status.toString().startsWith("2")) {
    throw new Error(unpack((await res.arrayBuffer()) as Buffer).msg)
  }

  res.json = async () => unpack((await res.arrayBuffer()) as Buffer)

  return res
}
