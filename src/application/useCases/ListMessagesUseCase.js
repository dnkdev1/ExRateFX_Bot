class ListMessagesUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute() {
    return this.messageRepository.list();
  }
}

module.exports = { ListMessagesUseCase };
