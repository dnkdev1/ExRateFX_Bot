class Message {
  constructor({ from, text, date }) {
    this.from = from;
    this.text = text;
    this.date = date;
  }
}

module.exports = { Message };
