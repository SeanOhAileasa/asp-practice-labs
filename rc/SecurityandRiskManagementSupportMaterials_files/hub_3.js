var hub = $.connection.practiceLabs;
$.connection.hub.logging = false;

var userSettings = {
    Microsoft: {
        LaunchInWindow: true
    }
};

hub.connection.start().done(function () {
    hub.server.vNextGetSettings(screen.width, screen.height).done(function (d) {
        if (typeof (d) !== "undefined" && d.length > 3) {
            settings.ReceiveVNext(JSON.parse(d));
        } else {
            location.href = window.location.protocol + "//" + window.location.host + "/invalid-session-redirect.html?no-back";
        }
    });

    var ch = $('#content-helper');
    if (ch.length > 0) {
        content.Course.LoadCourses(loadCoursesCallback, ch);
    } else {
        content.Course.TrySelect();
    }
    lab.Log.AddEntry(null, '', "SignalR has connected via " + $.connection.hub.transport.name);
	// PS: Destroy by 30/07/2019
	// tools.KeepAlive.Alive();

    var sessionStorage = new PracticeLabsCommon.SessionStorage();

    sessionStorage.Init();

    hub.server.getDeveloperModeState().done(function(state) {

        if (state) {

            var p = $('#setting-developermode'), btnOn = p.find('button:first');

            p.find('.tb-active:first').removeClass('tb-active').attr('disabled', false);

            p.attr('title', btnOn.attr('title'));

            btnOn.addClass('tb-active').attr('disabled', true);

            timer.DeveloperMode = true;
        }
    });

    //startPerformanceBenchmark();
});

hub.connection.connectionSlow(function () {
    lab.Log.AddEntry(null, '', 'Your connection appears to be a little slow.');
});

hub.connection.reconnecting(function () {
    lab.Log.AddEntry(null, '', 'We are reconnecting to the server, please stand by.');
});

hub.connection.reconnected(function () {
    lab.Log.AddEntry(null, '', 'We have reconnected to the server!');
});

hub.connection.disconnected(function () {
    lab.Log.AddEntry(null, '', 'We are disconnected from the server, please stand by.');
    setTimeout(function () {
        hub.connection.start();
    }, 5000);
});

function loadCoursesCallback(obj) {
    var exerciseIndex = parseInt(obj.data('exercise-index')), moduleIndex = parseInt(obj.data('module-index')), vendor = obj.data('vendor'), vendorId = obj.data('vendor-id'), title = obj.data('title'), ci = content.Course.GetCacheItem(vendor, vendorId);
    var o = $('#nav-titles').find("[data-vendor-id='" + vendorId + "']");
    content.Course.ActiveCacheItem.Course = ci;

    if (moduleIndex > -1) {
        content.Course.ActiveCacheItem.Module = moduleIndex;
        content.Course.LoadCourse(o, vendor, vendorId, title, loadCourseCallback, obj, exerciseIndex);
    } else {
        content.Course.LoadCourse(o, vendor, vendorId, title);
    }
}

function loadCourseCallback(obj) {
    var exerciseIndex = obj.data('exercise-index');
    if (exerciseIndex > -1) {
        content.Navigate.Location = 'exercises';
        content.Course.TrySelect(obj);
        content.Navigate.Location = 'modules';
    }
}

