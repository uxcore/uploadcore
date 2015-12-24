const Core = require('./core');
const Events = require('./events');
const {Status} = require('./status');

Core.Events = Events;
Core.Status = Status;
Core.UploadCore = Core;
Core.VERSION = VERSION;
Core.Core = Core;

module.exports = Core;
