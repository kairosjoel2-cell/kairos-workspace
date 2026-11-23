
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("imageInput");
    const uploadZone = document.getElementById("uploadZone");

    const sourcePreview = document.getElementById("sourcePreview");
    const sourceImage = document.getElementById("sourceImage");
    const sourceName = document.getElementById("sourceName");
    const sourceInfo = document.getElementById("sourceInfo");
    const removeImage = document.getElementById("removeImage");

    const qualityInput = document.getElementById("quality");
    const qualityValue = document.getElementById("qualityValue");
    const qualitySetting = document.getElementById("qualitySetting");

    const convertButton = document.getElementById("convertButton");
    const resultSection = document.getElementById("resultSection");
    const resultImage = document.getElementById("resultImage");
    const resultName = document.getElementById("resultName");
    const resultSize = document.getElementById("resultSize");
    const resultFormat = document.getElementById("resultFormat");

    const downloadButton = document.getElementById("downloadButton");
    const convertAgain = document.getElementById("convertAgain");

    const formatOptions = document.querySelectorAll(
      'input[name="format"]'
    );

    let selectedFile = null;
    let sourceURL = null;
    let resultURL = null;
    let convertedBlob = null;
    let convertedFileName = "";
    let imageElement = null;
    let isConverting = false;

    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/bmp"
    ];

    const formatExtensions = {
      "image/webp": "webp",
      "image/jpeg": "jpg",
      "image/png": "png"
    };

    function formatBytes(bytes) {
      if (bytes < 1024) {
        return `${bytes} B`;
      }

      if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      }

      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function getSelectedFormat() {
      const selected = document.querySelector(
        'input[name="format"]:checked'
      );

      return selected ? selected.value : "image/webp";
    }

    function getBaseName(filename) {
      const lastDot = filename.lastIndexOf(".");

      const name = lastDot > 0
        ? filename.slice(0, lastDot)
        : filename;

      return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").trim()
        || "kairos-image";
    }

    function releaseSourceURL() {
      if (sourceURL) {
        URL.revokeObjectURL(sourceURL);
        sourceURL = null;
      }
    }

    function releaseResultURL() {
      if (resultURL) {
        URL.revokeObjectURL(resultURL);
        resultURL = null;
      }

      convertedBlob = null;
      convertedFileName = "";
    }

    function hideResult() {
      resultSection.hidden = true;
      releaseResultURL();
    }

    function updateFormatSelection() {
      const selectedFormat = getSelectedFormat();

      formatOptions.forEach((option) => {
        const card = option.closest(".format-option");

        if (card) {
          card.classList.toggle("selected", option.checked);
        }
      });

      const isPNG = selectedFormat === "image/png";

      qualityInput.disabled = isPNG;
      qualitySetting.style.opacity = isPNG ? "0.45" : "1";
      qualitySetting.style.pointerEvents = isPNG ? "none" : "auto";

      qualityValue.textContent = isPNG
        ? "LOSSLESS"
        : `${qualityInput.value}%`;
    }

    function resetResult() {
      hideResult();
      convertButton.disabled = !selectedFile;
      convertButton.querySelector("span:first-child").textContent =
        "CONVERT IMAGE";
    }

    function showFile(file) {
      if (!file) return;

      if (!supportedTypes.includes(file.type)) {
        alert("Please select a JPG, PNG, WebP or BMP image.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert("This image is larger than 50 MB. Please choose a smaller file.");
        return;
      }

      if (file.size === 0) {
        alert("This file is empty. Please select another image.");
        return;
      }

      releaseSourceURL();
      resetResult();

      selectedFile = file;
      sourceURL = URL.createObjectURL(file);

      sourceImage.onload = () => {
        sourceName.textContent = file.name;
        sourceInfo.textContent =
          `${formatBytes(file.size)} · ${sourceImage.naturalWidth} × ${sourceImage.naturalHeight} px`;

        sourcePreview.hidden = false;
        uploadZone.hidden = true;
        convertButton.disabled = false;
      };

      sourceImage.onerror = () => {
        releaseSourceURL();
        selectedFile = null;
        sourcePreview.hidden = true;
        uploadZone.hidden = false;
        convertButton.disabled = true;

        alert("This image could not be opened. Please try another file.");
      };

      sourceImage.src = sourceURL;
    }

    function clearImage() {
      selectedFile = null;
      imageElement = null;

      releaseSourceURL();
      resetResult();

      sourceImage.removeAttribute("src");
      sourceName.textContent = "";
      sourceInfo.textContent = "";

      sourcePreview.hidden = true;
      uploadZone.hidden = false;

      imageInput.value = "";
    }

    function loadImage(file) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        const temporaryURL = URL.createObjectURL(file);

        image.onload = () => {
          URL.revokeObjectURL(temporaryURL);
          resolve(image);
        };

        image.onerror = () => {
          URL.revokeObjectURL(temporaryURL);
          reject(new Error("The selected image could not be decoded."));
        };

        image.src = temporaryURL;
      });
    }

    function canvasToBlob(canvas, mimeType, quality) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("The browser could not create the converted image."));
              return;
            }

            resolve(blob);
          },
          mimeType,
          quality
        );
      });
    }

    async function convertImage() {
      if (!selectedFile || isConverting) return;

      isConverting = true;
      convertButton.disabled = true;
      convertButton.querySelector("span:first-child").textContent =
        "CONVERTING...";

      try {
        const mimeType = getSelectedFormat();
        const quality = Number(qualityInput.value) / 100;

        imageElement = await loadImage(selectedFile);

        const width = imageElement.naturalWidth;
        const height = imageElement.naturalHeight;

        if (!width || !height) {
          throw new Error("The image dimensions are invalid.");
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Your browser could not create an image canvas.");
        }

        if (mimeType === "image/jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
        }

        context.drawImage(imageElement, 0, 0, width, height);

        const blob = await canvasToBlob(
          canvas,
          mimeType,
          mimeType === "image/png" ? undefined : quality
        );

        if (blob.type !== mimeType) {
          throw new Error(
            `Your browser does not support ${formatExtensions[mimeType].toUpperCase()} output. Try another format.`
          );
        }

        releaseResultURL();

        convertedBlob = blob;

        const extension = formatExtensions[mimeType];
        convertedFileName = `${getBaseName(selectedFile.name)}-kairos.${extension}`;

        resultURL = URL.createObjectURL(blob);

        resultImage.src = resultURL;
        resultName.textContent = convertedFileName;
        resultSize.textContent = formatBytes(blob.size);
        resultFormat.textContent = extension.toUpperCase();

        resultSection.hidden = false;

        resultSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      } catch (error) {
        console.error("KAIROS conversion error:", error);
        alert(error.message || "Conversion failed. Please try again.");

      } finally {
        isConverting = false;
        convertButton.disabled = !selectedFile;
        convertButton.querySelector("span:first-child").textContent =
          "CONVERT IMAGE";
      }
    }

    function downloadImage() {
      if (!convertedBlob || !resultURL) return;

      const link = document.createElement("a");

      link.href = resultURL;
      link.download = convertedFileName;

      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    // File selection
    imageInput.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (file) {
        showFile(file);
      }
    });

    // Drag and drop
    ["dragenter", "dragover"].forEach((eventName) => {
      uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.remove("dragging");
      });
    });

    uploadZone.addEventListener("drop", (event) => {
      const file = event.dataTransfer.files[0];

      if (file) {
        showFile(file);
      }
    });

    // Format selection
    formatOptions.forEach((option) => {
      option.addEventListener("change", updateFormatSelection);
    });

    // Quality control
    qualityInput.addEventListener("input", () => {
      qualityValue.textContent = `${qualityInput.value}%`;
    });

    // Main actions
    convertButton.addEventListener("click", convertImage);
    removeImage.addEventListener("click", clearImage);
    downloadButton.addEventListener("click", downloadImage);

    convertAgain.addEventListener("click", () => {
      clearImage();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    // Initial state
    updateFormatSelection();

    console.log("KAIROS Image Converter initialized.");
  });
})();
