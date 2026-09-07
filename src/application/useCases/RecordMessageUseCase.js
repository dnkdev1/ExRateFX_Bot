const { Message } = require('../../domain/entities/Message');

class RecordMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ from, text, date, userId }) {
    const message = new Message({ from, text, date, userId });
    await this.messageRepository.save(message);
    return message;
  }
}

module.exports = { RecordMessageUseCase };
