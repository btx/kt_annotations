goog.provide('kt_annotations.main');

goog.require('goog.proto.Serializer');
goog.require('goog.Uri');
goog.require('goog.net.XhrIo');


kt_annotations.main = function() {

};

kt_annotations.main.load = function() {
    var xhr = new goog.net.XhrIo();

    goog.events.listen(xhr, goog.net.EventType.SUCCESS, function(e) {
        var annotations = e.target.getResponseJson();

        goog.array.forEach(annotations, function(annotation) {
            if (annotation.shapes) {
                anno.addAnnotation(annotation);
            }
        })
    });

    xhr.send('/annotations', 'GET', qd);
};

// TODO: update annotations only if store/update/delete action is successful?
kt_annotations.main.store = function(annotation, callback) {
    var serializer = new goog.proto.Serializer(null);
    var qd = new goog.Uri.QueryData();
    qd.add('annotation', serializer.serialize(annotation));

    callback = callback || function() {};

    var xhr = new goog.net.XhrIo();

    goog.events.listen(xhr, goog.net.EventType.SUCCESS, function (e) {
        var obj = e.target.getResponseJson();
        annotation.id = obj.id;

        callback.apply(this, [annotation]);
    });

    xhr.send('/annotations', 'POST', qd);
};

kt_annotations.main.remove = function(annotation, callback) {
    callback = callback || function() {};

    var xhr = new goog.net.XhrIo();
    goog.events.listen(xhr, goog.net.EventType.SUCCESS, callback);
    xhr.send('/annotations/' +  annotation.id, 'DELETE');
};

kt_annotations.main.start = function() {
    anno.addHandler('onAnnotationCreated', function (annotation) {
        kt_annotations.main.store(annotation, function() {
            console.log('created', annotation);
        });
    });

    anno.addHandler('onAnnotationUpdated', function (annotation) {
        kt_annotations.main.store(annotation, function() {
            console.log('updated', annotation);
        });
    });

    anno.addHandler('onAnnotationRemoved', function (annotation) {
        kt_annotations.main.remove(annotation, function() {
            console.log('removed', annotation);
        });
    });

//    anno.makeAnnotatable(document.getElementById('img_1'));
    setTimeout(function() {
        kt_annotations.main.load();
    }, 500);
};

goog.exportSymbol('main', kt_annotations.main);
goog.exportProperty(kt_annotations.main, 'start', kt_annotations.main.start);
