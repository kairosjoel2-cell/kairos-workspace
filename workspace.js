
/* =========================================
   KAIROS WORKSPACE
   Local-first workspace manager
========================================= */

"use strict";

const STORAGE_KEYS = {
  projects: "kairos_workspace_projects_v1",
  resources: "kairos_workspace_resources_v1",
  notes: "kairos_workspace_notes_v1"
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function loadData(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let projects = loadData(STORAGE_KEYS.projects);
let resources = loadData(STORAGE_KEYS.resources);
let notes = loadData(STORAGE_KEYS.notes);
let activeNoteId = notes[0]?.id || null;
let toastTimer;

/* =========================================
   ELEMENTS
========================================= */

const sidebar = $("#sidebar");
const menuButton = $("#menuButton");
const currentSection = $("#currentSection");
const projectModal = $("#projectModal");
const projectForm = $("#projectForm");
const resourceForm = $("#resourceForm");
const projectSearch = $("#projectSearch");
const noteTitle = $("#noteTitle");
const noteBody = $("#noteBody");
const noteStatus = $("#noteStatus");
const toastElement = $("#toast");

/* =========================================
   UTILITIES
========================================= */

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function showToast(message) {
  if (!toastElement) return;

  toastElement.textContent = message;
  toastElement.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2600);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function makeEmptyState(message) {
  const empty = makeElement("div", "empty-state");
  const paragraph = makeElement("p", "", message);
  empty.append(paragraph);
  return empty;
}

/* =========================================
   NAVIGATION
========================================= */

function switchView(viewName) {
  const target = $(`#view-${viewName}`);

  if (!target) return;

  $$(".view").forEach(view => {
    view.classList.toggle("active", view === target);
  });

  $$(".side-link[data-view]").forEach(link => {
    link.classList.toggle(
      "active",
      link.dataset.view === viewName
    );
  });

  const activeLink = $(`.side-link[data-view="${viewName}"]`);

  if (currentSection) {
    currentSection.textContent =
      activeLink?.textContent.trim() ||
      viewName.charAt(0).toUpperCase() + viewName.slice(1);
  }

  sidebar?.classList.remove("open");
}

$$(".side-link[data-view]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    switchView(link.dataset.view);
  });
});

$$("[data-view-link]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    switchView(link.dataset.viewLink);
  });
});

menuButton?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

/* =========================================
   PROJECT MODAL
========================================= */

function openProjectModal() {
  if (!projectModal) return;

  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");

  setTimeout(() => $("#projectName")?.focus(), 100);
}

function closeProjectModal() {
  if (!projectModal) return;

  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
}

$$('[data-action="new-project"]').forEach(button => {
  button.addEventListener("click", openProjectModal);
});

$("#closeProjectModal")?.addEventListener("click", closeProjectModal);

projectModal?.addEventListener("click", event => {
  if (event.target === projectModal) {
    closeProjectModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeProjectModal();
    sidebar?.classList.remove("open");
  }
});

/* =========================================
   PROJECTS
========================================= */

function createProjectCard(project) {
  const card = makeElement("article", "project-card");

  const top = makeElement("div", "project-card-top");
  const type = makeElement("span", "project-type", project.type || "Other");
  const date = makeElement("span", "project-date", formatDate(project.createdAt));

  top.append(type, date);

  const title = makeElement("h3", "", project.name);
  const description = makeElement(
    "p",
    "",
    project.description || "No description added."
  );

  const footer = makeElement("div", "project-card-footer");
  const status = makeElement("span", "project-status", "Local project");
  const deleteButton = makeElement("button", "delete-project", "Delete");

  deleteButton.type = "button";
  deleteButton.addEventListener("click", () => {
    deleteProject(project.id);
  });

  footer.append(status, deleteButton);
  card.append(top, title, description, footer);

  return card;
}

function renderProjects() {
  const recentContainer = $("#recentProjects");
  const allContainer = $("#allProjects");

  const sorted = [...projects].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (recentContainer) {
    recentContainer.replaceChildren();

    if (!sorted.length) {
      recentContainer.append(
        makeEmptyState("Your recent projects will appear here.")
      );
    } else {
      sorted.slice(0, 3).forEach(project => {
        recentContainer.append(createProjectCard(project));
      });
    }
  }

  if (allContainer) {
    const search = projectSearch?.value.trim().toLowerCase() || "";

    const filtered = sorted.filter(project => {
      return (
        project.name.toLowerCase().includes(search) ||
        (project.type || "").toLowerCase().includes(search) ||
        (project.description || "").toLowerCase().includes(search)
      );
    });

    allContainer.replaceChildren();

    if (!filtered.length) {
      allContainer.append(
        makeEmptyState(
          search ? "No matching projects found." : "No projects yet. Create your first project."
        )
      );
    } else {
      filtered.forEach(project => {
        allContainer.append(createProjectCard(project));
      });
    }
  }

  const count = $("#projectCount");
  if (count) count.textContent = projects.length;
}

function deleteProject(id) {
  const project = projects.find(item => item.id === id);
  if (!project) return;

  if (!confirm(`Delete "${project.name}"?`)) return;

  projects = projects.filter(item => item.id !== id);
  saveData(STORAGE_KEYS.projects, projects);
  renderProjects();
  showToast("Project deleted.");
}

projectForm?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#projectName")?.value.trim();
  const type = $("#projectType")?.value || "Other";
  const description = $("#projectDescription")?.value.trim();

  if (!name) {
    showToast("Enter a project name first.");
    return;
  }

  projects.unshift({
    id: createId(),
    name,
    type,
    description,
    createdAt: new Date().toISOString()
  });

  saveData(STORAGE_KEYS.projects, projects);
  renderProjects();

  projectForm.reset();
  closeProjectModal();
  switchView("projects");
  showToast("Project created successfully.");
});