hub.client.updateDevicesStatus = function (d) {
    if (typeof (d) !== "undefined") {
        var device = JSON.parse(d), position = lab.GetPositionFromHostname(device.Hostname), control = $('#control-' + device.Hostname), connectable = '', connect = false, refreshing = false, invisible = false;

        if (typeof lab.Structure.Devices[position].Refreshing !== "undefined" && lab.Structure.Devices[position].Refreshing) {
            lab.Structure.Devices[position].Refreshing = false;
            refreshing = true;
        }

        if (device.State !== 'Busy') {
            $('#section-' + device.Hostname).removeClass('processing');
            
            control.find('svg').removeClass('icon-busy').removeClass('icon-off').removeClass('icon-on').removeClass('icon-suspend');
            if (lab.WaitingCount > 0) {
                lab.WaitingCount--;
                if (lab.WaitingCount === 0) {
                    $('#lab-operations .button').attr('disabled', false).attr('aria-disabled', false);
                }
            }
        }

        for (var prop in device.Capabilities) {
            if (device.Capabilities[prop] !== null) {
                if (device.Capabilities[prop].Name === 'Invisible' && device.Capabilities[prop].Value === 'True') {
                    return;
                }
            }
        }

        if (device.Probe === 0) {
            if (device.State === 'On') {
                connect = true;
            }
        } else {
            for (var p in device.Capabilities) {
                if (device.Capabilities[p] !== null) {
                    if (device.Capabilities[p].Name === 'Connect') {
                        if (device.HasInterface) {
                            connectable = lab.ConnectStates[0];
                        } else {
                            connectable = lab.ConnectStates[1];
                        }
                        connect = true;
                        break;
                    }
                }
            }
        }

        //redraw buttons based on new state
        lab.Draw.Buttons(device, device.Capabilities, position, control.find('.device-detail'));
        
        lab.Draw.Loader.Instances[position].Stop(true, device.State);

        if (device.Vendor !== 0) {
            if (lab.Microsoft.WindowManager.Report(device.Hostname)) {
                connectable = lab.ConnectStates[2];
            }
        }

        switch (device.State) {
        case 'On':
        {
            $('#' + device.Hostname + '-state').text('On');
            control.find('svg').addClass('icon-on');
            break;
        }
        case 'Off':
        {
            $('#' + device.Hostname + '-state').text('Off');
            control.find('svg').addClass('icon-off');
            break;
        }
        case 'Busy':
        {
            $('#' + device.Hostname + '-state').text('Busy');
            break;
        }
        case 'Suspend':
        {
            $('#' + device.Hostname + '-state').text('Suspended');
            control.find('svg').addClass('icon-suspend');
            break;
        }
        default:
        {
            $('#' + device.Hostname + '-state').text('Unknown');
            control.find('svg').addClass('icon-busy');
            break;
        }
        }

        var index = lab.GetPositionFromHostname(device.Hostname);
        lab.Structure.Devices[index].State = device.State;

        if (connect && !refreshing) {
            if (device.Vendor !== 0) {
                lab.Microsoft.OnConnected(position);
            } else {
                hub.server.terminalConnect(position);
            }
        } else if (!connect && refreshing) {
            $('#section-' + device.Hostname).addClass('hidden');
        }


        $('#build-status-' + device.Hostname).text(device.State);

        lab.Log.AddEntry(null, '', device.Hostname + ' has changed state and is now ' + device.State + connectable);
    }
};

hub.client.updateConsoleLinks = function (d, isPersistent) {
    if (typeof (d) !== "undefined") {
        var links = JSON.parse(d);
        if (lab.Structure !== null) {
            if (typeof (lab.Structure.Devices) !== "undefined") {
                if (lab.Structure.Devices.length === links.length) {
                    for (var a = 0; a < links.length; a++) {
                        lab.Structure.Devices[a].LinkConsole = links[a];

                        var consoleButton = $('#console-connect-' + lab.Structure.Devices[a].Hostname);

                        if (consoleButton.data('cantoggle')) {
                            consoleButton.attr('disabled', false).removeClass('hidden');
                        }
                        $('#noconnect-button-' + lab.Structure.Devices[a].Hostname).remove();
                    }
                }
            }

            if (isPersistent && lab.Reset.InProgress) {
                lab.Reset.InProgress = false;
                lab.Reset.Complete();
            }
        }
    }
};

hub.client.releaseLabNotification = function(d) {
    if (typeof(d) !== "undefined") {
        if (d === 0) {
            contentModal.Open('show', '', 'logout/lab-release-final.html');
            lab.Draw.Clear();
        } else {
            $.get('partials/logout/lab-release-warning.html', function(data, status) {
                var p = $(data);
                p.find('.lab-release-warning-time').text(d);
                var c = p.html();
                contentModal.Open('show', c);
            });
        }
    }
};

hub.client.receiveAlert = function (d) {
    if (typeof (d) !== "undefined") {
        lab.Log.AddEntry(null, '', JSON.parse(d).message);
    }
};

hub.client.receiveMajorAlert = function (d) {
    if (typeof (d) !== "undefined") {
        var msg = JSON.parse(d);
        notifications.Add(msg);
        lab.Log.AddEntry(null, '', msg.Message);
    }
};

hub.client.receiveTerminalData = function (d) {
    if (typeof (d) !== "undefined") {
        lab.Cisco.ReceiveData(JSON.parse(d));
    }
};

hub.client.receiveTerminalAlertMessage = function (d) {
    if (typeof (d) !== "undefined") {
        var msg = JSON.parse(d);
        lab.Log.AddEntry(null, '', msg.Message);
        notifications.Add(msg);
    }
};

