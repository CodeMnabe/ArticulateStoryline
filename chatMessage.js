let allMessages = [];
let testChatBG;

function getMessages() {
  console.log(allMessages);
}

function setContainer(chatBox) {
  const chatBG = document.querySelector(`[data-model-id="${chatBox}"]`);

  let bgRect = chatBG.getBoundingClientRect();

  let chatContainer = document.createElement("div");
  chatContainer.id = "chatContainer"; // Assign an ID for reference
  chatContainer.style.position = "absolute"; // Position it inside chatBG
  chatContainer.style.left = "5px"; // Add padding from the left
  chatContainer.style.bottom = "20px"; // Anchor it to the bottom of the BG
  chatContainer.style.width = bgRect.width - 20 + "px"; // Slightly smaller than BG
  chatContainer.style.height = "0px"; // Start with height 0
  chatContainer.style.maxHeight = bgRect.height - 30 + "px"; // Limit to BG height
  chatContainer.style.overflowY = "hidden"; // Initially no scrolling
  chatContainer.style.display = "flex"; // Use flexbox for layout
  chatContainer.style.flexDirection = "column"; // Reverse to start adding from bottom
  chatContainer.style.alignItems = "flex-start";
  chatContainer.style.boxSizing = "border-box";
  //chatContainer.style.border = "1px solid #ccc"; // Optional border for testing

  chatBG.appendChild(chatContainer);

  chatBG.addEventListener(
    "wheel",
    function (event) {
      event.preventDefault();
      chatContainer.scrollTop += event.deltaY;

      if (chatContainer.scrollHeight > chatContainer.clientHeight + 10) {
        updateScrollbar(chatContainer);
      }
    },
    { passive: false }
  );

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updateScrollbar(chatContainer) {
  const { scrollTop, scrollHeight, clientHeight } = chatContainer;

  // Check if the scrollbar should be added
  let scrollbar = document.getElementById("scrollbar");
  if (scrollHeight > clientHeight && !scrollbar) {
    scrollbar = document.createElement("div");
    scrollbar.id = "scrollbar";
    scrollbar.style.position = "absolute";
    scrollbar.style.right = "12px";
    scrollbar.style.width = "5px";
    scrollbar.style.backgroundColor = "#007bff";
    scrollbar.style.borderRadius = "5px";
    scrollbar.style.transition = "height 0.1s ease, top 0.1s ease";
    chatContainer.parentElement.appendChild(scrollbar);
  }

  // Update scrollbar styles if it exists
  if (scrollbar) {
    const scrollbarHeight = (clientHeight / scrollHeight) * clientHeight;
    const scrollbarTop = (scrollTop / scrollHeight) * clientHeight;
    scrollbar.style.height = `${scrollbarHeight}px`;
    scrollbar.style.top = `${scrollbarTop + 15}px`; // Adjust for container position
  }

  if (scrollHeight <= clientHeight && scrollbar) {
    scrollbar.remove();
  }
}

function createMessageBox(messageText, messageType) {
  let messageBox = document.createElement("div");
  messageBox.className = "message-box";

  // Style the message box
  messageBox.style.display = "inline-block";
  messageBox.style.maxWidth = "80%";
  messageBox.style.margin = "5px";
  messageBox.style.padding = "10px";
  messageBox.style.borderRadius = "10px";
  messageBox.style.border = "1px solid #1F8AB5";
  messageBox.style.boxSizing = "border-box";
  messageBox.style.overflowWrap = "break-word";
  messageBox.style.wordBreak = "break-word";
  messageBox.style.backgroundColor = "#FFFFFF";
  messageBox.style.opacity = "0"; // Start fully transparent
  messageBox.style.transform = "translateY(10px)"; // Start slightly below its position

  // Align message based on type
  if (messageType === true) {
    messageBox.style.alignSelf = "flex-end";
    messageBox.style.backgroundColor = "#DCF8C6"; // Sent messages
  } else {
    messageBox.style.alignSelf = "flex-start";
  }

  // Create the text node
  let messageTextNode = document.createElement("p");
  messageTextNode.style.margin = "0";
  messageTextNode.style.fontFamily = "Calibri, sans-serif";
  messageTextNode.style.fontSize = "24px";
  messageTextNode.style.lineHeight = "1.2";
  messageTextNode.style.whiteSpace = "pre-wrap";
  messageTextNode.textContent = messageText;

  if (messageText !== "...") {
    allMessages.push({ text: messageText, isUser: messageType });
  }

  messageBox.appendChild(messageTextNode);

  requestAnimationFrame(() => {
    setTimeout(() => {
      messageBox.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      messageBox.style.opacity = "1"; // Fade in
      messageBox.style.transform = "translateY(0)"; // Slide to its final position
    }, 50);
  });

  return messageBox;
}

async function updateChatContainerHeight() {
  const chatContainer = window.chatContainer;
  if (!chatContainer) {
    console.error("Chat container not initialized.");
    return;
  }

  // Calculate the total height of all child elements
  let totalHeight = 0;
  Array.from(chatContainer.children).forEach((child) => {
    totalHeight += child.offsetHeight + 10; // Include margins (adjust as needed)
  });

  // Update the chat container's height
  const maxHeight = parseInt(chatContainer.style.maxHeight, 10);
  if (totalHeight <= maxHeight) {
    chatContainer.style.height = totalHeight + "px";
    chatContainer.style.overflowY = "hidden"; // Disable scrolling
  } else {
    chatContainer.style.height = maxHeight + "px";
    chatContainer.style.overflowY = "auto"; // Enable scrolling
  }
}

async function addMessageToChatContainer(messageText, messageType) {
  let chatContainer = window.chatContainer;
  if (!chatContainer) {
    console.error("Chat container not initialized.");
    return;
  }

  // Create the message box
  let messageBox = createMessageBox(messageText, messageType);

  // Append the message box to the chat container
  chatContainer.appendChild(messageBox);

  updateChatContainerHeight();

  // Scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  if (chatContainer.scrollHeight > chatContainer.clientHeight + 20) {
    updateScrollbar(chatContainer);
  }

  return messageBox;
}

async function getTextFromChatContainer(inputTextID) {
  //6qNhac7fZxu
  var textContainer = document.querySelector(
    `[data-model-id="${inputTextID}"]`
  );

  if (textContainer) {
    var textInput = textContainer.querySelector("textarea");

    if (textInput) {
      textInput.blur();
      processChatMessage();
    } else {
      console.error(
        `Textarea not found within container for data-model-id ${inputTextID}.`
      );
    }
  } else {
    console.error(`Container with data-model-id ${inputTextID} not found.`);
  }
}

async function processChatMessage() {
  const userInput = getVar("UserInput");

  if (userInput.trim() === "") {
    console.error("No input provided.");
    return;
  }

  // Add the user's message to the chat container
  addMessageToChatContainer(userInput, true);
  const randomDelay = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
  await new Promise((resolve) => setTimeout(resolve, randomDelay));
  const messageBox = await addMessageToChatContainer("...", false);
  try {
    // Call the chat function to get a response
    const response = await chat("chat", "sendInputMessage");

    messageBox.remove();
    updateChatContainerHeight();

    // Add the received message to the chat container
    addMessageToChatContainer(response, false);
  } catch (error) {
    console.error("Error during chat interaction:", error);
  }
}

async function showPreviousMessages() {
  allMessages.forEach(async (element) => {
    await addMessageToChatContainer(element.text, element.isUser);
  });
}

function scroll(direction) {
  if (direction === "up") {
    window.chatContainer.scrollTop -= 50;
  } else if (direction === "down") {
    window.chatContainer.scrollTop += 50;
  }
}
