import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "declarations/backend/backend.did.js";

let authClient;
let actor;

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const inputSection = document.getElementById("inputSection");
const userInput = document.getElementById("userInput");
const submitButton = document.getElementById("submitButton");
const inputList = document.getElementById("inputList");
const errorMessage = document.getElementById("errorMessage");

const BACKEND_CANISTER_ID = process.env.BACKEND_CANISTER_ID || "";

async function initAuth() {
  authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    handleAuthenticated();
  }
}

async function handleAuthenticated() {
  loginButton.style.display = "none";
  logoutButton.style.display = "block";
  inputSection.style.display = "block";

  try {
    const identity = await authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    
    if (!BACKEND_CANISTER_ID) {
      throw new Error("Backend canister ID is not set");
    }

    actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: BACKEND_CANISTER_ID,
    });

    await updateInputList();
  } catch (error) {
    console.error("Error during authentication:", error);
    displayError("Authentication failed. Please try again.");
  }
}

loginButton.onclick = async () => {
  try {
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: handleAuthenticated,
    });
  } catch (error) {
    console.error("Login error:", error);
    displayError("Login failed. Please try again.");
  }
};

logoutButton.onclick = async () => {
  try {
    await authClient.logout();
    loginButton.style.display = "block";
    logoutButton.style.display = "none";
    inputSection.style.display = "none";
    inputList.innerHTML = "";
    actor = null;
  } catch (error) {
    console.error("Logout error:", error);
    displayError("Logout failed. Please try again.");
  }
};

submitButton.onclick = async () => {
  const input = userInput.value.trim();
  if (input && actor) {
    try {
      await actor.submitInput(input);
      userInput.value = "";
      await updateInputList();
    } catch (error) {
      console.error("Submit input error:", error);
      displayError("Failed to submit input. Please try again.");
    }
  } else if (!actor) {
    displayError("Not authenticated. Please log in first.");
  }
};

async function updateInputList() {
  if (!actor) {
    console.error("Actor is not initialized");
    return;
  }

  try {
    const inputs = await actor.getAllInputs();
    inputList.innerHTML = "";
    for (const [principal, input] of inputs) {
      const li = document.createElement("li");
      li.textContent = `${principal.toText()}: ${input}`;
      inputList.appendChild(li);
    }
  } catch (error) {
    console.error("Error fetching inputs:", error);
    displayError("Failed to fetch inputs. Please try again.");
  }
}

function displayError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 5000);
}

initAuth();
