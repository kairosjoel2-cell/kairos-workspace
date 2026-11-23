
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================
  // KAIROS DEVELOP — CORE APPLICATION
  // ==========================================

  const $ = (selector) => document.querySelector(selector);

  const storageKey = "kairos_develop_projects";
  const settingsKey = "kairos_develop_settings";

  const elements = {
    sidebar: $("#sidebar"),
    toast: $("#toast"),
    projectModal: $("#projectModal"),
    projectForm: $("#projectForm"),
    projectName: $("#projectName"),
    projectType: $("#projectType"),
    createProject: $("#createProject"),
    closeProjectModal: $("#closeProjectModal"),
    cancelProject: $("#cancelProject"),

    fileTree: $("#fileTree"),
    codeEditor: $("#codeEditor"),
    editorPlaceholder: $("#editorPlaceholder"),
    editorTabs: $("#editorTabs"),
    editorFileStatus: $("#editorFileStatus"),
    editorLanguage: $("#editorLanguage"),

    recentProjects: $("#recentProjects"),
    allProjects: $("#allProjects"),
    projectCount: $("#projectCount"),

    terminalOutput: $("#terminalOutput"),
    terminalInput: $("#terminalInput"),
    terminalForm: $("#terminalForm"),
    clearTerminal: $("#clearTerminal"),

    playgroundHTML: $("#playgroundHTML"),
    playgroundCSS: $("#playgroundCSS"),
    playgroundJS: $("#playgroundJS"),
    playgroundFrame: $("#playgroundFrame"),

    jsonInput: $("#jsonInput"),
    jsonOutput: $("#jsonOutput"),
    jsonStatus: $("#jsonStatus"),

    breadcrumbCurrent: $("#breadcrumbCurrent"),
    interfaceTheme: $("#interfaceTheme"),
    editorFontSize: $("#editorFontSize"),
    wordWrap: $("#wordWrap"),

    saveProject: $("#saveProject"),
    addFile: $("#addFile"),
    runPlayground: $("#runPlayground"),
    refreshPreview: $("#refreshPreview"),

    formatJSON: $("#formatJSON"),
    minifyJSON: $("#minifyJSON"),
    clearJSON: $("#clearJSON"),
    copyJSON: $("#copyJSON"),

    themeToggle: $("#themeToggle"),
    mobileMenu: $("#mobileMenu")
  };

  // Stop early if the HTML and JavaScript do not match.
  const required = [
    "sidebar",
    "projectModal",
    "projectForm",
    "fileTree",
    "codeEditor",
    "terminalOutput",
    "playgroundHTML",
    "playgroundCSS",
    "playgroundJS",
    "playgroundFrame"
  ];

  const missing = required.filter((key) => !elements[key]);

  if (missing.length) {
    console.error(
      "KAIROS DEVELOP: Missing HTML elements:",
      missing.join(", ")
    );
    alert(
      "DEVELOP could not start. Some HTML elements are missing. Check the console for details."
    );
    return;
  }

  let projects = loadProjects();
  let activeProjectId = null;
  let activeFileName = null;
  let toastTimer = null;

  // ==========================================
  // STORAGE
  // ==========================================

  function loadProjects() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Could not load projects:", error);
      return [];
    }
  }

  function saveProjects() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(projects));
      renderProjects();
      return true;
    } catch (error) {
      console.error("Could not save projects:", error);
      showToast("Storage is full or unavailable.");
      return false;
    }
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(settingsKey)) || {};
    } catch {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return replacements[character];
    });
  }

  function showToast(message) {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      elements.toast.classList.remove("show");
    }, 2600);
  }

  function createId() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function getActiveProject() {
    return projects.find(
      (project) => project.id === activeProjectId
    ) || null;
  }

  function getFileExtension(filename) {
    return filename.includes(".")
      ? filename.split(".").pop().toLowerCase()
      : "text";
  }

  function getLanguage(filename) {
    const extensions = {
      html: "HTML",
      htm: "HTML",
      css: "CSS",
      js: "JavaScript",
      mjs: "JavaScript",
      json: "JSON",
      md: "Markdown",
      txt: "Plain Text",
      svg: "SVG",
      xml: "XML",
      py: "Python"
    };

    return extensions[getFileExtension(filename)] || "Plain Text";
  }

  function getFileSymbol(filename) {
    const extension = getFileExtension(filename);

    const symbols = {
      html: "H",
      htm: "H",
      css: "C",
      js: "J",
      json: "{}",
      md: "M",
      txt: "T",
      svg: "S",
      py: "P"
    };

    return symbols[extension] || "F";
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  function openView(viewName) {
    const target = document.getElementById("view-" + viewName);

    if (!target) return;

    document.querySelectorAll(".app-view").forEach((view) => {
      view.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".side-link").forEach((link) => {
      link.classList.toggle(
        "active",
        link.dataset.view === viewName
      );
    });

    const labels = {
      overview: "Overview",
      editor: "Code Editor",
      playground: "Playground",
      json: "JSON Formatter",
      terminal: "Terminal",
      settings: "Settings"
    };

    if (elements.breadcrumbCurrent) {
      elements.breadcrumbCurrent.textContent =
        labels[viewName] || viewName;
    }

    elements.sidebar.classList.remove("open");

    if (viewName === "playground") {
      runPlayground();
    }

    if (viewName === "terminal") {
      elements.terminalInput.focus();
    }
  }

  document.querySelectorAll(".side-link").forEach((link) => {
    link.addEventListener("click", () => {
      openView(link.dataset.view);
    });
  });

  // ==========================================
  // PROJECT MODAL
  // ==========================================

  function openProjectModal() {
    elements.projectModal.classList.add("open");
    elements.projectName.value = "";
    elements.projectName.focus();
  }

  function closeProjectModal() {
    elements.projectModal.classList.remove("open");
  }

  document.querySelectorAll('[data-action="new-project"]').forEach((button) => {
    button.addEventListener("click", openProjectModal);
  });

  elements.closeProjectModal?.addEventListener("click", closeProjectModal);
  elements.cancelProject?.addEventListener("click", closeProjectModal);

  elements.projectModal.addEventListener("click", (event) => {
    if (event.target === elements.projectModal) {
      closeProjectModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectModal();
    }
  });

  // ==========================================
  // PROJECT TEMPLATES
  // ==========================================

  function getProjectFiles(type) {
    if (type === "blank") {
      return [
        {
          name: "README.md",
          content: "# My Project\n\nCreated with KAIROS DEVELOP."
        }
      ];
    }

    if (type === "javascript") {
      return [
        {
          name: "index.js",
          content: 'console.log("Hello from KAIROS DEVELOP!");'
        },
        {
          name: "README.md",
          content: "# JavaScript Project"
        }
      ];
    }

    return [
      {
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <main>
    <h1>Hello, world!</h1>
    <p>My first KAIROS DEVELOP project.</p>
  </main>

  <script src="script.js"><\/script>
</body>
</html>`
        },
        {
          name: "style.css",
          content: `body {
  margin: 0;
  padding: 40px;
  font-family: Arial, sans-serif;
  background: #f4f5f2;
  color: #202820;
}

h1 {
  color: #245c45;
}`
        },
        {
          name: "script.js",
          content: `console.log("Project is running!");`
        }
      ];
  }

  elements.projectForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = elements.projectName.value.trim();
    const type = elements.projectType.value;

    if (!name) {
      showToast("Enter a project name first.");
      return;
    }

    const project = {
      id: createId(),
      name,
      type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files: getProjectFiles(type)
    };

    projects.unshift(project);

    if (!saveProjects()) {
      projects.shift();
      return;
    }

    closeProjectModal();
    openProject(project.id);
    showToast("Project created successfully.");
  });

  // ==========================================
  // PROJECT DISPLAY
  // ==========================================

  function projectCard(project) {
    return `
      <article class="project-card">
        <div class="project-card-top">
          <div class="project-card-icon">⌘</div>
          <span class="project-card-type">
            ${escapeHTML(project.type)}
          </span>
        </div>

        <h3>${escapeHTML(project.name)}</h3>

        <p>Updated ${formatDate(project.updatedAt)}</p>

        <div class="project-card-bottom">
          <span class="text-link">
            ${project.files.length} files
          </span>

          <button
            class="project-open"
            type="button"
            data-open-project="${escapeHTML(project.id)}"
          >
            Open project ↗
          </button>
        </div>
      </article>
    `;
  }

  function renderProjects() {
    if (!elements.allProjects) return;

    const count = projects.length;

    if (elements.projectCount) {
      elements.projectCount.textContent =
        count + (count === 1 ? " project" : " projects");
    }

    if (count === 0) {
      elements.recentProjects.innerHTML = `
        <div class="empty-projects">
          <div class="empty-icon">⌘</div>
          <h3>Your workspace starts here</h3>
          <p>Create your first project to get started.</p>
          <button class="primary-button" data-action="new-project" type="button">
            Create project
          </button>
        </div>
      `;

      elements.allProjects.innerHTML = "";
      return;
    }

    elements.recentProjects.innerHTML = projects
      .slice(0, 3)
      .map(projectCard)
      .join("");

    elements.allProjects.innerHTML = projects
      .map(projectCard)
      .join("");
  }

  document.addEventListener("click", (event) => {
    const projectButton = event.target.closest("[data-open-project]");

    if (projectButton) {
      openProject(projectButton.dataset.openProject);
      return;
    }

    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) return;

    const action = actionButton.dataset.action;

    const actions = {
      "new-project": openProjectModal,
      "open-editor": () => openView("editor"),
      "open-playground": () => openView("playground"),
      "open-json": () => openView("json"),
      "open-terminal": () => openView("terminal")
    };

    if (actions[action]) actions[action]();
  });

  // ==========================================
  // CODE EDITOR
  // ==========================================

  function openProject(projectId) {
    const project = projects.find((item) => item.id === projectId);

    if (!project) {
      showToast("Project could not be found.");
      return;
    }

    activeProjectId = project.id;
    activeFileName = null;

    renderFileTree();
    renderEditor();

    openView("editor");
    showToast("Opened " + project.name);
  }

  function renderFileTree() {
    const project = getActiveProject();

    if (!project) {
      elements.fileTree.innerHTML = `
        <div class="file-tree-empty">
          Create or open a project to see its files.
        </div>
      `;
      return;
    }

    elements.fileTree.innerHTML = project.files
      .map((file) => `
        <button
          class="file-item ${file.name === activeFileName ? "active" : ""}"
          type="button"
          data-open-file="${escapeHTML(file.name)}"
        >
          <span class="file-symbol">
            ${escapeHTML(getFileSymbol(file.name))}
          </span>
          <span>${escapeHTML(file.name)}</span>
        </button>
      `)
      .join("");
  }

  function renderEditor() {
    const project = getActiveProject();

    if (!project) {
      elements.editorPlaceholder.style.display = "flex";
      elements.codeEditor.style.display = "none";
      elements.editorTabs.innerHTML =
        '<div class="editor-empty-tab">No project open</div>';
      elements.editorFileStatus.textContent = "No file selected";
      elements.editorLanguage.textContent = "Plain Text";
      return;
    }

    const file = project.files.find(
      (item) => item.name === activeFileName
    );

    if (!file) {
      activeFileName = null;
      elements.editorPlaceholder.style.display = "flex";
      elements.codeEditor.style.display = "none";
      elements.editorTabs.innerHTML =
        '<div class="editor-empty-tab">Select a file</div>';
      elements.editorFileStatus.textContent = project.name;
      elements.editorLanguage.textContent = "Plain Text";
      return;
    }

    elements.editorPlaceholder.style.display = "none";
    elements.codeEditor.style.display = "block";

    elements.editorTabs.innerHTML = `
      <div class="editor-tab">
        ${escapeHTML(file.name)}
      </div>
    `;

    elements.codeEditor.value = file.content;
    elements.editorFileStatus.textContent = file.name;
    elements.editorLanguage.textContent = getLanguage(file.name);

    renderFileTree();
  }

  function openFile(filename) {
    const project = getActiveProject();
    if (!project) return;

    const file = project.files.find((item) => item.name === filename);
    if (!file) return;

    activeFileName = filename;
    renderEditor();
  }

  elements.fileTree.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-file]");
    if (button) openFile(button.dataset.openFile);
  });

  function saveActiveFile(showMessage = true) {
    const project = getActiveProject();

    if (!project || !activeFileName) {
      if (showMessage) showToast("Open a file first.");
      return false;
    }

    const file = project.files.find(
      (item) => item.name === activeFileName
    );

    if (!file) return false;

    file.content = elements.codeEditor.value;
    project.updatedAt = Date.now();

    const saved = saveProjects();

    if (saved && showMessage) {
      showToast("Changes saved.");
    }

    return saved;
  }

  elements.codeEditor.addEventListener("input", () => {
    const project = getActiveProject();

    if (!project || !activeFileName) return;

    const file = project.files.find(
      (item) => item.name === activeFileName
    );

    if (file) {
      file.content = elements.codeEditor.value;
      project.updatedAt = Date.now();
    }
  });

  elements.saveProject?.addEventListener("click", () => {
    saveActiveFile(true);
  });

  // ==========================================
  // ADD FILE
  // ==========================================

  elements.addFile?.addEventListener("click", () => {
    const project = getActiveProject();

    if (!project) {
      showToast("Open a project first.");
      return;
    }

    const filename = prompt("Enter the new file name:");

    if (!filename) return;

    const cleanName = filename.trim();

    if (!cleanName || cleanName.includes("/") || cleanName.includes("\\")) {
      showToast("Enter a valid file name.");
      return;
    }

    if (project.files.some((file) => file.name === cleanName)) {
      showToast("A file with that name already exists.");
      return;
    }

    project.files.push({
      name: cleanName,
      content: ""
    });

    project.updatedAt = Date.now();

    if (!saveProjects()) {
      project.files.pop();
      return;
    }

    activeFileName = cleanName;
    renderEditor();
    showToast("File created.");
  });

  // ==========================================
  // PLAYGROUND
  // ==========================================

  function runPlayground() {
    const html = elements.playgroundHTML.value;
    const css = elements.playgroundCSS.value;
    const javascript = elements.playgroundJS.value;

    const safeJS = JSON.stringify(javascript).replace(/</g, "\\u003c");

    const safeCSS = css.replace(/<\/style/gi, "<\\/style");

    const documentContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${safeCSS}</style>
      </head>
      <body>
        ${html}
        <script>
          try {
            new Function(${safeJS})();
          } catch (error) {
            console.error(error);
          }
        <\/script>
      </body>
      </html>
    `;

    elements.playgroundFrame.srcdoc = documentContent;
    showToast("Preview updated.");
  }

  elements.runPlayground?.addEventListener("click", runPlayground);
  elements.refreshPreview?.addEventListener("click", runPlayground);

  // ==========================================
  // JSON FORMATTER
  // ==========================================

  function processJSON(minify = false) {
    const input = elements.jsonInput.value.trim();

    if (!input) {
      elements.jsonStatus.textContent = "Enter JSON first.";
      showToast("No JSON input found.");
      return;
    }

    try {
      const parsed = JSON.parse(input);

      elements.jsonOutput.value = minify
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);

      elements.jsonStatus.textContent = "Valid JSON";
      showToast(minify ? "JSON minified." : "JSON formatted.");
    } catch (error) {
      elements.jsonStatus.textContent = "Invalid JSON: " + error.message;
      showToast("Please check your JSON syntax.");
    }
  }

  elements.formatJSON?.addEventListener("click", () => {
    processJSON(false);
  });

  elements.minifyJSON?.addEventListener("click", () => {
    processJSON(true);
  });

  elements.clearJSON?.addEventListener("click", () => {
    elements.jsonInput.value = "";
    elements.jsonOutput.value = "";
    elements.jsonStatus.textContent = "Cleared";
  });

  elements.copyJSON?.addEventListener("click", async () => {
    const output = elements.jsonOutput.value;

    if (!output) {
      showToast("There is nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      showToast("Output copied.");
    } catch {
      elements.jsonOutput.select();
      const copied = document.execCommand("copy");
      showToast(copied ? "Output copied." : "Copy failed.");
    }
  });

  // ==========================================
  // TERMINAL SIMULATOR
  // ==========================================

  function terminalWrite(message, className = "") {
    const line = document.createElement("div");

    if (className) line.className = className;

    line.textContent = message;
    elements.terminalOutput.appendChild(line);

    elements.terminalOutput.scrollTop =
      elements.terminalOutput.scrollHeight;
  }

  function terminalWelcome() {
    terminalWrite("KAIROS DEVELOP TERMINAL");
    terminalWrite("Browser command simulator · Version 1.0");
    terminalWrite('Type "help" to view available commands.');
    terminalWrite("");
  }

  function runCommand(rawCommand) {
    const command = rawCommand.trim();

    if (!command) return;

    terminalWrite("kairos > " + command, "terminal-command");

    const parts = command.split(" ");
    const name = parts[0].toLowerCase();
    const argument = parts.slice(1).join(" ");

    switch (name) {
      case "help":
        terminalWrite("AVAILABLE COMMANDS");
        terminalWrite("help       - Show available commands");
        terminalWrite("clear      - Clear terminal");
        terminalWrite("date       - Show current date");
        terminalWrite("time       - Show current time");
        terminalWrite("projects   - List saved projects");
        terminalWrite("open NAME  - Open a project");
        terminalWrite("files      - List current project files");
        terminalWrite("about      - About KAIROS DEVELOP");
        terminalWrite("echo TEXT  - Display a message");
        break;

      case "clear":
        elements.terminalOutput.innerHTML = "";
        break;

      case "date":
        terminalWrite(new Date().toDateString());
        break;

      case "time":
        terminalWrite(new Date().toLocaleTimeString());
        break;

      case "projects":
        if (!projects.length) {
          terminalWrite("No projects created yet.");
        } else {
          projects.forEach((project) => {
            terminalWrite("- " + project.name);
          });
        }
        break;

      case "open": {
        if (!argument) {
          terminalWrite("Usage: open PROJECT_NAME");
          break;
        }

        const project = projects.find(
          (item) => item.name.toLowerCase() === argument.toLowerCase()
        );

        if (project) {
          openProject(project.id);
          terminalWrite("Opened project: " + project.name);
        } else {
          terminalWrite("Project not found.");
        }
        break;
      }

      case "files": {
        const project = getActiveProject();

        if (!project) {
          terminalWrite("No project is currently open.");
        } else {
          project.files.forEach((file) => {
            terminalWrite("- " + file.name);
          });
        }
        break;
      }

      case "about":
        terminalWrite("KAIROS DEVELOP 1.0");
        terminalWrite("A local browser-based development workspace.");
        terminalWrite("No backend or external API required.");
        break;

      case "echo":
        terminalWrite(argument);
        break;

      default:
        terminalWrite(
          "Unknown command: " + name + ". Type help to see commands."
        );
    }

    terminalWrite("");
  }

  elements.terminalForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const command = elements.terminalInput.value;

    runCommand(command);
    elements.terminalInput.value = "";
  });

  elements.clearTerminal?.addEventListener("click", () => {
    elements.terminalOutput.innerHTML = "";
    terminalWrite("Terminal cleared.");
  });

  // ==========================================
  // SETTINGS
  // ==========================================

  function applyTheme(theme) {
    document.body.classList.toggle(
      "light-theme",
      theme === "light"
    );

    if (elements.interfaceTheme) {
      elements.interfaceTheme.value = theme;
    }
  }

  function applyFontSize(size) {
    elements.codeEditor.style.fontSize = size + "px";

    if (elements.editorFontSize) {
      elements.editorFontSize.value = String(size);
    }
  }

  function applyWordWrap(enabled) {
    elements.codeEditor.style.whiteSpace =
      enabled ? "pre-wrap" : "pre";

    elements.codeEditor.style.overflowX =
      enabled ? "hidden" : "auto";

    if (elements.wordWrap) {
      elements.wordWrap.checked = enabled;
    }
  }

  const settings = loadSettings();

  applyTheme(settings.theme || "dark");
  applyFontSize(settings.fontSize || 14);
  applyWordWrap(settings.wordWrap !== false);

  elements.interfaceTheme?.addEventListener("change", () => {
    const theme = elements.interfaceTheme.value;

    applyTheme(theme);
    saveSettings({ ...loadSettings(), theme });
  });

  elements.editorFontSize?.addEventListener("change", () => {
    const fontSize = Number(elements.editorFontSize.value);

    applyFontSize(fontSize);
    saveSettings({ ...loadSettings(), fontSize });
  });

  elements.wordWrap?.addEventListener("change", () => {
    const wordWrap = elements.wordWrap.checked;

    applyWordWrap(wordWrap);
    saveSettings({ ...loadSettings(), wordWrap });
  });

  elements.themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme")
      ? "dark"
      : "light";

    applyTheme(nextTheme);
    saveSettings({ ...loadSettings(), theme: nextTheme });
  });

  // ==========================================
  // MOBILE MENU
  // ==========================================

  elements.mobileMenu?.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 800 &&
      elements.sidebar.classList.contains("open") &&
      !elements.sidebar.contains(event.target) &&
      !elements.mobileMenu?.contains(event.target)
    ) {
      elements.sidebar.classList.remove("open");
    }
  });

  // ==========================================
  // START APPLICATION
  // ==========================================

  renderProjects();
  renderEditor();
  terminalWelcome();
  runPlayground();

  console.log("KAIROS DEVELOP initialized successfully.");
});
