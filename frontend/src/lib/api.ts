const API_BASE = '/api';

export interface User {
  id: number;
  nome: string;
  email: string;
  telemovel: string;
  status: string;
}

export interface Vehicle {
  id: number;
  marca: string;
  modelo: string | number;
  ano: number;
  preco: number;
  status: string;
  vendedor_id: number;
  cor?: string;
  km?: number;
  description?: string;
}

export interface Negotiation {
  id: number;
  vehicle_id: number;
  seller_id: number;
  buyer_id: number;
  consultant_id: number;
  final_car_price_aoa: number;
  commission_seller_aoa: number;
  commission_buyer_aoa: number;
  total_fees_collected_aoa: number;
  has_seller_paid_fee: number;
  has_buyer_paid_fee: number;
  seller_payment_ref: string;
  buyer_payment_ref: string;
  status: string;
  proposed_price_aoa: number;
}

export interface PaymentDetails {
  entity: string;
  reference: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ success: boolean; token?: string; user?: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async register(data: { nome: string; email: string; password: string; telemovel: string }) {
    return this.request<{ success: boolean; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Negotiations
  async getNegotiations() {
    return this.request<Negotiation[]>('/negotiations/user');
  }

  async getNegotiation(id: number) {
    return this.request<Negotiation>(`/negotiations/${id}`);
  }

  async createNegotiation(vehicleId: number, zone: string) {
    return this.request<{ success: boolean; negotiation?: Negotiation }>(
      '/negotiations',
      {
        method: 'POST',
        body: JSON.stringify({ vehicle_id: vehicleId, zone }),
      }
    );
  }

  async submitInspection(negotiationId: number, data: { approved: boolean; report: string }) {
    return this.request<{ success: boolean }>(
      `/negotiations/${negotiationId}/inspection`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async closeDeal(negotiationId: number, finalPrice: number) {
    return this.request<{ success: boolean }>(
      `/negotiations/${negotiationId}/close`,
      {
        method: 'POST',
        body: JSON.stringify({ final_price: finalPrice }),
      }
    );
  }

  // Payments
  async getFinancialSummary(negotiationId: number) {
    return this.request<{
      seller_fee: number;
      buyer_fee: number;
      consultant_commission: number;
      platform_revenue: number;
    }>(`/negotiations/${negotiationId}/financial`);
  }

  async getMulticaixaPayment(transactionId: string) {
    return this.request<{ status: string; entity?: string; reference?: string }>(
      `/payments/multicaixa/${transactionId}`
    );
  }

  async createMulticaixaPayment(negotiationId: number, role: string, phone: string, amount: number) {
    return this.request<{ success: boolean; transaction_id?: string }>(
      '/payments/multicaixa/pay',
      {
        method: 'POST',
        body: JSON.stringify({ negotiation_id: negotiationId, role, phone, amount }),
      }
    );
  }

  // Vehicles
  async getVehicles(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<Vehicle[]>(`/vehicles${params}`);
  }

  async getVehicle(id: number) {
    return this.request<Vehicle>(`/vehicles/${id}`);
  }

  // Messages / Chat
  async getConversations() {
    return this.request<any[]>('/messages/conversations');
  }

  async getMessages(userId: number, limit = 50, offset = 0) {
    return this.request<any[]>(`/messages/${userId}?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(receiverId: number, content: string, type = 'text') {
    return this.request<{ success: boolean }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content, type }),
    });
  }

  async markAsRead(userId: number) {
    return this.request<{ success: boolean }>(`/messages/${userId}/read`, { method: 'POST' });
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/messages/unread/count');
  }

  // Users
  async getUser(id: number) {
    return this.request<any>(`/users/${id}`);
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; version: string; php: string }>('/health');
  }
}

export const api = new ApiClient();
