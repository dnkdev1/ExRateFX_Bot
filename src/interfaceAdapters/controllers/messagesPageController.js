const { renderMessagesHtml } = require('../presenters/messagesHtmlPresenter');

function makeMessagesPageController(listMessagesUseCase) {
  return async function messagesPageController(req, reply) {
    const messages = await listMessagesUseCase.execute();
    reply.type('text/html');
    return renderMessagesHtml(messages);
  };
}

module.exports = { makeMessagesPageController };
