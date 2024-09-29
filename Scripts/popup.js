let tsne;
// Elements
const emptyListMessage = document.getElementById("empty-list-message");
const messageBox = document.getElementsByClassName("footer-text");
const settingSection = document.getElementById("setting-section");
const homeSection = document.getElementById("home-section");
const container = document.getElementById("container");
const noteList = document.getElementById("note-list");

// kavya's code
const server_url = "http://127.0.0.1:8000";
const chatWithHistoryButton = document.getElementById("chatWithHistory");
const historySection = document.getElementById("history-section");
chatWithHistoryButton.addEventListener("click", toggleChatSection);
const closechatWithHistoryButton = document.getElementById(
  "close-chatWithHistory",
);
closechatWithHistoryButton.addEventListener("click", toggleChatSection);
const askButton = document.getElementById("ask");
// Buttons

const highlighterSwitch = document.getElementById("highlighter");
const closeSettingButton = document.getElementById("close-setting");
const openSettingButton = document.getElementById("open-setting");
const mainSwitch = document.getElementById("main-switch");

// For opening and closing setting/more section
openSettingButton.addEventListener("click", toggleSettingSection);
closeSettingButton.addEventListener("click", toggleSettingSection);
// Pocket
document.addEventListener("DOMContentLoaded", function () {
  const subjects = JSON.parse(localStorage.getItem("subjects")) || {};
  const subjectSelect = document.getElementById("subjectSelect");
  const newSubjectInput = document.getElementById("newSubjectInput");
  const newArticleInput = document.getElementById("newArticleInput");
  const addSubjectButton = document.getElementById("addSubject");
  const addArticleButton = document.getElementById("addArticle");
  const subjectsContainer = document.getElementById("subjects");
  const articlesContainer = document.getElementById("articles");
  const newNoteInput = document.getElementById("newNoteInput");
  const addNoteButton = document.getElementById("addNoteButton");
  const notesContainer = document.getElementById("notes");

  let selectedArticleUrl = null;

  function saveSubjects() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }

  function displaySubjects() {
    subjectsContainer.innerHTML = "";
    subjectSelect.innerHTML = "";
    for (const subjectName in subjects) {
      const subjectDiv = document.createElement("div");
      subjectDiv.className = "subject";
      subjectDiv.innerHTML = `<span class="title">${subjectName}</span>`;

      const deleteButton = document.createElement("span");
      deleteButton.className = "delete-button";
      deleteButton.textContent = "Delete";
      deleteButton.onclick = function () {
        delete subjects[subjectName];
        saveSubjects();
        displaySubjects();
        if (subjectSelect.value === subjectName) {
          articlesContainer.innerHTML = "";
        }
      };

      subjectDiv.appendChild(deleteButton);
      subjectsContainer.appendChild(subjectDiv);

      const option = document.createElement("option");
      option.value = subjectName;
      option.textContent = subjectName;
      subjectSelect.appendChild(option);
    }
  }

  function displayArticles(subjectName) {
    articlesContainer.innerHTML = "";
    const articles = subjects[subjectName] || [];
    articles.forEach((article) => {
      const articleDiv = document.createElement("div");
      articleDiv.className = "article";

      if (article.read === 1) {
        articleDiv.classList.add("read");
      } else if (article.read === 2) {
        articleDiv.classList.add("unread");
      }

      const articleLink = document.createElement("a");
      articleLink.href = article.url;
      articleLink.textContent = article.url;
      articleLink.target = "_blank"; // Open link in a new tab

      const toggleReadButton = document.createElement("button");
      toggleReadButton.className = "toggle-read-button";
      toggleReadButton.textContent = article.read === 1 ? "Unread" : "Read";
      toggleReadButton.onclick = function () {
        article.read = article.read === 1 ? 2 : 1;
        saveSubjects();
        displayArticles(subjectName);
      };

      const deleteButton = document.createElement("span");
      deleteButton.className = "delete-button";
      deleteButton.textContent = "Delete";
      deleteButton.onclick = function () {
        subjects[subjectName] = subjects[subjectName].filter(
          (a) => a.url !== article.url,
        );
        saveSubjects();
        displayArticles(subjectName);
      };

      const noteButton = document.createElement("button");
      noteButton.className = "note-button";
      noteButton.textContent = "View Notes";
      noteButton.onclick = function () {
        selectedArticleUrl = article.url;
        displayNotes(article.url);
      };

      articleDiv.appendChild(articleLink);
      articleDiv.appendChild(toggleReadButton);
      articleDiv.appendChild(deleteButton);
      articleDiv.appendChild(noteButton);
      articlesContainer.appendChild(articleDiv);
    });
  }

  addSubjectButton.onclick = function () {
    const newSubject = newSubjectInput.value.trim();
    if (newSubject && !subjects[newSubject]) {
      subjects[newSubject] = [];
      newSubjectInput.value = "";
      saveSubjects();
      displaySubjects();
    }
  };

  addArticleButton.onclick = function () {
    const selectedSubject = subjectSelect.value;
    const newArticle = newArticleInput.value.trim();
    if (selectedSubject && newArticle) {
      subjects[selectedSubject].push({ url: newArticle, read: 0, notes: [] });
      newArticleInput.value = "";
      saveSubjects();
      displayArticles(selectedSubject);
    }
  };

  subjectSelect.onchange = function () {
    const selectedSubject = subjectSelect.value;
    displayArticles(selectedSubject);
  };

  function saveNotes(subjectName, articleUrl, notes) {
    subjects[subjectName].forEach((article) => {
      if (article.url === articleUrl) {
        article.notes = notes;
      }
    });
    saveSubjects();
  }

  function displayNotes(articleUrl) {
    notesContainer.innerHTML = "";
    const selectedSubject = subjectSelect.value;
    const articles = subjects[selectedSubject] || [];
    let notes = [];

    articles.forEach((article) => {
      if (article.url === articleUrl) {
        notes = article.notes || [];
      }
    });

    notes.forEach((note, index) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note";

      const noteText = document.createElement("span");
      noteText.innerText = note;
      noteDiv.appendChild(noteText);

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.className = "delete-note-button";
      deleteButton.addEventListener("click", function () {
        notes.splice(index, 1);
        saveNotes(selectedSubject, articleUrl, notes);
        displayNotes(articleUrl);
      });

      noteDiv.appendChild(deleteButton);
      notesContainer.appendChild(noteDiv);
    });
  }

  addNoteButton.addEventListener("click", function () {
    const newNote = newNoteInput.value.trim();
    if (newNote && selectedArticleUrl) {
      const selectedSubject = subjectSelect.value;
      const articles = subjects[selectedSubject] || [];
      let notes = [];

      articles.forEach((article) => {
        if (article.url === selectedArticleUrl) {
          if (!article.notes) {
            article.notes = [];
          }
          notes = article.notes;
        }
      });

      notes.push(newNote);
      saveNotes(selectedSubject, selectedArticleUrl, notes);
      newNoteInput.value = "";
      displayNotes(selectedArticleUrl);
    }
  });

  displaySubjects();
  if (subjectSelect.value) {
    displayArticles(subjectSelect.value);
  }

  // kavya's code

  askButton.addEventListener("click", async function () {
    try {
      let content = await getContent(); // wait until promise is resolved
      console.log(content);
      const question = document.getElementById("question").value;

      try {
        if (question) {
          const response = await fetch(server_url + "/parse", {
            // wait until response arrives
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url_and_content: content,
            }),
          });
          const data = await response.text();
          console.log(data);

          const response_query = await fetch(server_url + "/query", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: question,
            }),
          });
          const data_query = await response_query.json();
          console.log(data_query.answer);
          const text = data_query.answer["gpt_answer"];
          console.log(text);
          const urls = data_query.answer["urls"];

          let resultDiv = document.getElementById("ans");

          // Clear any existing content in resultDiv
          resultDiv.innerHTML = "";
          if (text) {
            // Display text
            resultDiv.innerText = text + "\n\nSources:\n\n";

            // Display URLs
            urls.forEach((url) => {
              if (isValidURL(url)) {
                let anchor = document.createElement("a");
                anchor.href = url;
                anchor.textContent = url;
                anchor.target = "_blank"; // Open link in a new tab

                // Add the anchor element and a line break to resultDiv
                resultDiv.appendChild(anchor);
                resultDiv.appendChild(document.createElement("br"));
                resultDiv.appendChild(document.createElement("br"));
              }
            });
          } else {
            resultDiv.innerText =
              "None of the websites you visited answered the query.";
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    } catch (error) {
      console.error("Error retrieving content:", error);
    }
  });
});

