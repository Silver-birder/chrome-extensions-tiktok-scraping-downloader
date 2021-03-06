const initStorage = async () => {
    const storageValue = await chrome.storage.sync.get(['ts']);
    if (storageValue.ts !== undefined) return;
    const value = { url: "http://localhost:3000", interval: 1000 };
    await chrome.storage.sync.set({ ts: value });
};

const getCurrentTab = async () => {
    const queryOptions = { url: ["https://www.tiktok.com/*"] };
    const tabs = await chrome.tabs.query(queryOptions);
    const activeTabs = tabs.filter((t) => t.active === true)
    return activeTabs.length > 0 ? activeTabs[0] : tabs[0];
}

const handleFromContentScript = async (request, sender, sendResponse) => {
    const b = btoa(encodeURIComponent(JSON.stringify(request.data)));
    const manifest = chrome.runtime.getManifest();
    chrome.downloads.download({
        filename: `${manifest.name}/${request.data.id}.json`,
        url: `data:application/json;base64,${b}`
    }, (downloadId) => {
        console.log(`downloadId: ${downloadId}`);
        sendResponse();
    })
    return true;
};

chrome.runtime.onInstalled.addListener(async () => {
    await initStorage();
    chrome.runtime.onMessage.addListener(handleFromContentScript);
});