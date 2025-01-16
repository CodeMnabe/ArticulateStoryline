async function queryData(id, homePage) {
  const parameters = ADL.XAPIWrapper.searchParams();

  parameters["agent"] = JSON.stringify({
    account: {
      name: id,
      homePage: homePage,
    },
  });

  parameters["verb"] = "https://w3id.org/xapi/dod-isd/verbs/viewed";
  parameters["activity"] =
    "https://digikacademy.talentlms.com/plus/courses/341";

  const response = ADL.XAPIWrapper.getStatements(parameters);

  if (response.statements.length > 0) {
    const statement = response.statements[0];
    if (
      statement.actor.account.name === id &&
      statement.actor.account.homePage === homePage
    ) {
      return true;
    }
  }

  console.log("No matching statement found.");
  return false;
}

//homePage is the base URL where the course is located.
async function queryCompleted(id, homePage, courseID) {
  const parameters = ADL.XAPIWrapper.searchParams();

  parameters["agent"] = JSON.stringify({
    account: {
      name: id,
      homePage: homePage,
    },
  });

  parameters["verb"] = "http://adlnet.gov/expapi/verbs/completed";
  parameters["activity"] = `${homePage}plus/courses/${courseID}`;

  const response = ADL.XAPIWrapper.getStatements(parameters);

  if (response.statements.length > 0) {
    const statement = response.statements[0];
    if (
      statement.actor.account.name === id &&
      statement.actor.account.homePage === homePage
    ) {
      return true;
    }
  }

  console.log("No matching statement found.");
  return false;
}

async function queryClicked(id, homePage, courseID) {
  const parameters = ADL.XAPIWrapper.searchParams();

  parameters["agent"] = JSON.stringify({
    account: {
      name: id,
      homePage: homePage,
    },
  });

  parameters["verb"] = "https://www.digik.pt/xapi/v1/verbs/clicou";
  parameters["activity"] = `${homePage}plus/courses/${courseID}`;

  const response = ADL.XAPIWrapper.getStatements(parameters);

  if (response.statements.length > 0) {
    const statement = response.statements[0];
    if (
      statement.actor.account.name === id &&
      statement.actor.account.homePage === homePage
    ) {
      return { success: true, response: statement.result.response };
    }
  }

  return {
    success: false,
    response: null,
    message: "No matching statement found.",
  };
}

async function queryAnsweredQuestionnaire(id, homePage, courseID) {
  const parameters = ADL.XAPIWrapper.searchParams();

  parameters["agent"] = JSON.stringify({
    account: {
      name: id,
      homePage: homePage,
    },
  });

  parameters["verb"] = "https://www.digik.pt/xapi/v1/verbs/respondeu";
  parameters["activity"] = `${homePage}plus/courses/${courseID}`;

  const response = ADL.XAPIWrapper.getStatements(parameters);

  if (response.statements.length > 0) {
    const statement = response.statements[0];
    if (
      statement.actor.account.name === id &&
      statement.actor.account.homePage === homePage
    ) {
      return { success: true, response: statement.result.response };
    }
  }

  return {
    success: false,
    response: null,
    message: "No matching statement found.",
  };
}
