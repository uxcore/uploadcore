/**
 * Flash Picker
 *
 * @author bingbing {@link http://yanbingbing.com}
 */
package {

public class PickerEvent {
    /* uploader ready */
    public static const READY:String = 'ready';
    /* open select*/
    public static const SELECT_OPEN:String = 'selectOpen';
    /* cancel select */
    public static const SELECT_CANCEL:String = 'selectCancel';
    /* files was selected*/
    public static const SELECT:String = 'select';

    private var _data:Object = {};
    private var _type:String;

    public function PickerEvent(type:String, data:Object = null) {
        _type = type;
        _data = data;
    }

    public function get type():String {
        return _type;
    }

    public function get data():Object {
        return _data;
    }

    public static function fromEvent(event:UploadEvent):PickerEvent {
        var data:Object = event.data || {};
        var file:File = event.target as File;
        data.file = file;
        data.id = file.id;
        return new PickerEvent(event.type, data);
    }
}
}