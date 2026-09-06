const { MessageRepository } = require('../../application/ports/MessageRepository');

class InMemoryMessageRepository extends MessageRepository {
  constructor() {
    super();
    this.messages = [];
  }

  async save(message) {
    this.messages.push(message);
  }

  async list() {
    return this.messages.slice();
  }
}

module.exports = { InMemoryMessageRepository };
