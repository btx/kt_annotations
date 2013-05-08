goog.require('goog.net.XmlHttp');


anno.addHandler('onAnnotationCreated', function (annotation) {
    annotation.id = Math.random().toString(36).substring(7);
    console.log('created', annotation);
});

anno.addHandler('onAnnotationUpdated', function (annotation) {
    console.log('updated', annotation);
});

anno.addHandler('onAnnotationRemoved', function (annotation) {
    console.log('removed', annotation);
});

var getDataAndAlertIt = function (url) {
    var xhr = goog.net.XmlHttp();
    var isAsynchronous = true;
    xhr.open('GET', url, isAsynchronous);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == goog.net.XmlHttp.ReadyState.COMPLETE) {
            alert('This alert will display second: ' + xhr.responseText);
        }
    };
    xhr.send(null);
};
