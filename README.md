# UploadCore [![NPM version][npm-image]][npm-url] [![NPM download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/uploadcore.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/uploadcore
[download-image]: https://img.shields.io/npm/dm/uploadcore.svg?style=flat-square
[download-url]: https://npmjs.org/package/uploadcore

<p align="center">
  <a href="http://uxcore.github.io/uploadcore">
    <img width="360" src="https://img.alicdn.com/tps/TB1aOUSJFXXXXacXXXXXXXXXXXX.svg">
  </a>
</p>

**特性一览**

* md5（用于秒传）
* 分片上传
* html5-runtime，flash-runtime
* 多种收集器Collector（DndCollector、PasteCollector、PickerCollector）
* 拥抱es6


## Usage 最佳实践

```js
import {UploadCore, Events, Status, VERSION} from 'uploadcore';

console.log('UploadCore version %s', VERSION);

const up = new UploadCore({
    name: 'file',
    url: 'http://test.yanbingbing.com/upload.php'
});

up.on(Events.FILE_UPLOAD_COMPLETED, (file) => {
	if (file.getStatus() === Status.SUCCESS) {
		alert('上传成功');
		console.info(file.response.getJson());
	} else {
		alert('上传失败');
	}
});

const picker = up.getPickerCollector();
picker.addArea(document.getElementById('clickarea'));
```

## Compatible 兼容处理

完全的功能仅在最新的Chrome浏览器中支持，对于不支持的浏览器，在保证上传功能可用的情况下，采用不支持或降低处理。

**特性支持一览**

Feature  | Chrome | Firefox | Safari | Edage | IE11 | IE10 | IE9-
-------- | ------ | ------- | ------ | ----- | ---- | ---- | ----
基本上传  | html5  |  html5  | html5  | html5 | html5 | html5 | flash
复制系统文件上传 | `支持` | `不支持` | `有问题` | `不支持` | `不支持` | `不支持` | `不支持`
复制网页图像上传 | `支持` | `不支持` | `不支持` | `支持` | `不支持` | `不支持` | `不支持`
截图上传 | `支持` | `不支持` | `不支持` | `支持` | `部分支持` | `不支持` | `不支持`
拖拽上传  | `目录和文件` | `文件` | `文件` | `不支持` | `文件` | `文件` | `不支持`
秒传     | `支持` | `支持` | `支持` | `支持` | `支持` | `支持` | `不支持`
分片上传  | `支持` | `支持` | `支持` | `支持` | `支持` | `支持` | `不支持`

