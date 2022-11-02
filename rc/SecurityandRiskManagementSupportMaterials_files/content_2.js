var content = {
    Aside: {
        Obj: {
            Aside: null,
            Drag: null,
            Lab: null
        },
        Original: {
            DragLeft: 0,
            LabLeft: 0
        },
        GetObjects: function () {
            if (content.Aside.Obj.Aside === null) {
                content.Aside.Obj.Aside = $('#aside-main');
                content.Aside.Obj.Drag = $('#drag-handle');
                content.Aside.Obj.Lab = $('#lab-area');
            }
        },
        Toggle: function (o) {
            settings.Settings.VNextOptions.AsidePanel.Visible = !settings.Settings.VNextOptions.AsidePanel.Visible;
            content.Aside.ReDraw(o);
        },
        ReDraw: function (o) {
            if (content.Aside.Obj.Aside === null) {
                content.Aside.GetObjects();
            }

            var pnlMsg = 'Hide content panel', position;

            if (settings.Settings.VNextOptions.AsidePanel.Visible) {
                position = settings.Settings.VNextOptions.AsidePanel.Position;

                $(o).attr('aria-expanded', true);

            } else {
                pnlMsg = 'Show content panel';

                $(o).attr('aria-expanded', false);

                position = 0;
            }

            if (content.Aside.IsMax) {
                position = $(window).width() - 112;
            }

            if (position < 0) {
                position = 100;
            }

            $(o).attr('title', pnlMsg);

            content.Aside.Obj.Aside.css('width', position + 'px');
            content.Aside.Obj.Drag.css('left', position + 'px');
            content.Aside.Obj.Lab.css({ 'left': (position + 10) + 'px' }).css({ 'width': '100%' }).css({ 'width': '-=' + (position + 10) + 'px' });
            settings.Save();
            lab.SetFitWidthState(false);
        },
        IsMax: false,
        GoMax: function (t) {
            if (content.Aside.Obj.Aside === null) {
                content.Aside.GetObjects();
            }

            if (t && !content.Aside.IsMax) {
                // go max
                var position = $(window).width() - 112;

                content.Aside.Obj.Aside.css('width', position + 'px');
                content.Aside.Obj.Drag.css('left', position + 'px');
                content.Aside.Obj.Lab.css({ 'left': (position + 10) + 'px' }).css({ 'width': '100%' }).css({ 'width': '-=' + (position + 10) + 'px' });
                content.Aside.IsMax = true;

            } else if (!t && content.Aside.IsMax) {
                // go back
                content.Aside.IsMax = false;
                content.Aside.ReDraw();
            }
        }
    },
    ApplyImageZoom: function () {

        $('.cn-img').click(function () {

            var currentWidth = $(this).width(),
                originalWidth = $(this).data('img-width'),
                clicks = $(this).data('clicks');

            if (typeof(originalWidth) === "undefined") {
                originalWidth = currentWidth;
                clicks = 0;
                $(this).data("img-width", originalWidth);
            }

            clicks++;

            var newWidth = currentWidth + originalWidth;

            if (clicks >= 4) {
                newWidth = originalWidth;
                clicks = 1;
            }

            $(this).width(newWidth).data('clicks', clicks).css('max-width', '');

            if ($(this).width() === currentWidth) {
                $(this).width(originalWidth).data('clicks', 0);
            }

        });
    },
    ShowLinks: {
        Change: function (o, e) {

            settings.Settings.VNextOptions.DeviceLinksInContent = !settings.Settings.VNextOptions.DeviceLinksInContent;

            if (settings.Settings.VNextOptions.DeviceLinksInContent && content.Selected.RawHtml !== null && content.Selected.RawHtml.length > 0) {
                tools.Loader.Control(true, 'Please wait while put links in to the content.');
                $('#exercise-content').html(content.CreateDeviceLinks(content.Selected.RawHtml));
            } else {
                if (content.Selected.RawHtml !== null && content.Selected.RawHtml.length > 0) {
                    tools.Loader.Control(true, 'Please wait while we remove links from the content.');
                    $('#exercise-content').html(content.Selected.RawHtml);
                }
            }

            settings.ToggleMessage(o, settings.Settings.VNextOptions.DeviceLinksInContent, true, e);

            tools.Loader.Control(false);
        }
    },
    Selected: {
        Course: null,
        Module: null,
        Exercise: null,
        Lab: null,
        RawHtml: null
    },
    Navigate: {
        Obj: null,
        Location: null,
        Title: null,
        ModuleTitle: null,
        KeyDown: function (e) {
            if (e.keyCode === 32) {
                content.Navigate.Go();
            }
        },
        Go: function (location, ci, moduleIndex) {
            if (typeof (ci) !== "undefined") {
                content.Course.ActiveCacheItem.Course = ci;
            } else if (typeof (content.Course.ActiveCacheItem.Course) !== "undefined") {
                ci = content.Course.ActiveCacheItem.Course;
                if (ci === null) {
                    ci = undefined;
                }
            }
            if (typeof (moduleIndex) !== "undefined") {
                content.Course.ActiveCacheItem.Module = moduleIndex;
            } else if (typeof (content.Course.ActiveCacheItem.Module) !== "undefined") {
                moduleIndex = content.Course.ActiveCacheItem.Module;
                if (moduleIndex === null) {
                    moduleIndex = undefined;
                }
            }

            if (content.Navigate.Obj === null) {
                content.Navigate.Obj = {};
                content.Navigate.Obj.Back = $('#nav-back');
                content.Navigate.Obj.Titles = $('#nav-titles');
                content.Navigate.Obj.Selected = $('#nav-selected');
                content.Navigate.Obj.Title = $('#nav-title');
                content.Navigate.Obj.ModuleTitle = $('#nav-module-selected');
                content.Navigate.Obj.Selected.delegate('ul li a', 'click keydown', function (e) {
                    content.Course.TrySelect(this, e);
                });
            }

            if (typeof (location) !== "undefined" && location.length > 0) {
                content.Navigate.Location = location;
            } else {
                if (content.Navigate.Location === 'modules') {
                    content.Navigate.Location = 'titles';
                } else if (content.Navigate.Location === 'exercises') {
                    if (lab.NoLab.LabName !== null) {
                        lab.NoLab.Hide();
                    }
                    content.Navigate.Location = 'modules';
                }
            }

            switch (content.Navigate.Location) {
                case 'titles':
                    {
                        if (content.Course.QuickNavs.BottomNav === null) {
                            content.Course.QuickNavs.BottomNav = $('#bottom-nav');
                        } else {
                            content.Course.QuickNavs.BottomNav.addClass('hidden');
                        }

                        $('#course-intro-section').show();
                        content.Navigate.Obj.Back.addClass('hidden');
                        content.Navigate.Obj.Selected.html('');
                        content.Navigate.Obj.Title.html('Practice Labs');
                        content.Navigate.Obj.ModuleTitle.html('');
                        content.Navigate.Obj.Titles.removeClass('hidden');
                        if (typeof (ci) !== "undefined" && ci !== null) {
                            content.Navigate.Obj.Titles.find('[data-vendor-id="' + ci.VendorId + '"]').focus();
                        } else {
                            content.Navigate.Obj.Titles.find('li a:first').focus();
                        }
                        tutorial.ToggleTutContent();
                        break;
                    }
                case 'modules':
                    {
                        if (content.Course.QuickNavs.BottomNav === null) {
                            content.Course.QuickNavs.BottomNav = $('#bottom-nav');
                        } else {
                            content.Course.QuickNavs.BottomNav.addClass('hidden');
                        }

                        if (typeof (ci) === "undefined" && content.Navigate.Title !== null) {
                            ci = content.Navigate.Title;
                            content.Navigate.Title = null;
                        }
                        $('#course-intro-section').hide();
                        content.Navigate.Obj.Titles.addClass('hidden');
                        content.Navigate.Obj.Title.html(ci.Title);
                        content.Navigate.Obj.ModuleTitle.html('');
                        content.Navigate.Obj.Selected.html('<div class="module-list-intro">' + ci.Introduction + '</div><h2>Lab Guides</h2>').append(ci.Obj.clone()).removeClass('hidden');
                        content.Navigate.Obj.Back.removeClass('hidden').attr('disabled', false).text('Back to Practice Labs');
                        content.Navigate.Title = ci;

                        if (typeof (moduleIndex) !== "undefined" && moduleIndex !== null && moduleIndex > -1) {
                            content.Navigate.Obj.Selected.find('li:nth-child(' + (moduleIndex + 1) + ') a').focus();
                        } else {
                            content.Navigate.Obj.Selected.find('li a:first').focus();
                        }

                        tutorial.ToggleTutContent();
                        break;
                    }
                case 'exercises':
                    {
                        if (typeof (moduleIndex) !== "undefined") {

                            var a = 0, el = $('<ul>'), li, currLab = '', start = null;
                            el.attr('class', 'exercise-list-list');
                            var position = moduleIndex;

                            if (moduleIndex > (ci.Modules.length - 1) && ci.Modules.length === 1) {
                                moduleIndex = 0;
                            }

                            for (a; a < ci.Modules[moduleIndex].Exercises.length; a++) {
                                li = $('<li>');

                                if (currLab === '' || currLab !== ci.Modules[moduleIndex].Exercises[a].LabType) {
                                    var ela = $('<a>').attr('class', 'cl-red')
                                        .attr('data-vendor', ci.Vendor)
                                        .attr('data-vendor-id', ci.VendorId)
                                        .attr('data-module-index', position)
                                        .attr('data-exercise-index', a)
                                        .text(ci.Modules[moduleIndex].Exercises[a].Title);

                                    currLab = ci.Modules[moduleIndex].Exercises[a].LabType;
                                    ela.attr('href', '#');
                                    ela.appendTo(li);

                                    if (start === null) {
                                        start = $('<button>').attr('class', 'btn btn-startlab')
                                            .attr('style', 'margin-top:10px')
                                            .attr('data-vendor', ci.Vendor)
                                            .attr('data-vendor-id', ci.VendorId)
                                            .attr('data-module-index', position)
                                            .attr('data-exercise-index', a)
                                            .text('Start').on('click', function() {
                                                content.Course.TrySelect(this);
                                            });
                                    }

                                } else {
                                    var liSpan = $('<span>').text(ci.Modules[moduleIndex].Exercises[a].Title);
                                    liSpan.appendTo(li);
                                }
                                li.appendTo(el);
                            }

                            content.Navigate.Obj.Titles.addClass('hidden');
                            content.Navigate.Obj.Title.text(ci.Title);
                            content.Navigate.Obj.ModuleTitle.html(ci.Modules[moduleIndex].Title);
                            content.Navigate.Obj.Selected.html('');
                            content.Navigate.Obj.Back.text('Back to lab guides');

                            $('<h2>').text('Exercises').appendTo(content.Navigate.Obj.Selected);

                            el.appendTo(content.Navigate.Obj.Selected).removeClass('hidden');
                            if (start !== null) {
                                start.appendTo(content.Navigate.Obj.Selected);
                            }
                            content.Navigate.Obj.Selected.find('li a:first').focus();
                            tutorial.ToggleTutContent();
                        }
                        break;
                    }
            }
        }
    },
    Course: {
        List: [],
        CacheItem: function (v, vId, mList, title, introduction) {
            var o = {
                Title: title,
                Introduction: introduction,
                Vendor: v,
                VendorId: vId,
                Modules: mList,
                Obj: '',
                GenerateObject: function () {
                    this.Obj = $('<ul>');
                    this.Obj.attr('class', 'module-list-list');

                    for (var a = 0; a < this.Modules.length; a++) {
                        var li = $('<li>'), additionalText = '';

                        if (this.Modules[a].Status !== 'NotStarted') {
                            if (this.Modules[a].Status === 'InProgress') {
                                additionalText = ' : In progress';
                            } else {
                                additionalText = ' : Complete';
                            }
                        }

                        var lnk = $('<a>').attr('class', 'cl-' + this.Modules[a].Status.toLowerCase())
                            .attr('data-vendor', this.Vendor)
                            .attr('data-vendor-id', this.VendorId)
                            .attr('data-module-index', this.Modules[a].Position)
                            .attr('data-exercise-index', -1);

                        if (this.Modules[a].Expired) {
                            lnk.attr('href', '#')
                                .text(this.Modules[a].Title + ' : Expired');
                        } else {
                            lnk.attr('href', '#')
                                .text(this.Modules[a].Title + additionalText);
                        }

                        lnk.appendTo(li);

                        li.appendTo(this.Obj);
                    }
                }
            };
            return o;
        },
        Cache: [],
        AddToCache: function (ci) {
            if (!content.Course.CheckCache(ci.Vendor, ci.VendorId)) {
                content.Course.Cache.push(ci);
            }
        },
        CheckCache: function (ci, update) {
            if (content.Course.Cache.length > 0) {
                for (var a = 0; a < content.Course.Cache.length; a++) {
                    if (content.Course.Cache[a].Vendor === ci.Vendor && content.Course.Cache[a].VendorId === ci.VendorId) {
                        if (update) {
                            content.Course.Cache[a] = ci;
                        }
                        return true;
                    }
                }
            }
            return false;
        },
        GetCacheItem: function (vendor, vendorId) {
            if (content.Course.Cache.length > 0) {
                for (var a = 0; a < content.Course.Cache.length; a++) {
                    if (content.Course.Cache[a].Vendor === vendor && content.Course.Cache[a].VendorId === vendorId) {
                        return content.Course.Cache[a];
                    }
                }
            }
            return null;
        },
        ActiveCacheItem: {
            Course: null,
            Module: null
        },
        LoadCourse: function (o, vendor, vendorId, title, cb, obj, exCount) {
            if (typeof (exCount) === "undefined") {
                exCount = 0;
            }

            tools.Loader.Control(true, 'Please wait while we load the lab guides for this lab.', o.attr('id'));
            hub.server.vNextGetModuleList(vendor, vendorId, exCount).done(function (d) {
                tools.Loader.Control(false);
                if (typeof (d) !== "undefined" && d !== null) {
                    if (d.length > 0) {
                        var dObj = JSON.parse(d);
                        if (dObj.length > 0) {
                            var intro = '';
                            //find course intro
                            for (var b = 0; b < content.Course.List.length; b++) {
                                if (content.Course.List[b].Vendor === vendor && content.Course.List[b].VendorId === vendorId) {
                                    intro = content.Course.List[b].Introduction;
                                    break;
                                }
                            }

                            var ci = content.Course.CacheItem(vendor, vendorId, dObj, title, intro);
                            ci.GenerateObject();
                            content.Course.AddToCache(ci);

                            content.Navigate.Go('modules', ci);

                            if (typeof (cb) !== "undefined" && cb !== null) {
                                cb(obj);
                            }
                        }
                    } else {
                        alert('no permission');
                    }
                }
            }).fail(function () {
                tools.Loader.Control(false);
            });
        },
        LoadCourses: function (cb, obj) {
            // get course list from server
            tools.Loader.Control(true, 'Please wait while we load your lab list.', 'nav-titles');
            hub.server.vNextGetCourseList().done(function (d) {
                if (typeof (d) !== "undefined" && d.length > 0) {
                    if (typeof (cb) === "undefined") {
                        content.Course.DrawCourses(d, true);
                    } else {
                        content.Course.DrawCourses(d, false);
                        cb(obj);
                    }
                }
                tools.Loader.Control(false);
            });
        },
        DrawCourses: function (d, navigate) {
            var l = JSON.parse(d);
            if (l.length > 0) {
                var a = 0, domElement = $('#nav-titles'), el, currVendor = l[0].Vendor, uls = $('<ul>'), wrap = $('<div>').attr('class', 'course-group'), all = [], retiredCount = 0;
                $('<h2>').addClass('product-type').text('Practice Lab titles').appendTo(domElement);

                $('<h3>').text(currVendor).appendTo(wrap);

                for (a; a < l.length; a++) {
                    if (l[a].Vendor !== currVendor) {

                        uls.appendTo(wrap);
                        all.push(wrap);

                        currVendor = l[a].Vendor;

                        wrap = $('<div>').attr('class', 'course-group');
                        uls = $('<ul>');

                        $('<h3>').text(currVendor).appendTo(wrap);
                    }

                    el = $('<li>');
                    var lnk = $('<a>').attr('data-vendor', l[a].Vendor).attr('data-vendor-id', l[a].VendorId).attr('data-title', l[a].Title);
                    
                    if (!l[a].IsRetired) {

                        var status = l[a].Status.toLowerCase();
                        var title = l[a].Vendor + ' - ' + l[a].VendorId + ' - ' + l[a].Title;

                        var label = title + ': Not started';

                        switch (status) {

                            case 'complete':
                                label = title + ': Complete';
                                break;
                            case 'inprogress':
                                label = title + ': In progress';
                                break;
                            default:
                                break;
                        }

                        lnk.attr('class', 'cl-' + status).attr('aria-label', label);

                    } else {
                        lnk.attr('class', 'cl-' + l[a].Status.toLowerCase() + '-retired hidden').attr('aria-label', 'Retired Title');
                        retiredCount++;
                    }

                    if (!l[a].Expired) {
                        lnk.attr('href', '#')
                            .text(l[a].VendorId + ' - ' + l[a].Title)
                            .on('click keydown', function (e) {
                                content.Course.TrySelect(this, e);
                            });
                    } else {
                        lnk.addClass('content-expired')
                            .text(l[a].VendorId + ' - ' + l[a].Title + ' : Expired').on('click keydown', function (e) {
                                if (e.type === 'keydown' && e.keyCode !== 32) {
                                    return;
                                }
                                tools.More.Open('lab-expired', 420, 600, 'Content expired');
                            });
                    }

                    lnk.appendTo(el);

                    el.appendTo(uls);

                    l[a].Obj = el;
                }

                if (retiredCount > 0) {
                    $('#course-intro-section > button').removeClass('hidden');
                }

                uls.appendTo(wrap);

                all.push(wrap);

                for (var b = 0; b < all.length; b++) {
                    all[b].appendTo(domElement);
                }

                content.Course.List = l;
                if (navigate) {
                    content.Navigate.Go('titles');
                }
            } else {
                // do we have exam prep
                var tp = $('#tp-titles');
                if (tp.length > 0 && tp.find('a').length > 0) {
                    $('#tab-main').find("a[href$='#tabpanel-testprep']").click();
                } else {
                    
                    $('#exercise-content').load('partials/more/no-products.html');
                    $('#course-intro-section').load('partials/more/no-products.html');
                    $('.tab-contentpanel').addClass('partial-nocourses-warning');
                }
            }
        },
        ToggleRetired: function (el) {

            if (el.textContent === 'Show retired titles') {
                el.textContent = 'Hide retired titles';
                $(el).attr('title', 'Hide retired titles');
                $('a[aria-label="Retired Title"]').removeClass('hidden');
            } else {
                el.textContent = 'Show retired titles';
                $(el).attr('title', 'Show retired titles');
                $('a[aria-label="Retired Title"]').addClass('hidden');
            }
        },
        QuickNavs: {
            BottomNav: null,
            Bottom: {
                Next: null,
                Prev: null
            },
            Top: {
                Next: null,
                Prev: null
            }
        },
        TrySelect: function (obj, e) {
            if (typeof (obj) !== "undefined") {
                var key;
                if (typeof (e) !== "undefined" && e.type === 'keydown') {
                    key = e.keyCode;
                }

                if (typeof (key) !== "undefined") {
                    switch (key) {
                        case 32:
                            {
                                e.preventDefault();
                                break;
                            }
                        case 13:
                            {
                                e.preventDefault();
                                break;
                            }
                        default:
                            {
                                return true;
                            }
                    }
                }

                var o = $(obj), vendor = o.attr('data-vendor'), vendorId = o.attr('data-vendor-id'), title = o.attr('data-title'), moduleIndex = parseInt(o.attr('data-module-index')), exerciseIndex = parseInt(o.attr('data-exercise-index')), ci = null;
                if (moduleIndex > -1) {

                    if (typeof (e) !== "undefined") {
                        e.stopPropagation();
                    }
                    if (exerciseIndex > -1) {
                        ci = content.Course.GetCacheItem(vendor, vendorId);

                        if (typeof (ci) !== "undefined" && typeof (ci.Modules) !== "undefined" && ci.Modules.length > 0) {

                            if (ci.Modules.length > 0 && ci.Modules[0].Expired) {
                                tools.More.Open('guide-expired', 420, 600, 'Content expired');
                                return;
                            }

                            if (content.Course.List !== null && content.Course.List.length > 0) {
                                for (var vr = 0; vr < content.Course.List.length; vr++) {
                                    if (content.Course.List[vr].Vendor === vendor && content.Course.List[vr].VendorId === vendorId) {
                                        if (content.Course.List[vr].Obj.children('a:first').hasClass('cl-notstarted')) {
                                            content.Course.List[vr].Obj.children('a:first').removeClass('cl-notstarted').addClass('cl-inprogress');
                                        }
                                        break;
                                    }
                                }
                            }

                            if (ci.Modules.length <= moduleIndex) {
                                moduleIndex = 0;
                            }


                            if (ci.Modules[moduleIndex].Status === 'NotStarted') {
                                ci.Obj.find('*[data-module-index="' + moduleIndex + '"]').removeClass('cl-notstarted').addClass('cl-inprogress');
                                ci.Modules[moduleIndex].Status = 'InProgress';
                            } else if (ci.Modules[moduleIndex].Status === 'Complete') {
                                $('#nav-complete').removeClass('nav-complete-incomplete').addClass('nav-complete-completed').attr('title', 'Mark module incomplete');
                            } else {
                                $('#nav-complete').removeClass('nav-complete-completed').addClass('nav-complete-incomplete').attr('title', 'Mark module complete');
                            }
                        }

                        var position = moduleIndex;
                        if (moduleIndex >= (ci.Modules.length - 1) && ci.Modules.length === 1) {
                            if (ci.Modules[0].Position === moduleIndex) {
                                moduleIndex = 0;
                                position = ci.Modules[0].Position;
                            } else {
                                position = ci.Modules[0].Position;
                            }
                        }

                        if (content.Course.QuickNavs.Bottom.Next === null) {
                            content.Course.QuickNavs.Bottom.Next = $('#bottom-nav-next');
                            content.Course.QuickNavs.Bottom.Prev = $('#bottom-nav-prev');
                            content.Course.QuickNavs.BottomNav = $('#bottom-nav');
                        }

                        content.Course.QuickNavs.Bottom.Prev
                                .attr('data-vendor', vendor)
                                .attr('data-vendor-id', vendorId)
                                .attr('data-module-index', moduleIndex);
                        content.Course.QuickNavs.Bottom.Next
                            .attr('data-vendor', vendor)
                            .attr('data-vendor-id', vendorId)
                            .attr('data-module-index', moduleIndex);

                        // exercise content
                        if (content.Selected.Exercise === null || content.Selected.Exercise !== exerciseIndex) {
                            content.Selected.Exercise = exerciseIndex;
                            tools.Loader.Control(true, 'Please wait while we load your content.', 'exercise-content');

                            $('#nav-complete').removeClass('hidden');
                            $('#nav-title-title').text(ci.Title);
                            $('#nav-module-title').text(ci.Modules[moduleIndex].Title);
                            $('#nav-exercise-title').text(ci.Modules[moduleIndex].Exercises[exerciseIndex].Title);

                            content.Course.QuickNavs.BottomNav.css('display', 'flex').removeClass('hidden');

                            if (exerciseIndex === 0) {
                                content.Course.QuickNavs.Bottom.Prev.attr('disabled', true);
                            } else {
                                content.Course.QuickNavs.Bottom.Prev
                                    .attr('data-exercise-nav-prev', ci.Modules[moduleIndex].Exercises[(exerciseIndex - 1)].Title)
                                    .attr('data-exercise-index', (exerciseIndex - 1)).attr('disabled', false);
                            }

                            if (exerciseIndex === ci.Modules[moduleIndex].Exercises.length - 1) {
                                content.Course.QuickNavs.Bottom.Next.attr('disabled', true).attr('data-exercise-index', (exerciseIndex + 1));
                            } else {
                                content.Course.QuickNavs.Bottom.Next
                                    .attr('data-exercise-nav-next', ci.Modules[moduleIndex].Exercises[(exerciseIndex + 1)].Title)
                                    .attr('data-exercise-index', (exerciseIndex + 1)).attr('disabled', false);
                            }

                            hub.server.vNextGetContent(vendor, vendorId, position, exerciseIndex).done(function(d) {
                                if (typeof (d) !== "undefined") {
                                    $('#step-position').text(exerciseIndex + 1 + ' of ' + ci.Modules[moduleIndex].Exercises.length);
                                    hub.server.vNextContentGetTrackingStatus().done(function(state) {
                                        content.Module.Complete(false, state);
                                    });

                                    if (d.length > 0) {
                                        var ex = JSON.parse(d), ciscoFound = false;
                                        content.Selected.RawHtml = ex.Html;
                                        if (typeof (lab) !== "undefined" && typeof (lab.Structure.Devices) !== 'undefined') {
                                            for (var iod = 0; iod < lab.Structure.Devices.length; iod++) {
                                                if (lab.Structure.Devices[iod].Vendor === 0) {
                                                    ciscoFound = true;
                                                    break;
                                                }
                                            }
                                        }

                                        if (content.Selected.Lab !== ex.LabId || ciscoFound) {
                                            lab.GetLab(ex.Html, ex.LabId);
                                        } else {

                                            $('#exercise-content').html(content.CreateDeviceLinks(ex.Html)).scrollTop(0);
                                            $('#excercise-select').click();
                                            tutorial.ToggleTutContent();
                                            tools.Loader.Control(false);
                                            Assessment.Check();
                                            authoring.Particles.ContentLoaded();
                                            content.ApplyImageZoom();
                                        }
                                        $('#exercise-content').focus();

                                    } else {
                                        tools.Loader.Control(false);
                                    }
                                }
                            }).fail(function() {
                                tools.Loader.Control(true, 'Something went wrong while loading this content.', 'exercise-content');
                            });
                        } else {
                            $('#excercise-select').click();
                        }
                    } else {
                        hub.server.vNextSetModuleIndex(moduleIndex);
                        content.Selected.Exercise = -1;
                        ci = content.Course.GetCacheItem(vendor, vendorId);
                        content.Navigate.Go('exercises', ci, moduleIndex);
                    }
                } else {
                    // modules
                    content.Selected.Exercise = -1;
                    ci = content.Course.GetCacheItem(vendor, vendorId);
                    if (ci === null) {
                        content.Course.LoadCourse(o, vendor, vendorId, title, null, null, 0);
                    } else {
                        content.Navigate.Go('modules', ci);
                    }
                }
            } else {
                content.Selected.Exercise = -1;

                if (content.Course.List.length === 0) {
                    content.Course.LoadCourses();
                } else {
                    content.Navigate.Go('titles');
                }
            }
        }
    },
    CreateDeviceLinks: function (html) {
        if (typeof html !== "undefined") {
            var h = $.parseHTML(html);
            if (settings.Settings.VNextOptions.DeviceLinksInContent && h !== null) {
                if (lab.Structure !== null && typeof lab.Structure.Devices !== "undefined" && lab.Structure.Devices.length > 0) {
                    var labObject = lab.Structure;
                    for (var ldl = 0; ldl < labObject.Devices.length; ldl++) {
                        if (lab.Structure.Devices[ldl].HasInterface || lab.Structure.Devices[ldl].LinkConsole !== null) {
                            var reg = new RegExp(labObject.Devices[ldl].Hostname, 'g');
                            for (var t = 0; t < h.length; t++) {
                                if (typeof h[t].tagName !== "undefined") {
                                    if (h[t].tagName === 'P') {
                                        h[t].innerHTML = h[t].innerHTML.replace(reg, '<span tabindex="0" onkeydown="lab.Links(\'' + ldl + '\', event);" onclick="lab.Links(\'' + ldl + '\');" class="content-device-link">' + labObject.Devices[ldl].Hostname + '</span>');
                                    } else if (h[t].tagName === 'UL') {
                                        h[t].innerHTML = h[t].innerHTML.replace(/Orange - Working/g, 'Blue - Working');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return h;
        }
        return '';
    },
    Module: {
        Obj: null,
        Marking: false,
        MarkUi: function (state) {
            var o = content.Module.Obj;
            if (state) {
                o.addClass('nav-complete-completed')
                    .removeClass('nav-complete-incomplete')
                    .attr('title', 'Mark module incomplete');
            } else {
                o.removeClass('nav-complete-completed')
                    .addClass('nav-complete-incomplete')
                    .attr('title', 'Mark module complete');
            }
        },
        Complete: function (set, state) {
            if (content.Module.Obj === null) {
                content.Module.Obj = $('#nav-complete');
            }

            if (content.Module.Obj.length > 0) {
                var o = content.Module.Obj;
                if (typeof (state) !== "undefined") {
                    // update from server
                    content.Module.MarkUi(state);
                } else {
                    if (!content.Module.Marking) {
                        content.Module.Marking = true;
                        var moduleState = o.hasClass('nav-complete-incomplete');
                        
                        hub.server.vNextContentSetTrackingStatus(moduleState).done(function (d) {
                            if (d) {
                                content.Module.MarkUi(moduleState);
                            } else {
                                content.Module.Marking = false;
                                return;
                            }
                            
                            var c = content.Course.ActiveCacheItem;

                            if (typeof (c.Course) !== "undefined" && c.Course !== null && typeof (c.Module) !== "undefined") {
                                if (typeof (c.Course.Obj) !== "undefined" && c.Course.Obj.length > 0) {
                                    var moduleIndex = parseInt(c.Module), bypassCourseCheck = false;
                                    if (moduleIndex >= c.Course.Modules.length && c.Course.Modules.length === 1) {
                                        moduleIndex = 0;
                                        bypassCourseCheck = true;
                                    }

                                    if (typeof (c.Course.Modules[moduleIndex]) !== "undefined") {
                                        c.Course.Modules[moduleIndex].Status = moduleState ? "Complete" : "InProgress";
                                        // set the cached item too
                                        var cachedA = c.Course.Obj.find('*[data-module-index="' + c.Module + '"]');
                                        switch (moduleState) {
                                        case true:
                                        {
                                            cachedA.addClass('cl-complete').removeClass('cl-inprogress').text(cachedA.text().replace(new RegExp('In progress'), 'Complete')).attr('aria-label', 'Module complete');
                                            break;
                                        }
                                        case false:
                                        {
                                            cachedA.addClass('cl-inprogress').removeClass('cl-complete').text(cachedA.text().replace(new RegExp('Complete$'), 'In progress')).attr('aria-label', 'Module in progress');
                                            break;
                                        }
                                        }
                                    }

                                    // set the UI if it is visible
                                    var a = $('.module-list-list:first').find('*[data-module-index="' + c.Module + '"]');

                                    // are we complete?
                                    if (!bypassCourseCheck) {
                                        var courseComplete = true, m = 0;
                                        for (m; m < c.Course.Modules.length; m++) {
                                            if (c.Course.Modules[m].Status !== 'Complete') {
                                                courseComplete = false;
                                                break;
                                            }
                                        }
                                        if (courseComplete) {
                                            $('#nav-titles').find('*[data-title="' + c.Course.Title + '"]').removeClass('cl-inprogress').addClass('cl-complete').attr('aria-label', c.Course.Title + ': Complete');
                                        } else {
                                            $('#nav-titles').find('*[data-title="' + c.Course.Title + '"]').removeClass('cl-complete').addClass('cl-inprogress').attr('aria-label', c.Course.Title + ': In progress');
                                        }
                                    }

                                    if (a.length > 0) {
                                        switch (moduleState) {
                                        case true:
                                        {
                                            a.addClass('cl-complete').removeClass('cl-inprogress').text(a.text().replace(new RegExp('In progress'), 'Complete')).attr('aria-label', 'Module complete');
                                            break;
                                        }
                                        case false:
                                        {
                                            a.addClass('cl-inprogress').removeClass('cl-complete').text(a.text().replace(new RegExp('Complete$'), 'In progress')).attr('aria-label', 'Module in progress');
                                            break;
                                        }
                                        }
                                    }
                                }
                            }
                            content.Module.Marking = false;
                        })
                            .fail(function () {
                            content.Module.Marking = false;
                        });
                    }
                }
            }
        }
    },
    List: null,
    SearchBox: null,
    Search: function () {
        var b, p;
        if (content.SearchBox === null) {
            content.SearchBox = $('#course-search');
        }
        if (content.List === null) {
            content.List = {};
            $('.course-group').each(function () {
                var secObj = $(this), t = secObj.text();
                content.List[t] = [secObj, []];
                $(this).find('ul li').each(function () {
                    content.List[t][1].push([$(this), $(this).text().toLowerCase()]);
                });
            });
        }

        var v = content.SearchBox.val().toLowerCase();
        if (v.length > 0) {
            for (p in content.List) {
                var groupLength = content.List[p][1].length, count = 0, cgVisible = false;
                for (b = 0; b < content.List[p][1].length; b++) {
                    if (content.List.hasOwnProperty(p)) {
                        if (content.List[p][1][b][1].indexOf(v) === -1) {
                            content.List[p][1][b][0].addClass('hidden');
                            count++;
                            if (count === groupLength) {
                                content.List[p][0].addClass('hidden');
                            }
                        } else {
                            content.List[p][1][b][0].children().removeClass('hidden');
                            if (!cgVisible) {
                                content.List[p][0].removeClass('hidden');
                                cgVisible = true;
                            }
                            content.List[p][1][b][0].removeClass('hidden');
                        }
                    }
                }
            }

        } else {

            for (p in content.List) {

                content.List[p][0].removeClass('hidden');

                for (b = 0; b < content.List[p][1].length; b++) {

                    if (content.List.hasOwnProperty(p)) {

                        var aLink = content.List[p][1][b][0].children();

                        if (aLink.hasClass('cl-inprogress-retired')
                            || aLink.hasClass('cl-notstarted-retired')
                            || aLink.hasClass('cl-complete-retired')) {

                            $('.tp-button-toggle').attr('title') === 'Show retired titles'
                                ? aLink.addClass('hidden')
                                : aLink.removeClass('hidden');
                        }

                        content.List[p][1][b][0].removeClass('hidden');
                    }
                }
            }
        }
    },
    HighContrast: {
        Obj: null,
        Branded: null,
        CssBranded: null,
        Change: function (o, e) {
            if (content.HighContrast.Obj === null) {
                content.HighContrast.Obj = $('#high-contrast');
            }

            if (content.HighContrast.Branded === null) {
                content.HighContrast.CssBranded = cssBrand;
                var hc = $('link[href="css/high-contrast.css"]');
                if (hc.length === 0) {
                    content.HighContrast.Branded = true;
                } else {
                    content.HighContrast.Branded = false;
                }
            }

            content.HighContrast.Branded = !content.HighContrast.Branded;

            if (content.HighContrast.Branded) {
                $('link[href="css/high-contrast.css"]').attr('href', content.HighContrast.CssBranded);
            } else {
                $('link[href="' + content.HighContrast.CssBranded + '"]').attr('href', 'css/high-contrast.css');
            }

            settings.Settings.VNextOptions.HighContrastMode = !content.HighContrast.Branded;

            settings.ToggleMessage(o, settings.Settings.VNextOptions.HighContrastMode, true, e);
        }
    }
}