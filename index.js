// Rewritten for better performance, organization and for refactoring
// Variable definitions
const data = require('./data.json');
let counting = data.settings.count;
let logging = data.settings.logging;
let randomEntertainment = data.settings.randomentertainment;
let fChatResponses = data.settings.fchatresponses;
let targeting = data.settings.targeting;
let args;
let testing = false;
let countingTest = false;
let verbose = false;
let useDevChannels = false;
