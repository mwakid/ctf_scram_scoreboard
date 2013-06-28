define(["dojo/_base/lang", "dojo/_base/declare", "dojox/socket"], function(lang, Declare, Socket) {
	return Declare("scoreboard.sockets", null, {
		///
		/// This is the class for standing up all the sockets and dealing with the comms.
		///
		vizSocket : null,
		constructor : function(args) {
			this.vizSocket = new Socket("ws://127.0.0.1:9081");

		}
	});
});