hub.client.terminalConnected = function (d) {
    if (typeof (d) !== "undefined") {
        lab.Cisco.OnConnected(JSON.parse(d));
    }
};

hub.client.terminalDisconnected = function (d) {
    if (typeof (d) !== "undefined") {
        lab.Cisco.OnDisconnected(JSON.parse(d));
    }
};

hub.client.assessmentUpdateAssessmentItem = function (t, r, err) {
    if (Assessment.PerformanceBasedTest.Active !== null) {
        var o = Assessment.PerformanceBasedTest.Active, device = o.dataset.device, reference = o.dataset.reference, mappingId = o.dataset.id, index = o.dataset.index, error = $(o).parent().find('.sa4a-errormessage-danger'), wrapper = $(o).parent().find('.sa4a-screenshot-container');
        error.addClass('hidden').html('');
        $(o).prop("disabled", false).html('<div></div>Re-evaluate');

        if (r) {
            $(o).removeClass().addClass('btn-sa4a').addClass('hidden');
            if (Assessment.AssessmentSet.TestMode) {
                if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 1) {
                    $(o).addClass('btn-sa4a-pbt');
                } else if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 3) {
                    $(o).addClass('btn-sa4a-cbt');
                }

                Assessment.Btn.Set(o, 'attempted');
                Assessment.Summary.UpdateItem(index, 3, o);
            } else {
                $(o).addClass('btn-sa4a-correct');
                Assessment.Btn.Set(o, 'correct');
                Assessment.Summary.UpdateItem(index, 1, o);
            }
            
            Assessment.AddOrUpdateDataItem(Assessment.PerformanceBasedTest.Index, 'Result', r.toString());
            Assessment.AddOrUpdateDataItem(Assessment.PerformanceBasedTest.Index, 'Attempted', 'true');

            
        } else {
            if (typeof (err) !== "undefined") {
                if (err !== "NONE") {
                    $(o).removeClass().addClass('btn-sa4a');
                    if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 1) {
                        $(o).addClass('btn-sa4a-pbt');
                    } else if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 3) {
                        $(o).addClass('btn-sa4a-cbt');
                    }
                    Assessment.Btn.Set(o, 'notattempted');
                    Assessment.Summary.UpdateItem(index, 0, o);
                    error.removeClass('hidden').html(err);
                } else {
                    $(o).removeClass().addClass('btn-sa4a').addClass('hidden');
                    
                    if (Assessment.AssessmentSet.TestMode) {
                        if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 1) {
                            $(o).addClass('btn-sa4a-pbt');
                        } else if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 3) {
                            $(o).addClass('btn-sa4a-cbt');
                        }

                        Assessment.Btn.Set(o, 'attempted');
                        Assessment.Summary.UpdateItem(index, 3, o);

                    } else {
                        $(o).addClass('btn-sa4a-incorrect');
                        Assessment.Btn.Set(o, 'incorrect');
                        Assessment.Summary.UpdateItem(index, 2, o);
                    }

                    Assessment.AddOrUpdateDataItem(Assessment.PerformanceBasedTest.Index, 'Result', r.toString());
                    Assessment.AddOrUpdateDataItem(Assessment.PerformanceBasedTest.Index, 'Attempted', 'true');

                    
                }
            } else {
                $(o).removeClass().addClass('btn-sa4a').html('<div></div>Re-evaluate');
                if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 1) {
                    $(o).addClass('btn-sa4a-pbt');
                } else if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 3) {
                    $(o).addClass('btn-sa4a-cbt');
                }
                Assessment.Btn.Set(o, 'notattempted');
                Assessment.Summary.UpdateItem(index, 0, o);
                error.removeClass('hidden').html('You failed this evaluation.');
            }
        }

        Assessment.PerformanceBasedTest.Clear();
    }
};

hub.client.companionContentChanged = function(vendor, vendorId, moduleIndex, exerciseIndex) {
    alert(vendor, vendorId, moduleIndex, exerciseIndex);
};

hub.client.contentReRequest = function() {
    alert('content has changed');
};

hub.client.forceLogout = function (rootPage) {
    if (rootPage === "") {
        location.href = window.location.protocol + "//" + window.location.host + "/logout.aspx?r=logout";
    } else {
        var page = JSON.parse(rootPage);
        location.href = window.location.protocol + "//" + window.location.host + "/" + page;
    }
};

