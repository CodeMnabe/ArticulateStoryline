const script = document.createElement("script");
script.src = "http://127.0.0.1:5500/storyline.js";
script.type = "text/javascript";
script.onload = function () {
  console.log("Custom script loaded from localhost.");
};
document.head.appendChild(script);

const openai = document.createElement("openai");
openai.src = "http://127.0.0.1:5500/openaiConnection.js";
openai.type = "text/javascript";
openai.onload = function () {
  console.log("OpenAI connection loaded from localhost.");
};
document.head.appendChild(openai);

const xapiScript = document.createElement("script");
xapiScript.src = "http://127.0.0.1:5500/xapiwrapper.min.js";
xapiScript.onload = function () {
  console.log("xAPI Wrapper loaded.");
};
xapiScript.onerror = function () {
  console.error("Failed to load xAPI Wrapper.");
};
document.head.appendChild(xapiScript);

const checkScriptLoaded = setInterval(() => {
  if (scriptLoaded && typeof ADL !== "undefined") {
    const _player = getGlobalPlayer();

    const user = setUserIDAndName();

    const endpoint = getVar("lrsEndpoint");
    const username = getVar("lrsUsername");
    const password = getVar("lrsPassword");

    setLRSConfig(endpoint, username, password);
    setHomePage("https://digikacademy.talentlms.com/");
    console.log(getVar("homePage"));

    clearInterval(checkScriptLoaded);
  } else {
    console.log("Waiting for scripts to load...");
  }
}, 200);

const check = setInterval(() => {
  if (typeof setContainer === "function") {
    setContainer();
    clearInterval(check);
  } else {
    console.log("Waiting for container to be set...");
  }
}, 200);
