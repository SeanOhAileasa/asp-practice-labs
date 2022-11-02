function Terminal(id, hostname) {
    this.Id = id; this.RowId = 0; this.Buffer = 0; this.w = $('#' + hostname); this.l = new Date(); this.ti = null; this.Data = [], this.LastRead = 0; this.p = null; this.r = $('#' + hostname + '-read');
    //hub.server.terminalConnect(id);
    return this;
}

var CONSOLEMODE_WIDTH = 1024,
    CONSOLEMODE_HEIGHT = 768,
    CONSOLEMODE_MESSAGE = 'Switch to Remote Desktop',
    CONSOLERDP_MESSAGE = 'Switch to Console',
    CONSOLETOOLBAR_HEIGHT = 35,
    OUTERWINDOW_HEIGHT_ADJUSTMENT = 0,
    OUTERWINDOW_WIDTH_ADJUSTMENT = 0,
    OUTERWINDOW_SET = false,
    USER_BROWSER = null,
    RDP_ERROR_HTML = null,
    LABDESKTOP_DEFAULT_WIDTH = 1024,
    LABDESKTOP_DEFAULT_HEIGHT = 768,
    LABDESKTOP_MAX_WIDTH = 1280,
    LABDESKTOP_MAX_HEIGHT = 800;

function switchIframe(iframeId) {
    // NOTE the iframe name AND id need setting to the same, 
    // CC has stated that if this is the case, AND PL and Myrtille are on the same domain, all will be good
    try {
        var iframe = document.getElementById(iframeId);
        //alert('leaving iframe: ' + iframe.id);

        var iframeInfo = iframe.id.split('_');
        var nextIframeId = iframeInfo[0] + '_' + (parseInt(iframeInfo[1]) + 1);
        //alert('next iframe: ' + nextIframeId);

        var nextIframe = document.getElementById(nextIframeId);
        if (nextIframe == null) {
            //alert('last iframe is reached, cycling to first');
            nextIframe = document.getElementById(iframeInfo[0] + '_1');
        }
        if (nextIframe != null) {
            //alert('active iframe: ' + nextIframe.id);
            nextIframe.contentWindow.setKeyCombination();
            nextIframe.contentWindow.focus();
        }
    }
    catch (exc) {
        alert('switchIframe error: ' + exc.message);
    }
}

function checkIframeFocus() {
    try {
        var iframes = document.getElementsByTagName('iframe');
        for (var i = 0; i < iframes.length; i++) {
            var iframe = document.getElementById(iframes[i].id);
            if (iframe.id != document.activeElement.id) {
                iframe.className = 'iframeNoBorder';
            }
            else {
                iframe.className = 'iframeColorBorder';
            }
        }
    }
    catch (exc) {
        alert('checkIframeFocus error: ' + exc.message);
    }
}

// http://www.quirksmode.org/js/cookies.html
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
}

function getLocationFromEngineId(id) {

    if (id) {

        switch (id) {
            case 'drt':
                return 'DRT01';

            case 'ldn':
                return 'ULCC01';

            case 'atl':
                return 'ATL01';

            default:
                return 'Unknown';
        }
    }

    return 'Unknown';
}


(function () {

    var sUsrAg = navigator.userAgent;

    //The order matters here, and this may report false positives for unlisted browsers.

    if (sUsrAg.indexOf("Firefox") > -1) {
        USER_BROWSER = "Mozilla Firefox";
        //"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"

    } else if (sUsrAg.indexOf("Opera") > -1) {
        USER_BROWSER = "Opera";

    } else if (sUsrAg.indexOf("Trident") > -1) {
        USER_BROWSER = "Microsoft IE";
        //"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"

    } else if (sUsrAg.indexOf("Edge") > -1) {
        USER_BROWSER = "Microsoft Edge";
        //"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"

    } else if (sUsrAg.indexOf("Chrome") > -1) {
        USER_BROWSER = "Google Chrome";
        //"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"

    } else if (sUsrAg.indexOf("Safari") > -1) {
        USER_BROWSER = "Apple Safari";
        //"Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"

    } else {
        USER_BROWSER = "Microsoft IE";
    }

    //window.setInterval(function () { checkIframeFocus(); }, 1000);
}());

