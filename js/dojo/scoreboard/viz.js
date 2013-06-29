define(["dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "dijit/_TemplatedMixin", "dojo/dom-geometry", "dojo/text!scoreboard/templates/viz.html"], function(lang, Declare, _WidgetBase, _Container, _Contained, _TemplatedMixin, domGeometry, template) {
	return Declare("scoreboard.viz", [_WidgetBase, _TemplatedMixin, _Contained, _Container], {
		///
		/// This is the class for the 3djs viz
		///
		templateString : template,
		args : null,
		socket : null,

		constructor : function(args) {
			this.socket = args.socket;
			this.socket.on("message", lang.hitch(this, this.onVizMsg));
			this.rendered = false;
		},
		buildRendering : function() {
			this.inherited(arguments);
		},
		onVizMsg : function(event) {
			var obj = JSON.parse(event.data);
			//console.log("viz obj", obj);

			this.graph.addNode(new $3DJS.Node({
				id : obj.srcaddr,
				color : [1.0, 1.0, 1.0, 1.0],
				size : 15,
				imageUrl : "textures/network.png"
			}));

			this.graph.addNode(new $3DJS.Node({
				id : obj.dstaddr,
				color : [1.0, 1.0, 1.0, 1.0],
				size : 15,
				imageUrl : "textures/network.png"
			}));

			this.graph.addEdge({
				source : this.graph.nodes[this.graph.nodeLookupArray[obj.srcaddr]],
				dest : this.graph.nodes[this.graph.nodeLookupArray[obj.dstaddr]]
			});
			this.graph.nodeObj.updateVertexBuffers();
			this.graph.edgeObj.updateVertexBuffers();
			
			if(!this.rendered){
				this.graph.render();
				this.rendered = true;
			}
		},
		
		postCreate : function() {
			$3DJS.init({
				domNode : this.domNode,
				width : 1400
			});
			this.marginbox = domGeometry.getMarginBox(this.domNode);

			this.graph = new $3DJS.Graph({
				edgeColor : [0.8, 0.8, 0.8, 1.0],
				autoUpdateBuffers : false, // prevents vertex buffers to be updated each time a new node or edge is added (faster loading)
				nodeLabelColor : "#0000FF",
				//uniqueNodeTextures: true,
				renderNodeLabels : true,
				layout : {
					edgeLength : 160,
					edgeStiffness : 0.008,
					charge : -30,
					damping : 0.95,
					theta : 0.8,
					stableEnergyThreshold : 10
				}
			});

			this.g_nodeArray = [];

			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
		}
	});

});
