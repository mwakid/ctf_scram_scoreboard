define(["dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", 
"dijit/_TemplatedMixin", "dojo/dom-geometry","dojo/text!scoreboard/templates/viz.html"], function(lang, Declare, _WidgetBase, _Container, _Contained, _TemplatedMixin, domGeometry, template) {
	return Declare("scoreboard.viz", [_WidgetBase, _TemplatedMixin, _Contained, _Container], {
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
			//console.log($3DJS);

			
			$3DJS.init({domNode:this.domNode, width:1400});
			this.marginbox = domGeometry.getMarginBox(this.domNode);
			// Create graph
			var graph = new $3DJS.Graph({
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

			var g_nodeArray = [];

			// Load graph data
			LoadGraph("data/output.csv");

			// Draw the graph
			graph.render();

			// AJAX request to read from graph file and load graph object when the response is returned
			function LoadGraph(filename, type) {

				var request = new XMLHttpRequest();

				request.open("GET", filename, false);

				request.onreadystatechange = function() {

					if (request.readyState == 4 && request.status == 200) {

						loadCSV(request.responseText);

					}

				}

				request.send();

			}

			// Loads a CSV file
			function loadCSV(responseText) {

				// Split lines in file
				var lines = responseText.split("\n");

				// Read first line to get column names
				variableNames = lines[0].split(",");

				//console.log(names);

				// Read remaining lines for actual data
				for (var i = 1; i < lines.length; ++i) {
					//for ( var i=1; i < 11; ++i ) {

					var vars = lines[i].split(",");

					/*
					edgeArray[i-1] = {

					edgeid: vars[0],
					guid1: vars[1],
					guid2: vars[2],
					lastnameaps: vars[3],
					middlenameaps: vars[4],
					firstnameaps: vars[5],
					streetaps: vars[6],
					cityaps: vars[7],
					stateaps: vars[8],
					zipaps: vars[9],
					phoneaps: vars[10],
					iddocaps: vars[11],
					tcs: vars[12]

					}
					*/
					// For some reason the line after the last row with text is being read in. This is to avoid that line.
					if (vars[0] == "")
						continue;

					graph.addNode(new $3DJS.Node({
						id : vars[4],
						color : [1.0, 1.0, 1.0, 1.0],
						size : 15,
						imageUrl : "textures/network.png",
						//imageRegion: {
						//	left: 0.0,
						//	right: 0.125,
						//	bottom: 0.875,
						//	top: 1.0
						//}
					}));

					graph.addNode(new $3DJS.Node({
						id : vars[5],
						color : [1.0, 1.0, 1.0, 1.0],
						size : 15,
						imageUrl : "textures/network.png",
						//imageRegion: {
						//	left: 0.0,
						//	right: 0.125,
						//	bottom: 0.875,
						//	top: 1.0
						//}
					}));

					if (vars[4] != vars[5]) {// do not add an edge if the source and destination nodes are the same node

						graph.addEdge({
							source : graph.nodes[graph.nodeLookupArray[vars[4]]],
							dest : graph.nodes[graph.nodeLookupArray[vars[5]]]
							//weight: weight
						});

					}

				}

				//g_nodeArray = [];

				// this must be called to update all the vertex buffers once all the nodes have been added
				if (!graph.autoUpdateBuffers) {

					graph.nodeObj.updateVertexBuffers();
					graph.edgeObj.updateVertexBuffers();
					//graph.edgeLabelObj.updateVertexBuffers();

				}

				console.log('Finished loading');
				console.log('This graph has ' + graph.numNodes + ' nodes and ' + graph.numEdges + ' edges.');

			}


			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
		}
	});

});
