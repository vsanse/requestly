/**
 * API Client Module
 * Centralized HTTP client for Requestly backend services
 * @module api-client
 */

/**
 * Base API Client
 * Provides common functionality for all API clients
 */
export class RequestlyApiClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.headers = config.headers || {};
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make an HTTP request
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options (body, headers, query params)
   * @returns {Promise<any>} Response data
   */
  async request(method, endpoint, options = {}) {
    const url = new URL(endpoint, this.baseURL);

    // Add query parameters
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        url.searchParams.append(key, options.params[key]);
      });
    }

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...options.headers
      }
    };

    // Add body for non-GET requests
    if (method !== 'GET' && options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>}
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>}
   */
  async post(endpoint, body, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>}
   */
  async put(endpoint, body, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>}
   */
  async patch(endpoint, body, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>}
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * Set authorization token
   * @param {string} token - Auth token
   */
  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  clearAuthToken() {
    delete this.headers['Authorization'];
  }
}

/**
 * Rules API Client
 * Handles rules-related API calls
 */
export class RulesApiClient extends RequestlyApiClient {
  /**
   * Get all rules
   * @returns {Promise<Array>}
   */
  async getRules() {
    return this.get('/api/rules');
  }

  /**
   * Get rule by ID
   * @param {string} ruleId - Rule ID
   * @returns {Promise<Object>}
   */
  async getRule(ruleId) {
    return this.get(`/api/rules/${ruleId}`);
  }

  /**
   * Create a new rule
   * @param {Object} ruleData - Rule data
   * @returns {Promise<Object>}
   */
  async createRule(ruleData) {
    return this.post('/api/rules', ruleData);
  }

  /**
   * Update a rule
   * @param {string} ruleId - Rule ID
   * @param {Object} ruleData - Updated rule data
   * @returns {Promise<Object>}
   */
  async updateRule(ruleId, ruleData) {
    return this.put(`/api/rules/${ruleId}`, ruleData);
  }

  /**
   * Delete a rule
   * @param {string} ruleId - Rule ID
   * @returns {Promise<void>}
   */
  async deleteRule(ruleId) {
    return this.delete(`/api/rules/${ruleId}`);
  }
}

/**
 * Workspace API Client
 * Handles workspace-related API calls
 */
export class WorkspaceApiClient extends RequestlyApiClient {
  /**
   * Get workspace details
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Object>}
   */
  async getWorkspace(workspaceId) {
    return this.get(`/api/workspaces/${workspaceId}`);
  }

  /**
   * Get workspace members
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Array>}
   */
  async getMembers(workspaceId) {
    return this.get(`/api/workspaces/${workspaceId}/members`);
  }

  /**
   * Invite member to workspace
   * @param {string} workspaceId - Workspace ID
   * @param {Object} memberData - Member invitation data
   * @returns {Promise<Object>}
   */
  async inviteMember(workspaceId, memberData) {
    return this.post(`/api/workspaces/${workspaceId}/members`, memberData);
  }

  /**
   * Remove member from workspace
   * @param {string} workspaceId - Workspace ID
   * @param {string} memberId - Member ID
   * @returns {Promise<void>}
   */
  async removeMember(workspaceId, memberId) {
    return this.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
  }
}

/**
 * Billing API Client
 * Handles billing and subscription-related API calls
 */
export class BillingApiClient extends RequestlyApiClient {
  /**
   * Get subscription details
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getSubscription(userId) {
    return this.get(`/api/billing/subscription/${userId}`);
  }

  /**
   * Update subscription
   * @param {string} userId - User ID
   * @param {Object} subscriptionData - Subscription update data
   * @returns {Promise<Object>}
   */
  async updateSubscription(userId, subscriptionData) {
    return this.put(`/api/billing/subscription/${userId}`, subscriptionData);
  }

  /**
   * Cancel subscription
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async cancelSubscription(userId) {
    return this.delete(`/api/billing/subscription/${userId}`);
  }

  /**
   * Get invoices
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getInvoices(userId) {
    return this.get(`/api/billing/invoices/${userId}`);
  }
}

/**
 * Create a configured API client instance
 * @param {Object} config - Client configuration
 * @returns {Object} Object with specialized API clients
 */
export function createApiClient(config = {}) {
  return {
    rules: new RulesApiClient(config),
    workspace: new WorkspaceApiClient(config),
    billing: new BillingApiClient(config)
  };
}
