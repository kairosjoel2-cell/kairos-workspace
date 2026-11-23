
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const uploadZone = document.getElementById("uploadZone");
  const sourcePreview = document.getElementById("sourcePreview");
  const sourceImage = document.getElementById("sourceImage");
  const sourceName = document.getElementById("sourceName");
  const sourceSize = document.getElementById("sourceSize");
  const removeImage = document.getElementById("removeImage");

  const qualityInput = document.getElementById("quality");
  const qualityValue = document.getElementById("qualityValue");
  const outputFormat = document.getElementById("outputFormat");
  const maxWidth = document.getElementById("maxWidth");
  const compressButton = document.getElementById("compressButton");

  const resultSection = document.getElementById("resultSection");
  const resultImage = document.getElementById("resultImage");
  const savingPercent = document.getElementById("savingPercent");
  const savingDescription = document.getElementById("savingDescription");
  const originalResultSize = document.getElementById("originalResultSize");
  const compressedResultSize = document.getElementById("compressedResultSize");

  const downloadButton = document.getElementById("downloadButton");
  const compressAgain = document.getElementById("compressAgain");

  let originalFile = null;
  let originalImage = null;
  let originalURL = null;
  let compressedBlob = null;
  let compressedURL = null;
  let isProcessing = false;

  // --------------------------------------------------
  // UTILITIES
  // --------------------------------------------------

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return "—";
    }

    if (bytes === 0) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  }

  function setButtonLoading(loading) {
    isProcessing = loading;
    compressButton.disabled = loading || !originalFile;

    const label = compressButton.querySelector("span:first-child");

    if (label) {
      label.textContent = loading
        ? "COMPRESSING IMAGE..."
        : "COMPRESS IMAGE";
    }
  }

  function revokeURL(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  function resetResult() {
    revokeURL(compressedURL);

    compressedURL = null;
    compressedBlob = null;

    resultSection.classList.add("hidden");
    resultImage.removeAttribute("src");
  }

  function showError(message) {
    window.alert(message);
  }

  // --------------------------------------------------
  // IMAGE UPLOAD
  // --------------------------------------------------

  function loadImage(file) {
    if (!file) return;

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/bmp"
    ];

    if (!supportedTypes.includes(file.type)) {
      showError("Please upload a JPG, PNG, WebP or BMP image.");
      return;
    }

    const maximumFileSize = 50 * 1024 * 1024;

    if (file.size > maximumFileSize) {
      showError("This image is larger than 50 MB. Please choose a smaller file.");
      return;
    }

    const temporaryURL = URL.createObjectURL(file);
    const testImage = new Image();

    testImage.onload = () => {
      revokeURL(originalURL);
      originalURL = temporaryURL;

      originalFile = file;
      originalImage = testImage;

      sourceImage.src = originalURL;
      sourceName.textContent = file.name;
      sourceSize.textContent = formatBytes(file.size);

      uploadZone.classList.add("hidden");
      sourcePreview.classList.remove("hidden");

      compressButton.disabled = false;

      resetResult();

      document.querySelector(".panel-status").textContent = "FILE LOADED";

      console.info("KAIROS: Image loaded successfully.");
    };

    testImage.onerror = () => {
      revokeURL(temporaryURL);
      showError("This image could not be opened. Try another image.");
    };

    testImage.src = temporaryURL;
  }

  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    loadImage(file);

    // Allows selecting the same file again later.
    imageInput.value = "";
  });

  // --------------------------------------------------
  // DRAG AND DROP
  // --------------------------------------------------

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadZone.classList.add("drag-active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadZone.classList.remove("drag-active");
    });
  });

  uploadZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];

    if (file) {
      loadImage(file);
    }
  });

  // --------------------------------------------------
  // QUALITY CONTROL
  // --------------------------------------------------

  function updateQualityDisplay() {
    const quality = Number(qualityInput.value);

    qualityValue.textContent = `${quality}%`;

    const percentage = ((quality - 10) / 90) * 100;

    qualityInput.style.background = `
      linear-gradient(
        to right,
        var(--lime) 0%,
        var(--lime) ${percentage}%,
        #3a3c33 ${percentage}%,
        #3a3c33 100%
      )
    `;
  }

  qualityInput.addEventListener("input", updateQualityDisplay);

  updateQualityDisplay();

  // --------------------------------------------------
  // REMOVE IMAGE
  // --------------------------------------------------

  function clearImage() {
    originalFile = null;
    originalImage = null;

    revokeURL(originalURL);
    originalURL = null;

    sourceImage.removeAttribute("src");
    sourceName.textContent = "—";
    sourceSize.textContent = "—";

    sourcePreview.classList.add("hidden");
    uploadZone.classList.remove("hidden");

    compressButton.disabled = true;

    document.querySelector(".panel-status").textContent = "AWAITING FILE";

    resetResult();
  }

  removeImage.addEventListener("click", clearImage);

  // --------------------------------------------------
  // IMAGE COMPRESSION
  // --------------------------------------------------

  function createCanvas(image, maximumWidth) {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    let width = naturalWidth;
    let height = naturalHeight;

    if (maximumWidth !== "original") {
      const limit = Number(maximumWidth);

      if (naturalWidth > limit) {
        const ratio = limit / naturalWidth;

        width = Math.round(naturalWidth * ratio);
        height = Math.round(naturalHeight * ratio);
      }
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: true
    });

    if (!context) {
      throw new Error("Your browser could not create an image canvas.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(image, 0, 0, width, height);

    return canvas;
  }

  function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed."));
            return;
          }

          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  }

  async function compressImage() {
    if (!originalFile || !originalImage || isProcessing) {
      return;
    }

    setButtonLoading(true);

    resetResult();

    try {
      const selectedFormat = outputFormat.value;
      const selectedQuality = Number(qualityInput.value) / 100;
      const selectedWidth = maxWidth.value;

      const canvas = createCanvas(
        originalImage,
        selectedWidth
      );

      const quality = selectedFormat === "image/png"
        ? undefined
        : selectedQuality;

      const blob = await canvasToBlob(
        canvas,
        selectedFormat,
        quality
      );

      if (blob.type !== selectedFormat) {
        throw new Error(
          "Your browser does not support this output format. Try JPEG or PNG."
        );
      }

      compressedBlob = blob;
      compressedURL = URL.createObjectURL(blob);

      displayResults(blob, canvas.width, canvas.height);

      console.info("KAIROS: Compression completed.", {
        original: formatBytes(originalFile.size),
        compressed: formatBytes(blob.size),
        dimensions: `${canvas.width} × ${canvas.height}`
      });

    } catch (error) {
      console.error("KAIROS compression error:", error);

      showError(
        error.message || "Something went wrong while compressing the image."
      );

    } finally {
      setButtonLoading(false);
    }
  }

  compressButton.addEventListener("click", compressImage);

  // --------------------------------------------------
  // RESULTS
  // --------------------------------------------------

  function displayResults(blob, width, height) {
    const originalBytes = originalFile.size;
    const compressedBytes = blob.size;

    const reduction = originalBytes > 0
      ? ((originalBytes - compressedBytes) / originalBytes) * 100
      : 0;

    resultImage.src = compressedURL;

    originalResultSize.textContent = formatBytes(originalBytes);
    compressedResultSize.textContent = formatBytes(compressedBytes);

    if (reduction > 0) {
      savingPercent.textContent = `${reduction.toFixed(1)}%`;
      savingDescription.textContent =
        `You saved ${formatBytes(originalBytes - compressedBytes)}. Dimensions: ${width} × ${height}px.`;
    } else if (reduction < 0) {
      savingPercent.textContent = `${Math.abs(reduction).toFixed(1)}%`;
      savingDescription.textContent =
        `The output is larger than the original. Try another format or lower quality. Dimensions: ${width} × ${height}px.`;
    } else {
      savingPercent.textContent = "0%";
      savingDescription.textContent =
        `The file size remained the same. Dimensions: ${width} × ${height}px.`;
    }

    resultSection.classList.remove("hidden");

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // --------------------------------------------------
  // DOWNLOAD
  // --------------------------------------------------

  downloadButton.addEventListener("click", () => {
    if (!compressedBlob || !compressedURL) {
      showError("Compress an image before downloading.");
      return;
    }

    const extensionMap = {
      "image/webp": "webp",
      "image/jpeg": "jpg",
      "image/png": "png"
    };

    const extension = extensionMap[compressedBlob.type] || "img";

    const originalName = originalFile.name.replace(/\.[^/.]+$/, "");

    const downloadName = `${originalName}-kairos.${extension}`;

    const link = document.createElement("a");

    link.href = compressedURL;
    link.download = downloadName;

    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  // --------------------------------------------------
  // ADJUST SETTINGS
  // --------------------------------------------------

  compressAgain.addEventListener("click", () => {
    document.querySelector(".compressor-workspace").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  window.addEventListener("beforeunload", () => {
    revokeURL(originalURL);
    revokeURL(compressedURL);
  });

  console.info("KAIROS Image Compressor initialized.");
});
