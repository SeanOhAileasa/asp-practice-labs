var performanceIntervalInSeconds = 10, performanceIntervalInitial = 1, rttStart, rtt, downloadBandwidth, performanceTimer, performanceFileSize = 4096, graph, nightrider = 5;

var performanceBenchmarkGraph = {
    Start: function () {
        this.Interface.AnimateDirection = true;
        this.Interface.Chart = $('#performance-benchmark-graph');
        this.Interface.Average = $('#performance-benchmark-average');
        this.Interface.Latency = $('#performance-benchmark-rtt');
        this.Interface.Bandwidth = $('#performance-benchmark-bw');
        this.Interface.Last = $('#performance-benchmark-last');
        this.Interface.Elements = this.Interface.Chart.find('.benchbar');

        for (var a = 0; a < this.Interface.Elements.length; a++) {
            this.Scores.push(0);
            this.Bws.push(0);
            this.Rtts.push(0);
        }

        this.Interface.Interval = setInterval(function () {
            performanceBenchmarkGraph.Interface.Animate();
        }, 150);

        this.Interface.Animate();
    },
    Stop: function () {

    },
    Interface: {
        Interval: null,
        SetOpacity: function (index) {
            var eCount = this.Elements.length, pointer = 0;

            for (var p = nightrider; p >= 0; p--) {
                if (index - p < 0) {
                    pointer = eCount - p + index;
                } else {
                    pointer = index - p;
                }
                if (p === 1) {
                    $(this.Elements[pointer]).removeClass('active');
                } else if (p === 0) {
                    $(this.Elements[pointer]).addClass('active');
                }

                var opacity = p === nightrider ? 0.3 : 1 - (p * 0.1);
                $(this.Elements[pointer]).css({'opacity': opacity});
            }
        },
        Animate: function () {
            var pbg = performanceBenchmarkGraph;

            pbg.Interface.AnimateIndex++;

            if (!pbg.Interface.AnimateDirection && pbg.Interface.AnimateIndex === pbg.Interface.Elements.length) {
                clearInterval(pbg.Interface.Interval);
            }

            if (pbg.Interface.AnimateIndex === pbg.Interface.Elements.length) {
                pbg.Interface.AnimateIndex = -1;
                pbg.Interface.AnimateDirection = false;
            }

            var score = pbg.Scores[pbg.Interface.AnimateIndex], newScore = pbg.Interface.AnimateDirection ? 100 : 0;

            $(pbg.Interface.Elements[pbg.Interface.AnimateIndex]).removeClass('bm' + score).addClass('bm' + newScore);
            pbg.Scores[pbg.Interface.AnimateIndex] = newScore;
        },
        AnimateDirection: true,
        AnimateIndex: -1,
        Chart: null,
        Average: null,
        Latency: null,
        Bandwidth: null,
        Last : null,
        Elements: []
    },
    Ticks: 0,
    Scores: [],
    Bws: [],
    Rtts: [],
    Position: 0,
    Average: function () {
        var total = 0, avg = 0, runs = this.Ticks > this.Interface.Elements.length ? this.Interface.Elements.length : this.Ticks;

        for (var a = 0; a < runs; a++) {
            total += this.Scores[a];
        }

        total = total / runs;
        avg = total.toFixed(2);
        this.Interface.Average.text(avg);
    },
    Render: function (score, rtt, bw) {
        this.Interface.Latency.text(rtt);
        this.Interface.Bandwidth.text(bw.toFixed(2));
        this.Interface.Last.text(score);

        $(this.Interface.Elements[this.Position]).removeClass('bm' + this.Scores[this.Position]).css({ 'opacity': 1 }).addClass('bm' + score).text(score);
        this.Scores[this.Position] = score;
        this.Rtts[this.Position] = rtt;
        this.Bws[this.Position] = bw;
        this.Average();

        this.Interface.SetOpacity(this.Position);

        this.Position++;
        if (this.Position === this.Interface.Elements.length) {
            this.Position = 0;
        }
    },
    GenerateEmail: function (btn) {
        $(btn).attr('disabled', true);
        hub.server.performanceSendSupportEmail(this.Rtts, this.Bws, this.Scores).done(function() {
            stopPerformanceBenchmark($('#performance-benchmark-stop'));
            $('#performance-benchmark-email-response')
                .text('An email has been sent to support with your performance data.');
        });
    }
}

function startPerformanceBenchmark(btn) {
    $('#performance-benchmark-email-response').text('');
    $(btn).attr('disabled', true);
    $(btn).next('button').attr('disabled', false);
    $(btn).next('button').next('button').attr('disabled', false);

    console.log('Starting performance benchmark');
    performanceBenchmarkGraph.Start();
    var rttLevels = [5, 10, 25, 50, 75, 100, 150, 200, 275, 350],
        bwLevels = [256, 192, 128, 64, 32, 16, 8, 4, 2, 1],
        ticks = 0,
        rampdown = 1,
        rttCheck = $('#check-rtt'),
        bwCheck = $('#check-bw'),
        start = Date.now();

    performanceTimer = setInterval(function () {
        $(rttCheck).addClass('performance-check-highlight');

        testRtt();
        ticks++;

        if (ticks === rampdown) {
            console.log('testing RTT/BW');
            $(bwCheck).addClass('performance-check-highlight');
            testBw(performanceFileSize);
            rampdown++;
            if (rampdown >= 10) {
                rampdown = 5;
            }
            ticks = 0;
        }

        if (typeof (rtt) === "undefined" || typeof (downloadBandwidth) === "undefined" || downloadBandwidth === 0) {
            return;
        }

        var a = 0, rttLevel = 0, bwLevel = 0, total = 0;
        performanceBenchmarkGraph.Ticks++;

        for (a; a < rttLevels.length; a++) {
            if (rtt > rttLevels[a]) {
                rttLevel = a;
            }

            if (downloadBandwidth < bwLevels[a]) {
                bwLevel = a;
            }
        }

        total = 100 - ((rttLevel * 5) + (bwLevel * 5));

        console.log('rtt=' + rtt + ',bw=' + downloadBandwidth + ',total=' + total);

        performanceBenchmarkGraph.Render(total, rtt, downloadBandwidth);

        setTimeout(function() {
            $(bwCheck).removeClass('performance-check-highlight');
            $(rttCheck).removeClass('performance-check-highlight');
            }, 1000);

        var now = Date.UTC(), diff = now - start;
        if (diff > 900000) {
            stopPerformanceBenchmark($('#performance-benchmark-stop'));
        }
    }, performanceIntervalInSeconds * 1000);
}

function stopPerformanceBenchmark(btn) {
    $(btn).attr('disabled', true);
    $(btn).prev('button').attr('disabled', false);
    $(btn).next('button').attr('disabled', true);

    performanceBenchmarkGraph.Stop();
    if (typeof (performanceTimer) !== "undefined") {
        clearInterval(performanceTimer);
        console.log('Stopped performance benchmark');
    }
}

function testRtt() {
    rttStart = Date.now();
    hub.server.calculateRtt();
}

function testBw(size) {
    var now = Date.now();
    var request;
    if (XMLHttpRequest) {
        request = new XMLHttpRequest();
        request.open("GET", "../../api/v1/performance/bandwidth/" + size, true);
        request.send();
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var total = Date.now() - now, totalBits = size * 8, totalMs = Math.floor(total);
                    downloadBandwidth = totalBits / totalMs;
                }
            }
        }
    }
}

function generateFile(size) {
    hub.server.generateFile(size);
}

hub.client.receiveRtt = function () {
    var total = Date.now() - rttStart;
    rtt = Math.floor(total);
}