/**
 * Retrieves or creates a global player instance.
 *
 * This function checks if a global player instance already exists in the window object.
 * If it does, it returns the existing instance. If not, it creates a new player instance
 * using the GetPlayer() function and assigns it to the window object before returning it.
 *
 * @returns {Object} The global player instance.
 */
function getGlobalPlayer() {
  if (window.player) {
    console.log("Player already exists");
    return window.player;
  }
  console.log("Creating new player");
  window.player = GetPlayer();
  return window.player;
}

/**
 * Retrieves the value of a variable from the global player instance.
 *
 * This function checks if the global player instance exists, creates it if necessary,
 * and then retrieves the value of the specified variable using the player's GetVar method.
 *
 * @param {string} _var - The name of the variable to retrieve from the player.
 * @returns {*} The value of the specified variable. The type depends on what's stored in the variable.
 */
function getVar(_var) {
  if (!window.player) {
    getGlobalPlayer();
  }

  return player.GetVar(_var);
}

/**
 * Sets the value of a variable in the global player instance.
 *
 * This function checks if the global player instance exists, creates it if necessary,
 * and then sets the value of the specified variable using the player's SetVar method.
 * It also validates that the variable name is a string.
 *
 * @param {string} _var - The name of the variable to set in the player.
 * @param {*} value - The value to assign to the variable. Can be of any type.
 * @returns {*} The result of the SetVar operation, or an empty string if the variable name is invalid.
 */
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

/**
 * Sets the user ID and name in the global player instance.
 *
 * This function attempts to retrieve the student ID and name using SCORM functions
 * if available. If not, it uses default values. It then sets these values in the
 * global player instance if they are different from the current values.
 *
 * @returns {Object} An object containing the user ID and name.
 * @property {string} userID - The user's ID, either from SCORM or default "0".
 * @property {string} name - The user's name, formatted as "FirstName LastName" or "N/A".
 */
function setUserIDAndName() {
  const _userID = typeof GetStudentID === "function" ? GetStudentID() : "0";

  const scormName =
    typeof GetStudentName === "function" ? GetStudentName() : "User,Test";
  const _name = scormName ? scormName.split(",").reverse().join(" ") : "N/A";

  if (
    (getVar("name") === _name && getVar("userID") === _userID) ||
    (getVar("name") !== "" && getVar("userID") !== "")
  ) {
    console.log(
      "userID and name are already set " +
        getVar("userID") +
        " and " +
        getVar("name")
    );
    return { userID: getVar("userID"), name: getVar("name") };
  }

  setVar("userID", _userID);
  setVar("name", _name);

  return { userID: _userID, name: _name };
}

/**
 * Extracts the subdomain from the current page's URL.
 *
 * This function analyzes the hostname of the current page's URL to determine
 * the subdomain. It handles standard subdomains and deeper subdomain structures.
 *
 * @returns {string|null} The subdomain if detected, otherwise null if no subdomain is present.
 */
function getSubdomainFromCurrentPage() {
  const urlObject = new URL(window.location.href);
  const parts = urlObject.hostname.split(".");

  if (parts.length === 3) {
    return parts[0];
  } else if (parts.length > 3) {
    return parts.slice(0, parts.length - 2).join(".");
  }
  return null;
}

//#region Queries

/**
 * Queries the completion status of a course for a specific user.
 *
 * This function constructs a query to check if a user has completed a course
 * by searching for statements in the xAPI Wrapper that match the given user ID,
 * home page, and course URI.
 *
 * @param {string} id - The unique identifier of the user.
 * @param {string} homePage - The home page URL associated with the user's account.
 * @param {string} courseURI - The URI of the course to check for completion.
 * @returns {Object} An object containing the response and status.
 * @property {Object} response - The response from the xAPI Wrapper containing statements.
 * @property {boolean} status - True if a matching completion statement is found, otherwise false.
 */
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

/**
 * Configures the Learning Record Store (LRS) with the specified endpoint and credentials.
 *
 * This function sets up the LRS configuration by specifying the endpoint URL and
 * authentication credentials, which are encoded in Base64 format.
 *
 * @param {string} endpoint - The URL of the LRS endpoint to connect to.
 * @param {string} username - The username for authenticating with the LRS.
 * @param {string} password - The password for authenticating with the LRS.
 * @returns {boolean} Returns true if the configuration is successfully set.
 */
function setLRSConfig(endpoint, username, password) {
  const conf = {
    endpoint: endpoint,
    auth: "Basic " + btoa(`${username}:${password}`),
  };

  ADL.XAPIWrapper.changeConfig(conf);

  return true;
}

/**
 * Sets the home page URL in the global player instance.
 *
 * This function attempts to set the home page URL based on the provided parameter.
 * If no URL is provided, it defaults to the origin of the current page's URL.
 * The function updates the global player instance with the determined home page URL.
 *
 * @param {string} homePage - The URL to set as the home page. If not provided, defaults to the current page's origin.
 * @returns {Promise<boolean>} Returns true if the home page is successfully set, otherwise false if an error occurs.
 */
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

/**
 * Calculates the final score based on open and multiple choice question results.
 * The function retrieves the number of open and multiple choice questions for each category,
 * calculates the maximum possible score, retrieves the actual scores, extracts the multiple choice percentage,
 * and calculates the final weighted percentage.
 *
 * @returns {void}
 */
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
