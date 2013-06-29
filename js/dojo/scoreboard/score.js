define(["dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", 
"dijit/_Contained", "dijit/_TemplatedMixin", "dojo/dom-geometry", "dojo/text!scoreboard/templates/score.html"], function(lang, Declare, _WidgetBase, _Container, _Contained, _TemplatedMixin, domGeometry, template) {
	return Declare("scoreboard.score", [_WidgetBase, _TemplatedMixin, _Contained, _Container], {
		///
		/// This is the class for the score
		///
		templateString : template,
		args : null,
		socket : null,

		constructor : function(args) {
			this.socket = args.socket;
			this.socket.on("score", lang.hitch(this, this.onScoreMsg));
		},
		buildRendering : function() {
			this.inherited(arguments);
		},
		onScoreMsg : function(obj) {
			console.log("score",obj);
		},		
		postCreate : function() {
			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
		}
	});

});
