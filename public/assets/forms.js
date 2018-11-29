/**
 * Intercepts form submissions using Turbolinks
 * Note: this overrides the form's submission behavior
 */

$(document).on('turbolinks:load', function() {
    $('[data-turbolinks-form]').submit(function(e) {
        var form = this;

        // prevent submission if form is invalid
        $(form).addClass('was-validated')

        if (!form.checkValidity()) {
            $('#alerts').html(
                $('<div class="alert alert-danger"/>')
                    .text('Please correct the errors below and resubmit your application.')
            )[0].scrollIntoView();

            return false;
       }

        // avoid using jquery ajax b/c we need to set processData to false, etc
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
    });

    $('[data-custom-file-input]').change(function (e) {
        console.log('label[for="' + this.id + '"]');
        var label = $('label[for="' + this.id + '"]')
            .text('Choose File');

        console.log('changed', this.files)

        if (!label.length || !this.files || !this.files.length) return;

        var filename = this.files[0].name;
        label.text(filename.length < 20
            ? filename
            : filename.substr(0, 20) + '...'
        );
    })
})
