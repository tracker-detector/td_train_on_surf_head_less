// Params
/*
?chunkSize=512
?outputUrl=http://localhost:3000/models/tos
?epochs=7
?windowSize=512
?blockingRate=0.8
?modelActive=false
?blockingActive=true
*/

const urlParams = new URLSearchParams(window.location.search);
const chunkSize = parseInt(urlParams.get('chunkSize')) || 512;
const outputUrl = urlParams.get('outputUrl') || 'http://localhost:3000/models/tos';
const epochs = parseInt(urlParams.get('epochs')) || 7;
const windowSize = parseInt(urlParams.get('windowSize')) || 512;
const blockingRate = parseFloat(urlParams.get('blockingRate')) || 0.8;
const modelActive = urlParams.get('modelActive') === 'true' || false;
const blockingActive = urlParams.get('blockingActive') === 'true' || true;

console.log('chunkSize:', chunkSize);
console.log('outputUrl:', outputUrl);
console.log('epochs:', epochs);
console.log('windowSize:', windowSize);
console.log('blockingRate:', blockingRate);
console.log('modelActive:', modelActive);
console.log('blockingActive:', blockingActive);

chrome.storage.local.set({
    chunkSize,
    outputUrl,
    epochs,
    windowSize,
    blockingRate,
    modelActive,
    blockingActive,
});