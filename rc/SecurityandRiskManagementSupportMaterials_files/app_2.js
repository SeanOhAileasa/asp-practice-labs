//  Functions

// Window size
var WindowsSize = function () {
    var h = $(window).height(),
        w = $(window).width();
    $("#helper-window").html("Window Size W: " + w + " H:" + h);
};

var LabDesktopSize = function () {
    var h = $("#lab-desktop").height(),
        w = $("#lab-desktop").width();
    $("#helper-labdesktop").html("Lab Desktop W: " + w + " H:" + h);
};

var TabContentPanel = function () {
    var h = $("#section1").height(),
        w = $("#section1").width();
    $("#helper-contentpanel").html("Content panel W: " + w + " H:" + h);
};

var dimensions = {
    Setup:function() {
        dimensions.Screen.Calculate();
        dimensions.Browser.Calculate();
        dimensions.Aside.Object = $('.aside-main');
        dimensions.LabArea.Object = $('.lab-area');
        dimensions.Aside.Width = dimensions.Aside.Object.width();
        dimensions.LabArea.Left = dimensions.Aside.Width + 10;
    },
    DragStop:30,
    Screen: {
        Width: 0,
        Height: 0,
        Calculate:function() {
            this.Width = screen.width;
            this.Height = screen.height;
        }
    },
    Browser: {
        Width: 0,
        Height: 0,
        Calculate:function() {
            this.Width = window.innerWidth || document.body.clientWidth;
            this.Height = window.innerHeight || document.body.clientHeight;
        }
    },
    Aside: {
        Object:null,
        Width: 0
    },
    LabArea: {
        Object: null,
        Left: 0
    },
    UiResize:function(shrink) {
        
    },
    Microsoft: {
        Width: 0,
        Height: 0
    },
    Cisco: {
        Width: 0,
        Height: 0,
        FontSize: 0
    }
};

var log = {
    Visible: false,
    Object: null,
    Toggle: function(e, obj) {
        if (typeof e !== 'undefined' && e !== null) {
            if (e.type !== 'click') {
                if (e.keyCode !== 32) {
                    return false;
                }
            } else {
                if (e.x < 0) {
                    return false;
                }
            }

            e.preventDefault();
        }

        if (log.Object === null) {
            log.Object = $('.contentpanel-log');
        }

        log.Visible = !log.Visible;

        if (log.Visible) {
            log.Object.removeClass('visuallyhidden' + '');
            log.Object.attr('aria-hidden', false);

        } else {
            log.Object.addClass('visuallyhidden');
            log.Object.attr('aria-hidden', true);
        }

        if (obj) {
            $(obj)
                .attr('title', log.Visible ? 'Hide log panel' : 'Show log panel')
                .attr('aria-expanded', log.Visible ? true : false);
        }

        return false;
    }
};

function confirmBackspaceNavigations() {
    // http://stackoverflow.com/a/22949859/2407309
    var backspaceIsPressed = false;
    $(document).keydown(function(event) {
        if (event.which === 8) {
            backspaceIsPressed = true;
        }
    });

    $(document).keyup(function(event) {
        if (event.which === 8) {
            backspaceIsPressed = false;
        }
    });

    $(window).on('beforeunload', function() {
        if (backspaceIsPressed) {
            backspaceIsPressed = false;
            return "You are about to leave this page, are you sure?";
        }
        return;
    });
}

$(document).ready(function() {
    confirmBackspaceNavigations();

    var drag = $('#drag-handle'), dragStop = 56;
    
    drag.draggable({
        iframeFix: true,
        containment: '#page-wrap',
        grid: [dimensions.DragStop, dimensions.DragStop],
        drag: function () {

        },
        stop: function() {
            var position = $(this).position(), l = position.left, max = $(window).width() - DRAGBARWIDTH;

            l > max ? l = max : (l <= ASIDEMINWIDTH ? l = ASIDEMINWIDTH : l = position.left);
            
            settings.Settings.VNextOptions.AsidePanel.Position = l;
            if (!settings.Settings.VNextOptions.AsidePanel.Visible) {
                content.Aside.Toggle($(this));
            } else {
                content.Aside.ReDraw($(this));
            }
        }
    }).on('keydown dblclick', function(event) {
        var update = false;

        if (event.type === 'keydown') {
            if (event.keyCode === 37) {
                //left
                if (settings.Settings.VNextOptions.AsidePanel.Position > ASIDEMINWIDTH) {
                    settings.Settings.VNextOptions.AsidePanel.Position -= dragStop;
                    update = true;
                }
            } else if (event.keyCode === 39) {
                update = true;
                //right
                if (settings.Settings.VNextOptions.AsidePanel.Position < $(window).width() - DRAGBARWIDTH) {
                    settings.Settings.VNextOptions.AsidePanel.Position += dragStop;
                } else {
                    settings.Settings.VNextOptions.AsidePanel.Position = $(window).width() - DRAGBARWIDTH;
                }
            }
        } else {
            content.Aside.Toggle(this);
        }

        if (update) {
            if (!settings.Settings.VNextOptions.AsidePanel.Visible) {
                settings.Settings.VNextOptions.AsidePanel.Visible = true;
            }
            content.Aside.ReDraw($(this));
        }
    });

    $(window).resize(function() {
        content.Aside.ReDraw(drag);
        lab.SetFitWidthState(false);
    });

    $('.support-partials').each(function () {
        var o = "Partials/support/" + this.getAttribute('data-id') + '.html';
        if (o.indexOf('gdpr') > -1) {
            return;
        }
        $(this).load(o);
    });

    $('#bottom-nav-next').on('click',function(){
	    timer.CheckToReset();
    });
    $('#bottom-nav-prev').on('click',function(){
	    timer.CheckToReset();
    });
    $('#bottom-nav-top').on('click',function(){
	    timer.CheckToReset();
    });
});
