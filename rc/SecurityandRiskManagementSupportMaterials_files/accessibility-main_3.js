
var ASIDEDEFAULTPOSITION = 480, ASIDEMINWIDTH = 330, DRAGBARSTEP = 10, DRAGBARWIDTH = 112;

var courses = {
    SearchBox: null,
    List: null,
    Text: [],
    Search: function () {
        var b, p;
        if (courses.SearchBox === null) {
            courses.SearchBox = $('#course-search');
        }
        if (courses.List === null) {
            courses.List = {};
            $('.course-group').each(function () {
                var secObj = $(this), t = secObj.text();
                courses.List[t] = [secObj, []];
                $(this).find('ul li').each(function () {
                    courses.List[t][1].push([$(this), $(this).text().toLowerCase()]);
                });
            });
        }

        var v = courses.SearchBox.val().toLowerCase();
        if (v.length > 0) {
            for (p in courses.List) {
                var groupLength = courses.List[p][1].length, count = 0, cgVisible = false;
                for (b = 0; b < courses.List[p][1].length; b++) {
                    if (courses.List.hasOwnProperty(p)) {
                        if (courses.List[p][1][b][1].indexOf(v) === -1) {
                            courses.List[p][1][b][0].addClass('hidden');
                            count++;
                            if (count === groupLength) {
                                courses.List[p][0].addClass('hidden');
                            }
                        } else {
                            if (!cgVisible) {
                                courses.List[p][0].removeClass('hidden');
                                cgVisible = true;
                            }
                            courses.List[p][1][b][0].removeClass('hidden');
                        }
                    }
                }
            }
        } else {
            for (p in courses.List) {
                courses.List[p][0].removeClass('hidden');
                for (b = 0; b < courses.List[p][1].length; b++) {
                    if (courses.List.hasOwnProperty(p)) {
                        courses.List[p][1][b][0].removeClass('hidden');
                    }
                }
            }
        }
    }
};

var dialog = {
    Visible: false,
    Panel: null,
    Content: null,
    Callback: null,
    CloseButton: null,
    o: null,
    device: null,
    Open: function (partial, callback, o, device) {

        dialog.Visible = true;

        if ($('#modal-actions').css('display') === 'none') {
            $('#modal-actions').hide();
            $('#modal-top-actions').hide();

        } else {
            tutorial.ShowModalActions();
        }

        if (typeof callback === 'function') {
            dialog.Callback = callback;

            if (typeof o !== 'undefined') {
                dialog.o = o;
            }

            if (typeof device !== 'undefined') {
                dialog.device = device;
            }
        }

        if (dialog.Panel === null) {
            dialog.Panel = $('#modal-cover');
            dialog.CloseButton = $('#modal-close-button');
            dialog.Content = dialog.Panel.find($('#modal-body-content'));
        }

        if (typeof partial !== 'undefined' && partial !== null && partial.length > 0) {

            dialog.Content.load('partials/' + partial, function() {

                dialog.Panel.removeClass('hidden');
                dialog.Panel.attr('aria-hidden', false);

                $('#skiptocontent').attr('aria-hidden', true);
                $('#page-wrap').attr('aria-hidden', true);

                loopFocus(document.querySelector('#modal-card'));

                document.onkeyup = function (event) {

                    if (event.keyCode === 27) {
                        dialog.Close(event);
                    }
                };
            });
        }
    },
    Execute: function (e) {

        var result = false;

        if (e.keyCode === 32 || e.keyCode === 13 || e.type === 'click') {

            dialog.Close(e);

            if (typeof dialog.Callback === 'function') {

                if (dialog.o !== null) {

                    if (dialog.device !== null) {
                        // this came from device reset
                        result = [dialog.Callback(dialog.o, dialog.device, true)];

                    } else {
                        // this came from reset all
                        result = [dialog.Callback(dialog.o, true)];
                    }

                } else {
                    result = [dialog.Callback];
                }
            }

            dialog.o = null;
            dialog.device = null;
        }

        return result;
    },
    Close: function(e) {

        if (e.keyCode === 32 || e.keyCode === 13 || e.keyCode === 27 || e.type === 'click') {

            document.onkeyup = null;

            dialog.Visible = false;

            if (dialog.Panel) {
                dialog.Panel.addClass('hidden');
                dialog.Panel.attr('aria-hidden', true);

                $('#skiptocontent').attr('aria-hidden', false);
                $('#page-wrap').attr('aria-hidden', false);
            }
            
            $('#modal-actions').show();
            $('#modal-top-actions').show();
            $('#lab-desktop').attr('style', '');

            if (dialog.o) {
                dialog.o.focus();
            }

            return true;
        }

        return false;
    }
};

