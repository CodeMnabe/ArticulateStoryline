function createConnections(scripts, index = 0) {
  if (index >= scripts.length) {
    return;
  }

  const { source, functions } = scripts[index];

  let script = document.querySelector(`script[src="${source}"]`);

  if (script) {
    invokeFunctions(functions);
    createConnections(scripts, index + 1);
    return;
  }

  script = document.createElement("script");
  script.src = source;
  script.type = "text/javascript";
  script.onload = function () {
    invokeFunctions(functions);
    createConnections(scripts, index + 1);
  };
  script.onerror = function () {
    console.error(`Failed to load script: ${source}`);
    createConnections(scripts, index + 1);
  };
  document.head.appendChild(script);
}

function invokeFunctions(functions) {
  if (!Array.isArray(functions) || functions.length === 0) {
    return;
  }

  functions.forEach((fn) => {
    try {
      // Extract the function name and optional arguments
      const match = fn.match(/^([\w$]+)\((.*)\)$/);
      if (!match) {
        console.error(`"${fn}" is not a valid function call format.`);
        return;
      }

      const functionName = match[1];
      const args = match[2] ? match[2].split(",").map((arg) => arg.trim()) : [];

      // Check if the function exists on the global window object
      const func = window[functionName];
      if (typeof func === "function") {
        func(...args);
        //console.log(`Function ${functionName} executed successfully.`);
      } else {
        console.error(`Function "${functionName}" does not exist.`);
      }
    } catch (error) {
      console.error(`Error executing function "${fn}":`, error);
    }
  });
}
