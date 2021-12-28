(function(win, doc) {

    class DOM {
        get = function get(selector) {
            return doc.querySelector(selector);
        };

        getAll = function getAll(selector) {
            return doc.querySelectorAll(selector);
        }
    };

    win.DOM = new DOM();
})(window, document);

/* Usage:
$.get('selector');
$.getAll('selector');
*/