// Setting status of switch when its changes
mainSwitch.addEventListener("change", function () {
  chrome.storage.local.set({ status: mainSwitch.checked });
  showBadgeText(mainSwitch.checked);
});

// Setting status of highlighter toggle
highlighterSwitch.addEventListener("change", function () {
  let switchStatus = highlighterSwitch.checked;
  chrome.storage.local.set({ highlight: switchStatus });
  let message = switchStatus ? "ON" : "OFF";
  displayMessage("Highlighter - " + message, 1);
});

// Getting previous value of switches/toggle and updating it
chrome.storage.local.get({ status: true, highlight: false }, function (res) {
  mainSwitch.checked = res.status;
  highlighterSwitch.checked = res.highlight;
  showBadgeText(mainSwitch.checked);
});

//? Home section's functionality for current tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // TabID = hostname of the current website, which is used for storing the notes
  let url = new URL(tabs[0].url);
  console.log(url);
  let tabId = url.href;
  console.log(tabId);
  //url.hostname.toString();

  // Get the all_notes from storage
  chrome.storage.local.get({ all_notes: {} }, function (result) {
    let all_notes = result.all_notes;
    // Display all notes of current site
    showNotes(all_notes, tabId);
  });
});

// For showing notes of current site
function showNotes(all_notes, tabId) {
  // Get the notes for current site
  let notes = all_notes[tabId] || [];

  // If notes are empty then display empty msg and return
  if (!notes || notes.length === 0) {
    showEmptyNotesMessage();
    return;
  }

  // Create notediv element for each notes and display it by **recent added order**
  for (let index = notes.length - 1; index >= 0; --index) {
    let note = notes[index]; // Current Note
    let noteDiv = document.createElement("div"); // Note Block
    let noteText = document.createElement("p"); // Note-text content block
    let deleteBtn = document.createElement("button"); // Note-delete button

    // Setting styling and relevant values
    noteDiv.classList.add("note");
    deleteBtn.classList.add("delete-note-button");
    deleteBtn.innerHTML = '<i class="fa-regular fa-square-minus"></i>';
    deleteBtn.title = "Delete";
    noteText.innerText = note;

    // for deleting the individual note when user clicks on delete note button/icon
    deleteBtn.addEventListener("click", function () {
      notes.splice(index, 1);
      all_notes[tabId] = notes;
      chrome.storage.local.set({ all_notes: all_notes });
      displayMessage("Deleted");

      // delete the note from the new storage
      chrome.storage.local.get('all_notes_container', result => {

        let all_notes_container = result.all_notes_container || {};

        for (let key in all_notes_container) {
          if (all_notes_container[key] === note) {
            // If the note matches the value, delete the key-value pair
            delete all_notes_container[key];
            updateNotesToServer(key);
            break;
          }
        }

        chrome.storage.local.set({ all_notes_container: all_notes_container });
      });


      // After deleting a note, display all notes again **(for maintaining proper indices)**
      noteList.innerHTML = "";
      showNotes(all_notes, tabId);
    });

    // Copy the note to clopboard when user clicks on the note content
    noteText.addEventListener("click", (e) =>
      copyNoteToClipboard(e.target.innerText),
    );

    // appending note-text and delete-button to the note-div and note-div to the note-list
    noteDiv.appendChild(noteText);
    noteDiv.appendChild(deleteBtn);
    noteList.appendChild(noteDiv);
  }
}

