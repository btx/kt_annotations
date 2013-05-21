/**
 * @fileoverview
 * @author zdenek@softic.cz (Zdenek Softic)
 */

goog.provide('kt_annotations');

goog.require('goog.proto.Serializer');
goog.require('goog.Uri');
goog.require('goog.net.XhrIo');


kt_annotations.main = function() {

};

/**
 * @const
 * @type {string}
 */
kt_annotations.BASE_URL = '/annotations';

/**
 *
 */
kt_annotations.load = function() {
    var xhr = new goog.net.XhrIo();

    goog.events.listen(xhr, goog.net.EventType.SUCCESS, function(e) {
        var annotations = e.target.getResponseJson();

        goog.array.forEach(annotations, function(annotation) {
            if (annotation.shapes) {
                anno.addAnnotation(annotation);
            }
        })
    });

    xhr.send(kt_annotations.BASE_URL, 'GET');
};

// TODO: update annotations only if store/update/delete action is successful?
/**
 * Stores annotation using Ajax call.
 * @param {Object} annotation Annotation object to store
 * @param {function(Object)=} callback
 */
kt_annotations.store = function(annotation, callback) {
    var serializer = new goog.proto.Serializer();
    var qd = new goog.Uri.QueryData();
    qd.add('annotation', serializer.serialize(annotation));

    callback = callback || function() {};

    var xhr = new goog.net.XhrIo();

    goog.events.listen(xhr, goog.net.EventType.SUCCESS, function (e) {
        var obj = e.target.getResponseJson();
        annotation.id = obj.id;

        callback.apply(this, [annotation]);
    });

    xhr.send(kt_annotations.BASE_URL, 'POST', qd);
};

/**
 * Removes annotation using Ajax call.
 * @param {Object} annotation
 * @param {function(Object)=} callback
 */
kt_annotations.remove = function(annotation, callback) {
    callback = callback || function() {};

    var xhr = new goog.net.XhrIo();
    goog.events.listen(xhr, goog.net.EventType.SUCCESS, callback);
    xhr.send(kt_annotations.BASE_URL + '/' +  annotation.id, 'DELETE');
};

/**
 *
 */
kt_annotations.start = function() {
    anno.addHandler('onAnnotationCreated', function (annotation) {
        kt_annotations.store(annotation, function() {
            window.console.log('created', annotation);
        });
    });

    anno.addHandler('onAnnotationUpdated', function (annotation) {
        kt_annotations.store('fail');
        kt_annotations.store(annotation, function() {
            window.console.log('updated', annotation);
        });
    });

    anno.addHandler('onAnnotationRemoved', function (annotation) {
        kt_annotations.remove(annotation, function() {
            window.console.log('removed', annotation);
        });
    });

//    anno.makeAnnotatable(document.getElementById('img_1'));
//    anno.makeAnnotatable(document.getElementsByTagName('img')[0]);
//    anno.makeAnnotatable(document.getElementsByTagName('img')[1]);
    setTimeout(function() {
        kt_annotations.load();
    }, 500);
};

goog.exportSymbol('kt_annotations', kt_annotations);
goog.exportProperty(kt_annotations, 'start', kt_annotations.start);
