$(document).ready(function () {
    $('#tab-main [role="tab"]').on('keydown click', function (e) {
        var tab = '';
        if (e.type === 'keydown') {
            var $target, $original = $(this), $previous = $(this).parents('li').prev().children('[role="tab"]'), $next = $(this).parents('li').next().children('[role="tab"]');
            var f = null;
            switch (e.keyCode) {
            case 37:
            {
                $target = $previous;
                break;
            }
            case 39:
            {
                $target = $next;
                break;
            }
            case 32:
            {
                f = $(this).data('focus');
                break;
            }
            case 13:
            {
                f = $(this).data('focus');
                break;
            }
            default:
            {
                return;
            }
            }
            

            if (typeof($target) !== "undefined" && $target !== null && $target.length) {

                $original.attr({
                    'tabindex': '-1',
                    'aria-selected': null
                });

                $target.attr({
                    'tabindex': '0',
                    'aria-selected': true
                }).focus();

                if ($previous.length === 0) {
                    $previous = $original;
                }

                $($original.attr('href')).attr('aria-hidden', true);
                $($previous.attr('href')).attr('aria-hidden', true);
                $($(document.activeElement).attr('href')).attr('aria-hidden', null);
                tab = $target.data('focus');
            }
        } else {
            e.preventDefault();
            $('#tab-main [role="tab"]').attr('aria-hidden', true).attr('aria-selected', null);
            $('#aside-main [role="tabpanel"]').attr('aria-hidden', true);

            // show corresponding panel
            $(this).attr('aria-hidden', null).attr('aria-selected', true);
            $($(this).attr('href')).attr('aria-hidden', null);
            tab = $(this).data('focus');
        }

        switch (tab) {
        case 'exercise-content':
        {
            if ($('#exercise-content').html().length > 100) {
                $('#print-content').removeClass('hidden');
                $('#bottom-nav').removeClass('hidden');
            } else {
                $('#print-content').addClass('hidden');
                $('#bottom-nav').addClass('hidden');
            }
            break;
        }
        default:
        {
            $('#top-nav').hide();
            $('#bottom-nav').addClass('hidden');
            $('#print-content').addClass('hidden');
            break;
        }
        }
    });
});