// for showing badge text as extension's status
function showBadgeText(status) {
  if (status) {
    chrome.action.setBadgeText({ text: "" });
  } else {
    // Show "OFF" when main switch is turned off
    displayMessage("OFF");
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#ecbfc0" });
  }
}

// for toggling between home and setting section
function toggleSettingSection() {
  if (settingSection.style.display === "block") {
    settingSection.style.display = "none";
    homeSection.style.display = "block";
  } else {
    settingSection.style.display = "block";
    homeSection.style.display = "none";
  }
}

function toggleChatSection() {
  if (historySection.style.display === "block") {
    historySection.style.display = "none";
    homeSection.style.display = "block";
  } else {
    historySection.style.display = "block";
    homeSection.style.display = "none";
  }
}

// for showing empty notes message
function showEmptyNotesMessage() {
  emptyListMessage.style.display = "block";
  container.style.display = "none";
}

// Fun Elements for showing different messages when some event occures
messageBox[0].addEventListener("click", () => displayMessage("Hey!"));
function displayMessage(msg, index = 0) {
  let originalMessage = ["NoteSnap", "Highlighter (Beta)"];

  messageBox[index].innerHTML = msg;
  // Remove the message element after 0.6 seconds
  setTimeout(() => {
    messageBox[index].innerHTML = originalMessage[index];
  }, 600);
}

