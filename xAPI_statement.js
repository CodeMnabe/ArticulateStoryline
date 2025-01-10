const conf = {
  endpoint: "https://gasparalves-test.lrs.io/xapi/",
  auth: "Basic " + btoa("sizfut:idsene"),
};

ADL.XAPIWrapper.changeConfig(conf);

function sendViewed(object, objectId) {
  const player = GetPlayer();
  const uNamejs = player.GetVar("uName");
  const uEmailjs = player.GetVar("uEmail");

  const statement = {
    actor: {
      name: uNamejs,
      mbox: `mailto:${uEmailjs}`,
    },
    verb: {
      id: "https://w3id.org/xapi/dod-isd/verbs/viewed",
      display: { pt: "Visto" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: "Recurso no Curso" },
        type: "http://adlnet.gov/expapi/activities/webpage",
      },
      objectType: "Activity",
    },
  };

  const result = ADL.XAPIWrapper.sendStatement(statement);
}

function sendAnswered(object, objectId, success) {
  const player = GetPlayer();
  const uNamejs = player.GetVar("uName");
  const uEmailjs = player.GetVar("uEmail");

  const userResponse = player.GetVar("responseVar");

  const userScorejs = player.GetVar("userScore");
  const maxScorejs = player.GetVar("maxScore") || 1;
  const scaledScore = userScorejs / maxScorejs;

  const statement = {
    actor: {
      name: uNamejs,
      mbox: `mailto:${uEmailjs}`,
    },
    verb: {
      id: "http://adlnet.gov/expapi/verbs/answered",
      display: { pt: "Respondeu" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: "Pergunta no Curso" },
        type: "http://adlnet.gov/expapi/activities/question",
      },
      objectType: "Activity",
    },
    result: {
      response: userResponse,
      score: {
        min: 0,
        max: maxScorejs,
        raw: userScorejs,
        scaled: scaledScore,
      },
      success: success,
    },
  };

  const result = ADL.XAPIWrapper.sendStatement(statement);
}

function sendPassed(object, objectId) {
  const player = GetPlayer();
  const uNamejs = player.GetVar("uName");
  const uEmailjs = player.GetVar("uEmail");

  const userScorejs = player.GetVar("userScore") || 1;
  const maxScorejs = player.GetVar("maxScore") || 1;
  const scaledScore = userScorejs / maxScorejs;

  const statement = {
    actor: {
      name: uNamejs,
      mbox: `mailto:${uEmailjs}`,
    },
    verb: {
      id: "http://adlnet.gov/expapi/verbs/passed",
      display: { pt: "Passou" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: "Pergunta no Curso" },
        type: "http://adlnet.gov/expapi/activities/assessment",
      },
      objectType: "Activity",
    },
    result: {
      score: {
        min: 0,
        max: maxScorejs,
        raw: userScorejs,
        scaled: scaledScore,
      },
      success: true,
    },
  };

  const result = ADL.XAPIWrapper.sendStatement(statement);
}

function sendFailed(object, objectId) {
  const player = GetPlayer();
  const uNamejs = player.GetVar("uName");
  const uEmailjs = player.GetVar("uEmail");

  const userScorejs = player.GetVar("userScore") || 1;
  const maxScorejs = player.GetVar("maxScore") || 1;
  const scaledScore = userScorejs / maxScorejs;

  const statement = {
    actor: {
      name: uNamejs,
      mbox: `mailto:${uEmailjs}`,
    },
    verb: {
      id: "http://adlnet.gov/expapi/verbs/failed",
      display: { pt: "Não passou" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: "Pergunta no Curso" },
        type: "http://adlnet.gov/expapi/activities/assessment",
      },
      objectType: "Activity",
    },
    result: {
      score: {
        min: 0,
        max: maxScorejs,
        raw: userScorejs,
        scaled: scaledScore,
      },
      success: false,
    },
  };

  const result = ADL.XAPIWrapper.sendStatement(statement);
}
