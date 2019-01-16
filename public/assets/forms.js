/**
 * Intercepts form submissions using Turbolinks
 * Note: this overrides the form's submission behavior
 */

$(document).on('turbolinks:load', function () {

    // limit scientific focus areas
    $('[name="scientific_focus"]').change(function (e) {
        if ($('[name="scientific_focus"]:checked').length > 5)
            this.checked = false;
    });


    $('[data-custom-file-input]').change(function (e) {
        var label = $('label[for="' + this.id + '"]')
            .text('Choose File');
        var maxLength = label.attr('data-length') || 20;

        if (!label.length || !this.files || !this.files.length) return;

        var filename = this.files[0].name;
        label.text(filename.length < maxLength
            ? filename
            : filename.substr(0, maxLength) + '...'
        );
    });

    // use custom date inputs, if available
    $('input[type="date"]').each(function () {
        $(this)
            .attr('type', 'text')
            // .attr('readonly', true)
            .addClass('c-pointer bg-white');

        $(this).daterangepicker({
            startDate: $(this).val() || undefined,
            autoUpdateInput: false,
            singleDatePicker: true,
            showDropdowns: true,
            locale: {
                format: 'YYYY-MM-DD'
            }
        }).on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD'));
        }).on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
        });
    });

    $('[data-turbolinks-form]').submit(function (e) {
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
        request.addEventListener('load', function () {
            var referrer = form.action || window.location.href;
            var snapshot = Turbolinks.Snapshot.wrap(this.responseText);
            Turbolinks.controller.cache.put(referrer, snapshot)
            Turbolinks.visit(referrer, { action: 'restore' });
        });
        request.open(form.method, form.action);
        request.send(new FormData(form));

        return false;
    });

})
