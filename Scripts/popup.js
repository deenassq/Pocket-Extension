// Elements
const emptyListMessage = document.getElementById("empty-list-message");
const messageBox = document.getElementsByClassName("footer-text");
const settingSection = document.getElementById("setting-section");
const homeSection = document.getElementById("home-section");
const container = document.getElementById("container");
const noteList = document.getElementById("note-list");

// Buttons

const highlighterSwitch = document.getElementById("highlighter");
const closeSettingButton = document.getElementById("close-setting");
const openSettingButton = document.getElementById("open-setting");
const mainSwitch = document.getElementById('main-switch');

// For opening and closing setting/more section
openSettingButton.addEventListener("click", toggleSettingSection);
closeSettingButton.addEventListener("click", toggleSettingSection);
// Pocket
document.addEventListener('DOMContentLoaded', function() {
    const subjects = JSON.parse(localStorage.getItem('subjects')) || {};
    const subjectSelect = document.getElementById('subjectSelect');
    const newSubjectInput = document.getElementById('newSubjectInput');
    const newArticleInput = document.getElementById('newArticleInput');
    const addSubjectButton = document.getElementById('addSubject');
    const addArticleButton = document.getElementById('addArticle');
    const subjectsContainer = document.getElementById('subjects');
    const articlesContainer = document.getElementById('articles');
    const newNoteInput = document.getElementById('newNoteInput');
    const addNoteButton = document.getElementById('addNoteButton');
    const notesContainer = document.getElementById('notes');
  
    let selectedArticleUrl = null;
  
    function saveSubjects() {
      localStorage.setItem('subjects', JSON.stringify(subjects));
    }
  
    function displaySubjects() {
      subjectsContainer.innerHTML = '';
      subjectSelect.innerHTML = '';
      for (const subjectName in subjects) {
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject';
        subjectDiv.innerHTML = `<span class="title">${subjectName}</span>`;
        
        const deleteButton = document.createElement('span');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
          delete subjects[subjectName];
          saveSubjects();
          displaySubjects();
          if (subjectSelect.value === subjectName) {
            articlesContainer.innerHTML = '';
          }
        };
  
        subjectDiv.appendChild(deleteButton);
        subjectsContainer.appendChild(subjectDiv);
  
        const option = document.createElement('option');
        option.value = subjectName;
        option.textContent = subjectName;
        subjectSelect.appendChild(option);
      }
    }
  
    function displayArticles(subjectName) {
      articlesContainer.innerHTML = '';
      const articles = subjects[subjectName] || [];
      articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.className = 'article';
  
        if (article.read === 1) {
          articleDiv.classList.add('read');
        } else if (article.read === 2) {
          articleDiv.classList.add('unread');
        }
  
        const articleLink = document.createElement('a');
        articleLink.href = article.url;
        articleLink.textContent = article.url;
        articleLink.target = '_blank'; // Open link in a new tab
  
        const toggleReadButton = document.createElement('button');
        toggleReadButton.className = 'toggle-read-button';
        toggleReadButton.textContent = article.read === 1 ? 'Unread' : 'Read';
        toggleReadButton.onclick = function() {
          article.read = article.read === 1 ? 2 : 1;
          saveSubjects();
          displayArticles(subjectName);
        };
  
        const deleteButton = document.createElement('span');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
          subjects[subjectName] = subjects[subjectName].filter(a => a.url !== article.url);
          saveSubjects();
          displayArticles(subjectName);
        };
  
        const noteButton = document.createElement('button');
        noteButton.className = 'note-button';
        noteButton.textContent = 'View Notes';
        noteButton.onclick = function() {
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
  
    addSubjectButton.onclick = function() {
      const newSubject = newSubjectInput.value.trim();
      if (newSubject && !subjects[newSubject]) {
        subjects[newSubject] = [];
        newSubjectInput.value = '';
        saveSubjects();
        displaySubjects();
      }
    };
  
    addArticleButton.onclick = function() {
      const selectedSubject = subjectSelect.value;
      const newArticle = newArticleInput.value.trim();
      if (selectedSubject && newArticle) {
        subjects[selectedSubject].push({ url: newArticle, read: 0, notes: [] });
        newArticleInput.value = '';
        saveSubjects();
        displayArticles(selectedSubject);
      }
    };
  
    subjectSelect.onchange = function() {
      const selectedSubject = subjectSelect.value;
      displayArticles(selectedSubject);
    };
  
    function saveNotes(subjectName, articleUrl, notes) {
      subjects[subjectName].forEach(article => {
        if (article.url === articleUrl) {
          article.notes = notes;
        }
      });
      saveSubjects();
    }
  
    function displayNotes(articleUrl) {
      notesContainer.innerHTML = '';
      const selectedSubject = subjectSelect.value;
      const articles = subjects[selectedSubject] || [];
      let notes = [];
  
      articles.forEach(article => {
        if (article.url === articleUrl) {
          notes = article.notes || [];
        }
      });
  
      notes.forEach((note, index) => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        
        const noteText = document.createElement('span');
        noteText.innerText = note;
        noteDiv.appendChild(noteText);
  
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.className = 'delete-note-button';
        deleteButton.addEventListener('click', function() {
          notes.splice(index, 1);
          saveNotes(selectedSubject, articleUrl, notes);
          displayNotes(articleUrl);
        });
  
        noteDiv.appendChild(deleteButton);
        notesContainer.appendChild(noteDiv);
      });
    }
  
    addNoteButton.addEventListener('click', function() {
      const newNote = newNoteInput.value.trim();
      if (newNote && selectedArticleUrl) {
        const selectedSubject = subjectSelect.value;
        const articles = subjects[selectedSubject] || [];
        let notes = [];
  
        articles.forEach(article => {
          if (article.url === selectedArticleUrl) {
            if (!article.notes) {
              article.notes = [];
            }
            notes = article.notes;
          }
        });
  
        notes.push(newNote);
        saveNotes(selectedSubject, selectedArticleUrl, notes);
        newNoteInput.value = '';
        displayNotes(selectedArticleUrl);
      }
    });
  
    displaySubjects();
    if (subjectSelect.value) {
      displayArticles(subjectSelect.value);
    }
  });
  


