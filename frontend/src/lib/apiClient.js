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
  const token = localStorage.getItem('github_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers,
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
  const token = localStorage.getItem('github_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${apiBase()}${path}`, { headers })
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
