define(function (require, exports, module) {
    var jQuery = require('jquery');
    var SparkMD5 = require('spark-md5');

    <%= contents %>

    UXUploader['default'].setSWF(require.resolve('./flashpicker.swf#'));
    UXUploader['default'].Status = UXUploader.Status;
    UXUploader['default'].Events = UXUploader.Events;

    module.exports = UXUploader['default'];
});