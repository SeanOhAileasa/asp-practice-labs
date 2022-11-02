 var loader = {
    queue: {
            queueId: 1,
            queueItem: function (url, qs, data, type, async, callback, onerror) {
                loader.queueId++;
                this.Id = loader.queueId;
                this.url = url;
                this.qs = qs;
                this.data = data;
                this.async = async;
                this.type = type;
                this.callback = callback;
                this.onerror = onerror;
                loader.queue.list.push(this);
                if (loader.queue.list.length == 1) {
                    loader.call(loader.queue.list[0]);
                }
                return this;
            },
            list:[],
            next:function() {
                this.list.shift();
                if (this.list.length > 0) {
                    loader.call(this.list[0]);
                }
            }
    },
    load: function (url, qs, data, type, async, callback, onerror) {
        var s = (typeof (data) === 'object') ? JSON.stringify(data) : s = '';
        if (type == undefined) { type = 'POST'; };
        var qi = new loader.queue.queueItem(url, qs, s, type, async, callback, onerror);
    },
    call:function(qi) {
        $.ajax({
            type: qi.type,
            async: qi.async,
            url: qi.url + '?' + qi.qs,
            data: qi.data,
            cache: false,
            contentType: 'application/json',
            dataType: 'json',
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                loader.queue.next();
                if (xmlHttpRequest.readyState == 0 || xmlHttpRequest.status == 0) { return; } else {
                    if (typeof qi.onerror == 'function') { [qi.onerror(textStatus, errorThrown)]; }
                }
            },
            success: function (data) {
                loader.queue.next();
                if (data) {
                    if (typeof qi.callback == 'function') { [qi.callback(data)]; }
                } else {
                    if (typeof qi.callback == 'function') { [qi.callback()]; }
                }
            }
        });
    }
 }

 function b1s2b1UploadDocument() {
     var oOutput = document.getElementById("output");
     var oData = new FormData(document.forms.namedItem("fileinfo"));

     var oReq = new XMLHttpRequest();
     oReq.open("POST", "handlers/upload-module.ashx", true);
     oReq.onload = function (oEvent) {
         if (oReq.status == 200) {
             oOutput.innerHTML = "Uploaded!";
         } else {
             oOutput.innerHTML = "Error " + oReq.status + " occurred uploading your file.<br \/>";
         }
     };

     oReq.send(oData);
 }