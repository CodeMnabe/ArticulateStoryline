async function setLRSConfig() {
  const conf = {
    endpoint: "https://gasparalves-test.lrs.io/xapi/",
    auth: "Basic " + btoa("sizfut:idsene"),
  };

  ADL.XAPIWrapper.changeConfig(conf);
  console.log("LRS config changed");
  return true;
}

async function sendViewed(name, id, homePage, objectId, object, objectType) {
  objectType = objectType.toLowerCase();

  const _homePage = await setHomePage(homePage);

  if (!_homePage) {
    console.error("No home page");
    return;
  }

  const statement = {
    actor: {
      name: name,
      objectType: "Agent",
      account: {
        name: id,
        homePage: _homePage,
      },
    },
    verb: {
      id: "https://www.digik.pt/xapi/v1/verbs/visualizou",
      display: { pt: "Visualizou" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: `${objectType} no Curso` },
        type: `https://www.digik.pt/xapi/activities/${objectType}`,
      },
      objectType: "Activity",
    },
  };

  const result = ADL.XAPIWrapper.sendStatement(statement);

  if (result) {
    return true;
  }

  return false;
}

async function sendCompleted(name, id, homePage, objectId, object) {
  const statement = {
    actor: {
      name: name,
      objectType: "Agent",
      account: {
        name: id,
        homePage: homePage,
      },
    },
    verb: {
      id: "https://www.digik.pt/xapi/v1/verbs/completou",
      display: { pt: "Completou" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: "Curso foi completo" },
        type: "https://www.digik.pt/xapi/activities/course",
      },
      objectType: "Activity",
    },
  };

  const result = ADL.XAPIWrapper.sendStatement(statement);

  if (result) {
    return true;
  }

  return false;
}

async function sendClicked(name, id, homePage, objectId, object, response) {
  const statement = {
    actor: {
      name: name,
      objectType: "Agent",
      account: {
        name: id,
        homePage: homePage,
      },
    },
    verb: {
      id: "https://www.digik.pt/xapi/v1/verbs/clicou",
      display: { pt: "Clicou" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: "Clicou num objeto" },
        type: "https://www.digik.pt/xapi/activities/pergunta",
      },
      objectType: "Activity",
    },
    result: {
      response: String(response),
    },
  };

  try {
    const result = ADL.XAPIWrapper.sendStatement(statement);

    console.log(result);
    if (result) {
      return true;
    }
  } catch (err) {
    console.error("Error sending statement:", err);
    return false;
  }
  return false;
}

async function sendAnsweredQuestionnaire(
  name, //Nome da pessoa que está a fazer o curso
  id, //ID da pessoa que está a fazer o curso
  homePage, //Homepage onde o curso está alojado para se poder identificar que utilizador está a ser passado
  objectId, //ID do curso para se poder identificar qual é o curso de onde este statement veio
  object, //Nome do objeto para se poder identificar melhor o que o utilizador está a interagir
  response //Resposta do utilizador
) {
  const statement = {
    actor: {
      name: name,
      objectType: "Agent",
      account: {
        name: id,
        homePage: homePage,
      },
    },
    verb: {
      id: "https://www.digik.pt/xapi/v1/verbs/respondeu",
      display: { pt: "Respondeu" },
    },
    object: {
      id: objectId,
      definition: {
        name: { pt: object },
        description: { pt: "Respondeu a um questionário" },
        type: "https://www.digik.pt/xapi/activities/questionario",
      },
      objectType: "Activity",
    },
    result: {
      response: response,
    },
  };

  try {
    const result = ADL.XAPIWrapper.sendStatement(statement);

    console.log(result);
    if (result) {
      return true;
    }
  } catch (err) {
    console.error("Error sending statement:", err);
  }
  return false;
}
