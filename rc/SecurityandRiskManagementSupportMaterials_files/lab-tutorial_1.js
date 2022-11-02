var tutorial = {
    TutWrap: null,
    TutArray: null,
    TutActive: null,
    TutNew: null,
    TutWindow: null,

    LoadTutArray: function() {

        if (tutorial.TutArray === null) {
            $.ajax({
                dataType: 'json',
                url: 'partials/tuts/tutorial.json',
                cache: false,
                type: 'GET',
                success: function(d) { tutorial.SetTutArray(d); }
            });
        }
    },

    SetTutArray: function(d) {
        if (typeof d !== 'undefined' && d !== null) {
            tutorial.TutArray = d.PARTIALS;
        }
        tutorial.ToggleTutContent();
    },

    ShowTutWrap: function() {
        if (tutorial.TutWrap === null) {
            tutorial.TutWrap = $('#tut-wrap');
        }

        tutorial.TutWrap.css('display', '');
    },

    HideTutWrap: function() {
        if (tutorial.TutWrap === null) {
            tutorial.TutWrap = $('#tut-wrap');
        }

        tutorial.TutWrap.css('display', 'none');
    },

    ShowTutContent: function() {

        if (tutorial.TutNew !== null) {

            if (tutorial.TutWindow === null) {
                tutorial.TutWindow = $('#tut-window');
            }

            tutorial.TutWindow.html('').load('partials/tuts/' + tutorial.TutNew + '.html', '', function() {
                tutorial.ShowTutWrap();
                tutorial.TutActive = $('#tut-panel-nav-' + tutorial.TutNew);
            });
        }
    },

    HideTutContent: function() {
        if (tutorial.TutActive !== null) {
            tutorial.TutActive.css('display', 'none');
            tutorial.HideTutWrap();

            if ($('#tut-control-dismiss').is(':checked')) {
                tutorial.UpdateTutorialSettings();
            }
        }
    },
    ExamPromptShown: false,
    ToggleTutContent: function() {

        if (tutorial.TutArray === null) {
            tutorial.LoadTutArray();
            return;
        }

        tutorial.HideTutWrap();
        tutorial.TutNew = null;
        $('#tut-control-dismiss').prop('checked', false);
        
        var location = content.Navigate.Location, s = settings.Settings.VNextOptions.TutorialIds, i = 0;

        if (typeof (location) !== 'undefined') {
            
            if (tutorial.TutArray === null) {
                tutorial.LoadTutArray();
            }
            
            for (i = 0; i < tutorial.TutArray.length; i++) {
                if (tutorial.TutArray[i].Location === "lab") {
                    if (location === "exercises") {
                        if (!(s.indexOf(i) > -1)) {
                            if (typeof (lab.Structure.Devices) !== "undefined" && typeof ($('#tabpanel-titlenavigation').attr('aria-hidden')) !== "undefined") {
                                tutorial.TutNew = tutorial.TutArray[i].Id;
                                tutorial.ShowTutContent();
                                break;
                            }
                        }
                    }
                } else if (tutorial.TutArray[i].Location === location) {
                    if (s.indexOf(i) === -1) {
                        tutorial.TutNew = tutorial.TutArray[i].Id;
                        tutorial.ShowTutContent();
                        break;
                    }
                }
            }

            for (i = 0; i < s.length; i++) {
                if (s[i] === 4) {
                    tutorial.ExamPromptShown = true;
                }
            }

            if (!tutorial.ExamPromptShown && tutorial.DoesUserHaveExamPrep()) {
                $('#modal-actions').hide();
                $('#modal-top-actions').hide();
                dialog.Open('notices/examprepaware.html');
            }
        }
    },
    ShowModalActions: function() {
        $('#modal-actions').show();
        $('#modal-top-actions').show();
    },
    DoesUserHaveExamPrep: function () {
        return $('#tab-main').find('[href = "#tabpanel-testprep"]').length > 0;
    },
    CloseNotice: function (event) {
        if ($('#tut-control-dismiss-ep').is(':checked')) {
            tutorial.TutActive = $('#tut-panel-nav-examprepaware');
            tutorial.UpdateTutorialSettings();
        }

        tutorial.ExamPromptShown = true;
        $('#modal-actions').show();
        $('#modal-top-actions').show();
        dialog.Close(event);
    },
    UpdateTutorialSettings: function() {
        if (tutorial.TutActive !== null) {
            var t = settings.Settings.VNextOptions.TutorialIds, a = tutorial.TutActive.data("tut-id");
            if (t.length === 0) {
                t.push(a);
            } else {
                for (var i = 0; i < t.length; i++) {
                    if (t[i] === a) {
                        return;
                    }
                }
                t.push(a);
            }
            settings.Save();
        }
    }
};