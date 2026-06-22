
export const fetchWebhooks = async (): Promise<Record<string, string>> => {
  try {
    const response = await fetch('/api/config/WEBHOOKS');
    if (!response.ok) return {};
    const data = await response.json();
    return data || {};
  } catch (err) {
    console.error('Failed to fetch webhooks:', err);
    return {};
  }
};

export const saveWebhooks = async (webhooks: Record<string, string>): Promise<boolean> => {
  try {
    const response = await fetch('/api/config/WEBHOOKS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: webhooks })
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to save webhooks:', err);
    return false;
  }
};

export const getWebhookUrl = (webhooks: Record<string, string>, key: string): string => {
  return webhooks[key] || localStorage.getItem(key) || '';
};
