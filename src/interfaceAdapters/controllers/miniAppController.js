const { renderMiniAppHtml } = require('../presenters/miniAppHtmlPresenter');
const { verifyTelegramInitData } = require('../../infrastructure/security/verifyTelegramInitData');

function makeMiniAppPageController() {
  return async function miniAppPageController(req, reply) {
    reply.type('text/html');
    return renderMiniAppHtml();
  };
}

function makeRatesJsonController(getLiveRatesUseCase) {
  return async function ratesJsonController(req, reply) {
    return getLiveRatesUseCase.execute();
  };
}

function makeMyMessagesJsonController(listMessagesUseCase, botToken) {
  return async function myMessagesJsonController(req, reply) {
    const user = verifyTelegramInitData(req.query.initData, botToken);
    if (!user) {
      return reply.code(401).send({ error: 'invalid or missing initData' });
    }

    const messages = await listMessagesUseCase.execute({ userId: user.id });
    return messages.slice().reverse();
  };
}

module.exports = { makeMiniAppPageController, makeRatesJsonController, makeMyMessagesJsonController };
