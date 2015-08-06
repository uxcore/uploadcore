#Uxcore-Uploader

新的上传组件

特性：

1. md5（用于秒传）
2. 分片上传
3. 切面编程（AOP）
4. html5-runtime，flash-runtime
5. 多种收集器Collector（DndCollector、PasteCollector、PickerCollector）
6. 基于es6，jquery

设计理念：

1. AOP
2. 高度抽象，减少黑盒子

------

## Context(options)

### Options

```
options = {
    request: {
        // 上传文件字段名称
        name: 'file',
        // 上传目标
        url: 'http://up.django.t.taobao.com/rest/1.0/file',
        // 上传文件额外参数
        params: {},
        // 上传文件额外头
        headers: [],
        // 上传文件是否自动附带cookie等信息
        withCredentials: false,
        // 上传超时
        timeout: 0,
        // 文件分片大小, 单位b，0不分片
        chunkSize: 0,
        // 文件分片上传重试次数
        chunkRetries: 0,
        // 是否允许分片上传
        chunkEnable: false,
        // 分片上传并发数
        chunkProcessThreads: 2
    },
    // 文件上传并发数
    processThreads: 2,
    // 是否选择后自动等待上传
    autoPending: true,
    // 队列容量，0无限
    queueCapcity: 0,
    // 是否多选
    multiple: true,
    // 允许文件类型
    accept: null,
    // 文件大小限制
    sizeLimit: 0,
    // 是否防止文件重复
    preventDuplicate: false
}
```

#### options.request.params

上传文件额外参数，支持俩种赋值方式

**赋值一(Object)**

```
params = {
    foo: 'bar'
}
```

**赋值二(Array)**

```
params = [
    {name:'foo', value:'bar'}
]
```


#### options.request.headers

上传文件请求头，格式如下：

```
headers = [
    {name:'X-Requested-With', value:'XMLHttpRequest'}
]
```

#### options.request.chunkSize

文件分片大小，单位byte，默认0，小于256K时，不可分片。

#### options.accept

允许文件格式，赋值方式：

**图像文件**

```
accept = [
    {
        title: 'Images',
        extension: 'jpg,jpeg,png,gif,bmp',
        mimeTypes: 'image/*'
    }
];
```

**音频文件**

```
accept = [
    {
        title: 'Audios',
        extensions: 'mp3,mp4,ogg,flac,wav,midi',
        mimeTypes: 'audio/*'
    }
]
```

**视频文件**

```
accept = [
    {
        title: 'Videos',
        extensions: 'mp4,mpeg,mov,flv,wmv,avi,mkv,ogv',
        mimeTypes: 'audio/*'
    }
]
```

**JPG文件**

```
accept = [
    {
        title: 'JPG',
        extension: 'jpg,jpeg',
        mimeTypes: 'image/jpeg'
    }
];
```



