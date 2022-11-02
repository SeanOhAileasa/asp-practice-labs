var ticket = {
    ContainsFiles: false,
    Position: 1,
    DocRefs: [],
    Create: {
        Submitted: false,
        Save: function () {
            if ($('#ticketDescription').val().length > 5) {
                $('#ticketDescription').removeClass('inp-no-ok');
                if (!ticket.Create.Submitted) {
                    if (tools.ConfirmInput('email', $('#ticketEmail').val()) && $('#ticketType').val() > -1) {
                        ticket.Create.Submitted = true;
                        $('#ticketSubmit').attr('disabled', true);
                        tools.Loader.Control(true, 'Submitting support ticket, please wait.');
                        var cat = $('#ticketType option:selected').text(),
                            email = $('#ticketEmail').val(),
                            description = $('#ticketDescription').val(),
                            save = $('#ticketSaveOptions').is(':checked'),
                            techDetail = $('#ticketTechnicalDetail').text(); // TODO change this to go and get info from browser
                        hub.server.vNextSupportTicketCreate(cat, email, description, save, techDetail.replace('\n', ''), ticket.ContainsFiles).done(function (d) {
                            tools.Loader.Control(false);
                            $('#v4a-new-ticket-5').addClass('hidden');
                            $('#ticket-main-pre').hide();
                            $('#ticket-response').html('<h2>Successfully created support ticket</h2><p>' + d + '</p><button class="itnew" onclick="ticket.Reset();" type="button" aria-label="Create a new ticket">Create new ticket</button>').removeClass('hidden');
                        }).fail(function () {
                            tools.Loader.Control(false);
                            $('#ticket-response').html('<h2>An error has occurred</h2><p>Sorry, something has gone wrong, please let us know at support@practice-labs.com</p>');
                        });
                    } else {
                        if (!tools.ConfirmInput('email', $('#ticketEmail').val())) {
                            $('#ticket-response').html('<h2>Invalid Email</h2><p>Please check your email address and try again.</p>');
                        } else if ($('#ticketType').val() === -1) {
                            $('#ticket-response').html('<h2>No Category</h2><p>Please select a category to log your call under.</p>');
                        }
                    }
                }
            } else {
                $('#ticketDescription').addClass('input-nok').focus();
                setTimeout(function () {
                    $('#ticketDescription').removeClass('input-nok');
                }, 3000);
            }
        },
        Created: function (d) {
            if (d.Result === 0) {
                practiceLab.Alerting.UserAlert.Show(d.Message);
                var thisTicket = $('#ticketDescription').val();
                if (thisTicket.length > 128) {
                    thisTicket = thisTicket.substring(0, 128) + '...';
                }
                $('#mySupportTickets').append('<p><strong>' + d.Reference + ': Open</strong> <br/>' + thisTicket + "</p>");
                $('#ticketDescription').val('please enter your problem description here');
                $('#newSupportTicket').toggleClass('hidden');
                $('#mySupportTickets').removeClass('hidden');
            } else {
                practiceLab.Alerting.UserAlert.Show(d.Message);
                practiceLab.Support.Ticket.Create.Submitted = false;
                $('#ticketSubmit').attr('disabled', false);
            }
        }
    },
    LocalDetail: false,
    Detail: {
        Obj: null,
        Focus: function () {
            if ($('#ticketDescription').val() === 'please enter your problem description here') {
                $('#ticketDescription').val('');
            }
        }
    },
    ChangeCategory: function () {
        var c = -1;
        $('.helpAssist').hide();
        try {
            c = parseInt($('#ticketType').val(), 10);
        } catch (e) { }
        if (typeof (c) !== "undefined" && c > -1) {
            $('#ticket-body').show();
            switch (c) {
            case 0:
            {
                $('#helpGeneral').show();
                $('#v4a-new-ticket-2-error').html('');
                $('#ticketType').removeClass('input-nok');
                break;
            }
            case 1:
            {
                $('#helpTechnical').show();
                $('#v4a-new-ticket-2-error').html('');
                $('#ticketType').removeClass('input-nok');
                break;
            }
            case 2:
            {
                $('#helpCourseware').show();
                $('#v4a-new-ticket-2-error').html('');
                $('#ticketType').removeClass('input-nok');
                break;
            }
            case 3:
            {
                $('#helpExamPrep').show();
                $('#v4a-new-ticket-2-error').html('');
                $('#ticketType').removeClass('input-nok');
                break;
            }
            }
        } else {
            $('#ticket-body').hide();
        }
    },
    Get: function () {

    },
    Update: function () {

    },
    Close: function () {
        ticket.Position = 1;
        $('#v4a-new-ticket-6').addClass('hidden');
        $('#v4a-new-ticket-1').removeClass('hidden');
    },
    Next: function () {
        var section = $('#v4a-new-ticket-' + ticket.Position);
        section.addClass('hidden');
        ticket.Position++;
        section = $('#v4a-new-ticket-' + ticket.Position);
        section.removeClass('hidden');
    },
    Previous: function () {
        var section = $('#v4a-new-ticket-' + ticket.Position);
        section.addClass('hidden');
        ticket.Position--;
        section = $('#v4a-new-ticket-' + ticket.Position);
        section.removeClass('hidden');
    },
    ConfirmStep2: function () {
        var ticketType = $('#ticketType');
        if (ticketType.val() > -1) {
            ticket.Next();
        } else {
            ticketType.addClass('input-nok').focus();
            $('#v4a-new-ticket-2-error').html('Please select a category.');
        }

        var email = $('#ticketEmail').val();

        if (tools.ConfirmInput('email', email)) {
            $('#ticket-email-btn-next').attr('disabled', false);
        }
    },
    ConfirmStep4: function () {
        if (tools.ConfirmInput('email', $('#ticketEmail').val())) {
            $('#ticketTechnicalDetail-data').html($('#ticketTechnicalDetail').html());

            if (!ticket.LocalDetail) {
                ticket.LocalDetail = true;
                var sw = screen.width, sh = screen.height, adtn = '';

                if (typeof deployJava !== "undefined") {
                    var jv = deployJava.getJREs();
                    if (jv !== null && jv.length > 0) {
                        var maj = jv[0].split('.')[1];
                        var upd = jv[0].split('.')[2].split('_')[1];
                        if (typeof (upd) === "undefined") {
                            upd = jv[0].split('.')[2];
                        }
                        adtn = 'Java:' + maj + '.' + upd + ', ';
                    }
                } else {
                    adtn += 'DeployJava not active<br/>';
                }

                var sockets = true;
                if (typeof (hub.connection.socket) === "undefined") {
                    sockets = false;
                }

                adtn += 'Web Sockets:' + sockets + '<br/>';
                var c = content.Course.ActiveCacheItem;
                if (typeof (c) !== "undefined" && c !== null && c.Course !== null) {
                    if (typeof (c.Course) !== "undefined") {
                        adtn += 'Title:' + c.Course.Title + '<br/>';
                    }
                    if (typeof (c.Module) !== "undefined" && c.Module !== null) {
                        adtn += 'Module:' + c.Course.Modules[c.Module].Title + '<br/>';
                    }
                }

                adtn += 'Accessibility:' + settings.Settings.VNextOptions.Accessibility + '<br/>';
                adtn += 'Popup:' + settings.Settings.VNextOptions.DevicePopup + '<br/>';
                adtn += 'Anchor:' + settings.Settings.VNextOptions.DeviceWindow.AnchorWindow + '<br/>';

                $('#ticketTechnicalDetail-data').append('ScreenWidth:' + sw + ', ScreenHeight:' + sh + ',<br/>' + adtn);
            }
            ticket.Next();
        }
    },
    ToggleUpload: function () {
        if ($('#ticket-images').prop('files').length > 0) {
            $('#ticket-upload-images').removeClass('hidden');
        } else {
            $('#ticket-upload-images').addClass('hidden');
        }
    },
    UploadImages: function () {
        var files = $('#ticket-images'), html = [], error = [];
        if (files.prop('files').length > 0) {
            for (var i = 0; i < files.prop('files').length; i++) {
                var formData = new FormData(), fileData = files.prop('files')[i], name = ticket.GenerateString();
                if (fileData.size < 4194304) {
                    formData.append(name, fileData);
                    if (ticket.CheckImage(fileData['name'])) {
                        ticket.DocRefs.push(name + fileData.name.substr((fileData.name.lastIndexOf('.'))));
                        $.ajax({
                            type: "POST",
                            url: "../../handlers/support-document-upload.ashx",
                            contentType: false,
                            processData: false,
                            data: formData,
                            success: function (d) {
                                if (typeof (d) !== 'undefined') {
                                    if (d.indexOf('Error:') === -1) {
                                        var tia = $('#ticket-images-attached');
                                        if (tia.html().length === 0) {
                                            tia.append('<p> Uploaded: </p><p>' + d + '</p>');
                                            ticket.ContainsFiles = true;
                                        } else {
                                            tia.append('<p>' + d + '</p>');
                                        }
                                    } else {
                                        $('#ticket-images-error').html(d);
                                    }
                                }
                            },
                            error: function (d) {
                                $('#ticket-images-error').html(d);
                            }
                        });
                    } else {
                        $('#ticket-images-error').html('pThe following file is not in the correct format ' + fileData['name'] + '. Please make sure it is one of the following jpg, jpeg, gif, png or bmp.p');
                        return false;
                    }
                } else {
                    $('#ticket-images-error').html('<p>Please ensure the image selected is below 4MB</p>');
                    return false;
                }
            }

            $('#ticket-upload-images').addClass('hidden');
        }
        return true;
    },
    CheckImage: function (file) {
        var extension = file.substr((file.lastIndexOf('.') + 1)).toLowerCase();

        if (extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'png' || extension === 'bmp' || extension === 'pdf') {
            return true;
        } else {
            return false;
        }
    },
    GenerateString: function () {
        var t = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
            t += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return t;
    },
    Reset: function () {
        $('#ticket-response').addClass('hidden');
        $('#ticketSubmit').attr('disabled', false);
        var section = $('#v4a-new-ticket-' + ticket.Position);
        section.addClass('hidden');
        ticket.Position = 1;
        ticket.ContainsFiles = false;
        ticket.Create.Submitted = false;
        $('#ticketType').val('-1');
        $('#ticketDescription').val('');
        section = $('#v4a-new-ticket-' + ticket.Position);
        section.removeClass('hidden');
    }
}