(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
  
        // fetch the bookmarks when the video is opened 
    const fetchBookmarks = () => {
      return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        });
      });
    };
      // extrace the current time, convert to hours
    const addNewBookmarkEventHandler = async () => {
      const currentTime = youtubePlayer.currentTime;
      const newBookmark = {
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
      };
    //   fetch when new bookmarks are added
      currentVideoBookmarks = await fetchBookmarks();
  
        // set up the storage
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
    };
  
    const newVideoLoaded = async () => {
              // check if the bookmarkbtn exists
      const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  
    // fetch when new video is loaded
      currentVideoBookmarks = await fetchBookmarks();
  
      if (!bookmarkBtnExists) {
        const bookmarkBtn = document.createElement("img");
  
        bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
        bookmarkBtn.className = "ytp-button " + "bookmark-btn";
        bookmarkBtn.title = "Click to bookmark current timestamp";

        // test: document.getElementsByClassName("ytp-left-controls")[0]

        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName('video-stream')[0];
  
        youtubeLeftControls.appendChild(bookmarkBtn);

        // handle events
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
      }
    };
  
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
    // destruct the value   
      const { type, value, videoId } = obj;
  
        // if it is a new video
      if (type === "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
      } else if (type === "PLAY") {
        youtubePlayer.currentTime = value;
      } else if ( type === "DELETE") {
        currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
  
        response(currentVideoBookmarks);
      }
    });
  
    newVideoLoaded();
  })();
  
  const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substr(11, 8);
  };