mimetypes相关文档[MIME](http://webdesign.about.com/od/multimedia/a/mime-types-by-content-type.htm)

### getQueue()

获得队列[Queue](#queue)

### createFileRequest({[File](#file)} file)

创建[FileRequest](#filerequest)

### aspect(aspect[, hook])

获得相关切面[Aspect](#aspect)

### getPickerCollector(swf)

获得[PickerCollector](#pickercollector)单列。

### getDndCollector()

获得[DndCollector](#dndcollector)单列。

### getPasteCollector()

获得[PasteCollector](#pastecollector)单列。

## Queue

### APIs

#### addLimit({Function} limit)

添加限制函数。limit函数如下：

```
limit = function () {
    return true;
}
```

limit函数返回true时表示受到限制，否则不，函数闭包中this指向当前`{queue}`。

#### isLimit()

将所有[添加的limit](#addlimitfunction-limit)运行之后判断，是否已经限制添加更多的文件。

#### addFilter({Function} filter)

添加文件过滤函数。filter函数如下：

```
filter = function () {
   return 'error string';
}
```

filter函数返回error时，文件会被过滤，否则不；有几种方式返回error：

**返回字符串**

```
return 'error string';
```

**返回Error**

```
return new Error('some error');
```

**抛出异常**

```
throw new Error('some error');
```

#### isAllow({[File](#file)} file)

经过[添加的filter](#addfilterfunction-filter)过滤，判断是否仍然允许此文件。

#### add({[File](#file)} file)

添加一个文件。添加过程中会经过[isLimit](#islimit)，[isAllow](#isallowfile-file)判断。

可能触发[事件](#queueevents)：

* QUEUE_ERROR
* QUEUE_ADD
* QUEUE_STAT_CHANGE

#### setAutoPending({Boolean} flag)

设置自动上传，文件添加后，自动设为[FileStatus.PENDING](#filestatuspending)状态，等待上传。

#### setMultiple({Boolean} flag)

设置是否多选。

#### isMultiple()

是否多选。

#### getAccept()

获得允许文件类型[Accept](#optionsaccept)。

#### getStat()

获得[Stat](#stat)。

### Events

见[QueueEvents](#queueevents)。

### Errors

见[QueueErrors](#queueerrors)。

### Stat

队列文件的统计，参与统计的文件状态不包括`FileStatus.CANCELLED`和`FileStatus.INITED`。

#### getFiles(flag)

获得状态为flag的文件集合。flag支持[FileStatus](#filestatus)位操作：

```
flag = FileStatus.ALL ^ FileStatus.CANCELLED;
flag = FileStatus.SUCCESS | FileStatus.ERROR;
```

`flag`为`null`相当于`FileStatus.ALL`

#### stat(flag)

统计状态为flag的文件数目；flag赋值同上，例如：

```
stat(FileStatus.SUCCESS | FileStatus.ERROR)
```

**返回**

```
{
    32: 2,
    64: 1,
    sum: 3
}
```

## File

### Properties

**id(string)**

文件唯一id。

**name(string)**

文件名称。对于从[粘贴](#pastecollector)进来的文件资源，有些情况没有文件名，取用`id.ext`作为文件名。

**ext(string)**

文件扩展名。eg. `jpg`。

**type(string)**

文件mimetypes类型。 eg. `image/jpg`。

**lastModified(int)**

文件最后修改时间，精确到毫秒。eg. `1432866554681`。

**size(int)**

文件大小，单位byte。eg. `1024`。

**progress([Progress](#progress))**

文件上传进度。

### APIs

#### getContext()

获取上下文[Context](#contextoptions)。

#### isImage()

判断是否是图像文件。`mimetype`为`image/jpg, image/jpeg, image/gif, image/png, image/bmp`其中一种，即为图像。

#### getStatus()

获取当前文件状态，参见[FileStatus](#filestatus)。

#### getSource()

获取源文件资源。

#### getAsDataUrl(timeout)

异步获取文件dataurl内容，返回`jQuery-Promise`。

#### md5()

异步计算文件MD5值，返回`jQuery-Promise`。

#### session()

获取一个文件上传的会话，返回一个`jQuery-Promise`，让我们除了可以绑定事件外，还可以用session方式来绑定相关动作。

```
file.session().done(function (response) {
   // 上传成功了
}).fail(function (error) {
   // 上传失败了
}).progress(function (e) {
   // 上传进度中
});
```

为了某些场景的设计，`session`方式不需要、也不支持解除绑定，等当次上传会话结束后，会自动失效当前`session-promise`。

如果你绑定的操作需要解除绑定或者不希望会失效，请考虑使用[绑定事件](#fileevents)方式。

#### complete({[ChunkResponse](#chunkresponse)|*} response)

结束并完成上传会话，一般情况下，这个函数用于秒传。

#### pending()

让文件等待上传，一般用于手动上传、错误重传。

#### cancel()

结束上传会话，退出文件上传队列。

### Events

见[FileEvents](#fileevents)

### Errors

见[FileErrors](#fileerrors)

### Progress

文件上传进度对象。

**total(int)**

上传时总大小，上传时这个值总是大于`size`，因为包含一些请求头信息、formData数据。

**loaded(int)**

已经上传的数据大小。

**percentage(int)**

已经上传的百分比`0-100`。


## Aspect

传统的事件机制是发生了某事件，通知一下，满足不了及时改变它并应用到后续。所以我们这里提出切面机制，这个概念很像hook，但稍微和传统的hook有些区别，因为在`我们的hook`中可以异步完成一些事情后，然后进行后续调用。

### add({Function} hook)

在定义的切面中追加hook。hook函数闭包中this指向[AspectHook](#aspecthook)实例，hook函数中可以控制俩种走向：`下一步`、`错误拒绝`，函数调用完成没有`错误拒绝`即为`下一步`，`错误拒绝`的几种方式：

**返回Error**

```
add(function (data) {
    return new Error('something error');
});
```

**抛出异常**

```
add(function (data) {
    throw new Error('something error');
});
```

**Promise-reject**

```
add(function (data) {
   var i = $.Deferred();
   setTimeout(function () {
       i.reject(error);
   }, 3000);
   return i;
});
```
**设置Error**

```
add(function (data) {
    this.setError(error);
});
```

此外我们对于hook函数的返回值还有一些约定，如果希望返回的的值可用并应用到下一步，这个返回值一定要和[invoke](#invodedata)传入的初始值类型一样，我们会在内部如此检查：`newdata.constructor === lastdata.constructor`，返回值也有三种方式：

**返回空值：沿用上次数据**

```
add(function (data) {
   return null; // 其实这句可以不要
});
```

**Promise-resolve**

```
add(function (data) {
   var i = $.Deferred();
   setTimeout(function () {
       i.resolve(newdata);
   }, 3000);
   return i;
})
```

**设置Data**

```
add(function (data) {
    this.setData(data);
});
```

### invoke(data)

此函数供内部调用，基于当前切面的定义创建[AspectHook](#aspecthook)，

### AspectHook

切面钩子机制。

#### setError(error)

设置返回错误。

#### setData(data)

设置返回数据。


## File Request & Response

### FileRequest

文件上传请求参数控制，上传[FileAspects.PREPARE](#fileaspectsprepare)时由内部基于[Options](#options)创建，创建的实例配合[Aspect](#aspect)使用。

#### getFile()

获得正在上传的文件对象[File](#file)。

#### setName(name)

设置上传文件的字段名称。服务端用此字段接收文件。

#### getName()

获取上传文件的字段名称。

#### setUrl(url)

设置上传服务器端位置url。

#### getUrl()

获得上传服务器端位置。

#### getParams()

获得参数[Params](#params)。

#### getParam(name)

获得字段为name的参数集合，同[Params](#params)。

#### setParam(name, value)

设置参数值，同[Params](#params)。

#### getHeaders()

获取文件上传时附带的请求头信息。

#### setHeader(name, value)

设置一个附带请求头信息。

#### setWithCredentials(flag)

设置是否上传时附带cookie等验证信息。

#### isWithCredentials()

是否上传时附带cookie等验证信息。

#### setTimeout(timeout)

设置上传超时。

#### getTimeout()

获取上传超时。

#### setChunkSize(size)

设置分片大小。

#### getChunkSize()

获取分片大小。

#### setChunkRetries(retries)

设置分片上传网络出错重试次数。

#### getChunkRetries()

获取分片上传网络出错重试次数。

#### setChunkEnable(flag)

设置是否开启分片上传。

#### isChunkEnable()

判断是否分片上传，需要同时满足`开启了分片上传`、`分片大小大于256K`及`文件大小大于分片大小`三个条件。

#### setChunkProcessThreads(threads)

设置分片上传并发数，一个文件分为多块上传时，同时上传的数量。

#### getChunkProcessThreads

获取分片上传并发数。

### FileResponse

文件上传完成[FileAspects.COMPLETE](#fileaspectscomplete)时由内部创建，创建的实例配合[Aspect](#aspect)使用。

#### getFileRequest()

获得[FileRequest](#filerequest)。

#### isFromMultiChunkResponse()

判断是否由多个分片上传完成后响应的数据并实例化而来；正常的分片上传，我们会把最后完成的分片响应数据[ChunkResponse](#chunkresponse)作为`FileResponse`的原始响应数据；以下俩种情况此返回值为否：

* 无论是否使用多个分片上传时，秒传完成-即直接调用`complete(response)`方式；
* 文件过小、或者未开启分片上传，上传过程没有多个分片。

#### getRawResponse()

获得原生响应数据。

#### getResponse()

获得响应数据。

#### setResponse(response)

设置响应数据，一般为JSON数据。

### ChunkRequest

文件分片上传[FileAspects.CHUNK_PREPARE](#fileaspectschunk_prepare)时由内部[FileRequest](#filerequest)派生创建，大多数能获取的数值采用改变时从`FileRequest`复制方式来使用，创建的实例配合[Aspect](#aspect)使用。

#### getFileRequest()

获取[FileRequest](#filerequest)。

#### getFile()

获得正在上传的文件对象[File](#file)。

#### getBlob()

获取切片对象。

#### getIndex()

获得切片索引，从0开始。

#### getName()

获取上传文件的字段名称。

#### isMultiChunk()

是否是多分片上传。

#### setUrl(url)

设置上传服务器端位置url。

#### getUrl()

获得上传服务器端位置。

#### getParams()

获得参数[Params](#params)。

#### getParam(name)

获得字段为name的参数集合，同[Params](#params)。

#### setParam(name, value)

设置参数值，同[Params](#params)。

#### getHeaders()

获取文件上传时附带的请求头信息。

#### setHeader(name, value)

设置一个附带请求头信息。

#### isWithCredentials()

是否上传时附带cookie等验证信息。

#### getTimeout()

获取上传超时。

### ChunkResponse

文件分片上传完成[FileAspects.CHUNK_COMPLETE](#fileaspectschunk_complete)时由内部创建，创建的实例配合[Aspect](#aspect)使用。

#### getChunkRequest()

获取[ChunkRequest](#chunkrequest)。

#### getRawResponse()

获得原生响应数据。

#### getResponse()

获得响应数据。

#### setResponse(response)

设置响应数据，一般为JSON数据。

### Params

用于发送的Form Data数据维护，内部由[FileRequest](#filerequest)基于[options.request.params](#optionsrequestparams)创建。

#### addParam(name, value)

添加参数值。

#### removeParam(name)

删除键名为`name`的所有值设置。

#### setParam(name, value)

设置参数值，删除键名为`name`的所有值设置，新添加一个值为`value`的设置。

#### getParam(name[, {Boolean} single = false])

获得字段name的值设置，`single`为true返回单个值，否则以数组形式返回多个。

#### clone()

基于当前实例创建新[Params](#params)

#### toArray()

以Array格式导出数据，结果为：

```
params = [
  {name: 'foo', value: 'bar'},
  {name: 'foo', value: 'bar1'}
]
```

#### toString()

以querystring格式返回：

```
foo=bar&foo=bar1
```

## FileStatus

文件在上传过程中的状态值。

### FileStatus.ALL

值`255`，所有状态。

### FileStatus.PROCESS

值`31`，过程状态`FileStatus.INITED` -> `FileStatus.COMPLETE`。

### FileStatus.INITED

值`1`，初始状态。

### FileStatus.QUEUED

值`2`，进入队列

### FileStatus.PENDING

值`4`，队列中等待

### FileStatus.PROGRESS

值`8`，上传中

### FileStatus.COMPLETE

值`16`，上传完成, 等待后续处理

### FileStatus.SUCCESS

值`32`，上传成功

### FileStatus.ERROR

值`64`，上传出错

### FileStatus.CANCELLED

值`128`，上传取消 和 queued 相反, 退出队列

## FileAspects

文件上传的各个阶段。

### FileAspects.PREPARE

值`prepare`，文件上传准备阶段。

### FileAspects.CHUNK_PREPARE

值`chunkprepare`，文件分片上传准备阶段。

### FileAspects.CHUNK_COMPLETE

值`chunkcomplete`，文件分片上传完成阶段。

### FileAspects.COMPLETE

值`complete`，文件上传完成阶段。

## Events

### QueueEvents

#### on(Events.QUEUE_UPLOAD_START)

队列开始上传。

#### on(Events.QUEUE_UPLOAD_PROGRESS)

队列上传进度中。

#### on(Events.QUEUE_UPLOAD_END)

队列上传结束。

#### on(Events.QUEUE_ADD, ({[File](#file)} file))

队列添加了一个文件。

#### on(Events.QUEUE_ERROR, ({[Error](#queueerrors)} eror))

队列抛出一个[错误](#queueerrors)。

#### on(Events.QUEUE_STAT_CHANGE, ({[Stat](#stat)} stat))

队列统计信息发生变化。

### FileEvents

#### on(Events.FILE_UPLOAD_START)

文件开始上传。
   
#### on(Events.FILE_UPLOAD_PROGRESS, ({[Progress](#progress)} progress))

文件上传进度中。

#### on(Events.FILE_UPLOAD_COMPLETE, ({[FileResponse](#fileresponse)} response))

文件上传完成中。

#### on(Events.FILE_UPLOAD_SUCCESS, ({[FileResponse](#fileresponse)} response))

文件上传成功。

#### on(Events.FILE_UPLOAD_ERROR, ({[Error](#fileerrors)} error))

文件上传失败。

#### on(Events.FILE_CANCEL)

文件退出。

#### on(Events.FILE_STATUS_CHANGE, (newstatus, oldstatus))

文件状态发生变化，`newstatus|oldstatus`值参见[FileStatus](#filestatus)。

## Errors

我们定义了以下错误，方便错误发生时分辨。

### FileErrors

#### AbortError

中断错误。

* **name:** AbortError
* **message:** (message)

#### TimeoutError

超时错误。

* **name:** TimeoutError
* **message:** (message)

#### NetworkError

网络错误。

* **status:** http status
* **name:** NetworkError
* **message:** (message)

### QueueErrors

#### QueueLimitError

队列限制错误。

* **name:** QueueLimitError
* **message:** queue limit

#### FilterError

过滤错误。

* **file:** {[File](#file)}
* **name:** FilterError
* **message:** (message)

#### DuplicateError

文件重复错误，继承自[FilterError](#filtererror)。

* **file:** {[File](#file)}
* **name:** DuplicateError
* **message:** (message)

#### FileExtensionError

文件扩展名错误，继承自[FilterError](#filtererror)。

* **file:** {[File](#file)}
* **name:** FileExtensionError
* **message:** (message)

#### FileSizeError

文件大小错误，继承自[FilterError](#filtererror)。

* **file:** {[File](#file)}
* **name:** FileSizeError
* **message:** (message)


## Collector

### PickerCollector

创建一个`input[type=file]`或者flash拾取器，当浏览器支持`DataTransfer&FileList`特性时，会优先使用`input`，拾取器会覆盖在trigger上方，点击弹出系统对话框以选择文件。

#### PickerCollector.setSWF({URL} swf)

设置全局swf地址。

#### constructor({[Context](#contextoptions)} context, {URL} swf)

构造函数。

#### addArea({DOMElement} area)

一个`Context`实例只需对应一个`PickerCollector`，我们可以通过此方法添加多个触发区域。

```
var picker = new PickerCollector(context);
var area = picker.addArea(document.getElementById('#upload-button'));
```

返回的结果area是一个`Emitter`：

```
area.on('rollOver', function () {

}).on('rollOut', function () {

});
// 以上仅在flash下会触发
```

当这个添加的area不需要时，可以销毁：

```
area.destroy()
```

### DndCollector

拖放上传支持。

#### DndCollector.isSupport()

判断浏览器是否支持该拾取器。

#### constructor({[Context](#contextoptions)} context)

构造函数。

#### addArea({DOMElement} area)

实例方法，为`Context`添加一个拖放响应区域。

```
var dnd = DndCollector(context);

var area = dnd.addArea(document.getElementById('#upload-responsearea'));
```

返回的结果area是一个`Emitter`：

```
area.on('start', function (e, allowed) {

}).on('response', function (e, allowed) {

}).on('end', function (e) {

});
```

当这个添加的area不需要时，可以销毁：

```
area.destroy()
```

### PasteCollector

粘贴拾取器支持。

#### PasteCollector.isSupport()

判断浏览器是否支持粘贴拾取器。

#### constructor({[Context](#contextoptions)} context)

构造函数。

#### addArea({DOMElement} area)

实例方法，为`Context`添加一个粘贴区域。

```
var paster = PasteCollector(context);

var area = paster.addArea($('textarea')[0]);
```

返回的结果area是一个`Emitter`：

```
area.on('paste', function (clipboardData) {

});
```

当这个添加的area不需要时，可以销毁：

```
area.destroy()
```


## Examples

```
import $ from 'jquery';
import {Context, FileAspects as Aspects, Events, FileStatus as Status, DndCollector, PasteCollector, PickerCollector} from 'uxcore-uploader/index';

const context = new Context({
    request: {
        name: 'file',
        url: 'http://localhost/upload.php',
        params: {},
        headers: null,
        withCredentials: false,
        timeout: 0
    },
    processThreads: 3,
    autoPending: true,
    queueCapcity: 0,
    multiple: true,
    accept: [{
        title: 'Images',
        extensions: 'gif,jpg,jpeg,bmp,png',
        mimeTypes: 'image/*'
    }],
    sizeLimit: 0,
    preventDuplicate: false
});

// 数据转换
context.aspect(Aspects.CHUNK_COMPLETE).add((response) => {
    let res = $.parseJSON(response.getRawResponse());
    response.setResponse(res);
});

const queue = context.getQueue();
// 监听
queue.on(Events.QUEUE_ERROR, (error) => {
    console.info(error)
}).on(Events.QUEUE_ADD, (file) => {
    file.on(Events.FILE_STATUS_CHANGE, (status) => {
        console.info(status)
    });
    file.session().progress((progress) => {
        console.info(progress);
    }).fail((error) => {
        throw error;
    }).done((response) => {
        console.info(response);
    });
});

// 初始化拾取器
const dnd = new DndCollector(context);

dnd.addArea(document.documentElement);

const picker = new PickerCollector(context, 'path/to/FlashPicker.swf');

picker.addArea(document.getElementById('picker'));

```
