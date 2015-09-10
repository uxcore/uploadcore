/**
 * Flash Picker
 *
 * @author bingbing {@link http://yanbingbing.com}
 */
package {

import flash.events.DataEvent;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.HTTPStatusEvent;
import flash.events.IOErrorEvent;
import flash.events.ProgressEvent;
import flash.events.SecurityErrorEvent;
import flash.events.TimerEvent;
import flash.external.ExternalInterface;
import flash.net.FileReference;
import flash.net.URLRequest;
import flash.net.URLRequestHeader;
import flash.net.URLRequestMethod;
import flash.net.URLVariables;
import flash.utils.Timer;

public class File extends EventDispatcher {
    private var _file:FileReference;
    private var _id:String;
	private var _status:int;

    private var _dataTimer:Timer = new Timer(100, 1);

    public function File(id:String, file:FileReference) {
        _file = file;
        _id = id;
        _dataTimer.addEventListener(TimerEvent.TIMER, function ():void {
            _dataTimer.reset();
            onComplete(new DataEvent(DataEvent.UPLOAD_COMPLETE_DATA, false, false, ""));
        });
    }

    public function get name():String {
        return _file.name;
    }

    public function get size():Number {
        return _file.size;
    }

    public function get lastModified():Number {
        return _file.modificationDate.getTime();
    }

    public function get id():String {
        return _id;
    }

    public function abort():void {
        _file.cancel();
        reset();
    }

    private function onProgress(event:ProgressEvent):void {
        dispatchEvent(new UploadEvent(UploadEvent.UPLOAD_PROGRESS, {
            loaded: event.bytesLoaded,
            total: event.bytesTotal
        }));
    }

    private function onCompleteTimer(event:Event):void {
        _file.removeEventListener(Event.COMPLETE, onCompleteTimer);
        _dataTimer.start();
    }

    private function onComplete(event:DataEvent):void {
        reset();
		
		if (_status == 0) {
			_status = 200;
		}
		
        dispatchEvent(new UploadEvent(UploadEvent.UPLOAD_COMPLETE, {
			status: _status,
            response: event.data
        }));
    }
	
	private function onStatus(e:HTTPStatusEvent) : void {
		_status = e.status;
	}
	
	private function onIOError(e:IOErrorEvent) : void {
		if (_status == 0) {
			_status = 404;
		}
		onComplete(new DataEvent(DataEvent.UPLOAD_COMPLETE_DATA, false, false, e.text));
	}

    private function onError(e:SecurityErrorEvent):void {
        reset();
        dispatchEvent(new UploadEvent(UploadEvent.UPLOAD_ERROR, {
			name: e.type,
            message: e.text
        }));
    }

    private function reset():void {
        if (_dataTimer.running) {
            _dataTimer.reset();
        }
        _file.removeEventListener(ProgressEvent.PROGRESS, onProgress);
        _file.removeEventListener(Event.COMPLETE, onCompleteTimer);
        _file.removeEventListener(DataEvent.UPLOAD_COMPLETE_DATA, onComplete);
        _file.removeEventListener(IOErrorEvent.IO_ERROR, onIOError);
        _file.removeEventListener(HTTPStatusEvent.HTTP_STATUS, onStatus);
        _file.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, onError);
    }

    public function send(url:String, variables:String, name:String):void {
		var request:URLRequest = new URLRequest(url);
		request.method = URLRequestMethod.POST;
		if (variables) {
        	request.data = new URLVariables(variables);
		}
        _file.addEventListener(ProgressEvent.PROGRESS, onProgress);
        _file.addEventListener(Event.COMPLETE, onCompleteTimer);
        _file.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, onComplete);
        _file.addEventListener(HTTPStatusEvent.HTTP_STATUS, onStatus);
        _file.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
        _file.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onError);
		
		_status = 0;
        dispatchEvent(new UploadEvent(UploadEvent.UPLOAD_START));
        try {
            _file.upload(request, name);
        } catch (e:Error) {
            onError(new SecurityErrorEvent(e.name, false, false, e.message));
        }
    }
}
}