import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { backend } from "declarations/backend";

let authClient;
let actor;

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const inputSection = document.getElementById("inputSection");
const userInput = document.getElementById("userInput");
const submitButton = document.getElementById("submitButton");
const inputList = document.getElementById("inputList");

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

  const identity = await authClient.getIdentity();
  const agent = new HttpAgent({ identity });
  actor = Actor.createActor(backend.idlFactory, {
    agent,
    canisterId: process.env.BACKEND_CANISTER_ID,
  });

  await updateInputList();
}

loginButton.onclick = async () => {
  authClient.login({
    identityProvider: "https://identity.ic0.app",
    onSuccess: handleAuthenticated,
  });
};

logoutButton.onclick = async () => {
  await authClient.logout();
  loginButton.style.display = "block";
  logoutButton.style.display = "none";
  inputSection.style.display = "none";
  inputList.innerHTML = "";
};

submitButton.onclick = async () => {
  const input = userInput.value.trim();
  if (input) {
    await actor.submitInput(input);
    userInput.value = "";
    await updateInputList();
  }
};

async function updateInputList() {
  const inputs = await actor.getAllInputs();
  inputList.innerHTML = "";
  for (const [principal, input] of inputs) {
    const li = document.createElement("li");
    li.textContent = `${principal.toText()}: ${input}`;
    inputList.appendChild(li);
  }
}

initAuth();
