const { Message } = require('../../domain/entities/Message');

class RecordMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ from, text, date }) {
    const message = new Message({ from, text, date });
    await this.messageRepository.save(message);
    return message;
  }
}

module.exports = { RecordMessageUseCase };
