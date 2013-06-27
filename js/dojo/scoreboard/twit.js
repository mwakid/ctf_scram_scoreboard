define(["dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "dijit/_TemplatedMixin", "dojo/text!scoreboard/templates/twit.html"], function(lang, Declare, _WidgetBase, _Container, _Contained, _TemplatedMixin, template) {
	return Declare("scoreboard.twit", [_WidgetBase, _TemplatedMixin, _Contained, _Container], {
		///
		/// This is the class for the main UI
		///
		templateString : template,
		args : null, //property ba

		constructor : function(args) {
			this.args = args;
			
		},
		_setup : function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
			if (!d.getElementById(id)) {
				js = d.createElement(s);
				js.id = id;
				js.src = p + "://platform.twitter.com/widgets.js";
				fjs.parentNode.insertBefore(js, fjs);
			}
		},
		buildRendering : function() {
			this.inherited(arguments);
		},
		postCreate : function() {
			this._setup(document,"script","twitter-wjs");
			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
		}
	});

});
