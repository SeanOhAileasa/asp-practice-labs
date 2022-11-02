var authoring = {
    Submitted:false,
    Warning: {
        InstanceId:null,
        Acknowledged: false,
        Cancel:function() {
            $('#authoring-modal-cancel').addClass('hidden');
        },
        Finalise: function(remove) {
            if (authoring.Warning.InstanceId !== null) {
                hub.server.authoringFinishOrDeleteDynamicAssessment(remove, authoring.Warning.InstanceId).done(function(reload) {
                    if (reload) {
                        $('#exercise-content .embed-container').parent().remove();
                        $('#exercise-content .html-container').parent().remove();
                        $('#exercise-content .course-rating-block ').parent().remove();
                        $('#exercise-content .labparticle').parent().parent().remove();
                        hub.server.vNextGetAuthoringItems().done(function (d) {
                            if (typeof d !== "undefined" && d !== null && d !== 'null') {
                                if (d.length > 0) {
                                    authoring.Particles.ReceiveDataSet(JSON.parse(d));
                                    authoring.Particles.ContentLoaded();
                                }
                            }
                            contentModal.Close();
                        });
                    } else {
                        contentModal.Close();
                    }
                });
            }
        }
    },
    Import: {
        Id : 1,
        Data: [],
        CachedTemplates: [],
        Load: {
            Initialised: null,
            Templates: function (callback) {
                if (authoring.Import.CachedTemplates.length > 0) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                    return;
                }

                authoring.Import.CachedTemplates = [];

                var deferredLoads = [],
                    basePath = 'partials/skillsvalidation/items/',
                    items = [
                        { template: 'question-checkbox', type: 'QUESTION-CHECKBOX', object: null },
                        { template: 'question-radio', type: 'QUESTION-RADIO', object: null },
                        { template: 'question-input', type: 'QUESTION-INPUT', object: null },
                        { template: 'question-textarea', type: 'QUESTION-TEXTAREA', object: null },
                        { template: 'item-screenshot', type: 'SCREENSHOT', object: null },
                        { template: 'item-summary', type: 'SUMMARY', object: null },
                        { template: 'item-summary-row', type: 'SUMMARY-ROW', object: null },
                        { template: 'item-html-video', type: 'HTML-VIDEO', object: null },
                        { template: 'item-html-frameless', type: 'HTML-VIDEO', object: null },
                        { template: 'item-content-feedback-frame', type: 'CONTENT-FEEDBACKFRAME', object: null },
                        { template: 'item-content-feedback-item', type: 'CONTENT-FEEDBACKITEM', object: null },
                        { template: 'item-email', type: 'EMAIL', object: null },
                        { template: 'item-lab-file', type: 'LAB-FILE', object: null }
                    ];

                $.each(items, function (index) {
                    deferredLoads.push(
                        $.get(basePath + items[index].template + '.html').done(function (data) {
                            items[index].object = data;
                        }));
                });

                $.when.apply($, deferredLoads).done(function () {
                    authoring.Import.CachedTemplates = items;
                    if (typeof callback === "function") {
                        callback();
                    } else {
                        
                    }
                });              
            }
        }
    },
    Submit: function (type, obj) {
        $(obj).attr('disabled', true).prev('button').attr('disabled', true);
        authoring.Submitted = true;
        $('.redo').attr('disabled', true);
        var submitType = parseInt(type);

        $('.lti-report-error').addClass('hidden');
        $('.svitem-button-submit:first').addClass('hidden');
        $('.svitem-confirmation__text').addClass('hidden');
        $('.svitem-button-cross').addClass('hidden');
        $('.svitem-button-tick').addClass('hidden');

        $('.lti-report-processing').removeClass('hidden');

        hub.server.authoringFinishAssessment(type).done(function (d) {

            $('.lti-report-processing').addClass('hidden');

            if (typeof d !== "undefined" && d !== null && d !== 'null' && d.length > 0) {

                if (d[0] === 'FAILED') {
                    $(obj).attr('disabled', false).prev('button').attr('disabled', false);
                    
                    $('.lti-report-error').removeClass('hidden');

                } else {
                    $('.svitem-button-submit:first').attr('disabled', true);

                    switch (submitType) {
                        case 0:
                        {
                            $(obj).next('.svitem_error').html('<p>' + d[0] + '</p><p>You can click <a href="vn-authoring-report.aspx?instanceId=' + d[1] + '" target="_blank">here</a> to view this report now.</p>').removeClass('hidden').addClass('svsummary-feedback');
                            break;
                        }
                        case 1:
                        {
                            $(obj).next('.svitem_error').html('<p>' + d[0] + '</p><p>If your report does not open, you may have popups disabled. You can click <a href="vn-authoring-report.aspx?instanceId=' + d[1] + '" target="_blank">here</a> or alternatively you can view this report in your lab reports.</p>').removeClass('hidden').addClass('svsummary-feedback');
                            window.open('vn-authoring-report.aspx?instanceId=' + d[1], 'report');
                            break;
                        }
                        case 2:
                        {
                            settings.Logout();
                            break;
                        }
                    }
                }
            }
        });
    },
    Feedback: {
        Generate: function (id, nvc, placementWrapper) {
            var template = $(authoring.Import.CachedTemplates[9].object),
                itemTemplate = $(authoring.Import.CachedTemplates[10].object),
                a = 0,
                items = [];

            for (a; a < nvc.Properties.length; a++) {
                if (nvc.Properties[a].Name.indexOf("ITEM") === 0) {
                    items.push(nvc.Properties[a].Value);
                } else {
                    switch (nvc.Properties[a].Name) {
                    case "TITLE":
                    {
                        template.find('h3:first').text(nvc.Properties[a].Value);
                        break;
                    }
                    case "INTRODUCTION":
                    {
                        template.find('p:first').text(nvc.Properties[a].Value);
                        break;
                    }
                    case "OPENFEEDBACKINTRODUCTION":
                    {
                        if (nvc.Properties[a].Value !== null && nvc.Properties[a].Value.length > 0) {
                            var textFeedback = template.find('.stargroup-textarea');
                            textFeedback.removeClass('hidden');
                            textFeedback.find('label:first').text(nvc.Properties[a].Value);
                        }
                        break;
                    }
                    }
                }
            }

            var starContainer = template.find('.star-flex-container:first');
            if (starContainer.length > 0) {
                if (items.length > 0) {
                    var count = 0, itemObjects = [];
                    for (a = 0; a < items.length; a++) {
                        var starItem = $(itemTemplate).clone();
                        var stars = starItem.find('input');
                        var labels = starItem.find('label');
                        
                        stars.each(function (index) {
                            $(this).prop('name', 'ITEM' + count);
                            $(this).attr('id', 'STAR-ITEM' + count + '-' + index);
                        }, count);
                        
                        labels.each(function(index) {
                            $(this).attr('for', 'STAR-ITEM' + count + '-' + index);
                        }, count);

                        starItem.find('legend:first').text(items[a]);
                        starContainer.append(starItem);
                        itemObjects.push(starItem);
                        count++;
                    }
                    authoring.Feedback.Items = itemObjects;
                }
            }

            authoring.Feedback.Object = template;
            authoring.Feedback.Id = id;
            $(placementWrapper).append(template);
            return template;
        },
        Object: null,
        Items: [],
        Id: null,
        Submit: function () {
            var selected = [], a = 0, comment = $('#comments').val();
            for (a; a < authoring.Feedback.Items.length; a++) {
                var v = $('input:radio[name="ITEM' + a + '"]:checked').val();
                if (typeof(v) === "undefined") {
                    v = 5;
                }
                selected.push(v);
            }

            authoring.Feedback.Object.find('button').attr('disabled', true);
            authoring.Feedback.Object.find('.starerrormessage').addClass('hidden');

            hub.server.authoringSubmitFeedback(authoring.Feedback.Id, selected, comment).done(function (success) {
                if (success) {
                    authoring.Feedback.Object.find('.courserating-form:first').addClass('hidden');
                    authoring.Feedback.Object.find('.courserating-feedback:first').removeClass('hidden');
                } else {
                    authoring.Feedback.Object.find('button').attr('disabled', true);
                    authoring.Feedback.Object.find('.starerrormessage').removeClass('hidden');
                }
            });
        }
    },
    Html: {
        Generate: function(nvc, placement, itemIndex, totalObjects, sil, sfi) {
            var type = '',
                subType = '',
                template = null,
                a = 0,
                content = '';

            for (a; a < nvc.Properties.length; a++) {
                switch (nvc.Properties[a].Name) {
                case 'TYPE':
                {
                    type = nvc.Properties[a].Value;
                    break;
                }
                case 'SUBTYPE':
                {
                    subType = nvc.Properties[a].Value;
                    break;
                }
                case "CONTENT":
                {
                    content = nvc.Properties[a].Value;
                    break;
                }
                }
            }

            if (content.length > 0) {
                switch (subType) {
                case 'VIDEO':
                {
                    template = $(authoring.Import.CachedTemplates[7].object);
                    template.append(content);
                    $(placement).append(template);
                    return template;
                }
                case 'GENERICHTML':
                {
                    template = $(authoring.Import.CachedTemplates[8].object);
                    template.append(content);
                    $(placement).append(template);
                    return template;
                }
                }
            }
            return null;
        }
    },
    Particles: {
        Data: [],
        TotalParticles: 0,
        DomData: [],
        SummaryPanel: null,
        HtmlId: null,
        GetType:function(nvc) {
            if (typeof nvc !== "undefined" && nvc !== null && nvc !== 'null' && typeof nvc.Properties !== "undefined") {
                for (var a = 0; a < nvc.Properties.length; a++) {
                    if (nvc.Properties[a].Name === 'TYPE') {
                        return nvc.Properties[a].Value;
                    }
                }
            }
            return '';
        },
        GetNvcItem: function (index, name) {
            var d = authoring.Particles.Data, a, b;
            if (d.length > 0 && d.length > index) {
                for (a = 0; a < d[index].Item2.length; a++) {
                    for (b = 0; b < d[index].Item2[a].Properties.length; b++) {
                        if (d[index].Item2[a].Properties[b].Name === name) {
                            return d[index].Item2[a].Properties[b];
                        }
                    }
                }
            }
            return '';
        },
        GetNvcItemWithIndex:function(index, name) {
            var d = authoring.Particles.Data, a = 0, b, c, rI = 0;

            if (d.length > 0) {
                for (a; a < d.length; a++) {
                    for (b = 0; b < d[a].Item2.length; b++) {
                        if (rI === index) {
                            for (c = 0; c < d[a].Item2[b].Properties.length; c++) {
                                if (d[a].Item2[b].Properties[c].Name === name) {
                                    return d[a].Item2[b].Properties[c];
                                }
                            }
                        }
                        rI++;
                    }
                }
            }
            return '';
        },
        GetSummaryItem:function() {
            var d = authoring.Particles.Data, a = 0, b, c, index = 0;
            if (d.length > 0) {
                for (a; a < d.length; a++) {
                    for (b = 0; b < d[a].Item2.length; b++) {
                        index++;
                        for (c = 0; c < d[a].Item2[b].Properties.length; c++) {
                            if (d[a].Item2[b].Properties[c].Name === 'TYPE' && d[a].Item2[b].Properties[c].Value === 'SUMMARY') {

                                var fragmentIndex = authoring.Particles.GetNvcItemFromProperties(d[a].Item2[b], 'FRAGMENTINDEX');
                                if (fragmentIndex === '') {
                                    fragmentIndex = 0;
                                }

                                return { index: index, object: d[a].Item2[b], fragmentIndex : parseInt(fragmentIndex) };
                            }
                        }
                    }
                }
            }
            return '';
        },
        NavigateTo: function(anchorIndex, targetExercise) {
            authoring.Particles.HtmlId = null;

            var nextBtn = $('#bottom-nav-next'),
                itemName = 'author-item-' + anchorIndex,
                nxtEx = parseInt(nextBtn.attr('data-exercise-index'));
                

            if (!isNaN(nxtEx)) {
                var thisExercise = nxtEx - 1;
                if (targetExercise === thisExercise) {
                    location.hash = '';
                    location.hash = itemName;
                } else {
                    if (authoring.Particles.HtmlId === null) {
                        authoring.Particles.HtmlId = itemName;
                        nextBtn.attr('data-exercise-index', targetExercise);
                        nextBtn.click();
                    }
                }
            } else {
                location.hash = '';
                location.hash = itemName;
            }
        },
        GenerateSummaryForItem: function(itemIndex, nvc) {
            if (typeof nvc !== "undefined" && nvc !== null) {
                var si = $(authoring.Import.CachedTemplates[6].object).clone(),
                    studentsAnswer = authoring.Particles.GetNvcItemFromProperties(nvc, 'STUDENTSANSWER'),
                    exerciseIndex = authoring.Particles.GetNvcItemFromProperties(nvc, 'FRAGMENTINDEX'),
                    itemTitle = authoring.Particles.GetNvcItemFromProperties(nvc, 'TITLE'),
                    particleIndex = authoring.Particles.GetNvcItemFromProperties(nvc, 'PARTICLEINDEX');

                if (itemTitle === '') {
                    itemTitle = 'Action item';
                }

                if (studentsAnswer !== '') {
                    si.removeClass('summaryrow--unactioned').addClass('summaryrow--actioned');
                }

                si.attr('data-particleindex', particleIndex).attr('data-index', itemIndex).attr('data-exercise', exerciseIndex).on('click', function() {
                    authoring.Particles.NavigateTo($(this).data('particleindex'), $(this).data('exercise'));
                });

                si.find('.summaryrow__col2').text(itemIndex + '. ' + itemTitle);

                return si;
            }
            return null;
        },
        GetSummaryItemWithIndex:function(index) {
            var d = authoring.Particles.Data, a = 0, b, rI = 0;
            if (d.length > 0) {
                for (a; a < d.length; a++) {
                    for (b = 0; b < d[a].Item2.length; b++) {
                        if (rI === index) {
                            return d[a].Item2[b].SummaryItem;
                        }
                        rI++;
                    }
                }
            }
            return '';
        },
        IsSummaryInParticle:function(particles) {
            if (typeof particles !== "undefined" && particles !== null && particles.length > 0) {
                var itemCount = 0, a = 0, b;
                for (a; a < particles.length; a++) {
                    for (b = 0; b < particles[a].Item2.length; b++) {
                        itemCount++;
                        var type = authoring.Particles.GetNvcItemFromProperties(particles[a].Item2[b], 'TYPE');
                        if (type !== '' && type === 'SUMMARY') {
                            return itemCount;
                        }
                    }
                }
            }
            return -1;
        },
        GetNvcItemFromProperties : function (nvc, name) {
            if (typeof nvc !== "undefined" && nvc !== null && nvc !== 'null') {
                for (var a = 0; a < nvc.Properties.length; a++) {
                    if (nvc.Properties[a].Name === name) {
                        return nvc.Properties[a].Value;
                    }
                }
            }
            return '';
        },
        GetParticlesInIndex: function (index) {
            var p = authoring.Particles.Data, a = 0, particles = [];
            if (typeof p !== "undefined" && p !== null && p.length > 0) {
                for (a; a < p.length; a++) {
                    var i = authoring.Particles.GetNvcItem(a, 'FRAGMENTINDEX');
                    if (i !== '' && parseInt(i.Value) === index) {
                        particles.push(p[a]);
                    }
                }
            }
            return particles;
        },
        ReceiveDataSet: function (d) {
            if (typeof d !== "undefined" && d !== null && d !== 'null') {
                authoring.Particles.Initialise();
                var pCount = 0, a = 0, b;
                for (a; a < d.length; a++) {
                    for (b = 0; b < d[a].Item2.length; b++) {
                        pCount++;
                    }
                }
                authoring.Particles.TotalParticles = pCount;
                authoring.Particles.Data = d;
            }
        },
        Initialise:function() {
            authoring.Import.Id = 1;
            authoring.Particles.DomData = [];
            authoring.Import.Data = [];
        },
        Render:function() {
            authoring.Warning.Acknowledged = true;
            var atomsInContent = $('#exercise-content .atom-code'),
                atomData = {}, a, b,
                fragmentIndex = content.Selected.Exercise,
                summaryItemLocation = -1,
                sil = -1, sfi = -1;

            var atomKeys = {};
            for (var k = 0; k < authoring.Particles.Data.length; k++) {
                var dId = authoring.Particles.Data[k].Item1;
                if (!atomKeys.hasOwnProperty(dId)) {
                    atomKeys[dId] = null;
                }
            }

            var keyIndex = 0;
            $.each(atomsInContent, function () {
                var atomId = $(this).text();
                if (atomKeys.hasOwnProperty(atomId)) {
                    if (!atomData.hasOwnProperty(atomId)) {
                        atomData[atomId] = [];
                    }
                    atomData[atomId].push({ position: keyIndex, obj: $(this), assigned: false });
                    keyIndex++;
                }
            });

            if (Object.keys(atomData).length > 0) {
                var summary = authoring.Particles.GetSummaryItem(),
                    totalObjects = 0,
                    itemIndex = 0,
                    particles = authoring.Particles.GetParticlesInIndex(fragmentIndex),
                    summaryInParticle = authoring.Particles.IsSummaryInParticle(particles),
                    s = null,
                    itemType = '';

                if (summary !== '') {
                    totalObjects--;
                    sil = summary.index;
                    sfi = summary.fragmentIndex;
                    if (fragmentIndex === summary.fragmentIndex) {
                        summaryItemLocation = summary.index;
                    }
                }

                var nonQuestionableItems = 0;
                for (a = 0; a < authoring.Particles.Data.length; a++) {
                    for (b = 0; b < authoring.Particles.Data[a].Item2.length; b++) {
                        itemType = authoring.Particles.GetNvcItemFromProperties(authoring.Particles.Data[a].Item2[b], 'TYPE');
                        authoring.Particles.Data[a].Item2[b].Properties.push({ Name: 'INPAGEINDEX', Value: (totalObjects + 1) });
                        totalObjects++;
                        if (itemType === 'HTML') {
                            nonQuestionableItems++;
                        }
                    }
                }

                totalObjects = totalObjects - nonQuestionableItems;
                itemType = '';

                for (a = 0; a < particles.length; a++) {
                    var placementWrapper = $('<div>');
                    for (b = 0; b < particles[a].Item2.length; b++) {
                        var o, type = authoring.Particles.GetType(particles[a].Item2[b]), atomId = particles[a].Item1;
                        itemIndex++;
                        switch (type) {
                        case '':
                        {
                            break;
                        }
                        case 'HTML':
                        {
                            o = authoring.Html.Generate(particles[a].Item2[b], placementWrapper, itemIndex, totalObjects, sil, sfi);
                            break;
                        }
                        case 'FEEDBACK':
                        {
                            o = authoring.Feedback.Generate(particles[a].Item1, particles[a].Item2[b], placementWrapper);
                            break;
                        }
                        default:
                        {
                            o = authoring.Particles.Generate(particles[a].Item2[b], placementWrapper, itemIndex, totalObjects, sil, sfi);
                            break;
                        }
                        }

                        if (atomData.hasOwnProperty(atomId)) {
                            for (var i = 0; i < atomData[atomId].length; i++) {
                                if (atomData[atomId][i].position === a) {
                                    $(placementWrapper).insertAfter(atomData[atomId][i].obj);
                                    break;
                                }
                            }
                        }

                        if (itemIndex === summaryInParticle) {
                            if (o !== null) {
                                s = o;
                            }
                        }
                    }
                }

                if (s !== null) {
                    var rows = $(s).find('.svitem__summaryrows'), itemCount = 0, totalCount = 0;
                    for (a = 0; a < authoring.Particles.Data.length; a++) {
                        for (b = 0; b < authoring.Particles.Data[a].Item2.length; b++) {
                            totalCount++;
                            itemType = authoring.Particles.GetType(authoring.Particles.Data[a].Item2[b]);
                            if (itemType !== '' && itemType !== 'HTML' && itemType !== 'FEEDBACK') {
                                itemCount++;
                                if (totalCount !== summaryItemLocation) {
                                    var si = authoring.Particles.GenerateSummaryForItem(itemCount, authoring.Particles.Data[a].Item2[b]);
                                    if (si !== null) {
                                        $(rows).append(si);
                                    }
                                }
                            }
                        }
                    }
                }

                if (authoring.Particles.HtmlId !== null) {
                    location.hash = '';
                    location.hash = authoring.Particles.HtmlId;
                    authoring.Particles.HtmlId = null;
                }
            }
        },
        ContentLoaded: function () {
            authoring.Import.Load.Templates(authoring.Particles.Render);
        },
        GetItemsIndex: function (id) {
            if (authoring.Particles.Data.length > 0) {
                var index = 0, a = 0, ap = authoring.Particles.Data;
                for (a; a < ap.length; a++) {
                    var pi = parseInt(authoring.Particles.GetNvcItemFromProperties(ap[a].Item2[0], 'PARTICLEINDEX')), type = authoring.Particles.GetNvcItemFromProperties(ap[a].Item2[0], 'TYPE');
                    if (type !== 'HTML') {
                        index++;
                    }

                    if (pi === id) {
                        return index;
                    }
                }
                
            }
            return 0;
        },
        GetDeviceNameForScreenshot: function (index) {
            var correctAnswerIndex = authoring.Particles.GetNvcItem(index, 'CORRECT_ANSWER').Value;
            return authoring.Particles.GetNvcItem(index, 'ANSWER_' + correctAnswerIndex).Value;
        },
        Generate: function (nvc, placement, itemIndex, totalObjects, sil, sfi) {
            var id = parseInt(authoring.Particles.GetNvcItemFromProperties(nvc, 'PARTICLEINDEX')),
                inPageIndex = authoring.Particles.GetNvcItemFromProperties(nvc, 'INPAGEINDEX'),
                type = '',
                subType = '',
                isCheckbox = false,
                question = '',
                answers = [],
                a = 0,
                randomize = false,
                template = null,
                domObject = null,
                atomId = '',
                particleId = '',
                questionObject = $('<fieldset>'),
                thisLegend = $('<legend>').addClass('visuallyhidden svitem__instruction').text(),
                feedbackMessage = '',
                attempted = false,
                title = 'Action item',
                correct = false,
                retake = authoring.Particles.GetNvcItemFromProperties(nvc, 'RETAKE') !== 'FALSE',
                onclick = '';
            itemIndex = authoring.Particles.GetItemsIndex(id);
            

            if (inPageIndex !== '') {
                inPageIndex = parseInt(inPageIndex);
            }

            var studentsAnswer = authoring.Particles.GetNvcItemFromProperties(nvc, 'STUDENTSANSWER');

            if (studentsAnswer !== '') {
                attempted = true;
                var studentsResult = authoring.Particles.GetNvcItemFromProperties(nvc, 'RESULT');

                if (studentsResult !== '' && studentsResult === 'TRUE') {
                    correct = true;
                }
            }
            
            questionObject.append(thisLegend);

            for (a; a < nvc.Properties.length; a++) {
                if (nvc.Properties[a].Name.indexOf('ANSWER') !== 0) {
                    switch (nvc.Properties[a].Name) {
                    case 'TYPE':
                    {
                        type = nvc.Properties[a].Value;
                        break;
                    }
                    case 'SUBTYPE':
                    {
                        subType = nvc.Properties[a].Value;
                        switch (subType) {
                        case 'CHECKBOX':
                        {
                            isCheckbox = true;
                            template = authoring.Import.CachedTemplates[0].object;
                            break;
                        }
                        case 'RADIO':
                        {
                            template = authoring.Import.CachedTemplates[1].object;
                            break;
                        }
                        case 'INPUT':
                        {
                            template = authoring.Import.CachedTemplates[2].object;
                            break;
                        }
                        case 'TEXTAREA':
                        {
                            template = authoring.Import.CachedTemplates[3].object;
                            break;
                        }
                        case 'SCREENSHOT':
                        {
                            template = authoring.Import.CachedTemplates[4].object;
                            break;
                        }
                        case 'SUMMARY':
                        {
                            template = authoring.Import.CachedTemplates[5].object;
                            break;
                        }
                        case 'EMAIL':
                        {
                            template = authoring.Import.CachedTemplates[11].object;
                            break;
                        }
                        case 'FILE':
                        {
                            template = authoring.Import.CachedTemplates[12].object;
                            break;
                        }
                        }
                        break;
                    }
                    case 'QUESTION':
                    {
                        question = '<p>' + nvc.Properties[a].Value + '</p>';
                        break;
                    }
                    case 'RANDOMIZE':
                    {
                        if (nvc.Properties[a].Value === 'TRUE') {
                            randomize = true;
                        }
                        break;
                    }
                    case 'FEEDBACK':
                    {
                        feedbackMessage = nvc.Properties[a].Value;
                        break;
                    }
                    case 'ATOM':
                    {
                        atomId = nvc.Properties[a].Value;
                        break;
                    }
                    case 'PARTICLE':
                    {
                        particleId = nvc.Properties[a].Value;
                        break;
                    }
                    case 'TITLE':
                    {
                        title = nvc.Properties[a].Value;
                        break;
                    }
                    case 'SUBMITFUNCTION':
                    {
                        onclick = nvc.Properties[a].Value;
                        break;
                    }
                    case 'EMAIL':
                    {
                        break;
                    }
                    case 'FILE':
                    {
                        break;
                    }
                    }
                } else {
                    answers.push(nvc.Properties[a]);
                }
            }

            var wrapper = $(template), link = $('<a>').attr('id', 'author-item-' + (inPageIndex + 1));
            if (placement !== null) {
                placement.append(link);
            }
            wrapper.find('.labparticle').attr('data-atomid', atomId).attr('data-particleid', particleId);
            
            wrapper.find('.prop-number').text(itemIndex);
            wrapper.find('.prop-title').text(title);
            var summary = wrapper.find('.svitem__summary');
            summary.find('.svitem__itemindex').text(itemIndex);
            summary.find('.svitem__itemcount').text(totalObjects);

            if (sil > -1 && sfi > -1) {
                summary.find('.top').attr('data-index', sil).attr('data-exercise', sfi).on('click', function (event) {
                    event.preventDefault();
                    authoring.Particles.NavigateTo($(this).data('index'), $(this).data('exercise'));
                });
            }

            wrapper.find('.svitem').attr('id', 'SVI_' + id);
            wrapper.find('.svitem__instruction').html(question);
            wrapper.find('.redo-yes').attr('data-index', id);
            wrapper.find('.redo-no').attr('data-index', id);

            var submitBtn = null;
            var retryButton = wrapper.find('.svitem-button-retry');

            if (type === 'SUMMARY') {
                submitBtn = wrapper.find('.svitem-button-tick');
            } else {
                submitBtn = wrapper.find('.svitem__button ');
            }

            if (submitBtn !== null) {
                submitBtn.attr('data-id', 'SV_' + id).attr('data-index', id).attr('data-atomid', atomId).attr('data-particleid', particleId).attr('data-domindex', authoring.Particles.DomData.length);
            }
            if (onclick !== '') {
                submitBtn.attr('onclick', onclick);

                if (retryButton) {
                    retryButton.attr('onclick', onclick);
                }
            }

            switch (type) {
            case 'QUESTION':
            {
                if (subType === 'RADIO' || subType === 'CHECKBOX') {
                    var orderedAnswers = [];
                    if (answers.length > 0) {
                        if (randomize) {
                            var randomAnswers = answers.slice();
                            while (randomAnswers.length > 1) {
                                var rnd = Math.floor((Math.random() * (randomAnswers.length)));
                                orderedAnswers.push({
                                    index: parseInt(randomAnswers[rnd].Name.split('_')[1]),
                                    answer: randomAnswers.splice(rnd, 1)[0]
                                });
                            }
                            orderedAnswers.push({
                                index: parseInt(randomAnswers[0].Name.split('_')[1]),
                                answer: randomAnswers[0]
                            });
                        } else {
                            for (var i = 0; i < answers.length; i++) {
                                orderedAnswers.push({ index: (i + 1), answer: answers[i] });
                            }
                        }

                        if (orderedAnswers.length === answers.length) {
                            for (a = 0; a < orderedAnswers.length; a++) {
                                var thisId = 'SV_' + id + '_' + orderedAnswers[a].index,
                                    thisAnswerWrapper = $('<div>'),
                                    thisAnswerItem = null,
                                    thisAnswerLabel = $('<label>').prop('for', thisId)
                                        .html(orderedAnswers[a].answer.Value),
                                    chk = false;
                                if (isCheckbox) {
                                    if (attempted &&
                                        studentsAnswer !== '' &&
                                        studentsAnswer.indexOf(orderedAnswers[a].index) > -1) {
                                        chk = true;
                                    }
                                    thisAnswerItem =
                                        $('<input>').prop('data-answer', orderedAnswers[a].answer.Name)
                                        .prop('type', 'checkbox').attr('id', thisId).prop('checked', chk);
                                } else {
                                    if (attempted &&
                                        studentsAnswer !== '' &&
                                        parseInt(studentsAnswer) === orderedAnswers[a].index) {
                                        chk = true;
                                    }
                                    thisAnswerItem =
                                        $('<input>').prop('data-answer', orderedAnswers[a].answer.Name)
                                        .prop('type', 'radio').prop('name', 'SV_' + id).attr('id', thisId)
                                        .prop('checked', chk);
                                }
                                thisAnswerWrapper.append(thisAnswerItem).append(thisAnswerLabel);
                                questionObject.append(thisAnswerWrapper);
                            }
                        }
                    }
                } else {
                    switch (subType) {
                    case 'INPUT':
                    {
                        questionObject = $('<input>').prop('type', 'text').attr('id', 'SV_' + id + '_0')
                            .val(studentsAnswer);
                        break;
                    }
                    case 'TEXTAREA':
                    {
                        questionObject = $('<textarea>').attr('id', 'SV_' + id + '_0').val(studentsAnswer);
                        break;
                    }
                    }
                }
                break;
            }
            case 'SCREENSHOT':
            {
                if (attempted && correct) {
                    feedbackMessage = studentsAnswer;
                }
                break;
            }
            case 'SUMMARY':
            {

                break;
            }
            case 'FEEDBACK':
            {
                break;
            }
            case 'EMAIL':
            {
                if (attempted && correct) {
                    feedbackMessage = studentsAnswer;
                }
                break;
            }
            case 'FILE':
            {
                feedbackMessage = authoring.Messages(type, correct);
                break;
            }
            }

            if (!retake) {
                wrapper.find('.redo-wrapper').remove();
            }

            wrapper.find('.svitem__form').append(questionObject);
            
            if (attempted) {
                var resultObject = authoring.Execute.GetResultingData(type, subType, feedbackMessage, correct);
                var resultWrapper = wrapper.find('.svitem__result--wrapper');
                resultWrapper.removeClass('hidden').find('.svitem__result').removeClass('hidden').addClass(resultObject.resultClass).html(resultObject.resultMessage);
                resultWrapper.find('.redo-wrapper').removeClass('hidden');
                summary.find('.status--unactioned').removeClass('status--unactioned').addClass('status--actioned');
                authoring.Execute.DisableFormProperties(wrapper, true);
            }

            domObject = wrapper;
            authoring.Particles.DomData.push({ values: nvc, domObject: domObject, questionObject: questionObject });

            $(placement).append(domObject);
            return domObject;
        }
    },
    Execute: {
        Online: true,
        DisableFormProperties: function (object, disable) {
            object.find('.svitem__form').prop('disabled', disable);
            $(object).find('input').prop('disabled', disable);
            $(object).find('textarea').prop('disabled', disable);
            $(object).find('button').prop('disabled', disable);
            if (disable) {
                $(object).find('.svitem__action').addClass('hidden');
            } else {
                $(object).find('.svitem__action').removeClass('hidden');
            }
        },
        GetResultingData: function (type, subType, feedbackMessage, result) {
            var obj = { resultMessage: 'Incorrect', resultClass: 'result-fail', feedbackMessage: '' };

            if (typeof feedbackMessage !== "undefined" && feedbackMessage !== '') {
                obj.feedbackMessage = feedbackMessage;
            }

            switch (type) {
            case 'QUESTION':
            {
                if (result) {
                    if (subType !== 'TEXTAREA') {
                        obj.resultMessage = 'Correct';
                    } else {
                        obj.resultMessage = 'Response meets required length';
                    }
                    obj.resultClass = 'result-pass';
                } else {
                    if (subType === 'TEXTAREA') {
                        obj.resultMessage = 'Response is not long enough';
                    }
                }
                break;
            }
            case 'SCREENSHOT':
            {
                if (typeof feedbackMessage !== "undefined" &&
                    feedbackMessage !== null &&
                    feedbackMessage.indexOf('.') > -1) {
                    obj.resultMessage = '<img src="../' + feedbackMessage + '"/>';
                    obj.resultClass = 'result-pass';
                } else {
                    obj.resultMessage = '<p>No image taken</p>';
                }
                break;
            }
            case 'EMAIL':
            {
                if (result) {
                    obj.resultClass = 'result-pass';
                    obj.resultMessage = feedbackMessage;
                }
                break;
            }
            case 'FILE':
            {
                obj.resultClass = 'result-pass';
                obj.resultMessage = feedbackMessage;
                break;
            }
            }

            return obj;
        },
        Redo: function (i, yn, event) {
            event.preventDefault();
            if (yn && !authoring.Submitted) {
                var index = $(i).data('index'), obj = $('#SVI_' + index), atomId = obj.data('atomid'), particleId = obj.data('particleid');
                authoring.Execute.DisableFormProperties(obj, false);
                obj.find('.svitem__result--wrapper').addClass('hidden');
                hub.server.authoringRemoveResult(atomId, particleId, index);
                $('.svsummary').find('.summaryrow:nth-child(' + index + ')').removeClass('summaryrow--actioned').addClass('summaryrow--unactioned');
                obj.find('.status--actioned').removeClass('status--actioned').addClass('status--unactioned');
            }
            $(i).parent().addClass('hidden');
            return false;
        },
        Item: function (i) {
            var answer, correct = false, index = parseInt($(i).data('index')), atomId = $(i).data('atomid'), particleId = $(i).data('particleid'), domDataIndex = parseInt($(i).data('domindex'));

            var type = authoring.Particles.GetNvcItemWithIndex(index - 1, 'TYPE').Value,
                subType = authoring.Particles.GetNvcItemWithIndex(index - 1, 'SUBTYPE').Value,
                inputs = null;

            var erroredOnValidation = false,
                formItem = $('#SVI_' + index),
                overlay = $(formItem).find('.svitem__overlay'),
                errorItem = $(formItem).find('.svitem_error');
            authoring.Execute.DisableFormProperties(formItem, true);
            overlay.removeClass('hidden');
            errorItem.addClass('hidden').text();

            switch (type) {
            case 'QUESTION':
            {
                if (subType === 'RADIO') {
                    var t = authoring.Particles.DomData[domDataIndex].questionObject
                        .find('input:radio[name="SV_' + index + '"]:checked').attr('id');
                    if (typeof t !== "undefined" && t !== null) {
                        answer = t.split('_')[2];
                    } else {
                        erroredOnValidation = true;
                    }
                } else if (subType === 'CHECKBOX') {
                    inputs = authoring.Particles.DomData[domDataIndex].questionObject.find('input');
                    var checked = [];
                    for (var a = 0; a < inputs.length; a++) {
                        var input = $(inputs[a]);
                        if ((input).is(':checked')) {
                            checked.push(input.attr('id').split('_')[2]);
                        }
                    }

                    if (checked.length > 0) {
                        checked.sort();
                        answer = checked.join('');
                    } else {
                        erroredOnValidation = true;
                    }

                } else if (subType === 'INPUT') {
                    answer = authoring.Particles.DomData[domDataIndex].questionObject.val();
                    if (answer.length === 0) {
                        erroredOnValidation = true;
                    }
                } else if (subType === 'TEXTAREA') {
                    answer = authoring.Particles.DomData[domDataIndex].questionObject.val();
                    if (answer.length === 0) {
                        erroredOnValidation = true;
                    }
                }

                if (!erroredOnValidation) {
                    hub.server.authoringCheckParticleAnswer(atomId, particleId, index, answer).done(function(d) {
                        correct = d;
                        authoring.Execute.Evaluate(index, domDataIndex, correct);
                    });
                }

                break;
            }
            case 'SCREENSHOT':
            {
                var connectionId = '00000000-0000-0000-0000-000000000000';
                var deviceName = authoring.Particles.GetDeviceNameForScreenshot(index - 1);
                if (typeof deviceName !== "undefined" && deviceName !== null && deviceName.length > 0) {
                    var devicePosition = lab.GetPositionFromHostname(deviceName);
                    if (devicePosition >= 0) {
                        connectionId = lab.Structure.Devices[devicePosition].ActiveConnectionId;
                    }
                }
                hub.server.authoringGetScreenshot(atomId, particleId, index, connectionId).done(function(screenshot) {
                    if (screenshot.length > 0) {
                        var details = JSON.parse(screenshot);
                        if (details.length === 2) {
                            correct = details[0];
                        }
                    }
                    authoring.Execute.Evaluate(index, domDataIndex, correct);
                });
                break;
            }
            case 'EMAIL':
            {
                var email = $(i).prev('input:first').val();
                hub.server.authoringConfirmEmailInput(atomId, particleId, index, email).done(function(d) {
                    authoring.Execute.Evaluate(index, domDataIndex, d);
                });
                break;
            }
            case 'FILE':
            {
                hub.server.authoringGetFileFromVirtualMachine(atomId, particleId, index).done(function(d) {
                    authoring.Execute.Evaluate(index, domDataIndex, d);
                });
                break;
            }
            }

            if (erroredOnValidation) {
                authoring.Execute.DisableFormProperties(formItem, false);
                errorItem.removeClass('hidden').text('Please select or enter a value');
                overlay.addClass('hidden');
            }
        },
        Evaluate: function (index, domDataIndex, correct) {
            var type = authoring.Particles.GetNvcItemWithIndex(index - 1, 'TYPE').Value,
                subType = authoring.Particles.GetNvcItemWithIndex(index - 1, 'SUBTYPE').Value,
                executionMode = authoring.Particles.GetNvcItemWithIndex(index - 1, 'EMODE'),
                learnMode = authoring.Particles.GetNvcItemWithIndex(index - 1, 'FMODE'),
                particleIndex = authoring.Particles.GetNvcItemWithIndex(index - 1, 'PARTICLEINDEX').Value;

            if (executionMode === '') {
                executionMode = true;
            } else {
                executionMode = executionMode.Value;
            }
            if (learnMode === '') {
                learnMode = true;
            } else {
                learnMode = learnMode.Value;
            }

            var result = 'Incorrect',
                resultClass = 'result-fail',
                feedbackMessage = authoring.Particles.GetNvcItemWithIndex(index - 1, 'FEEDBACK');

            if (subType === 'TEXTAREA') {
                result = 'Response is not long enough';
            }

            if (feedbackMessage !== '') {
                feedbackMessage = feedbackMessage.Value;
            }

            switch (type) {
            case 'QUESTION':
            {
                if (correct) {
                    if (subType !== 'TEXTAREA') {
                        result = 'Correct';
                    } else {
                        result = 'Response meets required length';
                    }
                    resultClass = 'result-pass';
                    feedbackMessage = '';
                }
                break;
            }
            case 'SCREENSHOT':
            {
                result =
                    'Failed to capture screenshot; please ensure you have selected the appropriate device for this screenshot and that the device is powered on.';
                feedbackMessage = '';

                if (correct.length > 0) {
                    result = '<img src="../' + correct + '"/>';
                    resultClass = 'result-pass';
                }
                break;
            }
            case 'EMAIL':
            {
                result = correct.length > 0 ? correct : 'Invalid email address.';
                if (correct.length > 0) {
                    resultClass = 'result-pass';
                }
                feedbackMessage = '';
                break;
            }
            case 'FILE':
            {
                result = authoring.Messages(type, correct.Item2);
                if (correct.Item2) {
                    resultClass = 'result-pass';
                }
                feedbackMessage = '';
                break;
            }
            }

            if (executionMode) {
                authoring.Particles.DomData[domDataIndex].domObject.find('.redo-wrapper').removeClass('hidden');
            }

            if (learnMode) {
                authoring.Particles.DomData[domDataIndex].domObject.find('.svitem__result--wrapper').removeClass('hidden');
                authoring.Particles.DomData[domDataIndex].domObject.find('.svitem__result').removeClass('hidden').html(result + '<br/>' + feedbackMessage).removeClass('result-fail result-pass').addClass(resultClass);
            }
            
            var si = authoring.Particles.GetSummaryItemWithIndex(index);
            if (typeof si !== "undefined" && si !== null && si !== '') {
                si.removeClass('summaryrow--unactioned').addClass('summaryrow--actioned');
            }
            
            $('.svsummary').find('[data-particleindex="' + particleIndex + '"]').removeClass('summaryrow--unactioned').addClass('summaryrow--actioned');
            $('#SVI_' + index + ' .svitem__overlay').addClass('hidden');
        }
    },
    Messages: function(type, status) {
        switch (type) {
            case 'FILE':
            {
                return status
                    ? "Got file!"
                    : "Unable to get file, please ensure the device is turned on and the file exists, and try again.";
            }
        }

        return "";
    }
}