//history
// handle querying the server and displaying the response
async function queryServer(question) {
  try {
    const response = await fetch("http://127.0.0.1:8000/retrieve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question }),
    });

    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.statusText} (${response.status})`,
      );
    }

    const data = await response.json();
    console.log("question", question);
    console.log("Query response:", data.answer);

    if (data.answer) {
      document.getElementById("answer").innerText = data.answer;
    } else {
      document.getElementById("answer").innerText =
        "No answer returned from the server.";
    }
  } catch (error) {
    console.error("Error querying server:", error);
    document.getElementById("answer").innerText =
      `Error querying server: ${error.message}`;
  }
}

function askQuestion() {
  const questionInput = document.getElementById("questionInput");
  const question = questionInput.value.trim();

  if (question == "") {
    document.getElementById("response").innerText = "Please enter a question.";
    return;
  }

  queryServer(question);
}

document.getElementById("queryButton").addEventListener("click", askQuestion);

/*
// collect the notes and send them to the server using an API call.
async function sendNotesToServer(notes) {
  try {
      const response = await fetch('http://127.0.0.1:8000/query', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "notes": content })

      });
      const data = await response.json();
      console.log('Notes sent successfully:', data);
  } catch (error) {
      console.error('Error sending notes:', error);
  }
}

*/

// Function to delete the note in rag
async function updateNotesToServer(nodes) {
  console.log(nodes);
  try {
    const response = await fetch('http://127.0.0.1:8000/update_nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "id_note": nodes })
    });
    const data = await response.json();
    console.log('Notes sent successfully:', data);
  } catch (error) {
    console.error('Error sending notes:', error);
  }
}

// kavya's code

function getContent() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("userHistory", (result) => {
      let content_dict = {};
      const userHistory = result.userHistory || {}; // get the storage container

      for (let key in userHistory) {
        content_dict[key] = userHistory[key];
      }

      resolve(content_dict);
    });
  });
}

function isValidURL(text) {
  try {
    new URL(text); // create new url object
    return true; // if url was correct no error
  } catch (e) {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('embedButton').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "getHighlights" }, (response) => {
              if (chrome.runtime.lastError || !response) {
                  console.error('Error getting highlights:', chrome.runtime.lastError);
                  return;
              }
              
              chrome.runtime.sendMessage({ action: "embedTexts", texts: response.texts }, (embedResponse) => {
                  if (chrome.runtime.lastError || !embedResponse || embedResponse.error) {
                      console.error('Error embedding texts:', chrome.runtime.lastError || embedResponse.error);
                      return;
                  }

                  console.log('Received embeddings:', embedResponse.embeddings);
                  displayEmbeddings(embedResponse.texts);
                  findSimilarNotes(embedResponse.embeddings[0]); // Assuming you want to find similar notes for the first embedding
              });
          });
      });
  });

  document.getElementById('open-embedding-visualization').addEventListener('click', () => {
      document.getElementById('home-section').style.display = 'none';
      document.getElementById('embedding-visualization').style.display = 'block';
  });

  document.getElementById('close-embedding-visualization').addEventListener('click', () => {
      document.getElementById('embedding-visualization').style.display = 'none';
      document.getElementById('home-section').style.display = 'block';
  });
});
function displayEmbeddings(texts) {
  let container = document.getElementById('embedding-container');
  container.innerHTML = '';
  texts.forEach((text, index) => {
      let embeddingDiv = document.createElement('div');
      embeddingDiv.className = 'note';
      embeddingDiv.innerHTML = `Text: ${text}`;
      container.appendChild(embeddingDiv);
  });
}

function findSimilarNotes(queryEmbedding) {
  chrome.storage.local.get('embeddings', function (result) {
      let embeddings = result.embeddings;
      let similarities = embeddings.map((embedding, index) => {
          return { index: index, similarity: cosineSimilarity(queryEmbedding, embedding) };
      });
      similarities.sort((a, b) => b.similarity - a.similarity);
      displaySimilarNotes(similarities);
  });
}

function cosineSimilarity(a, b) {
  let dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  let magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  let magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

function displaySimilarNotes(similarities) {
  let container = document.getElementById('similar-notes-container');
  container.innerHTML = '';
  similarities.slice(0, 5).forEach(similarity => {
      let noteDiv = document.createElement('div');
      noteDiv.className = 'note';
      noteDiv.innerHTML = `Note ${similarity.index + 1} (Similarity: ${similarity.similarity.toFixed(2)})`;
      container.appendChild(noteDiv);
  });
}



// Dashboard **********************************************************
// Initial DOM elements
const dashboardButton = document.getElementById("dashboard-button");
const dashboardSection = document.getElementById("dashboard-section");
const closeDashboardButton = document.getElementById("close-dashboard");
const updateButton = document.getElementById("update-button");
const deleteHistoryButton = document.getElementById("delete-history-button");
const historyTableBody = document.getElementById("history-table-body");

// Function to toggle the dashboard visibility
function toggleDashboardSection() {
  const isVisible = dashboardSection.style.display !== "block"; // Check if it's not visible
  dashboardSection.style.display = isVisible ? "block" : "none";
  homeSection.style.display = isVisible ? "none" : "block";

  if (isVisible) {
    loadDashboardData();
  }
}

// Add event listeners to buttons
dashboardButton.addEventListener("click", toggleDashboardSection);
closeDashboardButton.addEventListener("click", toggleDashboardSection);
updateButton.addEventListener("click", updateVisitData);
deleteHistoryButton.addEventListener("click", deleteHistory);

// Combined DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, (response) => {
    if (response && response.url) {
      const currentUrl = response.url;

      // Record the visit
      recordVisit(currentUrl);
    }
  });

  // Load initial dashboard data
  loadDashboardData();
});

let lastVisitedUrl = '';

function recordVisit(url) {
  if (url.startsWith('chrome-extension://')) {
    return;
  }

  const history = JSON.parse(localStorage.getItem("history")) || {};

  // Only record the visit if the URL is different from the last visited URL
  if (url !== lastVisitedUrl) {
    lastVisitedUrl = url;  // Update last visited URL

    if (!history[url]) {
      // First visit: set visit time and initialize visit count
      history[url] = {
        visitCount: 1,
        visitTime: new Date().toISOString()  // Record visit time for the first visit
      };
    } else {
      // Subsequent visits: increment the visit count
      history[url].visitCount += 1;
    }

    localStorage.setItem("history", JSON.stringify(history));
  }
}

// Function to load the dashboard data
function loadDashboardData() {
  const history = JSON.parse(localStorage.getItem("history")) || {};
  historyTableBody.innerHTML = ""; // Clear previous entries

  Object.keys(history).forEach(url => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="${url}" target="_blank" title="${url}">
          ${truncateUrl(url, 30)}
        </a>
      </td>
      <td>${new Date(history[url].visitTime).toLocaleString()}</td>
      <td>${history[url].visitCount}</td>
    `;
    historyTableBody.appendChild(row);
  });
}

// Function to update visit data
function updateVisitData() {
  chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, (response) => {
    if (response && response.url) {
      const currentUrl = response.url;

      // Update the visit with the current URL
      updateHistory(currentUrl);
      loadDashboardData(); // Refresh the dashboard data
    }
  });
}

// Function to update visit data in the history
function updateHistory(url) {
  chrome.storage.local.get({ history: {} }, function (result) {
    const history = result.history;

    if (history[url] && history[url].visits.length > 0) {
      // Update the most recent visit
      const lastVisit = history[url].visits[history[url].visits.length - 1];
      // No selectedTextCount update needed
    } else {
      // No existing visit, create a new one
      history[url] = { visits: [{ time: new Date().toISOString() }] };
    }

    chrome.storage.local.set({ history: history }, function () {
      console.log(`Updated visit for ${url}`);
    });
  });
}

// Function to delete all history
function deleteHistory() {
  if (confirm("Are you sure you want to delete all history? This action cannot be undone.")) {
    localStorage.removeItem("history");
    historyTableBody.innerHTML = "";
    console.log("History deleted");
  }
}

// Helper function to truncate long URLs
function truncateUrl(url, maxLength) {
  return url.length > maxLength ? `${url.slice(0, maxLength)}...` : url;
}

