/**
 * Intercepts form submissions using Turbolinks
 * Note: this overrides the form's submission behavior
 */
document.addEventListener('turbolinks:load', function() {
    var forms = document.querySelectorAll('[data-turbolinks-form]');
    [].slice.call(forms).forEach(function(form) {
        form.onsubmit = function() {
            var request = new XMLHttpRequest();
            request.addEventListener('load', function() {
                var referrer = window.location.href;
                var snapshot = Turbolinks.Snapshot.wrap(this.responseText);
                Turbolinks.controller.cache.put(referrer, snapshot)
                Turbolinks.visit(referrer, {action: 'restore'});
            });
            request.open(form.method, form.action);
            request.send(new FormData(form));
            return false;
        }
    });
})