如果要保证能在所有浏览器中运行，我们需要引入[es5-shim](http://github.com/es-shims/es5-shim/)相关ployfill脚本。

```html
<script src="/path/to/es-shim.min.js"></script>
<script src="/path/to/es-sham.min.js"></script>
```

## Options 配置

```js
options = {
    // 上传文件字段名称
    name: 'file',
    // 上传目标
    url: 'http://demo.com/rest/1.0/file',
    // 上传文件额外参数
    params: {},
    // 上传文件额外头, `flash下不支持`
    headers: [],
    // 上传文件是否自动附带cookie等信息, `flash下不支持`
    withCredentials: false,
    // 上传超时
    timeout: 0,
    // 是否允许分片上传, `flash下不支持`
    chunkEnable: false,
    // 文件分片大小, 默认单位b，0不分片
    chunkSize: 0,
    // 文件分片上传重试次数
    chunkRetries: 0,
    // 分片上传并发数
    chunkProcessThreads: 2
    
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
    fileSizeLimit: 0,
    // 是否防止文件重复
    preventDuplicate: false,
    // 过滤器
    filters:[]
}
```

**options.params**

上传文件额外参数，支持俩种赋值方式

```js
// 赋值一(Object)
params = {
    foo: 'bar'
}

// 赋值二(Array)
params = [
    {name:'foo', value:'bar'}
]

```

**options.headers**

上传文件请求头，格式如下：

```js
headers = [
    {name:'X-Requested-With', value:'XMLHttpRequest'}
]
```

**options.chunkSize**

文件分片大小，默认单位byte，默认0，小于256K时，不可分片。

允许`b,k,m,g,t`为单位（大小写不敏感）结尾的`string`或者`int`。

```js
size = 1; // 1字节
size = '1b'; // 1字节
size = '1k'; // 1千字节 = 1024b
size = '1m'; // 1兆字节 = 1024k
size = '1g'; // 1吉字节 = 1024m
size = '1t'; // 1太字节 = 1024g
```

**options.fileSizeLimit**

文件大小限制，默认单位byte，默认0，表示不限制，格式同`options.chunkSize`。

**options.accept**

允许文件格式，推荐赋值方式如下：

```js
accept = {
	title: '图片',
	extensions: 'jpg,jpeg,png,gif,webp,bmp'
};
```

如果你觉的有必要，也可以设置一下[mimeTypes](http://www.iana.org/assignments/media-types/media-types.xhtml)

```js
accept = {
	title: '图片',
	extensions: 'jpg,jpeg,png,gif,webp,bmp',
	mimeTypes: 'image/*' // or 'image/jpeg,image/png'
};
```
> mimetypes设置后在不同浏览器中会表现不一致，谨慎使用

如果觉得不需要那么麻烦，accept也可以更简单

```
accept = 'jpg,jpeg,png,gif,webp,bmp';
```

甚至可以

```
accept = 'images';
accept = 'audios';
accept = 'videos';

accept = ['images', 'videos'];
```

`images`,`audios`,`videos`为内置类型，定义如下：

```js
images = {
    title: 'Images',
    extensions: 'jpg,jpeg,gif,png,bmp,svg,tiff,tif,ico,jpe,svgz,pct,psp,ai,psd,raw,webp'
};

audios = {
    title: 'Audios',
    extensions: 'aac,aif,flac,iff,m4a,m4b,mid,midi,mp3,mpa,mpc,oga,ogg,ra,ram,snd,wav,wma'
};

videos = {
    title: 'Videos',
    extensions: 'avi,divx,flv,m4v,mkv,mov,mp4,mpeg,mpg,ogm,ogv,ogx,rm,rmvb,smil,webm,wmv,xvid'
};
```



## APIs 接口

### UploadCore.VERSION

静态变量，获得版本号。

### UploadCore.setOptions

修改已经初始化后的 Options，目前支持

```javascript
['name', 'url', 'params', 'action', 'data', 'headers', 
'withCredentials', 'timeout', 'chunkEnable', 'chunkSize', 
'chunkRetries', 'chunkProcessThreads', 'autoPending', 
'auto', 'capcity', 'queueCapcity', 'sizeLimit', 
'fileSizeLimit']
```

参数 | 类型 | 描述
--- |----- | ------
options | `object` | 传入参数，同初始化 

### UploadCore.addConstraint

添加约束。

参数 | 类型 | 描述
--- |----- | ------
constraint | `function` | 约束函数

constraint函数如下：

```js
constraint = function () {
    return true;
}
```

constraint函数返回true时表示受到限制，否则不，函数闭包中this指向当前`UploadCore`。

### UploadCore.isLimit

运行通过`UploadCore.addConstraint`添加的约束，判断是否限制了添加更多的文件。

**返回** `bool`，`true`表示受到约束。

### UploadCore.addFilter

添加文件过滤函数。

参数 | 类型 | 描述
--- |----- | ------
filter | `function` | 过滤函数

filter函数如下：

```js
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

### UploadCore.isMultiple

是否多选。

**返回** `bool`，`true`表示多选。

### UploadCore.getAccept

获得允许文件类型。

**返回**

```js
[
    {
        title: 'Images',
        extensions: ['jpg','jpeg','png','gif','bmp','webp'],
        mimeTypes: 'image/*'
    },
    ....
]
```

### UploadCore.isFull

判断队列是否已满。

### UploadCore.isEmpty

判断队列是否为空。

### UploadCore.getStat

获得文件统计。

**返回** `Stat`

### UploadCore.getTotal

同`Stat.getTotal`。

### UploadCore.getFiles

同`Stat.getFiles`。

### UploadCore.stat

同`Stat.stat`。

### UploadCore.setSWF (静态方法)

设置flashpicker的url地址，用于不支持h5上传的浏览器。

参数 | 类型 | 描述
--- |----- | ------
url | `string` | flashpicker的url地址

### UploadCore.getPickerCollector

获得`PickerCollector`单列。

### UploadCore.getDndCollector

获得`DndCollector`单列。

### UploadCore.getPasteCollector

获得`PasteCollector`单列。

### UploadCore.on

添加事件监听。

参数 | 类型 | 描述
--- |----- | ------
event | `string` | 事件名称
fn | `function` | 事件处理函数

## Events 事件

**队列事件**

名称 | 触发对象 | 参数 | 描述
--- | --- | --- | ---
`QUEUE_UPLOAD_START` | `UploadCore` | 无 | 队列上传开始
`QUEUE_UPLOAD_END` | `UploadCore` | 无 | 队列上传结束
`QUEUE_FILE_ADDED` | `UploadCore` | `File` | 队列添加了一个文件
`QUEUE_FILE_FILTERED` | `UploadCore` | `File`, `Error` | 队列过滤了一个文件
`QUEUE_ERROR` | `UploadCore` | `Error` | 队列错误
`QUEUE_STAT_CHANGE` | `UploadCore` | `Stat` | 文件统计发生变化

**正在进行时事件**

名称 | 触发对象 | 参数 | 描述
--- | --- | --- | ---
`FILE_UPLOAD_PREPARING`| `UploadCore` | `FileRequest` | 文件上传准备时
`CHUNK_UPLOAD_PREPARING`| `UploadCore` | `ChunkRequest` |  分块上传准备时
`CHUNK_UPLOAD_COMPLETING`|`UploadCore` | `ChunkResponse` |  分块上传结束时
`FILE_UPLOAD_COMPLETING`|`UploadCore` | `FileResponse` |  文件上传结束时

正在进行时事件可以理解为普通事件的增强版，支持Promise返回值，注册的事件监听严格按照顺序执行。

```js
up.on(Events.FILE_UPLOAD_PREPARING, (request) => {
    return new Promise((resolve) => {
        jQuery.getJSON('http://test.yanbingbing.com/token.php').done((token) => {
            request.setParam('token', token);
            resolve();
        });
    });
}).on(Events.FILE_UPLOAD_PREPARING, (request) => {
    console.info(request.getParam('token'));
});
```

**文件事件**

文件事件同时在`UploadCore`与`File`上触发，当在`UploadCore`上触发时，函数第一参数均为`File`。

名称 | 触发对象 | 参数 | 描述
--- | --- | --- | ---
`FILE_UPLOAD_START` | `UploadCore`, `File` | [`File`] | 文件上传开始
`FILE_UPLOAD_PREPARED` | `UploadCore`, `File` | [`File`], `FileRequest` |文件上传准备好了
`FILE_UPLOAD_PROGRESS` | `UploadCore`, `File` | [`File`], `Progress` | 文件上传进度中
`FILE_UPLOAD_END` | `UploadCore`, `File` | [`File`] | 文件上传结束
`FILE_UPLOAD_SUCCESS` | `UploadCore`, `File` | [`File`], `FileResponse` | 文件上传成功
`FILE_UPLOAD_ERROR` | `UploadCore`, `File` | [`File`], `Error` | 文件上传失败
`FILE_UPLOAD_COMPLETED` | `UploadCore`, `File` | [`File`], `Status`| 文件上传完成了
`FILE_CANCEL` | `UploadCore`, `File` | [`File`] | 文件退出
`FILE_STATUS_CHANGE` | `UploadCore`, `File` | [`File`], `Status` | 文件状态发生变化


## Errors 错误

我们定义了以下错误，方便错误发生时分辨。

* `AbortError` 中断错误
  - *name:* AbortError
  - *message:* (message)
* `TimeoutError` 超时错误
  - *name:* TimeoutError
  - *message:* (message)
* `NetworkError` 网络错误
  - *status:* http status
  - *name:* NetworkError
  - *message:* (message)
* `QueueLimitError` 队列限制错误
  - *name:* QueueLimitError
  - *message:* queue limit
* `FilterError` 过滤错误
  - *file:* `File`
  - *name:* FilterError
  - *message:* (message)
* `DuplicateError` 文件重复错误，继承自`FilterError`
  - *file:* `File`
  - *name:* DuplicateError
  - *message:* (message)
* `FileExtensionError` 文件扩展名错误，继承自`FilterError`
  - *file:* `File`
  - *name:* FileExtensionError
  - *message:* (message)
* `FileSizeError` 文件大小错误，继承自`FilterError`
  - *file:* `File`
  - *name:* FileSizeError
  - *message:* (message)

## Status 状态

文件在上传过程中经历的状态值。

名称 | 值 | 描述
--- | --- | ---
ALL | 255 | 所有状态
PROCESS | 31 |  包含状态 `INITED` 至 `END`
INITED | 1 | 初始状态
QUEUED | 2 | 进入队列
PENDING | 4 | 队列中等待
PROGRESS | 8 | 上传中
END | 16 | 上传完成, 等待后续处理
SUCCESS | 32 | 上传成功
ERROR | 64 | 上传出错
CANCELLED | 128 | 上传取消 和 `QUEUED` 相反, 退出队列

-----------------------------

以下为更详细的抽象，均在运行时创建，不对外暴露。

## Collector 收集器

### PickerCollector

创建一个`input[type=file]`或者`flash`拾取器，当浏览器支持`DataTransfer&FileList`特性时，会优先使用`input`，拾取器会覆盖在触发区域上方，点击弹出系统对话框以选择文件。

**初始化**

```js
const picker = up.getPickerCollector();
```

在不支持Html5上传时，需要预先提供`flashpicker.swf`的url地址。

```js
UploadCore.setSWF(url);
```

**添加触发区域**

```js
const area = picker.addArea(document.getElementById('upload-button'));
```

我们再添加一个触发区域，或者更多。

```js
const area2 = picker.addArea(document.getElementById('upload-button2'));
```

返回的结果area是一个`Emitter`，在`flash`环境下会响应`鼠标悬停(rollOver)`、`鼠标移出(rollOut)`事件。

```js
area.on('rollOver', () => {

}).on('rollOut', () => {

});
```

当这个添加的area不需要时，可以销毁。

```js
area.destroy()
```

### DndCollector

拖放上传支持。

**初始化**

```js
const dnd = up.getDndCollector();
```

**添加响应区域**

```js
const area = dnd.addArea(document.getElementById('droparea'));
```

返回的结果area是一个`Emitter`，响应`开始拖拽(start)`, `响应拖拽(response)`, `拖拽结束(end)`事件。

```js
area.on('start', (e) => {

}).on('response', (e) => {
   // 返回false值表示：拖拽的项目没有匹配或者未拖进响应区域
   return false;
}).on('end', (e) => {

});
```

当这个添加的area不需要时，可以销毁。

```js
area.destroy()
```

### PasteCollector

粘贴拾取器支持。

**初始化**

```js
const paster = up.getPasterCollector();
```

**添加响应区域**

```js
const area = paster.addArea($('textarea')[0]);
```

返回的结果area是一个`Emitter`，响应`粘贴(paste)`事件。

```js
area.on('paste', (clipboardData) => {

});
```

当这个添加的area不需要时，可以销毁。

```js
area.destroy()
```

## Stat 统计

队列文件的统计。

### Stat.getTotal

获得参与统计的文件个数。

### Stat.getFiles

参数 | 类型 | 描述
--- |----- | ------
flag | `Status` | 状态mask

获得状态为flag的文件集合。flag支持`Status`位操作：

```js
flag = Status.ALL ^ Status.CANCELLED;
flag = Status.SUCCESS | Status.ERROR;
```

`flag`为`null`相当于`Status.ALL`

**返回**

```js
[File, File, ...]
```


### Stat.stat

参数 | 类型 | 描述
--- |----- | ------
flag | `Status` | 状态mask


统计状态为flag的文件数目；flag赋值同上，例如：

```js
stat(Status.SUCCESS | Status.ERROR)
```

**返回**

```
{
    32: 2,
    64: 1,
    sum: 3
}
```

## File 文件

### Properties

**id(string)**

文件唯一id。

**name(string)**

文件名称。对于从粘贴进来的文件资源，有些情况没有文件名，取用`id.ext`作为文件名。

**ext(string)**

文件扩展名。eg. `jpg`。

**type(string)**

文件mimetypes类型。 eg. `image/jpg`。

**lastModified(int)**

文件最后修改时间，精确到毫秒。eg. `1432866554681`。

**size(int)**

文件大小，单位byte。eg. `1024`。

**progress(Progress)**

文件上传进度。

### File.getCore

获取`UploadCore`。

### File.isImage

判断是否是图像文件。`mimetype`为`image/jpg, image/jpeg, image/gif, image/png, image/bmp`其中一种，即为图像。

### File.getStatus

获取当前文件状态，参见`Status`。

### File.getStatusName

获取当前文件状态标识。

### File.getSource

获取源文件资源。

### File.getAsDataUrl

参数 | 类型 | 描述
--- |----- | ------
timeout | `int` | 超时时间

异步获取文件dataurl内容，返回`jQuery-Promise`。

### File.md5

异步计算文件MD5值，返回`jQuery-Promise`。

### File.session

获取一个文件上传的会话，返回一个`jQuery-Promise`，让我们除了可以绑定事件外，还可以用session方式来绑定相关动作。

```js
file.session().done(function (response) {
   // 上传成功了
}).fail(function (error) {
   // 上传失败了
}).progress(function (e) {
   // 上传进度中
});
```

为了某些场景的设计，`session`方式不需要、也不支持解除绑定，等当次上传会话结束后，会自动失效当前`session-promise`。

如果你绑定的操作需要解除绑定或者不希望会失效，请考虑使用绑定事件方式。

### File.complete

参数 | 类型 | 描述
--- |----- | ------
response | `ChunkResponse` or `*` | 用于构造`FileResponse`的原始数据

结束并完成上传会话，这个函数大多数由内部调用，其它情况如秒传时会直接调用。

### File.pending

让文件等待上传，一般用于手动上传、错误重传。

### File.cancel

参数 | 类型 | 描述
--- |----- | ------
silent | `bool` | 静默行为，为 true 时不触发相应的事件

结束上传会话，退出文件上传队列。

### File.on

添加事件监听。

参数 | 类型 | 描述
--- |----- | ------
event | `string` | 事件名称
fn | `function` | 事件处理函数

## Progress 进度

文件上传进度对象。

**total(int)**

上传时总大小，上传时这个值总是大于`size`，因为包含一些请求头信息、formData数据。

**loaded(int)**

已经上传的数据大小。

**percentage(int)**

已经上传的百分比`0-100`。


## FileRequest 文件请求

文件上传请求参数控制，上传时由内部基于`options.request`创建，作为事件`FILE_UPLOAD_PREPARING`的唯一参数。

### FileRequest.getFile

获得请求中的文件对象`File`。

**返回** `File`

### FileRequest.setName

设置上传文件的字段名称，服务端用此字段接收文件。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 上传文件的字段名称

### FileRequest.getName

获取上传文件的字段名称。

**返回** `string`

### FileRequest.setUrl

设置上传服务器端响应url。

参数 | 类型 | 描述
--- |----- | ------
url | `string` | 服务器端响应地址

### FileRequest.getUrl

获得上传服务器端响应。

**返回** `string`

### FileRequest.getParams

获得参数`Params`。

**返回** `Params`

### FileRequest.getParam

获得字段为name的参数集合，同`Params`。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 字段名称

**返回**

```js
[
	{name:'name', value:'value1'},
	{name:'name', value:'value2'},
	...
]
```

### FileRequest.setParam

设置参数值，同`Params`。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 字段名称
value | `*` | 字段值

### FileRequest.getHeaders

获取文件上传时附带的请求头信息。

**返回**

```js
[
	{name:'header1', value:'value1'},
	{name:'header2', value:'value2'},
	...
]
```

### FileRequest.setHeader(name, value)

设置一个附带请求头信息。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 字段名称
value | `*` | 字段值

### FileRequest.setWithCredentials

设置是否上传时附带cookie等验证信息。

参数 | 类型 | 描述
--- |----- | ------
flag | `bool` | 开关

### FileRequest.isWithCredentials

是否上传时附带cookie等验证信息。

**返回** `bool`

### FileRequest.setTimeout

设置上传超时时间。

参数 | 类型 | 描述
--- |----- | ------
timeout | `int` | 超时时间，单位ms

### FileRequest.getTimeout

获取上传超时时间。

**返回** `int`，上传超时时间，单位ms。

### FileRequest.setChunkSize

设置分片大小。

参数 | 类型 | 描述
--- |----- | ------
size | `string` or `int` | 分片大小，单位byte，格式见`options.chunkSize`

### FileRequest.getChunkSize

获取分片大小。

**返回** `int`，分片大小，单位byte。

### FileRequest.setChunkRetries

设置分片上传网络出错重试次数。

参数 | 类型 | 描述
--- |----- | ------
retries | `int` | 重试次数

### FileRequest.getChunkRetries

获取分片上传网络出错重试次数。

**返回** `int`，重试次数。

### FileRequest.setChunkEnable

设置是否开启分片上传。

参数 | 类型 | 描述
--- |----- | ------
flag | `bool` | 开关

### FileRequest.isChunkEnable

判断是否分片上传，需要同时满足`开启了分片上传`、`分片大小大于256K`及`文件大小大于分片大小`三个条件。

**返回** `bool`

### FileRequest.setChunkProcessThreads

设置分片上传并发数，一个文件分为多块上传时，同时上传的数量。

参数 | 类型 | 描述
--- |----- | ------
threads | `int` | 并发数

### FileRequest.getChunkProcessThreads

获取分片上传并发数。

**返回** `int`，并发数。

## FileResponse 文件响应

文件上传完成时由内部创建，作为事件`FILE_UPLOAD_COMPLETING`的唯一参数。

### FileResponse.getFileRequest

获得`FileRequest`。

**返回** `FileRequest`

### FileResponse.isFromMultiChunkResponse

判断是否由多个分片上传完成后响应的数据并实例化而来；正常的分片上传，我们会把最后完成的分片响应数据`ChunkResponse`作为`FileResponse`的原始响应数据；以下俩种情况此返回值为否：

* 无论是否使用多个分片上传时，秒传完成-即直接调用`complete(response)`方式；
* 文件过小、或者未开启分片上传，上传过程没有多个分片。

### FileResponse.getRawResponse

获得原生响应数据。

**返回** `ChunkResponse` | `string` | `null` 

### FileResponse.getJson

尝试返回JSON格式的响应数据。

**返回** `JSON` | `null`

### FileResponse.getResponse

获得响应数据。

**返回** `string` | `*`

### FileResponse.setResponse

设置响应数据，一般为JSON数据。

参数 | 类型 | 描述
--- |----- | ------
response | `JSON` or `*` | 响应数据

## ChunkRequest 文件块请求

文件分片上传时由内部`FileRequest`派生创建，大多数能获取的数值采用改变时从`FileRequest`复制方式来使用，作为事件`CHUNK_UPLOAD_PREPARING`的唯一参数。

### ChunkRequest.getFileRequest

获取`FileRequest`。

**返回** `FileRequest`

### ChunkRequest.getBlob

获取切片对象。

**返回** `Blob`

### ChunkRequest.getIndex

获得切片索引。

**返回** `int`，切片索引，从0开始。

### ChunkRequest.isMultiChunk

是否是多分片上传。

**返回** `bool`

### ChunkRequest.getFile

获得请求中的文件对象`File`，同`FileRequest.getFile`。

### ChunkRequest.getName

获取上传文件的字段名称，同`FileRequest.getName`。

### ChunkRequest.setUrl

设置上传服务器端响应地址，同`FileRequest.setUrl`。

### ChunkRequest.getUrl

获得上传服务器端响应地址，同`FileRequest.getUrl`。

### ChunkRequest.getParams

获得参数，同`FileRequest.getParams`。

### ChunkRequest.getParam

获得字段为name的参数集合，同`FileRequest.getParam`。

### ChunkRequest.setParam

设置参数值，同`FileRequest.setParam`。

### ChunkRequest.getHeaders

获取文件上传时附带的请求头信息，同`FileRequest.getHeaders`。

### ChunkRequest.setHeader

设置一个附带请求头信息，同`FileRequest.setHeaders`。

### ChunkRequest.isWithCredentials

是否上传时附带cookie等验证信息，同`FileRequest.isWithCredentials`。

### ChunkRequest.getTimeout()

获取上传超时，同`FileRequest.getTimeout`。

## ChunkResponse 文件块响应

文件分片上传完成时由内部创建，作为事件`CHUNK_UPLOAD_COMPLETING`的唯一参数。

### ChunkResponse.getChunkRequest

获取`ChunkRequest`。

**返回** `ChunkRequest`

### ChunkResponse.getRawResponse

获得原生响应数据。

**返回** `string` | `null`

### ChunkResponse.getResponse

获得响应数据。

**返回** `string` | `*`

### ChunkResponse.getJson

尝试返回JSON格式的响应数据。

**返回** `JSON` | `null`

### ChunkResponse.setResponse

设置响应数据，一般为JSON数据。

参数 | 类型 | 描述
--- |----- | ------
response | `JSON` or `*` | 响应数据

## Params 请求参数

用于发送的Form Data数据维护，内部由`FileRequest`基于`options.params`创建。

### Params.addParam(name, value)

添加参数值。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 字段名称
value | `*` | 字段值

### Params.removeParam

删除键名为`name`的所有值设置。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 字段名称

### Params.getParam

获得字段name的值设置，`single`为true返回单个值，否则以数组形式返回多个。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 字段名称
single | `bool` `可选` | 是否返回单个值

**返回**

```js
// 多值
[
	{name:'name', value:'value1'},
	{name:'name', value:'value2'},
	...
]

// 单个值
'value1'
```

### Params.setParam

设置参数值，删除键名为`name`的所有值设置，新添加一个值为`value`的设置。

参数 | 类型 | 描述
--- |----- | ------
name | `string` | 字段名称
value | `*` | 字段值

### Params.clone

基于当前实例创建新`Params`。

**返回** `Params`

### Params.toArray

以Array格式导出数据。

**返回**

```js
params = [
  {name: 'foo', value: 'bar'},
  {name: 'foo', value: 'bar1'}
]
```

### Params.toString

以querystring格式返回。

**返回**

```
foo=bar&foo=bar1
```


