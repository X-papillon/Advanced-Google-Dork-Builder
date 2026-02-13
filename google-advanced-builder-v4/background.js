chrome.runtime.onInstalled.addListener(()=>{
 chrome.contextMenus.create({
   id:"sendToBuilder",
   title:"Send to Search Builder",
   contexts:["selection"]
 });
});

