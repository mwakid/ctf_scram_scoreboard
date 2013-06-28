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
			console.log("viz obj", obj);

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
		// Loads a CSV file
		loadCSV : function(responseText) {

			// Split lines in file
			var lines = responseText.split("\n");

			// Read first line to get column names
			variableNames = lines[0].split(",");

			//console.log(names);

			// Read remaining lines for actual data
			for (var i = 1; i < lines.length; ++i) {
				//for ( var i=1; i < 11; ++i ) {

				var vars = lines[i].split(",");

				// For some reason the line after the last row with text is being read in. This is to avoid that line.
				if (vars[0] == "")
					continue;

				this.graph.addNode(new $3DJS.Node({
					id : vars[4],
					color : [1.0, 1.0, 1.0, 1.0],
					size : 15,
					imageUrl : "textures/network.png"
				}));

				this.graph.addNode(new $3DJS.Node({
					id : vars[5],
					color : [1.0, 1.0, 1.0, 1.0],
					size : 15,
					imageUrl : "textures/network.png"
				}));

				if (vars[4] != vars[5]) {// do not add an edge if the source and destination nodes are the same node
					this.graph.addEdge({
						source : this.graph.nodes[this.graph.nodeLookupArray[vars[4]]],
						dest : this.graph.nodes[this.graph.nodeLookupArray[vars[5]]]
					});
				}
			}

			// this must be called to update all the vertex buffers once all the nodes have been added
			if (!this.graph.autoUpdateBuffers) {
				this.graph.nodeObj.updateVertexBuffers();
				this.graph.edgeObj.updateVertexBuffers();
			}

			console.log('Finished loading');
			console.log('This graph has ' + this.graph.numNodes + ' nodes and ' + this.graph.numEdges + ' edges.');

		},
		postCreate : function() {
			$3DJS.init({
				domNode : this.domNode,
				width : 1400
			});
			this.marginbox = domGeometry.getMarginBox(this.domNode);

			// Create graph
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

			// Load graph data
			//this.LoadGraph("data/output.csv");

			// Draw the graph

			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
		}
	});

});
