/**
 * Flash Picker
 *
 * @author bingbing {@link http://yanbingbing.com}
 */
package {

import flash.display.Sprite;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.events.TimerEvent;
import flash.external.ExternalInterface;
import flash.net.FileFilter;
import flash.net.FileReference;
import flash.net.FileReferenceList;
import flash.system.Security;
import flash.ui.ContextMenu;
import flash.ui.ContextMenuItem;
import flash.utils.Timer;

[SWF(backgroundColor="#000000", width="200", height="200")]
public class FlashPicker extends Sprite {
    private var _setupTimer:Timer = new Timer(500, 0);
    private var _callInterface:String;

    private var _actions:Array = ['send', 'abort', 'cancel', 'pang'];
    private var _files:Object = {};

    private var _picker:*;

    private var _uid:uint = 1000;

    public function FlashPicker():void {
        if (stage) {
            init();
        } else {
            addEventListener(Event.ADDED_TO_STAGE, init);
        }
    }

    private function init():void {
		removeEventListener(Event.ADDED_TO_STAGE, init);

        Security.allowDomain('*');
        Security.allowInsecureDomain('*');

        stage.align = StageAlign.TOP_LEFT;
        stage.scaleMode = StageScaleMode.EXACT_FIT;

        var menu:ContextMenu = new ContextMenu();
        menu.hideBuiltInItems();
        menu.customItems.push(new ContextMenuItem('FlashPicker 2.0.0 @kangwei'));
        this.contextMenu = menu;

        var params:Object = stage.loaderInfo.parameters;

        if (params.hasOwnProperty('callInterface') && /^[\w\.]+$/.test(params.callInterface)) {
            _callInterface = params.callInterface
        } else {
            log('expert callInterface param');
            return;
        }

        _setupTimer.addEventListener(TimerEvent.TIMER, ping);
        _setupTimer.start();
        stage.stageWidth > 0 && ping();
    }

    private function ping(e:TimerEvent = null):void {
        try {
            ExternalInterface.addCallback('exec', exec);
        } catch (e:Error) {
			return;
        }
        ExternalInterface.call(_callInterface + '.ping');
    }

    private function pang():void {
		_setupTimer.stop();
        _setupTimer.removeEventListener(TimerEvent.TIMER, ping);
        _setupTimer = null;
        setup();
    }

    private function setup():void {
		var button:Sprite = new Sprite;
        button.graphics.beginFill(0, 0);
        button.graphics.drawRect(0, 0, Math.max(stage.stageWidth, 20), Math.max(stage.stageHeight, 20));
        button.graphics.endFill();
        button.buttonMode = true;
        button.useHandCursor = true;
        addChild(button);

        addEventListener(MouseEvent.CLICK, onClick);

        addEventListener(MouseEvent.ROLL_OVER, onRoll);
        addEventListener(MouseEvent.ROLL_OUT, onRoll);

		emit(new PickerEvent(PickerEvent.READY));
    }

    private function onClick(e:MouseEvent):void {
		var options:Object = ExternalInterface.call(_callInterface + '.getOptions') || {};

		log(options);
        var accept:Array = options.accept, filters:Array = [];

		if (accept) {
			for (var i:int = 0; i < accept.length; i++) {
				filters.push(new FileFilter(
					accept[i].title || accept[i].extensions.join(','),
					'*.' + accept[i].extensions.join(';*.')
				));
			}
		}

		_picker = options.multiple ? new FileReferenceList : new FileReference;
        _picker.addEventListener(Event.CANCEL, onCancel);
        _picker.addEventListener(Event.SELECT, onSelect);
        _picker.browse(filters);
        emit(new PickerEvent(PickerEvent.SELECT_OPEN));
    }

    private function onRoll(e:MouseEvent):void {
        emit(new PickerEvent(e.type));
    }

    private function onCancel(e:Event):void {
        _picker.removeEventListener(Event.CANCEL, onCancel);
        _picker.removeEventListener(Event.SELECT, onSelect);
        if (e.type === Event.CANCEL) {
            emit(new PickerEvent(PickerEvent.SELECT_CANCEL));
        }
    }

    private function onSelect(e:Event):void {
        onCancel(e);

        var list:Array;
        if (_picker is FileReference) {
            list = [_picker];
        } else {
            list = _picker.fileList;
        }

        var id:String;
        var file:File;
        var files:Array = [];
        for (var n:uint = 0, l:uint = list.length; n < l; n++) {
            id = uid();
            file = new File(id, list[n]);
            files.push(file);
            _files[id] = file;
        }

        emit(new PickerEvent(PickerEvent.SELECT, {
            files: files
        }));
    }

    private function uid():String {
        return (_uid++).toString(16).toUpperCase();
    }

    private function send(name:String, id:String, url:String, variables:String = null):void {
        if (!(id in _files)) {
            return;
        }
        var file:File = _files[id];
		file.addEventListener(UploadEvent.UPLOAD_START, onUploadStart);
        file.addEventListener(UploadEvent.UPLOAD_PROGRESS, onUploadProgress);
        file.addEventListener(UploadEvent.UPLOAD_COMPLETE, onUploadComplete);
        file.addEventListener(UploadEvent.UPLOAD_ERROR, onUploadError);
        file.send(url, variables, name);
    }

    private function abort(id:String):File {
        if (!(id in _files)) {
            return null;
        }
        var file:File = _files[id];
        file.abort();
		return file;
    }

	private function cancel(id:String):void {
		this.abort(id);
		removeUpload(this.abort(id));
	}

    private function onUploadStart(event:UploadEvent):void {
        var file:File = event.target as File;
        emit(PickerEvent.fromEvent(event));
    }

    private function onUploadProgress(event:UploadEvent):void {
        var file:File = event.target as File;
        emit(PickerEvent.fromEvent(event));
    }

    private function onUploadComplete(event:UploadEvent):void {
        var file:File = event.target as File;
        emit(PickerEvent.fromEvent(event));
		resetUpload(file);
    }

    private function onUploadError(event:UploadEvent):void {
        var file:File = event.target as File;
        emit(PickerEvent.fromEvent(event));
        resetUpload(file);
    }

    private function removeUpload(file:File):void {
		if (!file) {
			return;
		}
        resetUpload(file);
        delete _files[file.id];
    }

    private function resetUpload(file:File):void {
        file.removeEventListener(UploadEvent.UPLOAD_START, onUploadStart);
        file.removeEventListener(UploadEvent.UPLOAD_PROGRESS, onUploadProgress);
        file.removeEventListener(UploadEvent.UPLOAD_COMPLETE, onUploadComplete);
        file.removeEventListener(UploadEvent.UPLOAD_ERROR, onUploadError);
    }

    private function exec(action:String, ...args):* {
        if (_actions.indexOf(action) === -1) return null;
        return this[action].apply(this, args);
    }

    private static function log(obj:*):void {
        ExternalInterface.call("console.info(" + JSON.stringify(obj) + ")");
    }

    private function emit(event:PickerEvent):void {
        ExternalInterface.call(_callInterface + '.emit', event.type, event.data);
    }
}
}