var lab = {
    GetLab: function (html, labId) {
        tools.Loader.Control(true, 'Retrieving lab.', 'exercise-content');
        if (labId !== content.Selected.Lab) {
            lab.Microsoft.WindowManager.CloseAll();
        }
        lab.Draw.Clear();

        hub.server.vNextGetLab(labId, (new Date().getTime())).done(function (d) {
            timer.Start();

            if (d.length > 0 && d !== 'UNAVAILABLE') {

                if (lab.Draw.Loader.Instances.length > 0) {
                    for (var ll = 0; ll < lab.Draw.Loader.Instances.length; ll++) {
                        lab.Draw.Loader.Instances[ll].Stop();
                    }
                }

                lab.Draw.Loader.Instances = [];
                $('#lab-desktop .device-wrapper').remove();
                if (d === 'UNAVAILABLE') {
                    content.Aside.GoMax(false);
                    content.Selected.Lab = 'UNAVAILABLE';
                    lab.Log.AddEntry(null, '', 'We are really sorry but there are no labs currently available at this moment to service this content.');
                    lab.NoLab.Show(html, labId);
                } else {

                    lab.NoLab.Hide();

                    $('#control-group button').show();

                    timer.Reset();

                    if (screen.height > 799) {
                        $('#optional-buttons button').show();
                    }

                    var labObject = JSON.parse(d);
                    content.Selected.Lab = labId;
                    lab.Structure = labObject; // PL-1756: ML - Do we need to do something here to validate to Engine Location prefixes in the Connect links?

                    if (labObject.Persistent) {
                        $('#persistent-lab-settings').removeClass('hidden');
                    }

                    $('#exercise-content').html(content.CreateDeviceLinks(html)).scrollTop(0);
                    $('#excercise-select').click();

                    if (labObject.Diagram === 'No_Lab') {
                        content.Aside.GoMax(true);
                        lab.Log.AddEntry(null, '', 'Successfully changed content, please note there is no lab for this content.');
                    } else {
                        content.Aside.GoMax(false);
                        lab.Draw.Draw();
                        lab.Setup();
                        tutorial.ToggleTutContent();
                        lab.Log.AddEntry(null, '', 'Successfully changed content and lab.');
                    }
                    $('#exercise-content').focus();

                    Assessment.Check();
                    authoring.Particles.ContentLoaded();
                }
            } else {
                lab.NoLab.Show(html, labId);
            }

            tools.Loader.Control(false);
        }).fail(function () {
            tools.Loader.Control(true, 'Something went wrong while getting this lab, please try again.', 'exercise-content');
            setTimeout(tools.Loader.Control(false, '', 'exercise-content'), 3000);
        });
    },
    Draw: {
        Menu: {
            OpenByClick: false,
            Id: -1
        },
        Clear: function () {
            lab.Cisco.Terminals = [];
            lab.Structure = {};
            $('#lab-desktop .device-wrapper').remove();
            $('#devices').html('');
            $('#phantom-device').remove();
        },
        Draw: function () {
            if (lab.Structure !== null) {
                var l = lab.Structure, labDesktop = $('#lab-desktop-inner'), dimn = [];

                if (settings.Settings.VNextOptions.DeviceWindow.Width === 0) {
                    dimn = lab.GetWidthAndHeight();
                } else {
                    dimn.push(settings.Settings.VNextOptions.DeviceWindow.Width);
                    dimn.push(settings.Settings.VNextOptions.DeviceWindow.Height);
                }

                if (l.Devices.length > 0) {
                    var devicePanel = $('#devices'), a = 0;

                    for (a; a < l.Devices.length; a++) {
                        var d = l.Devices[a],
                            wrapper = $('<div>'),
                            deviceButton = $('<div>'),
                            deviceName = $('<div>'),
                            buttonWrap = $('<div>'),
                            buildBg = $('<div>'),
                            buildWrap = $('<div>'),
                            buildStatus = $('<div>'),
                            build = $('<div>'),
                            deviceDetail = $('<div>'),
                            svg = $('#device-svgs .svg-generic-' + d.Icon).clone();

                        if (svg.length === 0) {
                            svg = $('#device-svgs .svg-generic-server').clone();
                        }

                        wrapper
                            .addClass('device-group')
                            .attr('role', 'link')
                            .attr('title', d.Hostname)
                            .attr('aria-label', d.Hostname)
                            .attr('data-device-type', d.Icon)
                            .attr('href', '#')
                            .attr('data-clicked', false)
                            .attr('id', 'control-' + d.Hostname)
                            .attr('aria-controls', 'device-detail-' + d.Hostname)
                            .attr('aria-expanded', false)
                            .on('click mouseenter mouseleave keydown', function (e) {
                                var t = $(this).attr('data-clicked') === 'true';

                                if (e.type === 'mouseenter' || e.type === 'mouseleave') {
                                    if (e.type === 'mouseenter') {
                                        devicePanel.find('.device-group__active').each(function () {
                                            t = $(this).attr('data-clicked') === 'true';
                                            if (!t) {
                                                $(this).removeClass('device-group__active');
                                                $(this).attr('aria-expanded', false);
                                            }
                                        });
                                        $(this).addClass('device-group__active');
                                        $(this).attr('aria-expanded', true);
                                    } else if (!t) {
                                        $(this).removeClass('device-group__active');
                                        $(this).attr('aria-expanded', false);
                                    }
                                    return;
                                }

                                if (e.type === 'keydown') {
                                    if (e.keyCode === 32) {
                                        if (t) {
                                            $(this).removeClass('device-group__active').attr('data-clicked', false);
                                            $(this).attr('aria-expanded', false);
                                        } else {
                                            devicePanel.find('.device-group__active').each(function () {
                                                $(this).removeClass('device-group__active').attr('data-clicked', false);
                                                $(this).attr('aria-expanded', false);
                                            });
                                            $(this).addClass('device-group__active').attr('data-clicked', true);
                                            $(this).attr('aria-expanded', true);
                                        }
                                        return;
                                    } else if (e.keyCode === 13) {

                                    } else {
                                        return;
                                    }
                                }

                                if (e.type === 'click') {
                                    devicePanel.find('.device-group__active').each(function () {
                                        $(this).removeClass('device-group__active').attr('data-clicked', false);
                                        $(this).attr('aria-expanded', false);
                                    });
                                }

                                if (t) {
                                    $(this).removeClass('device-group__active').attr('data-clicked', false);
                                    $(this).attr('aria-expanded', false);
                                    return;
                                }

                                $(this).addClass('device-group__active').attr('data-clicked', true);
                                $(this).attr('aria-expanded', true);

                                var position = lab.GetPositionFromHostname($(this).attr('title'));
                                if (position > -1) {
                                    var device = lab.Structure.Devices[position];
                                    if (device.State === 'On') {
                                        if (device.HasInterface || device.Probe === 0 || (device.Probe > 0 && device.LinkConsole !== null && device.LinkConsole.length > 0)) {
                                            e.preventDefault();
                                            lab.Active = position;
                                            lab.Connect(device, false, device.Probe === 0);
                                        }
                                    }
                                }
                            });

                        deviceButton
                            .addClass('device-button')
                            .attr('role', 'button')
                            .attr('tabindex', 0);

                        deviceButton.appendTo(wrapper);

                        deviceName.attr('class', 'device-name').text(d.Hostname);

                        deviceName.appendTo(deviceButton);

                        buttonWrap.addClass('device-button-wrap');

                        svg.appendTo(buttonWrap);

                        buildBg.addClass('progbuild-bg');
                        buildWrap.addClass('progbuild-wrap');
                        buildStatus
                            .text(d.State)
                            .attr('id', 'build-status-' + d.Hostname)
                            .addClass('progbuild-status');

                        var state = d.State.toLowerCase();
                        if (state === 'busy') {
                            state = 'inprogress';
                        } else {
                            svg.addClass('icon-' + state);
                        }

                        build.addClass('progbuild pt-' + state);
                        build.attr('id', 'build-' + d.Hostname);
                        build.appendTo(buildWrap);
                        buildWrap.appendTo(buildBg);

                        lab.Draw.Loader.Instances.push(new lab.Draw.Loader.Instance(d.Hostname, d.Data, build));
                        if (d.State === 'Busy') {
                            lab.Draw.Loader.Instances[a].Start('On');
                        }
                        buildStatus.appendTo(buildWrap);
                        buildBg.appendTo(buttonWrap);
                        buttonWrap.appendTo(deviceButton);

                        deviceDetail.addClass('device-detail').attr('id', 'device-detail-' + d.Hostname).attr('aria-hidden', true);
                        lab.Draw.Buttons(d, d.Capabilities, a, deviceDetail);
                        deviceDetail.appendTo(wrapper);

                        for (var prop in d.Capabilities) {
                            if (d.Capabilities[prop].Name === "Invisible" && d.Capabilities[prop].Value === "True") {
                                wrapper.addClass('hidden');
                                break;
                            }
                        }                        

                        wrapper.appendTo(devicePanel);

                        var deviceContainer = lab.Draw.Device(d, dimn[0], dimn[1], settings.Settings.VNextOptions.DeviceWindow.AnchorWindow, a);
                        deviceContainer.appendTo(labDesktop);
                        if (!deviceContainer.hasClass('hidden') && d.Vendor !== 0 && !settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {
                            lab.Connect(d, null, d.Probe === 0);
                        }
                    }

                    var phantom = $('<div>').attr('id', 'phantom-device').css({ 'width': dimn[0] + 'px', 'height': dimn[1] + 'px' });

                    if (settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {
                        phantom.attr('class', 'hidden');
                    }

                    phantom.appendTo(labDesktop);
                }
            }
        },
        Device: function (device, w, h, hidden, deviceIndex) {
            var processing = '', position = lab.GetPositionFromHostname(device.Hostname);
            if (device.State === 'Busy' || (device.Tickets !== null && device.Tickets.length > 0) || device.State !== 'On') {
                processing = ' hidden';
            }

            if (device.Vendor === 0) {
                processing += ' cisco-override';
            }

            var deviceWrap = $('<div>').attr('tabindex', 0).attr('class', 'device-wrapper ' + processing).attr('id', 'section-' + device.Hostname);

            if (hidden) {
                deviceWrap.addClass('hidden');
            }

            if (device.Vendor === 0) {
                deviceWrap.css('font-size', '14px');
            }

            var deviceTopBar = $('<div>').attr('class', 'device-controls'), deviceNameWrap = $('<div>').attr('class', 'device-name'), deviceName = $('<div>').text(device.Hostname), deviceControlsWrap = $('<div>').attr('class', 'device-controls-wrap');
            deviceName.appendTo(deviceNameWrap);
            deviceNameWrap.prependTo(deviceTopBar);

            var location = getLocationFromEngineId(lab.Structure.EnginesLocationId);

            var deviceLocationIcon = $('<div>')
                .addClass('device-location-indicator')
                .attr('title', 'You are connected to: ' + location);

            var deviceLocation = $('<div>').text(location);

            deviceLocation.appendTo(deviceLocationIcon);
            deviceLocationIcon.appendTo(deviceControlsWrap);

            var deviceHideButton = $('<button>')
                .attr('type', 'button')
                .addClass('win-hide')
                .attr('title', 'Hide device, click the device to reconnect')
                .attr('aria-label', 'Hide this device, click the device in the devices bar to reconnect')
                .on('click keydown', function (event) {
                    if (event.type !== 'click') {
                        var k = event.keyCode;
                        if (k === 13 || k === 32) {
                            event.preventDefault();
                        } else {
                            return;
                        }
                    }
                    deviceWrap.addClass('hidden');
                });


            var deviceInfoButton = $('<button>')
                .attr('type', 'button')
                .addClass('win-detail')
                .attr('title', 'Show more information about this device like usernames, passwords etc.')
                .attr('aria-label', 'Show more information about this device like usernames, passwords etc.')
                .on('click keydown', function (event) {
                    if (event.type !== 'click') {
                        var k = event.keyCode;
                        if (k === 13 || k === 32) {
                            event.preventDefault();
                        } else {
                            return;
                        }
                    }

                    var options = 'width=400,height=500,menubar=no,resizable=yes,toolbar=no,location=no,status=no';
                    window.open('../../win-detail.aspx?device=' + device.Hostname + '&token=' + tools.Token.Get(), 'detail-' + device.Hostname, options);
                });

            if (device.Vendor === 0) {
                //var ciscoControls = $('<div>').addClass('cisco-controls'), btnClear = $('<button>');
                var btnClear = $('<button>').addClass('terminal-clear').attr('title', 'Clear terminal').attr('aria-label', 'Clear terminal').on('click keydown', function (event) {
                    if (event.type === 'keydown' && event.keyCode !== 32) {
                        return;
                    }
                    $('#' + device.Hostname).html('');
                });
                var cpyPstPanel = $('<div>').attr('class', 'cisco-pastebin');
                var btnCpyPst = $('<button>').addClass('terminal-copypaste')
                    .attr('title', 'Copy and Paste')
                    .attr('aria-label', 'Copy and Paste')
                    .on('click keydown', function (event) {
                        if (event.type === 'keydown' && event.keyCode !== 32) {
                            return;
                        }
                        cpyPstPanel.show();
                    });

                //btnCpyPst.appendTo(ciscoControls);
                //btnClear.appendTo(ciscoControls);
                btnCpyPst.appendTo(deviceControlsWrap);
                btnClear.appendTo(deviceControlsWrap);

                var txtArea = $('<textarea>');
                txtArea.appendTo(cpyPstPanel);
                var flx = $('<div>').attr('class', 'flex-row');

                var btnWrap = $('<div>').attr('class', 'cisco-pastebin-buttonwrap');
                var btnGet = $('<button>').attr('class', 'cisco-pastebin-copy').text('Copy').on('click', function () {
                    var content = '';
                    $('#' + device.Hostname + ' p').each(function () {
                        content += $(this).text() + '\n';
                    });

                    txtArea.val(content);
                });

                btnGet.appendTo(btnWrap);

                var btnPut = $('<button>').attr('class', 'cisco-pastebin-paste').text('Paste').on('click', function () {
                    var content = txtArea.val();
                    if (content.length > 0) {
                        var lines = content.split('\n');
                        for (var a = 0; a < lines.length; a++) {
                            hub.server.sendTerminalKeyPress(position, lines[a] + '\r');
                        }
                    }
                });
                btnPut.appendTo(btnWrap);

                var btnClr = $('<button>').attr('class', 'cisco-pastebin-clear').text('Clear').on('click', function () {
                    txtArea.val('');
                });

                btnClr.appendTo(btnWrap);
                btnWrap.appendTo(flx);

                var btnClose = $('<button>').attr('class', 'cisco-pastebin-close').text('Close').on('click', function () {
                    cpyPstPanel.hide();
                });

                btnClose.appendTo(flx);
                flx.appendTo(cpyPstPanel);

                //cpyPstPanel.appendTo(ciscoControls);
                cpyPstPanel.appendTo(deviceControlsWrap);

                //ciscoControls.appendTo(deviceControlsWrap);
            } else {
                var canToggleConsole = device.Probe === 3389, consoleDisabled = device.LinkConsole === null || device.LinkConsole.length === 0, hideConsoleButton = '', winConsoleOn = 'win-console-off', winConsoleText = CONSOLERDP_MESSAGE;

                if (consoleDisabled || !canToggleConsole) {
                    hideConsoleButton = 'hidden';
                }

                if (device.Probe === 0) {
                    winConsoleOn = 'win-console-on';
                    winConsoleText = CONSOLEMODE_MESSAGE;
                } else if (!device.HasInterface && !(device.Probe > 0 && device.LinkConsole !== null && device.LinkConsole.length > 0)) {
                    deviceWrap.addClass('hidden');
                }

                var deviceConsoleConnectButton =
                    $('<button>').attr('type', 'button')
                        .attr('id', 'console-connect-' + device.Hostname)
                        .addClass('win-console ' + winConsoleOn)
                        .addClass(hideConsoleButton)
                        .attr('data-cantoggle', canToggleConsole)
                        .attr('title', winConsoleText)
                        .attr('aria-label', winConsoleText)
                        .attr('disabled', false)
                        .on('click keydown', function (event) {
                            if (event.type !== 'click') {
                                var k = event.keyCode;
                                if (k === 13 || k === 32) {
                                    event.preventDefault();
                                } else {
                                    return;
                                }
                            }

                            var canToggle = $(this).data('cantoggle');

                            if ($(this).hasClass('win-console-on')) {
                                if (canToggle) {
                                    $(this).removeClass('win-console-on').addClass('win-console-off').attr('title', CONSOLERDP_MESSAGE).attr('aria-label', CONSOLERDP_MESSAGE);
                                }
                                lab.Connect(device, null, false);
                            } else {
                                if (canToggle) {
                                    $(this).removeClass('win-console-off').addClass('win-console-on').attr('title', CONSOLEMODE_MESSAGE).attr('aria-label', CONSOLEMODE_MESSAGE);
                                }
                                lab.Connect(device, null, true);
                            }
                        });

                var autoLogin = lab.Structure.Devices[deviceIndex].AutoLogin
                    ? 'on'
                    : 'off';

                var deviceAutoLoginButton = $('<button>')
                    .addClass('auto-login')
                    .addClass('auto-login-' + autoLogin)
                    .attr('data-state', autoLogin)
                    .attr('data-index', deviceIndex)
                    .attr('title', lab.AutoLogin.BaseMessage + autoLogin)
                    .attr('aria-label', lab.AutoLogin.BaseMessage + autoLogin)
                    .on('click keydown',
                        function (event) {
                            if (event.type !== 'click') {
                                var k = event.keyCode;
                                if (k === 13 || k === 32) {
                                    event.preventDefault();
                                } else {
                                    return;
                                }
                            }
                            lab.AutoLogin.Toggle($(this));
                        });

                var deviceConnectButton = $('<button>')
                    .addClass('win-connect')
                    .attr('title', 'Reconnect to device')
                    .attr('aria-label', 'Reconnect to device')
                    .on('click keydown', function (event) {

                        if (event.type !== 'click') {
                            var k = event.keyCode;
                            if (k === 13 || k === 32) {
                                event.preventDefault();
                            } else {
                                return;
                            }
                        }

                        var isConsole = deviceConsoleConnectButton.hasClass('win-console-on');

                        if (settings.Settings.VNextOptions.MyrtilleRdp
                            && lab.Structure.Devices[deviceIndex].AllowMyrtille
                            && lab.Structure.Devices[deviceIndex].LinkMyrtille) {

                            var id = lab.ExtractConnectionId(isConsole ? lab.Structure.Devices[deviceIndex].LinkConsole : lab.Structure.Devices[deviceIndex].LinkMyrtille);
                            hub.server.deviceValidateReconnectLink(id, deviceIndex, isConsole).done(function (r) {
                                if (typeof r !== "undefined") {
                                    if (r === id) lab.Connect(device, true, isConsole);
                                    if (isConsole) {
                                        lab.Structure.Devices[deviceIndex].LinkConsole =
                                            lab.Structure.Devices[deviceIndex].LinkConsole.replace(id, r);
                                    }
                                    else {
                                        lab.Structure.Devices[deviceIndex].LinkMyrtille =
                                            lab.Structure.Devices[deviceIndex].LinkMyrtille.replace(id, r);
                                    }
                                } else {
                                    ShowDisconnectMessage(888888, lab.Structure.Devices[deviceIndex].Hostname);
                                    return;
                                }

                                lab.Connect(device, true, isConsole);
                            });
                        } else {
                            lab.Connect(device, true, isConsole);
                        }
                    });

                deviceAutoLoginButton.appendTo(deviceControlsWrap);
                deviceConsoleConnectButton.appendTo(deviceControlsWrap);
                deviceConnectButton.appendTo(deviceControlsWrap);
            }

            deviceInfoButton.appendTo(deviceControlsWrap);
            deviceHideButton.appendTo(deviceControlsWrap);

            deviceControlsWrap.appendTo(deviceTopBar);
            deviceTopBar.appendTo(deviceWrap);

            if (device.Vendor === 0) {
                var ciscoTerminal = $('<div>')
                    .attr('tabindex', 0)
                    .attr('class', 'device terminal cisco-terminal')
                    .attr('id', device.Hostname)
                    .attr('data-device-index', position)
                    .css({ 'width': w + 'px' });

                ciscoTerminal.appendTo(deviceWrap);

                var inputWrapper = $('<div>').attr('class', 'term-input-wrapper');

                var msg = 'Type commands for ' + device.Hostname + ' here';

                var accessibleInput = $('<input>')
                    .attr('type', 'text')
                    .on('keydown focus blur', function (event) {
                        // let tabs have default behaviour acccessibility users
                        if (event.type === 'keydown') {
                            if (event.keyCode !== 9) {
                                lab.Cisco.Keyboard.Input(event, position);
                            }
                        } else {
                            if (event.type === 'focus') {
                                ciscoTerminal.addClass('cisco-terminal-focused');
                            } else {
                                ciscoTerminal.removeClass('cisco-terminal-focused');
                            }
                        }
                    })
                    .attr('id', 'input_' + position)
                    .attr('placeholder', msg)
                    .attr('class', 'term-input')
                    .attr('aria-label', msg)
                    .attr('label', msg);

                var readButton = $('<button>')
                    .attr('aria-role', 'button')
                    .attr('id', device.Hostname + '-read')
                    .attr('class', 'device-read')
                    .attr('aria-label', 'Read terminal of ' + device.Hostname)
                    .attr('data-aria-click', 'Read ' + device.Hostname)
                    .attr('data-hostname', device.Hostname)
                    .attr('data-index', position)
                    .on('click', function () {
                        lab.Cisco.Read(position);
                    })
                    .text('Read ' + device.Hostname);

                var showButtons = false;
                if (tools.Mobile.Check() || settings.Settings.VNextOptions.Accessibility) {
                    showButtons = true;
                    if (tools.Mobile.Check() && !settings.Settings.VNextOptions.Accessibility) {
                        // Change what the button does for android
                        readButton.text('Send').off('click', function (e) { lab.Cisco.Read(position); }).on('click', function () {
                            var i = $('#input_' + position);
                            var cmd = i.val();
                            hub.server.sendTerminalKeyPress(position, cmd + '\r');
                            i.val('');
                        });
                    }

                    if (tools.Mobile.Check()) {
                        deviceWrap.addClass('cisco-override-small').removeClass('cisco-override');
                    }
                }

                if (!showButtons) {
                    inputWrapper.addClass('hidden');
                    ciscoTerminal.on('focusin focusout', function (event) {
                        if (typeof (lab.Structure.Devices) !== "undefined" && lab.Structure.Devices.length > position) {
                            if (event.type === 'focusin') {
                                if (lab.Structure.Devices[position].Connected) {
                                    lab.Cisco.Keyboard.Enable(position);
                                    $(this).addClass('cisco-terminal-focused');
                                }
                            } else {
                                $(this).removeClass('cisco-terminal-focused');
                                lab.Cisco.Keyboard.Disable();
                            }
                        }
                    });
                }

                accessibleInput.appendTo(inputWrapper);
                readButton.appendTo(inputWrapper);
                inputWrapper.appendTo(deviceWrap);

                var terminalReader = $('<div>')
                    .prop('class', 'terminal-reader visuallyhidden')
                    .prop('tabindex', 0)
                    .prop('id', 'terminal_read_' + position);

                terminalReader.appendTo(deviceWrap);

            } else {
                var deviceWin = $('<div>')
                    .attr('tabindex', -1)
                    .attr('class', 'device device-win')
                    .attr('id', device.Hostname);

                var deviceInWindowMessage = $('<div>')
                    .attr('tabindex', -1)
                    .attr('class', 'ms-in-window-message hidden')
                    .attr('id', device.Hostname + '-in-window')
                    .html(device.Hostname + ' will launch in a new browser window. If ' + device.Hostname + ' is already powered on, click the <b>Connect</b> button.');

                var deviceInPageMessage = $('<div>')
                    .attr('tabindex', -1)
                    .attr('class', 'ms-in-page hidden')
                    .attr('id', device.Hostname + '-frame')
                    .html('<span>' + device.Hostname + ' will launch in this window. If ' + device.Hostname + ' is already powered on, click the <b>Connect</b> button.</span>');

                deviceInWindowMessage.appendTo(deviceWin);
                deviceInPageMessage.appendTo(deviceWin);
                deviceWin.appendTo(deviceWrap);
            }

            return deviceWrap;

        },
        Buttons: function (device, capabilities, index, obj) {
            if (typeof (obj) !== "undefined" && obj.length > 0 && typeof (capabilities) !== "undefined" && capabilities.length > 0) {
                obj.children('button').off('click keydown').remove();
                //buttons

                var labels = {}, hasConnect = false;
                labels["On"] = "Power on ";
                labels["Off"] = "Power off ";
                labels["Reboot"] = "Reboot ";
                labels["Reset"] = "Reset ";
                labels["Suspend"] = "Suspend ";
                labels["Connect"] = "Connect ";
                labels["ConnectNone"] = "Device has no interface, click for more information";

                try {
                    for (var prop in capabilities) {
                        if (capabilities[prop].Name !== "ConnectNone") {

                            if (capabilities[prop].Name === "Connect") {
                                hasConnect = true;
                                continue;
                            }

                            var b = $('<button>')
                                .text(labels[device.Capabilities[prop].Name])
                                .attr('data-device-index', index)
                                .attr('data-aria-click', labels[device.Capabilities[prop].Name] + device.Hostname)
                                .attr('title', labels[device.Capabilities[prop].Name] + device.Hostname)
                                .attr('data-device-hostname', device.Hostname)
                                .attr('data-device-function', capabilities[prop].Name)
                                .on('click keydown', function (event) {
                                    if (lab.Draw.Menu.OpenByClick) {
                                        lab.Draw.Menu.OpenByClick = false;
                                    }
                                    if (event.type === 'keydown') {

                                        var k = event.keyCode;
                                        switch (k) {
                                            case 9:
                                                {
                                                    return;
                                                }
                                            case 13:
                                                {
                                                    break;
                                                }
                                            case 32:
                                                {
                                                    break;
                                                }
                                            case 16:
                                                {
                                                    return;
                                                }
                                            case 37:
                                                {
                                                    $(this).prev('button').focus();
                                                    return;
                                                }
                                            case 38:
                                                {
                                                    $(this).prev('button').focus();
                                                    return;
                                                }
                                            case 39:
                                                {
                                                    $(this).next('button').focus();
                                                    return;
                                                }
                                            case 40:
                                                {
                                                    $(this).next('button').focus();
                                                    return;
                                                }
                                            default:
                                                {
                                                    return;
                                                }
                                        }
                                    }

                                    event.preventDefault();
                                    event.stopPropagation();

                                    var device = lab.Structure.Devices[parseInt($(this).data('device-index'))];

                                    if ($(this).data('device-function') !== 'Connect') {
                                        lab.RunFromButton($(this), device);
                                    } else {
                                        $(this).parent().removeClass('device-group__active');
                                        lab.Connect(device);
                                    }
                                });

                            if (capabilities[prop].Value !== 'True' || device.State === 'Busy') {
                                b.prop('disabled', true)
                                    .prop('aria-disabled', true);
                            }
                            b.appendTo(obj);
                        }
                    }
                } catch (e) { }


                if (!hasConnect && !device.HasInterface && device.State === 'On' && (device.LinkConsole === null || device.LinkConsole.length === 0)) {
                    var noInterface = $('<button>')
                        .attr('data-aria-click', 'Device has no interface, click for more information')
                        .attr('id', 'noconnect-button-' + device.Hostname)
                        .attr('title', 'Device has no interface, click for more information')
                        .attr('data-device-function', 'NoInterface')
                        .text('Connect')
                        .on('click keydown', function (event) {
                            if ((event.type === 'keydown' && event.keyCode === 13) || event.type === 'click') {
                                tools.More.Open('no-interface', 420, 600, 'Devices with no interface');
                            }
                        });
                    noInterface.appendTo(obj);
                }

                if (device.Vendor === 0) {
                    var ciscoScriptButton = $('<button>')
                        .text('Script')
                        .attr('data-device-index', index)
                        .attr('data-aria-click', 'Email script')
                        .attr('title', 'Email Cisco script')
                        .attr('data-device-hostname', device.Hostname)
                        .attr('data-device-function', 'Script')
                        .on('click keydown', function (event) {
                            if ((event.type === 'keydown' && event.keyCode === 32) || event.type === 'click') {
                                $(this).attr('disabled', true);
                                lab.Draw.Menu.OpenByClick = false;
                                $(this).parent().parent().removeClass('device-group__active');
                                event.stopPropagation();
                                lab.Cisco.Script.Send($(this));
                                lab.Log.AddEntry(null, '', device.Hostname + ' has emailed scripts');
                            }
                        });
                    ciscoScriptButton.appendTo(obj);
                }

                var refreshState = $('<button>')
                    .text('Refresh')
                    .attr('data-device-index', index)
                    .attr('data-aria-click', 'Refresh state')
                    .attr('title', 'Refresh devices state')
                    .attr('data-device-hostname', device.Hostname)
                    .attr('data-device-function', 'Refresh')
                    .on('click keydown', function (event) {
                        if ((event.type === 'keydown' && event.keyCode === 13) || event.type === 'click') {
                            $(this).attr('disabled', true);
                            lab.Draw.Menu.OpenByClick = false;
                            $(this).parent().parent().removeClass('device-group__active');
                            event.stopPropagation();
                            lab.RefreshState(index);
                            lab.Draw.ReEnableRefresh($(this));
                            lab.Log.AddEntry(null, '', device.Hostname + ' has been refreshed');
                        }
                    });

                refreshState.appendTo(obj);

                var contract = $('<button>')
                    .attr('data-aria-click', 'Collapse panel')
                    .attr('title', 'Collapse panel')
                    .attr('data-device-function', 'Contract')
                    .on('click keydown', function (event) {
                        if ((event.type === 'keydown' && event.keyCode === 13) || event.type === 'click') {
                            lab.Draw.Menu.OpenByClick = false;
                            $(this).parent().parent().removeClass('device-group__active').attr('data-clicked', false);
                            event.stopPropagation();
                        }
                    });

                contract.appendTo(obj);
            }
        },
        ReEnableRefresh: function (obj) {
            setTimeout(function () {
                obj.attr('disabled', false);
            }, 5000);
        },
        Loader: {
            Instance: function (hostname, data, jqObj) {
                var f = new Date(), o = {};
                o.DivObj = jqObj;
                o.StartTime = null;
                o.FinishTime = null;
                o.FailTime = null;
                o.Seconds = null;
                o.Started = false;
                o.Timer = null;
                o.Data = data;
                o.Start = function (f) {
                    o.DivObj.css('width', '0');
                    var a = 0, seconds = 60;
                    for (a; a < o.Data.length; a++) {
                        if (o.Data[a].Key === 'PT-' + f) {
                            seconds = o.Data[a].Value;
                            break;
                        }
                    }

                    if (seconds < 3) {
                        seconds = 3;
                    }

                    o.Seconds = seconds;
                    o.StartTime = new Date();

                    var fin = new Date(o.StartTime.getMilliseconds() + (seconds * 1000)), tick = Math.floor(o.Seconds / 100);
                    if (tick < 1000) {
                        tick = 1000;
                    }

                    var sMs = o.StartTime.getTime();
                    sMs += seconds * 1000;
                    o.FinishTime = new Date(sMs);

                    var fMs = o.FinishTime.getTime();
                    fMs += 180 * 1000;
                    o.FailTime = new Date(fMs);

                    o.DivObj.addClass('pt-inprogress');
                    o.Timer = setInterval(function () {
                        var now = new Date();

                        if (now > o.FailTime) {
                            o.Stop(true, 'Unknown');
                            o.DivObj.css('width', '100%').addClass('pt-fail').removeClass('pt-inprogress');
                            setTimeout(function () {
                                o.DivObj.removeClass('pt-fail pt-inprogress');
                            }, 5000);
                        } else if (now > o.FinishTime) {
                            o.DivObj.css('width', '100%');
                        } else {
                            var nt = (o.FinishTime.getTime() - now.getTime()) / 1000;
                            var pcComplete = 100 - ((nt / o.Seconds) * 100);
                            o.DivObj.css('width', pcComplete + '%');
                        }
                    }, tick);
                };

                o.Stop = function (complete, state) {
                    if (complete) {
                        if (o.Timer !== null) {
                            clearInterval(o.Timer);
                        }
                        switch (state) {
                            case 'On':
                                {
                                    o.DivObj.addClass('pt-on').removeClass('pt-off pt-suspend pt-inprogress pt-fail').css('width', '100%');
                                    break;
                                }
                            case 'Off':
                                {
                                    o.DivObj.addClass('pt-off').removeClass('pt-on pt-suspend pt-inprogress pt-fail').css('width', '100%');
                                    break;
                                }
                            case 'Suspend':
                                {
                                    o.DivObj.addClass('pt-suspend').removeClass('pt-on pt-off pt-inprogress pt-fail').css('width', '100%');
                                    break;
                                }
                            default:
                                {
                                    break;
                                }
                        }
                    } else {
                        // problem.....
                        o.DivObj.addClass('pt-fail');
                        setTimeout(function () {
                            o.DivObj.removeClass('pt-fail');
                        }, 5000);
                    }
                };

                o.Reset = function (state) {
                    o.DivObj.removeClass('pt-fail pt-inprogress').addClass('pt-' + state.toLowerCase());
                };

                return o;
            },
            Instances: [],
            Start: function (device) {
                var active = lab.Draw.Loader.Instances, i = lab.GetPositionFromHostname(device.Hostname);

                if (active[l].Started) {
                    active[1].Stop();
                }

                active[l].Start();


            },
            Stop: function (complete, device) {
                var i = lab.GetPositionFromHostname(device.Hostname);
                lab.Loader.Instances[i].Stop(complete, device.State);
            }
        }
    },
    RunFromButton: function (o, device, resetContinue) {
        if (!lab.Reset.InProgress) {
            var index = $(o).attr('data-device-index'), operation = $(o).attr('data-device-function');

            if (operation === 'Reset' && typeof (resetContinue) === "undefined") {
                // Check if lab is persistent or not
                var partial = 'support/reset-device.html';
                if (lab.Structure.Persistent) {
                    partial = 'support/reset-device-persistent.html';
                }
                dialog.Open(partial, lab.RunFromButton, o, device);
                return;
            }

            timer.CheckToReset();

            if (operation === 'Off' && device.State === 'On') {
                lab.Microsoft.WindowManager.Close(index, device.Hostname);
            }
            device.State = 'Busy';

            $('#build-status-' + device.Hostname).text(device.State);

            if (operation !== 'Connect' && operation !== '') {
                hub.server.createDeviceRequest(index, operation).done(function (result) {
                    if (result) {
                        // disable buttons
                        $(o).parent().children('button').attr('aria-disabled', true).attr('disabled', true);
                        $(o).parent().children('button:last').attr('aria-disabled', false).attr('disabled', false);

                        $('#section-' + device.Hostname).addClass('hidden');

                        lab.Draw.Loader.Instances[index].Start(operation);

                        if (device.Vendor === 0 && operation === 'Reset') {
                            $('#' + device.Hostname).html('');
                        }
                        lab.Log.AddEntry(null, '', device.Hostname + ' has received request ' + operation);
                    } else {
                        lab.Log.AddEntry(null, '', device.Hostname + ' has failed to receive request ' + operation);
                    }
                });
            } else if (operation === 'Connect') {
                lab.Connect(device);
            }
        }
    },
    ChangeState: function (device) {
        if (device.Capabilities.length > 0) {
            if (device.State !== 'Busy') {
                $('#control-' + device.Hostname).removeClass('icon-busy');
                if (lab.WaitingCount > 0) {
                    lab.WaitingCount--;
                    if (lab.WaitingCount === 0) {
                        $('#lab-operations .button').attr('disabled', false).attr('aria-disabled', false);
                    }
                }
            }

            var found = false, a = 0;

            for (a; a < lab.Structure.Devices.length; a++) {
                if (lab.Structure.Devices[a].Hostname === device.Hostname) {
                    lab.Structure.Devices[a] = device;
                    found = true;
                    break;
                }
            }

            if (!found) {
                lab.Structure.Devices.push(device);
            }

            if (device.Vendor !== 0) {
                lab.WindowManager.Connect(device);
            } else {
                hub.server.terminalConnect(a);
            }

            var connectable = '';
            lab.Buttons(device, device.Capabilities, a, $('#control-' + device.Hostname).find('ul:first'));

            if (device.Vendor !== 0) {
                if (lab.Microsoft.WindowManager.Report(device.Hostname)) {
                    connectable = lab.ConnectStates[2];
                }
            }

            lab.Log.AddEntry(null, '', device.Hostname + ' has changed state and is now ' + device.State + connectable);
        }
    },
    Mode: {
        Change: function (o, e) {

            settings.Settings.VNextOptions.Accessibility = !settings.Settings.VNextOptions.Accessibility;

            var a = 0, cisco = false;

            if (settings.Settings.VNextOptions.Accessibility) {
                timer.AccessibilityMode(true);

                if (typeof (lab.Structure.Devices) !== "undefined") {
                    for (a; a < lab.Structure.Devices.length; a++) {
                        if (lab.Structure.Devices[a].Vendor === 0) {
                            cisco = true;
                            $('#' + lab.Structure.Devices[a].Hostname).off('focusin focusout');
                        }
                    }
                    if (cisco) {
                        $('.term-input-wrapper').removeClass('hidden');
                        lab.Cisco.Keyboard.Disable();
                    }

                }
            } else {
                timer.AccessibilityMode(false);

                if (typeof (lab.Structure.Devices) !== "undefined") {
                    for (a; a < lab.Structure.Devices.length; a++) {
                        if (lab.Structure.Devices[a].Vendor === 0) {
                            cisco = true;
                            $('#' + lab.Structure.Devices[a].Hostname).on('focusin focusout', function (event) {
                                var a = $(this).data('device-index');
                                if (event.type === 'focusin') {
                                    if (lab.Structure.Devices[a].Connected) {
                                        lab.Cisco.Keyboard.Enable(a);
                                        $('#' + lab.Structure.Devices[a].Hostname).addClass('cisco-terminal-focused');
                                    }
                                } else {
                                    $('#' + lab.Structure.Devices[a].Hostname).removeClass('cisco-terminal-focused');
                                    lab.Cisco.Keyboard.Disable();
                                }
                            });
                        }
                    }

                    if (cisco) {
                        $('.term-input-wrapper').addClass('hidden');
                        lab.Log.AddEntry(null, '', 'accessibility OFF!');
                    }
                }
            }

            settings.ToggleMessage(o, settings.Settings.VNextOptions.Accessibility, true, e);
        }
    },
    NoLab: {
        LabName: '',
        Timer: null,
        Interval: 60,
        Obj: {
            Desktop: null,
            Clone: null,
            Current: null,
            Ticker: null
        },
        Hide: function () {
            if (lab.NoLab.Obj.Current !== null) {
                lab.NoLab.Obj.Current.remove();
                lab.NoLab.Stop();
            }
            lab.NoLab.LabName = null;
        },
        Show: function (html, labId) {
            lab.NoLab.LabName = labId;
            content.Selected.Lab = labId;
            if (lab.NoLab.Obj.Clone === null) {
                lab.NoLab.Obj.Clone = $('.no-lab-available').clone();
                lab.NoLab.Obj.Desktop = $('#lab-desktop-inner');
            }
            if (lab.NoLab.Obj.Current !== null) {
                lab.NoLab.Obj.Current.remove();
            }

            lab.NoLab.Obj.Current = lab.NoLab.Obj.Clone.clone();
            lab.NoLab.Obj.Current.appendTo(lab.NoLab.Obj.Desktop);
            lab.NoLab.Obj.Ticker = lab.NoLab.Obj.Desktop.find('.no-lab-ticker:first').text(lab.NoLab.Interval);
            $('#exercise-content').html('<p>Waiting for a lab...</p>');
            lab.NoLab.Start(html, labId);
        },
        Start: function (html, labId) {
            lab.NoLab.LabName = labId;
            if (lab.NoLab.Timer === null) {
                var countdown = lab.NoLab.Interval;
                lab.NoLab.Timer = setInterval(function () {
                    countdown--;
                    lab.NoLab.Obj.Ticker.text(countdown);
                    if (countdown === 0) {
                        lab.NoLab.Stop();
                        lab.GetLab(html, labId);
                    }
                }, 1000);
            } else {
                lab.NoLab.Stop();
                lab.NoLab.Start(html, labId);
            }
        },
        Stop: function () {
            if (lab.NoLab.Timer !== null) {
                clearInterval(lab.NoLab.Timer);
            }
            lab.NoLab.Timer = null;
            lab.NoLab.LabName = null;
        },
        Notify: function () {
            var em = $('#lab-notify-email').val();
            if (tools.ConfirmInput('email', em)) {
                var ln = $('#lab-notify-email-submit'), labType = lab.NoLab.LabName;
                ln.attr('disabled', true);
                lab.NoLab.Stop();
                hub.server.vNextNotifyLabFree(labType, em).done(function (s) {
                    if (s) {
                        var msg = 'Thank you, we will send you an email when a lab becomes available.';
                        lab.Log.AddEntry(null, '', msg);
                        notifications.Add({
                            Message: msg
                        });
                        lab.NoLab.Hide();
                    } else {
                        ln.attr('disabled', false);
                        $('#lab-notify-error').text('Please confirm your email address and try again.');
                    }
                }).fail(function () {
                    ln.attr('disabled', false);
                    $('#lab-notify-error').text('Please confirm your email address and try again.');
                });
            }
        }
    },
    Controls: {
        All: {
            On: function (o) {
                if (typeof (lab.Structure.Devices) !== "undefined") {
                    for (var a = 0; a < lab.Structure.Devices.length; a++) {
                        var d = lab.Structure.Devices[a];
                        if (d.State === 'Off') {
                            var btn = $('#control-' + d.Hostname).find('button[data-device-function="On"]');
                            lab.RunFromButton(btn, d);
                        }
                    }

                    $('#power-on-all svg:first').addClass('labnav-busy-pulsate');

                    setTimeout(function () {
                        $('#power-on-all svg:first').removeClass('labnav-busy-pulsate');
                    }, 10000);
                }
            },
            Reset: function (o, resetContinue) {
                if (typeof resetContinue !== "undefined") {
                    if (typeof (lab.Structure.Devices) !== "undefined") {
                        for (var a = 0; a < lab.Structure.Devices.length; a++) {
                            var d = lab.Structure.Devices[a];
                            if (d.State === 'On') {
                                var btn = $('#control-' + d.Hostname).find('button[data-device-function="Reset"]');
                                lab.RunFromButton(btn, d, true);
                            }
                        }

                        $('#power-reset-all svg:first').addClass('labnav-busy-rotate');

                        setTimeout(function () {
                            $('#power-reset-all svg:first').removeClass('labnav-busy-rotate');
                        }, 10000);
                    }
                } else {
                    var partial = 'support/reset-device-all.html';
                    if (lab.Structure.Persistent) {
                        partial = 'support/reset-device-persistent-all.html';
                    }
                    dialog.Open(partial, lab.Controls.All.Reset, o);
                    tutorial.ShowModalActions();
                    return;
                }
            }
        },
        ProcessInstruction: function (o) {
            if (typeof (hub) !== "undefined") {
                var button = $(o), operation = button.data('device-function'), hostname = button.data('device-hostname'), index = parseInt(button.data('device-index')), logDescription = button.data('aria-click');
                if (hostname === 'ALL' && index === -1) {
                    $('#lab-operations .button').attr('disabled', true).attr('aria-disabled', true);
                    var count = 0;
                    $('.device').each(function () {
                        hostname = $(this).attr('id');
                        lab.Controls.Process(hostname, count, operation, logDescription);
                        count++;
                    });
                    lab.WaitingCount = count;
                    lab.Log.AddEntry(null, '', logDescription + ', there are ' + count + ' in total.');
                } else {
                    if (operation === 'Connect') {
                        for (var a = 0; a < lab.Structure.Devices.length; a++) {
                            if (lab.Structure.Devices[a].Hostname === hostname) {
                                lab.Connect(lab.Structure.Devices[a]);
                                break;
                            }
                        }
                    } else {
                        lab.Log.AddEntry(null, '', logDescription);
                        lab.Controls.Process(hostname, index, operation);
                    }
                }
            }
        },
        Process: function (hostname, index, operation) {
            lab.Structure.Devices[index].State = 'Busy';
            $('#section-' + hostname + ' .device-controls .button').attr('disabled', true).attr('aria-disabled', true);
            lab.Draw.Loader.Instances[index].Start(hostname, lab.Structure.Devices[index].Data);

            $('#section-' + hostname).addClass('processing');
            hub.server.createDeviceRequest(index, operation);
        }
    },
    ExtractConnectionId: function (src) {
        return src ? src.split('cid=')[1].split('&')[0] : '';
    },
    Connect: function (device, reconnectInPage, consoleMode) {

        var console = false;

        if (typeof (reconnectInPage) === 'undefined' || reconnectInPage === null) {
            reconnectInPage = true;
        }

        if (typeof (device.Hostname) === 'undefined') {

            // content click // DONT reconnect in page!
            var index = parseInt(device);
            device = lab.Structure.Devices[index];
            reconnectInPage = false;
        }

        if (typeof (consoleMode) !== 'undefined') {
            console = consoleMode;
            device.ConsoleMode = consoleMode;
        }

        if (device.State === 'On' || console) {

            var a = lab.GetPositionFromHostname(device.Hostname);

            if (a > -1) {

                var dimn = [], consoleModeActive = false;

                if (device.LinkConsole !== null && device.LinkConsole.length > 0 && (!device.HasInterface || console)) {

                    dimn.push(CONSOLEMODE_WIDTH);
                    dimn.push(CONSOLEMODE_HEIGHT);
                    consoleModeActive = true;

                } else {

                    if (settings.Settings.VNextOptions.DeviceWindow.Width === 0) {
                        dimn = lab.GetWidthAndHeight();

                    } else {
                        dimn.push(settings.Settings.VNextOptions.DeviceWindow.Width);
                        dimn.push(settings.Settings.VNextOptions.DeviceWindow.Height);
                    }
                }

                var cw = dimn[0], ch = dimn[1];

                if (device.Vendor !== 0) {

                    if (settings.Settings.VNextOptions.DevicePopup) {

                        $('#section-' + device.Hostname).addClass('hidden');

                        lab.Microsoft.WindowManager.Open(a,
                            'html',
                            device.AutoLogin,
                            device.Hostname);

                    } else {

                        if (settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {

                            $('#lab-desktop-inner').children('.device-wrapper').each(function () {

                                if ($(this).attr('id') === 'section-' + device.Hostname) {

                                    if ($(this).hasClass('hidden')) {
                                        $(this).removeClass('hidden');
                                    }

                                } else {

                                    if (!$(this).hasClass('hidden')) {
                                        $(this).addClass('hidden');
                                    }
                                }
                            });

                        } else {

                            if ($('#section-' + device.Hostname).hasClass('hidden')) {
                                $('#section-' + device.Hostname).removeClass('hidden');
                            }

                            lab.ScrollToDevice(device.Hostname);
                        }

                        if (reconnectInPage || !device.Connected) {
                            var frame, oFrame;

                            lab.Structure.Devices[a].Connected = true;

                            frame = $('#' + device.Hostname + '-frame');

                            frame.css({
                                'width': cw + 'px',
                                'height': ch + 'px',
                                'overflow': 'hidden',
                                'border': 'none'
                            }).removeClass('hidden');

                            var src = location.protocol.substring(0, location.protocol.length - 1);

                            // Use Myrtille Link if both user has selected it and the Org has allowed it OR the connection is Console
                            if (settings.Settings.VNextOptions.MyrtilleRdp && device.AllowMyrtille && device.LinkMyrtille || consoleModeActive) {

                                src += consoleModeActive
                                    ? device.LinkConsole.replace('https', '').replace('http', '')
                                    : device.LinkMyrtille.replace('https', '').replace('http', '');

                                src += '&width=' + cw + '&height=' + ch;

                            } else {

                                // Else fallback to Stoneware
                                src += device.LinkHtml5.replace('https', '').replace('http', '')
                                    .replace('WIDTH', cw).replace('HEIGHT', ch).replace('TABID', 0)
                                    .replace('&LOGIN', lab.GetLogin(device));
                            }

                            oFrame = '<iframe scrolling="no" width="' +
                                cw +
                                '" height="' +
                                ch +
                                '" frameborder="0" allow="clipboard-read; clipboard-write" id="msTerminal_' +
                                device.Hostname +
                                '" class="ms-terminal" src="' +
                                src +
                                '" tabindex="0"></iframe>';

                            if (device.AllowRdp) {

                                if (settings.Settings.VNextOptions.DevicePopupMax) {
                                    cw = 0;
                                    ch = 0;
                                }

                                var parameters = '?index=' +
                                    a +
                                    '&desktopWidth=' +
                                    cw +
                                    '&desktopHeight=' +
                                    ch +
                                    '&autoLogin=' +
                                    settings.Settings.VNextOptions.AutoLogin +
                                    '&hostname=' +
                                    device.Hostname;

                                oFrame = '<div class="rdp-client"><a href="mstsc.ashx' +
                                    parameters +
                                    '" class="rdp-client-launch" target="_blank">Launch ' +
                                    device.Hostname +
                                    ' in RDP client</a></div>';
                            }

                            frame.html(oFrame);
                        }

                        $('#' + device.Hostname + '-connect').attr('disabled', true).attr('aria-disabled', true);

                        setTimeout(function () {
                            $('#' + device.Hostname + '-connect').attr('disabled', false).attr('aria-disabled', false);
                        }, 3000);

                        if ($('#section-' + device.Hostname).hasClass('hidden')) {

                            $('#section-' + device.Hostname).removeClass('hidden');
                        }

                        lab.ScrollToDevice(device.Hostname);
                    }
                } else {

                    if (settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {

                        $('#lab-desktop-inner').children('.device-wrapper').each(function () {

                            if ($(this).attr('id') === 'section-' + device.Hostname) {

                                if ($(this).hasClass('hidden')) {

                                    $(this).removeClass('hidden');

                                }

                            } else {

                                if (!$(this).hasClass('hidden')) {

                                    $(this).addClass('hidden');

                                }
                            }
                        });

                        $('#' + device.Hostname).scrollTop($('#' + device.Hostname)[0].scrollHeight);

                    } else {

                        if ($('#section-' + device.Hostname).hasClass('hidden')) {

                            $('#section-' + device.Hostname).removeClass('hidden');
                        }

                        $('#' + device.Hostname).css('width', cw);
                        lab.ScrollToDevice(device.Hostname);
                    }

                    if (settings.Settings.VNextOptions.Accessibility) {

                        $('#input_' + a).focus();

                    } else {

                        $('#' + device.Hostname).focus();
                        lab.Cisco.Keyboard.Enable(a);
                    }

                    if (!lab.Structure.Devices[a].Connected) {
                        hub.server.terminalConnect(a);
                    }
                }
            }
        }
    },
    ScrollToDevice: function (hostname) {
        var device = $('#section-' + hostname);

        if ($(device).length > 0) {
            var offset = device.offset();
            $('#lab-desktop').scrollTop(($('#lab-desktop').scrollTop() - 15) + offset.top);
            $('#' + hostname + '-frame').focus();
        }
    },
    ConnectStates: [
        ', click the connect button for this device to connect to its desktop.',
        ', this device is not accessed directly, the lab instructions will inform you how this device is accessed.',
        ', as popups are allowed, this device has been launched in a new window, you may need to toggle windows to access it.'
    ],
    Start: new Date(),
    GetTimeStamp: function () {
        var d = new Date(), td = d - lab.Start, hrs = Math.abs(Math.floor((td % 86400000) / 3600000)), mins = Math.abs(Math.round(((td % 86400000) % 3600000) / 60000));
        //mins = mins + (hrs * 60);
        return hrs + ' hours : ' + mins + ' minutes';
    },
    Log: {
        Reference: null,
        AddEntry: function (ty, cl, cont) {
            if (typeof (cont) !== "undefined" && cont.length > 0) {
                if (lab.Log.Reference === null) {
                    lab.Log.Reference = $('#lab-log');
                }

                var ts = lab.GetTimeStamp();
                if (typeof (ty) === "undefined" || ty === null) {
                    lab.Log.Reference.prepend('<div class="log-item ' + cl + '">' + ts + ', ' + cont + '</div>');
                    lab.Log.Reference.scrollTop(lab.Log.Reference[0].scrollTop);
                }
            }
        }
    },
    Selected: '',
    Change: function (o) {
        var v = $(o).val();
        if (lab.Selected.length > 0) {
            $('#section-' + lab.Selected).removeClass('device-wrap-focus');
        }
        if (v !== 'Instructions') {
            lab.Selected = v;
            var a = lab.GetPositionFromHostname(v);
            if (typeof (a) !== "undefined") {
                if (lab.Structure.Devices[a].Vendor === 0) {
                    $('#section-' + v + ' input').focus();
                } else {
                    // MS
                    if (settings.Settings.VNextOptions.DevicePopup) {
                        lab.Microsoft.WindowManager.Open(a, 'html', settings.Settings.VNextOptions.AutoLogin, v);
                    } else {
                        $('#section-' + v + ' iframe').focus();
                    }
                }
                $('#section-' + v).addClass('device-wrap-focus');
            }
        } else {
            $('#exercise-content').focus();
        }
    },
    AutoLoginUpdate: function (index, newState) {
        lab.Structure.Devices[index].AutoLogin = newState;
        var hostname = lab.Structure.Devices[index].Hostname;
        var device = $('#section-' + hostname);
        if (device.length > 0) {
            var toggleButton = device.find('.auto-login:first');
            if (toggleButton.length > 0) {
                lab.AutoLogin.Toggle(toggleButton, newState);
            }
        }
    },
    AutoLogin: {
        BaseMessage: 'Auto log in to this device is ',
        Toggle: function (btn, forceState) {
            var states = ['auto-login-on', 'auto-login-off'];
            var newState = !($(btn).attr('data-state') === 'on' ? true : false);
            if (typeof forceState !== "undefined") {
                newState = forceState;
            }
            var title = newState ? lab.AutoLogin.BaseMessage + 'on' : lab.AutoLogin.BaseMessage + 'off';

            $(btn)
                .attr('aria-label', title)
                .attr('title', title)
                .removeClass(newState ? states[1] : states[0])
                .addClass(newState ? states[0] : states[1])
                .attr('data-state', newState ? 'on' : 'off');
            var index = $(btn).attr('data-index');
            lab.Structure.Devices[index].AutoLogin = newState;
            hub.server.deviceSetAutoLoginState(index, newState);
        },
        Change: function (o, e) {

            settings.Settings.VNextOptions.AutoLogin = !settings.Settings.VNextOptions.AutoLogin;

            var deviceButtons = $('#lab-desktop .auto-login');

            deviceButtons.each(function (i, v) {
                lab.AutoLogin.Toggle($(v), settings.Settings.VNextOptions.AutoLogin);
            });

            settings.ToggleMessage(o, settings.Settings.VNextOptions.AutoLogin, true, e);
        }
    },
    Myrtille: {
        Change: function (o, e) {

            settings.Settings.VNextOptions.MyrtilleRdp = !settings.Settings.VNextOptions.MyrtilleRdp;
            settings.ToggleMessage(o, settings.Settings.VNextOptions.MyrtilleRdp, true, e);
        }
    },
    Anchor: {
        Change: function (o, e) {

            settings.Settings.VNextOptions.DeviceWindow.AnchorWindow = !settings.Settings.VNextOptions.DeviceWindow.AnchorWindow;

            var a = 0, ls = lab.Structure;

            if (settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {
                $('#lab-desktop-inner').children('.device-wrapper').addClass('hidden');

                if (typeof (ls.Devices) !== "undefined") {
                    var first = false;

                    for (a; a < ls.Devices.length; a++) {
                        if (ls.Devices[a].Vendor === 0 || (ls.Devices[a].Vendor === 1 && !settings.Settings.VNextOptions.DevicePopup)) {
                            if (!first && ls.Devices[a].State === 'On') {
                                first = true;
                                $('#section-' + ls.Devices[a].Hostname).removeClass('hidden');
                            }
                        }
                    }
                    $('#phantom-device').addClass('hidden');
                }
            } else {
                if (typeof (ls.Devices) !== "undefined" && !settings.Settings.VNextOptions.DevicePopup) {
                    for (a; a < ls.Devices.length; a++) {
                        if (ls.Devices[a].State === 'On') {
                            if (ls.Devices[a].Connected) {
                                $('#section-' + ls.Devices[a].Hostname).removeClass('hidden');
                            } else {
                                lab.Connect(ls.Devices[a]);
                            }
                        }
                    }
                    $('#phantom-device').removeClass('hidden');
                }
            }

            settings.ToggleMessage(o, settings.Settings.VNextOptions.DeviceWindow.AnchorWindow, true, e);
        }
    },
    LaunchInWindow: {
        Change: function (o, e) {

            settings.Settings.VNextOptions.DevicePopup = !settings.Settings.VNextOptions.DevicePopup;

            var a = 0;

            if (!settings.Settings.VNextOptions.DevicePopup) {
                lab.Microsoft.WindowManager.CloseAll();
            }

            if (typeof (lab.Structure.Devices) !== "undefined") {
                for (a; a < lab.Structure.Devices.length; a++) {
                    var d = lab.Structure.Devices[a];
                    if (d.Vendor !== 0 && d.HasInterface || d.LinkConsole !== null) {
                        if (settings.Settings.VNextOptions.DevicePopup) {
                            $('#section-' + d.Hostname).addClass('hidden').find('iframe:first').remove();
                        }
                        if (d.State === 'On') {
                            lab.Connect(d);
                        }
                    }
                }
            }

            settings.ToggleMessage(o, settings.Settings.VNextOptions.DevicePopup, true, e);
        },
        Max: function (o, e) {

            settings.Settings.VNextOptions.DevicePopupMax = !settings.Settings.VNextOptions.DevicePopupMax;
            settings.ToggleMessage(o, settings.Settings.VNextOptions.DevicePopupMax, true, e);
        }
    },
    GetPositionFromHostname: function (hostname) {
        for (var a = 0; a < lab.Structure.Devices.length; a++) {
            if (lab.Structure.Devices[a].Hostname === hostname) {
                return a;
            }
        }
        return -1;
    },
    Structure: [],
    Setup: function () {
        if (typeof (startTime) !== "undefined") {
            lab.Start = new Date(startTime);
        }

        if (lab.Structure.Devices.length > 0) {
            var d = new Date();
            lab.Log.AddEntry(null, '', 'Session start time ' + (d.getMonth() + 1) + '-' + d.getDate() + ':' + d.getHours() + ":" + d.getMinutes());

            for (var a = 0; a < lab.Structure.Devices.length; a++) {

                if (lab.Structure.Devices[a].Vendor === 0) {
                    lab.Cisco.Terminals.push(new Terminal(a, lab.Structure.Devices[a].Hostname));
                } else {
                    lab.Microsoft.WindowManager.Create(a, lab.Structure.Devices[a].Hostname);
                }

                if (lab.Structure.Devices[a].State === 'Busy') {
                    lab.WaitingCount++;
                    lab.Log.AddEntry(null, '', lab.Structure.Devices[a].Hostname + ' is currently having an action being processed, please wait for this to complete before you connect to it.');
                } else {
                    var connectable = '';
                    if (lab.Structure.Devices[a].State === 'On') {
                        connectable = lab.ConnectStates[0];
                        if (!lab.Structure.Devices[a].HasInterface) {
                            connectable = lab.ConnectStates[1];
                        }
                        // NEW CHANGE
                        if (lab.Structure.Devices[a].Vendor === 0) {
                            // Cisco connect
                            hub.server.terminalConnect(a);
                        }
                    }
                    lab.Log.AddEntry(null, '', lab.Structure.Devices[a].Hostname + ' is currently in state ' + lab.Structure.Devices[a].State + connectable);
                }
            }
            if (lab.WaitingCount > 0) {
                $('#lab-operations .button').attr('disabled', true).attr('aria-disabled', true);
            }
        }

        if (typeof (mappings) !== "undefined") {
            practiceLab.Assessment.DrawMappings();
        }
    },
    Resolution: [1024, 768],
    WaitingCount: 0,
    GetLogin: function (device, noEncode) {
        if (device.AutoLogin) {
            var d = device.Domain, u = device.Username, p = device.Password;
            if (d === null) {
                d = '';
            }
            if (u === null) {
                u = '';
            }
            if (p === null) {
                p = '';
            }
            if (p.indexOf('$') > -1) {
                p = p.replace('$', '$$$');
            }

            if (typeof (noEncode) === "undefined" || noEncode === false) {
                return '&u=' + d + '\\' + u + '&p=' + p;
            }
            return encodeURIComponent(d + '\\' + u + '&p=' + p);
        }
        return "";
    },
    GetDesktopWidthAndHeight: function () {
        var ld = $('.device-wrapper:first');
        return [(ld.width() - 40), (ld.width() * 0.75)];
    },
    SubWidth: 72,
    SubHeight: 32,
    Active: 0,
    FitWidthAndHeight: function () {
        var width = LABDESKTOP_DEFAULT_WIDTH, height = LABDESKTOP_DEFAULT_HEIGHT, a = 0;

        if (settings.Settings.VNextOptions.DeviceWindow.Fit === false) {
            var wh = lab.GetWidthAndHeight();
            width = wh[0];
            height = wh[1];
        }

        settings.Settings.VNextOptions.DeviceWindow.Width = width;
        settings.Settings.VNextOptions.DeviceWindow.Height = height;

        if (typeof (lab.Structure.Devices) !== "undefined") {
            var connectLast = false;
            for (a; a < lab.Structure.Devices.length; a++) {
                if (lab.Active === a) {
                    connectLast = true;
                    continue;
                }

                var d = lab.Structure.Devices[a];

                if (d.State === 'On' && d.HasInterface) {
                    if (d.Vendor > 0) {
                        lab.Connect(lab.Structure.Devices[a], true, lab.Structure.Devices[a].hasOwnProperty("ConsoleMode") ? lab.Structure.Devices[a].ConsoleMode : false);
                    } else {
                        $('#' + d.Hostname).css({ 'width': width + 'px', 'height': height + 'px' });
                    }
                }
            }

            if (connectLast) {
                lab.Connect(lab.Structure.Devices[lab.Active], true, lab.Structure.Devices[lab.Active].hasOwnProperty("ConsoleMode") ? lab.Structure.Devices[lab.Active].ConsoleMode : false);
            }
        }
        lab.SetFitWidthState(!settings.Settings.VNextOptions.DeviceWindow.Fit);

        settings.Save();
        $('#phantom-device').css({ 'width': width + 'px', 'height': height + 'px' });
    },
    SetFitWidthState: function (s) {
        if (typeof (s) !== "undefined") {
            settings.Settings.VNextOptions.DeviceWindow.Fit = s;
        }
        if (settings.Settings.VNextOptions.DeviceWindow.Fit) {
            $('#reset-viewport').addClass('toggle-fit-on').removeClass('toggle-fit-off').attr('title', '[Max width], change to device size default width');
        } else {
            $('#reset-viewport').addClass('toggle-fit-off').removeClass('toggle-fit-on').attr('title', '[Default width], change device size max width');
        }
    },
    GetWidthAndHeight: function () {
        var labDesktop = $('#lab-desktop');

        var desktopWidth = Math.round((labDesktop.width() - 45) / 2) * 2; // Rounds down to the nearest even number.
        var desktopHeight = Math.round((labDesktop.height() - 60) / 2) * 2;

        if (desktopWidth > LABDESKTOP_MAX_WIDTH) {
            desktopWidth = LABDESKTOP_MAX_WIDTH;
        }
        if (desktopHeight > LABDESKTOP_MAX_HEIGHT) {
            desktopHeight = LABDESKTOP_MAX_HEIGHT;
        }

        settings.Settings.VNextOptions.DeviceWindow.Width = desktopWidth;
        settings.Settings.VNextOptions.DeviceWindow.Height = desktopHeight;
        settings.Save();

        $('#phantom-device').css({ 'width': desktopWidth + 'px', 'height': desktopHeight + 'px' });
        return [desktopWidth, desktopHeight];
    },
    HandleOverlay: function (show) {
        if (typeof (devices) !== "undefined") {
            for (var a = 0; a < devices.length; a++) {
                if (show) {
                    $('#' + lab.Structure.Devices[a].Hostname + '-frame').css({ 'width': '1px', 'height': '1px' });
                } else {
                    var dimn = lab.GetWidthAndHeight(lab.Structure.Devices[a]);
                    $('#' + lab.Structure.Devices[a].Hostname + '-frame').css({ 'width': dimn[0] + 'px', 'height': dimn[1] + 'px' });
                }
            }
        }
    },
    RefreshState: function (id, fromExitCode) {
        if (typeof fromExitCode !== "undefined") {
            lab.Structure.Devices[id].Refreshing = true;
        }
        hub.server.vNextRefreshDeviceState(id);
    },
    Links: function (id, e) {
        if (typeof (e) !== "undefined") {
            if (e.keyCode !== 32) {
                return;
            }
        }
        if (typeof (id) !== "undefined") {
            id = parseInt(id);
            if (id > -1 && typeof (lab.Structure.Devices) !== "undefined" && lab.Structure.Devices.length > id) {
                $('#devices').children('.device-group__active').removeClass('device-group__active');
                var d = lab.Structure.Devices[id];
                if (d.State === 'On') {
                    if (settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {
                        // hide all first
                        $('#lab-desktop-inner').children('div').addClass('hidden');
                        var f = $('#section-' + d.Hostname);
                        f.removeClass('hidden');

                        var iframe = f.find('iframe:first'), force = iframe.length === 0;
                        if (force) {
                            // check java
                            var jObj = f.find('applet:first');
                            force = jObj.length === 0;
                        }

                        lab.Connect(d, force);

                    } else {
                        lab.Connect(d, false);
                    }
                } else {
                    $('#control-' + d.Hostname).toggleClass('device-group__active').find('button:first').focus();
                }
            }
        }
    },
    Cisco: {
        ActiveTerminal: -1,
        Terminals: [],
        BlockedCommand: function (m) {
            lab.Log.AddEntry(null, '', m);
        },
        Read: function (id) {
            $('#' + lab.Structure.Devices[id].Hostname + '-read').attr('disabled', true).attr('aria-disabled', true);
            var terminal, a;
            for (a = 0; a < lab.Cisco.Terminals.length; a++) {
                if (lab.Cisco.Terminals[a].Id === id) {
                    terminal = lab.Cisco.Terminals[a];
                    break;
                }
            }

            if (typeof (terminal) !== "undefined" && terminal !== null) {
                var html = [], dl = terminal.LastRead, l = terminal.Data.length - 1;
                if (dl < 0) {
                    dl = 0;
                }

                for (dl; dl <= l; dl++) {
                    html.push(terminal.Data[dl]);
                }

                terminal.LastRead = l;
                if (html.length === 0) {
                    $('#terminal_read_' + id).html('<p>No new content for this terminal.</p>');
                } else {
                    $('#terminal_read_' + id).html('<p>' + html.join('<br/>') + '</p>');
                    $('#terminal_read_' + id).focus();
                }
            }
        },
        ReceiveData: function (t) {
            var terminal = lab.Cisco.Terminals[t.Id], a = 0;
            if (typeof (terminal) !== "undefined") {
                var rc = t.WRows.length, last = t.WRows[rc - 1], removed = true, lft, rgt, crs;

                if (terminal.RowId === 0) {
                    terminal.RowId = t.RowId - (rc - 1);
                    terminal.Data.push('');
                }

                if (t.RowId === terminal.RowId || (t.RowId - rc) !== terminal.RowId) {
                    if (terminal.p !== null) {
                        terminal.p.remove();
                    }
                    terminal.Data.pop();
                    removed = true;
                }

                for (a = 0; a < rc - 1; a++) {
                    var c = t.WRows[a].split(' ').join('&nbsp;');
                    if (c === '') {
                        c = '&nbsp;';
                    }
                    terminal.p = $('<p></p>').html(c);
                    terminal.w.append(terminal.p);
                    terminal.Data.push(c);
                }

                lft = last.slice(0, t.Position.X), crs = last.slice(t.Position.X, t.Position.X + 1), rgt = last.slice(t.Position.X + 1, last.length);

                if (crs.length === 0 || crs === ' ') {
                    crs = '&nbsp;';
                }

                if (removed) {
                    terminal.Data.push(lft + ' (cursor) ' + rgt);
                }

                terminal.p = $('<p></p>').html(lft.split(' ').join('&nbsp;') + '<span class="cursor">' + crs + '</span>' + rgt);
                terminal.w.append(terminal.p);
                terminal.RowId = t.RowId;
                terminal.w.scrollTop(terminal.w[0].scrollHeight);
                terminal.r.attr('disabled', false).attr('aria-disabled', false);
            }
        },
        Keyboard: {
            Input: function (event, a) {
                var key = event.keyCode;
                if (key === 13 || key === 32 || key === 9) {
                    var i = $('#input_' + a);
                    var cmd = i.val();
                    if ((cmd === '' && key === 32) || key === 13 || key === 9) {
                        // send through space for more
                        if (cmd === '' && key === 32) {
                            hub.server.sendTerminalKeyPress(a, ' ');
                        } else if (key === 9) {
                            // send tab
                        } else if (key === 13) {
                            hub.server.sendTerminalKeyPress(a, cmd + '\r');
                        }
                        i.val('');
                        event.preventDefault();
                    }
                    return true;
                } else {
                    return true;
                }
            },
            Alerted: false,
            Buffer: '',
            InProgress: false,
            Enabled: false,
            Enable: function (a) {
                if (typeof (a) !== "undefined") {
                    lab.Cisco.ActiveTerminal = a;
                }
                if (!lab.Cisco.Keyboard.Alerted) {
                    lab.Cisco.Keyboard.Alerted = true;
                    lab.Log.AddEntry(null, '', 'Accessing this device causes a keyboard trap as any keypresses are sent to the console port of the device, to break out of this, simply press the escape key.');
                }
                lab.Log.AddEntry(null, '', 'This is the terminal of ' + lab.Structure.Devices[a].Hostname);
                if (!lab.Cisco.Keyboard.Enabled) {
                    lab.Cisco.Keyboard.Enabled = true;
                    var d = document;
                    d.onkeypress = lab.Cisco.Keyboard.KeyPress;
                    d.onkeydown = lab.Cisco.Keyboard.KeyDown;
                }
            },
            Disable: function () {
                if (lab.Cisco.Keyboard.Enabled) {
                    lab.Cisco.Keyboard.Enabled = false;
                    lab.Cisco.ActiveTerminal = -1;
                    var d = document;
                    d.onkeypress = null;
                    d.onkeydown = null;
                }
            },
            Send: function () {
                lab.Cisco.Keyboard.InProgress = true;
                hub.server.sendTerminalKeyPress(lab.Cisco.ActiveTerminal, encodeURIComponent(lab.Cisco.Keyboard.Buffer));
                lab.Cisco.Keyboard.Buffer = '';
                lab.Cisco.Keyboard.InProgress = false;
                return true;
            },
            SendDone: function () {
                lab.Cisco.Keyboard.InProgress = false;
                if (lab.Cisco.Keyboard.Buffer !== "") {
                    lab.Cisco.Keyboard.Send();
                }
            },
            MaybeSend: function () {
                if (!lab.Cisco.Keyboard.InProgress && lab.Cisco.Keyboard.Buffer !== "") {
                    lab.Cisco.Keyboard.Send();
                }
            },
            ProcessKey: function (k) {
                lab.Cisco.Keyboard.Buffer += k;
                lab.Cisco.Keyboard.MaybeSend();
            },
            Escape: function (s) {
                return String.fromCharCode(27) + "[" + s;
            },
            KeyEventStop: function (ev) {
                ev.cancelBubble = true;
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                }
                if (ev.preventDefault) {
                    ev.preventDefault();
                }
                try {
                    ev.keyCode = 0;
                } catch (e) {
                    console.log(e);
                }
            },
            KeyEventSuppress: function (ev) {
                ev.cancelBubble = true;
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                }
            },
            KeyPress: function (ev) {
                if (!ev) {
                    ev = window.event;
                }
                if ((ev.ctrlKey && !ev.altKey) || (ev.which === 0) || (ev.keyCode === 8) || (ev.keyCode === 16) || (ev.keyCode === 17)) {
                    lab.Cisco.Keyboard.KeyEventStop(ev);
                    return false;
                }
                var kc;
                if (ev.keyCode) {
                    kc = ev.keyCode;
                }
                if (ev.which) {
                    kc = ev.which;
                }
                var k = String.fromCharCode(kc);
                if (ev.altKey && !ev.ctrlKey) {
                    k = String.fromCharCode(27) + k;
                }
                lab.Cisco.Keyboard.ProcessKey(k);
                lab.Cisco.Keyboard.KeyEventStop(ev);
                return false;
            },
            KeyDown: function (ev) {
                if (!ev) {
                    ev = window.event;
                }
                var k, kc = ev.keyCode;
                if (ev.shiftKey && kc === 33) {
                    lab.Cisco.Keyboard.KeyEventStop(ev);
                    return false;
                } else if (ev.shiftKey && kc === 34) {
                    lab.Cisco.Keyboard.KeyEventStop(ev);
                    return false;
                } else if (kc === 33) {
                    k = lab.Cisco.Keyboard.Escape("5~");
                } else if (kc === 34) {
                    k = lab.Cisco.Keyboard.Escape("6~");
                } else if (kc === 35) {
                    k = lab.Cisco.Keyboard.Escape("4~");
                } else if (kc === 36) {
                    k = lab.Cisco.Keyboard.Escape("1~");
                } else if (kc === 37) {
                    k = lab.Cisco.Keyboard.Escape("D");
                } else if (kc === 38) {
                    k = lab.Cisco.Keyboard.Escape("A");
                } else if (kc === 39) {
                    k = lab.Cisco.Keyboard.Escape("C");
                } else if (kc === 40) {
                    k = lab.Cisco.Keyboard.Escape("B");
                } else if (kc === 45) {
                    k = lab.Cisco.Keyboard.Escape("2~");
                } else if (kc === 46) {
                    k = lab.Cisco.Keyboard.Escape("3~");
                } else if (kc === 27) {
                    if (!lab.Mode.Value) {
                        lab.Log.AddEntry(null, '', 'Your keyboard is being released from ' + lab.Structure.Devices[lab.Cisco.ActiveTerminal].Hostname);
                        $('#' + lab.Structure.Devices[lab.Cisco.ActiveTerminal].Hostname).removeClass('cisco-terminal-focused');
                        $('#' + lab.Structure.Devices[lab.Cisco.ActiveTerminal].Hostname).focus();
                        lab.Cisco.Keyboard.Disable();
                    }
                    return;
                    //k = String.fromCharCode(27);
                } else if (kc === 9) {
                    k = String.fromCharCode(9);
                } else if (kc === 8) {
                    k = String.fromCharCode(8);
                } else if (kc === 112) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "25~" : "[A");
                } else if (kc === 113) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "26~" : "[B");
                } else if (kc === 114) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "28~" : "[C");
                } else if (kc === 115) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "29~" : "[D");
                } else if (kc === 116) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "31~" : "[E");
                } else if (kc === 117) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "32~" : "17~");
                } else if (kc === 118) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "33~" : "18~");
                } else if (kc === 119) {
                    k = lab.Cisco.Keyboard.Escape(ev.shiftKey ? "34~" : "19~");
                } else if (kc === 120) {
                    k = lab.Cisco.Keyboard.Escape("20~");
                } else if (kc === 121) {
                    k = lab.Cisco.Keyboard.Escape("21~");
                } else if (kc === 122) {
                    k = lab.Cisco.Keyboard.Escape("23~");
                } else if (kc === 123) {
                    k = lab.Cisco.Keyboard.Escape("24~");
                } else {
                    if (!ev.ctrlKey || (ev.ctrlKey && ev.altKey) || (ev.keyCode === 17)) {
                        lab.Cisco.Keyboard.KeyEventSuppress(ev);
                        return;
                    }
                    if (ev.shiftKey) {
                        if (kc === 50) {
                            k = String.fromCharCode(0);
                        } else if (kc === 54) {
                            k = String.fromCharCode(30);
                        } else if (kc === 94) {
                            k = String.fromCharCode(30);
                        } else if (kc === 109) {
                            k = String.fromCharCode(31);
                        } else {
                            lab.Cisco.Keyboard.KeyEventSuppress(ev);
                            return;
                        }
                    } else {
                        if (kc >= 65 && kc <= 90) {
                            k = String.fromCharCode(kc - 64);
                        } else if (kc === 219) {
                            k = String.fromCharCode(27);
                        } else if (kc === 220) {
                            k = String.fromCharCode(28);
                        } else if (kc === 221) {
                            k = String.fromCharCode(29);
                        } else if (kc === 190) {
                            k = String.fromCharCode(30);
                        } else if (kc === 32) {
                            k = String.fromCharCode(0);
                        } else {
                            lab.Cisco.Keyboard.KeyEventSuppress(ev);
                            return;
                        }
                    }
                }
                lab.Cisco.Keyboard.ProcessKey(k);
                lab.Cisco.Keyboard.KeyEventStop(ev);
                return false;
            }
        },
        CloneSelected: function () {
            var text = '';
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type !== 'Control') {
                text = document.selection.createRange().text;
            }
            if (text.length > 0) {
                var w = window.open();
                $(w.document.body).html('<p>' + text + '</p>');
            }
        },
        Copy: function () {
            var htmlContent = document.getElementById('terminal_' + lab.Device.Active);
            var range = document.body.createTextRange();
            range.moveToElementText(htmlContent);
            range.select();
            var controlRange = document.body.createControlRange();
            controlRange.addElement(htmlContent);
            controlRange.execCommand('copy');
        },
        Paste: function () {
            $('#pasteBin').show();
            var htmlContent = document.getElementById('pasteBin');
            var range = document.body.createTextRange();
            range.moveToElementText(htmlContent);
            range.select();
            document.execCommand('paste', false, undefined);
            var d = document.getElementById('pasteBin');
            var contents = decodeURIComponent(d.value);
            $('#pasteBin').hide();
            hub.server.sendTerminalKeyPress(lab.Device.Active, contents);
            if (lab.Device.Active < 100) {
                $('#terminal_' + lab.Device.Active).focus();
            }
        },
        Script: {
            Send: function (object) {

                var notification = {
                    Message: 'Please check your inbox for your latest scripts.'
                };

                if (tools.ConfirmInput('email', $('#email-address').val())) {

                    hub.server.generateCiscoLogs();

                    $('.lab-desktop-notification').addClass('hidden');
                    notifications.Add(notification, 5000);

                } else {

                    if ($('#emailAddress').length === 0) {

                        $('.lab-desktop-notification').removeClass('hidden');

                        if (!$('.notification .errortext').hasClass('hidden')) {
                            $('.notification .errortext').addClass('hidden');
                        }

                        if ($('.lab-desktop-notification').length > 1) {
                            $('.lab-desktop-notification').first().addClass('hidden');
                        }

                        if (typeof object !== 'undefined' && object !== null) {

                            object.attr('disabled', false);
                        }
                    }

                    if (tools.ConfirmInput('email', $('#tempemail').val())) {

                        hub.server.generateCiscoLogs($('#tempemail').val());

                        $('#tempemail').val('');
                        $('.lab-desktop-notification').addClass('hidden');
                        notifications.Add(notification, 5000);
                    }

                    if (!$('#tempemail').hasClass('hidden') && typeof object === 'undefined' && ($('#tempemail').val().length === 0 || !tools.ConfirmInput('email', $('#tempemail').val()))) {

                        $('.notification .errortext').removeClass('hidden');
                    }
                }
            }
        },
        OnConnected: function (d) {
            var device = lab.Structure.Devices[d], connect = true;
            lab.Structure.Devices[d].Connected = true;
            $('#' + device.Hostname).addClass('terminal-connected');
            hub.server.sendTerminalKeyPress(d, '\r');

            if (settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {
                $('#lab-desktop-inner').children('.device-wrapper').each(function () {
                    if ($(this).attr('id') !== 'section-' + device.Hostname) {
                        if (!$(this).hasClass('hidden')) {
                            connect = false;
                        }
                    }
                });
            }

            if (connect) {
                lab.Connect(device);
            }
        },
        OnDisconnected: function (d) {
            if (typeof (lab.Structure.Devices) !== "undefined") {
                $('#' + lab.Structure.Devices[d].Hostname).removeClass('terminal-connected');
                $('#section-' + lab.Structure.Devices[d].Hostname).addClass('hidden');
            }
        },
        Utilities: {
            Clear: function () {
                $('#' + d + ' p').remove();
            },
            Copy: function (d) {
                var content = [];
                $('#' + d + ' p').each(function () {
                    content.push($(this).text());
                });

                // join content
                $('#target').text(content.join('&#10;&#13;'));
            },
            Paste: function () {

            }
        }
    },
    Microsoft: {
        IsConsoleOnly: function (id) {
            var device = lab.Structure.Devices[id];
            if (!device.HasInterface && device.LinkConsole !== null) {
                return true;
            }
            return false;
        },
        WindowManager: {
            Windows: {},
            Create: function (id, hostname) {
                var d = $('#' + hostname), cw = 1024, ch = 768;

                if (d.length > 0) {
                    cw = Math.round(d.width());
                    ch = Math.round((cw / 100) * 75);
                }
                $('#' + hostname + '-in-window').css({ 'width': cw + 'px' });
            },
            Open: function (id, c, l, n) {

                var labDevice = lab.Structure.Devices[id];
                if (labDevice.HasInterface || labDevice.Probe === 0 || labDevice.LinkConsole !== null) {
                    var wi = this.Windows, deviceWidth = settings.Settings.VNextOptions.DeviceWindow.Width, deviceHeight = settings.Settings.VNextOptions.DeviceWindow.Height, token = tools.Token.Get();

                    if (settings.Settings.VNextOptions.DevicePopupMax) {
                        deviceWidth = screen.width - 4, deviceHeight = (screen.height - 105) - CONSOLETOOLBAR_HEIGHT;
                    }

                    if (lab.Microsoft.IsConsoleOnly(id)) {
                        deviceWidth = CONSOLEMODE_WIDTH;
                        deviceHeight = CONSOLEMODE_HEIGHT;
                    }

                    var w = wi[n], windowOpen = false;
                    if (typeof w !== "undefined" && w !== null) {
                        try {
                            if (!w.closed) {
                                windowOpen = true;
                            }
                        } catch (e) { }
                    }

                    if (typeof wi[n] === "undefined" || !windowOpen) {

                        if (USER_BROWSER === 'Google Chrome' && !OUTERWINDOW_SET) {

                            // chrome fix for chopping off window height & width
                            OUTERWINDOW_HEIGHT_ADJUSTMENT = 64;
                            OUTERWINDOW_WIDTH_ADJUSTMENT = 17;
                            OUTERWINDOW_SET = true;
                        }

                        var pageHeight = deviceHeight + CONSOLETOOLBAR_HEIGHT + OUTERWINDOW_HEIGHT_ADJUSTMENT; // pixels for toolbar
                        var pageWidth = deviceWidth + OUTERWINDOW_WIDTH_ADJUSTMENT; // Chrome Adjustment

                        if (timer.DeveloperMode) {
                            deviceWidth = CONSOLEMODE_WIDTH;
                            deviceHeight = CONSOLEMODE_HEIGHT;
                            pageHeight = USER_BROWSER === 'Google Chrome' ? CONSOLEMODE_HEIGHT + OUTERWINDOW_HEIGHT_ADJUSTMENT : CONSOLEMODE_HEIGHT;
                            pageWidth = USER_BROWSER === 'Google Chrome' ? CONSOLEMODE_WIDTH + OUTERWINDOW_WIDTH_ADJUSTMENT : CONSOLEMODE_WIDTH;
                        }

                        var link = '../../device-advanced.aspx?client=' + c + '&device=' + id + '&width=' + deviceWidth + '&height=' + deviceHeight + '&login=' + l + '&token=' + token + "&developerMode=" + timer.DeveloperMode, options = 'title="' + n + '",width=' + pageWidth + ',height=' + pageHeight + ',scrollbars=no,menubar=no,resizable=yes,toolbar=no,location=no,status=no';
                        wi[n] = window.open(link, n, options);

                        try {
                            wi[n].moveTo(window.screenX, 0);
                        } catch (e) {
                            // unable to move window, user will need to move Chrome etc.
                        }
                    } else {
                        wi[n].focus();
                    }
                } else {
                    $('#' + n).show().focus();
                }
            },
            Close: function (id, n) {
                var wi = this.Windows;
                if (typeof wi[n] !== "undefined" && !wi[n].closed) {
                    wi[n].close();
                }
            },
            CloseAll: function () {
                var wi = lab.Microsoft.WindowManager.Windows;
                for (var p in wi) {
                    if (wi.hasOwnProperty(p)) {
                        try {
                            wi[p].close();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            },
            Report: function (n) {
                var wi = lab.Microsoft.WindowManager.Windows;
                if (typeof wi[n] === "undefined" || wi[n].closed) {
                    return false;
                }
                return true;
            }
        },
        OnConnected: function (d) {
            var device = lab.Structure.Devices[d], connect = true;

            if (settings.Settings.VNextOptions.DeviceWindow.AnchorWindow) {
                $('#lab-desktop-inner').children('.device-wrapper').each(function () {
                    if ($(this).attr('id') !== 'section-' + device.Hostname) {
                        if (!$(this).hasClass('hidden')) {
                            connect = false;
                        }
                    }
                });
            }

            if (connect) {
                lab.Connect(device, null, device.Probe === 0);
            }
        }
    },
    Content: {
        Complete: function () {
            hub.server.contentSetTrackingStatus().done(function () {
                location.reload();
            });
        }
    },
    BlockPanel: {
        Show: function (d) {
            lab.BlockPanel.SetContent(d);
            $('#lab-block-panel').removeClass('hidden');
        },
        Hide: function () {
            lab.BlockPanel.SetContent('');
            $('#lab-block-panel').addClass('hidden');
        },
        SetContent: function (d) {
            $('#lab-block-panel-content').html(d);
        }
    },
    Reset: {
        Stage2: null,
        InProgress: false,
        Ask: function () {
            if (lab.Reset.Stage2 === null) {
                lab.Reset.Stage2 = $('#setting-persistent-reset-2');
            }
            lab.Reset.Stage2.removeClass('hidden');
        },
        Cancel: function () {
            lab.Reset.Stage2.addClass('hidden');
        },
        Confirm: function () {
            lab.Reset.InProgress = true;
            hub.server.vNextResetLab().done(function (d) {
                $('#labarea-modal').removeClass('hidden');
                $('#setting-persistent-reset-1 button').attr('disabled', true);

                lab.Log.AddEntry(null, '', 'Please wait while we reset your lab to defaults, a message will appear here when this process is complete.');

                lab.Reset.Stage2.addClass('hidden');
                for (var a = 0; a < lab.Structure.Devices.length; a++) {
                    $('#section-' + lab.Structure.Devices[a].Hostname).addClass('hidden');
                }
            });
        },
        Complete: function () {
            $('#setting-persistent-reset-1 button').attr('disabled', false);
            var msg = {
                Message: 'Your lab has been reset to defaults.'
            };

            notifications.Add(msg);
            lab.Log.AddEntry(null, '', msg.Message);
            $('#labarea-modal').addClass('hidden');
        },
        UpdateStage: function (d) {
            if (d === 'COMPLETE') {
                lab.BlockPanel.Hide();
            } else {
                lab.BlockPanel.SetContent(d);
            }
        }
    },
    EnsureConnectionIsCorrect: function (index, connectionType) {

    },
    ShowDisconnectMessage: function (exitCode, connectionId, hostname, rawExitCode) {

        var index = lab.GetPositionFromHostname(hostname);

        if (lab.Structure.Devices[index].ActiveConnectionId !== connectionId) { return; }

        var wrapper = $('#' + hostname + '-frame');
        var iframe = $('#' + 'msTerminal_' + hostname);

        if (wrapper.length === 0 || iframe.length === 0) return;

        if (settings.Settings.VNextOptions.DevicePopup) {
            lab.Microsoft.WindowManager.Close(0, hostname);

        } else {

            iframe.attr('src', 'https://error.practice-labs.com/error.html?code=' + exitCode);

            // PL-1875 - ML REMOVED 10/06/21
            //var page = $(RDP_ERROR_HTML).clone();
            //page.removeClass('rdpe_65547').addClass('rdpe_' + exitCode);
            //var unknownCodeElement = page.find(".unknown-raw-code");
            //if (unknownCodeElement) {
            //    unknownCodeElement.html(rawExitCode);
            //}

            //iframe.html(page);
        }

        if (index > -1) {

            setTimeout(function () {
                lab.RefreshState(index, true);
            }, 15000);
        }
    },
    DrainedDeviceReconnect: function (connections) {
        for (var a = 0; a < lab.Structure.Devices.length; a++) {
            if (typeof lab.Structure.Devices[a].ActiveConnectionId !== "undefined") {
                for (var b = 0; b < connections.length; b++) {
                    if (lab.Structure.Devices[a].ActiveConnectionId === connections[b].ActiveId) {
                        var consoleConnection = $('#console-connect-' + lab.Structure.Devices[a].Hostname), consoleMode = false;
                        if (consoleConnection.length > 0) {
                            consoleMode = consoleConnection.hasClass('win-console-on');
                        }

                        if (lab.Structure.Devices[a].LinkMyrtille) {
                            lab.Structure.Devices[a].LinkMyrtille.replace(connections[b].ActiveId, connections[b].NextId);
                        }

                        lab.Connect(lab.Structure.Devices[a], null, consoleMode);
                        break;
                    }
                }
            }
        }
    }
};


function checkConnectionId(index) {

}

function onLogout(a) {
    // rdp device disconnected
    if (typeof (a) !== "undefined") {
        $('#' + lab.Structure.Devices[a].Hostname + '-connect').attr('disabled', false).attr('aria-disabled', false);
    }
}

function getWindowHeightFix(diff) {
    OUTERWINDOW_HEIGHT_ADJUSTMENT = diff;
    OUTERWINDOW_SET = true;
    console.log('Set adjustment:' + diff);
}