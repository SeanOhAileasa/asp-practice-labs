var contentModal = {
    Reference: null,
    OldWidth: {
        AsideMain: null,
        DragHandle: null,
        LabArea: null
    },
    CheckReference: function() {
        var reference = $('#logout-helper');
        if (typeof(reference) !== 'undefined') {
            contentModal.Reference = reference;
            if (typeof (contentModal.Reference.attr('data-content')) !== 'undefined' &&
                contentModal.Reference.attr('data-content').length > 0) {
                return true;
            }
        }
        contentModal.Reference = null;
        return false;
    },
    //Pass 3 variables
    Open: function (width, content, partial) {
        var modalInner = $('#sa4a-modal');//, modalInner = $('#sa4a-modal-content');

        if (typeof (content) !== 'undefined' && content.length > 0) {
            modalInner.html(content);
        } else if (typeof (partial) !== 'undefined' && partial.length > 0) {

            if (partial.match('\.html\$')) {
                modalInner.load('Partials/' + partial);
            } else {
                modalInner.load('Partials/' + partial + '.html');
            }
        }

        if (typeof (width) !== 'undefined' && width.length > 0) {
            switch(width.toLowerCase()) {
                case 'show':
                    if (!settings.Settings.VNextOptions.AsidePanel.Visible) {
                        $('#button-content-toggle').click();
                    }
                    break;
                case 'full':

                    var asidemain = $('#aside-main'), draghandle = $('#drag-handle'), labarea = $('#lab-area'), pagewrap = $('#page-wrap');
                    contentModal.OldWidth.AsideMain = asidemain.css('width');
                    contentModal.OldWidth.DragHandle = draghandle.css('left');
                    contentModal.OldWidth.LabArea = labarea.css('left');
                    asidemain.css('width', '100%');
                    draghandle.css('left', '100%');
                    labarea.css('left', '100%');
                    pagewrap.css('overflow', 'hidden');
                    break;
            }
        }

        //modalOuter.removeClass('hidden');
        //modalInner.focus();
        modalInner.removeClass('hidden').focus();

        setTimeout(function() {
            $('#content-modal-cancel').focus();
        }, 100);
    },
    Close: function (e) {
        if (typeof (e) !== "undefined") {
            if (e.keyCode !== 32) {
                return;
            }
        }

        if (contentModal.OldWidth.AsideMain !== null && contentModal.OldWidth.DragHandle !== null && contentModal.OldWidth.LabArea !== null) {
            var asidemain = $('#aside-main'), draghandle = $('#drag-handle'), labarea = $('#lab-area'), pagewrap = $('#page-wrap');

            asidemain.css('width', contentModal.OldWidth.AsideMain);
            draghandle.css('left', contentModal.OldWidth.DragHandle);
            labarea.css('left', contentModal.OldWidth.LabArea);
            pagewrap.css('overflow', '');
        }

        //$('#sa4a-modal-content').html();
        //$('#sa4a-modal').addClass('hidden');
        $('#sa4a-modal').addClass('hidden').html('');
        contentModal.OldWidth.AsideMain = null;
        contentModal.OldWidth.DragHandle = null;
        contentModal.OldWidth.LabArea = null;
    },
    Logout: {
        Check: function (e){
            if (typeof (e) !== "undefined") {
                if (e.keyCode !== 32) {
                    return;
                }
            }
            if (contentModal.CheckReference()) {
                contentModal.Open("full", "", contentModal.Reference.attr('data-content'));
            } else {
                settings.Logout();
            }
        }
    }
};