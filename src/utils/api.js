/**
 * API client for AgriNovaX backend
 */
const API_BASE = "/api"

export async function predictCrop(inputData) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(error.detail || 'Prediction failed');
  }

  return response.json();
}

export async function getWeather(location) {
  const response = await fetch(`${API_BASE}/weather/${encodeURIComponent(location)}`);
  if (!response.ok) throw new Error('Weather fetch failed');
  return response.json();
}

export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function chatWithAssistant(message, language = 'en', context = null) {
  const body = { message, language };
  if (context) body.context = context;
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Chat failed');
  return response.json();
}

