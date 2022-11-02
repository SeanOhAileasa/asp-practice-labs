var PracticeLabsCommon = PracticeLabsCommon || {};

PracticeLabsCommon.SessionStorage = function () {

    var self = this;

    this.StorageSupported = false;
    
    this.Init = function () {

        if (window.sessionStorage) {
            // Session Storage is available

            self.StorageSupported = true;
        }

        var redirectPageExists = self.DoesItemExist('InvalidSessionRedirect');
        
        if (!redirectPageExists) {

            hub.server.getInvalidSessionRedirect().done(function (redirectPage) {

                self.AddItem('InvalidSessionRedirect', redirectPage);
            });
        }
    };

    this.AddItem = function (key, value) {

        if (self.StorageSupported) {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    };

    this.GetItem = function (key) {

        if (self.StorageSupported) {
            return JSON.parse(sessionStorage.getItem(key));
        }
        return null;
    };

    this.RemoveItem = function(key) {

        if (self.StorageSupported) {
            sessionStorage.removeItem(key);
        }
    };

    this.DoesItemExist = function (key) {

        if (sessionStorage.length > 0) {

            for (var i = 0; i < sessionStorage.length; i++) {

                var item = sessionStorage.key(i);

                if (item === key) {
                    return true;
                }
            }
        }
        return false;
    };
};