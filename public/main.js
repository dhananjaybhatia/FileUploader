const fileList = document.querySelector(".file-list");
const fileBrowseButton = document.querySelector(".file-browse-button");
const fileBrowseInput = document.querySelector(".file-browse-input");
const fileUploadBox = document.querySelector(".file-upload-box");
const fileCompletedStatus = document.querySelector(".file-completed-status");

let totalFiles = 0;
let completedFiles = 0;

const createFileItemHTML = (file, index) => {
  // Extracting file name, size and extension
  const { name, size } = file;
  const extension = name.split(".").pop().toUpperCase();

  return `<li class="file-item" id="file-item-${index}">
  <div class="file-extension">${extension}</div>
  <div class="file-content-wrapper">
    <div class="file-content">
      <div class="file-details">
        <h5 class="file-name">${name}</h5>
        <div class="file-info">
          <small class="file-size">4MB/${size}</small>
          <small class="file-divider">•</small>
          <small class="file-status">Uploading...</small>
        </div>
      </div>
      <button class="cancel-button">
        <i class="bi bi-x-circle"></i>
      </button>
    </div>
    <div class="file-progress-bar">
      <div class="file-progress"></div>
    </div>
  </div>
</li>`;
};

// Function to handle file uploading
const handleFileUploading = (file, index) => {
  const url = "http://localhost:3000/upload";
  const formData = new FormData();
  formData.append("file", file);
  const xhr = new XMLHttpRequest();

  // Adding progress event listener to the ajax request
  xhr.upload.addEventListener("progress", (e) => {
    // Updating progress bar and file size element
    const fileProgress = document.querySelector(
      `#file-item-${index} .file-progress`
    );
    const fileSize = document.querySelector(`#file-item-${index} .file-size`);

    // Formatting the uploading or total file size into KB or MB accordingly
    const formattedFileSize =
      file.size >= 1024 * 1024
        ? `${(e.loaded / (1024 * 1024)).toFixed(2)} MB / ${(
            e.total /
            (1024 * 1024)
          ).toFixed(2)} MB`
        : `${(e.loaded / 1024).toFixed(2)} KB / ${(e.total / 1024).toFixed(
            2
          )} KB`;

    const progress = Math.round(e.loaded / e.total) * 100;
    fileProgress.style.width = `${progress}%`;
    fileSize.innerText = formattedFileSize;
  });

  xhr.open("POST", url, true);
  xhr.send(formData);

  return xhr;
};

// Function to handle selected files
const handleSelectedFiles = ([...files]) => {
  if (files.length === 0) return; // check if no files are selected
  totalFiles += files.length;
  files.forEach((file, index) => {
    const fileItemHTML = createFileItemHTML(file, index);
    // Inserting each file Item into file list
    fileList.insertAdjacentHTML("afterbegin", fileItemHTML);

    const currentFileItem = document.querySelector(`#file-item-${index}`);
    const cancelFileUploadButton =
      currentFileItem.querySelector(".cancel-button");

    const xhr = handleFileUploading(file, index);
    xhr.addEventListener("readystatechange", () => {
      // Handling completion of file upload
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        completedFiles++;
        cancelFileUploadButton.remove();
        currentFileItem.querySelector(".file-status").innerText = "Completed";
        currentFileItem.querySelector(".file-status").style.color = "#00B125";
        fileCompletedStatus.innerText = `${completedFiles} / ${totalFiles} files completed`;
      }
    });
    // Handling cancellation of file upload
    cancelFileUploadButton.addEventListener("click", () => {
      xhr.abort();
      currentFileItem.querySelector(".file-status").innerText = "Cancelled";
      currentFileItem.querySelector(".file-status").style.color = "#E3413F";
      cancelFileUploadButton.remove();
    });
    xhr.addEventListener("error", () => {
      alert("An error occurred during the fule upload!");
    });
  });
  fileCompletedStatus.innerText = `${completedFiles} / ${totalFiles} files completed`;
};

// Function to handle file drop event
fileUploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  handleSelectedFiles(e.dataTransfer.files);
  fileUploadBox.classList.remove("active");
  fileUploadBox.querySelector(".file-instructions").innerText =
    "Drag files here or";
});

// Function to handle file dragover event
fileUploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileUploadBox.classList.add("active");
  fileUploadBox.querySelector(".file-instructions").innerText =
    "Release to upload or";
});

// Function to handle file dragleave event
fileUploadBox.addEventListener("dragleave", (e) => {
  e.preventDefault();
  fileUploadBox.classList.remove("active");
  fileUploadBox.querySelector(".file-instructions").innerText =
    "Drag files here or";
});

fileBrowseInput.addEventListener("change", (e) =>
  handleSelectedFiles(e.target.files)
);
fileBrowseButton.addEventListener("click", () => fileBrowseInput.click());
