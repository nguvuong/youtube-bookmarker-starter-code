import { getActiveTabURL } from "./utils.js";

// addd book mark 2
const addNewBookmark = (bookmarks, bookmark) => {

    // create Element
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

// give the attibute
  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

//   append element
  newBookmarkElement.appendChild(bookmarkTitleElement);
// append controlsElement
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

// function to show bookmarks
const viewBookmarks = (currentBookmarks=[]) => {

    // take the bookmarks id
  const bookmarksElement = document.getElementById("bookmarks");

//   clear it
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    // loop
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

const onPlay = async e => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {

    // create
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;

//   add event listenr
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {

    // get active tab
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

//   get the video url
  const currentVideo = urlParameters.get("v");

    // check if it is youtube?
  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {

    // get data and put into viewBookmarks
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    // class of the container extension
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});
