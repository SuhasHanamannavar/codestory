async function readJson(resp) {
  const text = await resp.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function apiBase() {
  return import.meta.env.VITE_API_URL || ''
}

export async function apiPost(path, body) {
  const resp = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  })

  const data = await readJson(resp)
  if (!resp.ok) {
    const msg = data?.detail || data?.message || `HTTP ${resp.status}`
    const err = new Error(msg)
    err.status = resp.status
    err.data = data
    throw err
  }
  return data
}

export async function apiGet(path) {
  const resp = await fetch(`${apiBase()}${path}`)
  const data = await readJson(resp)
  if (!resp.ok) {
    const msg = data?.detail || data?.message || `HTTP ${resp.status}`
    const err = new Error(msg)
    err.status = resp.status
    err.data = data
    throw err
  }
  return data
}
