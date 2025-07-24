const SERVER_URL = import.meta.env.VITE_API_URL;
export interface GetItemsParams {
  offset: number;
  limit: number;
  search?: string;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.append(key, value);
  }
  return query.toString();
}

export const api = {
  async getItems({ offset, limit, search }: GetItemsParams) {
    const query = buildQuery({
      offset: String(offset),
      limit: String(limit),
      search,
    });
    const res = await fetch(`${SERVER_URL}/items?${query}`);
    if (!res.ok) throw new Error(`Failed to fetch items: ${res.statusText}`);
    return res.json();
  },

  async getOrder(search?: string): Promise<string[]> {
    const query = buildQuery({ search });
    const res = await fetch(`${SERVER_URL}/items/order?${query}`);
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.statusText}`);
    return res.json();
  },
  async setOrder(ids: string[], search?: string): Promise<void> {
    const query = buildQuery({ search });
    const res = await fetch(`${SERVER_URL}/items/order?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    });
    if (!res.ok) throw new Error(`Failed to set order: ${res.statusText}`);
  },
  async getSelection() {
    const res = await fetch(`${SERVER_URL}/items/selection`);
    return res.json();
  },
  async setSelection(ids: string[]) {
    await fetch(`${SERVER_URL}/items/selection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    });
  },
};