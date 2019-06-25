const Core = require('./core');
const Events = require('./events');
const {Status} = require('./status');
const File = require('./file');

Core.Events = Events;
Core.Status = Status;
Core.UploadCore = Core;
Core.VERSION = VERSION;
Core.Core = Core;
Core.File = File;

module.exports = Core;
