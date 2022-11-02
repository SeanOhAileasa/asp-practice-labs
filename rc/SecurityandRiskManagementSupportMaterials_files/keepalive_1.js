var PracticeLabsCommon = PracticeLabsCommon || {};

// PL-585 Unified Keep alive
PracticeLabsCommon.KeepAlive = function(options)
{
	var self = this, 
		timer = null,
		defaults = 
		{
			PulseInterval: 30000, // default is 30 seconds
			PulseInitialDelay: 1000, // default is 1 second
			IsExam: false // pass the ExamMode to determine whether or not we need to update the examInstance.timeElapsed
		};

	var settings = $.extend({}, defaults, options);

	this.Pulse = function(interval)
	{
		if (interval === null)
		{
			interval = settings.PulseInitialDelay;
		};

		if (timer !== null)
		{
			clearTimeout(timer);
			timer = null;
		};

		timer = setTimeout(function()
		{
			self.LoadHandler();
		}, interval);
	},

	this.LoadHandler = function()
	{
		// keepalive_1.js requires the ajax loader to be included above it.
        if (typeof (loader) !== "undefined") {
            loader.load('/handlers/keepalive.ashx', 'r=0&IsExam=' + settings.IsExam, ['no data'], 'GET', true, self.OnSuccess(), self.OnError());
        }
	},

	this.OnSuccess = function()
	{
		self.Pulse(settings.PulseInterval);		
	},

	this.OnError = function()
	{
	}
};