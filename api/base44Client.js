export const base44 = {
  auth: {
    async me() {
      return { email: "demo@example.com" };
    }
  },
  entities: {
    Character: {
      async filter() {
        return [];
      },
      async get(id) {
        return { id, name: "Traveler", current_location: "Unknown" };
      },
      async create(data) {
        return { id: "new", ...data };
      },
      async update(id, data) {
        return { id, ...data };
      },
      async delete() {
        return true;
      }
    }
  },
  agents: {
    async createConversation(metadata) {
      return { id: "conv-1", messages: [], ...metadata };
    },
    async getConversation(id) {
      return { id, messages: [] };
    },
    subscribeToConversation(id, callback) {
      callback({ messages: [] });
      return () => {};
    },
    async addMessage(conversation, message) {
      return { conversation_id: conversation.id, ...message };
    }
  }
};
