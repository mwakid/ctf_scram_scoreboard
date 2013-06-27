define(["dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "dijit/_TemplatedMixin", "dojo/text!scoreboard/templates/ui.html"], function(lang, Declare, _WidgetBase, _Container, _Contained, _TemplatedMixin, template) {
	return Declare("scoreboard.ui", [_WidgetBase, _TemplatedMixin, _Contained, _Container], {
		///
		/// This is the class for the main UI
		///
		templateString : template,
		args : null, //property ba

		constructor : function(args) {
			this.args = args;

		},
		buildRendering : function() {
			this.inherited(arguments);
		},
		postCreate : function() {

			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
		}
	});

});
