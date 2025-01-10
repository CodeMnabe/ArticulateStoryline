async function createThread() {
  const response = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getVar("token")}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
    },
  });

  const data = await response.json();
  setVar("threadID", data.id);
  return data.id;
}

async function sendMessage(threadID, message) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getVar("token")}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        role: "user",
        content: message,
      }),
    }
  );

  const data = await response.json();
  return data;
}

async function startRun(threadID) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadID}/runs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getVar("token")}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        assistant_id: getVar("assistantID"),
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    console.error(`Error starting run: ${data.error.message}`);
    return null;
  }
  return data.id;
}

async function checkRunStatus(threadId, runId) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getVar("token")}`,
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );
  const data = await response.json();
  return data.status;
}

async function seeMessage(threadId) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/messages`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getVar("token")}`,
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );

  const data = await response.json();
  return data;
}

function showQuestions(text) {
  const score =
    text
      .match(/\*\*Pontuação:\*\*\s*(\d+)%|Pontuação:\s*(\d+)%/)?.[1]
      ?.trim() || "N/A";

  if (score == 100) {
    player.SetVar("rightWrong", "Correto");
  } else {
    player.SetVar("rightWrong", "Incorreto");
  }

  const question = text
    .match(/\*\*Pergunta \d+\/10:? *\*\* *(.*)/)?.[1]
    ?.trim();

  const options = text
    .match(/^(a|b|c|d)\) .*$/gm)
    ?.map((option) => option.replace(/^(a|b|c|d)\)\s*/, "").trim());

  const questionNum = text.match(/\*\*(Pergunta (\d+\/10):)\*\*/)?.[1].trim();

  const remainingText = text
    .replace(/\*\*Pontuação:\*\*\s*(\d+)%|Pontuação:\s*(\d+)%/, "")
    .replace(/\*\*Justificação:\*\*|Justificação\s*/g, "")
    .replace(/\*\*Sugestão de Melhoria:\*\*|Sugestão de Melhoria:\s*/g, "")
    .replace(/\*\*Pergunta \d+\/10:? *\*\* *(.*)/gs, "")
    .replace(/^(a|b|c|d)\) .*$/gm, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\n{2,}/g, "\n")
    .replace(/undefined/, "")
    .trim();

  console.log(`\n\nPergunta: ${remainingText}`);
  console.log("Score: ", score);
  console.log("Question Number: " + questionNum);
  console.log("Question: " + question);

  const num = questionNum.match(/[0-9]/)[0];
  if (Number(num) <= 1) {
    setVar("showFeedback", false);
    setVar("answerA", options[0]);
    setVar("answerB", options[1]);
    setVar("answerC", options[2]);
    setVar("answerD", options[3]);
    setVar("questNum", questionNum);
    setVar("aiQuestion", question);
    return;
  }
  setVar("showFeedback", true);
  setVar("aiResponse", remainingText);
  setVar("nextQuestNum", questionNum);
  setVar("nextAiQuestion", question);
  setVar("score", score);

  if (options) {
    setVar("nextAnswerA", options[0]);
    setVar("nextAnswerB", options[1]);
    setVar("nextAnswerC", options[2]);
    setVar("nextAnswerD", options[3]);
  } else {
    setVar("nextAnswerA", "");
    setVar("nextAnswerB", "");
    setVar("nextAnswerC", "");
    setVar("nextAnswerD", "");
  }
}

function showTextQuestions(text) {
  const score =
    text
      .match(/\*\*Pontuação:\*\*\s*(\d+)%|Pontuação:\s*(\d+)%/)?.[1]
      ?.trim() || "N/A";

  if (score == 100) {
    player.SetVar("rightWrong", "Correto");
  } else {
    player.SetVar("rightWrong", "Incorreto");
  }

  const question = text
    .match(/\*\*Pergunta \d+\/10:? *\*\* *(.*)/)?.[1]
    ?.trim();

  const options = text
    .match(/^(a|b|c|d)\) .*$/gm)
    ?.map((option) => option.replace(/^(a|b|c|d)\)\s*/, "").trim());

  if (options) {
    const optionsList = `a)${options[0]}\nb)${options[1]}\nc)${options[2]}`;
  }
  const questionNum = text.match(/\*\*(Pergunta (\d+\/10):)\*\*/)?.[1].trim();

  const remainingText = text
    .replace(/\*\*Pontuação:\*\*\s*(\d+)%|Pontuação:\s*(\d+)%/, "")
    .replace(/\*\*Justificação:\*\*|Justificação\s*/g, "")
    .replace(/\*\*Sugestão de Melhoria:\*\*|Sugestão de Melhoria:\s*/g, "")
    .replace(/\*\*Pergunta \d+\/10:? *\*\* *(.*)/gs, "")
    .replace(/^(a|b|c|d)\) .*$/gm, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\n{2,}/g, "\n")
    .replace(/undefined/, "")
    .trim();

  console.log(`\n\nPergunta: ${remainingText}`);
  console.log("Score: ", score);
  console.log("Question Number: " + questionNum);
  console.log("Question: " + question);

  setVar("aiResponse", remainingText);
  setVar("questNum", questionNum);
  setVar("aiQuestion", question);
  if (options) {
    setVar("answer", optionsList);
  }
}

function showCards(text) {
  const points = [];
  text
    .match(/\d+\.\s\*\*(.*?)\*\*(?:\s*:)?\s*(.*?)(?=\n\d+\.\s|\n*$)/gs)
    .forEach((point) => {
      const numberMatch = point.match(/^\d+/);
      const titleMatch = point.match(/\*\*(.*?)\*\*/);
      const textMatch = point.match(/\*\*(?:.*?)\*\*(?:\s*:)?\s*(.*)/);

      points.push({
        number: numberMatch ? parseInt(numberMatch[0]) : null,
        title: titleMatch ? titleMatch[1].trim() : null,
        text: textMatch ? textMatch[1].trim() : null,
      });
    });

  const remainingText = text
    .replace(/\d+\.\s\*\*(.*?)\*\*(?:\s*:)?\s*(.*?)(?=\n\d+\.\s|\n*$)/gs, "")
    .replace(/\*\*/, "")
    .trim();

  const [introText, ...conclusionParts] = remainingText.split("\n\n");
  const conclusionText = conclusionParts.join("\n\n").trim();

  const separatedText = `${introText}\n${conclusionText}`;

  console.log(separatedText);

  points.forEach((point, index) => {
    setVar(`title${index + 1}`, point.title);
    setVar(`content${index + 1}`, point.text);

    const isLast = index === points.length - 1;
    if (isLast) {
      setVar(`finish${index + 1}`, true);
    }
  });
  setVar("aiResponse", separatedText);
  setVar("showCards", true);
}

async function showResults(text) {
  const score = await parseInt(
    text
      .match(/Pontuação média: ?(\d+)%|\*\*Pontuação média:\*\* ?(\d+)%/)?.[1]
      ?.trim()
  );

  const results = text.match(/\*?\*?Resumo Final:\*?\*?([\s\S]+)/)?.[1]?.trim();

  text = text.replace(/\*?\*?Resumo Final:\*?\*?[\s\S]+/, "").trim();

  player.SetVar("finalScore", score);
  player.SetVar("resultsText", results);
  player.SetVar("showResults", true);
  return;
}

async function getNumber(text) {
  const number = text.match(/\d+/);
  if (number) {
    return number[0];
  } else {
    return false;
  }
}

async function showData(message, type) {
  let text = message.data[0].content[0].text.value;
  console.log(message.data[0]);

  switch (type) {
    case "normal":
      const cleanText = text.replace(/\*\*/g, "");
      setVar("aiResponse", cleanText);
      return true;
      break;
    case "cards":
      showCards(text);
      break;
    case "question":
      showQuestions(text);
      break;
    case "questionText":
      const cleanQuestionText = text.replace(/\*\*/g, "");
      setVar("aiResponse", cleanQuestionText);
      //showTextQuestions(text);
      break;
    case "results":
      showResults(text);
    case "chat":
      const chatCleanText = text.replace(/\*\*/g, "");
      return chatCleanText;
    case "openQuestion":
      const response = getNumber(text);
      return response;
      break;
  }
}

//Function that shows the loading gif so the user knows that they have to wait.
function showLoading(show) {
  if (show) {
    if (getVar("loading")) {
      setVar("loading", true);
    }
    setVar("canRespond", false);
  } else {
    if (getVar("loading")) {
      setVar("loading", false);
    }
    setVar("canRespond", true);
  }
}

async function pollStatus(threadID, runId) {
  const status = await checkRunStatus(threadID, runId);
  if (status === "completed") {
    return true;
  }
  console.log("Checking status... ", status);
  return new Promise((resolve) => {
    setTimeout(() => resolve(pollStatus(threadID, runId)), 1000);
  });
}

async function chat(outputType, inputType, message) {
  try {
    let _threadId = getVar("threadID");

    if (_threadId == undefined || _threadId == "") {
      _threadId = await createThread();
      console.log("Created new thread with ID:", getVar("threadID"));
    }

    inputType = inputType.charAt(0).toLowerCase() + inputType.slice(1);

    switch (inputType) {
      case "sendMessage":
        await sendMessage(_threadId, message);
        break;
      case "sendInputMessage":
        if (!getVar("canRespond")) {
          return;
        }
        showLoading(true);

        let inputs = player.GetVar("maxInputs");
        if (inputs <= 0) {
          setVar(
            "aiResponse",
            "Parece que não tens mais mensagens que podes mandar :/"
          );
          return;
        }

        if (getVar("UserInput") === null || getVar("UserInput").trim() === "") {
          console.log("Não escreveste nada.");
          return;
        }

        let userMessage = getVar("UserInput");
        await sendMessage(_threadId, userMessage);

        setVar("maxInputs", inputs - 1);
        setVar("UserInput", "");
        break;
    }

    const runID = await startRun(_threadId);

    const pollResult = await pollStatus(_threadId, runID);

    if (pollResult) {
      const messageData = await seeMessage(_threadId);
      const result = await showData(messageData, outputType);
      showLoading(false);
      return result;
    }
  } catch (err) {
    console.error(err);
    showLoading(false);
    throw err;
  }
}