hub.client.siteRestarting = function (d) {
    if (typeof (d) !== "undefined") {
        var msg = {
            Message: 'We need to refresh your browser window so that you receive a critical change.',
            Redirect: 'REFRESH',
            RedirectTime: d * 1000
        };
        notifications.Add(msg);
    }
};

hub.client.assessmentRecieveMappingSet = function(s) {
    if (typeof (s) !== "undefined" && s !== 'null') {
        if (s.length > 0) {
            if (Assessment.Mappings.length === 0) {
                var p = JSON.parse(s);
                if (p.Mappings !== null && p.Mappings.length > 0) {
                    Assessment.Mappings = p.Mappings;
                }
                if (p.Title !== null && p.Title.length > 0) {
                    Assessment.AssessmentSet.Title = p.Title;
                }
                if (p.Introduction !== null && p.Introduction.length > 0) {
                    Assessment.AssessmentSet.Introduction = p.Introduction;
                }
                if (p.Outroduction !== null && p.Outroduction.length > 0) {
                    Assessment.AssessmentSet.Outroduction = p.Outroduction;
                }
                if (p.ActiveId !== null && p.ActiveId.length > 0) {
                    Assessment.AssessmentSet.Id = p.ActiveId;
                }
            }
        } else {
            Assessment.Mappings = [];
        }
    }
};

hub.client.authoringReceiveParticles = function(d) {
    if (typeof d !== "undefined" && d !== null && d !== 'null') {
        if (d.length > 0) {
            var data = JSON.parse(d);
            authoring.Particles.ReceiveDataSet(data);
        }
    }
};

hub.client.authoringContinueExecuting = function(id) {
    if (authoring.Warning.InstanceId !== id) {
        if (!authoring.Warning.Acknowledged) {
            authoring.Warning.Acknowledged = true;
            authoring.Warning.InstanceId = id;
            $.get('partials/logout/contentmodal-inprog.html', function(data, status) {
                var p = $(data);
                contentModal.Open('show', p[0].outerHTML);
            });
        }
    }
};

hub.client.receiveVirtualMachineExitCode = function (exitCode, connectionId, device, rawExitCode) {
    if (RDP_ERROR_HTML === null) {
        $.get('partials/support/rdp-exit-code-messages.html', function(html) {
                RDP_ERROR_HTML = $($.parseHTML(html));
            lab.ShowDisconnectMessage(exitCode, connectionId, device, rawExitCode);
            });
    } else {
        lab.ShowDisconnectMessage(exitCode, connectionId, device, rawExitCode);
    }
};

hub.client.receiveVirtualMachineLinkUpdate = function (activeConnectionId, deviceIndex, newLink, type) {
    lab.Structure.Devices[deviceIndex].ActiveConnectionId = activeConnectionId;

    // PL-1756: ML - Adding fix in JS for Missing location Prefix of DC
    var connectLink = newLink.split("https://")[1];

    if (connectLink.startsWith("-")) {

        console.log('Replacing new link location with known Engine Location Id.',
            newLink,
            lab.Structure.EnginesLocationId);

        // We have a problem... replace with LocationId that the browser is aware of.
        newLink = "https://" + lab.Structure.EnginesLocationId + connectLink;
    }

    switch (type) {
    case 0:
    {
        lab.Structure.Devices[deviceIndex].LinkMyrtille = newLink;
        break;
    }
    case 1:
    {
        lab.Structure.Devices[deviceIndex].LinkConsole = newLink;
        break;
    }
    }
};

hub.client.receiveDeviceDrainedReconnectMessage = function (connections) {
    lab.DrainedDeviceReconnect(connections);
};

hub.client.receiveAutoLoginStateToUser = function(index, newState) {
    lab.AutoLoginUpdate(index, newState);
};

hub.client.updateProcessingMessage = function (message, enableClosePanel) {
    if (typeof (message) === "undefined" || message === null || message.length === 0) {
        tools.Loader.Control(false);
    } else {
        tools.Loader.Control(true, message, null, 500, enableClosePanel);
    }
};

hub.client.receiveLabShutdownNotification = function () {
    lab.Draw.Clear();

    var msg = {
        Message: 'Your lab has been shutdown due to inactivity, if this is in error please check your network connection is reliable.'
    };

    lab.Log.AddEntry(null, '', msg.Message);
    notifications.Add(JSON.stringify(msg));
};

function changeCourse() {
    hub.server.vNextChangeContent();
}

function changeModule() {
    hub.server.vNextChangeContent();
}

function changeExercise() {
    hub.server.vNextChangeContent();
}
