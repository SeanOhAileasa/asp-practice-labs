var notifications = {
    LabDesktop: null,
    Add: function (object, timer) {
        if (typeof (object) !== 'undefined') {
            var majorAlert;
            if (typeof (object.Message) === "undefined") {
                majorAlert = JSON.parse(object);
            } else {
                majorAlert = object;
            }

            if (notifications.LabDesktop === null) {
                notifications.LabDesktop = $('#lab-desktop');
            }

            var element = $('<div>');
            element.addClass('lab-desktop-notification').append($('<div>').addClass('notification').prepend(majorAlert.Message).append($('<button/>').attr('onclick', 'notifications.Remove(this);').text('Close')));

            if (typeof (timer) !== 'undefined') {
                notifications.LabDesktop.prepend(element);

                setTimeout(function () {
                    $(element).remove();
                }, timer);

            } else {
                notifications.LabDesktop.prepend(element);
            }

            if (typeof (majorAlert.Redirect) !== 'undefined' && majorAlert.Redirect.length > 0 && majorAlert.Redirect === "REFRESH") {
                var countDown = $('<div>').text(majorAlert.RedirectTime / 1000 + ' seconds');
                countDown.appendTo(element.find('.notification:first'));
                element.find('button').remove();
                var refresh = majorAlert.RedirectTime;
                setInterval(function () {
                    refresh -= 1000;
                    if (refresh >= 0) {
                        countDown.text(refresh / 1000 + ' seconds');
                        if (refresh <= 0) {
                            window.location.href = window.location;
                        }
                    }
                }, 1000);
            }
        }
    },
    Remove: function (e) {
        if (typeof e !== 'undefined') {
            $(e).parent().parent().addClass('hidden');

            if (!$(e).prev().hasClass('hidden')) {
                $(e).prev().addClass('hidden');
            }
        }
    }
}