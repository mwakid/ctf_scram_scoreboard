define(["dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", 
"dijit/_TemplatedMixin", "scoreboard/twit", "scoreboard/viz","scoreboard/score","scoreboard/socket","dojo/text!scoreboard/templates/ui.html"], 
function(lang, Declare, _WidgetBase, _Container, _Contained, _TemplatedMixin, Twit, Viz, Score, Socket, template) {
	return Declare("scoreboard.ui", [_WidgetBase, _TemplatedMixin, _Contained, _Container], {
		///
		/// This is the class for the main UI
		///
		templateString : template,
		args : null, //property ba
		twit : null, 
		viz:null,
		score:null,
		socket:null,

		constructor : function(args) {
			this.args = args;
			this.socket = new Socket({});
		},
		buildRendering : function() {
			this.inherited(arguments);
		},
		postCreate : function() {
			this.twit = new Twit({}, this.twitDAP);
			this.viz = new Viz({socket:this.socket},this.vizDAP);
			this.score = new Score({socket:this.socket}, this.scoreDAP);
			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
		}
	});

});
