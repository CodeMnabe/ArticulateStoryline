function getGlobalPlayer() {
  if (window.player) {
    console.log("Player already exists");
    return window.player;
  }
  console.log("Creating new player");
  window.player = GetPlayer();
  return window.player;
}

function getVar(_var) {
  if (!window.player) {
    getGlobalPlayer();
  }

  return player.GetVar(_var);
}

function setVar(_var, value) {
  if (!window.player) {
    getGlobalPlayer();
  }

  if (typeof _var !== "string") {
    console.alert("_var must be a string");
    return "";
  }

  return player.SetVar(_var, value);
}

function setUserIDAndName() {
  const _userID = typeof GetStudentID === "function" ? GetStudentID() : "0";

  const scormName =
    typeof GetStudentName === "function" ? GetStudentName() : "User,Test";
  const _name = scormName ? scormName.split(",").reverse().join(" ") : "N/A";

  if (getVar("name") !== _name || getVar("userID") !== _userID) {
    console.log("userID and name are already set");
    return { userID: getVar("userID"), name: getVar("name") };
  }

  setVar("userID", _userID);
  setVar("name", _name);

  return { userID: _userID, name: _name };
}

function setLRSConfig(endpoint, username, password) {
  const conf = {
    endpoint: endpoint,
    auth: "Basic " + btoa(`${username}:${password}`),
  };

  ADL.XAPIWrapper.changeConfig(conf);

  return true;
}

async function setHomePage(homePage) {
  try {
    const _homePage = homePage
      ? homePage
      : new URL(window.location.href).origin;

    //TODO: Adicionar lógica para aparecer uma caixa caso não ser apresentado um URL ou se não conseguir encontrar nenhum Sub Domain
    if (!_homePage) {
      return false;
    }

    setVar("homePage", _homePage);
    return true;
  } catch (error) {
    console.error("Error setting homePage:", error);
    return false;
  }
}

function getSubdomainFromCurrentPage() {
  const urlObject = new URL(window.location.href); // Get the current page URL
  const parts = urlObject.hostname.split("."); // Split the hostname into parts

  // Handle different cases based on URL patterns
  if (parts.length === 3) {
    return parts[0]; // Standard subdomain, e.g., "digikacademy" in "digikacademy.talentlms.com"
  } else if (parts.length > 3) {
    return parts.slice(0, parts.length - 2).join("."); // Handle deeper subdomains, if any
  }
  return null; // No subdomain detected
}

//#region Queries

function queryCompleted(id, homePage, courseURI) {
  const parameters = ADL.XAPIWrapper.searchParams();

  parameters["agent"] = JSON.stringify({
    account: {
      name: id,
      homePage: homePage,
    },
  });

  parameters["verb"] = "https://www.digik.pt/xapi/v1/verbs/completou";
  parameters["activity"] = courseURI;

  const response = ADL.XAPIWrapper.getStatements(parameters);

  if (!response || !response.statements) {
    console.error("Error retrieving statements.");
    return { statements: {}, status: false };
  }

  if (response.statements.length > 0) {
    const statement = response.statements[0];
    if (
      statement.actor.account.name === id &&
      statement.actor.account.homePage === homePage
    ) {
      return { response, status: true };
    }
  }

  console.log("No matching statement found.");
  return { statements: {}, status: false };
}

//#endregion

//#region Send To LRS

function sendCompleted(name, id, homePage, objectId, object) {
  const data = queryCompleted(id, homePage, objectId);

  if (data.status) {
    console.log("Data was found already");
    return data;
  }

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
    return { result, status: true };
  }

  return { result: {}, status: false };
}

//#endregion

function compareText(text, keywords) {
  const lowerText = text.toLowerCase();
  let results = 0; // Initialize count
  let elements = [];

  for (let element of keywords) {
    const lowerElement = element.toLowerCase();
    if (lowerText.includes(lowerElement)) {
      results += 1; // Increment if a keyword is found
      elements.push(element); // Add to the results array
    }
  }

  return results === 0 ? false : { results: results, elements: elements }; // Return false if none found, otherwise return the count
}

function calculateFinalResult() {
  const numBasicOpenQuestions = getVar("openBasicQuestions"); //Between 0 and 10;
  const numAdvOpenQuestions = getVar("openAdvancedQuestions"); //Between 0 and 10;
  const numBasicMultiQuestions = getVar("multiBasicQuestions"); //Between 0 and 10;
  const numAdvMultiQuestions = getVar("multiAdvancedQuestions"); //Between 0 and 10;

  console.log(
    `Open Basic Question: ${numBasicOpenQuestions}\nOpen Advanced Question: ${numAdvOpenQuestions}\nMulti Basic Question: ${numBasicMultiQuestions}\nMulti Advanced Question: ${numAdvMultiQuestions}`
  );

  const openQuestionMaxScore =
    6 * numBasicOpenQuestions + 14 * numAdvOpenQuestions;
  const multiChoiceMaxScore =
    6 * numBasicMultiQuestions + 14 * numAdvMultiQuestions;
  const totalMaxScore = openQuestionMaxScore + multiChoiceMaxScore;

  // Open Question Score
  const openQuestionScore = getVar("score"); // Actual score from open questions

  // Extract Multiple Choice Percentage
  let multiChoicePercentage = 0;
  const textElement = document.querySelector('[data-model-id="5hJhX4FLpo0"]');
  if (textElement) {
    let tspan = textElement.querySelector("tspan.text-segment");
    if (tspan) {
      multiChoicePercentage =
        parseFloat(tspan.textContent.replace("%", "")) || 0; // Extract and convert to a number
      console.log("Multiple Choice Percentage:", multiChoicePercentage);
    }
  }

  console.log(
    "Trying to get the multiscore vairable:",
    getVar("multiQuestionScore")
  );

  console.log(
    "Open Question Percentage:",
    (openQuestionScore / openQuestionMaxScore) * 100
  );

  const openQuestionPercentage =
    (openQuestionScore / openQuestionMaxScore) * 100;
  const openQuestionWeight = (openQuestionMaxScore / totalMaxScore) * 100;

  const multiQuestionWeight = (multiChoiceMaxScore / totalMaxScore) * 100;

  // Final Weighted Percentage
  const finalPercentage =
    (openQuestionPercentage * openQuestionWeight) / 100 +
    (multiChoicePercentage * multiQuestionWeight) / 100;

  console.log("Final Weighted Percentage:", finalPercentage.toFixed(0) + "%");
  setVar("finalScore", finalPercentage.toFixed(0));
}
