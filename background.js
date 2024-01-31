// we do have the access to the chrome api background 
chrome.tabs.onUpdated.addListener((tabId, tab) => {

  // to check if this is an youtube page or not 
    if (tab.url && tab.url.includes("youtube.com/watch")) {

      // query to grab the our unique video value v=....
      const queryParameters = tab.url.split("?")[1];
      const urlParameters = new URLSearchParams(queryParameters);

      console.log(urlParameters)
  
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
              // take the unique video value ... 
        videoId: urlParameters.get("v"),
      });
    }
  });
  