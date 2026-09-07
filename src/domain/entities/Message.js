class Message {
  constructor({ from, text, date, userId }) {
    this.from = from;
    this.text = text;
    this.date = date;
    this.userId = userId;
  }
}

module.exports = { Message };