var modal = {
    Current: null,
    OnClose: null,
    Show: function (content, onClose) {
        if (typeof content !== "undefined" && content !== null) {
            if (modal.Current !== null) {
                modal.Current.appendTo('#helper-content');
            }
            if (content.indexOf(' ') > -1) {
                var close = '<p>Click <strong>Cancel</strong> to close this dialog.</p><button role="button" onclick="modal.Close();" class="button btn-group-lg">Cancel</button>';
                $('#modal-main-content').append(content + close);
            } else {
                modal.Current = $('#helper-' + content);
                modal.Current.appendTo('#modal-main-content');
            }
            $('#modal-cover').removeClass('hidden');
        }
        if (typeof onClose !== "undefined" && onClose !== null && typeof onClose === "function") {
            modal.OnClose = onClose;
        }
    },
    Close: function () {
        $('#modal-cover').addClass('hidden');
        if (modal.Current !== null) {
            modal.Current.appendTo('#helper-content');
        } else {
            $('#modal-main-content').html('');
        }
        modal.Current = null;
        if (modal.OnClose !== null) {
            modal.OnClose();
            modal.OnClose = null;
        }
    }
};

var settings = {
    Ui: {
        FontAdjust: function() {
            var size = $('input:radio[name="settings-font-size"]:checked').val();
            $('body').css('font-size', size + 'px');

            if (size > 14) {
                $('#settings-personal .switch').removeClass('tiny').addClass('small');
            } else {
                $('#settings-personal .switch').removeClass('small').addClass('tiny');
            }

            settings.Settings.VNextOptions.FontSize = size;
            settings.Save();
            return false;
        }
    },
    EmailTimeOut: null,
    EmailAddress: function(o) {
        if (tools.ConfirmInput('email', $(o).val())) {

            $('#email-address-error').addClass('hidden');
            $(o).addClass('input-ok').removeClass('input-nok');

            if ($(o).attr('id') === 'email-address') {
                $('#btn-email-address-edit').removeAttr('disabled').addClass('inp-ok').removeClass('inp-no-ok');

            } else {
                $('#ticket-email-btn-next').attr('disabled', false);
            }

            settings.Complete = true;

        } else {

            settings.Complete = false;
            $('#email-address-error').removeClass('hidden');
            $(o).addClass('input-nok').removeClass('input-ok');

            if ($(o).attr('id') === 'email-address') {
                $('#btn-email-address-edit').attr('disabled', true).addClass('inp-no-ok').removeClass('inp-ok');

            } else if ($(o).attr('id') === 'ticketEmail') {
                $('#ticket-email-btn-next').attr('disabled', true);
            }
        }
    },
    EditEmailAddress: function(t, e) {
        if (typeof (e) !== "undefined") {
            if (e.keyCode !== 32) {
                return;
            }
        }
        var ea = $('#email-address');
        var th = $(t);
        if (th.text() === "Edit") {
            ea.attr('disabled', false).focus();
            settings.Complete = true;
            th.text('Done');
        } else {
            if (settings.Complete) {
                if (tools.ConfirmInput('email', ea.val())) {
                    hub.server.saveEmailAddress(ea.val()).done(function(d) {
                        if (d) {
                            ea.attr('disabled', true).removeClass('input-ok').removeClass('input-nok');
                            th.text('Edit').attr('disabled', false).removeClass('inp-ok').removeClass('inp-no-ok');
                        } else {
                            ea.attr('disabled', true).removeClass('input-ok').addClass('input-nok');
                        }
                    });
                }
            }
        }
    },
    Settings: {
    
    },
    ToggleMessage: function (o, state, save, event) {

        if (o) {

            var text = $(o).parent().text();

            lab.Log.AddEntry(null, '', 'Setting changed: ' + text + (state ? ' enabled.' : ' disabled.'));

            if (event) {
                event.preventDefault();
            }

            if (save) {
                settings.Save();
            }
        }
    },
    Save: function() {
        hub.server.vNextSetSettings(JSON.stringify(settings.Settings.VNextOptions));
    },
    SaveV4: function() {

    },
    ReceiveVNext: function(s) {
        settings.Settings.VNextOptions = s;

        if (typeof (settings.Settings.VNextOptions.AsidePanel) === "undefined") {
            settings.Settings.VNextOptions.AsidePanel = {
                Position: ASIDEDEFAULTPOSITION,
                Visible: true
            };
        }

        $('#ticketEmail').val($('#email-address').val());

        if (settings.Settings.VNextOptions.DeviceWindow === null ||
            settings.Settings.VNextOptions.DeviceWindow.Width === 0) {

            settings.Settings.VNextOptions.DeviceWindow = {
                Fit: false,
                AnchorWindow: true,
                Width: 0,
                Height: 0
            };

            lab.GetWidthAndHeight();

            settings.Save();
        }

        var winWidth = $(window).width();

        if (settings.Settings.VNextOptions.AsidePanel.Position > winWidth || settings.Settings.VNextOptions.AsidePanel.Position < DRAGBARWIDTH) {
            if (settings.Settings.VNextOptions.AsidePanel.Position > 0) {
                settings.Settings.VNextOptions.AsidePanel.Position = winWidth - DRAGBARWIDTH;
            } else {
                settings.Settings.VNextOptions.AsidePanel.Position = ASIDEDEFAULTPOSITION;
            }
            content.Aside.ReDraw();
        }
        if (!settings.Settings.VNextOptions.AsidePanel.Visible) {
            $('#lab-area').css({ 'left': '10px' }).css({ 'width': '100%' }).css({ 'width': '-=10px' });
        } else {
            $('#lab-area').css({ 'left': (settings.Settings.VNextOptions.AsidePanel.Position + DRAGBARSTEP) + 'px' })
                .css({ 'width': '100%' }).css({
                    'width': '-=' + (settings.Settings.VNextOptions.AsidePanel.Position + DRAGBARSTEP) + 'px'
                });
        }

        $('body').css('font-size', settings.Settings.VNextOptions.FontSize + 'px');

        lab.SetFitWidthState(settings.Settings.VNextOptions.DeviceWindow.Fit);
    },
    Logout: function () {
        lab.Microsoft.WindowManager.CloseAll();
        window.location.href = window.location.protocol + '//' + window.location.host + '/logout.aspx';
    }
};

var focusElements = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, [tabindex="0"], [contenteditable]';

function loopFocus(focusContainer, focusElement) {

    if (!focusContainer) return false;

    var focusableElements = focusContainer.querySelectorAll(focusElements);

    var keyboardHandler;

    // There can be containers without any focusable element
    if (focusableElements.length > 0) {

        var firstFocusableEl = focusableElements[0],
            lastFocusableEl = focusableElements[focusableElements.length - 1],
            elementToFocus = focusElement ? focusElement : firstFocusableEl;

        elementToFocus.focus();

        keyboardHandler = function(event) {

            var keyCode = event.keyCode || event.which;

            if (keyCode && keyCode === 9) {

                //Rotate Focus
                if (event.shiftKey && document.activeElement === firstFocusableEl) {

                    event.preventDefault();
                    lastFocusableEl.focus();

                } else if (!event.shiftKey && document.activeElement === lastFocusableEl) {

                    event.preventDefault();
                    firstFocusableEl.focus();
                }
            }
        };

        focusContainer.addEventListener('keydown', keyboardHandler);
    }

    //The cleanup function. Put future cleanup tasks inside this.
    return function() {

        if (keyboardHandler) {

            focusContainer.removeEventListener('keydown', keyboardHandler);
        }
    };
}