// Setting status of switch when its changes
mainSwitch.addEventListener('change', function () {
    chrome.storage.sync.set({ 'status': mainSwitch.checked });
    showBadgeText(mainSwitch.checked);
});

// Setting status of highlighter toggle
highlighterSwitch.addEventListener("change", function () {
    let switchStatus = highlighterSwitch.checked;
    chrome.storage.sync.set({ 'highlight': switchStatus });
    let message = (switchStatus) ? "ON" : "OFF";
    displayMessage("Highlighter - " + message, 1);
});

// Getting previous value of switches/toggle and updating it
chrome.storage.sync.get({ 'status': true, 'highlight': false }, function (res) {
    mainSwitch.checked = res.status;
    highlighterSwitch.checked = res.highlight;
    showBadgeText(mainSwitch.checked);
})

//? Home section's functionality for current tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // TabID = hostname of the current website, which is used for storing the notes
    let url = new URL(tabs[0].url);
    let tabId = url.hostname.toString();

    // Get the all_notes from storage
    chrome.storage.sync.get({ 'all_notes': {} }, function (result) {
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
        let note = notes[index];                            // Current Note
        let noteDiv = document.createElement("div");        // Note Block
        let noteText = document.createElement("p");         // Note-text content block
        let deleteBtn = document.createElement("button");   // Note-delete button

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
            chrome.storage.sync.set({ 'all_notes': all_notes });
            displayMessage("Deleted");

            // After deleting a note, display all notes again **(for maintaining proper indices)**
            noteList.innerHTML = "";
            showNotes(all_notes, tabId);
        });

        // Copy the note to clopboard when user clicks on the note content
        noteText.addEventListener('click', (e) => copyNoteToClipboard(e.target.innerText));

        // appending note-text and delete-button to the note-div and note-div to the note-list
        noteDiv.appendChild(noteText);
        noteDiv.appendChild(deleteBtn);
        noteList.appendChild(noteDiv);
    };
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

// for showing empty notes message
function showEmptyNotesMessage() {
    emptyListMessage.style.display = "block";
    container.style.display = "none";
}

// Fun Elements for showing different messages when some event occures
messageBox[0].addEventListener('click', () => displayMessage("Hey!"));
function displayMessage(msg, index = 0) {
    let originalMessage = [
        "NoteSnap",
        "Highlighter (Beta)"
      
    ];

    messageBox[index].innerHTML = msg;
    // Remove the message element after 0.6 seconds
    setTimeout(() => {
        messageBox[index].innerHTML = originalMessage[index];
    }, 600);
}


//history
/*
// Call sendHighlights where you have the highlights data ready
addNoteButton.addEventListener('click', function() {
  const newNote = newNoteInput.value.trim();
  if (newNote && selectedArticleUrl) {
      const selectedSubject = subjectSelect.value;
      const articles = subjects[selectedSubject] || [];
      let notes = [];

      articles.forEach(article => {
          if (article.url === selectedArticleUrl) {
              if (!article.notes) {
                  article.notes = [];
              }
              notes = article.notes;
          }
      });
      console.log(notes);
      notes.push(newNote);
      console.log(notes);
      saveNotes(selectedSubject, selectedArticleUrl, notes);
      newNoteInput.value = '';
      displayNotes(selectedArticleUrl);

      // Send highlights to the backend
      sendNotesToServer(notes);
  }
});
*/
// handle querying the server and displaying the response

async function queryServer(question) {
  try {
      const response = await fetch('http://127.0.0.1:8000/retrieve', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 'question' : question })
      });

      if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log('Query response:', data);

      if(data.answer['response']) {
          document.getElementById('response').innerText = data.answer['response'];
      } else {
          document.getElementById('response').innerText = 'No answer returned from the server.';
      }
  } catch (error) {
      console.error('Error querying server:', error);
      document.getElementById('response').innerText = `Error querying server: ${error.message}`;
  }
}

function askQuestion() {
  const questionInput = document.getElementById('questionInput');
  const question = questionInput.value.trim();

  if (question === '') {
      document.getElementById('response').innerText = 'Please enter a question.';
      return;
  }

  queryServer(question);
}

document.getElementById('queryButton').addEventListener('click', askQuestion);


// collect the notes and send them to the server using an API call.
async function sendNotesToServer(notes) {
  try {
      const response = await fetch('http://127.0.0.1:8000/add_nodes', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "all_notes": content })

      });
      const data = await response.json();
      console.log('Notes sent successfully:', data);
  } catch (error) {
      console.error('Error sending notes:', error);
  }
}


