
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const workspace = document.getElementById("integratedWorkspace");
  const workspaceTitle = document.getElementById("workspaceTitle");
  const workspaceContent = document.getElementById("workspaceContent");
  const closeWorkspace = document.getElementById("closeWorkspace");
  const toolCards = document.querySelectorAll("[data-tool]");

  if (!workspace || !workspaceTitle || !workspaceContent || !closeWorkspace) {
    console.error("KAIROS workspace elements are missing.");
    return;
  }

  const toolNames = {
    dimension: "Dimension Studio",
    palette: "Palette Generator",
    inspector: "Colour Inspector",
    gradient: "Gradient Studio",
    pairing: "Font Pairing",
    tester: "Type Tester",
    calculator: "Design Calculator"
  };

  const templates = {
    dimension: `
      <div class="tool-panel">
        <p class="tool-description">Resize images with precise dimensions. Everything runs locally in your browser.</p>
        <div class="tool-field">
          <label class="tool-label" for="dimensionFile">SELECT IMAGE</label>
          <input class="tool-input" id="dimensionFile" type="file" accept="image/*">
        </div>
        <div class="tool-result-grid">
          <div class="tool-field">
            <label class="tool-label" for="dimensionWidth">WIDTH (PX)</label>
            <input class="tool-input" id="dimensionWidth" type="number" min="1" max="8192" placeholder="1200">
          </div>
          <div class="tool-field">
            <label class="tool-label" for="dimensionHeight">HEIGHT (PX)</label>
            <input class="tool-input" id="dimensionHeight" type="number" min="1" max="8192" placeholder="800">
          </div>
        </div>
        <label class="tool-checkbox">
          <input type="checkbox" id="dimensionRatio" checked>
          <span>Preserve aspect ratio</span>
        </label>
        <div class="tool-field">
          <label class="tool-label" for="dimensionFormat">OUTPUT FORMAT</label>
          <select class="tool-select" id="dimensionFormat">
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div class="dimension-preview" id="dimensionPreview">
          <span>Your image preview will appear here</span>
        </div>
        <p class="tool-status" id="dimensionStatus">Choose an image to begin.</p>
        <div class="tool-actions">
          <button class="tool-button" id="resizeImage" type="button" disabled>RESIZE IMAGE ↗</button>
          <button class="tool-button secondary" id="downloadImage" type="button" disabled>DOWNLOAD</button>
        </div>
      </div>
    `,

    palette: `
      <div class="tool-panel">
        <p class="tool-description">Generate colour combinations for brands, interfaces and creative projects.</p>
        <div class="tool-field">
          <label class="tool-label" for="paletteHarmony">COLOUR HARMONY</label>
          <select class="tool-select" id="paletteHarmony">
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="monochromatic">Monochromatic</option>
          </select>
        </div>
        <div class="palette-swatches" id="paletteSwatches"></div>
        <p class="tool-status" id="paletteStatus">Select a colour to copy its HEX value.</p>
        <div class="tool-actions">
          <button class="tool-button" id="generatePalette" type="button">GENERATE PALETTE ↗</button>
          <button class="tool-button secondary" id="copyPalette" type="button">COPY ALL HEX</button>
        </div>
      </div>
    `,

    inspector: `
      <div class="tool-panel">
        <p class="tool-description">Inspect any colour and get its HEX, RGB and HSL values instantly.</p>
        <div class="inspector-layout">
          <div class="inspector-preview" id="inspectorPreview"></div>
          <div class="tool-field">
            <label class="tool-label" for="inspectorColor">COLOUR PICKER</label>
            <input class="tool-input" id="inspectorColor" type="color" value="#B6F36B">
          </div>
        </div>
        <div class="tool-field">
          <label class="tool-label" for="inspectorHex">HEX VALUE</label>
          <input class="tool-input" id="inspectorHex" type="text" value="#B6F36B" maxlength="7">
        </div>
        <div class="colour-value">
          <span>RGB</span>
          <strong id="inspectorRGB">182, 243, 107</strong>
          <button class="copy-value" data-copy="inspectorRGB" type="button">COPY</button>
        </div>
        <div class="colour-value">
          <span>HSL</span>
          <strong id="inspectorHSL">85, 83%, 69%</strong>
          <button class="copy-value" data-copy="inspectorHSL" type="button">COPY</button>
        </div>
        <p class="tool-status" id="inspectorStatus">Colour values updated.</p>
        <button class="tool-button" id="copyInspectorHex" type="button">COPY HEX ↗</button>
      </div>
    `,

    gradient: `
      <div class="tool-panel">
        <p class="tool-description">Build smooth gradients and copy production-ready CSS.</p>
        <div class="tool-result-grid">
          <div class="tool-field">
            <label class="tool-label" for="gradientFirst">FIRST COLOUR</label>
            <input class="tool-input" id="gradientFirst" type="color" value="#B6F36B">
          </div>
          <div class="tool-field">
            <label class="tool-label" for="gradientSecond">SECOND COLOUR</label>
            <input class="tool-input" id="gradientSecond" type="color" value="#5546D8">
          </div>
        </div>
        <div class="tool-field">
          <label class="tool-label" for="gradientAngle">ANGLE <span id="gradientAngleValue">135°</span></label>
          <input id="gradientAngle" type="range" min="0" max="360" value="135">
        </div>
        <div class="gradient-preview" id="gradientPreview"></div>
        <div class="gradient-code" id="gradientCode"></div>
        <div class="tool-actions">
          <button class="tool-button" id="copyGradient" type="button">COPY CSS ↗</button>
          <button class="tool-button secondary" id="randomGradient" type="button">RANDOMISE</button>
        </div>
      </div>
    `,

    pairing: `
      <div class="tool-panel">
        <p class="tool-description">Explore practical font combinations for headings and body text.</p>
        <div class="tool-field">
          <label class="tool-label" for="fontPairPreset">FONT COMBINATION</label>
          <select class="tool-select" id="fontPairPreset">
            <option value="modern">Modern — Space Grotesk + DM Sans</option>
            <option value="editorial">Editorial — Georgia + Arial</option>
            <option value="classic">Classic — Arial + Georgia</option>
            <option value="minimal">Minimal — Trebuchet MS + Arial</option>
            <option value="bold">Bold — Impact + Arial</option>
            <option value="elegant">Elegant — Georgia + Trebuchet MS</option>
          </select>
        </div>
        <div class="font-pair-preview" id="fontPairPreview">
          <span class="pair-heading">Ideas deserve better design.</span>
          <p class="pair-body">A thoughtful font combination gives every message its own character. Good typography makes information easier to read.</p>
          <span class="pair-caption">KAIROS / TYPOGRAPHY STUDY</span>
        </div>
        <div class="tool-result">
          <span class="tool-label">HEADING FONT</span>
          <strong id="headingFontName">Space Grotesk</strong>
          <span class="tool-label">BODY FONT</span>
          <strong id="bodyFontName">DM Sans</strong>
        </div>
      </div>
    `,

    tester: `
      <div class="tool-panel">
        <p class="tool-description">Test typography before using it in your next design.</p>
        <div class="tool-field">
          <label class="tool-label" for="typeText">YOUR TEXT</label>
          <textarea class="tool-textarea" id="typeText" rows="3">Design is intelligence made visible.</textarea>
        </div>
        <div class="tool-field">
          <label class="tool-label" for="typeFont">FONT FAMILY</label>
          <select class="tool-select" id="typeFont">
            <option value="Arial, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Impact, sans-serif">Impact</option>
            <option value="system-ui, sans-serif">System UI</option>
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
        <div class="tool-result-grid">
          <div class="tool-field">
            <label class="tool-label" for="typeSize">SIZE <span id="typeSizeValue">48px</span></label>
            <input id="typeSize" type="range" min="12" max="100" value="48">
          </div>
          <div class="tool-field">
            <label class="tool-label" for="typeWeight">WEIGHT</label>
            <select class="tool-select" id="typeWeight">
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </div>
        </div>
        <div class="tool-field">
          <label class="tool-label" for="typeSpacing">LETTER SPACING <span id="typeSpacingValue">0px</span></label>
          <input id="typeSpacing" type="range" min="-3" max="12" step="0.5" value="0">
        </div>
        <div class="type-preview" id="typePreview">Design is intelligence made visible.</div>
      </div>
    `,

    calculator: `
      <div class="tool-panel">
        <p class="tool-description">Useful calculations for everyday design work.</p>

        <div class="calculator-section">
          <h3>01 / Aspect Ratio</h3>
          <div class="tool-result-grid">
            <div class="tool-field">
              <label class="tool-label" for="ratioWidth">WIDTH</label>
              <input class="tool-input" id="ratioWidth" type="number" min="1" value="1920">
            </div>
            <div class="tool-field">
              <label class="tool-label" for="ratioHeight">HEIGHT</label>
              <input class="tool-input" id="ratioHeight" type="number" min="1" value="1080">
            </div>
          </div>
          <div class="calculator-result" id="ratioResult">16:9</div>
        </div>

        <div class="calculator-section">
          <h3>02 / Percentage Scale</h3>
          <div class="tool-result-grid">
            <div class="tool-field">
              <label class="tool-label" for="scaleValue">ORIGINAL VALUE</label>
              <input class="tool-input" id="scaleValue" type="number" min="0" value="500">
            </div>
            <div class="tool-field">
              <label class="tool-label" for="scalePercent">SCALE (%)</label>
              <input class="tool-input" id="scalePercent" type="number" value="50">
            </div>
          </div>
          <div class="calculator-result" id="scaleResult">250</div>
        </div>

        <div class="calculator-section">
          <h3>03 / PX to REM</h3>
          <div class="tool-field">
            <label class="tool-label" for="pxValue">PIXEL VALUE</label>
            <input class="tool-input" id="pxValue" type="number" min="0" value="32">
          </div>
          <div class="tool-field">
            <label class="tool-label" for="remBase">ROOT FONT SIZE (PX)</label>
            <input class="tool-input" id="remBase" type="number" min="1" value="16">
          </div>
          <div class="calculator-result" id="remResult">2rem</div>
        </div>
      </div>
    `
  };

  function showWorkspace(tool) {
    if (!templates[tool]) return;

    workspaceTitle.textContent = toolNames[tool];
    workspaceContent.innerHTML = templates[tool];
    workspace.hidden = false;

    initialiseTool(tool);

    workspace.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  toolCards.forEach(card => {
    card.addEventListener("click", () => {
      showWorkspace(card.dataset.tool);
    });
  });

  closeWorkspace.addEventListener("click", () => {
    workspace.hidden = true;
    document.getElementById("design-tools")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  async function copyText(value) {
    if (!value) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (error) {
      // Use the fallback below.
    }

    const temporary = document.createElement("textarea");
    temporary.value = value;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.appendChild(temporary);
    temporary.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    temporary.remove();
    return copied;
  }

  function initialiseTool(tool) {
    if (tool === "dimension") initDimension();
    if (tool === "palette") initPalette();
    if (tool === "inspector") initInspector();
    if (tool === "gradient") initGradient();
    if (tool === "pairing") initPairing();
    if (tool === "tester") initTester();
    if (tool === "calculator") initCalculator();
  }

  function initDimension() {
    const fileInput = document.getElementById("dimensionFile");
    const widthInput = document.getElementById("dimensionWidth");
    const heightInput = document.getElementById("dimensionHeight");
    const ratioInput = document.getElementById("dimensionRatio");
    const formatInput = document.getElementById("dimensionFormat");
    const preview = document.getElementById("dimensionPreview");
    const status = document.getElementById("dimensionStatus");
    const resizeButton = document.getElementById("resizeImage");
    const downloadButton = document.getElementById("downloadImage");

    let image = null;
    let originalRatio = 1;
    let outputUrl = null;

    function clearOutput() {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      outputUrl = null;
      downloadButton.disabled = true;
    }

    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        status.textContent = "Please choose a valid image file.";
        return;
      }

      clearOutput();
      const reader = new FileReader();

      reader.onload = () => {
        const loadedImage = new Image();

        loadedImage.onload = () => {
          image = loadedImage;
          originalRatio = image.naturalWidth / image.naturalHeight;

          widthInput.value = image.naturalWidth;
          heightInput.value = image.naturalHeight;

          preview.replaceChildren();
          const previewImage = document.createElement("img");
          previewImage.src = reader.result;
          previewImage.alt = "Selected image preview";
          preview.appendChild(previewImage);

          resizeButton.disabled = false;
          status.textContent = `Original size: ${image.naturalWidth} × ${image.naturalHeight}px`;
        };

        loadedImage.onerror = () => {
          status.textContent = "This image could not be opened.";
        };

        loadedImage.src = reader.result;
      };

      reader.onerror = () => {
        status.textContent = "Unable to read this file.";
      };

      reader.readAsDataURL(file);
    });

    widthInput.addEventListener("input", () => {
      if (!image || !ratioInput.checked) return;
      const width = Number(widthInput.value);
      if (width > 0) heightInput.value = Math.round(width / originalRatio);
    });

    heightInput.addEventListener("input", () => {
      if (!image || !ratioInput.checked) return;
      const height = Number(heightInput.value);
      if (height > 0) widthInput.value = Math.round(height * originalRatio);
    });

    resizeButton.addEventListener("click", () => {
      if (!image) return;

      const width = Number(widthInput.value);
      const height = Number(heightInput.value);

      if (
        !Number.isInteger(width) ||
        !Number.isInteger(height) ||
        width < 1 ||
        height < 1 ||
        width > 8192 ||
        height > 8192
      ) {
        status.textContent = "Enter dimensions between 1 and 8192 pixels.";
        return;
      }

      if (width * height > 40000000) {
        status.textContent = "That image is too large to process safely. Try smaller dimensions.";
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        status.textContent = "Your browser could not create the image.";
        return;
      }

      const format = formatInput.value;

      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }

      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(blob => {
        if (!blob) {
          status.textContent = "Image export failed. Try another format.";
          return;
        }

        clearOutput();
        outputUrl = URL.createObjectURL(blob);
        downloadButton.disabled = false;
        status.textContent = `Ready: ${width} × ${height}px · ${format.replace("image/", "").toUpperCase()}`;
      }, format, 0.92);
    });

    downloadButton.addEventListener("click", () => {
      if (!outputUrl) return;

      const extension = formatInput.value.split("/")[1].replace("jpeg", "jpg");
      const link = document.createElement("a");
      link.href = outputUrl;
      link.download = `kairos-resized-image.${extension}`;
      link.click();
    });

    workspaceContent.addEventListener("DOMNodeRemoved", () => {
      clearOutput();
    }, { once: true });
  }

  function initPalette() {
    const harmony = document.getElementById("paletteHarmony");
    const swatches = document.getElementById("paletteSwatches");
    const status = document.getElementById("paletteStatus");
    const generateButton = document.getElementById("generatePalette");
    const copyButton = document.getElementById("copyPalette");

    let currentPalette = [];

    function hslToHex(h, s, l) {
      s /= 100;
      l /= 100;

      const a = s * Math.min(l, 1 - l);
      const channel = n => {
        const k = (n + h / 30) % 12;
        const colour = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * colour).toString(16).padStart(2, "0");
      };

      return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase();
    }

    function generate() {
      const base = Math.floor(Math.random() * 360);
      const mode = harmony.value;

      let hues;

      if (mode === "complementary") {
        hues = [base, base + 25, base + 180, base + 205, base + 155];
      } else if (mode === "analogous") {
        hues = [base - 40, base - 20, base, base + 20, base + 40];
      } else if (mode === "triadic") {
        hues = [base, base + 120, base + 240, base + 15, base + 135];
      } else {
        hues = [base, base, base, base, base];
      }

      currentPalette = hues.map((hue, index) => {
        const saturation = mode === "monochromatic" ? 45 + index * 10 : 55 + (index % 3) * 12;
        const lightness = mode === "monochromatic" ? 25 + index * 13 : [35, 48, 60, 72, 82][index];
        return hslToHex((hue + 360) % 360, saturation, lightness);
      });

      swatches.innerHTML = "";

      currentPalette.forEach(colour => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "palette-swatch";
        button.style.backgroundColor = colour;
        button.title = `Copy ${colour}`;
        button.setAttribute("aria-label", `Copy ${colour}`);

        const label = document.createElement("span");
        label.textContent = colour;
        button.appendChild(label);

        button.addEventListener("click", async () => {
          const success = await copyText(colour);
          status.textContent = success ? `${colour} copied.` : "Copy failed. Select the HEX value manually.";
        });

        swatches.appendChild(button);
      });

      status.textContent = "Your new palette is ready. Select a swatch to copy its HEX value.";
    }

    generateButton.addEventListener("click", generate);

    copyButton.addEventListener("click", async () => {
      const success = await copyText(currentPalette.join(", "));
      status.textContent = success ? "All palette HEX values copied." : "Copy failed.";
    });

    generate();
  }

  function hexToRgb(hex) {
    let value = hex.replace("#", "");

    if (/^[0-9a-fA-F]{3}$/.test(value)) {
      value = value.split("").map(char => char + char).join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;

    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));

      switch (max) {
        case r:
          h = ((g - b) / delta) % 6;
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        default:
          h = (r - g) / delta + 4;
      }

      h *= 60;
      if (h < 0) h += 360;
    }

    return `${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  }

  function initInspector() {
    const picker = document.getElementById("inspectorColor");
    const hexInput = document.getElementById("inspectorHex");
    const preview = document.getElementById("inspectorPreview");
    const rgbOutput = document.getElementById("inspectorRGB");
    const hslOutput = document.getElementById("inspectorHSL");
    const status = document.getElementById("inspectorStatus");

    function update(hex) {
      const rgb = hexToRgb(hex);

      if (!rgb) {
        status.textContent = "Enter a valid HEX colour, such as #B6F36B.";
        return;
      }

      const normalHex = `#${hex.replace("#", "").length === 3
        ? hex.replace("#", "").split("").map(char => char + char).join("")
        : hex.replace("#", "")}`.toUpperCase();

      picker.value = normalHex;
      hexInput.value = normalHex;
      preview.style.backgroundColor = normalHex;
      rgbOutput.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
      hslOutput.textContent = rgbToHsl(rgb.r, rgb.g, rgb.b);
      status.textContent = "Colour values updated.";
    }

    picker.addEventListener("input", () => update(picker.value));

    hexInput.addEventListener("change", () => update(hexInput.value.trim()));

    document.getElementById("copyInspectorHex").addEventListener("click", async () => {
      const success = await copyText(hexInput.value);
      status.textContent = success ? "HEX value copied." : "Copy failed.";
    });

    workspaceContent.querySelectorAll("[data-copy]").forEach(button => {
      button.addEventListener("click", async () => {
        const target = document.getElementById(button.dataset.copy);
        const success = await copyText(target.textContent);
        status.textContent = success ? `${button.dataset.copy} copied.` : "Copy failed.";
      });
    });

    update(picker.value);
  }

  function initGradient() {
    const first = document.getElementById("gradientFirst");
    const second = document.getElementById("gradientSecond");
    const angle = document.getElementById("gradientAngle");
    const angleValue = document.getElementById("gradientAngleValue");
    const preview = document.getElementById("gradientPreview");
    const code = document.getElementById("gradientCode");
    const status = document.createElement("p");

    status.className = "tool-status";
    status.id = "gradientStatus";
    code.after(status);

    function update() {
      const css = `linear-gradient(${angle.value}deg, ${first.value}, ${second.value})`;
      preview.style.background = css;
      code.textContent = `background: ${css};`;
      angleValue.textContent = `${angle.value}°`;
    }

    [first, second, angle].forEach(input => {
      input.addEventListener("input", update);
    });

    document.getElementById("copyGradient").addEventListener("click", async () => {
      const success = await copyText(code.textContent);
      status.textContent = success ? "CSS copied." : "Copy failed.";
    });

    document.getElementById("randomGradient").addEventListener("click", () => {
      const randomColour = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
      first.value = randomColour();
      second.value = randomColour();
      angle.value = Math.floor(Math.random() * 361);
      update();
    });

    update();
  }

  function initPairing() {
    const presets = {
      modern: {
        heading: "Space Grotesk",
        body: "DM Sans",
        headingStack: "'Space Grotesk', sans-serif",
        bodyStack: "'DM Sans', sans-serif"
      },
      editorial: {
        heading: "Georgia",
        body: "Arial",
        headingStack: "Georgia, serif",
        bodyStack: "Arial, sans-serif"
      },
      classic: {
        heading: "Arial",
        body: "Georgia",
        headingStack: "Arial, sans-serif",
        bodyStack: "Georgia, serif"
      },
      minimal: {
        heading: "Trebuchet MS",
        body: "Arial",
        headingStack: "'Trebuchet MS', sans-serif",
        bodyStack: "Arial, sans-serif"
      },
      bold: {
        heading: "Impact",
        body: "Arial",
        headingStack: "Impact, sans-serif",
        bodyStack: "Arial, sans-serif"
      },
      elegant: {
        heading: "Georgia",
        body: "Trebuchet MS",
        headingStack: "Georgia, serif",
        bodyStack: "'Trebuchet MS', sans-serif"
      }
    };

    const select = document.getElementById("fontPairPreset");
    const heading = document.querySelector(".pair-heading");
    const body = document.querySelector(".pair-body");

    function update() {
      const preset = presets[select.value];
      heading.style.fontFamily = preset.headingStack;
      body.style.fontFamily = preset.bodyStack;
      document.getElementById("headingFontName").textContent = preset.heading;
      document.getElementById("bodyFontName").textContent = preset.body;
    }

    select.addEventListener("change", update);
    update();
  }

  function initTester() {
    const textInput = document.getElementById("typeText");
    const fontInput = document.getElementById("typeFont");
    const sizeInput = document.getElementById("typeSize");
    const weightInput = document.getElementById("typeWeight");
    const spacingInput = document.getElementById("typeSpacing");
    const preview = document.getElementById("typePreview");

    function update() {
      preview.textContent = textInput.value || "Your typography preview";
      preview.style.fontFamily = fontInput.value;
      preview.style.fontSize = `${sizeInput.value}px`;
      preview.style.fontWeight = weightInput.value;
      preview.style.letterSpacing = `${spacingInput.value}px`;

      document.getElementById("typeSizeValue").textContent = `${sizeInput.value}px`;
      document.getElementById("typeSpacingValue").textContent = `${spacingInput.value}px`;
    }

    [textInput, fontInput, sizeInput, weightInput, spacingInput].forEach(input => {
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });

    update();
  }

  function initCalculator() {
    const ratioWidth = document.getElementById("ratioWidth");
    const ratioHeight = document.getElementById("ratioHeight");
    const ratioResult = document.getElementById("ratioResult");

    function updateRatio() {
      const width = Number(ratioWidth.value);
      const height = Number(ratioHeight.value);

      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        ratioResult.textContent = "Enter valid dimensions";
        return;
      }

      function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
      }

      const divisor = gcd(Math.round(width), Math.round(height));
      ratioResult.textContent = `${Math.round(width) / divisor}:${Math.round(height) / divisor}`;
    }

    const scaleValue = document.getElementById("scaleValue");
    const scalePercent = document.getElementById("scalePercent");
    const scaleResult = document.getElementById("scaleResult");

    function updateScale() {
      const value = Number(scaleValue.value);
      const percent = Number(scalePercent.value);

      if (!Number.isFinite(value) || !Number.isFinite(percent)) {
        scaleResult.textContent = "Enter valid values";
        return;
      }

      scaleResult.textContent = Number((value * percent / 100).toFixed(4)).toLocaleString();
    }

    const pxValue = document.getElementById("pxValue");
    const remBase = document.getElementById("remBase");
    const remResult = document.getElementById("remResult");

    function updateRem() {
      const px = Number(pxValue.value);
      const base = Number(remBase.value);

      if (!Number.isFinite(px) || !Number.isFinite(base) || base <= 0) {
        remResult.textContent = "Enter valid values";
        return;
      }

      remResult.textContent = `${Number((px / base).toFixed(4))}rem`;
    }

    [ratioWidth, ratioHeight].forEach(input => input.addEventListener("input", updateRatio));
    [scaleValue, scalePercent].forEach(input => input.addEventListener("input", updateScale));
    [pxValue, remBase].forEach(input => input.addEventListener("input", updateRem));

    updateRatio();
    updateScale();
    updateRem();
  }

  // Subtle studio motion. The tools remain functional without GSAP.
  if (window.gsap) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    gsap.from(".design-tool-heading", {
      y: 35,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: window.ScrollTrigger ? {
        trigger: ".design-tool-heading",
        start: "top 85%"
      } : undefined
    });

    gsap.utils.toArray(".tool-category").forEach((section, index) => {
      gsap.from(section, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        delay: index * 0.08,
        ease: "power2.out",
        scrollTrigger: window.ScrollTrigger ? {
          trigger: section,
          start: "top 88%"
        } : undefined
      });
    });

    gsap.from(".design-closing h2", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: window.ScrollTrigger ? {
        trigger: ".design-closing",
        start: "top 85%"
      } : undefined
    });
  }

  console.log("KAIROS Design Studio ready.");
});
