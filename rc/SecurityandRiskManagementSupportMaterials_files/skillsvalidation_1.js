var currentFileType = '';
function pbtDone(fileType) {
    currentFileType = fileType;
    $('#pbt-' + currentFileType + '-response').html('');
    hub.server.pbtGetFile(fileType).done(function (d) { $('#pbt-' + currentFileType + '-response').html(d.join("<br/>")); });
}

var Assessment = {
    AssessmentSet: {
        Title: null,
        Introduction: null,
        Outroduction: null,
        Id: null,
        TestMode: false
    },
    Mappings: [],
    Check: function() {
        if (typeof (Assessment) !== "undefined" && typeof (Assessment.Mappings) !== "undefined") {
            if (Assessment.Mappings.length > 0) {
                Assessment.Draw.Summary();
                Assessment.Draw.Mappings();

                if (Assessment.Summary.HtmlPos !== null) {
                    location.hash = '';
                    location.hash = Assessment.Summary.HtmlPos;
                    Assessment.Summary.HtmlPos = null;
                }

                Assessment.Email.Check();

            }
        }
    },
    Draw: {
        Summary: function() {
            var amo = Assessment.AssessmentSet,
                mso = Assessment.Mappings,
                svitems = [],
                summaryhtml = '<div class=\"sa4a-block\"><div class=\"sa4a-header\"><div class=\"sv-set-title\" tabindex=\"0\">{Title}</div><div class=\"sv-set-icon\"><svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" width=\"26\" height=\"19\" viewBox=\"0 0 26 19\"><defs></defs><title>Assesment Icon</title><polygon fill=\"#FFFFFF\" points=\"12.96 11.3 25 6.21 12.96 1 1 6.21 2.78 6.97 2.78 16.45 4.43 16.45 4.43 7.67 12.96 11.3\"/><path fill=\"#FFFFFF\" d=\"M7,10.59V15.9A9.31,9.31,0,0,0,13,18a9.33,9.33,0,0,0,5.91-2V10.61L13,13.13Z\"/></svg></div></div><div class=\"sa4a-intro\" tabindex=\"0\">{Introduction}</div>{Svitems}<div id=\"sa4a-report-panel\" class=\"sa4a-report-panel hidden\"><p>If you have actioned all of the items, click "Finish" to view your report.</p><a class="report-launch" target="_blank" href="mpl/mpl-lab-report-detail.aspx?id=' + Assessment.AssessmentSet.Id + '">Finish</a></div><div class=\"sa4a-outro\" tabindex=\"0\">{Outro}</div></div>',
                sitem = '<a id=\"{Index}\" class=\"sa4a-summary-svitem\" href=\"#\" onclick=\"Assessment.Summary.MoveTo(this);\" aria-label=\"{ARIALABEL}\"><div class=\"col1\">{Id}.</div><div class=\"col2\">{Reference}</div><div class=\"col3\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\" style=\"width: 22px; height: 22px;\" class=\"sa4a-type-icon-{Svgicon}\" focusable=\"false\"><title>Screenshot</title><g class=\"icon-screenshot\"><path d=\"M5.17,4.66H2.67V3.83h2.5Zm6.67,5a2.49,2.49,0,1,0,2.5,2.49A2.5,2.5,0,0,0,11.83,9.64ZM21,5.49V19H1V5.49H5.94a1.67,1.67,0,0,0,1.39-.74L8.5,3h6.67l1.17,1.75a1.67,1.67,0,0,0,1.39.74ZM5.17,8.81a.83.83,0,1,0-.83.83A.83.83,0,0,0,5.17,8.81ZM16,12.13a4.17,4.17,0,1,0-4.17,4.15A4.16,4.16,0,0,0,16,12.13Z\"/></g><g class=\"icon-text\"><path d=\"M21,18.11V19H17.67v-.89h.7a.26.26,0,0,0,.27-.38l-.39-1.22H16.38L15.9,15.1h1.91l-1.13-3.62-1,3.07L15,12.33l.77-2.22H17.6l2.53,7.57c.09.28.2.43.48.43Zm-5-.89h.83V19H11V17.22h.44a.59.59,0,0,0,.53-.79l-.68-1.88H6.1l-.68,1.88a.59.59,0,0,0,.53.79h.89V19H1V17.22h.36a1.17,1.17,0,0,0,1.1-.83L7,3h3.29l4.59,13.39A1.14,1.14,0,0,0,16,17.22ZM6.93,11.89h3.53L8.58,6.38Z\"/></g><g class=\"icon-check\"><path d=\"M5.75,3.5A2.25,2.25,0,0,0,3.5,5.75v10.5A2.25,2.25,0,0,0,5.75,18.5h10.5a2.25,2.25,0,0,0,2.25-2.25V5.75A2.25,2.25,0,0,0,16.25,3.5ZM20,5.75v10.5A3.75,3.75,0,0,1,16.25,20H5.75A3.75,3.75,0,0,1,2,16.25V5.75A3.75,3.75,0,0,1,5.75,2h10.5A3.75,3.75,0,0,1,20,5.75Z\"/></g><g class=\"icon-pbt\"><path d=\"M 10 8.85 H 4.4 V 8 H 10 Z m 0 0.81 H 4.4 v 0.81 H 10 Z m 0 1.62 H 4.4 v 0.81 H 10 Z M 7.47 12.89 H 4.4 v 0.81 H 7.47 Z m 9.24 -3.18 c -0.51 -0.35 -0.44 -0.26 -0.63 -0.84 a 0.6 0.6 0 0 0 -0.57 -0.4 h 0 c -0.62 0 -0.52 0 -1 -0.32 a 0.62 0.62 0 0 0 -0.71 0 c -0.51 0.36 -0.4 0.32 -1 0.32 h 0 a 0.6 0.6 0 0 0 -0.57 0.4 c -0.19 0.57 -0.13 0.49 -0.63 0.84 a 0.57 0.57 0 0 0 -0.25 0.47 l 0 0.18 c 0.2 0.57 0.2 0.46 0 1 l 0 0.18 a 0.57 0.57 0 0 0 0.25 0.47 c 0.51 0.35 0.44 0.26 0.63 0.84 a 0.6 0.6 0 0 0 0.57 0.4 h 0 c 0.62 0 0.52 0 1 0.32 a 0.6 0.6 0 0 0 0.35 0.11 a 0.61 0.61 0 0 0 0.35 -0.11 c 0.51 -0.35 0.4 -0.32 1 -0.32 h 0 a 0.6 0.6 0 0 0 0.57 -0.4 c 0.19 -0.57 0.12 -0.48 0.63 -0.84 a 0.57 0.57 0 0 0 0.25 -0.47 l 0 -0.18 c -0.2 -0.57 -0.19 -0.46 0 -1 l 0 -0.18 A 0.57 0.57 0 0 0 16.71 9.71 Z m -2.58 2.58 a 1.41 1.41 0 1 1 1.41 -1.41 A 1.41 1.41 0 0 1 14.13 12.29 Z m 1 2.23 h 1 v 5.66 l -2 -1.21 l -2 1.21 V 14.51 h 1 a 1.56 1.56 0 0 0 1 0.4 A 1.49 1.49 0 0 0 15.13 14.51 Z M 1 4 V 18 H 9.89 V 16.38 H 2.62 V 5.62 H 19.38 V 16.38 H 17.77 V 18 H 21 V 4 Z\"/></g><g xmlns=\"http://www.w3.org/2000/svg\" class=\"icon-code\"><path d=\"M 21 10.11 v 1.78 l -6.67 3.29 V 13.32 L 19 11 l -4.7 -2.33 V 6.82 Z M 7.67 13.32 L 3 11 l 4.7 -2.33 V 6.82 L 1 10.11 v 1.78 l 6.67 3.29 Z m 5.87 -9 H 11.81 L 8.47 17.67 h 1.73 Z\"/></g></svg></div><div class=\"col4\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 22\" style=\"width: 22px; height: 22px;\" class=\"sa4a-prog-icon-{completion}\" focusable=\"false\"><title>sa4a-prog-icon-22x22</title><g class=\"sa4a-prog-done\"><path d=\"M11,1A10,10,0,1,0,21,11,10,10,0,0,0,11,1ZM9,16,4.52,11.67l1.4-1.43L9,13.19l7-7.19,1.42,1.42Z\"/></g><g class=\"sa4a-prog-undone\"><path d=\"M20.86,9.31A10,10,0,1,0,9.31,20.86,10,10,0,0,0,20.86,9.31ZM17,11.85H5V10.15H17Z\"/></g><g class=\"sa4a-prog-wrong\"><path d=\"M11,1A10,10,0,1,0,21,11,10,10,0,0,0,11,1Zm3.83,15L11,12.17,7.21,16,6,14.83,9.83,11,6,7.21,7.17,6,11,9.82,14.78,6,16,7.17,12.17,11,16,14.78Z\"/></g><g xmlns=\"http://www.w3.org/2000/svg\" class=\"sa4a-prog-attempted\">    <path d=\"M 20.46 11 a 2 2 0 0 1 -0.35 -2.32 a 1.95 1.95 0 0 0 -1.28 -2.82 a 1.94 1.94 0 0 1 -1.45 -1.74 a 2 2 0 0 0 -2.62 -1.68 a 1.93 1.93 0 0 1 -2.2 -0.65 a 1.93 1.93 0 0 0 -3.08 0 a 1.92 1.92 0 0 1 -2.2 0.65 A 2 2 0 0 0 4.64 4.09 A 1.94 1.94 0 0 1 3.17 5.83 A 1.92 1.92 0 0 0 1.91 8.64 A 2 2 0 0 1 1.55 11 A 2 2 0 0 0 2 14 a 1.94 1.94 0 0 1 0.91 2.1 a 1.95 1.95 0 0 0 2 2.34 a 1.94 1.94 0 0 1 1.93 1.25 a 1.93 1.93 0 0 0 3 0.91 a 1.93 1.93 0 0 1 2.29 0 a 1.94 1.94 0 0 0 3 -0.87 A 1.94 1.94 0 0 1 17 18.5 a 1.95 1.95 0 0 0 2 -2.34 a 2 2 0 0 1 0.91 -2.1 a 2 2 0 0 0 0.55 -3.1 Z M 10 15.49 L 6.21 11.87 l 1.55 -1.56 l 2.2 2.1 l 4.69 -4.89 l 1.55 1.56 Z\" /></g></svg></div></a>';

            if (typeof (amo) !== 'undefined' && typeof (mso) !== 'undefined') {
                var allCompleted = false;
                if (mso.length > 0) {

                    for (var i = 0; i < mso.length; i++) {
                        var clone = sitem, arialabel = "";

                        arialabel += "Question " + (i + 1) + ". " + mso[i].Data[1].Value + ". ";
                        if (mso[i].Type === 0) {
                            clone = clone.replace('{Id}', i + 1).replace('{Reference}', mso[i].Data[1].Value).replace('{Svgicon}', 'screenshot').replace('{Index}', 'svitem_' + i);
                            arialabel += "Screenshot item";
                        } else if (mso[i].Type === 1) {
                            clone = clone.replace('{Id}', i + 1).replace('{Reference}', mso[i].Data[1].Value).replace('{Svgicon}', 'pbt').replace('{Index}', 'svitem_' + i);
                            arialabel += "Performance based test";
                        } else if (mso[i].Type === 2) {
                            clone = clone.replace('{Id}', i + 1).replace('{Reference}', mso[i].Data[1].Value).replace('{Svgicon}', 'text').replace('{Index}', 'svitem_' + i);
                            arialabel += "Text question";
                        } else if (mso[i].Type === 3) {
                            clone = clone.replace('{Id}', i + 1).replace('{Reference}', mso[i].Data[1].Value).replace('{Svgicon}', 'code').replace('{Index}', 'svitem_' + i);
                            arialabel += "Code based test";
                        }
                        allCompleted = true;
                        var notFound = true;
                        for (var a = 0; a < Assessment.Mappings[i].Data.length; a++) {
                            notFound = true;
                            if (mso[i].Type === 0 || mso[i].Type === 2) {

                                if (Assessment.Mappings[i].Data[a].Name === 'Answer' || Assessment.Mappings[i].Data[a].Name === 'ImgSource') {
                                    if (Assessment.Mappings[i].Data[a].Value.length > 0) {
                                        if (Assessment.Mappings[i].Data[a].Name === 'Answer') {
                                            for (var p = 0; p < Assessment.Mappings[i].Data.length; p++) {
                                                if (Assessment.Mappings[i].Data[p].Name === 'Type') {
                                                    if (Assessment.Mappings[i].Data[p].Value === '0') {

                                                        for (var k = 0; k < Assessment.Mappings[i].Data.length; k++) {
                                                            if (Assessment.Mappings[i].Data[k].Name === 'Result') {
                                                                switch (Assessment.Mappings[i].Data[k].Value.toLowerCase()) {
                                                                    case 'true':
                                                                        {
                                                                            if (Assessment.AssessmentSet.TestMode) {
                                                                                clone = clone.replace('{completion}', 'attempted');
                                                                                arialabel += "Attempted";
                                                                            } else {
                                                                                clone = clone.replace('{completion}', 'done');
                                                                                arialabel += "Completed";
                                                                            }


                                                                            break;
                                                                        }
                                                                    case 'false':
                                                                        {

                                                                            if (Assessment.AssessmentSet.TestMode) {
                                                                                clone = clone.replace('{completion}', 'attempted');
                                                                                arialabel += "Attempted";
                                                                            } else {
                                                                                clone = clone.replace('{completion}', 'wrong');
                                                                                arialabel += "Incorrect";
                                                                            }

                                                                            break;
                                                                        }
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        clone = clone.replace('{completion}', 'attempted');
                                                        arialabel += "Attempted";
                                                    }
                                                }
                                            }
                                        } else {
                                            clone = clone.replace('{completion}', 'attempted');
                                            arialabel += "Attempted";
                                        }

                                    } else {
                                        clone = clone.replace('{completion}', 'notdone');
                                        arialabel += " Not completed";
                                        allCompleted = false;
                                    }
                                    break;
                                }
                            } else if (mso[i].Type === 1) {
                                if (Assessment.Mappings[i].Data[a].Name === 'Attempted') {


                                    if (Assessment.Mappings[i].Data[a].Value === 'true') {


                                        for (var b = 0; b < Assessment.Mappings[i].Data.length; b++) {

                                            if (Assessment.Mappings[i].Data[b].Name === 'Result') {

                                                switch (Assessment.Mappings[i].Data[b].Value.toLowerCase()) {
                                                case 'true':
                                                {
                                                    if (Assessment.AssessmentSet.TestMode) {
                                                        clone = clone.replace('{completion}', 'attempted');
                                                        arialabel += "Attempted";
                                                    } else {
                                                        clone = clone.replace('{completion}', 'done');
                                                        arialabel += "Completed";
                                                    }
                                                    break;
                                                }
                                                case 'false':
                                                {
                                                    if (Assessment.AssessmentSet.TestMode) {
                                                        clone = clone.replace('{completion}', 'attempted');
                                                        arialabel += "Attempted";
                                                    } else {
                                                        clone = clone.replace('{completion}', 'wrong');
                                                        arialabel += " Incorrect evaluation.";
                                                        allCompleted = false;
                                                    }
                                                    break;
                                                }
                                                default:
                                                {

                                                    clone = clone.replace('{completion}', 'notdone');
                                                    arialabel += " Not completed";
                                                    allCompleted = false;
                                                    break;
                                                }

                                                }
                                                notFound = false;
                                            }
                                        }
                                    }
                                    break;
                                }

                                if ((Assessment.Mappings[i].Data.length - 1) === a && notFound) {
                                    clone = clone.replace('{completion}', 'notdone');
                                    arialabel += " Not completed";
                                    allCompleted = false;
                                    break;
                                }

                            }
                            if (mso[i].Type === 3) {

                                for (var c = 0; c < Assessment.Mappings[i].Data.length; c++) {

                                    if (Assessment.Mappings[i].Data[c].Name === 'Result') {

                                        switch (Assessment.Mappings[i].Data[c].Value.toLowerCase()) {
                                        case 'true':
                                        {
                                            if (Assessment.AssessmentSet.TestMode) {
                                                clone = clone.replace('{completion}', 'attempted');
                                                arialabel += "Attempted";
                                            } else {
                                                clone = clone.replace('{completion}', 'done');
                                                arialabel += "Completed";
                                                break;
                                            }
                                        }
                                        case 'false':
                                        {
                                            if (Assessment.AssessmentSet.TestMode) {
                                                clone = clone.replace('{completion}', 'attempted');
                                                arialabel += "Attempted";
                                            } else {
                                                clone = clone.replace('{completion}', 'wrong');
                                                arialabel += " Incorrect evaluation.";
                                                allCompleted = false;
                                                break;
                                            }
                                        }
                                        default:
                                        {
                                            clone = clone.replace('{completion}', 'notdone');
                                            arialabel += " Not completed";
                                            allCompleted = false;
                                            break;
                                        }
                                        }
                                        notFound = false;
                                    }
                                }

                                if ((Assessment.Mappings[i].Data.length - 1) === a && notFound) {
                                    clone = clone.replace('{completion}', 'notdone');
                                    arialabel += " Not completed";
                                    allCompleted = false;
                                    break;
                                }

                            }
                        }

                        clone = clone.replace('{ARIALABEL}', arialabel);

                        svitems.push(clone);
                    }
                }

                if (amo.Id !== null && amo.Introduction !== null && svitems.length > 0 && amo.Outroduction !== null) {
                    var s = svitems.join('');
                    summaryhtml = summaryhtml.replace('{Title}', amo.Title).replace('{Id}', amo.Id).replace('{Introduction}', amo.Introduction).replace('{Svitems}', s).replace('{Outro}', amo.Outroduction);
                    $('#exercise-content').prepend(summaryhtml);

                    if (allCompleted) {
                        $('#sa4a-report-panel').removeClass('hidden');
                    }
                }
            }
        },
        Mappings: function() {
            if (Assessment.Mappings.length > 0) {
                var m = 0, cId, eId = content.Selected.Exercise, a = 0, btn = '', summaryObject, pos, id;

                if (typeof (eId) !== 'undefined') {
                    var count = 1;
                    for (m; m < Assessment.Mappings.length; m++) {
                        if (Assessment.Mappings[m].AssessmentHtmlV4A !== null) {
                            if (Assessment.Mappings[m].Exercise === eId) {
                                cId = $('#' + Assessment.Mappings[m].Position);

                                if (typeof (cId) !== 'undefined') {

                                    cId.after(Assessment.Mappings[m].AssessmentHtmlV4A);
                                    var ex = $('#exercise-content').find('#' + Assessment.Mappings[m].HtmlId);
                                    pos = m + 1;
                                    ex.find('.sa4a-question-index').html(pos);
                                    if (Assessment.Mappings[m].Type === 0) {

                                        if (typeof (ex) !== 'undefined' && ex.length > 0) {
                                            btn = ex.find('.btn-sa4a');
                                            summaryObject = ex.find('.sa4a-itemsummary-number');
                                            if (typeof (summaryObject) !== 'undefined' && summaryObject.length > 0) {

                                                summaryObject.html(summaryObject.html().replace('{Position}', pos).replace('{Maximum}', Assessment.Mappings.length));
                                            }

                                            if (typeof (btn) !== 'undefined' && btn.length > 0) {
                                                btn.attr('data-id', Assessment.Mappings[m].Id).attr('data-index', m);
                                            }
                                        }

                                        for (a = 0; a < Assessment.Mappings[m].Data.length; a++) {
                                            if (Assessment.Mappings[m].Data[a].Name === 'ImgSource' && Assessment.Mappings[m].Data[a].Value.length > 0) {
                                                if (ex.length > 0) {
                                                    ex.find('.sa4a-screenshot-container').html('<a href="../' + Assessment.Mappings[m].Data[a].Value + '" target="_blank"><img src="../' + Assessment.Mappings[m].Data[a].Value + '" /></a>');
                                                    if (btn.length > 0) {
                                                        btn.html('<div></div>Retake screenshot');
                                                        btn.removeClass().addClass('btn-sa4a').addClass('btn-sa4a-screenshot').addClass('hidden');
                                                        Assessment.Remove.Busy(btn[0]);
                                                        Assessment.Btn.Set(btn[0], 'attempted');
                                                        Assessment.Summary.UpdateItem(m, 3, btn[0]);

                                                    }
                                                }
                                                break;
                                            }
                                        }

                                    } else if (Assessment.Mappings[m].Type === 1) {
                                        if (typeof (ex) !== 'undefined' && ex.length > 0) {
                                            btn = ex.find('.btn-sa4a');
                                            var found = false;
                                            for (a = 0; a < Assessment.Mappings[m].Data.length; a++) {
                                                summaryObject = ex.find('.sa4a-itemsummary-number');
                                                if (typeof (summaryObject) !== 'undefined' && summaryObject.length > 0) {
                                                    summaryObject.html(summaryObject.html().replace('{Position}', pos).replace('{Maximum}', Assessment.Mappings.length));
                                                }
                                                if (typeof (btn) !== 'undefined' && btn.length > 0) {
                                                    btn.attr('data-id', Assessment.Mappings[m].Id).attr('data-index', m);
                                                }


                                                if (Assessment.Mappings[m].Data[a].Name === 'Attempted' && Assessment.Mappings[m].Data[a].Value === 'true') {
                                                    for (var b = 0; b < Assessment.Mappings[m].Data.length; b++) {
                                                        if (Assessment.Mappings[m].Data[b].Name === 'Result') {
                                                            found = true;
                                                            btn.html('<div></div>Re-evaluate').addClass('hidden');
                                                            switch (Assessment.Mappings[m].Data[b].Value.toLowerCase()) {
                                                            case 'true':
                                                            {
                                                                if (Assessment.AssessmentSet.TestMode) {
                                                                    btn.addClass('btn-sa4a-pbt');
                                                                    Assessment.Btn.Set(btn[0], 'attempted');
                                                                    Assessment.Summary.UpdateItem(m, 3, btn[0]);
                                                                } else {
                                                                    btn.addClass('btn-sa4a-correct');
                                                                    Assessment.Btn.Set(btn[0], 'correct');
                                                                    Assessment.Summary.UpdateItem(m, 1, btn[0]);
                                                                }


                                                                break;
                                                            }
                                                            case 'false':
                                                            {

                                                                if (Assessment.AssessmentSet.TestMode) {
                                                                    btn.addClass('btn-sa4a-pbt');
                                                                    Assessment.Btn.Set(btn[0], 'attempted');
                                                                    Assessment.Summary.UpdateItem(m, 3, btn[0]);
                                                                } else {
                                                                    btn.addClass('btn-sa4a-incorrect');
                                                                    Assessment.Btn.Set(btn[0], 'incorrect');
                                                                    Assessment.Summary.UpdateItem(m, 2, btn[0]);
                                                                }

                                                                break;
                                                            }
                                                            }
                                                            break;
                                                        }
                                                    }
                                                }

                                                if (found) {
                                                    count = 1;
                                                    break;
                                                }

                                                if ((Assessment.Mappings[m].Data.length) === count) {
                                                    btn.removeClass('btn-sa4a-correct').removeClass('btn-sa4a-busy').addClass('btn-sa4a-pbt');
                                                    Assessment.Btn.Set(btn[0], 'notattempted');
                                                    count = 1;
                                                    break;
                                                }
                                                count++;


                                            }
                                        }

                                    }
                                    else if (Assessment.Mappings[m].Type === 2) {
                                        btn = ex.find('.btn-sa4a');

                                        for (a = 0; a < Assessment.Mappings[m].Data.length; a++) {

                                            summaryObject = ex.find('.sa4a-itemsummary-number');
                                            if (typeof (summaryObject) !== 'undefined' && summaryObject.length > 0) {
                                                summaryObject.html(summaryObject.html().replace('{Position}', pos).replace('{Maximum}', Assessment.Mappings.length));
                                            }
                                            if (typeof (btn) !== 'undefined' && btn.length > 0) {
                                                btn.attr('data-index', m).attr('data-id', Assessment.Mappings[m].Id);
                                            }

                                            if (Assessment.Mappings[m].Data[a].Name === 'Answer') {
                                                if (Assessment.Mappings[m].Data[a].Value.length > 0) {

                                                    var decodedValue = $('<div/>').html(Assessment.Mappings[m].Data[a].Value).text();
                                                    //var i = ex.find('.sa4a-itemsummary-number').html();
                                                    //ex.find('.sa4a-itemsummary-number').replace('{Maximum}', Assessment.Mappings.length

                                                    var textarea = ex.find('.sa4a-textarea'), textinput = ex.find('.sa4a-textinput');

                                                    btn.addClass('hidden');
                                                    for (var p = 0; p < Assessment.Mappings[m].Data.length; p++) {
                                                        if (Assessment.Mappings[m].Data[p].Name === 'Type') {
                                                            if (Assessment.Mappings[m].Data[p].Value === '0') {
                                                                if (typeof (textinput) !== 'undefined') {
                                                                    ex.find('.sa4a-textinput').val(decodedValue);
                                                                    for (var k = 0; k < Assessment.Mappings[m].Data.length; k++) {
                                                                        if (Assessment.Mappings[m].Data[k].Name === 'Result') {
                                                                            switch (Assessment.Mappings[m].Data[k].Value.toLowerCase()) {
                                                                                case 'true':
                                                                                    {
                                                                                        if (Assessment.AssessmentSet.TestMode) {
                                                                                            Assessment.Btn.Set(btn[0], 'attempted');
                                                                                            Assessment.Summary.UpdateItem(m, 3, btn[0]);
                                                                                        } else {
                                                                                            btn.addClass('btn-sa4a-correct');
                                                                                            Assessment.Btn.Set(btn[0], 'correct');
                                                                                            Assessment.Summary.UpdateItem(m, 1, btn[0]);
                                                                                        }


                                                                                        break;
                                                                                    }
                                                                                case 'false':
                                                                                    {

                                                                                        if (Assessment.AssessmentSet.TestMode) {
                                                                                            Assessment.Btn.Set(btn[0], 'attempted');
                                                                                            Assessment.Summary.UpdateItem(m, 3, btn[0]);
                                                                                        } else {
                                                                                            Assessment.Btn.Set(btn[0], 'incorrect');
                                                                                            Assessment.Summary.UpdateItem(m, 2, btn[0]);
                                                                                        }

                                                                                        break;
                                                                                    }
                                                                            }
                                                                        }
                                                                    }
                                                                }

                                                                ex.find('.btn-sa4a').html('<div></div>Update Answer');
                                                            } else {
                                                                if (typeof (textarea) !== 'undefined') {
                                                                    ex.find('.sa4a-textarea').val(decodedValue);
                                                                    Assessment.Btn.Set(btn[0], 'attempted');
                                                                    Assessment.Summary.UpdateItem(m, 3, btn[0]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else if (Assessment.Mappings[m].Type === 3) {
                                        btn = ex.find('.btn-sa4a');
                                        var foundCbt = false;

                                        for (a = 0; a < Assessment.Mappings[m].Data.length; a++) {
                                            summaryObject = ex.find('.sa4a-itemsummary-number');
                                            if (typeof (summaryObject) !== 'undefined' && summaryObject.length > 0) {
                                                summaryObject.html(summaryObject.html().replace('{Position}', pos).replace('{Maximum}', Assessment.Mappings.length));
                                            }
                                            if (typeof (btn) !== 'undefined' && btn.length > 0) {
                                                btn.attr('data-id', Assessment.Mappings[m].Id).attr('data-index', m);
                                            }


                                            for (var c = 0; c < Assessment.Mappings[m].Data.length; c++) {
                                                if (Assessment.Mappings[m].Data[c].Name === 'Result') {
                                                    foundCbt = true;
                                                    btn.html('<div></div>Re-evaluate').addClass('hidden');
                                                    switch (Assessment.Mappings[m].Data[c].Value.toLowerCase()) {
                                                    case 'true':
                                                    {
                                                        if (Assessment.AssessmentSet.TestMode) {
                                                            btn.addClass('btn-sa4a-pbt');
                                                            Assessment.Btn.Set(btn[0], 'attempted');
                                                            Assessment.Summary.UpdateItem(m, 3, btn[0]);
                                                        } else {
                                                            btn.addClass('btn-sa4a-correct');
                                                            Assessment.Btn.Set(btn[0], 'correct');
                                                            Assessment.Summary.UpdateItem(m, 1, btn[0]);
                                                        }


                                                        break;
                                                    }
                                                    case 'false':
                                                    {

                                                        if (Assessment.AssessmentSet.TestMode) {
                                                            btn.addClass('btn-sa4a-pbt');
                                                            Assessment.Btn.Set(btn[0], 'attempted');
                                                            Assessment.Summary.UpdateItem(m, 3, btn[0]);
                                                        } else {
                                                            btn.addClass('btn-sa4a-incorrect');
                                                            Assessment.Btn.Set(btn[0], 'incorrect');
                                                            Assessment.Summary.UpdateItem(m, 2, btn[0]);
                                                        }

                                                        break;
                                                    }
                                                    }
                                                }

                                                if (foundCbt) {
                                                    count = 1;
                                                    break;
                                                }

                                                if ((Assessment.Mappings[m].Data.length) === count) {
                                                    btn.removeClass('btn-sa4a-correct').removeClass('btn-sa4a-busy').addClass('btn-sa4a-cbt');
                                                    Assessment.Btn.Set(btn[0], 'notattempted');
                                                    count = 1;
                                                    break;
                                                }
                                                count++;


                                            }

                                        }
                                    }

                                }

                            }
                        }
                    }

                }
            }
        }
    },
    Question: {
        Answer: function(o, e) {

            if (typeof (e) !== "undefined") {
                if (e.keyCode !== 32) {
                    return;
                }
            }

            //remove reference from question base answer

            var mappingid = o.dataset.id, reference = o.dataset.reference, index = parseInt(o.dataset.index), error = $(o).parent().find('.sa4a-errormessage-danger'), answer = $(o).parent().find('.sa4a-questions-answer').val(), a = 0;
            error.addClass('hidden').html('');
            $(o).removeAttr('disabled');
            if (answer.length > 0) {
                Assessment.Set.Busy(o);
                $(o).attr('disabled', 'disabled');
                hub.server.assessmentSubmitAnswer(answer, mappingid).done(function (d) {


                    ////setTimeout(function() {
                    //$(o).removeAttr('disabled');
                    //error.addClass('hidden').html('');
                    //$(o).removeClass('btn-sa4a-busy').addClass('btn-sa4a-text').html('<div></div>Update Answer');

                    //if (d === true) {
                    //    $(o).parent().parent().find('.sa4a-itemsummary-status div:first-child').removeClass('sa4a-itemsummary-status-unactioned').removeClass('sa4a-itemsummary-status-failed').addClass('sa4a-itemsummary-status-actioned').html('Actioned');

                    //    for (a; a < Assessment.Mappings[index].Data.length; a++) {
                    //        if (Assessment.Mappings[index].Data[a].Name === 'Answer') {
                    //            Assessment.Mappings[index].Data[a].Value = answer;
                    //            break;
                    //        }
                    //    }
                    //    Assessment.Summary.UpdateItem(index, 1, o);
                    //} else {
                    //    $(o).removeAttr('disabled');
                    //    error.removeClass('hidden').html('We were unable to find the reference for this question.');
                    //}
                    ////}, 1500);

                    $(o).removeAttr('disabled');
                    if (typeof (d) !== 'undefined') {

                        var obj = JSON.parse(d);

                        if (obj.Item1 === 'true') {
                            //true
                            $(o).removeClass().addClass('btn-sa4a').addClass('hidden');
                            if (Assessment.AssessmentSet.TestMode) {
                                $(o).addClass('btn-sa4a-text');
                                Assessment.Btn.Set(o, 'attempted');
                                Assessment.Summary.UpdateItem(index, 3, o);
                            } else {
                                if ($(o).parent().find('.sa4a-questions-answer').is('input')) {
                                    $(o).addClass('btn-sa4a-correct');
                                    Assessment.Btn.Set(o, 'correct');
                                    Assessment.Summary.UpdateItem(index, 1, o);
                                } else {
                                    $(o).addClass('btn-sa4a-text');
                                    Assessment.Btn.Set(o, 'attempted');
                                    Assessment.Summary.UpdateItem(index, 3, o);
                                }
                            }

                            Assessment.AddOrUpdateDataItem(index, 'Result', obj.Item1);
                            Assessment.AddOrUpdateDataItem(index, 'Attempted', 'true');
                            Assessment.AddOrUpdateDataItem(index, 'Answer', answer);
                        } else {
                            //false
                            if (typeof (obj.Item2) !== "undefined") {
                                if (obj.Item2 !== "NONE") {
                                    //Error
                                    $(o).removeClass().addClass('btn-sa4a');
                                    if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 1) {
                                        $(o).addClass('btn-sa4a-pbt');
                                    } else if (Assessment.Mappings[Assessment.PerformanceBasedTest.Index].Type === 3) {
                                        $(o).addClass('btn-sa4a-cbt');
                                    }
                                    Assessment.Btn.Set(o, 'notattempted');
                                    Assessment.Summary.UpdateItem(index, 0, o);
                                    error.removeClass('hidden').html(obj.Item2);
                                } else {
                                    //Wrong

                                    $(o).removeClass().addClass('btn-sa4a').addClass('hidden');

                                    if (Assessment.AssessmentSet.TestMode) {
                                        $(o).addClass('btn-sa4a-text');
                                        Assessment.Btn.Set(o, 'attempted');
                                        Assessment.Summary.UpdateItem(index, 3, o);

                                    } else {
                                        if ($(o).parent().find('.sa4a-questions-answer').is('input')) {
                                            $(o).addClass('btn-sa4a-incorrect');
                                            Assessment.Btn.Set(o, 'incorrect');
                                            Assessment.Summary.UpdateItem(index, 2, o);
                                        } else {
                                            $(o).addClass('btn-sa4a-text');
                                            Assessment.Btn.Set(o, 'attempted');
                                            Assessment.Summary.UpdateItem(index, 3, o);
                                        }
                                    }

                                    Assessment.AddOrUpdateDataItem(index, 'Result', obj.Item1);
                                    Assessment.AddOrUpdateDataItem(index, 'Attempted', 'true');
                                    Assessment.AddOrUpdateDataItem(index, 'Answer', answer);

                                }
                            } else {
                                //Error occured
                                $(o).removeClass().addClass('btn-sa4a').html('<div></div>Re-evaluate').addClass('btn-sa4a-text');
                                Assessment.Btn.Set(o, 'notattempted');
                                Assessment.Summary.UpdateItem(index, 0, o);
                                error.removeClass('hidden').html('An error occured, please try again.');
                            }
                        }
                    }
                    

                });

            } else {
                $(o).removeAttr('disabled');
                error.removeClass('hidden').html('Please enter an answer before submitting.');
            }
        }
    },
    Image: {
        Active: null,
        Button: null,
        Index: -1,
        Capture: function(o, e) {

            if (typeof (e) !== "undefined") {
                if (e.keyCode !== 32) {
                    return;
                }
            }

            var device = o.dataset.device, reference = o.dataset.reference, mappingId = o.dataset.id, index = o.dataset.index, error = $(o).parent().find('.sa4a-errormessage-danger'), wrapper = $(o).parent().find('.sa4a-screenshot-container');
            error.addClass('hidden').html('');
            $(o).removeAttr('disabled');
            if (device.length > 0) {
                Assessment.Set.Busy(o);
                $(o).attr('disabled', 'disabled');

                hub.server.assessmentImageCapture(device, reference, mappingId).done(function(d) {

                    if (typeof (d) !== 'undefined' && d.length > 0) {
                        $(o).removeAttr('disabled');
                        var s = JSON.parse(d);

                        if (s.length === 2) {

                            var src = '<a href="../' + s[0] + '" target="_blank"><img src="../' + s[0] + '"/></a>';
                            wrapper.html(src);
                            $(o).html('<div></div>Retake screenshot').parent().parent().find('.sa4a-itemsummary-status div:first-child').removeClass('sa4a-itemsummary-status-unactioned').removeClass('sa4a-itemsummary-status-failed').addClass('sa4a-itemsummary-status-actioned').html('Actioned');

                            Assessment.AddOrUpdateDataItem(index, 'ImgSource', s[0]);

                            $(o).removeClass().addClass('btn-sa4a').addClass('btn-sa4a-screenshot').addClass('hidden');
                            Assessment.Remove.Busy(o);
                            Assessment.Btn.Set(o, 'attempted');
                            Assessment.Summary.UpdateItem(index, 3, o);
                        } else {
                            Assessment.Remove.Busy(o);
                            Assessment.Btn.Set(o, 'notattempted');
                            Assessment.Summary.UpdateItem(index, 0, o);
                            error.removeClass('hidden').html(s);
                            $(o).addClass('btn-sa4a-screenshot');
                        }
                    }

                });

            }

        }
    },
    AddOrUpdateDataItem: function (i, d, v) {
        if (Assessment.Mappings.length > i) {
            var data = Assessment.Mappings[i].Data, a = 0, f = false;
            for (a; a < data.length; a++) {
                if (data[a].Name === d) {
                    data[a].Value = v;
                    f = true;
                    break;
                }
            }
            if (!f) {
                data.push({
                    Name: d,
                    Value: v
                });
            }
        }
    },
    PerformanceBasedTest: {
        Active: null,
        TrackId: null,
        Success: null,
        Fail: null,
        Index: -1,
        Clear: function() {
            Assessment.PerformanceBasedTest.Index = -1;
            Assessment.PerformanceBasedTest.Active = null;
            Assessment.PerformanceBasedTest.Success = null;
            Assessment.PerformanceBasedTest.Fail = null;
        },
        Run: function(o, e) {

            if (typeof (e) !== "undefined") {
                if (e.keyCode !== 32) {
                    return;
                }
            }


            if (Assessment.PerformanceBasedTest.Active === null) {
                var device = o.dataset.device, id = o.dataset.asmtid, hostname = o.dataset.hostname, index = o.dataset.index, error = $(o).parent().find('.sa4a-errormessage-danger');
                Assessment.PerformanceBasedTest.Active = o;
                //Clear the error message in the block
                error.addClass('hidden').html('');
                
                //Change the buttons class to show the PBT is running

                Assessment.Set.Busy(o);

                $(o).attr('disabled', 'disabled').html('<div></div> Evaluating...');

                hub.server.assessmentAssessItemId(id, hostname).done(function(d) {
                    if (typeof (d) !== "undefined") {
                        $(o).removeAttr('disabled').html('<div></div>Re-evaluate');
                        var p = JSON.parse(d);
                        if (p.length === 36) {
                            Assessment.PerformanceBasedTest.Index = index;
                            Assessment.PerformanceBasedTest.TrackId = p;

                        } else {
                            Assessment.Remove.Busy(o);
                            $(o).removeClass().addClass('btn-sa4a').addClass('btn-sa4a-pbt');
                            Assessment.Btn.Set(o, 'notattempted');
                            Assessment.Summary.UpdateItem(index, 0, o);
                            error.removeClass('hidden').html('An error occurred please try again.');
                        }
                    } else {
                        Assessment.Remove.Busy(o);
                        $(o).html('').removeClass().addClass('btn-sa4a').addClass('btn-sa4a-pbt');
                        Assessment.Btn.Set(o, 'notattempted');
                        Assessment.Summary.UpdateItem(index, 0, o);
                        error.removeClass('hidden').html('An error occurred please try again.');
                    }
                });
            }
        }

    },
    CodeBaseTest: {
        Run: function (o, e) {

            if (typeof (e) !== "undefined") {
                if (e.keyCode !== 32) {
                    return;
                }
            }

            if (Assessment.PerformanceBasedTest.Active === null) {

                var device = o.dataset.device, id = o.dataset.id, hostname = o.dataset.hostname, index = o.dataset.index, error = $(o).parent().find('.sa4a-errormessage-danger');
                Assessment.PerformanceBasedTest.Active = o;

                error.addClass('hidden').html('');
                $(o).removeAttr('disabled');

                //Change the buttons class to show the PBT is running

                Assessment.Set.Busy(o);

                $(o).attr('disabled', 'disabled').html('<div></div> Evaluating...');

                hub.server.assessmentAssessHtmlCodeItem(id, hostname).done(function(d) {

                    if (typeof (d) !== "undefined") {
                        $(o).removeAttr('disabled');
                        var p = JSON.parse(d);
                        if (p.length === 36) {
                            Assessment.PerformanceBasedTest.Index = index;
                            Assessment.PerformanceBasedTest.TrackId = p;
                        } else {
                            Assessment.Remove.Busy(o);
                            $(o).removeClass().addClass('btn-sa4a').addClass('btn-sa4a-cbt');
                            Assessment.Btn.Set(o, 'notattempted');
                            Assessment.Summary.UpdateItem(index, 0, o);
                            error.removeClass('hidden').html('An error occurred please try again.');
                        }
                    } else {
                        Assessment.Remove.Busy(o);
                        $(o).removeClass().addClass('btn-sa4a');
                        Assessment.Btn.Set(o, 'notattempted');
                        Assessment.Summary.UpdateItem(index, 0, o);
                        error.removeClass('hidden').html('An error occurred please try again.');
                    }

                });
            }
        }
    },
    Set: {
        Busy: function(t) {
            if (typeof (t) !== 'undefined') {
                $(t).removeClass('btn-sa4a-screenshot').removeClass('btn-sa4a-text').removeClass('btn-sa4a-pbt').addClass('btn-sa4a-busy');
            }
        },
        State: function (o, e, state) {
            //To be made.   
        }
    },
    Remove: {
        Busy: function(t) {
            if (typeof (t) !== 'undefined') {
                $(t).removeClass('btn-sa4a-busy').removeAttr('disabled');
            }
        }
    },
    Summary: {
        HtmlPos: null,
        UpdateItem: function(index, type, o) {
            if (typeof (index) !== 'undefined' && typeof (type) !== 'undefined' && typeof (o) !== 'undefined') {
                var question = $('#svitem_' + index).find('.col4').find('svg');
                if (type === 0) {
                    question.removeClass();
                    question.addClass('sa4a-prog-icon-notdone');
                } else if (type === 1) {
                    question.removeClass();
                    question.addClass('sa4a-prog-icon-done');
                } else if (type === 2) {
                    question.removeClass();
                    question.addClass('sa4a-prog-icon-wrong');
                } else if (type === 3) {
                    question.removeClass();
                    question.addClass('sa4a-prog-icon-attempted');
                }


                if ($('.sa4a-prog-icon-done').length >= Assessment.Mappings.length) {
                    $('#sa4a-report-panel').removeClass('hidden');

                }

                Assessment.Summary.CalculateIfCompleted(o);

            }
        },
        MoveTo: function(t) {
            Assessment.Summary.HtmlPos = null;
            if (typeof (t) !== 'undefined') {
                var id = t.getAttribute('id'),
                    index = id.split('_')[1],
                    mapping = Assessment.Mappings[index],
                    htmlId = mapping.HtmlId,
                    exercise = mapping.Exercise,
                    nextBtn = $('#bottom-nav-next');

                if ((nextBtn.attr('data-exercise-index') - 1) === exercise) {
                    location.hash = '';
                    location.hash = htmlId;
                } else {
                    if (Assessment.Summary.HtmlPos === null) {
                        Assessment.Summary.HtmlPos = htmlId;
                        nextBtn.attr('data-exercise-index', exercise);
                        nextBtn.click();
                    }
                }
            }
        },
        ShowReportPreview: function(o) {
            location.hash = '';
            $('#sa4a-report-panel').removeClass('hidden');
            $('#sa4a-report-panel button').focus();
            $('#sa4a-report-detail-inline').remove();
            $(o).parent().parent().after('<div id="sa4a-report-detail-inline" class="sa4a-report-panel-inline"><p>If you have actioned all of the items, click "Finish" to view your report.</p><a class="report-launch" target="_blank" href="mpl/mpl-lab-report-detail.aspx?id=' + Assessment.AssessmentSet.Id + '">Finish</a></div>');

        },
        CalculateIfCompleted: function(o) {

            if (typeof (o) !== 'undefined') {
                var completed = true;

                if (Assessment.Mappings.length > 0) {
                    for (var i = 0; i < Assessment.Mappings.length; i++) {
                        for (var a = 0; a < Assessment.Mappings[i].Data.length; a++) {

                            if (Assessment.Mappings[i].Type === 0) {

                                if (Assessment.Mappings[i].Data[a].Name === 'ImgSource') {
                                    if (Assessment.Mappings[i].Data[a].Value.length === 0) {
                                        completed = false;
                                    }
                                    break;
                                }

                            } else if (Assessment.Mappings[i].Type === 1 || Assessment.Mappings[i].Type ===  3) {
                                if (Assessment.Mappings[i].Data[a].Name === 'Result' || Assessment.Mappings[i].Data[a].Name === 'Attempted') {

                                    if (Assessment.Mappings[i].Data[a].Value.length === 0 || Assessment.Mappings[i].Data[a].Value === 'false') {
                                        completed = false;
                                        break;
                                    }
                                    break;

                                }

                                if ((Assessment.Mappings[i].Data.length - 1) === a) {
                                    completed = false;
                                }
                            } else if (Assessment.Mappings[i].Type === 2) {
                                if (Assessment.Mappings[i].Data[a].Name === 'Answer') {
                                    if (Assessment.Mappings[i].Data[a].Value.length === 0) {
                                        completed = false;
                                    }
                                    break;
                                }
                            }
                        }

                    }
                }

                if (completed || o.dataset.index == (Assessment.Mappings.length - 1)) {
                    Assessment.Summary.ShowReportPreview(o);
                }
            }
        }
    },
    Email: {
        Set: false,
        Check: function() {

            if (Assessment.Email.Set) {
                return false;
            }

            if (Assessment.Mappings.length > 0) {
                return false;
                //Get variables
                var email = $('#email-address').val(),
                    asideMain = $('#aside-main'),
                    overlayHtml = '<div id="sa4a-modal-email" class="content-modal"><div class="content-modal-flexwrap"><div id="email-confirm"><div class="email-confirm-icon"></div><h2>Email confirmation</h2><p>Your email address is required in order to complete Skills validation labs, please enter your email address below:</p><p><strong>Note:</strong> This does not change your username, and is used for reporting purposes only.</p><div class="inputfield-group-row"><label for="sa4a-email-address" class="visuallyhidden">E-mail</label><input id="sa4a-email-address" onkeyup="settings.EmailAddress(this);" type="text" placeholder="Email address" value="" autocomplete="off" tabindex="0"></div><div class="contentmodal-button-row"><button class="contentmodal-btn-cancel" id="skills-email-cancel" tabindex="0" aria-label="Cancel" onclick="Assessment.Email.Cancel();">Cancel</button><button class="contentmodal-btn-proceed" id="skills-email-proceed" tabindex="0" aria-label="Proceed" onclick="Assessment.Email.Continue();" onblur="$(\'#sa4a-email-address\').focus();">Proceed</button></div></div></div></div>';
                //Check if email is empty
                if (typeof (email) !== 'undefined') {
                    if (tools.ConfirmInput('email', email)) {
                        return false;
                    }
                }

                //pump in html to #exercise-content
                if (asideMain.length > 0) {
                    asideMain.prepend(overlayHtml);

                    if (email.length > 0) {
                        if (email !== 'Please enter your email address') {
                            $('#sa4a-email-address').val(email);
                            Assessment.Email.Set = true;
                        }
                    }
                }
                $('#sa4a-email-address').focus();
            }
            return true;
        },
        Continue: function(e) {

            if (typeof (e) !== "undefined") {
                if (e.keyCode !== 32) {
                    return;
                }
            }

            var email = $('#sa4a-email-address').val();
            if (typeof (email) !== 'undefined' && email.length > 0) {
                if (tools.ConfirmInput('email', email)) {
                    $('#sa4a-modal-email').remove();
                    $('#email-address').val(email);
                }
            } else {
                $('#sa4a-email-address').focus();
            }
        },
        Cancel: function(e) {

            if (typeof (e) !== "undefined") {
                if (e.keyCode !== 32) {
                    return;
                }
            }

            settings.Logout();
        }
    },
    Btn: {
        Show: function(o, e) {
            if (typeof (o) !== 'undefined') {
                $(o).parent().prev().removeClass('hidden');
                $(o).parent().remove();
            }
        },
        Set: function(o, state) {
            if (typeof (o) !== 'undefined' && typeof (state) !== 'undefined') {

                switch (state) {
                case 'notattempted':
                {
                    $(o).parent().parent().find('.sa4a-itemsummary-status div:first-child').removeClass().addClass('sa4a-itemsummary-status-unactioned').html('');
                    break;
                }
                case 'attempted':
                {
                    $(o).after('<div class="done-feedback"><div>Attempted</div><a href="#" onclick="Assessment.Btn.Show(this);" onkeydown="Assessment.Btn.Show(this, event);">Re-do</a></div>')
                        .parent().parent().find('.sa4a-itemsummary-status div:first-child').removeClass().addClass('sa4a-itemsummary-status-attempted').html('Attempted');
                    break;
                }
                case 'correct':
                {
                    $(o).after('<div class="done-feedback"><div>Correct</div><a href="#" onclick="Assessment.Btn.Show(this);" onkeydown="Assessment.Btn.Show(this, event);">Re-do</a></div>')
                        .parent().parent().find('.sa4a-itemsummary-status div:first-child').removeClass().addClass('sa4a-itemsummary-status-actioned').html('Correct');
                    break;
                }
                case 'incorrect':
                {
                    $(o).after('<div class="done-feedback"><div>Incorrect</div><a href="#" onclick="Assessment.Btn.Show(this);" onkeydown="Assessment.Btn.Show(this, event);">Re-do</a></div>')
                        .parent().parent().find('.sa4a-itemsummary-status div:first-child').removeClass().addClass('sa4a-itemsummary-status-failed').html('Incorrect');
                    break;
                }
                }
            }
        }
    }
};