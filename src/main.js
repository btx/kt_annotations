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
 * Loads annotations using Ajax call.
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
 * @param {function(Object)=} success
 * @param {function(Object)=} error
 */
kt_annotations.store = function(annotation, success, error) {
    var data = 'annotation=' + goog.json.serialize(annotation);

    var xhr = new goog.net.XhrIo();

    if (error) {
        goog.events.listen(xhr, goog.net.EventType.ERROR, error);
    }

    goog.events.listen(xhr, goog.net.EventType.SUCCESS, function (e) {
        var obj = e.target.getResponseJson();
        annotation.id = obj.id;

        if (success) {
            success.apply(this, [annotation]);
        }
    });

    xhr.send(kt_annotations.BASE_URL, 'POST', data);
};

/**
 * Removes annotation using Ajax call.
 * @param {Object} annotation
 * @param {function(Object)=} success
 * @param {function(Object)=} error
 */
kt_annotations.remove = function(annotation, success, error) {
    var xhr = new goog.net.XhrIo();
    if (success) {
        goog.events.listen(xhr, goog.net.EventType.SUCCESS, success);
    }

    if (error) {
        goog.events.listen(xhr, goog.net.EventType.ERROR, error);
    }

    xhr.send(kt_annotations.BASE_URL + '/' +  annotation.id, 'DELETE');
};

/**
 *
 */
kt_annotations.start = function() {
    anno.addHandler('onAnnotationCreated', function (annotation) {
        kt_annotations.store(annotation, function() {
            console.log('created', annotation);
        }, function() {
            anno.removeAnnotation(annotation);
        });
    });

    anno.addHandler('onAnnotationUpdated', function (annotation) {
        kt_annotations.store(annotation, function() {
            console.log('updated', annotation);
        });
    });

    anno.addHandler('onAnnotationRemoved', function (annotation) {
        kt_annotations.remove(annotation, function() {
            console.log('removed', annotation);
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
