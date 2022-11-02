// JavaScript source code
var tools = {
    GetQsParameterByName: function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    Loader: {
        Obj: null,
        Message: null,
        Refocus: null,
        CloseButton: null,
        Close: function() {
            tools.Loader.Obj.attr('style', '');
            tools.Loader.Message.text('');
            tools.Loader.CloseButton.hide();
        },
		Control: function(show, message, refocus, delay, enableClosePanel) {

			if (tools.Loader.Obj === null) {
				tools.Loader.Obj = $('#loader-cover');
                tools.Loader.Message = $('#loader-cover-title');
                tools.Loader.CloseButton = $('#loader-cover-close');
            }

			if (show) {
                if (typeof enableClosePanel !== "undefined" && enableClosePanel) {
                    tools.Loader.CloseButton.show();
                }

				if (typeof(message) !== "undefined") {
                    tools.Loader.Message.text(message);
                }

				tools.Loader.Obj.attr('style', 'display:flex').focus();

				if (typeof(refocus) !== "undefined") {
					tools.Loader.Refocus = $('#' + refocus);
				}

			} else {
				if (typeof(delay) === "undefined") {
					delay = 500;
				}

				if (delay > 0) {
                    setTimeout(function () {
                        tools.Loader.Close();
						if (typeof (refocus) !== "undefined") {
							tools.Loader.Refocus.focus();
						}
					}, delay);
                } else {
                    tools.Loader.Close();
					if (typeof (refocus) !== "undefined") {
						tools.Loader.Refocus.focus();
					}
                }
			}
		}
	},
	SkipLinks: {
		Click:function(l) {
			switch (l) {
			case 0:
			{
				$('#tab-main > li:first > a:first').click();
				$('#nav-titles').focus();
				break;
			}
			case 1:
			{
				$('#tab-main > li:nth-child(2) > a:first').click();
				$('#exercise-content').focus();
				break;
			}
			case 2:
			{
				$('#devices').focus();
				break;
			}
			case 3:
			{
				if (typeof lab.Structure !== "undefined" && lab.Structure !== null && typeof lab.Structure.Devices !== "undefined") {
					$('#lab-desktop .device-wrapper').each(function() {
						if (!$(this).hasClass('hidden')) {
							$(this).focus();
							return;
						}
					});
				}
				break;
			}
			}
		}
	},
	ConfirmInput: function(t, v) {
		var p;
		switch (t) {
			case 'text':
				{
					p = /^[a-zA-Z.\s\-]{2,32}$/;
					return p.test(v);
				}
			case 'display':
				{
					p = /^[a-zA-Z0-9.\-]{2,32}$/;
					return p.test(v);
				}
			case 'longtext':
				{
					p = /^[a-zA-Z0-9.\s\-]{2,128}$/;
					return p.test(v);
				}
			case 'email':
				{
					p = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
					return p.test(v);
				}
			case 'loose':
				{
					p = /^[a-zA-Z0-9.\s\-\@]{2,128}$/;
					return p.test(v);
				}
			case 'number':
				{
					p = /^[0-9.\s\-\()]{7,20}$/;
					return p.test(v);
				}
			case 'password':
				{
					p = /^[a-zA-Z0-9.\s\-\@]{6,128}$/;
					return p.test(v);
				}
			case 'select':
				{
					return true;
				}
			case 'domain':
				{
					p = /^\@+([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])$/;
					return p.test(v);
				}
			case 'special':
				{
					p = /^[\u0020-\u007e\u00a3]{2,32}$/;
					return p.test(v);
				}
			case 'address':
				{
					p = /^[a-zA-Z0-9.\s\-\,\(\)\.\\\/\'']{1,384}$/;
					return p.test(v);
				}
			case 'card':
				{
					p = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
					return p.test(v);
				}
			case 'cvv':
				{
					p = /^[0-9.\s\-\()]{3,4}$/;
					return p.test(v);
				}
			case 'int':
				{
					p = /^[0-9.\s\,\()]{1,16}$/;
					return p.test(v);
				}
		}
		return false;
	},
	Ssl: {
		Change: function(o, e) {

			settings.Settings.VNextOptions.ForceHttp = !settings.Settings.VNextOptions.ForceHttp;

			var newScheme = '';

			if (settings.Settings.VNextOptions.ForceHttp && location.protocol === "https:") {
				newScheme = 'http://';
			} else if (!settings.Settings.VNextOptions.ForceHttp && location.protocol === "http:") {
				newScheme = 'https://';
			}

			if (newScheme.length > 0) {
				var port = location.port;

				if (port === '44300' && newScheme === 'http://') {
					port = '60196';
				} else if (port === '60196' && newScheme === 'https://') {
					port = '44300';
				}

				hub.server.vNextSetSettings(JSON.stringify(settings.Settings.VNextOptions)).done(function(t) {
					if (t) {
						location.href = newScheme + location.hostname + (port ? ':' + port : '') + location.pathname;
					}
				});
			}
		}
	},
	Lunch: {
		Used: false,
		Change: function (o, e) {

			if (!tools.Lunch.Used) {
				tools.Lunch.Used = true;

				$(o).attr('disabled', true);
				$('#nav-timer-heading').html('Out to lunch');
				$(o).parent().addClass('lunch-off');
				timer.Stop();
				timer.BaseMinutes = 90;
				timer.Start();

				lab.Log.AddEntry(null, '', 'You have enabled out to lunch');
				contentModal.Open("full", "", "logout/out-to-lunch.html");
			}
		}
	},
	VNext: {
		Set: function (o, e) {
			if (typeof (e) !== "undefined") {
				if (e.keyCode !== 32) {
					return;
				}
			}
			var useSite = ($(o).text() === 'New');
			
			settings.ToggleMessage(o, useSite, false, e);
			hub.server.vNextSwitchSite(useSite);
		}
	},
	Mobile: {
		Clients: ['iPad', 'iPhone', 'Android'],
		ImMobile: null,
		Agent: null,
		UserAgent: navigator.userAgent,
		Check: function (agent) {
			if (tools.Mobile.ImMobile === null) {
				for (var a = 0; a < tools.Mobile.Clients.length; a++) {
					if (tools.Mobile.UserAgent.indexOf(tools.Mobile.Clients[a]) > -1) {
						tools.Mobile.ImMobile = true;
						tools.Mobile.Agent = tools.Mobile.Clients[a];

						if (typeof (agent) !== "undefined") {
							return tools.Mobile.Clients[a] === agent;
						}
						return true;
					}
				}
			} else {
				if (typeof (agent) !== "undefined") {
					return tools.Mobile.Agent === agent;
				}
				return tools.Mobile.ImMobile;
			}
			return false;
		}
	},
	Password: {
		Toggle: function (completed, e) {
			if (typeof (e) !== "undefined") {
				if (e.keyCode !== 32) {
					return;
				}
			}
			var pp = $('#password-placeholder'), pcp = $('#password-change-panel');
		
			if (completed) {
				pp.removeClass('hidden');
				pcp.addClass('hidden');
				$('#settings-password-old').val('');
				$('#settings-password-new').val('');
				$('#settings-password-confirm').val('');
				$('#settings-password-response').text('');
			} else {
				pp.addClass('hidden');
				pcp.removeClass('hidden');
				$('#settings-password-old').focus();
			}
		$('#settings-password-response').html('');
		},
		Set: function (btn, e) {

			if (typeof (e) !== "undefined") {
				if (e.keyCode !== 32) {
					return;
				}
			}
			var op = $('#settings-password-old'), np = $('#settings-password-new'), cnp = $('#settings-password-confirm'), b = $(btn);
			if (op.val().length > 0) {
				op.removeClass('input-nok');

				if (np.val().length > 0 && cnp.val().length > 0) {
					if (np.val() === cnp.val()) {
						cnp.removeClass('input-nok');
						np.removeClass('input-nok');
						var newSet = { CurrentPassword: op.val(), NewPassword: np.val(), ConfirmPassword: cnp.val() };
						loader.load('../../handlers/set-password.ashx', 'r=set', newSet, 'POST', true, tools.Password.Response, null);
					} else {
						np.addClass('input-nok');
						cnp.addClass('input-nok').focus();
						b.attr('disabled', false);
						$('#settings-password-response').text('Passwords do not match.');
					}
				} else {
					b.attr('disabled', false);
					np.addClass('input-nok');
					cnp.addClass('input-nok');
					$('#settings-password-response').text('Please enter your new password and confirm your password.');

					if (np.val().length === 0) {
						np.focus();
					} else {
						cnp.focus();
					}

				}


			} else {
				$(btn).attr('disabled', false);
				op.addClass('input-nok').focus();
				$('#settings-password-response').text('Please enter your old password.');
			}
		},
		Response: function (m) {
			var op = $('#settings-password-old'), np = $('#settings-password-new'), cnp = $('#settings-password-confirm');

			if (m === 'Old password is incorrect') {
				op.addClass('input-nok');
			}else if (m === 'Password changed') {
				tools.Password.Toggle(true);
			} else {
				np.addClass('input-nok');
				cnp.addClass('input-nok');
			}

			$('#settings-password-response').html(m);
		}
	},
	Pin: {
		KeyDown: function (o, event) {
			var k = event.keyCode;
			if (k === 8 || k === 16 || k === 9 || k === 46 || (k >= 37 && k <= 40)) {
				return true;
			}

			if (o.value.length < 6) {
				if ((k >= 47 && k <= 57) || (k >= 96 && k <= 105)) {
					return true;
				}
			}
			event.preventDefault();
			return false;
		},
		Set: function () {
			$('#settings-pin-response').text('');
			var oldPin = $('#settings-pin-old').val(), newPin = $('#settings-pin-new').val(), cnPin = $('#settings-pin-confirm').val();
			if (newPin.length === 6 && newPin === cnPin) {
				if (typeof(oldPin) === "undefined" || oldPin.length === 0) {
					hub.server.vNextSetPin(newPin).done(function (d) {
						if (d.length === 3) {
							$('#settings-pin-response').html('Succesfully set your pin, your pin prefix is <strong>' + d + '</strong><br/>This means your entire pin is <strong>' + d + 'XXXXXX</strong> where XXXXXX is your chosen pin.').addClass('pin-ok').removeClass('pin-nok');
						} else {
							$('#settings-pin-response').html('Failed to set your pin, please try again or log a call for assistance.').addClass('input-nok').removeClass('input-ok');
						}
					});
				} else {
					hub.server.vNextChangePin(oldPin, newPin).done(function (d) {
						if (d.length === 3) {
							$('#settings-pin-response').html('Succesfully changed your pin, your pin prefix is <strong>' + d + '</strong><br/>This means your entire pin is <strong>' + d + 'XXXXXX</strong> where XXXXXX is your chosen pin.').addClass('pin-ok').removeClass('pin-nok');
						} else {
							$('#settings-pin-response').html('Failed to change your pin, please confirm your old pin is correct.').addClass('pin-nok').removeClass('pin-ok');
						}
					});
				}
			} else {
				$('#settings-pin-response').text('Please ensure both pins match and are 6 digits.').addClass('pin-nok');
			}
		}
	},
	More: {
		Current : null,
		Open: function (item, w, h, t, e) {

			if (typeof(e) !== "undefined") {
				if (e.keyCode !== 32) {
					return;
				}
				e.preventDefault();
			}

			if (typeof (item) !== "undefined") {
				var width = 300, height = 200;

				if (typeof (w) !== "undefined") {
					width = w;
				}

				if (typeof (h) !== "undefined") {
					height = h;
				}

				if (tools.More.Current !== null) {
					try {
						tools.More.Current.close();
					} catch (x) {
						console.log(x.Message);
					}
				}
				var options = 'width=' + width + ',height=' + height + ',menubar=no,resizable=yes,toolbar=no,location=no,status=no';

				tools.More.Current = window.open('../../vn-more-info.aspx?item=' + item + '&fs=' + settings.Settings.VNextOptions.FontSize + '&hc=' + settings.Settings.VNextOptions.HighContrastMode + '&title=' + t, item, options);
			}
		}
	},
	Timezone: {
		Change:function(o) {
			var timezoneName = $(o).find('option:selected').text(), timezoneOffset = parseInt($(o).val());
			hub.server.settingsSetTimezone(timezoneName, timezoneOffset);
		}
	},
	InIframe: function () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	},
	Token: {
		Get:function() {
			if (tools.Token.Token === null) {
				if ($('#iframe-helper').length > 0) {
					tools.Token.Token = $('#iframe-helper').attr('data-key');
				} else {
					return '';
				}
			}
			return tools.Token.Token;
		},
		Token:null
	},
    Keyboard: {
        Change: function (o) {
            var keyboardLanguage = $(o).find('option:selected').val();
            hub.server.settingsSetKeyboardLanguage(keyboardLanguage);
        }
	},
	Region: {
        Change: function (o) {
            var selectedRegion = $(o).find('option:selected').val();
            hub.server.settingsSetRegionName(selectedRegion);
        }
    }
}