projectSearch?.addEventListener("input", renderProjects);

/* =========================================
   RESOURCES
========================================= */

function renderResources() {
  const container = $("#resourceList");
  const count = $("#resourceCount");

  if (count) count.textContent = resources.length;
  if (!container) return;

  container.replaceChildren();

  if (!resources.length) {
    container.append(
      makeEmptyState("Saved resources will appear here.")
    );
    return;
  }

  resources.forEach(resource => {
    const item = makeElement("article", "resource-item");

    const details = makeElement("div", "resource-details");
    const title = makeElement("h3", "", resource.title);
    const urlText = makeElement("p", "", resource.url);

    details.append(title, urlText);

    const actions = makeElement("div", "resource-actions");

    const openButton = makeElement("a", "resource-open", "Open");
    openButton.href = resource.url;
    openButton.target = "_blank";
    openButton.rel = "noopener noreferrer";

    const removeButton = makeElement("button", "resource-remove", "Remove");
    removeButton.type = "button";
    removeButton.addEventListener("click", () => {
      resources = resources.filter(item => item.id !== resource.id);
      saveData(STORAGE_KEYS.resources, resources);
      renderResources();
      showToast("Resource removed.");
    });

    actions.append(openButton, removeButton);
    item.append(details, actions);
    container.append(item);
  });
}

resourceForm?.addEventListener("submit", event => {
  event.preventDefault();

  const title = $("#resourceTitle")?.value.trim();
  const rawURL = $("#resourceURL")?.value.trim();

  if (!title || !rawURL) {
    showToast("Complete both resource fields.");
    return;
  }

  let parsedURL;

  try {
    parsedURL = new URL(
      /^https?:\/\//i.test(rawURL) ? rawURL : `https://${rawURL}`
    );
  } catch {
    showToast("Enter a valid website address.");
    return;
  }

  if (!["http:", "https:"].includes(parsedURL.protocol)) {
    showToast("Only website links are supported.");
    return;
  }

  resources.unshift({
    id: createId(),
    title,
    url: parsedURL.href,
    createdAt: new Date().toISOString()
  });

  saveData(STORAGE_KEYS.resources, resources);
  resourceForm.reset();
  renderResources();
  showToast("Resource saved.");
});

/* =========================================
   NOTES
========================================= */

function setNoteEditorEnabled(enabled) {
  if (noteTitle) noteTitle.disabled = !enabled;
  if (noteBody) noteBody.disabled = !enabled;
  if ($("#deleteNote")) $("#deleteNote").disabled = !enabled;
}

function renderNotes() {
  const container = $("#notesList");
  const count = $("#noteCount");

  if (count) count.textContent = notes.length;
  if (!container) return;

  container.replaceChildren();

  if (!notes.length) {
    container.append(makeEmptyState("No notes yet."));
  } else {
    notes
      .slice()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .forEach(note => {
        const button = makeElement(
          "button",
          "note-list-item",
          note.title || "Untitled note"
        );

        button.type = "button";
        button.dataset.noteId = note.id;

        if (note.id === activeNoteId) {
          button.classList.add("active");
        }

        button.addEventListener("click", () => {
          saveActiveNote();
          activeNoteId = note.id;
          renderNotes();
          loadActiveNote();
        });

        container.append(button);
      });
  }
}

function loadActiveNote() {
  const note = notes.find(item => item.id === activeNoteId);

  if (!note) {
    if (noteTitle) noteTitle.value = "";
    if (noteBody) noteBody.value = "";
    if (noteStatus) noteStatus.textContent = "No note selected";
    setNoteEditorEnabled(false);
    return;
  }

  if (noteTitle) noteTitle.value = note.title || "";
  if (noteBody) noteBody.value = note.body || "";
  if (noteStatus) noteStatus.textContent = "Saved locally";
  setNoteEditorEnabled(true);
}

function saveActiveNote() {
  const note = notes.find(item => item.id === activeNoteId);
  if (!note) return;

  note.title = noteTitle?.value.trim() || "Untitled note";
  note.body = noteBody?.value || "";
  note.updatedAt = new Date().toISOString();

  saveData(STORAGE_KEYS.notes, notes);
}

function updateActiveNote() {
  const note = notes.find(item => item.id === activeNoteId);
  if (!note) return;

  note.title = noteTitle?.value.trim() || "Untitled note";
  note.body = noteBody?.value || "";
  note.updatedAt = new Date().toISOString();

  saveData(STORAGE_KEYS.notes, notes);

  if (noteStatus) noteStatus.textContent = "Saved locally";
  renderNotes();
}

$("#newNote")?.addEventListener("click", () => {
  const note = {
    id: createId(),
    title: "Untitled note",
    body: "",
    updatedAt: new Date().toISOString()
  };

  notes.unshift(note);
  activeNoteId = note.id;

  saveData(STORAGE_KEYS.notes, notes);
  renderNotes();
  loadActiveNote();
  noteTitle?.focus();

  showToast("New note created.");
});

noteTitle?.addEventListener("input", updateActiveNote);
noteBody?.addEventListener("input", updateActiveNote);

$("#deleteNote")?.addEventListener("click", () => {
  const note = notes.find(item => item.id === activeNoteId);
  if (!note) return;

  if (!confirm("Delete this note?")) return;

  notes = notes.filter(item => item.id !== activeNoteId);
  activeNoteId = notes[0]?.id || null;

  saveData(STORAGE_KEYS.notes, notes);
  renderNotes();
  loadActiveNote();
  showToast("Note deleted.");
});

/* =========================================
   INITIALIZE
========================================= */

function initializeWorkspace() {
  renderProjects();
  renderResources();
  renderNotes();
  loadActiveNote();
  switchView("overview");
}

initializeWorkspace();