var timer = {
	BaseMinutes: 60,
	TimeStarted: null,
	TimeWhenLastUpdated: null,
	PercetageOfTime: null,
	Timerpath: null,
	TimerTextPath: null,
	Alpha: 0,
	Pi: Math.PI,
	TimerButton: null,
	LabTimer: null,
	Counter: 0,
	MyInterval: null,
	DeveloperMode: false,
    SetDeveloperMode: function (o, event) {

        var state = !timer.DeveloperMode;

        hub.server.deviceSetDeveloperMode(state);

		timer.DeveloperMode = state;

		if (state) {
			timer.Stop();
			$('#nav-timer-heading').text('Developer');
			$('#nav-timer-text').text('~');
		} else {
			timer.Reset();
		}
	},
	Bind: function (state) {
		if (state) {
			$('#lab-nav-group-timer').on('click keyup', timer.Reset);
		} else {
			$('#lab-nav-group-timer').off();
		}
	},
	AccessibilityMode: function (state) {
		if (state) {
            timer.Stop();

            $('#lab-nav-group-timer').attr('role', '');
            $('#lab-nav-group-timer').attr('tabindex', '-1');
            $('#nav-timer-text').text('~');

            if (timer.DeveloperMode) {
                $('#nav-timer-heading').text('Developer');
            } else {
                $('#nav-timer-heading').text('Accessibility');
            }

		} else {

            if (timer.DeveloperMode) {
                $('#nav-timer-heading').text('Developer');
            } else {
                $('#lab-nav-group-timer').attr('role', 'button');
                $('#lab-nav-group-timer').attr('tabindex', '0');
                $('#nav-timer-heading').text('Auto logout');
            }

			timer.Reset();
		}
	},
	Start: function () {
		if (!timer.DeveloperMode && !settings.Settings.VNextOptions.Accessibility) {
			$('#lab-nav-group-timer').removeClass('hidden');
			var d = new Date();
			timer.TimeStarted = d.getTime();
			timer.Bind(true);
			if (timer.LabTimer !== null) {
				clearTimeout(timer.LabTimer);
				timer.LabTimer = null;
			}
			timer.Draw();
			timer.LabTimer = setInterval(timer.Draw, 30000);
        } else if (settings.Settings.VNextOptions.Accessibility) {
            $('#lab-nav-group-timer').attr('role', '');
            $('#lab-nav-group-timer').attr('tabindex', '-1');
			$('#nav-timer-heading').text('Accessibility');
			$('#nav-timer-text').text('~');
		}
	},
	Stop: function () {
		if (timer.LabTimer !== null) {
			clearInterval(timer.LabTimer);
		}
		$('#nav-timer').css('width', '100%');
		timer.Bind(false);
	},
	Reset: function (e) {
        if (!settings.Settings.VNextOptions.Accessibility && !timer.DeveloperMode) {
            if (e && e.type !== 'click') {
                if (e.keyCode !== 32) {
                    return;
                }
            }

            if (timer.BaseMinutes === 90) {
                timer.BaseMinutes = 60;
                $('#lunch-time').attr('checked', false);
            }
            if (timer.Timerpath === null) {
                timer.Timerpath = $('#nav-timer');
            }
            $('#nav-timer-heading').html('Auto logout');
            $('#lab-nav-group-timer').removeClass('timer-2').removeClass('timer-3');
            timer.Timerpath.css('background-color', '');
            timer.Stop();
            timer.Start();

        } else if (!timer.DeveloperMode && settings.Settings.VNextOptions.Accessibility) {
            timer.AccessibilityMode(true);

        } else if (timer.DeveloperMode) {
            $('#nav-timer-heading').html('Developer');
        }
	},
	Draw: function () {
		var d = new Date();
		timer.TimeWhenLastUpdated = d.getTime();

		var timeElapsed = timer.TimeWhenLastUpdated - timer.TimeStarted, timeleft = (timer.BaseMinutes * 60000) - timeElapsed, percent = ((timeleft / 60000) / timer.BaseMinutes) * 100;

		if (timer.Timerpath === null) {
			timer.Timerpath = $('#nav-timer');
		}

		if (timer.TimerTextPath === null) {
			timer.TimerTextPath = $('#nav-timer-text');
		}
        var timeLeftValue = Math.floor(timeleft / 60000);

	    if (timeLeftValue < 0) {
            timeLeftValue = 0;
            percent = 0;
	        settings.Logout();
        }

		timer.TimerTextPath.html(timeLeftValue + ' mins.');
		timer.Timerpath.css('width', percent + '%');

		if (percent > 0 && percent < 15) {
			$('#lab-nav-group-timer').removeClass('timer-2').addClass('timer-3');
			$('#nav-timer-heading').html('You are about to be logged off.');
			lab.Log.AddEntry(null, '', 'You are about to be logged out, please reset the Auto Logout timer by selecting it.');
		} else if (percent > 16 && percent < 25) {
			$('#lab-nav-group-timer').removeClass('timer-3').addClass('timer-2');
			$('#nav-timer-heading').html('Click me to reset.');
			lab.Log.AddEntry(null, '', 'Warning: You are about to be logged out, please reset the Auto Logout timer by selecting it.');
		} else if (percent <= 0 || percent > 100) {
			settings.Logout();
		}
		
		if (timer.Timerpath === null) {
			timer.Timerpath = $('#nav-timer');
		}

		var msg = Math.floor(timeleft / 60000) + ' minutes before auto logout, click to reset';
		if (timer.BaseMinutes === 90) {
			msg += '(out to lunch is on)';
		}

		timer.Timerpath.attr('data-tip', msg).attr('title', msg);
	},
	CheckToReset: function () {
		var timeElapsed = timer.TimeWhenLastUpdated - timer.TimeStarted, timeleft = (timer.BaseMinutes * 60000) - timeElapsed, currentTime = Math.floor(timeleft / 60000);
		if (timer.BaseMinutes < 59 || currentTime < 59) {
			timer.Reset();
		}
	}
}