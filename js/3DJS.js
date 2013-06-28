// 3DJS.js 
// 3D JavaScript graphics library and rendering engine 
// Copyright (C) 2013
// 
// Written by Mike Wakid


/**
 * 3DJS Namespace 
 * @author Mike Wakid
 */

// Namespace (replace GL with whatever the official library name will be)
var $3DJS = $3DJS || { VERSION: '1.0' };

var gl;							// Variable containing interface to all 3D graphics components (rename to ctx or something that doesn't get confused with the library name)		

// transformation matrices

$3DJS.MVMatrix = undefined;		// Modelview matrix
$3DJS.MVMatrixStack = [];			// Modelview matrix stack
$3DJS.PMatrix = undefined;			// Projection matrix
$3DJS.PMatrixStack = [];			// Projection matrix stack

// for calculating frames per second
$3DJS.previousTime = new Date().getTime();
$3DJS.elapsedTime = 0;
$3DJS.frameCount = 0;
$3DJS.fps = 0;


/**
 * Initilization functions for the graphics library. Must be called to intialize the library before use. These initializations incliude 
 * 	 getting the WebGL context from the HTML5 canvas element and initializing internal library variables.
 *
 * @param {Object} config Configuration object for the library
 * @param {String} config.canvasId ID of the canvas that will be rendered to. If an ID is not specified one will be automatically created.
 * @param {Integer} config.width Width of the canvas
 * @param {Integer} config.height Height of the canvas
 */

$3DJS.init = function ( settings ) {
	
		// Set the margin of the body to 0 so there is no spacing around the canvas
		document.body.style.margin = '0px';
		
		// settings - 
		//		canvas_id - the id of the canvas to draw on
		//		width -
		//      height - 
		//		domNode - the dom node to place the canvas into
	
		settings = settings || { };
	
		// Create the HTML5 canvas and add it to the document body
		var canvas = document.getElementById( settings.canvas_id );
		if(settings.domNode == null){
			settings.domNode = document.body;
		}
		if ( canvas == null ) {
		
				var canvas = document.createElement('canvas');
				canvas.id = settings.canvas_id || 'canvas3djs';	
				canvas.setAttribute( 'tabindex', '1' );			
				settings.domNode.appendChild(canvas);
				
		}
		
		canvas.oncontextmenu = function( ) { return false; }; 
		canvas.style.width  = settings.width  || window.innerWidth;
		canvas.style.height = settings.height || window.innerHeight;
		canvas.style.margin = '0px';		
	
		// Get the canvas context 
		getCanvasContext( canvas.id );
		
		// Set the width and height of the canvas to the client width and height
		// This will fill the browser space with the canvas
		gl.canvas.width  = settings.width  || window.innerWidth;
		gl.canvas.height = settings.height || window.innerHeight;
		
		// necessary to use gl.FLOAT for gl.texImage2D (floating point textures)
		if (!gl.getExtension("OES_texture_float")) {         			
      			alert("No OES_texture_float support!");      	
  		}
		
		// Initialize key variables (transformation matrices)
		initGLVariables( );
		
		// Rendering related
		$3DJS.backgroundColor = settings.backgroundColor ? settings.backgroundColor : [ 1.0, 1.0, 1.0, 1.0 ];
			
		// Interactor
		this.interactor = new Interactor( );
		
}

/**
 * Retuns the context for a canvas with the passed ID. Returns null if the canvas is not found or the WebGL context cannot be retrieved.
 * 
 * @param {String} canvasId The ID of the canvas element.
 * @returns The canvas context.
 */

function getCanvasContext ( canvasID ) {
		
		// Get the HTML5 canvas element and store it into a variable
		var canvas = document.getElementById( canvasID );
							
		// If the canvas element does not exist fire an alert
		if ( !canvas ) {
		
				alert( 'Cannot get the HTML5 canvas element!' )						
				return null;
	
		}
		
		// Implement the WebGL error checking listed here: http://www.khronos.org/webgl/wiki/FAQ 
		
		// Add a lost context handler and tell it to prevent the default behavior
		canvas.addEventListener("webglcontextlost", handleContextLost, false);
		
		// Re-setup all your WebGL state and re-create all your WebGL resources when the context is restored.
		canvas.addEventListener("webglcontextrestored", handleContextRestored, false);
		
		// Get the WebGL context from the canvas element		
		gl = canvas.getContext( 'experimental-webgl', {
			antialias: true,
			alpha: false, 								// alpha: false is to prevent WebGL objects with transparency to blend with the HTML page	
		}); 
				
		
		// If the context does not exist fire an alert
		if ( !gl ) {
	
				if ( !window.WebGLRenderingContext ) {
					alert( "Your browser does not support WebGL. Please upgrade or use a WebGL compatible browser.");
				} else {
					alert( 'WebGL is supported but could not be initialized. Try restarting your computer.' );						
				}
	
		}			
			
}

function handleContextLost ( event ) {
		
		alert( "The WebGL context has been lost" );
		event.preventDefault();
		cancelRequestAnimationFrame(requestId);
		
}
 
function handleContextRestored ( event ) {
		
		alert( "The WebGL context is being restored" );
		init();
		
}

function initGLVariables ( ) {
	 			
		$3DJS.MVMatrix = mat4.create( );				// Modelview matrix		
		$3DJS.PMatrix  = mat4.create( );				// Projection matrix	
		
		// WebGL initializations
    	gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    	gl.enable( gl.DEPTH_TEST );   
    	gl.depthFunc( gl.LESS ); 

}


/**
 * Resizes the canvas when browser has changed size
 * @private
 */

window.onresize = function ( ) {
					
		// resize the canvas 	
		var canvas = document.getElementById( "canvas3djs" );  // this element should be stored in a variable instead of retrieved from the DOM each time
		//if(settings.domNode!=null){
			//ignore the resize	
		//}else{
		//	canvas.style.width = window.innerWidth;
		//	canvas.style.height = window.innerHeight;
		
			//gl.canvas.width  = window.innerWidth;
		//	gl.canvas.height = window.innerHeight;
		//}
		//gl.canvas.width   	   = gl.canvas.clientWidth;
		//gl.canvas.height  	   = gl.canvas.clientHeight;
		
		// change this to update the graphs fbo (this should be moved)
		
		graph.frameBufferObj.update( gl.canvas.width, gl.canvas.height );
		graph.frameBufferObj.updateColorTexture( gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );
		graph.frameBufferObj.updateDepthTexture( );
		graph.frameBufferObj.disable( );
			
}

/**
 *
 * Timer function telling the browser to make changes every few milliseconds to provide animated
 * scenes.
 * @private
 */
		
window.requestAnimationFrame = ( function ( ) {
      
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame ||              
              window.mozRequestAnimationFrame    ||         
              window.oRequestAnimationFrame      ||              
              window.msRequestAnimationFrame     ||                            
              function( callback ) {              	
                	window.setTimeout(callback, 1000 / 60);                	
              };
              
} ) ( );

/**
 * Custom events for user interaction with the scene (e.g. clicking on nodes and edges in the graph)
 */


var edgeClickEvent = new CustomEvent(
	"onEdgeClick",
	{
		detail: {
			message: "Hello World!",
			time: new Date(),
		},
		bubbles: true,
		cancelable: true
	}
);

/**
 * This file is used to integrating HTML elements and CSS into our visualizations  
 * 
 * @param {string}
 * @param {integer}
 * @param {integer}
 */

var findMaxFontSize = function ( text, context, canvasWidth ) {
	
		var fontSize = 1;
		
		context.font = "bold " + fontSize + "px sans-serif";
		
		while ( context.measureText( text ).width < canvasWidth ) {
			
				fontSize++;
				
				context.font = "bold " + fontSize + "px sans-serif";
			
		}
		
		--fontSize;
		
		context.font = "bold " + fontSize + "px sans-serif";
		
		return fontSize;
	
}

function createFontAtlas( width, height ) {
	
		// create a canvas we will render the ascii characters onto and then turn into a WebGL texture
		insertHTML5LabelCanvas( width, height );
	
		var tileWidth  = width / 16;	
		var tileHeight = height / 16; 
		
		var halfTileWidth = tileWidth * 0.5;
		var halfTileHeight = tileHeight * 0.5;
						
		var canvas = document.createElement( 'canvas' );
		
		// Assign canvas attributes
		canvas.id     = "fontAtlasCanvas";
		canvas.width  = width;
		canvas.height = height;
		
		// Hide the canvas
		canvas.style.display = "none"; // comment this line out when debugging the atlas
		
		// Add the canvas to the document body
		document.body.appendChild( canvas );
				
		// Get the canvas context
        canvas.context = canvas.getContext( '2d' );
        
        // Clear the canvas
        canvas.context.clearRect( 0, 0, canvas.width, canvas.height );
        
        // Fill the background with blue
        canvas.context.fillStyle = "#000000"; 
        canvas.context.fillRect(0,0,255,255);
        
        // This determines the text color, it can take a hex value or rgba value (e.g. rgba(255,0,0,128))
        canvas.context.fillStyle = "#FFFFFF"; 
        
        // This determines the alignment of text, e.g. left, center, right
        canvas.context.textAlign = "center";             
        
        // This determines the baseline of the text, e.g. top, middle, bottom
        canvas.context.textBaseline = "middle";         
        
        // *Note - would like for this to be automatic but in the meantime it will be manual
        //var fontSize = findMaxFontSize( "A", canvas.context, tileWidth ); 
		var fontSize = 60;
	
		// This determines the size of the text and the font family used
        canvas.context.font = fontSize + "px Helvetica Neue";      
        
		console.log(fontSize);
		
		
		
		// Fill the canvas with ascii characters
		var x, y, asciiChar;
		
		for ( var i=0; i < 256; i++ ) {
		
				x = ( i % 16 ) * tileWidth + halfTileWidth;
				y = Math.floor( i / 16 ) * tileHeight + halfTileHeight;
		
				asciiChar = String.fromCharCode(i);
        		canvas.context.fillText( asciiChar, x, y );  // write to the canvas        
				
				//console.log( i + ': ' + String.fromCharCode(i) + ' reverse: ' + String.fromCharCode(i).charCodeAt(0));
		
		}
		
		
		// Create the WebGL texture   		
		var texture = gl.createTexture();
       
        gl.bindTexture( gl.TEXTURE_2D, texture );
				
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );        		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );				
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );				   
				
		gl.bindTexture( gl.TEXTURE_2D, null );
	
		return texture;                               
	
}

function getAtlasCharRegion( asciiChar ) {
			
		var code = (asciiChar).charCodeAt(0);
		
		var scale = 1.0 / 1024;
		
		var left   = ( code % 16 ) * 64 * scale;
		var right  = ( ( code % 16 ) + 1 ) * 64 * scale;
		var bottom = 1.0 - ( ( Math.floor( code / 16 ) + 1 ) * 64 * scale ); 
		var top    = 1.0 - ( Math.floor( code / 16 ) * 64 * scale );
		
		return {
			left: left,
			right: right,
			bottom: bottom,
			top: top
		};
	
}


// test function (could be deleted)
function insertHTMLLabelElement ( id, width, height ) {
	
		// Create the label element
		var labelElement = document.createElement( 'div' );
	
		// Assign div attributes
		labelElement.id     = id;
		labelElement.style.width  = width;
		labelElement.style.height = height;
		
		// Position the div
		labelElement.style.position = "absolute";
		labelElement.style.left = "100";
		labelElement.style.bottom = "200";
		
		labelElement.style.display = "none";
		
		labelElement.innerHTML = "Test"
		
		// Add the canvas to the document body
		document.body.appendChild( labelElement );
}

// test function
function insertHTML5LabelCanvas ( config ) {
	
		var config = config || {};
		
		config.fillStyle = config.fillStyle ? config.fillStyle : "#CCCCCC";
	
		// Create the canvas	
		var canvas = document.createElement( 'canvas' );
		
		// Assign canvas attributes
		canvas.id     = "labelCanvas";
		canvas.width  = config.width;
		canvas.height = config.height;
		
		// Hide the canvas
		//canvas.style.position = "absolute";
		canvas.style.display = "none";
		//canvas.style.left = "0px";
		//canvas.style.top = "0px";
		
		// Add the canvas to the document body
		document.body.appendChild( canvas );
		
		//text : node.name, 
		//id : node.graphId, 
		//width : 256, 
		//height : 256,
		//fillStyle: this.settings.nodeTextColor,
		//font: '30px Helvetica Neue' 
		
		// Get the canvas context
        canvas.context = canvas.getContext( '2d' );
        
        // Clear the canvas
        canvas.context.clearRect( 0, 0, canvas.width, canvas.height );
        
        // This determines the text color, it can take a hex value or rgba value (e.g. rgba(255,0,0,128))
        canvas.context.fillStyle = config.fillStyle; 
        
        // This determines the alignment of text, e.g. left, center, right
        canvas.context.textAlign = "center";             
        
        // This determines the baseline of the text, e.g. top, middle, bottom
        canvas.context.textBaseline = "middle";            
        
        // This determines the size of the text and the font family used
        canvas.context.font = "10px Helvetica Neue";      
        
        //findMaxFontSize( params.text, context, params.width );
        // Write text to the canvas with an x position of half the canvas width and a y position 50 pixels down from the top
        //canvas.context.fillText( "This is a test", canvas.width * 0.5, canvas.height * 0.5 );   
		
		// Return the canvas
		return canvas;
	
}

var insertHTML5Canvas = function ( id, width, height ) {
	
		// Create the canvas	
		var canvas = document.createElement( 'canvas' );
		
		// Assign canvas attributes
		canvas.id     = id;
		canvas.width  = width;
		canvas.height = height;
		
		// Hide the canvas
		canvas.style.display = "none";
		
		// Add the canvas to the document body
		document.body.appendChild( canvas );			
		
		// Return the canvas
		return canvas;
	
}
/*
var createCanvasTexture = function ( params ) {
		
		// Create the HTML5 canvas
		var canvas = insertHTML5Canvas( params.id, params.width, params.height );
             
        // Get the canvas context
        var context = canvas.getContext( '2d' );
        
        // Clear the canvas
        context.clearRect( 0, 0, canvas.width, canvas.height );
        
        // This determines the text color, it can take a hex value or rgba value (e.g. rgba(255,0,0,128))
        context.fillStyle = params.fillStyle; 
        
        // This determines the alignment of text, e.g. left, center, right
        context.textAlign = "center";               
        
        // This determines the baseline of the text, e.g. top, middle, bottom
        context.textBaseline = "middle";            
        
        // This determines the size of the text and the font family used
        context.font = params.font;      
        
        //findMaxFontSize( params.text, context, params.width );
        // Write text to the canvas with an x position of half the canvas width and a y position 50 pixels down from the top
        context.fillText( params.text, canvas.width * 0.5, canvas.height * 0.5 );      
            
		// WebGL code to create the WebGL texture
		var texture = gl.createTexture();
       
        gl.bindTexture( gl.TEXTURE_2D, texture );
				
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );        		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );				
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );				   
				
		gl.bindTexture( gl.TEXTURE_2D, null );
	
		return texture;
}
*/

/**
 * 
 */

$3DJS.Scene = $3DJS.Scene || { };

$3DJS.Scene = function ( config ) {
	
		this.objects = [];		
	
}

$3DJS.Scene.prototype = {
	
		add: function ( object ) {
			
				this.objects.push( object );
			
		},
		
		render: function ( ) {
			
				for ( var i=0; i < this.objects.length; ++i ) {
					
						this.objects[i].render();
					
				}
			
		}
	
};

/** 
 * WebGL Renderer
 */

$3DJS.Renderer = $3DJS.Renderer || { };

//$3DJS.Renderer.WebGL = $3DJS.Renderer.WebGL || { };

$3DJS.Renderer = function ( config ) {
	
		config = config || { };
	
		var settings = {
			backgroundColor: config.backgroundColor ? config.backgroundColor : [ 1.0, 1.0, 1.0, 1.0 ]
		};
	
		this.backgroundColor = [];
		this.zNear = 1.0;
		this.zFar  = 10000.0;
	
		this.scene = undefined;
	
		this.initialize( settings ); 
	
} 

$3DJS.Renderer.prototype = {
	
		initialize: function ( settings ) {
			
				this.backgroundColor = settings.backgroundColor
				
				//this.tick();
			
		},
		
		render: function ( scene ) {
						
		    	gl.clearColor( this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], this.backgroundColor[3] );
		       	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		
				// Define viewport
				gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
		   	 	
		   	 	// Perspective transformation
		       	mat4.perspective( 45, gl.canvas.width / gl.canvas.height, 1.0, 100000.0, $3DJS.PMatrix );
				
				// Modelview transformation
		       	mat4.identity( $3DJS.MVMatrix );     
		       	mat4.translate( $3DJS.MVMatrix, 0.0, 0.0, -50 );                  
		       	mat4.multiply( $3DJS.MVMatrix, $3DJS.interactor.transform, $3DJS.MVMatrix );
		       	  
		       	//quadArray.render( ); 
		       	   
		       	// Render the graph
		       	           
		      	//  graph.render2( );
		      	scene.render();

		}
		
	
	
};


/**
 * Scene and Objects
 * Description: Container for all objects in the scene.
 * 
 */

function Scene ( ) {
		
		// Array Containing All Scene Objects
		this.object = [];
		
		// Camera
		// this.camera = new Camera ( );	
		
		// Input
		// Lights
	
}

Scene.prototype.render = function ( gl ) { 

		var object = this.object;
		var i = this.object.length;		
		
		while ( i-- ) {
			
				object[i].render( );
			
		} 		
	
}

function Object3D ( ) {
	
		this.vertices 	= [ ];
		
	
}

function testObject ( ) {
	
		Object3D.call( this );
	
}

function testObject2 ( ) {
	
		Object3D.call( this );
	
}

// May need to change this to be more abstract (i.e. drawing graphs may not be the same as a cube )
function SceneObject ( ) {
		
		// Vertex data buffers associated with this object
		this.vertexAttribArrayBuffers = [ ];
		
		// Element array buffer
		this.elementArrayBuffer = undefined;
		
		// Data arrays
		this.vertices 	= [ ];
		this.texCoords 	= [ ];
		this.color 		= [ ];
		this.indices 	= [ ];
	
		// Texture handle
		this.texture = undefined;   		// NOTE: should probably be changed to an array later
		
		// Shader stack used to render the object
		this.shaderProgram = [ ];
		
		// Rendering function
		this.renderFunc = undefined;
		
		// Can the object be interacted with?
		//this.pickable = false;
					
}

SceneObject.prototype.render = function ( ) {
	
		this.renderFunc( );
	
}

SceneObject.prototype.renderLines = function ( ) {
	
		program = this.shaderProgram[0];   		   		
       	gl.useProgram( program );
			 								   	
	   	vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
	   	attributes = this.shaderProgram[0].attributes;   
	   	
	   	// Enable vertex buffer objects   					   			
	   	gl.bindBuffer( vertexAttribArrayBuffers[ 'position' ].target, vertexAttribArrayBuffers[ 'position' ].id );	 
	   	gl.enableVertexAttribArray( attributes[ 'position' ] );  			
	   	gl.vertexAttribPointer( attributes[ 'position' ], vertexAttribArrayBuffers[ 'position' ].size, gl.FLOAT, false, 0, 0);
	   	
	   	gl.bindBuffer( vertexAttribArrayBuffers[ 'color' ].target, vertexAttribArrayBuffers[ 'color' ].id );	 
	   	gl.enableVertexAttribArray( attributes[ 'color' ] );  			
	   	gl.vertexAttribPointer( attributes[ 'color' ], vertexAttribArrayBuffers[ 'color' ].size, gl.FLOAT, false, 0, 0);
  
	   	
	   	// Bind uniforms that are constant for all nodes in the cascade
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
	  	
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
	   	gl.drawElements( gl.LINES, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			

       	// Disable vertex buffer objects       	
		gl.disableVertexAttribArray( attributes[ 'position' ] );
		gl.disableVertexAttribArray( attributes[ 'color' ] ); 
       	
}


// Renders a simple shape using only color
SceneObject.prototype.renderSimpleShape = function ( ) {

		var program = this.shaderProgram[0];   		   		
       	gl.useProgram( program );
			 								   	
	   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
	   	var attributes = this.shaderProgram[0].attributes;   
	   	
	   	// Enable vertex buffer objects	   	
		gl.bindBuffer( vertexAttribArrayBuffers['position'].target, vertexAttribArrayBuffers['position'].id );	 
		gl.enableVertexAttribArray( attributes['position'] );  			
		gl.vertexAttribPointer( attributes['position'], vertexAttribArrayBuffers['position'].size, gl.FLOAT, false, 0, 0);	   	
		
		gl.bindBuffer( vertexAttribArrayBuffers['color'].target, vertexAttribArrayBuffers['color'].id );	 
		gl.enableVertexAttribArray( attributes['color'] );  			
		gl.vertexAttribPointer( attributes['color'], vertexAttribArrayBuffers['color'].size, gl.FLOAT, false, 0, 0);				  	 
	   	
	   	// Bind projection and modelview matrices
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
	  		  	     			   		   	 	 
	  	// Draw the shape  		  	   		    
	   	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.vertexAttribArrayBuffers['position'].count );
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
	   	gl.drawElements( gl.TRIANGLE_STRIP, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
       	  
		// Disable vertex buffer objects
		gl.disableVertexAttribArray( attributes['position'] );  
       	gl.disableVertexAttribArray( attributes['color'] );       			
       	   	       			
}



SceneObject.prototype.renderWireframeCircle = function ( ) {

		// Bind shading program
		var program = this.shaderProgram[0];   		   		
       	gl.useProgram( program );
			 								   	
	   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
	   	var attributes = this.shaderProgram[0].attributes;   
	   	
	   	// Bind vertex array buffers
	   	for ( var i in vertexAttribArrayBuffers ) {
	   			   					   			
	   			gl.bindBuffer( vertexAttribArrayBuffers[ i ].target, vertexAttribArrayBuffers[ i ].id );	 
	   			gl.enableVertexAttribArray( attributes[ i ] );  			
	   			gl.vertexAttribPointer( attributes[ i ], vertexAttribArrayBuffers[ i ].size, gl.FLOAT, false, 0, 0);
	   			
	   	}	  
	   	
	   	// Bind projection and modelview matrices
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    
		// Render the wireframe circle	  		  	     			   		   	 	   		  	   		    
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
	   	gl.drawElements( gl.LINE_STRIP, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
       	  
       	//for ( var i = this.buffers.length - 1; i >= 0; --i ) {
       	for ( var i in vertexAttribArrayBuffers ) {
       	
       			gl.disableVertexAttribArray( attributes[ i ] );
       			
       	}   	
       	   	       			
}

SceneObject.prototype.renderSimpleObject = function ( ) {

		var program = this.shaderProgram[0];   		   		
       	gl.useProgram( program );
			 								   	
	   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
	   	var attributes = this.shaderProgram[0].attributes;   
	   		   
	   	for ( var i in vertexAttribArrayBuffers ) {
	   			   					   			
	   			gl.bindBuffer( vertexAttribArrayBuffers[ i ].target, vertexAttribArrayBuffers[ i ].id );	 
	   			gl.enableVertexAttribArray( attributes[ i ] );  			
	   			gl.vertexAttribPointer( attributes[ i ], vertexAttribArrayBuffers[ i ].size, gl.FLOAT, false, 0, 0);
	   			
	   	}	  
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    	 
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
	   	gl.drawElements( gl.TRIANGLES, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
       	         
       	for ( var i in vertexAttribArrayBuffers ) {
       	
       			gl.disableVertexAttribArray( attributes[ i ] );
       			
       	}   	
       	   	       			
}

SceneObject.prototype.renderTexturedObject = function ( ) {

		var program = this.shaderProgram[0];   		   		
       	gl.useProgram( program );
			 								   	
	   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
	   	var attributes = this.shaderProgram[0].attributes;   
	   		   
	   	for ( var i in vertexAttribArrayBuffers ) {
	   			   					   			
	   			gl.bindBuffer( vertexAttribArrayBuffers[ i ].target, vertexAttribArrayBuffers[ i ].id );	 
	   			gl.enableVertexAttribArray( attributes[ i ] );  			
	   			gl.vertexAttribPointer( attributes[ i ], vertexAttribArrayBuffers[ i ].size, gl.FLOAT, false, 0, 0);
	   			
	   	}	  
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    	 
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
	   	gl.drawElements( gl.TRIANGLES, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
       	         
       	for ( var i in vertexAttribArrayBuffers ) {
       	
       			gl.disableVertexAttribArray( attributes[ i ] );
       			
       	}   	
       	   	       			
}

/*
SceneObject.prototype.renderPointSprite = function ( gl ) {
	
		var program = this.shaderProgram.program;
		
		// Select shader(s) to render the scene object
		gl.useProgram( program );
	
		gl.bindBuffer( this.vbo.target, this.vbo.id ); 	
		
	   	gl.enableVertexAttribArray( program.vertexPositionAttribute );
	   	gl.vertexAttribPointer( program.vertexPositionAttribute, this.vbo.size, gl.FLOAT, false, 0, 0);
	   	
	   	gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		gl.uniform1i( program.samplerUniform, 0 );
	      
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, gl.pMatrixStack[ gl.pMatrixStack.length - 1 ].slice( 0 ) );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrixStack[ $3DJS.MVMatrixStack.length -1 ].slice( 0 ) );       	
	   	
	   	gl.uniform1f( program.pointSizeUniform, 64 );  
	   		   	     
	   	gl.drawArrays( gl.POINTS, 0, this.vbo.count );

}
*/
SceneObject.prototype.renderBillboard = function ( ) {

		var program = this.shaderProgram[0].program;   		   		
       	gl.useProgram( program );
			 								   	
	   	var buffers = this.buffers;
	   	var attributes = this.shaderProgram[0].attributes;   
	   	
	   	for ( var i = buffers.length - 1; i >= 0; --i ) {
	   			   					   			
	   			gl.bindBuffer( buffers[ i ].target, buffers[ i ].id );	 
	   			gl.enableVertexAttribArray( attributes[ i ] );  			
	   			gl.vertexAttribPointer( attributes[ i ], buffers[ i ].size, gl.FLOAT, false, 0, 0);
	   			
	   	}	  
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );
	  		  	
	  	gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		gl.uniform1i( program.samplerUniform, 0 );       	
		   		   	 	   		  
	   	for ( var i = 0; i < 1000; ++i ) {
	   		
	   			gl.uniform3fv( program.worldPosUniform, userSystem.users[0].accessReports[i].position ); 
	   			gl.uniform1f( program.scaleUniform, 5 ); 
	   			gl.uniform3fv( program.colorUniform, [0, 1, 0] );
	   		    
	   			gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.buffers[0].count );
	   	}      
       	  
       	for ( var i = this.buffers.length - 1; i >= 0; --i ) {
       	
       			gl.disableVertexAttribArray( attributes[ i ] );
       			
       	}   	
       	   	       			
}

SceneObject.prototype.renderGrid = function ( ) {

		var program = this.shaderProgram[0].program;   		   		
       	gl.useProgram( program );
			 								   	
	   	var buffers = this.buffers;	   	
	   	var attributes = this.shaderProgram[0].attributes;	   
	   	
	   	for ( var i = buffers.length - 1; i >= 0; --i ) {
	   			   					   			
	   			gl.bindBuffer( buffers[ i ].target, buffers[ i ].id );	 
	   			gl.enableVertexAttribArray( attributes[ i ] );  			
	   			gl.vertexAttribPointer( attributes[ i ], buffers[ i ].size, gl.FLOAT, false, 0, 0);
	   			
	   	}	  
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );
	  	      	
	   	
	   	gl.drawArrays( gl.LINES, 0, buffers[0].count );
	   	
	   	for ( var i = this.buffers.length - 1; i >= 0; --i ) {
       	
       			gl.disableVertexAttribArray( attributes[ i ] );
       			
       	}     
       	            	    				 	       	       			
}

/**
 * Fullscreen quad for text and image overlays.
 * 
 */

function FullScreenQuad ( ) {
	
		// Vertex data
        this.vertices = [
        
	            -1.0, -1.0,  0.0,
	            -1.0,  1.0,  0.0,
	             1.0, -1.0,  0.0,
	             1.0,  1.0,  0.0
	            	             	        
        ];
                     	   		
		// Texture coordinate data
        this.texCoords = [
        
	            0.0, 0.0,
	            0.0, 1.0,
	            1.0, 0.0,
	            1.0, 1.0
            
        ];
        
        // Index data
        this.indices = [ 0, 1, 2, 3 ];		
		
		// Initialize texture
		this.texture = undefined;
		
		// Vertex data buffers associated with this object
		this.vertexAttribArrayBuffers = [ ];
		
		// Element array buffer
		this.elementArrayBuffer = [ ];
		
		// Shader stack used to render the object
		this.shaderProgram = [ ];
		
        // Initialize scene object variables ( buffers, shaders, rendering function )                      
        this.vertexAttribArrayBuffers['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, 4, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords ), 2, 4, gl.STATIC_DRAW );    
        this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, 4, gl.STATIC_DRAW );             	   
    	this.shaderProgram.push( loadShader( 'fullScreenQuad', setupFullScreenQuadShader ) );
    	this.drawMode = gl.TRIANGLE_STRIP;
	
}


FullScreenQuad.prototype = {
	
		updateTexture: function ( texture ) {
		
				gl.bindTexture( gl.TEXTURE_2D, this.texture );				
				gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture );	
				gl.bindTexture( gl.TEXTURE_2D, null );
				
		},
		
		render: function ( ) {
	
				// Push identity matrix onto projection matrix stack
				mvPushMatrix( );
				mat4.identity( $3DJS.MVMatrix );
				
				// Push identity matrix on modelview matrix stack
				pPushMatrix( );
				mat4.identity( $3DJS.PMatrix );
			
				var program = this.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
			   	var attributes = this.shaderProgram[0].attributes;   
			   		   	
			   	for ( var i in vertexAttribArrayBuffers ) {
			   			   					   			
			   			gl.bindBuffer( vertexAttribArrayBuffers[ i ].target, vertexAttribArrayBuffers[ i ].id );	 
			   			gl.enableVertexAttribArray( attributes[ i ] );  			
			   			gl.vertexAttribPointer( attributes[ i ], vertexAttribArrayBuffers[ i ].size, gl.FLOAT, false, 0, 0);
			   			
			   	}	  
			   	
			   	// Bind uniforms
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  	
			  	gl.activeTexture( gl.TEXTURE0 );
				gl.bindTexture( gl.TEXTURE_2D, this.texture );
				gl.uniform1i( program.samplerUniform, 0 );
				
				// Enable blending
				gl.disable( gl.DEPTH_TEST );
				gl.enable( gl.BLEND );
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
			  	
			  	// Draw full screen quad	  	     			   		   	 	   		  	   		    
			   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
			   	gl.drawElements( this.drawMode, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
		       	         	
		       	for ( var i in vertexAttribArrayBuffers ) {
		       	
		       			gl.disableVertexAttribArray( attributes[ i ] );
		       			
		       	}   
		       	
		       	// Disable blending
		       	gl.disable( gl.BLEND );
		       	gl.enable( gl.DEPTH_TEST);
														
				// Pop identity matrix from the modelview matrix stack
				pPopMatrix( );
				
				// Pop identity matrix from the projection matrix stack
				mvPopMatrix( );
					
		}
		
}


/**
 * Geometric objects (triangle, quad, circle, cube, sphere, etc.).
 * @author Mike Wakid
 */

$3DJS.Geometry = function () {
	
	
}

/**
 * Lines.
 */
Lines.prototype = new SceneObject( );
Lines.prototype.constructor = Lines;

function Lines ( ) {
	
		this.numLines = 1;
		
		// temporary
		// Vertex data
		this.vertices = [
		
				-1.0, 0.0, 0.0,
				 1.0, 0.0, 0.0,
		
		];
		
		// Color data
		this.color = [ 
		
				0.7, 0.7, 0.7, 0.7,
				0.7, 0.7, 0.7, 0.7
		
		];
		
		// Index data
        this.indices = [ 
        
        		0, 
        		1         		 
        		
        ];
	
		// Initialize scene object variables ( buffers, shaders, rendering function )                      
        this.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, 2, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, 2, gl.STATIC_DRAW );    
        this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, 2 * this.numLines, gl.STATIC_DRAW );             	   
    	this.shaderProgram.push( loadShader( 'lines', setupLineShader ) );
    	// this.renderFunc = this.renderLines;  // this has to be defined 
		
}


/**
 * This object is for optimizing rendering performance when a large number of lines (e.g. edges in a graph) 
 * must be rendered to the screen.
 * 
 * @class
 * @param {object} data Stores properties to initialize a quad object.
 * @param {number} data.width The width of each quad.
 * @param {number} data.height The height of each quad.
 * @param {integer} data.numQuads The number of quad objects to be rendered.
 * @param {array} data.color a 4-D array to indicate the default color of each quad, in the format [r, g, b, a], with values from [0, 1].
 */

$3DJS.LineArray = function ( data ) {
	
		data = data || { };	
		
		this.numLines = data.numLines || 0.0;
			
		this.vertices  = [ ];     
		this.color     = [ ];		
		this.indices   = [ ];
		
		var color = data.color || [ 1.0, 1.0, 1.0, 1.0 ];

		// Vertex data buffers associated with this object
		this.vertexAttribArrayBuffers = [ ];
		
		// Element array buffer
		this.elementArrayBuffer = [ ];
		
		// Shader stack used to render the object
		this.shaderProgram = [ ];
		
		// Determine how many element array buffers will be needed for the data
		// WebGL currently has a limit of 65,536 (2^16) indices
		// 2 indices are required per line
		
		this.maxLinesPerBuffer  = Math.floor( 65536 / 2 );   // This value should only change if we store the quad geometry differently
		this.numRequiredBuffers = Math.ceil( this.numLines / this.maxLinesPerBuffer );
		this.currentBufferIndex = -1;
		
		//console.log( this.maxQuadsPerBuffer + " " + this.numRequiredBuffers );
		
		for ( var i=0; i < this.numRequiredBuffers; ++i ) {				

				this.vertices[i]   = [ ];      
				this.color[i]      = [ ];
				this.indices[i]    = [ ];
				
				this.vertexAttribArrayBuffers[i] = [ ];			

				// Fill the vertex buffer object arrays
				for ( var j=0; j < this.maxLinesPerBuffer; ++j ) {									
					
						// break when all quads have been processed
						if ( i*j + j == this.maxLinesPerBuffer ) break;											
			
						// Vertex data			
							
				        this.vertices[i].push(
				        
					           -this.width * 0.5, -this.height * 0.5,  0.0,
					           -this.width * 0.5,  this.height * 0.5,  0.0,
					            this.width * 0.5, -this.height * 0.5,  0.0,	           
					            this.width * 0.5,  this.height * 0.5,  0.0
					            	             	        
				        );
				        
				        var pos_x = Math.random() * 6000 - 3000;	
						var pos_y = Math.random() * 6000 - 3000;
						var pos_z = Math.random() * 6000 - 3000;
				        
				        this.worldPos[i].push(
				       
				       			pos_x, pos_y, pos_z,
				       			pos_x, pos_y, pos_z,
				       			pos_x, pos_y, pos_z,
				       			pos_x, pos_y, pos_z
									        	
				        );
				           
				        // Color data        
				        this.color[i].push(
				        
					        	color[0], color[1], color[2], color[3],
					        	color[0], color[1], color[2], color[3],
					        	color[0], color[1], color[2], color[3],
					        	color[0], color[1], color[2], color[3]
				        
				        );
				                 	
						// Texture coordinate data
				        this.texCoords[i].push(
				        
					            0.0, 0.0,
					            0.0, 1.0,
					            1.0, 0.0,	          	         
					            1.0, 1.0
				            
				        );	
				 
				 		// Index data
		        		this.indices[i].push( 
		        			
		        				4*j + 0,
		        				4*j + 1,
		        				4*j + 2,
		        				4*j + 1,
		        				4*j + 2,
		        				4*j + 3
		        				
		        		);
				        
		       	}  
		       
		       	// Initialize scene object variables ( buffers, shaders, rendering function )               
		        this.vertexAttribArrayBuffers[i]['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices[i] ),  3, this.vertices[i].length / 3, gl.STATIC_DRAW );		               
		        this.vertexAttribArrayBuffers[i]['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color[i] ),     4, this.color[i].length / 4, gl.STATIC_DRAW );   		        
		        this.drawMode = gl.LINES;
		        this.elementArrayBuffer[i] = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices[i] ), 1, this.indices[i].length, gl.STATIC_DRAW );
		       	
		}
		
		this.drawMode = gl.LINES;
                               	  
    	this.shaderProgram.push( loadShader( 'lines', setupLineShader ) ); 
	
}

$3DJS.LineArray.prototype = {
	
		// adds a line (2 vertex positions) to the end of the line array
		addLine: function ( config ) {
			
				config = config || { };
				
				config.color = config.color ? config.color : [ 0.0, 1.0, 0.0, 1.0 ];
			
				// add 1 to the number of total quads
				++this.numLines;
				
				// recalculate the required number of buffers
				this.calcNumRequiredBuffers( );
				
				var i = this.currentBufferIndex;
				
				var p1 = config.p1;
				var p2 = config.p2;
				
				this.vertices[i].push(
				        
			           p1[0], p1[1], p1[2],
			           p2[0], p2[1], p2[2]
			           
		        );		        		      
		        		           
		        // Color data        
		        this.color[i].push(
		        
			        	config.color1[0], config.color1[1], config.color1[2], config.color1[3],
			        	config.color2[0], config.color2[1], config.color2[2], config.color2[3]
		        
		        );
		                 	
		 		var j = ( this.numLines - 1 ) % this.maxLinesPerBuffer;
		 	
		 		// Index data
        		this.indices[i].push( 
        			
        				2*j + 0,
        				2*j + 1
        				
        		);
        		        			
		},
		
		updateVertex: function ( index, position ) {
			
				// 196608 = 2^16 * 3 					
				var bufferIndex = Math.floor ( index / 196608 );
				index = index % 196608;				
								
				this.vertices[bufferIndex][index + 0] = position[0];
				this.vertices[bufferIndex][index + 1] = position[1];
				this.vertices[bufferIndex][index + 2] = position[2];  
			
		},
		
		updateColor: function ( index, color ) {
			
				var bufferIndex = Math.floor ( index / 262144 );
				index = index % 262144;				
								
				this.color[bufferIndex][index + 0] = color[0];
				this.color[bufferIndex][index + 1] = color[1];
				this.color[bufferIndex][index + 2] = color[2]; 
				this.color[bufferIndex][index + 3] = color[3]; 
			
		},
		
		// this function must be called anytime a new quad is added to the array
		calcNumRequiredBuffers: function ( ) {
			
				this.numRequiredBuffers = Math.ceil( this.numLines / this.maxLinesPerBuffer );
				
				if ( ( this.currentBufferIndex + 1 ) != this.numRequiredBuffers ) {
					
						++this.currentBufferIndex;
						
						var i = this.currentBufferIndex;
						
						this.vertices[i]   = [ ];						
						this.color[i]      = [ ];						
						this.indices[i]    = [ ];
												
						this.vertexAttribArrayBuffers[i] = [ ];		
									
				} 
			
		},
		
		updateVertexBuffers: function ( ) {
			
				for ( var i=0; i < this.numRequiredBuffers; ++i ) {
			
						// Initialize scene object variables ( buffers, shaders, rendering function )               
				        this.vertexAttribArrayBuffers[i]['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices[i] ), 3, this.vertices[i].length / 3, gl.STATIC_DRAW );				               
				        this.vertexAttribArrayBuffers[i]['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color[i] ),    4, this.color[i].length / 4, gl.STATIC_DRAW );   				        				        
				        this.elementArrayBuffer[i] = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices[i] ), 1, this.indices[i].length, gl.STATIC_DRAW );
				        
				}
			
		},
		
		// this is incorrect for this type of object, change when needed
		setColor: function ( r, g, b, a ) {
	
				this.color = [
			        
			        	r, g, b, a,
			        	r, g, b, a,
			        	r, g, b, a,
			        	r, g, b, a
		        
		        ];
		        
		        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
				gl.bindBuffer( gl.ARRAY_BUFFER, null );  
					
		}, 
	
		render: function ( ) {
			
				var program = this.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 						
				for ( var i=0; i < this.numRequiredBuffers; ++i ) {						 						
					 								   	
					   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers[i];
					   	var attributes = this.shaderProgram[0].attributes;   
					   	
					   	// Enable vertex buffer objects 
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
						   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
						   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
					   		
					   	}
				  		   	
					   	// Bind uniforms that are constant for all nodes in the cascade
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
					  	
					   	gl.bindBuffer( this.elementArrayBuffer[i].target, this.elementArrayBuffer[i].id );
					   	gl.drawElements( this.drawMode, this.elementArrayBuffer[i].count, gl.UNSIGNED_SHORT, 0 );	   			
				
				       	// Disable vertex buffer objects 
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.disableVertexAttribArray( attributes[ attrib ] );
						   		
					   	} 
					   	
			   	}
			
		} 
	
}

/**
 * Triangles
 */
Triangle.prototype = new SceneObject( );
Triangle.prototype.constructor = Triangle;

function Triangle ( base, height ) {
	
		base   = base   || 1;
		height = height || 1;
		
		// Vertex data
        this.vertices = [
        
	           -base * 0.5, -height * 0.5,  0.0,
	            base * 0.5, -height * 0.5,  0.0,
	           		   0.0,  height * 0.5,  0.0
	           	            	             	        
        ];      
		
		// Texture coordinate data
        this.texCoords = [
        
	            0.0, 0.0,
	            1.0, 0.0,
	            0.5, 1.0
            
        ];	
        
        // Color data
        this.color = [
        
	        	1.0, 1.0, 1.0, 1.0,
	        	1.0, 1.0, 1.0, 1.0,
	        	1.0, 1.0, 1.0, 1.0
        
        ];
        
        // Index data
        this.indices = [ 
        
        		0, 
        		1, 
        		2 
        		
        ];
        
        // Initialize scene object variables ( buffers, shaders, rendering function )                      
        this.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, 3, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, 3, gl.STATIC_DRAW );    
        this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, 3, gl.STATIC_DRAW );             	   
    	this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) );
    	this.renderFunc = this.renderSimpleShape;   
        
}

Triangle.prototype.setColor = function ( r, g, b, a ) {
		
		this.color = [
	        
	        	r, g, b, a,
	        	r, g, b, a,
	        	r, g, b, a
        
        ];
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );        
			
}

/**
 * 3DJS quad object.
 *
 * @class
 * @param {Object} config Configuration of the quad
 * @param {Number} config.width Width of the quad. Defaults to 1.0 if not specified.
 * @param {Number} config.height Height of the quad. Defaults to 1.0 if not specified.
 * @param {Array}  config.color Color of the quad, specified as a 4D array in rgba format with values in the range [0, 1]. Defaults to [1.0, 1.0, 1.0, 1.0].
 */

$3DJS.Quad = function ( data ) {
	
		this.width  = data.width  || 1.0;
		this.height = data.height || 1.0;
	
		// Vertex data
        this.vertices = [
        
	           -this.width * 0.5, -this.height * 0.5,  0.0,
	           -this.width * 0.5,  this.height * 0.5,  0.0,
	            this.width * 0.5, -this.height * 0.5,  0.0,	           
	            this.width * 0.5,  this.height * 0.5,  0.0
	            	             	        
        ];
        
        var color = data.color || [ 1.0, 1.0, 1.0, 1.0 ];
            
        // Color data        
        this.color = [
        
	        	color[0], color[1], color[2], color[3],
	        	color[0], color[1], color[2], color[3],
	        	color[0], color[1], color[2], color[3],
	        	color[0], color[1], color[2], color[3]
        
        ];
                 	
		// Texture coordinate data
        this.texCoords = [
        
	            0.0, 0.0,
	            0.0, 1.0,
	            1.0, 0.0,	          	         
	            1.0, 1.0
            
        ];	
        
        // Index data
        this.indices = [ 0, 1, 2, 3 ];
        
        // Initialize texture
		this.texture = undefined; //gl.createTexture( );
		/*gl.bindTexture( gl.TEXTURE_2D, this.texture );		
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );		      		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);			
		gl.bindTexture( gl.TEXTURE_2D, null );*/
		
		// Vertex data buffers associated with this object
		this.vertexAttribArrayBuffers = [ ];
		
		// Element array buffer
		this.elementArrayBuffer = undefined;
		
		// Shader stack used to render the object
		this.shaderProgram = [ ];
        	
        // Initialize scene object variables ( buffers, shaders, rendering function )               
        this.vertexAttribArrayBuffers['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, 4, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, 4, gl.STATIC_DRAW );   
        this.vertexAttribArrayBuffers['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords ), 2, 4, gl.STATIC_DRAW );
        this.drawMode = gl.TRIANGLE_STRIP;
        this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, 4, gl.STATIC_DRAW );                 	   
    	this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) ); 
           	
}

$3DJS.Quad.prototype = {
		
		setColor: function ( r, g, b, a ) {
	
				this.color = [
			        
			        	r, g, b, a,
			        	r, g, b, a,
			        	r, g, b, a,
			        	r, g, b, a
		        
		        ];
		        
		        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
				gl.bindBuffer( gl.ARRAY_BUFFER, null );  
					
		}, 
	
		render: function ( ) {
			
				var program = this.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
			   	var attributes = this.shaderProgram[0].attributes;   
			   	
			   	// Enable vertex buffer objects	   	
				gl.bindBuffer( vertexAttribArrayBuffers['position'].target, vertexAttribArrayBuffers['position'].id );	 
				gl.enableVertexAttribArray( attributes['position'] );  			
				gl.vertexAttribPointer( attributes['position'], vertexAttribArrayBuffers['position'].size, gl.FLOAT, false, 0, 0);	   	
				
				gl.bindBuffer( vertexAttribArrayBuffers['color'].target, vertexAttribArrayBuffers['color'].id );	 
				gl.enableVertexAttribArray( attributes['color'] );  			
				gl.vertexAttribPointer( attributes['color'], vertexAttribArrayBuffers['color'].size, gl.FLOAT, false, 0, 0);				  	 
			   	
			   	// Bind projection and modelview matrices
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  		  	     			   		   	 	 
			  	// Draw the shape  		  	   		    
			   	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.vertexAttribArrayBuffers['position'].count );
			   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
			   	gl.drawElements( gl.TRIANGLE_STRIP, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
		       	  
				// Disable vertex buffer objects
				gl.disableVertexAttribArray( attributes['position'] );  
		       	gl.disableVertexAttribArray( attributes['color'] ); 
			
		} 
	
}

$3DJS.Quad.prototype.updateTexture = function ( texture ) {
	
		gl.bindTexture( gl.TEXTURE_2D, this.texture );				
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture );	
		gl.bindTexture( gl.TEXTURE_2D, null );
	
}

/**
 * This object is for optimizing rendering performance when a large number of quads must be
 * rendered to the screen. This approch will work for most situations except when a unique 
 * texture is needed for each node (e.g. social network avatars).
 * 
 * @class
 * @param {object} data Stores properties to initialize a quad object.
 * @param {number} data.width The width of each quad.
 * @param {number} data.height The height of each quad.
 * @param {integer} data.numQuads The number of quad objects to be rendered.
 * @param {array} data.color a 4-D array to indicate the default color of each quad, in the format [r, g, b, a], with values from [0, 1].
 */

$3DJS.QuadArray = function ( data ) {
	
		data = data || {};

		this.width  = data.width  || 1.0;
		this.height = data.height || 1.0;
		this.scale  = data.scale  || 1.0;
		
		this.numQuads = data.numQuads || 0.0;
			
		this.vertices  = [ ];
		this.worldPos  = [ ];     
		this.color     = [ ];
		this.texCoords = [ ];
		this.colorId   = [ ];
		//this.scale     = [ ];
		this.indices   = [ ];
		this.visible   = [ ];    // this array will allow us to hide and show regions of the quad array when we pack multiple objects into it
		
		var color = data.color || [ 1.0, 1.0, 1.0, 1.0 ];
		
		// Initialize texture
		this.texture = undefined; 
		
		// Vertex data buffers associated with this object
		this.vertexAttribArrayBuffers = [ ];
		
		// Element array buffer
		this.elementArrayBuffer = [ ];
		
		// Shader stack used to render the object
		this.shaderProgram = [ ];
		
		// Determine how many element array buffers will be needed for the data
		// WebGL currently has a limit of 65,536 (2^16) indices
		// 6 indices are required per quad
		
		this.maxQuadsPerBuffer  = Math.floor( 65536 / 6 );   // This value should only change if we store the quad geometry differently
		this.numRequiredBuffers = Math.ceil( this.numQuads / this.maxQuadsPerBuffer );
		this.currentBufferIndex = -1;
		
		//console.log( this.maxQuadsPerBuffer + " " + this.numRequiredBuffers );
		
		for ( var i=0; i < this.numRequiredBuffers; ++i ) {
							

				this.vertices[i]   = [ ];
				this.worldPos[i]   = [ ];      
				this.color[i]      = [ ];
				this.texCoords[i]  = [ ];
				//this.scale[i]      = [ ];
				this.colorId[i]    = [ ];
				this.indices[i]    = [ ];
				this.visible[i]    = [ ];
				
				this.vertexAttribArrayBuffers[i] = [ ];			

				// Fill the vertex buffer object arrays
				for ( var j=0; j < this.maxQuadsPerBuffer; ++j ) {									
					
						// break when all quads have been processed
						if ( i*j + j == this.numQuads ) break;											
			
						// Vertex data			
							
				        this.vertices[i].push(
				        
					           -this.width * 0.5, -this.height * 0.5,  0.0,
					           -this.width * 0.5,  this.height * 0.5,  0.0,
					            this.width * 0.5, -this.height * 0.5,  0.0,	           
					            this.width * 0.5,  this.height * 0.5,  0.0
					            	             	        
				        );
				        
				        var pos_x = Math.random() * 6000 - 3000;	
						var pos_y = Math.random() * 6000 - 3000;
						var pos_z = Math.random() * 6000 - 3000;
				        
				        this.worldPos[i].push(
				       
				       			pos_x, pos_y, pos_z,
				       			pos_x, pos_y, pos_z,
				       			pos_x, pos_y, pos_z,
				       			pos_x, pos_y, pos_z
									        	
				        );
				           
				        // Color data        
				        this.color[i].push(
				        
					        	color[0], color[1], color[2], color[3],
					        	color[0], color[1], color[2], color[3],
					        	color[0], color[1], color[2], color[3],
					        	color[0], color[1], color[2], color[3]
				        
				        );
				                 	
						// Texture coordinate data
				        this.texCoords[i].push(
				        
					            0.0, 0.0,
					            0.0, 1.0,
					            1.0, 0.0,	          	         
					            1.0, 1.0
				            
				        );
				        
				        // Color id's for picking (below is a placeholder for later) 
				        this.colorId[i].push(
				        	
				        	0.0, 0.0, 0.0, 0.0,
				        	0.0, 0.0, 0.0, 0.0,
				        	0.0, 0.0, 0.0, 0.0,				        	
				        	0.0, 0.0, 0.0, 0.0
				        	
				        );
				        
				        this.visible[i].push(
				        	
				        	true,
				        	true,
				        	true,
				        	true
				        	
				        );	
				 
				 		// Index data
		        		this.indices[i].push( 
		        			
		        				4*j + 0,
		        				4*j + 1,
		        				4*j + 2,
		        				4*j + 1,
		        				4*j + 2,
		        				4*j + 3
		        				
		        		);
				        
		       	}  
		       
		       	// Initialize scene object variables ( buffers, shaders, rendering function )               
		        this.vertexAttribArrayBuffers[i]['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices[i] ),  3, this.vertices[i].length / 3,  gl.STATIC_DRAW );
		        this.vertexAttribArrayBuffers[i]['worldPos']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.worldPos[i] ),  3, this.worldPos[i].length / 3,  gl.DYNAMIC_DRAW );        
		        this.vertexAttribArrayBuffers[i]['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color[i] ),     4, this.color[i].length / 4,     gl.STATIC_DRAW );   
		        this.vertexAttribArrayBuffers[i]['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords[i] ), 2, this.texCoords[i].length / 2, gl.STATIC_DRAW );
		        this.vertexAttribArrayBuffers[i]['colorId']   = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.colorId[i] ),   4, this.colorId[i].length / 4,   gl.STATIC_DRAW );		        
		        this.vertexAttribArrayBuffers[i]['visible']   = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.visible[i] ),   1, this.colorId[i].length,       gl.STATIC_DRAW );	
		        this.elementArrayBuffer[i] = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices[i] ), 1, this.indices[i].length, gl.STATIC_DRAW );
		       	
		}
		
		this.drawMode = gl.TRIANGLES;
                               	  
    	//this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) );
    	this.shaderProgram.push( loadShader( 'billboardArray', setupBillboardArrayShader ) ); 
	
}

$3DJS.QuadArray.prototype = {
	
		// adds a quad to the end of the quad array
		addQuad: function ( config ) {
			
				config = config || { };
				
				config.width = config.width ? config.width : 1.0;
				config.height = config.height ? config.height : 1.0;
				config.offset = config.offset ? config.offset : [ 0.0, 0.0, 0.0 ];
				config.position = config.position ? config.position : vec3.create(Math.random() * 6000 - 3000, Math.random() * 6000 - 3000, Math.random() * 6000 - 3000); // assign random position (to be changed for flexibility)
				config.color = config.color ? config.color : [ 0.0, 0.0, 0.0, 1.0 ];
				config.colorId = config.colorId ? config.colorId : [ 0.0, 0.0, 0.0, 0.0 ];
				config.textureRegion = config.textureRegion ? config.textureRegion : { 
					left: 0.0, 
					right: 1.0, 
					bottom: 0.0, 
					top: 1.0 
				};   // region of the image to use ordered left, right, bottom, top
				config.visible = config.visible ? config.visible : true;
			
				// add 1 to the number of total quads
				++this.numQuads;
				
				// recalculate the required number of buffers
				this.calcNumRequiredBuffers( );
				
				var i = this.currentBufferIndex;
				
				this.vertices[i].push(
				        
			           -config.width * 0.5 + config.offset[0], -config.height * 0.5 + config.offset[1],  0.0 + config.offset[2],
			           -config.width * 0.5 + config.offset[0],  config.height * 0.5 + config.offset[1],  0.0 + config.offset[2],
			            config.width * 0.5 + config.offset[0], -config.height * 0.5 + config.offset[1],  0.0 + config.offset[2],	           
			            config.width * 0.5 + config.offset[0],  config.height * 0.5 + config.offset[1],  0.0 + config.offset[2]
			            	             	        
		        );
		        	       
		        this.worldPos[i].push(
		       
		       			config.position[0], config.position[1], config.position[2],
		       			config.position[0], config.position[1], config.position[2],
		       			config.position[0], config.position[1], config.position[2],
		       			config.position[0], config.position[1], config.position[2]
							        	
		        );
		           
		        // Color data        
		        this.color[i].push(
		        
			        	config.color[0], config.color[1], config.color[2], config.color[3],
			        	config.color[0], config.color[1], config.color[2], config.color[3],
			        	config.color[0], config.color[1], config.color[2], config.color[3],
			        	config.color[0], config.color[1], config.color[2], config.color[3]
		        
		        );
		                 	
				// Texture coordinate data
		        this.texCoords[i].push(
		        
			            config.textureRegion.left, config.textureRegion.bottom,
			            config.textureRegion.left, config.textureRegion.top,
			            config.textureRegion.right, config.textureRegion.bottom,	          	         
			            config.textureRegion.right, config.textureRegion.top
		            
		        );	
		        
		        // Color Ids for picking
		        this.colorId[i].push(
		        
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3],
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3],
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3],
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3]
		        
		        );		
		        
		        this.visible[i].push(
		        	
		        		config.visible,
		        		config.visible,
		        		config.visible,
		        		config.visible
		        	
		        );    
		 
		 		var j = ( this.numQuads - 1 ) % this.maxQuadsPerBuffer;
		 	
		 		// Index data
        		this.indices[i].push( 
        			
        				4*j + 0,
        				4*j + 1,
        				4*j + 2,
        				4*j + 1,
        				4*j + 2,
        				4*j + 3
        				
        		);
        		
        		
			
		},
		
		// this function must be called anytime a new quad is added to the array
		calcNumRequiredBuffers: function ( ) {
			
				this.numRequiredBuffers = Math.ceil( this.numQuads / this.maxQuadsPerBuffer );
				
				if ( ( this.currentBufferIndex + 1 ) != this.numRequiredBuffers ) {
					
						++this.currentBufferIndex;
						
						var i = this.currentBufferIndex;
						
						this.vertices[i]   = [ ];
						this.worldPos[i]   = [ ];      
						this.color[i]      = [ ];
						this.texCoords[i]  = [ ];
						this.scale[i]      = [ ];
						this.colorId[i]    = [ ];	
						this.visible[i]    = [ ];					
						this.indices[i]    = [ ];
												
						this.vertexAttribArrayBuffers[i] = [ ];					
					
				} 
			
		},
		
		updateVertexBuffers: function ( ) {
			
				for ( var i=0; i < this.numRequiredBuffers; ++i ) {
			
						// Initialize scene object variables ( buffers, shaders, rendering function )               
				        this.vertexAttribArrayBuffers[i]['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices[i] ),  3, this.vertices[i].length / 3,  gl.STATIC_DRAW );
				        this.vertexAttribArrayBuffers[i]['worldPos']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.worldPos[i] ),  3, this.worldPos[i].length / 3,  gl.DYNAMIC_DRAW );        
				        this.vertexAttribArrayBuffers[i]['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color[i] ),     4, this.color[i].length / 4, 	   gl.STATIC_DRAW );   
				        this.vertexAttribArrayBuffers[i]['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords[i] ), 2, this.texCoords[i].length / 2, gl.STATIC_DRAW );
				        this.vertexAttribArrayBuffers[i]['colorId']   = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.colorId[i] ),   4, this.colorId[i].length / 4,   gl.STATIC_DRAW );
				        this.vertexAttribArrayBuffers[i]['visible']   = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.visible[i] ),   1, this.visible[i].length, 	   gl.STATIC_DRAW );
				        //this.drawMode = gl.TRIANGLES;				    
				        this.elementArrayBuffer[i] = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices[i] ), 1, this.indices[i].length, gl.STATIC_DRAW );
				        
				}
			
		},
		
		// Utility function to render "quad strips" for node and edge labels
		offsetVertexPosition: function ( i, offset ) {
			
				// Find what vertex buffer this quad belongs to
				var buffer = Math.floor( i / this.maxQuadsPerBuffer );
				var index = i % this.maxQuadsPerBuffer;
				
				this.vertices[buffer][12*i+0] += offset[0];
				this.vertices[buffer][12*i+1] += offset[1];
				this.vertices[buffer][12*i+2] += offset[2];
				
				this.vertices[buffer][12*i+3] += offset[0];
				this.vertices[buffer][12*i+4] += offset[1];
				this.vertices[buffer][12*i+5] += offset[2];
				
				this.vertices[buffer][12*i+6] += offset[0];
				this.vertices[buffer][12*i+7] += offset[1];
				this.vertices[buffer][12*i+8] += offset[2];
				
				this.vertices[buffer][12*i+9] += offset[0];
				this.vertices[buffer][12*i+10] += offset[1];
				this.vertices[buffer][12*i+11] += offset[2];
			
		},
		
		// Update the position of a quad in the quad array (useful for when the positions of nodes are being updated in the graph)
		setWorldPosition: function ( i, position ) {
			
				// Find what vertex buffer this quad belongs to
				var buffer = Math.floor( i / this.maxQuadsPerBuffer );
				var index = i % this.maxQuadsPerBuffer;
				
				this.worldPos[buffer][12*i+0] = position[0];
				this.worldPos[buffer][12*i+1] = position[1];
				this.worldPos[buffer][12*i+2] = position[2];
				
				this.worldPos[buffer][12*i+3] = position[0];
				this.worldPos[buffer][12*i+4] = position[1];
				this.worldPos[buffer][12*i+5] = position[2];
				
				this.worldPos[buffer][12*i+6] = position[0];
				this.worldPos[buffer][12*i+7] = position[1];
				this.worldPos[buffer][12*i+8] = position[2];
				
				this.worldPos[buffer][12*i+9] = position[0];
				this.worldPos[buffer][12*i+10] = position[1];
				this.worldPos[buffer][12*i+11] = position[2];
			
		},
		
		// Update the position of a quad in the quad array (useful for when the positions of nodes are being updated in the graph)
		setVisibility: function ( i, visibility ) {
			
				// Find what vertex buffer this quad belongs to
				var buffer = Math.floor( i / this.maxQuadsPerBuffer );
				var index = i % this.maxQuadsPerBuffer;
				
				this.visible[buffer][4*i+0] = visibility;
				this.visible[buffer][4*i+1] = visibility;
				this.visible[buffer][4*i+2] = visibility;
				this.visible[buffer][4*i+3] = visibility;
			
		},
	
		// this is incorrect for this type of object, change when needed
		setColor: function ( r, g, b, a ) {
	
				this.color = [
			        
			        	r, g, b, a,
			        	r, g, b, a,
			        	r, g, b, a,
			        	r, g, b, a
		        
		        ];
		        
		        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
				gl.bindBuffer( gl.ARRAY_BUFFER, null );  
					
		}, 
	
		render: function ( ) {
			
				var program = this.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								
				for ( var i=0; i < this.numRequiredBuffers; ++i ) {		 								   	
								 								   	
					   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers[i];
					   	var attributes = this.shaderProgram[0].attributes;   
					   	
					   	// Enable vertex buffer objects	   					
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
						   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
						   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
					   		
					   	}			  	 
					   	
					   	// Bind projection and modelview matrices
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
					  	
					  	gl.activeTexture( gl.TEXTURE0 );			   	
			  			gl.bindTexture( gl.TEXTURE_2D, this.texture ); 		
						gl.uniform1i( program.samplerUniform, 0 ); 					  	
					  		  	     			   		   	 	 
					  	// Draw the shape  		  	   		    					   	
					   	gl.bindBuffer( this.elementArrayBuffer[i].target, this.elementArrayBuffer[i].id );
					   	gl.drawElements( this.drawMode, this.elementArrayBuffer[i].count, gl.UNSIGNED_SHORT, 0 );  
				       	  
						// Disable vertex buffer objects
						for ( attrib in attributes ) {  					   			
					   						   			 
						   		gl.disableVertexAttribArray( attributes[ attrib ] );  							   		
					   		
					   	}
					   	
				}
			
		} 
	
}

/**
 * Creates a 2D circle object
 * @param radius Radius of the circle.
 * @param numSlices Number of slices in the circle. The higher the value the smoother the border of the circle will be.
 */

function Circle ( radius, numSlices ) {        // requires 3 slices at the minimum ( would create a triangle composed of 3 triangles )
	
		this.radius = radius  || 1;
		this.numSlices = numSlices || 30;
	
		// Initialize texture
		this.texture = undefined; 
		
		// Vertex buffer data
        this.vertices  = [ ];         
        this.color 	   = [ ];
        this.texCoords = [ ];   
        this.indices   = [ ];
        
        // Vertex data buffers associated with this object
		this.vertexAttribArrayBuffers = [ ];
		
		// Element array buffer
		this.elementArrayBuffer = null;
		
		// Shader stack used to render the object
		this.shaderProgram = [ ];
    	
    	// Constructor call
    	this.initialize( radius, numSlices );	
        	
} 

Circle.prototype = {
	
		initialize: function ( radius, numSlices ) {
			
				var vertices  = this.vertices;
				var texCoords = this.texCoords;
				var color 	  = this.color;
				var indices   = this.indices;
				
				// Center vertex
				vertices.push( 0.0, 0.0, 0.0 );
				texCoords.push( 0.5, 0.5 );
				color.push( 1.0, 1.0, 1.0, 1.0 );
				indices.push( 0 );
			
				// Determine the slice increment in radians
				var radianIncrement = ( 360.0 / numSlices ) * ( Math.PI / 180.0 );
				
				for ( var i = 0; i < numSlices; i++ ) { 
					
						var currRadian = i * radianIncrement;
																	
						vertices.push( Math.cos( currRadian ) * radius, Math.sin( currRadian ) * radius, 0.0 );	   		
						texCoords.push( 0.5 * Math.cos( currRadian ) + 0.5, 0.5 * Math.sin( currRadian ) + 0.5 );  				
						color.push( 1.0, 1.0, 1.0, 1.0 );	
														
						indices.push( i + 1 )
										
				}
				
				// connect back to first vertex on the circle
				indices.push( 1 );
				
				// Initialize scene object variables ( buffers, shaders, rendering function )               
		        this.vertexAttribArrayBuffers['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, numSlices + 1, gl.STATIC_DRAW );      // check these vbo as the count may be incorrect  
		        this.vertexAttribArrayBuffers['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, numSlices + 1, gl.STATIC_DRAW );    
		        this.vertexAttribArrayBuffers['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords ), 2, numSlices + 1, gl.STATIC_DRAW ); 
		        this.drawMode = gl.TRIANGLE_FAN;             	   
		    	this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, numSlices + 2, gl.STATIC_DRAW ); 
		    	this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) );     	   
			
		},
		
		setColor: function ( r, g, b, a ) {
	
				this.color = [];
	
				for ( var i = 0; i < this.numSlices + 2; i++ ) { 
				
						this.color.push( r, g, b, a );
					        		        		        		        
				}
		        
		        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
				gl.bindBuffer( gl.ARRAY_BUFFER, null ); 
					
		}, 
	
		render: function ( ) {
			
				var program = this.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
			   	var attributes = this.shaderProgram[0].attributes;   
			   				   	
			   	for ( var i in vertexAttribArrayBuffers ) {
			   			   					   			
			   			gl.bindBuffer( vertexAttribArrayBuffers[ i ].target, vertexAttribArrayBuffers[ i ].id );	 
			   			gl.enableVertexAttribArray( attributes[ i ] );  			
			   			gl.vertexAttribPointer( attributes[ i ], vertexAttribArrayBuffers[ i ].size, gl.FLOAT, false, 0, 0);
			   			
			   	}	  
			   	
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	 			  				  	 			
			  		  	     			   		   	 	   		  	   		    			   	
			   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
			   	gl.drawElements( this.drawMode, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
		       	  		   
		       	for ( var i in vertexAttribArrayBuffers ) {
		       	
		       			gl.disableVertexAttribArray( attributes[ i ] );
		       			
		       	}   
			
		} 
	
}


/**
 * Wireframe Circle (incomplete - redo)
 */

WireframeCircle.prototype = new SceneObject( );
WireframeCircle.prototype.constructor = WireframeCircle;

function WireframeCircle ( radius, numSlices ) {        // requires 3 slices at the minimum ( would create a triangle composed of 3 triangles )
	
		radius    = radius  || 1;
		numSlices = numSlices || 30;
		
		this.radius = radius;
		this.numSlices = numSlices;
		 
		this.constructor = function( radius, numSlices ) {
	
				var vertices  = this.vertices;
				var color 	  = this.color;
				var indices   = this.indices;
				
			
				var radianIncrement = ( 360.0 / numSlices ) * ( Math.PI / 180.0 );
				
				for ( var i = 0; i < numSlices; i++ ) { 
					
						var currRadian = i * radianIncrement;
																	
						vertices.push( Math.cos( currRadian ) * radius );	vertices.push( Math.sin( currRadian ) * radius );	vertices.push( 0.0 );																																																							
						color.push( 1.0, 1.0, 1.0, 1.0 );									
						indices.push( i )
										
				}
				
				// connect back to first vertex on the circle
				indices.push( 0 );
			
		}
		
		this.constructor( radius, numSlices );
	        
        // Initialize scene object variables ( buffers, shaders, rendering function )               
        this.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, numSlices, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, numSlices, gl.STATIC_DRAW );                  	   
    	this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, numSlices + 1, gl.STATIC_DRAW );  
    	this.shaderProgram.push( loadShader( 'lines', setupLineShader ) );     	   
    	this.renderFunc = this.renderWireframeCircle;   	
		
}

WireframeCircle.prototype.setColor = function ( r, g, b, a ) {
	
		this.color = [];
	
		for ( var i = 0; i < this.numSlices; i++ ) { 
		
				this.color.push( r, g, b, a,
								 r, g, b, a,
								 r, g, b, a  );
			        		        		        		        
		}
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );  
			
}

// Cube ///////////////////////////////////////////////////////////////////////////////////////////
Cube.prototype = new SceneObject( );
Cube.prototype.constructor = Cube;

function Cube ( width, height, depth ) { // REVISE! Not complete
	
		width  = width  || 1;
		height = height || 1;
		depth  = depth  || 1;
		
		this.width  = width;
		this.height = height;
		this.depth  = depth;
		
		this.vertices = [
        
	            // Front face
	            -1.0, -1.0,  1.0,
	             1.0, -1.0,  1.0,
	             1.0,  1.0,  1.0,
	            -1.0,  1.0,  1.0,
	
	            // Back face
	            -1.0, -1.0, -1.0,
	            -1.0,  1.0, -1.0,
	             1.0,  1.0, -1.0,
	             1.0, -1.0, -1.0,
	
	            // Top face
	            -1.0,  1.0, -1.0,
	            -1.0,  1.0,  1.0,
	             1.0,  1.0,  1.0,
	             1.0,  1.0, -1.0,
	
	            // Bottom face
	            -1.0, -1.0, -1.0,
	             1.0, -1.0, -1.0,
	             1.0, -1.0,  1.0,
	            -1.0, -1.0,  1.0,
	
	            // Right face
	             1.0, -1.0, -1.0,
	             1.0,  1.0, -1.0,
	             1.0,  1.0,  1.0,
	             1.0, -1.0,  1.0,
	
	            // Left face
	            -1.0, -1.0, -1.0,
	            -1.0, -1.0,  1.0,
	            -1.0,  1.0,  1.0,
	            -1.0,  1.0, -1.0
            
        ];
        
 		for ( var i = 0; i < 24; i++ ) { 
		
				this.color.push( 1.0, 1.0, 1.0, 1.0 );	
			        		        		        		        
		}
        
        this.indices = [
        
        		0, 1, 2,      0, 2, 3,    // Front face
		        4, 5, 6,      4, 6, 7,    // Back face
		        8, 9, 10,     8, 10, 11,  // Top face
		        12, 13, 14,   12, 14, 15, // Bottom face
		        16, 17, 18,   16, 18, 19, // Right face
		        20, 21, 22,   20, 22, 23  // Left face
        
        ];
        			
		// Initialize scene object variables ( buffers, shaders, rendering function )               
        this.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, 24, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, 24, gl.STATIC_DRAW );                  	   
    	this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, 36, gl.STATIC_DRAW );  
    	this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) );     	   
    	this.renderFunc = this.renderSimpleObject; 
	
}

Cube.prototype.setColor = function ( r, g, b, a ) {
	
		this.color = [];
	
		for ( var i = 0; i < 24; i++ ) { 
		
				this.color.push( r, g, b, a );	
			        		        		        		        
		}
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );  
			
}

WireframeCube.prototype = new SceneObject( );
WireframeCube.prototype.constructor = WireframeCube;

function WireframeCube ( settings ) {
		
		// Example of what the settings object literal should contain
		// settings = {
		//   width: 1,
		//	 height: 1,
		//	 depth: 1,
		//	 color: [ 1.0, 1.0, 1.0, 1.0 ]	
		// }
		
		this.width  = settings.width  || 1.0;
		this.height = settings.height || 1.0; 
		this.depth  = settings.depth  || 1.0;

		this.color  = settings.color || [ 1.0, 1.0, 1.0, 1.0 ]; 
		
		this.vertices = [
        
        	   -this.width * 0.5, -this.height * 0.5,  this.depth * 0.5,
	            this.width * 0.5, -this.height * 0.5,  this.depth * 0.5,
	            this.width * 0.5,  this.height * 0.5,  this.depth * 0.5,	           
	           -this.width * 0.5,  this.height * 0.5,  this.depth * 0.5,
        		
	           -this.width * 0.5, -this.height * 0.5, -this.depth * 0.5,
	            this.width * 0.5, -this.height * 0.5, -this.depth * 0.5,
	            this.width * 0.5,  this.height * 0.5, -this.depth * 0.5,	           
	           -this.width * 0.5,  this.height * 0.5, -this.depth * 0.5
	           	                     
        ];
        
        for ( var i = 0; i < 8; i++ ) { 
		
				this.color.push( this.color[0], this.color[1], this.color[2], this.color[3] );	
			        		        		        		        
		}
        
        this.indices = [
        
        		0, 1, 1, 2, 2, 3, 3, 0, // Front face
		        4, 5, 5, 6, 6, 7, 7, 4, // Back face
		        3, 2, 2, 6, 6, 7, 7, 3,	// Top face
		        0, 1, 1, 5, 5, 4, 4, 0, // Bottom face
		        1, 5, 5, 6, 6, 2, 2, 1, // Right face
		        0, 4, 4, 7, 7, 3, 3, 0  // Left face
        
        ];
	
		// Initialize scene object variables ( buffers, shaders, rendering function )               
        this.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, 8, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, 8, gl.STATIC_DRAW );                  	   
    	this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, 48, gl.STATIC_DRAW );  
    	this.shaderProgram.push( loadShader( 'lines', setupLineShader ) );     	   
    	this.renderFunc = this.renderLines; 
}

// Circle /////////////////////////////////////////////////////////////////////////////////////////
Sphere.prototype = new SceneObject( );
Sphere.prototype.constructor = Sphere;

function Sphere ( radius, numSlices, numStacks ) {

		radius    = radius  || 1;
		numSlices = numSlices || 30;
		numStacks = numStacks || 30;
		
		this.radius = radius;
		this.numSlices = numSlices;
		this.numStacks = numStacks;
		 
		this.constructor = function( radius, numSlices, numStacks ) {
	
				var vertices  = this.vertices;
				var texCoords = this.texCoords;
				var color 	  = this.color;
				var indices   = this.indices;
				
				for ( var latNumber = 0; latNumber <= numSlices; latNumber++ ) {
					
			            var theta = latNumber * Math.PI / numSlices;
			            var sinTheta = Math.sin(theta);
			            var cosTheta = Math.cos(theta);
			
			            for ( var longNumber = 0; longNumber <= numStacks; longNumber++ ) {
			                
				                var phi = longNumber * 2 * Math.PI / numStacks;
				                var sinPhi = Math.sin(phi);
				                var cosPhi = Math.cos(phi);
				
				                var x = cosPhi * sinTheta;
				                var y = cosTheta;
				                var z = sinPhi * sinTheta;
				                var u = 1 - (longNumber / numStacks);
				                var v = 1 - (latNumber / numSlices);
				
				                vertices.push( radius * x, radius * y, radius * z );
				                texCoords.push( u, v );
				                color.push( u, v, 1.0, 1.0 );
				                //normalData.push(x);
				                //normalData.push(y);
				                //normalData.push(z);
			                			                			                
			            }
			        }
						        			       
			        for ( var latNumber = 0; latNumber < numSlices; latNumber++ ) { 
			        	
				            for (var longNumber = 0; longNumber < numStacks; longNumber++) {
				            	
					                var first = (latNumber * (numStacks + 1)) + longNumber;
					                var second = first + numStacks + 1;
					                
					                indices.push( first, second, first + 1 );					                					
					                indices.push( second, second + 1, first + 1 );					               
				                
				            }
			            
			        }
			
		}
		
		this.constructor( radius, numSlices, numStacks );
	        
        // Initialize scene object variables ( buffers, shaders, rendering function )               
        this.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, this.vertices.length / 3, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, this.color.length / 4, gl.STATIC_DRAW );                  	   
    	this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, this.indices.length, gl.STATIC_DRAW );  
    	this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) );     	   
    	this.renderFunc = this.renderSimpleObject;  
    	           
}

Sphere.prototype.setColor = function ( r, g, b, a ) {
	
		this.color = [];
	
		for ( var latNumber = 0; latNumber <= this.numSlices; latNumber++ ) {
					
	            for ( var longNumber=0; longNumber <= this.numStacks; longNumber++ ) {
	                
		                this.color.push( r, g, b, a );
	                			                			                
	            }
            
        }
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );  
			
}


/**
 * @author Mike Wakid
 * @description Collects keyboard and mouse input from the user
 */

function Interactor ( userSettings ) {
	
		// Key dictionary storing true for keys that are pressed and false for those that are now
		this.currentlyPressedKeys = {};
	
		userSettings = userSettings || {};
		
		var settings = {
			
		};
			
		// Variables for mouse controls
		this.leftMouseDown   = false;
		this.middleMouseDown = false;
		this.rightMouseDown  = false;
		
		this.buttonReleased = true;	
		
		this.mouseMoving = false;
		
		this.lastMouseX = null;
		this.lastMouseY = null;
		

		// Temporary ( move to camera object )		
		
		// Current rotations and translations being performed by the user
		this.rotation = new quat4( );
		this.translation = vec3.create( );
		
		// Transformation matrix ( global ) 
		this.transform = mat4.create( );
		
		this.translationSpeed = 50.0;		
		this.rotationSpeed  = 3.0;    // this needs more than one type of speed and to be passed in as a parameter
		
		this.handleCustomInput = function( ) { };
		
		initInputCallbacks( );
		
		this.zoom = function ( value ) {
		
				this.translation[2] = value;
				this.transform[14] = value;
				
		}
	
}

function initInputCallbacks ( ) {

		gl.canvas.onkeydown = function ( event ) {
			
				handleKeyDown( event );
			
		}

		gl.canvas.onkeyup = function ( event ) {
			
				handleKeyUp( event );
			
		}
		
		gl.canvas.onmousedown = function ( event ) {    
			
				handleMouseDown( event );
			
		}
		
		document.onmouseup = function ( event ) {    
			
				handleMouseUp( event );
			
		}
		
		gl.canvas.onmousemove = function ( event ) {    
			
				handleMouseMove( event );
			
		}
		
		gl.canvas.onmousewheel = function ( event ) {
			
				handleMouseWheel( event );
				
		}
		
		// FF doesn't recognize mousewheel as of FF3.x
		// UNRESOLVED: Calling addEventListener disables the onkeydown and onkeyup events but does not affect mouse events
		var mousewheelevent = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "onmousewheel" //FF doesn't recognize mousewheel as of FF3.x;
		
		//if (document.attachEvent) //if IE (and Opera depending on user setting)
    	//	document.attachEvent(mousewheelevent, function(e){alert('Mouse wheel movement detected 1!')})
		
		if ( document.addEventListener ) { // WC3 browsers
    		 	
    			gl.canvas.addEventListener( mousewheelevent, function ( event ) { 
    					      					  					
    					handleMouseWheelFF( event );
    					
    			}, false );
    			
    			document.addEventListener( "onkeydown", function ( event ) {
	
						handleKeyDown( event );
					
				}, false );
				
				document.addEventListener( "onkeyup", function ( event ) {
					
						handleKeyUp( event );
					
				}, false );
    			
    	}		

}

Interactor.prototype.updateTranslation = function ( ) {      // Unoptimized function, only necessary to update along 1 axis ( move to camera class )
	
		this.transform[12] = this.translation[0];
		this.transform[13] = this.translation[1];
		this.transform[14] = this.translation[2];
	
}

Interactor.prototype.updateRotation = function ( ) {      	// Unoptimized function, only necessary to update along 1 axis ( move to camera class )
	
		var matrix = mat4.create( );
		matrix = this.rotation.toMat4( ); 

		this.transform[0]  = matrix[0];
		this.transform[1]  = matrix[1];
		this.transform[2]  = matrix[2];
		
		this.transform[4]  = matrix[4];
		this.transform[5]  = matrix[5];
		this.transform[6]  = matrix[6];
		
		this.transform[8]  = matrix[8];
		this.transform[9]  = matrix[9];
		this.transform[10] = matrix[10];
			
}



function handleKeyDown ( event ) {
	
		$3DJS.interactor.currentlyPressedKeys[ event.keyCode ] = true;	
	 
}

function handleKeyUp ( event ) {
	
		$3DJS.interactor.currentlyPressedKeys[ event.keyCode ] = false;
	
}
 
function handleMouseDown ( event ) {
	
		// 0 - W3C value for left mouse click
		if ( event.button == 0 ) 
			$3DJS.interactor.leftMouseDown = true;
		
		// 1 - Middle mouse click	
		if ( event.button == 1 ) 
			$3DJS.interactor.middleMouseDown = true;
		
		// 2 - Right mouse click
		if ( event.button == 2 ) 
			$3DJS.interactor.rightMouseDown = true;
			
		//interactor.buttonReleased = false;	
		
		//interactor.lastMouseX = event.offsetX;
		//interactor.lastMouseY = event.offsetY;
		//interactor.lastMouseX = event.clientX;
		//interactor.lastMouseY = event.clientY;
		
} 

function handleMouseUp ( event ) {
    
    	$3DJS.interactor.leftMouseDown = false;
    	$3DJS.interactor.middleMouseDown = false;
    	$3DJS.interactor.rightMouseDown = false;
    	
    	$3DJS.interactor.buttonReleased = true;
    
}

// NOTE: The performance of this function may be able to be improved
function handleMouseMove ( event ) {

		$3DJS.interactor.mouseMoving = true;

    	//if ( !interactor.leftMouseDown && !interactor.middleMouseDown ) {
      			
      	//		return;
      			
    	//}
    	
    	// For Chrome  
    	//var currMouseX = event.offsetX;
    	//var currMouseY = event.offsetY;
    	
    	// For Firefox
    	var currMouseX = event.clientX;
    	var currMouseY = event.clientY;

    	var deltaX = currMouseX - $3DJS.interactor.lastMouseX;       	
    	var deltaY = currMouseY - $3DJS.interactor.lastMouseY;
    	
    	if ( $3DJS.interactor.leftMouseDown ) {
		    	
		    	var quat = new quat4( );
		    	var rotationMatrix = mat4.create( );
				
				quat.axisAngleToQuat( -deltaX * 0.2, $3DJS.interactor.transform[1], $3DJS.interactor.transform[5], $3DJS.interactor.transform[9] );
				$3DJS.interactor.rotation = quat.multiply( $3DJS.interactor.rotation );
				
				quat.axisAngleToQuat( -deltaY * 0.2, $3DJS.interactor.transform[0], $3DJS.interactor.transform[4], $3DJS.interactor.transform[8] );
				$3DJS.interactor.rotation = quat.multiply( $3DJS.interactor.rotation );
						
				$3DJS.interactor.updateRotation( );
		
		} 
		
		if ( $3DJS.interactor.middleMouseDown ) {
			
				$3DJS.interactor.translation[0] += deltaX * $3DJS.interactor.translationSpeed;
				$3DJS.interactor.translation[1] -= deltaY * $3DJS.interactor.translationSpeed;
				$3DJS.interactor.updateTranslation( );
			
		}

    	$3DJS.interactor.lastMouseX = currMouseX;
    	$3DJS.interactor.lastMouseY = currMouseY;

}

function handleMouseWheel ( event ) {
	
		$3DJS.interactor.translation[2] += event.wheelDelta * 1.0;	
		$3DJS.interactor.updateTranslation( );
	
}

function handleMouseWheelFF ( event ) {
	
		$3DJS.interactor.translation[2] += event.detail ? event.detail * ( -120.0 ) * 1.0 : event.wheelDelta;
		$3DJS.interactor.updateTranslation( );
	
}

Interactor.prototype.handleInput = function ( ) { 

		//var currentlyPressedKeys = this.currentlyPressedKeys;

		if (this.currentlyPressedKeys[81]) {			// q
				
				this.translation[2] -= this.translationSpeed;
				this.updateTranslation( );
	
		}
	
		if (this.currentlyPressedKeys[69]) {			// e
		
				this.translation[2] += this.translationSpeed;
				this.updateTranslation( );
	
		}
	
		if (this.currentlyPressedKeys[65]) {			// a
			
				this.translation[0] += this.translationSpeed;
				this.updateTranslation( );
				
		}
	
		if (this.currentlyPressedKeys[68]) { 			// d
		
				this.translation[0] -= this.translationSpeed;
				this.updateTranslation( );
		
		}
	
		if (this.currentlyPressedKeys[87]) {			// w
		
				this.translation[1] -= this.translationSpeed;
				this.updateTranslation( );
		
		}
	
		if (this.currentlyPressedKeys[83]) {			// s
				
				this.translation[1] += this.translationSpeed;
				this.updateTranslation( );
		
		}	
		
		if (this.currentlyPressedKeys[37]) {			// left
				
				var quat = new quat4( );
				quat.axisAngleToQuat(  this.rotationSpeed, this.transform[1], this.transform[5], this.transform[9] );				
				this.rotation = quat.multiply( this.rotation );					
				this.updateRotation( );				
			
		}
		
		if (this.currentlyPressedKeys[39]) {			// right
			
				var quat = new quat4( );
				quat.axisAngleToQuat( -this.rotationSpeed, this.transform[1], this.transform[5], this.transform[9] );				
				this.rotation = quat.multiply( this.rotation );			
				this.updateRotation( );
				
		}
		
		if (this.currentlyPressedKeys[38]) {			// up
				
				var quat = new quat4( );
				quat.axisAngleToQuat(  this.rotationSpeed, this.transform[0], this.transform[4], this.transform[8] );
				this.rotation = quat.multiply( this.rotation );		
				this.updateRotation( );		    			
		
		}
		
		if (this.currentlyPressedKeys[40]) {			// down
							
				var quat = new quat4( );
				quat.axisAngleToQuat( -this.rotationSpeed, this.transform[0], this.transform[4], this.transform[8] );				
				this.rotation = quat.multiply( this.rotation );		
				this.updateRotation( );

		}
		
		if (this.currentlyPressedKeys[48]) {			// 0 ( THIS NEEDS TO GO INTO CUSTOM INPUT!!! Graph may not exist )
							
				graph.settings.renderSpatialPartition = true;
				
		}
		
		
		if (this.currentlyPressedKeys[57]) {			// 9 ( THIS NEEDS TO GO INTO CUSTOM INPUT!!! Graph may not exist )
							
				graph.settings.renderSpatialPartition = false;
				
		}
		
		if (this.currentlyPressedKeys[56]) {			// 0 ( THIS NEEDS TO GO INTO CUSTOM INPUT!!! Graph may not exist )
							
				graph.layout.pause = true;
				
		}
		
		
		// Call custom key function if it exists 
		
		this.handleCustomInput( );
		
}


/**
 * Creates a texture from an HTML5 canvas element
 * 
 * @function
 * @param {HTML5 Canvas} canvas The canvas element to create a texture from.
 * @param target WebGL target (e.g. gl.TEXTURE_2D).
 * @param format
 * @param type
 * @param filter
 * @return texture The WebGL texture created from the canvas.
 */

$3DJS.createCanvasTexture = function ( canvas, target, format, type, filter ) {

		// Create the texture
		var texture = gl.createTexture();
							
	    // Bind the texture           
		gl.bindTexture( target, texture );
        						 	    
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );  		
		gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ); 
		gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, filter );        		
		gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, filter );       		
		//gl.generateMipmap( target );							
		gl.texImage2D( target, 0, format, format, type, canvas);
															
		// Unbind the texture
		gl.bindTexture(target, null);            	      
	
		return texture;
	
}

/**
 * Creates a texture from an image.
 *  
 * @param gl The WebGL context 'gl' must be passed into this variable.
 * @param target specifes the target texture (e.g gl.TEXTURE_2D).
 * @param filter Specifies the type of filtering to be performed on minification and magnification (e.g gl.NEAREST, gl.LINEAR)
 * @param type Specifies the data type of the pixel data (e.g. gl.UNSIGNED_BYTE, gl.FLOAT).
 * @param format Specifies the format of the pixel data (e.g. gl.RGBA, gl.LUMINANCE).
 */

function createImageTexture ( filename, target, format, type, filter ) {

		// Create the texture
		var texture = gl.createTexture();
				
		// Create a new image
		var image = new Image( );
		image.crossOrigin = "anonymous";
	
		// Function called when the texture is loaded
        image.onload = function ( ) {
        	    
        	    // Bind the texture           
        		gl.bindTexture( target, texture );
        						 	    
				gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );      
				gl.texImage2D( target, 0, format, format, type, image);  		
				gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
				gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ); 
				gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, filter );        		
				gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, filter );       		
				//gl.generateMipmap( target );							
        		
        		// Unbind the texture
        		gl.bindTexture(target, null);
            	
        }

		// Set the path of the image
		image.src = filename;
	
		return texture;
	
}
/*
function createImageTexture( filename ) {

		// Create a new image
		var image = new Image( );
	
		// Function called when the texture is loaded
        image.onload = function ( ) {
				
				return createTextureFromImage( image );
            	
        }

		// Set the path of the image
		image.source = filename;
		
	
}
*/
function createTextureFromImage ( image ) {
	
	    var texture = gl.createTexture( );
	    
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    
	    if ( !isPowerOfTwo( image.width ) || !isPowerOfTwo( image.height ) ) {
	    	
		        // Scale up the texture to the next highest power of two dimensions.
		        var canvas = document.createElement("canvas");
		        canvas.width = nextHighestPowerOfTwo(image.width);
		        canvas.height = nextHighestPowerOfTwo(image.height);
		        var ctx = canvas.getContext("2d");
		        ctx.drawImage(image, 0, 0, image.width, image.height);
		        image = canvas;
	        
	    }
	    
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    gl.generateMipmap(gl.TEXTURE_2D);
	    gl.bindTexture(gl.TEXTURE_2D, null);
	    
	    return texture;
	    
}
 
function isPowerOfTwo ( x ) {
	
    	return (x & (x - 1)) == 0;
    	
}
 
function nextHighestPowerOfTwo( x ) {
	
		--x;
		
		for (var i = 1; i < 32; i <<= 1) {
			
		    	x = x | x >> i;
		    
		}
		
		return x + 1;
		
}


/**
 * Functions to load GLSL shaders
 *  
 */

function loadShader ( name, func ) {
	
		var program = gl.createProgram( );
		program.attributes = [ ];
		
		var vertexShader   = readAndCreateShader( 'shaders/' + name + '.vert', 'vertex' );
		var fragmentShader = readAndCreateShader( 'shaders/' + name + '.frag', 'fragment' );	
		
		gl.attachShader( program, vertexShader );
		gl.attachShader( program, fragmentShader );
		gl.linkProgram( program );
		
		if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        	
        		console.log( gl.getProgramInfoLog( program ) );
	            alert( gl.getProgramInfoLog( program ) );
            
        }

        gl.useProgram( program );

		return func( program );
		    	
}

function readAndCreateShader ( filename, type ) {
	
		var shader;
	
		var request = new XMLHttpRequest();
	
		request.open("GET", filename, false);
		

		request.onreadystatechange = function( ) {
		
				if(request.readyState == 4) {
	
						if (request.status == 200) { 
								
								if (type == 'vertex') {
        	        								
           								shader = gl.createShader( gl.VERTEX_SHADER );
           								gl.shaderSource( shader, request.response );
           								gl.compileShader( shader );
            
        						} else if (type == 'fragment') {
        	
            							shader = gl.createShader(gl.FRAGMENT_SHADER);
            							gl.shaderSource( shader, request.response );
            							gl.compileShader( shader );
            							
            					}
            					
            					if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
								  		
								  		console.log( gl.getShaderInfoLog( shader ) );
								  		alert( gl.getShaderInfoLog( shader ) );
								  		
								}
				
						}			

				}

		}	
		
		request.send();
										
		return shader;   

}

function setupFullScreenQuadShader ( program ) {
	             
        program.attributes['position'] = gl.getAttribLocation( program, "aVertexPosition" );               
        program.attributes['texCoord']    = gl.getAttribLocation( program, "aTexCoord" );     

        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" );    
        program.samplerUniform  = gl.getUniformLocation( program, "uTexture" );     
          
		return program;
}

function setupLineShader ( program ) {
	            
        program.attributes['position'] = gl.getAttribLocation( program, "aPosition" );
        program.attributes['color']    = gl.getAttribLocation( program, "aColor" );                          

        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" ); 
        
        return program;   
                    	
}

function setupSimpleObjectShader ( program ) {
	            
        program.attributes['position'] = gl.getAttribLocation( program, "aPosition" );
        program.attributes['color']    = gl.getAttribLocation( program, "aColor" );                          

        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" ); 
        
        return program;   
                    	
}

function setupSingleObjectShader ( program ) {
	            
        program.attributes['position']  = gl.getAttribLocation( program, "aPosition" );
        program.attributes['color']     = gl.getAttribLocation( program, "aColor" );
        program.attributes['texCoords'] = gl.getAttribLocation( program, "aTexCoords" );                          

        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" ); 
        program.scaleUniform    = gl.getUniformLocation( program, "uScale" );
        
        return program;   
                    	
}

// Billboard shader for single objects (i.e. when each object needs i)
function setupBillboardShader ( program ) {

		// Attributes	                  
       	program.attributes['position']  = gl.getAttribLocation( program, "aPosition" );       
        program.attributes['texCoords'] = gl.getAttribLocation( program, "aTexCoords" );                          
      
		// Uniforms
        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" ); 
                  
        program.samplerUniform  = gl.getUniformLocation( program, "uTexture" );
        program.worldPosUniform = gl.getUniformLocation( program, "uWorldPos" );
        program.colorUniform    = gl.getUniformLocation( program, "uColor" );
        program.scaleUniform    = gl.getUniformLocation( program, "uScale" );
        
        // Return the program
  		return program;
	
}

function setupColorBillboardShader ( program ) { 
		
		// Attributes	                  
       	program.attributes['position']  = gl.getAttribLocation( program, "aPosition" );       
                                     
		// Uniforms
        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" ); 
                         
        program.worldPosUniform 	 = gl.getUniformLocation( program, "uWorldPos" );
        program.colorUniform    	 = gl.getUniformLocation( program, "uColor" );
        program.scaleUniform    	 = gl.getUniformLocation( program, "uScale" );
        
        // Return the program
  		return program;
	
}

function setupBillboardArrayShader ( program ) {
		
		// Attributes	                  
       	program.attributes['position']  = gl.getAttribLocation( program, "aPosition" );  
       	program.attributes['worldPos']  = gl.getAttribLocation( program, "aWorldPos" );       
        program.attributes['color']     = gl.getAttribLocation( program, "aColor" );                          
      	program.attributes['texCoords'] = gl.getAttribLocation( program, "aTexCoords" );
      	program.attributes['visible']   = gl.getAttribLocation( program, "aVisible" );
      	//program.attributes['colorIds']  = gl.getAttribLocation( program, "aColorIds" );      	
      
		// Uniforms
        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" );                  
        program.samplerUniform  = gl.getUniformLocation( program, "uTexture" );        
        
        // Return the program
  		return program;		
	
}

function setupColorBillboardArrayShader ( program ) {
		
		// Attributes	                  
       	program.attributes['position'] = gl.getAttribLocation( program, "aPosition" );  
       	program.attributes['worldPos'] = gl.getAttribLocation( program, "aWorldPos" );       
        program.attributes['color']    = gl.getAttribLocation( program, "aColor" );  
        program.attributes['visible']  = gl.getAttribLocation( program, "aVisible" );                        
      
		// Uniforms
        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" );                  
        
        // Return the program
  		return program;		
	
}

function setupColorIdBillboardArrayShader ( program ) {
		
		// Attributes	                  
       	program.attributes['position'] = gl.getAttribLocation( program, "aPosition" );  
       	program.attributes['worldPos'] = gl.getAttribLocation( program, "aWorldPos" );       
        program.attributes['colorId']  = gl.getAttribLocation( program, "aColorId" );
        program.attributes['visible']   = gl.getAttribLocation( program, "aVisible" );                          
      
		// Uniforms
        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" );                  
        
        // Return the program
  		return program;		
	
}

function setupLabeledNodeSShader ( program ) {
	        
		// Attributes	                  
       	program.attributes['position']  = gl.getAttribLocation( program, "aPosition" );
       	program.attributes['color'] = gl.getAttribLocation( program, "aColor" );        
        program.attributes['texCoords'] = gl.getAttribLocation( program, "aTexCoords" );                          
      
		// Uniforms
        program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" ); 
                  
        program.entityTextureUniform = gl.getUniformLocation( program, "uTexture" );
        program.worldPosUniform 	 = gl.getUniformLocation( program, "uWorldPos" );
        program.colorUniform    	 = gl.getUniformLocation( program, "uColor" );
        program.scaleUniform    	 = gl.getUniformLocation( program, "uScale" );
        
        // Return the program
  		return program;
	
}

function setupOctreeShader ( program ) {
	            
        program.attributes['position'] = gl.getAttribLocation( program, "aPosition" );
        program.attributes['color']    = gl.getAttribLocation( program, "aColor" );                          

        program.pMatrixUniform   = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform  = gl.getUniformLocation( program, "uMVMatrix" ); 
        program.translateUniform = gl.getUniformLocation( program, "uTranslate" );
        program.scaleUniform     = gl.getUniformLocation( program, "uScale" );
        
        return program;   
                    	
}

/*
ShaderProgram.prototype.setupShaderVariablesForPointSprite = function ( ) {
	
		program.vertexPositionAttribute = gl.getAttribLocation( program, "aVertexPosition" );
      	//gl.enableVertexAttribArray( this.program.vertexPositionAttribute );
        
        //shaderProgram.texCoordAttribute = gl.getAttribLocation(shaderProgram, "aTexCoord");
        //gl.enableVertexAttribArray(shaderProgram.texCoordAttribute);

        program.pMatrixUniform    = gl.getUniformLocation( program, "uPMatrix" );
        program.mvMatrixUniform   = gl.getUniformLocation( program, "uMVMatrix" );
        program.pointSizeUniform  = gl.getUniformLocation( program, "uPointSize" );
        program.samplerUniform    = gl.getUniformLocation( program, "uTexture" );
	
}

ShaderProgram.prototype.setupShaderVariablesForForceDirectedGraphAlgorithm = function ( ) {
	
		program.vertexPositionAttribute = gl.getAttribLocation( program, "aVertexPosition" );
		program.textureCoordAttribute = gl.getAttribLocation( program, "aTexCoord" );
	
		program.pMatrixUniform  = gl.getUniformLocation( program, "uPMatrix" );
		program.mvMatrixUniform = gl.getUniformLocation( program, "uMVMatrix" );		
		program.samplerUniform  = gl.getUniformLocation( program, "uTexture" );
		program.texWidthUniform	= gl.getUniformLocation( program, "uTexWidth" );
		program.uDamping		= gl.getUniformLocation( program, "uDamping" );
		program.timeStepUnivorm	= gl.getUniformLocation( program, "uTimeStep" );
	
}
*/





/**
 * Framebuffer Objects (may be incomplete) 
 */

function FrameBufferObject ( ) {
	
		// The frame buffer itself
		
		this.framebuffer = undefined;
		
		// The width and height of the textures attached to the frame buffer
		
		this.width  	 = undefined;
		this.height 	 = undefined;
		
		// The color texture attached to the frame buffer object
		
		this.colorTexture = undefined;
		
		// The depth buffer attached to the frame buffer object
		
		this.depthTexture = undefined;
		
		/**
		 * Methods
		 */
		
		this.init = function ( width, height ) {   
	
				this.framebuffer = gl.createFramebuffer( );
				this.update( width, height );
				
		}
		
		this.update = function ( width, height ) {
			
				gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
				this.width  = width;
				this.height = height;
				
		}
		
}

// NOTE:    WebGL currently only will support one color attachment so multiple color attachments to the framebuffer are not possible as of now
// gl: 		The WebGL context 'gl' must be passed into this variable
// target:  specifes the target texture (e.g gl.TEXTURE_2D)
// filter:  specifies the type of filtering to be performed on minification and magnification (e.g gl.NEAREST, gl.LINEAR)
// type:    specifies the data type of the pixel data (e.g. gl.UNSIGNED_BYTE, gl.FLOAT)
// format:  specifies the format of the pixel data (e.g. gl.RGBA, gl.LUMINANCE)


FrameBufferObject.prototype.initColorTexture = function ( target, format, type, filter ) {		
	
		this.colorTexture = gl.createTexture();
		this.updateColorTexture( target, format, type, filter );    	   

}

FrameBufferObject.prototype.updateColorTexture = function ( target, format, type, filter ) {		
	
    	gl.bindTexture( target, this.colorTexture );    	        	    
    	gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );    	
    	gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, filter );
    	gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, filter );    	 
    	gl.texImage2D( target, 0, format, this.width, this.height, 0, format, type, null );    	
    	
    	//gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferObject );
    	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, target, this.colorTexture, 0);	    

}

FrameBufferObject.prototype.initDepthTexture = function ( ) {
	
		this.depthTexture = gl.createRenderbuffer( );
		this.updateDepthTexture( );	
	
}	

FrameBufferObject.prototype.updateDepthTexture = function ( ) {
	
		gl.bindRenderbuffer( gl.RENDERBUFFER, this.depthTexture );
		gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height );
		
		//gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferObject );
		gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthTexture );	
	
}	

// Enables rendering to the frame buffer
FrameBufferObject.prototype.enable = function ( ) {
	
    	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    	
}

// Disables rendering to the frame buffer
FrameBufferObject.prototype.disable = function ( ) {
	
    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    	
}

 



/*************************************************************************************************
 *
 * Vertex Buffer Objects
 * Description: 
 * 
 *************************************************************************************************/

function BufferObject ( id, target, size, count, usage ) {
	
		this.id 	= id;
		this.target = target;
		this.size   = size;
		this.count  = count;
		this.usage  = usage;
	
}


// gl: 		The WebGL context 'gl' must be passed into this variable
// target:  gl.ARRAY_BUFFER  		- buffer object will store vertex array data
//			gl.ELEMENT_ARRAY_BUFFER - buffer object will store index array data
// data:    e.g. 'new Float32Array( vertices )', 'new Uint16Array( indices )'
// size:	specifies the item size (e.g. if we specify 3D vertices we will use a value of 3)
// count:   specified the number of items (e.g. number of vertices)
// usage:   gl.STATIC_DRAW  - data in the vertex buffer object will not be changes (specified once and used many times)
//          gl.DYNAMIC_DRAW - data will be changed frequently (specified and used repeatedly)
//          gl.STREAM_DRAW  - data will be changed every frame (specified once and used once)

function initBufferObject ( target, data, size, count, usage ) {
	
		var id = gl.createBuffer();
				
		gl.bindBuffer( target, id );
		gl.bufferData( target, data, usage );
		gl.bindBuffer( target, null );
	
		return {
			id: id,
			target: target,
			size: size,
			count: count,
			usage: usage	
		};
		//var object = new BufferObject( id, target, size, count, usage );	
		
		//return object;
		
}

function updateBufferObject ( bufferObject ) {
	
		gl.bindBuffer( bufferObject.target, bufferObject.vbo.id );
		gl.bufferData( bufferObject.target, new Float32Array( nodes.vertices ), bufferObject.usage );
		gl.bindBuffer( bufferObject.target, null );
	
}





/*
 *
 * Math Utility Functions
 * Description: 
 * 		2D, 3D, 4D Vectors 
 * 		4x4 Matrix
 * 
 */

/**
 * 3D Vector
 * @function
 * 
 */

var vec3 = { };

vec3.create = function ( x, y, z ) { 

		var a = new Float32Array( 3 );
		
		a[0] = x || 0;	
    	a[1] = y || 0;	
    	a[2] = z || 0;

		return a;		

}

vec3.set = function ( a, x, y, z ) { 
		
		a[0] = x || 0;	
    	a[1] = y || 0;	
    	a[2] = z || 0;   

}

vec3.copy = function ( a, b ) { 
		
		a[0] = b[0];	
    	a[1] = b[1];	
    	a[2] = b[2];   

}

vec3.zero = function ( a ) {
	
		a[0] = 0;	
    	a[1] = 0;	
    	a[2] = 0;
	
};

vec3.add = function ( a, b, result ) {
			
		result[0] = a[0] + b[0];
		result[1] = a[1] + b[1];
		result[2] = a[2] + b[2];
		
}

vec3.subtract = function ( a, b, result ) {

		result[0] = a[0] - b[0];
		result[1] = a[1] - b[1];
		result[2] = a[2] - b[2];	
		
}

vec3.multiply = function ( a, n, result ) {
		
		result[0] = a[0] * n;
		result[1] = a[1] * n; 
		result[2] = a[2] * n; 
		
}

vec3.divide = function ( a, n, result ) {
		
		// Prevent division by zero errors..
		if ( n == 0 ) {
			
				console.log( 'Attempting to divide vec3 by zero' );
				return;
			
		}
			
		var inv_n = 1 / n;
	
		vec3.multiply( a, inv_n, result );
}

vec3.magnitude = function ( a ) {
	
		return Math.sqrt( a[0] * a[0] + a[1] * a[1] + a[2] * a[2] );
		
}

vec3.normalize = function ( a ) {
	
		vec3.divide( a, vec3.magnitude( a ) );
		
}



var vec4 = { };

vec4.create = function ( x, y, z, w ) { 

		var a = new Float32Array( 4 );
		
		a[0] = x || 0;	
    	a[1] = y || 0;	
    	a[2] = z || 0;
    	a[3] = w || 0;

		return a;		

}

vec4.set = function ( a, x, y, z, w ) { 
		
		a[0] = x || 0;	
    	a[1] = y || 0;	
    	a[2] = z || 0;
    	a[3] = w || 0;

}

vec4.copy = function ( a, b ) { 	
		
		b[0] = a[0];	
    	b[1] = a[1];	
    	b[2] = a[2];
    	b[3] = a[3];
    	
}

vec4.multiply = function ( a, n, result ) {
		
		result[0] = a[0] * n;
		result[1] = a[1] * n; 
		result[2] = a[2] * n;
		result[3] = a[3] * n; 
		
}

vec4.divide = function ( a, n, result ) {
		
		// Prevent division by zero errors..
		if ( n== 0 ) {
			
				console.log( 'Attempting to divide vec3 by zero' );
				return;
			
		}
			
		var inv_n = 1 / n;
	
		vec4.multiply( a, inv_n, result );
}


var mat4 = { };

mat4.create = function ( a ) { 

		var b = new Float32Array( 16 );
		
		if ( a ) {
			
				b[0] = a[0];	b[4] = a[4];	b[8]  = a[8];	b[12] = a[12];
		    	b[1] = a[1];	b[5] = a[5];	b[9]  = a[9];	b[13] = a[13];
		    	b[2] = a[2];	b[6] = a[6];	b[10] = a[10];	b[14] = a[14];
		    	b[3] = a[3];	b[7] = a[7];	b[11] = a[11];	b[15] = a[15];  
				
		}
		else {
			
				mat4.identity( b );
		}
		
		return b;		

};

mat4.copy = function ( a, b ) {
		
		b[0] = a[0];	b[4] = a[4];	b[8]  = a[8];	b[12] = a[12];
    	b[1] = a[1];	b[5] = a[5];	b[9]  = a[9];	b[13] = a[13];
    	b[2] = a[2];	b[6] = a[6];	b[10] = a[10];	b[14] = a[14];
    	b[3] = a[3];	b[7] = a[7];	b[11] = a[11];	b[15] = a[15];  
		
}

mat4.identity = function ( a ) {
		
		a[0] = 1;	a[4] = 0;	a[8]  = 0;	a[12] = 0;
    	a[1] = 0;	a[5] = 1;	a[9]  = 0;	a[13] = 0;
    	a[2] = 0;	a[6] = 0;	a[10] = 1;	a[14] = 0;
    	a[3] = 0;	a[7] = 0;	a[11] = 0;	a[15] = 1;  
		
}

mat4.translate = function ( mat, x, y, z ) {
	
  		mat[12] = mat[0] * x + mat[4] * y + mat[8]  * z + mat[12];
  		mat[13] = mat[1] * x + mat[5] * y + mat[9]  * z + mat[13];
  		mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
  		mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
	
}

// Assumes at least the identity has been pushed onto the current matrix stack (may change later)
// *** Optimize 
mat4.rotate = function ( mat, angle, x, y, z ) {
		
		var length = Math.sqrt( x * x + y * y + z * z );
		
		if ( length != 1 ) {			// normalize axis of rotation
			
				length = 1 / length;
				
				x *= length;
				y *= length;
				z *= length;
			
		}
		
		angle = angle * ( Math.PI / 180.0 );
		var s = Math.sin( angle );
		var c = Math.cos( angle );
		var t = 1 - c;
		
		var r = new Array( 9 );
		
		r[0] = x * x * t + c;
		r[1] = y * x * t + z * s;
		r[2] = x * z * t - y * s;
		
		r[3] = x * y * t - z * s;
		r[4] = y * y * t + c;
		r[5] = y * z * t + x * s;
		
		r[6] = x * z * t + y * s;
		r[7] = y * z * t - x * s;
		r[8] = z * z * t + c;
	
  		var matcopy = mat4.create( );;
  		mat4.copy( mat, matcopy );
		
		mat[0]  = matcopy[0] * r[0] + matcopy[4] * r[1] + matcopy[8]  * r[2];
		mat[1]  = matcopy[1] * r[0] + matcopy[5] * r[1] + matcopy[9]  * r[2];
		mat[2]  = matcopy[2] * r[0] + matcopy[6] * r[1] + matcopy[10] * r[2];
		mat[3]  = matcopy[3] * r[0] + matcopy[7] * r[1] + matcopy[11] * r[2];
		
		mat[4]  = matcopy[0] * r[3] + matcopy[4] * r[4] + matcopy[8]  * r[5];
		mat[5]  = matcopy[1] * r[3] + matcopy[5] * r[4] + matcopy[9]  * r[5];
		mat[6]  = matcopy[2] * r[3] + matcopy[6] * r[4] + matcopy[10] * r[5];
		mat[7]  = matcopy[3] * r[3] + matcopy[7] * r[4] + matcopy[11] * r[5]; 
		
		mat[8]  = matcopy[0] * r[6] + matcopy[4] * r[7] + matcopy[8]  * r[8];
		mat[9]  = matcopy[1] * r[6] + matcopy[5] * r[7] + matcopy[9]  * r[8];
		mat[10] = matcopy[2] * r[6] + matcopy[6] * r[7] + matcopy[10] * r[8];
		mat[11] = matcopy[3] * r[6] + matcopy[7] * r[7] + matcopy[11] * r[8];
  
}

// Assumes at least the identity has been pushed onto the current matrix stack (may change later)
mat4.scale = function ( mat, x, y, z ) {
  		  
  		mat[0] *= x;		mat[4] *= y;		mat[8]  *= z;	
    	mat[1] *= x;		mat[5] *= y;		mat[9]  *= z;	
    	mat[2] *= x;		mat[6] *= y;		mat[10] *= z;	
    	mat[3] *= x;		mat[7] *= y;		mat[11] *= z;	
		
  
}

mat4.multiply = function ( a, b, c ) {	
		
		var d = mat4.create( );     // in case c == a or b ( as of now only handles if a == c )
		mat4.copy( a, d );  
		
		c[0]  = d[0] * b[0]  + d[4] * b[1]  + d[8]  * b[2]  + d[12] * b[3];
		c[1]  = d[1] * b[0]  + d[5] * b[1]  + d[9]  * b[2]  + d[13] * b[3];
		c[2]  = d[2] * b[0]  + d[6] * b[1]  + d[10] * b[2]  + d[14] * b[3];
		c[3]  = d[3] * b[0]  + d[7] * b[1]  + d[11] * b[2]  + d[15] * b[3];
		
		c[4]  = d[0] * b[4]  + d[4] * b[5]  + d[8]  * b[6]  + d[12] * b[7];
		c[5]  = d[1] * b[4]  + d[5] * b[5]  + d[9]  * b[6]  + d[13] * b[7];
		c[6]  = d[2] * b[4]  + d[6] * b[5]  + d[10] * b[6]  + d[14] * b[7];
		c[7]  = d[3] * b[4]  + d[7] * b[5]  + d[11] * b[6]  + d[15] * b[7];
		
		c[8]  = d[0] * b[8]  + d[4] * b[9]  + d[8]  * b[10] + d[12] * b[11];
		c[9]  = d[1] * b[8]  + d[5] * b[9]  + d[9]  * b[10] + d[13] * b[11];
		c[10] = d[2] * b[8]  + d[6] * b[9]  + d[10] * b[10] + d[14] * b[11];
		c[11] = d[3] * b[8]  + d[7] * b[9]  + d[11] * b[10] + d[15] * b[11];
			
		c[12] = d[0] * b[12] + d[4] * b[13] + d[8]  * b[14] + d[12] * b[15];
		c[13] = d[1] * b[12] + d[5] * b[13] + d[9]  * b[14] + d[13] * b[15];
		c[14] = d[2] * b[12] + d[6] * b[13] + d[10] * b[14] + d[14] * b[15];
		c[15] = d[3] * b[12] + d[7] * b[13] + d[11] * b[14] + d[15] * b[15];
	
}

mat4.multiplyVec4 = function ( a, b, c ) {
		
        
        var d = vec4.create( );
        vec4.copy( b, d );
		
		c[0] = a[0] * d[0] + a[4] * d[1] + a[8]  * d[2] + a[12] * d[3];
		c[1] = a[1] * d[0] + a[5] * d[1] + a[9]  * d[2] + a[13] * d[3];
		c[2] = a[2] * d[0] + a[6] * d[1] + a[10] * d[2] + a[14] * d[3];
		c[3] = a[3] * d[0] + a[7] * d[1] + a[11] * d[2] + a[15] * d[3];

}

mat4.ortho = function ( left, right, bottom, top, zNear, zFar ) {

		var cm = gl.currMatrix;
		
		var rl = ( right - left );
		var tb = ( top - bottom );
		var fn = ( zFar - zNear );
		
		var tx = -( right + left ) / rl;
		var ty = -( top + bottom ) / tb;
		var tz = -( zNear + zFar ) / fn;
		
		cm[0]  = 2 / rl;
    	cm[1]  = 0;
    	cm[2]  = 0;
    	cm[3]  = 0;
    	cm[4]  = 0;
    	cm[5]  = 2 / tb;
    	cm[6]  = 0;
    	cm[7]  = 0;
    	cm[8]  = 0;
    	cm[9]  = 0;
    	cm[10] = -2 / fn;
    	cm[11] = 0;
    	cm[12] = tx;
    	cm[13] = ty;
    	cm[14] = tz;
    	cm[15] = 1.0;  
	
}

mat4.frustum = function ( left, right, bottom, top, zNear, zFar, matrix ) {		    	
    	
    	var rl = (right - left);
    	var tb = (top - bottom);
    	var fn = (zFar - zNear);
    
    	matrix[0]  = (2 * zNear) / rl;
    	matrix[1]  = 0;
    	matrix[2]  = 0;
    	matrix[3]  = 0;
    	matrix[4]  = 0;
    	matrix[5]  = (2 * zNear) / tb;
    	matrix[6]  = 0;
    	matrix[7]  = 0;
    	matrix[8]  = (right + left) / rl;
    	matrix[9]  = (top + bottom) / tb;
    	matrix[10] = -(zFar + zNear) / fn;
    	matrix[11] = -1;
    	matrix[12] = 0;
    	matrix[13] = 0;
    	matrix[14] = -(2 * zFar * zNear) / fn;
    	matrix[15] = 0;  
    	  
}

//$3DJS.prototype.perspective = function ( fovy, aspect, zNear, zFar ) {
mat4.perspective = function ( fovy, aspect, zNear, zFar, matrix ) {
	
		var top   = zNear * Math.tan( fovy * Math.PI / 360.0 );
		var right = top * aspect; 
	
		mat4.frustum( -right, right, -top, top, zNear, zFar, matrix )
		
}

function quat4 ( w, x, y, z ) {
	
		this.w = w || 1.0;
		this.x = x || 0.0;
		this.y = y || 0.0;
		this.z = z || 0.0;
		
		// Ensure we are working with unit quaternions
		this.normalize( );
	
}


quat4.prototype.axisAngleToQuat = function ( angle, x, y, z ) {		

		// Convert angle from degrees to radians
		angle = angle * ( Math.PI / 180.0 );
		
		// Ensure the axis is a unit vector ( can be optimized by checking if the squared sum of components is 1 before using sqrt )
		//var axis = new vec3( x, y, z );
		//axis.normalize( );
		
		var halfAngle = angle * 0.5;

		this.w = Math.cos( halfAngle ); 
		this.x = x * Math.sin( halfAngle );
		this.y = y * Math.sin( halfAngle );
		this.z = z * Math.sin( halfAngle );
	
}

quat4.prototype.multiply = function ( quat ) {
			
		return new quat4( this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z, 
						  this.w * quat.x + this.x * quat.w + this.y * quat.z - this.z * quat.y,
						  this.w * quat.y - this.x * quat.z + this.y * quat.w + this.z * quat.x,
						  this.w * quat.z + this.x * quat.y - this.y * quat.x + this.z * quat.w );			
												
}

quat4.prototype.normalize = function ( ) {
	
		var TOLERANCE = 0.00001;
		var magnitude_sq = this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z;
		
		// If the length of the quaternion is greater than 1 or too much precision has been lost, normalize
		if ( magnitude_sq > 1.0 || magnitude_sq < 1.0 - TOLERANCE ) {
			
				var magnitude = Math.sqrt( magnitude_sq );
				var mag_inv = 1.0 / magnitude;
					
				this.w *= mag_inv;
				this.x *= mag_inv;
				this.y *= mag_inv;
				this.z *= mag_inv;
			
		}
	
}

quat4.prototype.getConjugate = function ( ) {
	
		return new quat4( this.w, -this.x, -this.y, -this.z );
	
}

quat4.prototype.toMat4 = function ( ) {     
		
		//var result = new mat4( );
		var result = mat4.create( );
		
		var w = this.w,
			x = this.x, 
			y = this.y,
			z = this.z,
			
		    xx = x * x,
			yy = y * y,
			zz = z * z,
			wx = w * x,
			wy = w * y, 
			wz = w * z,
			xy = x * y,
			xz = x * z,
			yz = y * z;
		
		// Optimized for unit quaternions
		//result[0]  = this.w * this.w + this.x * this.x - this.y * this.y - this.z * this.z;
		result[0]  = 1 - 2.0 * yy - 2.0 * zz;
		result[1]  = 2.0 * xy - 2.0 * wz;
		result[2]  = 2.0 * xz + 2.0 * wy;
		result[3]  = 0.0;
		
		result[4]  = 2.0 * xy + 2.0 * wz;
		//result[5]  = this.w * this.w - this.x * this.x + this.y * this.y - this.z * this.z;
		result[5]  = 1 - 2.0 * xx - 2.0 * zz;
		result[6]  = 2.0 * yz - 2.0 * wx;
		result[7]  = 0.0;
		
		result[8]  = 2.0 * xz - 2.0 * wy;
		result[9]  = 2.0 * yz + 2.0 * wx;
		//result[10] = this.w * this.w - this.x * this.x - this.y * this.y + this.z * this.z;
		result[10] = 1 - 2.0 * xx - 2.0 * yy;
		result[11] = 0.0;
			
		result[12] = 0.0;
		result[13] = 0.0;
		result[14] = 0.0;
		result[15] = 1.0;	
		
		return result;
}
	
// Push the current modelview matrix onto the modelview matrix stack
function mvPushMatrix ( ) {
			
		var matrix = mat4.create( );
		
		mat4.copy( $3DJS.MVMatrix, matrix );
		
        $3DJS.MVMatrixStack.push( matrix );
	
}

// Pop the top matrix from the modelview matrix stack
function mvPopMatrix ( ) {  
       
        $3DJS.MVMatrix = $3DJS.MVMatrixStack.pop();
        		                      
}

// Push the current modelview matrix onto the projection matrix stack
function pPushMatrix ( ) {
			
		var matrix = mat4.create( );
		
		mat4.copy( $3DJS.PMatrix, matrix );
		
        $3DJS.PMatrixStack.push( matrix );
	
}

// Pop the top matrix from the projection matrix stack
function pPopMatrix ( ) {
	    	   
        $3DJS.PMatrix = $3DJS.PMatrixStack.pop();
        		            	        
}

function glLoadIdentity ( ) {
    	
    	var cm = gl.currMatrix;
    
    	cm[0] = 1;		cm[4] = 0;		cm[8]  = 0;		cm[12] = 0;
    	cm[1] = 0;		cm[5] = 1;		cm[9]  = 0;		cm[13] = 0;
    	cm[2] = 0;		cm[6] = 0;		cm[10] = 1;		cm[14] = 0;
    	cm[3] = 0;		cm[7] = 0;		cm[11] = 0;		cm[15] = 1;   
      
}

//$3DJS.prototype.multMatrix = function ( matrix ) {
function glMultMatrix ( matrix ) {

    	mat4.multiply( gl.currMatrix, matrix, gl.currMatrix );
      
}

// Map object coordinates to window coordinates
//function gluProject( objX, objY, objZ, model, proj, view, winX, winY, winZ ) {
function project( objectPos, windowPos ) {
	
		var objectPosVec4 = vec4.create( objectPos[0], objectPos[1], objectPos[2], 1.0 );
		
		// Calculate the modelview-projection matrix
		var mvpMatrix = mat4.create( );
		mat4.multiply( $3DJS.PMatrix, $3DJS.MVMatrix, mvpMatrix );
		
		// Clip Coordinates
		mat4.multiplyVec4( mvpMatrix, objectPosVec4, objectPosVec4 );
		
		// Divide by w - Normalized device coordinates
		vec4.divide( objectPosVec4, objectPosVec4[3], objectPosVec4 );
	
		// Window- (screen) space coordinates
		//windowPos[0] = ( windowPos[0] * 0.5 + 0.5 ) * view[2] + view[0];
		//windowPos[1] = ( windowPos[1] * 0.5 + 0.5 ) * view[3] + view[1];	// flip y coordinate because canvas drawing starts in the top left
		windowPos[0] = ( objectPosVec4[0] * 0.5 + 0.5 ) * gl.canvas.width;
		windowPos[1] = ( objectPosVec4[1] * 0.5 + 0.5 ) * gl.canvas.height;	// flip y coordinate because canvas drawing starts in the top left
		windowPos[2] = ( objectPosVec4[2] * 0.5 + 0.5 );  // depth of the center of the node
		
}

function unProject ( windowPos, objectPos ) {
        
		var windowPosVec4 = vec4.create( windowPos[0], windowPos[1], windowPos[2], 1.0 );
		
		// Calculate the modelview-projection matrix
		var mvpMatrix = mat4.create( );
		mat4.multiply( $3DJS.PMatrix, $3DJS.MVMatrix, mvpMatrix );
        
        // Calculate the inverse modelview-projection matrix
        var invMvpMatrix = mat4.create( );
           
        if ( !invertMatrix( mvpMatrix, invMvpMatrix ) ) {
                        
            	return false;
            	
        }

        // Map x and y from window coordinates 
        //windowPosVec4[0] = (windowPosVec4[0] - view[0]) / view[2];
        //windowPosVec4[1] = (windowPosVec4[1] - view[1]) / view[3];
        windowPosVec4[0] = windowPosVec4[0] / gl.canvas.width;
        windowPosVec4[1] = windowPosVec4[1] / gl.canvas.height;

        // Map to range -1 to 1 
        windowPosVec4[0] = windowPosVec4[0] * 2.0 - 1.0;
        windowPosVec4[1] = windowPosVec4[1] * 2.0 - 1.0;
        windowPosVec4[2] = windowPosVec4[2] * 2.0 - 1.0;

    
        mat4.multiplyVec4( invMvpMatrix, windowPosVec4, windowPosVec4 );

        if (windowPosVec4[3] === 0.0) {
        	
	            return false;
        
        }
        
        vec4.divide( windowPosVec4, windowPosVec4[3], windowPosVec4 )

        objectPos[0] = windowPosVec4[0];
        objectPos[1] = windowPosVec4[1];
        objectPos[2] = windowPosVec4[2];

        return true;

}

function invertMatrix ( m, invOut ) {
        
        var inv = mat4.create( );

        inv[0]  =  m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
        inv[1]  = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
        inv[2]  =  m[1] * m[6]  * m[15] - m[1] * m[7]  * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7]  - m[13] * m[3] * m[6];
        inv[3]  = -m[1] * m[6]  * m[11] + m[1] * m[7]  * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9]  * m[2] * m[7]  + m[9]  * m[3] * m[6];
        inv[4]  = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
        inv[5]  =  m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
        inv[6]  = -m[0] * m[6]  * m[15] + m[0] * m[7]  * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7]  + m[12] * m[3] * m[6];
        inv[7]  =  m[0] * m[6]  * m[11] - m[0] * m[7]  * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8]  * m[2] * m[7]  - m[8]  * m[3] * m[6];
        inv[8]  =  m[4] * m[9]  * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
        inv[9]  = -m[0] * m[9]  * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];             
        inv[10] =  m[0] * m[5]  * m[15] - m[0] * m[7]  * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7]  - m[12] * m[3] * m[5];
        inv[11] = -m[0] * m[5]  * m[11] + m[0] * m[7]  * m[9]  + m[4] * m[1] * m[11] - m[4] * m[3] * m[9]  - m[8]  * m[1] * m[7]  + m[8]  * m[3] * m[5];
        inv[12] = -m[4] * m[9]  * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
        inv[13] =  m[0] * m[9]  * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
        inv[14] = -m[0] * m[5]  * m[14] + m[0] * m[6]  * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6]  + m[12] * m[2] * m[5];
        inv[15] =  m[0] * m[5]  * m[10] - m[0] * m[6]  * m[9]  - m[4] * m[1] * m[10] + m[4] * m[2] * m[9]  + m[8]  * m[1] * m[6]  - m[8]  * m[2] * m[5];

        // @type {number} 
        var det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

        if (det === 0) {
        	
            	return false;
        
        }

        det = 1.0 / det;

        for (var i = 0; i < 16; i = i + 1) {
        	
	            invOut[i] = inv[i] * det;
        
        }

        return true;

}


/**
 * Non-uniform rational B-spline (NURBS)
 * 
 * @param center
 * @param
 * @param
 */

// Bezier
$3DJS.Spline = function ( config ) {
	
	
	
}

// Catmull-Rom Spline



/**
 * @author Mike Wakid
 * Particle Systems
 */

function Particle ( config ) { 
	
		config = config || {};
	
		// Color 
		this.color = config.color ? config.color : vec4.create( 0.0, 0.0, 0.0, 0.0 );
	
		// Position
		this.position = config.position ? config.position : vec3.create( 0.0, 0.0, 0.0 );	
		
		// Velocity
		this.velocity = config.velocity ? config.velocity : vec3.create( ); 		
		
		// Acceleration		
		this.acceleration = config.acceleration ? config.acceleration : vec3.create( );	
		
		// Target location the particle is moving towards 
		this.startPosition = config.startPosition ? config.startPosition : vec3.create( 0.0, 0.0, 0.0 );
		
		// Target location the particle is moving towards 
		this.targetPosition = config.targetPosition ? config.targetPosition : vec3.create( 0.0, 0.0, 0.0 );
		
		// How long the particle lasts before it is destroyed (time in seconds)
		this.lifespan = config.lifespan ? config.lifespan :  1.5;
		
		// Amount of time the particle has existed for
		this.lifetime = 0.0;
		
		/**
		 * Particle Methods
		 */
		
		this.set = function ( settings ) {
			
	
			
		}
	
}

function ParticleSystem ( ) {
	
		// Number of particles in the system
		this.numParticles = 0;
		
		// The particles in the particle system
		this.particles = [];
		
		// The object used to render each particle
		this.particleObj = undefined; 
				
		// Emitter position
		this.emitterPosition = vec3.create( 0.0, 0.0, 0.0 );
		
		// Timer
		this.timer = 0;
		this.currTime = 0;
		this.prevTime = 0;
		
		this.init = function ( ) {
		
				this.particleObj = new $3DJS.Quad( 1, 1 );
	
				this.particleObj.setColor( 1.0, 0.0, 0.0, 1.0 );		
							  						 
				this.particleObj.texture = createImageTexture( "textures/particle.png", gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );			 
			
				this.particleObj.shaderProgram[0] = loadShader( 'billboardS', setupBillboardSShader ); 

		} 
		
		// Spawns a new particle at the emitter location
		this.emitParticle = function ( data ) {
			
				this.particles.push( new Particle( data ) );
				
				++this.numParticles;
			
		}
		
		this.destroy = function ( ) {
			
				this.particles = [];
				this.numParticles = 0;
			
		}
		
		// Updates the positions of all the particles in the system, and destroys and creates new ones as necessary
		this.update = function ( ) {
			
				this.currTime = new Date().getTime();
				
				var elapsedTimeMs = this.currTime - this.prevTime;
				var elapsedTimeS = elapsedTimeMs * 0.001;
				
				this.timer += elapsedTimeMs;
				
				// emits a new particle				
				
				if ( this.timer > 1 ) {
					
						this.emitParticle({
							color: vec4.create( 1.0, 0.6, 0.0, 1.0 ),
							velocity: vec3.create( 
								2.0 * Math.random() - 1.0, 
								2.0 * Math.random() - 1.0, 
								2.0 * Math.random() - 1.0 
							)
						});
						
						this.timer = 0;
					
				}
				
			
				// update particle positions
			
				var i = this.numParticles;
				
				var difference = vec3.create();
				var distance;
				
			
				while ( i-- ) { 
					
						if ( this.particles[i].lifetime >= this.particles[i].lifespan ) {
							
								this.particles.splice( i, 1 );
								this.numParticles--;
								continue;
							
						} 
						
						this.particles[i].lifetime += elapsedTimeS;
				
						// update position from the particle velocity
						vec3.add( this.particles[i].position, this.particles[i].velocity, this.particles[i].position );
				
						/*
						vec3.subtract( this.particles[i].targetPosition, this.particles[i].position, difference ); 								
						distance = vec3.magnitude( difference );								
						
						//vec3.set( this.particles[i].velocity, 0.0, 5.0, 0.0 );
																																							
						// Apply acceleration to velocity															    
   					    //vec3.add( source.velocity, source.acceleration, source.velocity );   		
   					    
   					    
   					    if ( distance < 10.0 )
   					    	vec3.set( this.particles[i].position, this.particles[i].startPosition[0], this.particles[i].startPosition[1], this.particles[i].startPosition[2] );			    											
						else
							// Update node position based on velocity				
							vec3.add( this.particles[i].position, this.particles[i].velocity, this.particles[i].position );
						*/
				
				}	
			
				this.prevTime = this.currTime;
			
		}
		
		// Renders the particle system
		this.render = function ( nodepos ) { 
			
				// Render particles ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				var program = this.particleObj.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	var vertexAttribArrayBuffers = this.particleObj.vertexAttribArrayBuffers;
			   	var attributes = this.particleObj.shaderProgram[0].attributes;   
			   	
			   	// Enable vertex buffer objects   					   			
			   	gl.bindBuffer( vertexAttribArrayBuffers[ 'position' ].target, vertexAttribArrayBuffers[ 'position' ].id );	 
			   	gl.enableVertexAttribArray( attributes[ 'position' ] );  			
			   	gl.vertexAttribPointer( attributes[ 'position' ], vertexAttribArrayBuffers[ 'position' ].size, gl.FLOAT, false, 0, 0);
			   	
			   	gl.bindBuffer( vertexAttribArrayBuffers[ 'texCoords' ].target, vertexAttribArrayBuffers[ 'texCoords' ].id );	 
			   	gl.enableVertexAttribArray( attributes[ 'texCoords' ] );  			
			   	gl.vertexAttribPointer( attributes[ 'texCoords' ], vertexAttribArrayBuffers[ 'texCoords' ].size, gl.FLOAT, false, 0, 0);
		  
			   	
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  	
			  	gl.uniform1f( program.scaleUniform, 10.0 ); 
			  	
			  	gl.activeTexture( gl.TEXTURE0 );
			  	gl.bindTexture( gl.TEXTURE_2D, this.particleObj.texture ); 		
				gl.uniform1i( program.entityTextureUniform, 0 );
				
				
				 			  		  	     			   		   	 	   		  	   		   
			   	// Render each particle	
			   	
			    gl.disable( gl.DEPTH_TEST );
			   	
			    gl.enable( gl.BLEND );
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			   	
			   	i = this.numParticles;	

				gl.bindBuffer( this.particleObj.elementArrayBuffer.target, this.particleObj.elementArrayBuffer.id );	
						   		   		   		   	
			   	while ( i-- ) {
			   		
			   			var pos = vec3.create();
			   			vec3.add( this.particles[i].position, nodepos, pos );
			   					  						
			   			gl.uniform3fv( program.worldPosUniform, pos );     // this should be a custom function not one for universally rendering billboards
			   			gl.uniform4fv( program.colorUniform, this.particles[i].color );		
			   			gl.drawElements( this.particleObj.drawMode, this.particleObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			
				
			   	}
			   	
			   	gl.disable( gl.BLEND );  
			   	gl.enable( gl.DEPTH_TEST );
	
		       	// Disable vertex buffer objects       	
				gl.disableVertexAttribArray( attributes[ 'position' ] );
				gl.disableVertexAttribArray( attributes[ 'texCoords' ] ); 	
			
		}
		
}

/**
 * 3DJS node object.
 * 
 * @class
 * @param {Object} config Data to populate information regarding the node.
 * @param {String or Number} config.id The id of the node.
 * @param {String or Number} config.name The name of the node.
 * @param {Array} config.color The color of the node.
 * @param {Number} config.size The size of the node.
 * @param {String} config.imageUrl Image file path.
 * @param {Object} config.imageRegion Region of the image to use.
 * @param {Number} config.imageRegion.left Left bound to define the image region. Must be between [0, 1], defaults to 0.0.
 * @param {Number} config.imageRegion.right Right bound to define the image region. Must be between [0, 1], defaults to 1.0.
 * @param {Number} config.imageRegion.bottom Bottom bound to define the image region. Must be between [0, 1], defaults to 0.0.
 * @param {Number} config.imageRegion.top Top bound to define the image region. Must be between [0, 1], defaults to 1.0.
 */

$3DJS.Node = function ( config ) { 
	
		/**
		 * Node identifier.
		 */		
		this.id = null;
		
		/** 
		 * Unique node identifier internal to the graph.
		 * @private
		 */
		this.graphId = null;
		
		/** 
		 * Color identifier for picking (automatically assigned based on the graphId).
		 * @private
		 */
		this.colorId = vec4.create( );	
		
		/**
		 * Name of the node. Defaults to the id if not specified.
		 */
		this.name = null;	
		
		/**
		 * Color of the node 
		 */
		this.color = null;
	
		/**
		 * If it is desired for the node to be represented as an image rather than using a color set this variable to the path of the image.
		 */
		this.imageUrl = null;
		
		/**
		 * The region of the image to use as the node texture (e.g. when using texture atlases).
		 */
		this.imageRegion = null;
		
		/**
		 * Array containing the ids of the edges attached to this node.
		 */
		this.edgeIndices = [];
		
		/**
		 * Arbitrary variable to store node metadata.
		 */
		this.metadata = undefined;
							
		/** 
		 * 3D vector storing the node position.
		 */
		this.position = vec3.create( 100 * Math.random() - 50, 100 * Math.random() - 50, 100 * Math.random() - 50 );	
		
		/**
		 * 3D vector storing the node velocity.
		 */
		this.velocity = vec3.create( ); 		
		
		/**
		 * 3D vector storing the node acceleration
		 */		
		this.acceleration = vec3.create( );		
		
		/**
		 * 3D vector storing the force imposed on the node
		 */
		this.force = vec3.create( );
		
		/**
		 * The node's mass.
		 */
		this.mass = 1.0; 		
		
		/**
		 * The size of the node.
		 */
		this.size = null;	
		
		/**
		 * @private
		 */		
		this.degree_centrality = 0;
		
		/**
		 * @private
		 */
		this.avg_edge_weight = 0;
		
		/**
		 * @private
		 */
		this.authority = 0;
		
		// Call constructor
		this.initialize( config );			
	
}

$3DJS.Node.prototype = {
	
		/** 
		 * Constructor
		 * @private
		 */
		initialize: function ( config ) {
				
				config = config || {};
			
				this.id          = config.id ? config.id : null;
				this.name        = config.name ? config.name : this.id;
				this.color       = config.color ? config.color : [ 1.0, 1.0, 1.0, 1.0 ];
				this.size        = config.size ? config.size : 1.0;
				this.imageUrl    = config.imageUrl ? config.imageUrl : null;
				this.imageRegion = config.imageRegion ? config.imageRegion : { left: 0.0, right: 1.0, bottom: 0.0, top: 1.0	};
				this.metadata    = config.metadata ? config.metadata : undefined;
								
		},
	
		/** 
		 * Assigns a color id to the node based on its unique identifier for picking.
		 */
		// This is used for picking nodes with the mouse, touchscreen, etc.
		assignColorId: function ( ) {
	
				// Color identifier for picking (based on id)
				var scale = 1.0 / 255.0;
				
				vec4.set( this.colorId, 
						( ( this.graphId >> 24 ) & 0xFF ) * scale, 
						( ( this.graphId >> 16 ) & 0xFF ) * scale, 
						( ( this.graphId >> 8  ) & 0xFF ) * scale, 
						( ( this.graphId )       & 0xFF ) * scale 
				); 	
			
		}
	
};

/**
 * 3DJS edge object
 * 
 * @class
 * @param {Object} config Configuration for the graph.
 * @param {String} config.nodeShape Defines the shape of the node. Options are 'quad', 'circle'. Defaults to 'quad' if not specified.
 * @param {Array} config.nodeColor 4 element array in rgba format with values in the range [0, 1] to specify the color of a node. Defaults to [1.0, 1.0, 1.0, 1.0] if not specified.
 * @param {Array} config.edgeColor 4 element array in rgba format with values in the range [0, 1] to specify the color of an edge. Defaults to [1.0, 1.0, 1.0, 1.0] if not specified.
 */

$3DJS.Edge = function ( config ) {
	
		/**
		 * Edge identifier
		 */
		this.id = null;
		
		/** 
		 * Unique edge identifier internal to the graph.
		 * @private
		 */
		this.graphId = null;
	
		/**
		 * Name of the edge. Defaults to the id if not specified.
		 */
		this.name = null;
	
		/**
		 * The edge source node.
		 */
		this.source = null;
		
		/**
		 * The edge destination node.
		 */	
		this.dest = null;	
		
		/**
		 * The color of the edge attached to the source node. 
		 */		
		this.sourceColor = [ 1.0, 0.0, 0.0, 1.0 ];
		
		/**
		 * The color of the edge attached to the destination node. 
		 */
		this.destColor = [ 1.0, 0.0, 0.0, 1.0 ];
		
		/**
		 * Specifies if the edge is directed or not. Defaults to true to indicate an undirected edge. 
		 */
		this.bidirectional = true;
		
		/**
		 * Edge weight. Defaults to 1.0. 
		 */		
		this.weight = 1.0;			 
		
		/**
		 * Arbitrary variable to store edge metadata.
		 */
		this.metadata = undefined;
		
		// Call constructor
		this.initialize( config );
		
}

$3DJS.Edge.prototype = {
	
		/** 
		 * Constructor
		 * @private
		 */
		initialize: function ( config ) {
		
				config = config || {};
				
				this.id = config.id ? config.id : null;
				this.name = config.name ? config.name : this.id;
				this.source = config.source ? config.source : null;
				this.dest = config.dest ? config.dest : null;
				this.sourceColor = config.sourceColor ? config.sourceColor : vec4.create();
				this.destColor = config.destColor ? config.destColor : vec4.create();
				this.bidirectional = config.bidirectional ? config.bidirectional : this.bidirectional;
				this.weight = config.weight ? config.weight : this.weight;
				this.metadata = config.metadata ? config.metadata : undefined;
			
		}
	
}

/**
 * 3DJS graph object
 * @class 
 * @param {Object} config Configuration for the graph.
 * @param {String} config.nodeShape Defines the shape of the node. Options are 'quad', 'circle'. Defaults to 'quad' if not specified.
 * @param {Array} config.nodeColor 4 element array in rgba format with values in the range [0, 1] to specify the color of a node. Defaults to [1.0, 1.0, 1.0, 1.0] if not specified.
 * @param {Array} config.edgeColor 4 element array in rgba format with values in the range [0, 1] to specify the color of an edge. Defaults to [1.0, 1.0, 1.0, 1.0] if not specified.
 * @param {Object} config.layout Specifies parameters for the force directed layout
 * @param {Number} config.layout.edgeLength The length of the edges in the graph. 
 * @param {Number} config.layout.edgeStiffness Specifies the stiffness of the edge
 * @param {Number} config.layout.charge
 * @param {Number} config.layout.damping
 * @param {Number} config.layout.theta
 * @param {Number} config.layout.stableEnergyThreshold
 */

$3DJS.Graph = function ( config ) {
		
		/** 
		 * The number of nodes in the graph 
		 */		
		this.numNodes = 0;
		
		/** 
		 * The number of edges in the graph 
		 */
		this.numEdges = 0;
		
		/** 
		 * Array containing all the nodes in the graph, accessed using their internal graph id 
		 */
		this.nodes = [];
		
		/**
		 * Array containing all of the nodes in the graph, accessed using their specified id (could be a string or number) 
		 */ 
		this.nodeLookupArray = [];		
		
		/** 
		 *  Array containing all of the edges in the graph
		 */
		this.edges = [];
		
		/**
		 * Array containing all of the edges in the graph, accessed using their specified id (could be a string or number) 
		 */ 
		this.edgeLookupArray = [];	
		
		/**
		 * Unique identifier for the node that is currently selected by the user. This value is -1 if no node is currently selected and in the interval [0, numNodes) otherwise.     
		 */
		this.selectedNodeId = -1;
		
		/**
		 * Unique identifier for the edge that is currently selected by the user. This value is -1 if no edge is currently selected and in the interval [0, numEdges) otherwise.     
		 */
		this.selectedEdgeId = -1;		
		
		/**
		 * Center position for each edgs attached to the currently selected node
		 * 
		 * @private
		 */
		this.edgeLabelPositions = [];
		
		/**
		 * Array containing the color id to pick an edge that is attached to the current selected node
		 * 
		 * @private
		 */
		this.edgeLabelColorIds = [];
			
		/**
		 * An HTML5 canvas in which all annotations for objects in the scene are drawn onto and then overlaid onto the current scene.
		 * 
		 * @private
		 */					
		this.labelCanvas = null;
				
		/** 
		 * Object to render nodes
		 * 
		 * @private
		 */
		this.nodeObj = undefined;
		
		/**
		 * Object to render node labels
		 * 
		 * @private
		 */
		this.nodeLabelObj = undefined;
		
		/**
		 * Object to render edges
		 * 
		 * @private
		 */
		this.edgeObj = undefined;
		
		/**
		 * Object to render edge labels
		 * 
		 * @private
		 */
		this.edgeLabelObj = undefined;
		
		/**
		 * Frame buffer object to render graph objects into for picking/selecting
		 * 
		 * @private
		 */ 
		this.frameBufferObj = new FrameBufferObject( );
		
		/**
		 * The layout technique for the graph. Defaults to a force directed layout.
		 * 
		 * @private
		 */				
		this.layout = undefined;
		
		/**
		 * The function used to render nodes.
		 * 
		 * @private 
		 */
		this.nodeRenderFunc = undefined;
		
		/**
		 * The function used to render nodes for color picking.
		 * 
		 * @private
		 */
		this.nodePickingRenderFunc = null;
		
		/**
		 * Whether to use WebGL for labels or HTML5 (currently not used)
		 * 
		 * @private
		 */
		this.useWebGLLabels = false;
		
		/**
		 * Texture atlas containing every ascii character. This is used for creating WebGL labels without consuming too much texture memory. (currently not used)  
		 * 
		 * @private
		 */	
		this.fontAtlas =  null;		

		// Constructor call
		this.initialize( config );

}

$3DJS.Graph.prototype = {
	 	
		/**
		 * Constructor 
		 * 
		 * @private
		 */
		initialize: function ( config ) {
			
				config = config || {};
			
				//this.fontAtlas = createFontAtlas( 1024, 1024 );
				this.layout = new $3DJS.ForceDirectedLayout( config.layout );					
				
				/**
				 * Autoupdates vertex buffer objects each time a node or edge is added to the graph. This is a slow operation
				 * that should be set to false for large graphs, 
				 */
				this.autoUpdateBuffers = ( config.autoUpdateBuffers == true || config.autoUpdateBuffers == undefined ) ? true : false;		
				
				this.nodeClickCallback = config.nodeClickCallback ? config.nodeClickCallback : function ( node ) { };
				
				this.edgeClickCallback = config.edgeClickCallback ? config.edgeClickCallback : function ( edge ) { };  
				
				this.settings = {
					
						// Specifies what the shape of the node will be when drawn (e.g. square, circle, cube, sphere, etc. ). Defaults to square.				 
						nodeShape : config.nodeShape ? config.nodeShape : 'quad',
						
						// Specifies the node color as a rgba vector. Defaults to black ([0.0, 0.0, 0.0, 1.0]).
						nodeColor : config.nodeColor ? config.nodeColor : [ 0.0, 0.0, 1.0, 1.0 ],
						
						// Specifies whether each node will have a unique texture (avatar) or will use a region of a texture atlas or no texture at all
						uniqueNodeTextures : ( config.uniqueNodeTextures == false || config.uniqueNodeTextures == undefined ) ? false : true, 
						
						// Determines whether or not the labels on the nodes will be displayed (set to false for better performance)
						renderNodeLabels: config.renderNodeLabels? config.renderNodeLabels : false,		
											
						// Color of the text written on the node. Defaults to black '#000000'.
						nodeLabelColor : config.nodeLabelColor ? config.nodeLabelColor : '#000000',
						
						// Color of the text written on the node. Defaults to black '#000000'.
						nodeLabelSize : config.nodeLabelSize ? config.nodeLabelSize : 1.0,
			
						// Specifies the edge color as a rgba vector. Defaults to black ([0.0, 0.0, 0.0, 1.0]).
						edgeColor: config.edgeColor ? config.edgeColor : [ 0.7, 0.7, 0.7, 1.0 ],
						
						// Specifies the edge color as a rgba vector. Defaults to black ([0.0, 0.0, 0.0, 1.0]).
						edgeTextColor: config.edgeTextColor ? config.edgeTextColor : '#000000',
						
						// Specifies the color of an edge when highlighted. Defaults to black ([0.0, 0.0, 0.0, 0.0]).
						edgeHighlightColor: config.edgeHighlightColor ? config.edgeHighlightColor : [0.0, 1.0, 0.0, 1.0],
						
						// Specifies whether or not the spatial partitioning should be displayed in addition to the graph
						renderSpatialPartition: config.renderSpatialPartition ? config.renderSpatialPartition : false
										
				};
				
				// Initialize the edge render object to a line array
				this.edgeObj = new $3DJS.LineArray( );
							
		},
		
		/**
		 * Analyze and compute metrics for the graph
		 * 
		 * Currently Implemented:
		 *   degree centrality
		 *   authority
		 */
		
		analyze: function ( ) {
			
				/**
				 * Calculate degree centrality and average edge weight (for authority metric)
				 */ 
				for ( var i=0; i < this.numNodes; i++ ) {
					
						this.nodes[i].degree_centrality = this.nodes[i].edgeIndices.length;
						
						/*
						this.nodes[i].avg_edge_weight = 0;
						
						for ( var j=0; j < this.nodes[i].edgeIndices.length; j++ ) {
							
								this.nodes[i].avg_edge_weight += this.edges[ this.nodes[i].edgeIndices[j] ].weight;
							
						}
						
						this.nodes[i].avg_edge_weight /= this.nodes[i].edgeIndices.length;
					
						this.calculateAuthority( i );
						*/
						
				}
			
		},	
		
		/**
		 * The centrality of a node. Based on the degree of the node with respect to the graph
		 * 
		 * @param {integer} nodeId the id for the node in the graph.
		 */
		
		calculateDegreeCentrality: function ( nodeId ) {
			
				this.nodesById[ nodeId ].degree_centrality = this.nodesById[ nodeId ].edgeIndices.length;
			
		},
		
		calculateOutDegreeCentrality: function ( nodeId ) {
			
				this.nodesById[ nodeId ].degree_centrality = 0;
			
				for ( var i=0; i < this.nodesById[ nodeId ].edgeIndices.length; ++i ) {
					
						var edge = this.edges[ this.nodesById[ nodeId ].edgeIndices[i] ];
						var source = edge.source;											
						
						if ( edge.bidirectional || source.id == nodeId ) {
												
								++this.nodesById[ nodeId ].degree_centrality;
						
						}
						
				}
			
		},
		
		/**
		 * The authority of a node, vi, is equal to the sum of wij^2 * bar(wj), where wij is the weight of the edge from vi to vj, 
		 * and bar(wj) is the average weight of the edges connected to node vj. 
		 * 
		 * @param {integer} nodeId the id for the node in the graph.
		 */
		calculateAuthority: function ( nodeId ) {
			
				this.nodes[ nodeId ].authority = 0;
			
				for ( var i=0; i < this.nodes[ nodeId ].edgeIndices.length; ++i ) {
					
						var source = this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].source;
						var dest = this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].dest;
						
						var _wj = source.avg_edge_weight;
						
						if ( source.id == nodeId ) 
							_wj = dest.avg_edge_weight; 
										
						this.nodes[ nodeId ].authority += ( this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].weight * this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].weight ) * _wj; 
					
				}
			
		},		
		
		/**
		 * @private
		 * @param node The node to be added.
		 */
		addNodeAsSingleObject: function ( node ) {  // change name (this will be used when for social networks or anytime we have a unique texture for each node)	
		
				// Create the object that will represent nodes when the graph is rendered
				if ( this.numNodes == 0 ) { 
					
						switch ( this.settings.nodeShape ) {
							case 'quad':
								this.nodeObj = new $3DJS.Quad( node.size, node.size );   								
								break;
							case 'circle':
								this.nodeObj = new Circle( 0.5 * settings.nodeSize, 30 );   // this is out of date, updated when needed next								
								break;
							default:
								this.nodeObj = new $3DJS.Quad( 1, 1 );   								
								break;
						}
						
				 				
				  		this.nodeObj.texture = []; 				  		
				  					  		
				  		if ( !node.imageUrl )
				  			this.nodeObj.shaderProgram[0] = loadShader( 'colorBillboard', setupColorBillboardShader );
				  		else
				  			this.nodeObj.shaderProgram[0] = loadShader( 'billboard', setupBillboardShader ); 
				  		this.nodeObj.shaderProgram[1] = loadShader( 'colorBillboard', setupColorBillboardShader ); 
				  		
				  		// Set the node render function
				  		this.nodeRenderFunc = this.drawNodesAsSingleObjects;
				  		
				}
				
				if ( node.imageUrl )
					this.nodeObj.texture[ node.graphId ] = createImageTexture( node.imageUrl, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );
			
		},
		
		/**
		 * @private
		 * @param node The node to be added.
		 */
		
		addNodeIntoObjectArray: function ( node ) {
			
				// Create the object that will represent nodes when the graph is rendered
				if ( this.numNodes == 0 ) { 
					
						switch ( this.settings.nodeShape ) {
							case 'quad':
								this.nodeObj = new $3DJS.QuadArray({
						    		width: node.size,
						    		height: node.size,
						    		color: node.colorId
						    	});						    							
								break;						
						}
						
						if ( !node.imageUrl ) {
				  			
				  				this.nodeObj.shaderProgram[0] = loadShader( 'colorBillboardArray', setupColorBillboardArrayShader );
				  		
				  		} else { 
				  				
				  				this.nodeObj.shaderProgram[0] = loadShader( 'billboardArray', setupBillboardArrayShader );
				  				this.nodeObj.texture = createImageTexture( node.imageUrl, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );		
			  						  				
				  		} 
						
						this.nodeObj.shaderProgram[1] = loadShader( 'colorIdBillboardArray', setupColorIdBillboardArrayShader );   
						
						this.nodeRenderFunc = this.nodeObj.render.bind(this.nodeObj); //change this 											
					
				} 
				
				this.nodeObj.addQuad({
					width: node.size,
					height: node.size,
					color: node.color,
					colorId: node.colorId,
					textureRegion: node.imageRegion
					
				});
				
				// Update vertex buffer objects
				if ( this.autoUpdateBuffers ) {
					
						this.nodeObj.updateVertexBuffers();
						
				}		
			
		},
		
		/** 
		 * Adds a node to the graph
		 * @public 
		 * @param {$3DJS.Node} node
		 */
		addNode: function ( node ) {
			
				// If the node already exists do not add it to the graph again and return.
				
				if ( this.nodeExists( node.id ) ) {
												
						return;
						
				}								
				
				// Assign a unique id to the node (should be internal to the graph object only, the user shouldn't care about this)
				node.id = node.id || this.numNodes;
				node.graphId = this.numNodes;
			
				// Add the node	if the id does not already exist		
				this.nodes[ node.graphId ] = node;
				this.nodeLookupArray[ node.id ] = node.graphId;
				//this.nodesById[ node.id ] = node;
				
				// Assign a color id so this node can be picked by the user (to be moved possibly)
				this.nodes[ node.graphId ].assignColorId( );		
				
				// Create the object that will represent nodes when the graph is rendered
				if ( this.numNodes == 0 ) { 
						
						// init frame buffer					
				  		this.frameBufferObj.init( gl.canvas.width, gl.canvas.height );
						this.frameBufferObj.initColorTexture( gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST );
						this.frameBufferObj.initDepthTexture( );
						this.frameBufferObj.disable( );	
						
						// Create an HTML5 canvas element to draw node labels on. This will be overlaid on top of the screen.
						this.labelCanvas = insertHTML5LabelCanvas({
							width: gl.canvas.width, 
							height: gl.canvas.height,
							fillStyle: this.settings.nodeLabelColor
						});
						
						this.labelCanvasObj = new FullScreenQuad( ); 
						this.labelCanvasObj.texture = $3DJS.createCanvasTexture( this.labelCanvas, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );					
						
				}
				
				if ( this.settings.uniqueNodeTextures )	{
					
						this.addNodeAsSingleObject( node );
					
				} else {
				
						this.addNodeIntoObjectArray( node );
					
				}	
													
				// determine if labels will be WebGL textures or HTML elements
				// WebGL textures will only be feasible with a small number of nodes (e.g. less than 1000), otherwise memory issues will occur
				/*
				if ( this.useWebGLLabels ) {
				
						this.nodeLabelObj.texture[ node.graphId ] = createCanvasTexture({ 
							text : node.name, 
							id : node.graphId, 
							width : 256, 
							height : 256,
							fillStyle: this.settings.nodeTextColor,
							font: '30px Helvetica Neue' 
						});
				
				} else {  // use HTML elements for node labels
				
						insertHTMLLabelElement( node.id, 256, 50 );	
					
				}	
				*/			
				
									
				
				// Increment the number of edges in the graph by 1
				++this.numNodes;
							
			
				return node;
		
		},
		
		/**
		 * Removes a node from the graph 
		 */
		
		removeNode: function ( id ) {
			
				if ( !this.nodeExists( id ) ) {
					
						return;
					
				}
					
				// Remove all edges that were attached to this node
				// This is a safety mechanism in case remove edge calls were not being made in addition to the remove node
				//this.removeEdgesAttachedToNode( id );
				
				// Shift Id's and remove the node
				for ( var i = this.nodesById[ id ].graphId; i < this.numNodes - 1; ++i ) {
										
						this.nodes[ i ] = this.nodes[ i + 1 ];
						
						this.nodeObj.texture[ i ] = this.nodeObj.texture[ i + 1 ];
						
						this.nodeLabelObj.texture[ i ] = this.nodeLabelObj.texture[ i + 1 ];
						
						this.nodes[ i ].graphId--;
						
						this.nodes[ i ].assignColorId( );
						
						//this.nodesById[ this.nodes[i].id ].graphId--;	
					
				}
				
				this.nodes.pop( );
				
				delete this.nodesById[ id ];
			
				graph.numNodes--;
				
		},
		
		/**
		 * Searches if a node exists within the graph.
		 * @param id the id of the node in the graph.
		 * @returns {Boolean} Returns true if the node exists and false otherwise.
		 */
		nodeExists: function ( id ) {
			
				//if ( this.nodesById[ id ] != null ) {
				if ( this.nodeLookupArray[ id ] != null ) { 
					
						//console.log( 'Debug: $3DJS.Node: ' + id + ' exists.')
						return true;
						
				} else { 
					
						//console.log( 'Debug: $3DJS.Node: ' + id + ' does not exist.')
						return false;
						
				}
				
		},			
		
		/**
		 * Returns the internal graph id number for a string type id
		 * 
		 * @param {String} id The id of the name
		 * @return {Integer} graphId The internal graph id for the node 
		 */
		getGraphId: function ( id ) {
			
				if ( this.nodeLookupArray[id] != null ) {
					
						return this.nodeLookupArray[id];
					
				} else {
					
						return -1;
					
				}
			
		},
		
		/**
		 * Returns the graph id for a node whose name matches the passed parameter
		 * Note that names are not necessarily unique, and this function will return the first node encountered with the specified name
		 * 
		 * @param {string} name The name of the node to search for 
		 */
		getIdForName: function ( name ) {
			
				for ( var i=0; i < this.numNodes; i++ ) {
					
						if ( graph.nodes[i].name == name )	
							return i;
						
				}
				
				return -1;
				
		},
		
		/**
		 * Adds an edge to the graph.
		 * 
		 * @param {Object} config Configuration of the edge
		 * @param {$3DJS.Node} config.source The source node (required).
		 * @param {$3DJS.Node} config.dest The destination node (required).
		 * @param {Bool} config.bidirectional True if undirected, false if directed. Defaults to true if not specified.
		 * @param {Object} config.metadata Arbitrary metadata associated with the edge (optional).
		 * 
		 */	
		addEdge: function ( data ) {
			
				var source = data.source;
				var dest = data.dest;
				
				// If the edge already exists do not add it to the graph again and return. Make this more robust later to handle bidirectionality				
				if ( this.edgeExists( source.id + "||" + dest.id ) || this.edgeExists( dest.id + "||" + source.id ) ) {
															
						return;
						
				}
				
				var sourceColor = data.sourceColor ? data.sourceColor : this.settings.edgeColor;
				var destColor = data.destColor ? data.destColor : this.settings.edgeColor;

				var bidirectional = data.bidirectional;
				
				if ( bidirectional == undefined ) bidirectional = true;

				var weight = data.weight;
				var metadata = data.metadata ? data.metadata : undefined;
				
				var edge_name = source.id + "||" + dest.id;
				
				// Add the edge index to each node so we know what edges the node is part of
				source.edgeIndices.push( this.numEdges );
				dest.edgeIndices.push( this.numEdges );
			
				// Create the edge
				this.edges[ this.numEdges ] = new $3DJS.Edge({ 
					id: edge_name, 
					graphId: this.numEdges,
					source: source, 
					dest: dest, 
					sourceColor: sourceColor,
					destColor: destColor,	
					bidirectional: bidirectional,				
					weight: weight,
					metadata: data.metadata 
				});
				
				this.edgeLookupArray[ edge_name ] = this.numEdges;
				//this.edgesById[ edge_name ] = this.edges[ this.numEdges ];
				
				// Push a new line onto the edge geometry (going to need to clean this code up later)
				if (this.numEdges == 0) {
						
						// USE THIS IF WE ARE USING A QUAD ARRAY TO RENDER THE EDGE LABELS
						/*
						this.edgeLabelObj = new $3DJS.QuadArray();
						
						// This is a variable attached onto the quad array, it is not defined in the $3DJS.QuadArray definition
						this.edgeLabelObj.offset = [];
						
						this.edgeLabelObj.shaderProgram[0] = loadShader( 'billboardArray', setupBillboardArrayShader );
						//this.edgeLabelObj = new $3DJS.Quad( 2, 0.5 );
						//this.edgeLabelObj.setColor( 0.8, 0.8, 0.8, 1.0 );  
						
						//this.edgeLabelObj.texture = this.fontAtlas;
						this.edgeLabelObj.texture = createFontAtlas( 1024, 1024 );				  						 
						
				  		//this.edgeLabelObj.shaderProgram[0] = loadShader( 'labelS', setupBillboardSShader ); 
				  		//this.edgeLabelObj.shaderProgram[1] = loadShader( 'coloredNodeS', setupColoredNodeSShader ); 
				  		*/
				  		
				  		// USE THIS IF WE JUST WANT A SIMPLE OBJECT TO CLICK ON
						this.edgeLabelObj = new Circle( 10, 30 );
						//this.edgeLabelObj.setColor( 0.0, 1.0, 0.0, 1.0 );
						this.edgeLabelObj.texture = createImageTexture( "textures/click.png", gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );
						this.edgeLabelObj.shaderProgram[0] = loadShader( 'billboard', setupBillboardShader ); 
				  		this.edgeLabelObj.shaderProgram[1] = loadShader( 'colorBillboard', setupColorBillboardShader ); 
				}
										
				/*
				// Prepare the quads that will be inserted into the QuadArray containing all the edge labels in the graph.
				// One quad per character in each label.
				var nameLength = edge_name.length;
				var offset = -0.5 * ( nameLength - 1 ); 
				
				for ( var i=0; i < nameLength; ++i ) {
					
						var textureRegion = getAtlasCharRegion( edge_name[i] );
								
						this.edgeLabelObj.addQuad({
							width: 5,
							height: 5,
							position: [ 0.0, 0.0, 0.0 ], // multiply this value by the width of the quad
							offset: [ ( offset + i ) * 5, 0.0, 0.0 ], 
							color: [ 1.0, 1.0, 1.0, 1.0],
							//colorId: node.colorId,							
				      		textureRegion: textureRegion								
						});
						
						// need to do some trickery here so that the labels will render the way we would like
						//this.edgeLabelObj.offsetVertexPosition( this.edgeLabelObj.numQuads - 1, [ ( offset + i ) * 5, 0.0, 0.0 ] );
				
				}
				
				console.log( this.edgeLabelObj.numQuads );
				
				// Set offsets so we know where the start of the label in the quad array begins. It is not straightforward since labels may have varying length.
				if (this.numEdges > 0) 
					this.edgeLabelObj.offset[this.numEdges] = this.edgeLabelObj.offset[this.numEdges - 1] + this.edges[this.numEdges - 1].name.length; 
				else
					this.edgeLabelObj.offset[0] = 0;
				*/
				
				/*
				this.edgeLabelObj.texture[ this.numEdges ] = createCanvasTexture({ 
					//text : source.id + ' to ' + dest.id,
					text : 'click for text snippet', 
					id : this.numEdges, 
					width : 256, 
					height : 64,
					fillStyle: this.settings.edgeTextColor,
					font: '24px Helvetica Neue'
				});
				*/
				weight = weight || 1.0;		
				
				this.edgeObj.addLine({
					p1: source.position,
					p2: dest.position,
					color1: sourceColor,
					color2: destColor
				});
				
				// Update edge vertex buffer objects
				if ( this.autoUpdateBuffers ) {
					
						this.edgeObj.updateVertexBuffers();
						//this.edgeLabelObj.updateVertexBuffers();
						
				}
				
				
				// Increment the number of edges in the graph by 1
				++this.numEdges;
							
		},
		
		/**
		 * Removes an edge from the graph 
		 */
		
		removeEdge: function ( id ) {
			
				if ( !this.edgeExists( id ) ) {
					
						return;
					
				}
				
				// Go through each node and remove any instance of the edge to be removed
				for ( var i = 0; i < this.numNodes; ++i ) {
					
						var index = -1;	
					
						for ( var j = 0; j < this.nodes[ i ].edgeIndices.length; ++j ) {
				
								if ( this.nodes[ i ].edgeIndices[ j ] == this.edgesById[ id ].graphId ) {
										
										index = j;																	
						
								}
				
								if ( this.nodes[ i ].edgeIndices[ j ]  > this.edgesById[ id ].graphId ) {
								
										this.nodes[ i ].edgeIndices[ j ]--;
										
								}										
						
						}
						
						if ( index >= 0 ) {
								
								this.nodes[ i ].edgeIndices[ index ] = this.nodes[ i ].edgeIndices[ this.nodes[ i ].edgeIndices.length - 1 ];	
										
								this.nodes[ i ].edgeIndices.pop( );
								
						}																																									
					
				}
				
				// Shift Id's
				for ( var i = this.edgesById[ id ].graphId; i < this.numEdges - 1; ++i ) {
					
						this.edges[ i ] = this.edges[ i + 1 ];
						
						this.edgeObj.vertices[ 6*i ] 	 = this.edgeObj.vertices[ 6*(i+1) ];
    					this.edgeObj.vertices[ 6*i + 1 ] = this.edgeObj.vertices[ 6*(i+1) + 1 ]; 
    					this.edgeObj.vertices[ 6*i + 2 ] = this.edgeObj.vertices[ 6*(i+1) + 2 ]; 
    					this.edgeObj.vertices[ 6*i + 3 ] = this.edgeObj.vertices[ 6*(i+1) + 3 ]; 
    					this.edgeObj.vertices[ 6*i + 4 ] = this.edgeObj.vertices[ 6*(i+1) + 4 ]; 
    					this.edgeObj.vertices[ 6*i + 5 ] = this.edgeObj.vertices[ 6*(i+1) + 5 ];
						
						this.edgeObj.color[ 8*i ] 	  = this.edgeObj.color[ 8*(i+1) ]; 
    					this.edgeObj.color[ 8*i + 1 ] = this.edgeObj.color[ 8*(i+1) + 1 ]; 
    					this.edgeObj.color[ 8*i + 2 ] = this.edgeObj.color[ 8*(i+1) + 2 ]; 
    					this.edgeObj.color[ 8*i + 3 ] = this.edgeObj.color[ 8*(i+1) + 3 ]; 
    					this.edgeObj.color[ 8*i + 4 ] = this.edgeObj.color[ 8*(i+1) + 4 ]; 
    					this.edgeObj.color[ 8*i + 5 ] = this.edgeObj.color[ 8*(i+1) + 5 ]; 
    					this.edgeObj.color[ 8*i + 6 ] = this.edgeObj.color[ 8*(i+1) + 6 ]; 
    					this.edgeObj.color[ 8*i + 7 ] = this.edgeObj.color[ 8*(i+1) + 7 ]; 
    					
    					//this.edgeObj.indices[ 2*i ]     = this.edgeObj.indices[ 2*(i+1) ] 
    					//this.edgeObj.indices[ 2*i + 1 ] = this.edgeObj.indices[ 2*(i+1) + 1 ] 
						
						this.edges[i].graphId--;
						
						//this.edgesById[ this.edges[i].id ].graphId--;	
					
				}
				
				this.edges.pop( );
				
				delete this.edgesById[ id ];
			
				this.numEdges--;
				
				// Update edge vertex buffer objects
				this.edgeObj.vertices.pop();
				this.edgeObj.vertices.pop();
				this.edgeObj.vertices.pop();
				this.edgeObj.vertices.pop();
				this.edgeObj.vertices.pop();
				this.edgeObj.vertices.pop();
				
				this.edgeObj.color.pop();
				this.edgeObj.color.pop();
				this.edgeObj.color.pop();
				this.edgeObj.color.pop();
				this.edgeObj.color.pop();
				this.edgeObj.color.pop();
				this.edgeObj.color.pop();
				this.edgeObj.color.pop();
				
				this.edgeObj.indices.pop();
    			this.edgeObj.indices.pop();
				    			
    			gl.bindBuffer( gl.ARRAY_BUFFER, this.edgeObj.vertexAttribArrayBuffers['position'].id );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.edgeObj.vertices ), gl.STREAM_DRAW );
				gl.bindBuffer( gl.ARRAY_BUFFER, null );
    			
    			gl.bindBuffer( gl.ARRAY_BUFFER, this.edgeObj.vertexAttribArrayBuffers['color'].id );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.edgeObj.color ), gl.STREAM_DRAW );
				gl.bindBuffer( gl.ARRAY_BUFFER, null );
				
				this.edgeObj.elementArrayBuffer.count = 2 * this.numEdges;
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.edgeObj.elementArrayBuffer.id );
				gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.edgeObj.indices ), gl.STREAM_DRAW );
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
    			
				//this.updateEdges();
				
		},
		
		removeEdgesAttachedToNode: function ( id ) {
			
				for ( var i = 0; i < this.nodesById[ id ].edgeIndices.length; ++i ) {
					
						var edgeIndex = this.nodesById[ id ].edgeIndices[ i ];
						
						this.removeEdge( this.edges[ edgeIndex ].id );
					
				}
			
		},
		
		/**
		 * Searches if an edge exists within the graph.
		 * @param id the id of the edge in the graph.
		 * @returns {Boolean} Returns true if the edge exists and false otherwise.
		 */
		edgeExists: function ( id ) {
			
				if ( this.edgeLookupArray[ id ] != null ) { 
										
						return true;
						
				} else { 
											
						return false;
						
				}
			
		},
		
		/**
		 * Update the edge buffer objects
		 */
		updateEdges: function ( ) {
				
				var i = this.numEdges;							
				
				while ( i-- ) {   // this calculation should be moved to where the forces are being determined		    	

		    			this.edgeObj.updateVertex( 6*i, this.edges[i].source.position );
		    			this.edgeObj.updateVertex( 6*i + 3, this.edges[i].dest.position );     					    					    
		    			
		    			var edge = this.edges[ i ];
							
						var avg_position = vec3.create();
						
						vec3.add( edge.source.position, edge.dest.position, avg_position );
						vec3.multiply( avg_position, 0.5, avg_position );
						
						//this.edgeLabelPositions[i] = avg_position;
						// the below code can be optimized if we are only displaying the edge labels for the selected node												
						/*
						var nameLength = edge.name.length;
						
						for ( var j = 0; j < nameLength; ++j ) {
						
								this.edgeLabelObj.setWorldPosition( this.edgeLabelObj.offset[i] + j, avg_position );
								this.edgeLabelObj.setVisibility( this.edgeLabelObj.offset[i] + j, false )							
													
						}
						*/	
					   	
		    	}		  
		    	    		
		    	for ( var i=0; i < this.edgeObj.numRequiredBuffers; i++ ) {
		    	
		    			gl.bindBuffer( gl.ARRAY_BUFFER, this.edgeObj.vertexAttribArrayBuffers[i]['position'].id );
						gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.edgeObj.vertices[i] ), gl.STREAM_DRAW );
						
				}
				
				gl.bindBuffer( gl.ARRAY_BUFFER, null );
				
				// get average position of each of the selected node's edges				
				if ( this.selectedNodeId != -1 ) {
				
						i = this.nodes[ this.selectedNodeId ].edgeIndices.length;
										 		
						while ( i-- ) {
						
								//var edge = this.edges[ this.nodes[ this.selectedNodeId ].edgeIndices[i] ];
								var edgeIndex = this.nodes[ this.selectedNodeId ].edgeIndices[i]
								var nameLength = this.edges[edgeIndex].name.length;
							
								/*
								for ( var j = 0; j < nameLength; ++j ) {
																
										this.edgeLabelObj.setVisibility( this.edgeLabelObj.offset[edgeIndex] + j, true )							
															
								}
								*/	
								
								var edge = this.edges[ this.nodes[ this.selectedNodeId ].edgeIndices[i] ];
							
								var avg_position = vec3.create();
								
								vec3.add( edge.source.position, edge.dest.position, avg_position );
								vec3.multiply( avg_position, 0.5, avg_position );
								
								this.edgeLabelPositions[i] = avg_position;
								/*
								// Particles
								
								var difference = vec3.create();
								var direction = vec3.create(); 
								var distance;
								var position = vec3.create();
								var velocity = vec3.create();
								
								vec3.subtract( edge.dest.position, edge.source.position, difference ); 								
								distance = vec3.magnitude( difference );						
								vec3.divide( difference, distance, direction );
								vec3.multiply( direction, 50.0, velocity );
								
								vec3.set( position, this.nodes[ this.selectedNodeId ].position[0], this.nodes[ this.selectedNodeId ].position[1], this.nodes[ this.selectedNodeId ].position[2] );
								*/
						}  
					
				}				
			
		},
		
		/**
		 * Renders the graph 
		 * @private
		 */
		
		render2: function ( ) {
				
				var i;
				
				if ( this.numEdges > 0 ) {
				// Render edges ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				var program = this.edgeObj.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	var vertexAttribArrayBuffers = this.edgeObj.vertexAttribArrayBuffers;
			   	var attributes = this.edgeObj.shaderProgram[0].attributes;   
			   	
			   	// Enable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
				   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
				   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
			   		
			   	}
		  		   	
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  	
			   	gl.bindBuffer( this.edgeObj.elementArrayBuffer.target, this.edgeObj.elementArrayBuffer.id );
			   	gl.drawElements( gl.LINES, this.edgeObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			
		
		       	// Disable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.disableVertexAttribArray( attributes[ attrib ] );
				   		
			   	} 
				
				// Render edge labels //////////////////////////////////////////////////////////////////////////////////////////////////////////////
				program = this.edgeLabelObj.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	vertexAttribArrayBuffers = this.edgeLabelObj.vertexAttribArrayBuffers;
			   	attributes = this.edgeLabelObj.shaderProgram[0].attributes;   
			   	
			   	// Enable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
				   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
				   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
			   		
			   	}
		  
			   	
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  	
			  	gl.uniform4fv( program.colorUniform, [ 1.0, 1.0, 1.0, 1.0] );
			  	gl.uniform1f( program.scaleUniform, 50.0 ); 			
			  		  	     			   		   	 	   		  	   		    
			   	// Render edge labels if a node is selected
		
				if ( this.selectedNodeId != -1 ) {
						
						gl.bindBuffer( this.edgeLabelObj.elementArrayBuffer.target, this.edgeLabelObj.elementArrayBuffer.id );				
																    					   
	    			   	//gl.disable( gl.DEPTH_TEST ); 
					   	//gl.enable( gl.BLEND );
						//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
						
						gl.activeTexture( gl.TEXTURE0 );
						
						i = this.nodes[this.selectedNodeId].edgeIndices.length;
						
						while ( i-- ) {						
																	
							  	gl.bindTexture( gl.TEXTURE_2D, this.edgeLabelObj.texture[ this.nodes[this.selectedNodeId].edgeIndices[i] ] ); 		
								gl.uniform1i( program.samplerUniform, 0 );
							
								gl.uniform3fv( program.worldPosUniform, this.edgeLabelPositions[i] );     // this should be a custom function not one for universally rendering billboards		
			   					gl.drawElements( this.edgeLabelObj.drawMode, this.edgeLabelObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );
							
						}
						
						//gl.disable( gl.BLEND );
						//gl.enable( gl.DEPTH_TEST );
																		
				}
				
				// Disable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.disableVertexAttribArray( attributes[ attrib ] );
				   		
			   	} 
			   	
				}
				
				if ( graph.numNodes > 0 ) {
				
				// Render node labels (uses some of the calls from the rendering nodes section, such as blending) ///////////////////////////////////////////
			   	program = this.nodeLabelObj.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	vertexAttribArrayBuffers = this.nodeLabelObj.vertexAttribArrayBuffers;
			   	attributes = this.nodeLabelObj.shaderProgram[0].attributes;   
			   	
			   	// Enable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
				   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
				   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
			   		
			   	}
			   	
			    // Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  			  				   
			   	
			   	gl.uniform4fv( program.colorUniform, [ 1.0, 1.0, 1.0, 1.0 ] );	
			   	
			   	gl.uniform1f( program.scaleUniform, this.nodeLabelObj.labelSize ); 			   				   				
						
				gl.activeTexture( gl.TEXTURE0 );
				gl.bindBuffer( this.nodeLabelObj.elementArrayBuffer.target, this.nodeLabelObj.elementArrayBuffer.id );
				
				//gl.disable( gl.DEPTH_TEST ); 
			   	gl.enable( gl.BLEND );
			   	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
				//gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
				
				i = this.numNodes;
				   		   						   		   
			   	while ( i-- ) {			   	
			   					  			   			
			  			gl.bindTexture( gl.TEXTURE_2D, this.nodeLabelObj.texture[i] ); 		
						gl.uniform1i( program.samplerUniform, 0 ); 											
				   				
			   			gl.uniform3fv( program.worldPosUniform, this.nodes[i].position );     // this should be a custom function not one for universally rendering billboards			   				
			   			gl.drawElements( this.nodeLabelObj.drawMode, this.nodeLabelObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			
				
			   	}  
			
				
				gl.disable( gl.BLEND );
				//gl.enable( gl.DEPTH_TEST );
				
		       	// Disable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.disableVertexAttribArray( attributes[ attrib ] );
				   		
			   	}     	
					
				// Render nodes ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				program = this.nodeObj.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	vertexAttribArrayBuffers = this.nodeObj.vertexAttribArrayBuffers;
			   	attributes = this.nodeObj.shaderProgram[0].attributes;   
			   	
			   	// Enable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
				   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
				   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
			   		
			   	}
			   	
			   
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  	
			  	// This line of code will eventually have to be in the while loop below since it is not necessarily uniform across all nodes
			  	//gl.uniform1f( program.scaleUniform, this.nodes[0].size ); 
			  		
			  	//gl.uniform4fv( program.colorUniform, [ 1.0, 1.0, 1.0, 1.0 ] );		
				//gl.uniform4fv( program.colorUniform, settings.nodeColor );
				 			  		  	     			   		   	 	   		  	   		   
			   	// Render each node	
			   	
			   	gl.bindBuffer( this.nodeObj.elementArrayBuffer.target, this.nodeObj.elementArrayBuffer.id );	
			   	
			   	//gl.disable( gl.DEPTH_TEST ); 
			   	//gl.enable( gl.BLEND );
			   	//gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
				//gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
			   	
			   	gl.activeTexture( gl.TEXTURE0 );
			   	
			   	i = this.numNodes;					
						   		   		   		   	
			   	while ( i-- ) {			   	
			   					  
			  			gl.bindTexture( gl.TEXTURE_2D, this.nodeObj.texture[i] ); 		
						gl.uniform1i( program.samplerUniform, 0 ); 

						gl.uniform1f( program.scaleUniform, this.nodes[i].size ); 
						//if (i == fdgraph.selectedNodeId)
						//	gl.uniform4fv( program.colorUniform, [0.0, 1.0, 0.0, 1.0] );
						//else
					//		gl.uniform4fv( program.colorUniform, [1.0, 1.0, 1.0, 1.0] );
						gl.uniform4fv( program.colorUniform, this.nodes[i].color );					
				   			
			   			gl.uniform3fv( program.worldPosUniform, this.nodes[i].position );     // this should be a custom function not one for universally rendering billboards		
			   			gl.drawElements( this.nodeObj.drawMode, this.nodeObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			
				
			   	}  
			   	
			   	//gl.disable( gl.BLEND );
				//gl.enable( gl.DEPTH_TEST );
			   	
			   	// Disable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.disableVertexAttribArray( attributes[ attrib ] );
				   		
			   	}   
			   	
			   	 																	
				
				// Render nodes again for picking //////////////////////////////////////////////////////////////////////////////////////////////////
			   	// *This code would be far more efficient if we could use multiple render targets, however we cannot currently do this with WebGL			   	
			   	program = this.nodeObj.shaderProgram[1];   		   		
		       	gl.useProgram( program );
					 								   	
			   	vertexAttribArrayBuffers = this.nodeObj.vertexAttribArrayBuffers;
			   	attributes = this.nodeObj.shaderProgram[1].attributes;   
			   	
			   	// Enable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
				   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
				   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
			   		
			   	}
			    	   
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  		  	
			  	//gl.uniform1f( program.scaleUniform, this.nodes[0].size ); 
			  	  		  	     			   		   	 	   		  	   		    
			   	// Render each node	
			   	i = this.numNodes;
			   	   	
			   	gl.bindBuffer( this.nodeObj.elementArrayBuffer.target, this.nodeObj.elementArrayBuffer.id );   	
			   	
			   	// Because of this we will only draw after we have detected a user click
			   	this.frameBufferObj.enable();
			   	
			    gl.clearColor( 1.0, 0.0, 0.0, 0.0 );
			    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
			   	   		   	
			   	while ( i-- ) {			   	
				   			
				   		gl.uniform1f( program.scaleUniform, this.nodes[i].size ); 	
			   			gl.uniform3fv( program.worldPosUniform, this.nodes[i].position );     // this should be a custom function not one for universally rendering billboards	
			   			gl.uniform4fv( program.colorUniform, this.nodes[i].colorId );	
			   						   			
			   			gl.drawElements( this.nodeObj.drawMode, this.nodeObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			
				
			   	}  
			   			

			   	       	  
		       	// Disable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.disableVertexAttribArray( attributes[ attrib ] );
				   		
			   	} 
				}
				
				if (this.numEdges > 0) {
				// Render edges labels again for picking //////////////////////////////////////////////////////////////////////////////////////////////////
				var program = this.edgeLabelObj.shaderProgram[1];   		   		
		       	gl.useProgram( program );
					 								   	
			   	var vertexAttribArrayBuffers = this.edgeLabelObj.vertexAttribArrayBuffers;
			   	var attributes = this.edgeLabelObj.shaderProgram[1].attributes;   
			   	
			   	// Enable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
				   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
				   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
			   		
			   	}
			   	
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  	
			  	gl.uniform1f( program.scaleUniform, 50.0 ); 
			
			  		  	     			   		   	 	   		  	   		    
			   	// Render edge labels if a node is selected
		
				if ( this.selectedNodeId != -1 ) {
						
						gl.bindBuffer( this.edgeLabelObj.elementArrayBuffer.target, this.edgeLabelObj.elementArrayBuffer.id );				
					
					    i = this.nodes[this.selectedNodeId].edgeIndices.length;
		
						while ( i-- ) {																						
									  	
								gl.uniform3fv( program.worldPosUniform, this.edgeLabelPositions[i] );     // this should be a custom function not one for universally rendering billboards
								gl.uniform4fv( program.colorUniform, this.edgeLabelColorIds[i] );		
			   					gl.drawElements( gl.TRIANGLE_STRIP, this.edgeLabelObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );
							
						}
									
				}
				
				// Disable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.disableVertexAttribArray( attributes[ attrib ] );
				   		
			   	} 	
				
				}			   	
			    this.frameBufferObj.disable();
				
				// Render edge labels again for picking ////////////////////////////////////////////////////////////////////////////////////////////////
				/*
				labelfbo.enable();
			   	
			   	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
			   	
			   	var program = fdgraph.nodeObj.shaderProgram[1];   		   		
		       	gl.useProgram( program );
					 								   	
			   	var vertexAttribArrayBuffers = fdgraph.nodeObj.vertexAttribArrayBuffers;
			   	var attributes = fdgraph.nodeObj.shaderProgram[1].attributes;   
			   	
			   	// Enable vertex buffer objects   					   			
			   	gl.bindBuffer( vertexAttribArrayBuffers[ 'position' ].target, vertexAttribArrayBuffers[ 'position' ].id );	 
			   	gl.enableVertexAttribArray( attributes[ 'position' ] );  			
			   	gl.vertexAttribPointer( attributes[ 'position' ], vertexAttribArrayBuffers[ 'position' ].size, gl.FLOAT, false, 0, 0);
			    	   
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  		  	
			  	gl.uniform1f( program.scaleUniform, 50.0 ); 
			  	  		  	     			   		   	 	   		  	   		    
			   	// Render each node	
			   	i = this.numNodes;
			   	   		   	
			   	while ( i-- ) {
				   			
			   			gl.uniform3fv( program.worldPosUniform, this.nodes[i].position );     // this should be a custom function not one for universally rendering billboards	
			   			gl.uniform4fv( program.colorUniform, this.nodes[i].colorId );	
			   			
			   			gl.bindBuffer( this.nodeObj.elementArrayBuffer.target, this.nodeObj.elementArrayBuffer.id );
			   			gl.drawElements( gl.TRIANGLE_STRIP, this.nodeObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			
				
			   	}  
			   	
			   	       	  
		       	// Disable vertex buffer objects       	
				gl.disableVertexAttribArray( attributes[ 'position' ] );	
				
				labelfbo.disable();
				*/
				
		},
		
		// Update the graph for each frame, this includes the graph layout and label positions
		update: function ( ) {
			
				var currentTime = new Date().getTime();
				var elapsed = currentTime - $3DJS.previousTime;
				$3DJS.elapsedTime += elapsed;
				
				// Increment the frame count   					  		
				$3DJS.frameCount++;
				
				// Update frames per second (FPS) counter
				if ( $3DJS.elapsedTime >= 1000 ) {
					
						//fps.innerHTML = "FPS: " + ( $3DJS.frameCount / ( $3DJS.elapsedTime * 0.001 ) ).toFixed(1);
						$3DJS.elapsedTime = 0.0;	
						$3DJS.frameCount = 0;			
					
				}
				
				
				// Set previous time to the current time
				$3DJS.previousTime = currentTime;
			
				// Clear the label canvas
				if (this.settings.renderNodeLabels ) {
										
						this.labelCanvas.context.clearRect( 0, 0, gl.canvas.width, gl.canvas.height );
				
				}
			
				// Update the layout of the graph						
				//this.layout.update( this );    // Brute force O(N^2) time complexity
				
				//if ( this.layout.totalKineticEnergy > this.layout.stableEnergyThreshold ) {  // Spatial partitioning O(N log N) time complexity
												
						this.layout.octree.constructBarnesHutTree( this.nodes, this.layout.center, this.layout.bounds ); 		
						this.layout.barnesHutForce( this );
												
				//}
				
				// Update vertex buffers for the nodes and edges
				for ( var i=0; i < this.nodeObj.numRequiredBuffers; ++i ) {
						
						this.nodeObj.vertexAttribArrayBuffers[i]['worldPos']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.nodeObj.worldPos[i] ),  3, this.nodeObj.worldPos[i].length / 3, gl.DYNAMIC_DRAW );
						
				}
				/*
				for ( var i=0; i < this.edgeLabelObj.numRequiredBuffers; ++i ) {
						
						this.edgeLabelObj.vertexAttribArrayBuffers[i]['worldPos'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.edgeLabelObj.worldPos[i] ), 3, this.edgeLabelObj.worldPos[i].length / 3, gl.DYNAMIC_DRAW );
						this.edgeLabelObj.vertexAttribArrayBuffers[i]['visible']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.edgeLabelObj.visible[i] ),  1, this.edgeLabelObj.visible[i].length,	   gl.DYNAMIC_DRAW );
						
				}    	
				*/
				// Update edge vertex positions				
				this.updateEdges( );				
				
				
				// Update the particles (add into updateEdges function to reduce the number of loops)				
				// this.updateParticles( );							
				
		},
			
		/**
		 * Animate the graph and draw it
		 */			
		render: function ( ) {
			
				// Update the graph before drawing
				this.update();
			
				// WebGL stuff (move)
				gl.clearColor( $3DJS.backgroundColor[0], $3DJS.backgroundColor[1], $3DJS.backgroundColor[2], $3DJS.backgroundColor[3] );
		       	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		
				// Define viewport
				gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
		   	 	
		   	 	// Perspective transformation
		       	mat4.perspective( 45, gl.canvas.width / gl.canvas.height, 1.0, 100000.0, $3DJS.PMatrix );
				
				// Modelview transformation
		       	mat4.identity( $3DJS.MVMatrix );     
		       	//mat4.translate( $3DJS.MVMatrix, 0.0, 0.0, -50 );                  
		       	mat4.multiply( $3DJS.MVMatrix, $3DJS.interactor.transform, $3DJS.MVMatrix );
			
				// Render the octree
				if ( this.settings.renderSpatialPartition )
					this.layout.octree.render();
			
				// Draw the graph
				this.draw( );					
				
				// Process user keyboard input
				$3DJS.interactor.handleInput( );
				
				// Object picking
				if ( $3DJS.interactor.rightMouseDown ) {
		       		
		       			this.handlePickedObject( );       			
		       		
		       	}  
				
				// Callback for render function
				requestAnimationFrame( this.render.bind(this) );
			   				   			   				   	 			
		},
		
		// Draw the graph
		draw: function ( ) {
			
				// Render edges ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			   	this.edgeObj.render( );			  
			   	
			   	// Render nodes ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				//gl.disable(gl.DEPTH_TEST);
				gl.enable(gl.BLEND);
				gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
				//gl.blendFunc( gl.ONE, gl.ONE );
				
				this.nodeRenderFunc( );
					
				gl.disable(gl.BLEND);		
				//gl.enable(gl.DEPTH_TEST);					
	
				// Render nodes for picking ////////////////////////////////////////////////////////////////////////////////////////////////////////
			   	var program = this.nodeObj.shaderProgram[1];   		   		
		       	gl.useProgram( program );
					 								
				for ( var i=0; i < this.nodeObj.numRequiredBuffers; ++i ) {		 								   	
								 								   	
					   	var vertexAttribArrayBuffers = this.nodeObj.vertexAttribArrayBuffers[i];
					   	var attributes = this.nodeObj.shaderProgram[1].attributes;   
					   	
					   	// Enable vertex buffer objects	   					
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
						   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
						   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
					   		
					   	}			  	 
					   	
					   	// Bind projection and modelview matrices
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );						  						  
			   	
					   	// Because of this we will only draw after we have detected a user click					   
					   	this.frameBufferObj.enable();
					   	gl.clearColor( 1.0, 0.0, 0.0, 0.0 );
						gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
					   	  	  					  					  		  	     			   		   	 	 
					  	// Draw the shape  		  	   		    					   	
					   	gl.bindBuffer( this.nodeObj.elementArrayBuffer[i].target, this.nodeObj.elementArrayBuffer[i].id );
					   	gl.drawElements( this.nodeObj.drawMode, this.nodeObj.elementArrayBuffer[i].count, gl.UNSIGNED_SHORT, 0 );  
				       	  
						// Disable vertex buffer objects
						for ( attrib in attributes ) {  					   			
					   						   			 
						   		gl.disableVertexAttribArray( attributes[ attrib ] );  							   		
					   		
					   	}
					   	
					   	this.frameBufferObj.disable();	
					   	
				}
				
				// Render edge labels //////////////////////////////////////////////////////////////////////////////////////////////////////////////
			   	//if ( this.renderEdgeLabels == true ) 
			   	//	this.edgeLabelObj.render();
			   	this.drawEdgeSelectors();
				
				// Render node labels using a fullscreen quad overlay
				if ( this.settings.renderNodeLabels ) {
										
						this.labelCanvasObj.updateTexture( this.labelCanvas );
						this.labelCanvasObj.render();
						
				}	
							
			
		},
		
		/**
		 * This function will be called when we need to draw nodes individually instead of packing them together into vertex buffer objects
		 * @private 
		 */
		drawNodesAsSingleObjects: function ( ) {
			
				program = this.nodeObj.shaderProgram[0];   		   		
		       	gl.useProgram( program );
					 								   	
			   	vertexAttribArrayBuffers = this.nodeObj.vertexAttribArrayBuffers;
			   	attributes = this.nodeObj.shaderProgram[0].attributes;   
			   	
			   	// Enable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
				   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
				   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
			   		
			   	}
			   	
			   
			   	// Bind uniforms that are constant for all nodes in the cascade
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
			  	
			  	// This line of code will eventually have to be in the while loop below since it is not necessarily uniform across all nodes
			  	//gl.uniform1f( program.scaleUniform, this.nodes[0].size ); 
			  		
			  	//gl.uniform4fv( program.colorUniform, [ 1.0, 1.0, 1.0, 1.0 ] );		
				//gl.uniform4fv( program.colorUniform, settings.nodeColor );
	
			   	gl.bindBuffer( this.nodeObj.elementArrayBuffer.target, this.nodeObj.elementArrayBuffer.id );				   		
			   	
			   	gl.activeTexture( gl.TEXTURE0 );
			   	
			   	i = this.numNodes;					
						   		   		   		   	
			   	while ( i-- ) {			   	
			   					  
			  			gl.bindTexture( gl.TEXTURE_2D, this.nodeObj.texture[i] ); 		
						gl.uniform1i( program.samplerUniform, 0 ); 

						gl.uniform1f( program.scaleUniform, this.nodes[i].size ); 
						//if (i == fdgraph.selectedNodeId)
						//	gl.uniform4fv( program.colorUniform, [0.0, 1.0, 0.0, 1.0] );
						//else
					//		gl.uniform4fv( program.colorUniform, [1.0, 1.0, 1.0, 1.0] );
						gl.uniform4fv( program.colorUniform, this.nodes[i].color );					
				   			
			   			gl.uniform3fv( program.worldPosUniform, this.nodes[i].position );     // this should be a custom function not one for universally rendering billboards		
			   			gl.drawElements( this.nodeObj.drawMode, this.nodeObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	   			
				
			   	}  			   	
			   	
			   	// Disable vertex buffer objects 
			   	for ( attrib in attributes ) {  					   			
			   		
				   		gl.disableVertexAttribArray( attributes[ attrib ] );
				   		
			   	}   
			
		},
		
		/**
		 * This function draws objects on the center of highlighted edges for users to click on.
		 * @private 
		 */
		drawEdgeSelectors: function ( ) {
			
				// Render edge labels if a node is selected				
				if ( this.selectedNodeId != -1 ) {
					
						// Render the edge selector //////////////////////
					
						var program = this.edgeLabelObj.shaderProgram[0];   		   		
				       	gl.useProgram( program );
							 								   	
					   	var vertexAttribArrayBuffers = this.edgeLabelObj.vertexAttribArrayBuffers;
					   	var attributes = this.edgeLabelObj.shaderProgram[0].attributes;   
					   	
					   	// Enable vertex buffer objects 
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
						   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
						   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
					   		
					   	}
				  
					   	
					   	// Bind uniforms that are constant for all nodes in the cascade
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
					  	
					  	gl.uniform4fv( program.colorUniform, [ 1.0, 1.0, 1.0, 1.0] );
					  	gl.uniform1f( program.scaleUniform, 1.0 ); 			  	
					  
					  	gl.activeTexture( gl.TEXTURE0 );
					  	gl.bindTexture( gl.TEXTURE_2D, this.edgeLabelObj.texture ); 		
						gl.uniform1i( program.samplerUniform, 0 ); 	
					   	
						gl.bindBuffer( this.edgeLabelObj.elementArrayBuffer.target, this.edgeLabelObj.elementArrayBuffer.id );				
											    					   	    					
						var i = this.nodes[this.selectedNodeId].edgeIndices.length;
						
						while ( i-- ) {						
																	
								gl.uniform3fv( program.worldPosUniform, this.edgeLabelPositions[i] );     // this should be a custom function not one for universally rendering billboards		
			   					gl.drawElements( this.edgeLabelObj.drawMode, this.edgeLabelObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );		
							
						}
						
						// Disable vertex buffer objects 
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.disableVertexAttribArray( attributes[ attrib ] );
						   		
					   	}
					   	
					   	// Render the edge selector again so the user can click on it ///////////////////
			
						program = this.edgeLabelObj.shaderProgram[1];   		   		
				       	gl.useProgram( program );
							 								   	
					   	vertexAttribArrayBuffers = this.edgeLabelObj.vertexAttribArrayBuffers;
					   	attributes = this.edgeLabelObj.shaderProgram[1].attributes;   
					   	
					   	// Enable vertex buffer objects 
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.bindBuffer( vertexAttribArrayBuffers[ attrib ].target, vertexAttribArrayBuffers[ attrib ].id );	 
						   		gl.enableVertexAttribArray( attributes[ attrib ] );  			
						   		gl.vertexAttribPointer( attributes[ attrib ], vertexAttribArrayBuffers[ attrib ].size, gl.FLOAT, false, 0, 0);
					   		
					   	}
				  
					   	
					   	// Bind uniforms that are constant for all nodes in the cascade
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  	  	
					  	
					  	gl.uniform1f( program.scaleUniform, 1.0 ); 		
					  	
					  	// Because of this we will only draw after we have detected a user click
					   	this.frameBufferObj.enable();
					   	
					    //gl.clearColor( 1.0, 0.0, 0.0, 0.0 );
					    //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );	  	
					  
						gl.bindBuffer( this.edgeLabelObj.elementArrayBuffer.target, this.edgeLabelObj.elementArrayBuffer.id );				
																    					   						
						i = this.nodes[this.selectedNodeId].edgeIndices.length;
						
						while ( i-- ) {						
																
								gl.uniform4fv( program.colorUniform, this.edgeLabelColorIds[i] );	
								gl.uniform3fv( program.worldPosUniform, this.edgeLabelPositions[i] );     // this should be a custom function not one for universally rendering billboards		
			   					gl.drawElements( this.edgeLabelObj.drawMode, this.edgeLabelObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );		
							
						}
						
						this.frameBufferObj.disable();
						
																			
						// Disable vertex buffer objects 
					   	for ( attrib in attributes ) {  					   			
					   		
						   		gl.disableVertexAttribArray( attributes[ attrib ] );
						   		
					   	} 
			   	
			   	}
			
		},
		
		/**
		 * Handling for when a node or edge is selected in the graph
		 */
		handlePickedObject: function ( ) {
	
				var width  = this.frameBufferObj.width; 
				var height = this.frameBufferObj.height;
				var x = $3DJS.interactor.lastMouseX;
				var y = ( height - 1 ) - $3DJS.interactor.lastMouseY;
				
				// If the mouse button is not currently being held down 
			
				if ( $3DJS.interactor.buttonReleased ) {
					
						$3DJS.interactor.buttonReleased = false;
									
						this.frameBufferObj.enable();	
						var pixels = new Uint8Array( width * height * 4);	
						gl.readPixels( 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels );		
						this.frameBufferObj.disable();				
						
						// if red channel of the pixel is fully red, nothing was selected 
						
						if ( pixels[ 4 * ( y * width + x ) ] == 255 ) {      
								
								this.unHighlightNodeEdges( );
								this.selectedNodeId = -1;
								this.selectedEdgeId = -1;													
								
								return;
								
						}
									
						// retrieve id from color	
						var id = ( pixels[ 4 * ( y * width + x ) ]     << 24 ) +
			         		 	 ( pixels[ 4 * ( y * width + x ) + 1 ] << 16 ) +
			      	 			 ( pixels[ 4 * ( y * width + x ) + 2 ] <<  8 ) +
			      	 		 	 ( pixels[ 4 * ( y * width + x ) + 3 ]       );
		
																									
						if ( id < this.numNodes ) {      // A node was clicked by the user.												
							
								// Dispatch event to canvas (could change)
								/*
								var nodeClickEvent = new CustomEvent(
									"nodeClick",
									{
										detail: {
											node: this.nodes[ id ],											
										},
										bubbles: true,
										cancelable: true
									}
								);
								
								document.getElementById("canvas3djs").dispatchEvent( nodeClickEvent );
								*/
								this.nodeClickCallback( this.nodes[ id ] );
							
								// If a dialog was open, close it.
								
								//$( "#dialog" ).dialog( "close" );		
								
								// Unhighlight previously lit edges
								
								this.unHighlightNodeEdges( );											
								
								// Set the currently selected node and highlight its edges
								
								this.selectedEdgeId = -1;        // an edge cannot be selected if a node is selected
								this.selectedNodeId = id;	
								this.highlightNodeEdges( );	
								
		
								/*
								// Assign a dark grey color multiplier to all nodes, this is so that the selected node and its linked nodes can pop out visually																
								for ( var i=0; i < graph.numNodes; i++ ) {
																														
									graph.nodes[i].color = [ 0.25, 0.25, 0.25, 1.0 ];
											
								}
								*/										
								
								// Get the average position of each of the selected node's edges.
								var i = this.nodes[ this.selectedNodeId ].edgeIndices.length;
						
								while ( i-- ) {
									
										var edge = this.edges[ this.nodes[ this.selectedNodeId ].edgeIndices[i] ];
									
										// "Highlight" all nodes linked with the currently selected node (new) 
										
										//edge.src_node.color = [ 1.0, 1.0, 1.0, 1.0 ];
										//edge.dst_node.color = [ 1.0, 1.0, 1.0, 1.0 ];								
										
										//
																					
										var avg_position = vec3.create();
										
										vec3.add( edge.source.position, edge.dest.position, avg_position );
										vec3.multiply( avg_position, 0.5, avg_position );
										
										this.edgeLabelPositions[i] = avg_position;
										
										this.edgeLabelColorIds[i] = vec4.create();
										var scale = 1.0 / 255.0;
										vec4.set( this.edgeLabelColorIds[i], 
												  ( ( this.numNodes + i >> 24 ) & 0xFF ) * scale, 
												  ( ( this.numNodes + i >> 16 ) & 0xFF ) * scale, 
												  ( ( this.numNodes + i >> 8  ) & 0xFF ) * scale, 
												  ( ( this.numNodes + i )       & 0xFF ) * scale 
										); 	 
										
										var difference = vec3.create();
										var direction = vec3.create(); 
										var distance;
										var position = vec3.create();
										var velocity = vec3.create();
										var startPosition = vec3.create();
										var targetPosition = vec3.create();
										
										
										if ( this.nodes[ this.selectedNodeId ].position == edge.source.position ) {
											
												vec3.set( startPosition, edge.source.position[0], edge.source.position[1], edge.source.position[2] );
												vec3.set( targetPosition, edge.dest.position[0], edge.dest.position[1], edge.dest.position[2] );										
										
										} else {
											
												vec3.set( startPosition, edge.dest.position[0], edge.dest.position[1], edge.dest.position[2] );
												vec3.set( targetPosition, edge.source.position[0], edge.source.position[1], edge.source.position[2] );
																				
										}
										
										
										vec3.subtract( targetPosition, startPosition, difference ); 								
										distance = vec3.magnitude( difference );						
										vec3.divide( difference, distance, direction );
										vec3.multiply( direction, 10.0, velocity );
										
										vec3.set( position, this.nodes[ this.selectedNodeId ].position[0], this.nodes[ this.selectedNodeId ].position[1], this.nodes[ this.selectedNodeId ].position[2] );
										
										// Add particles to the node's edges
										/* 
										graph.particleSystem.emitParticle( {
											color : vec4.create( 0.5, 0.5, 1.0, 1.0 ),
											position : position,
											velocity : velocity,
											startPosition : startPosition,
											targetPosition : targetPosition
										});
										*/
										
								} 
								
								
								
								/*
								var html = "";
								
								for ( var attrib in variableNames ) {
									
									html += variableNames[attrib] + ": <br />"; 
									
								}
								*/
								//uiContainer.innerHTML = html;					
								//console.log( fdgraph.selectedNodeId + ' ' + fdgraph.nodes[ fdgraph.selectedNodeId ].name + ' ' + fdgraph.nodes[ fdgraph.selectedNodeId ].size );															
								
						} else {                            // an edge label was clicked by the user ( popup HTML element containing edge information )													
							
								this.selectedEdgeId = this.nodes[ this.selectedNodeId ].edgeIndices[ id - this.numNodes ];
							
								var edge = this.edges[ this.selectedEdgeId ];															
								
								this.edgeClickCallback( edge );															
											
						} 
																											
				} // if ( $3DJS.interactor.buttonReleased )
				
				// Right-click and drag node
				//if ( fdgraph.selectedNodeId >= 0 ) {
				if ( this.selectedNodeId >= 0 && this.selectedEdgeId == -1 ) {
					
						//interactor.mouseMoving = false;
													
						// Find the depth of the node being dragged (NOTE: to optimize only calculate this value the first frame its dragged)
						var windowPos = vec3.create( );
						project( this.nodes[ graph.selectedNodeId ].position, windowPos );
						
						// Create a window position based on the x and y coordinates of the mouse and the depth of the node
						vec3.set( windowPos, x, y, windowPos[2] ); 
		
						// Calculate and set a new object position for the node								
						unProject( windowPos, this.nodes[ graph.selectedNodeId ].position );
						
						// Edge positions attached to the selected node must also be updated here
		
						//fdgraph.simulate = true;
																	                                                											                                                		
				}
					
		},
		
		/**
		 * Changes the color of the edges of the selected node  
		 */
		highlightNodeEdges: function ( ) {
				
				var node = this.nodes[ this.selectedNodeId ];
				var edge, index;
				var color = vec4.create();
			
				for ( var i=0; i < node.edgeIndices.length; ++i ) {
					
					index = node.edgeIndices[i];
					edge = this.edges[ index ];
					
					vec4.set( color, 0.0, 1.0 * edge.weight, 0.0, 1.0 );
					this.edgeObj.updateColor( 8*index, color );
					this.edgeObj.updateColor( 8*index + 4, color );	
	    			
	    			/*
	    			this.edgeObj.color[ 8*node.edgeIndices[i] ]     = 0.0 * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 1 ] = 1.0 * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 2 ] = 0.0 * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 3 ] = 1.0;
	    			
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 4 ] = 0.0 * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 5 ] = 1.0 * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 6 ] = 0.0 * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 7 ] = 1.0;
	    			*/
    			
    			}
    			
    			for ( var i=0; i < this.edgeObj.numRequiredBuffers; i++ ) {
		    	
		    			gl.bindBuffer( gl.ARRAY_BUFFER, this.edgeObj.vertexAttribArrayBuffers[i]['color'].id );
						gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.edgeObj.color[i] ), gl.DYNAMIC_DRAW );
						//gl.bindBuffer( gl.ARRAY_BUFFER, null );
						
				}    		
			
		},
		
		/**
		 * Changes the color of the edges of the currently selected node back to normal  
		 */
		unHighlightNodeEdges: function ( ) {
				
				// If there is currently no node selected, simply return
				
				if ( this.selectedNodeId == -1 ) return;
				
				// Empty previous arrays
				//this.edgeLabelPositions.length = 0;
				//this.edgeLabelColorIds.length = 0;
				this.edgeLabelPositions = [];
				this.edgeLabelColorIds = [];
				
				var node = this.nodes[ this.selectedNodeId ];
				var edge, index;
				//var sourceColor = vec4.create();
			
				for ( var i=0; i < node.edgeIndices.length; ++i ) {
					
					index = node.edgeIndices[i];
					edge = this.edges[ node.edgeIndices[i] ];		
					
					//vec4.set( color, 0.5, 0.5, 1.0, 1.0 );
					this.edgeObj.updateColor( 8*index, edge.sourceColor );
					this.edgeObj.updateColor( 8*index + 4, edge.destColor  );		
	    			
	    			/*
	    			this.edgeObj.color[ 8*node.edgeIndices[i] ]     = edge.sourceColor[0] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 1 ] = edge.sourceColor[1] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 2 ] = edge.sourceColor[2] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 3 ] = edge.sourceColor[3];
	    			
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 4 ] = edge.destColor[0] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 5 ] = edge.destColor[1] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 6 ] = edge.destColor[2] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 7 ] = edge.destColor[3];
    				*/
    			}
    			
    			for ( var i=0; i < this.edgeObj.numRequiredBuffers; i++ ) {
		    	
		    			gl.bindBuffer( gl.ARRAY_BUFFER, this.edgeObj.vertexAttribArrayBuffers[i]['color'].id );
						gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.edgeObj.color[i] ), gl.DYNAMIC_DRAW );
						//gl.bindBuffer( gl.ARRAY_BUFFER, null );
						
				}    
				
		},
		
		/**
		 * Get the average position of each of the selected node's edges.
		 *   This is to place labels on the edges
		 */
		
		calcSelectedNodeAvgEdgePositions: function ( ) {
			
				var i = this.nodes[ graph.selectedNodeId ].edgeIndices.length;
		
				while ( i-- ) {
					
						var edge = this.edges[ this.nodes[ this.selectedNodeId ].edgeIndices[i] ];
																	
						var avg_position = vec3.create();
						
						vec3.add( edge.source.position, edge.dest.position, avg_position );
						vec3.multiply( avg_position, 0.5, avg_position );
						
						this.edgeLabelPositions[i] = avg_position;
						
						this.edgeLabelColorIds[i] = vec4.create();
						var scale = 1.0 / 255.0;
						vec4.set( this.edgeLabelColorIds[i], 
								  ( ( this.numNodes + i >> 24 ) & 0xFF ) * scale, 
								  ( ( this.numNodes + i >> 16 ) & 0xFF ) * scale, 
								  ( ( this.numNodes + i >> 8  ) & 0xFF ) * scale, 
								  ( ( this.numNodes + i )       & 0xFF ) * scale 
						); 	 
						
						/*
						var difference = vec3.create();
						var direction = vec3.create(); 
						var distance;
						var position = vec3.create();
						var velocity = vec3.create();
						var startPosition = vec3.create();
						var targetPosition = vec3.create();
						
						
						if ( this.nodes[ this.selectedNodeId ].position == edge.source.position ) {
							
								vec3.set( startPosition, edge.source.position[0], edge.source.position[1], edge.source.position[2] );
								vec3.set( targetPosition, edge.dest.position[0], edge.dest.position[1], edge.dest.position[2] );										
						
						} else {
							
								vec3.set( startPosition, edge.dest.position[0], edge.dest.position[1], edge.dest.position[2] );
								vec3.set( targetPosition, edge.source.position[0], edge.source.position[1], edge.source.position[2] );
																
						}
						
						
						vec3.subtract( targetPosition, startPosition, difference ); 								
						distance = vec3.magnitude( difference );						
						vec3.divide( difference, distance, direction );
						vec3.multiply( direction, 10.0, velocity );
						
						vec3.set( position, this.nodes[ graph.selectedNodeId ].position[0], this.nodes[ graph.selectedNodeId ].position[1], this.nodes[ graph.selectedNodeId ].position[2] );	
						
						// Add particles to the node's edges
						 
						graph.particleSystem.emitParticle( {
							color : vec4.create( 0.5, 0.5, 1.0, 1.0 ),
							position : position,
							velocity : velocity,
							startPosition : startPosition,
							targetPosition : targetPosition
						});
						*/				
						
				}
			
		},
		
		/**
		 * Creates an edge proximity graph for the multilevel agglomerative edge bundling algorithm
		 */
		createEdgeProximityGraph: function ( ) {
			
			
		}
		
}

/**
 * Force directed layout for graph drawing 
 * 
 * @class
 * @param {Object} config Configuration properties of the layout
 * @param {Number} config.edgeStiffness
 * @param {Number} config.edgeLength
 * @param {Number} config.charge 
 * @param {Number} conig.damping
 * @param {Number} config.theta
 * @param {Number} config.stableEnergyThreshold
 */

$3DJS.ForceDirectedLayout = function ( config ) {
	
		this.totalKineticEnergy = 9999999999;     // Total amount of energy in the system
		
		this.octree = new Octree({
			center: vec3.create( 0, 0, 0 ), 
			bounds: 30000, 
			threshold: 0.5, 
			maxDepth: 5 
		});
		
		this.pause = false;
				
		config = config || {};
		
		//this.settings = {
			
				/**
				 * Spring constant k for Hooke's Law (F = -kx).
				 */
				this.edgeStiffness = config.edgeStiffness ? config.edgeStiffness : 0.008,
				
				/**
				 * The length of the spring at rest used to calculate its displacement x, in Hooke's law, from
				 * its equilibrium position.
				 */
				this.edgeLength = config.edgeLength ? config.edgeLength : 30,
				
				/**
				 * $3DJS.Node charge for Coulomb's Law. This value should be negative since it is used 
				 * to make nodes repel each other, otherwise positive values will make them attract.
				 */
				this.charge = config.charge ? config.charge : -1200,
								 
				/**
				 * Damping, also sometimes refered to as friction or drag, is value between [0, 1] used to slow down
				 * node velcoity by a percentage 
				 */
				this.damping = config.damping ? config.damping : 0.9,
				
				/**
				 * Theta is an approximation criterion for the perform Barnes-Hut algorithm. Theta is the value  
				 * in which we compare the ratio s/d to determine whether or not a cluster of bodies in a system 
				 * is sufficiently far away from the currently evaluated body.  
				 */
				this.theta = config.theta ? config.theta : 1.2,							
				 						
				/**
				 * Threshold at which we can consider the system to be stabilized.
				 */ 	
				this.stableEnergyThreshold = config.stableEnergyThreshold ? config.stableEnergyThreshold : 1.0					
				 						
		//};
		
		this.bounds = {
			minX : -1000000,
			maxX :  1000000,
			minY : -1000000,
			maxY :  1000000,
			minZ : -1000000,
			maxZ :  1000000
		};
				
		this.center = vec3.create( 0.0, 0.0, 0.0 );
		
		// Same goal as the function above but used to test for various layout optimizations
		this.update = function ( graph ) {
		
				var nodes = graph.nodes;
				var edges = graph.edges;
		
				// If the animation is not paused
		
				if ( this.pause == false ) {
					
						// Initialize variables					
						var magnitude, distance, displacement;
						var source, dest;
						var difference = vec3.create( );
						var direction = vec3.create( );
						var force = vec3.create( );
						var acceleration = vec3.create( );
						var velocity = vec3.create( );
						
						var settings = this.settings;
										
						
						// Sum of the total kinetic energy over all particles (nodes)
						this.totalKineticEnergy = 0.0;
					
						// For each edge ( Attractive forces / Hooke's Law )	
						var i = edges.length;
				   			
						while ( i-- ) { 				// to optimize loop iteration (can't do it this way if id's are not a continuous sequence of integers)						
							
								// Get the nodes linked by the edge
							
								source = edges[i].source;
								dest = edges[i].dest;
							
								// Find the distance between the two nodes and find a direction vector
							
								vec3.subtract( dest.position, source.position, difference );								
								magnitude = vec3.magnitude( difference );
								distance = magnitude;
								//distance  = magnitude + 0.1; 		   				// avoid massive forces at small distances (and divide by zero)
								vec3.divide( difference, magnitude, direction );
								
								// Calculate the displacement from the current length of the spring to the spring's rest length
								
								displacement = magnitude - settings.edgeLength;  
								
								// Calculate the force imposed on the nodes (F = -kx)
								
								vec3.multiply( direction, settings.edgeStiffness * displacement, force ); 
								vec3.add( source.force, force, source.force );  
								
								vec3.multiply( direction, -settings.edgeStiffness * displacement, force ); 	
								vec3.add( dest.force, force, dest.force ); 													
		
						} // end while ( i-- )
									
						// For each node
						i = nodes.length;
						
						this.bounds.minX = 0.0;
						this.bounds.maxX = 0.0;
						this.bounds.minY = 0.0;
						this.bounds.maxY = 0.0;
						this.bounds.minZ = 0.0;
						this.bounds.maxZ = 0.0;	
						
						while ( i-- ) {					// to optimize loop iteration (can't do it this way if id's are not a continuous sequence of integers)						
								
								source = nodes[ i ];											 				
								
								// For every other node ( Repulsive forces / Coulomb's Law )						
								for ( var j = i - 1; j >= 0; --j ) {								
									
										if ( j == i ) continue;
									
										dest = nodes[ j ];																				
																							
										vec3.subtract( dest.position, source.position, difference );								
										magnitude = vec3.magnitude( difference );
										distance = magnitude;
										//distance  = magnitude + 0.1; 		   				// avoid massive forces at small distances (and divide by zero)
										vec3.divide( difference, magnitude, direction );									
									
										// Apply repulsion force to each node								
										vec3.multiply( direction, settings.charge, force );
										vec3.divide( force, distance * distance, force );
										vec3.add( source.force, force, source.force );
										
										vec3.multiply( direction, -settings.charge, force );
										vec3.divide( force, distance * distance, force );
										vec3.add( dest.force, force, dest.force );
																																																																		
								} 				
								
								// Apply force to get acceleration					
								vec3.divide( source.force, source.mass, source.acceleration );				
								vec3.zero( source.force );
																						
								// Apply acceleration to velocity						
								//vec3.multiply( source.acceleration, 0.1, source.acceleration );   					    
		   					    vec3.add( source.velocity, source.acceleration, source.velocity );
		   					    vec3.multiply( source.velocity, 0.9, source.velocity );											
								
								// Update node position based on velocity				
								vec3.add( source.position, source.velocity, source.position );
								
								// Update total kinetic energy 
								speed = vec3.magnitude( source.velocity );				
								this.totalKineticEnergy += source.mass * speed * speed;
								
								// update bounds (this is to assist the tree construction)						
								if ( source.position[0] < this.bounds.minX ) this.bounds.minX = source.position[0];
								if ( source.position[0] > this.bounds.maxX ) this.bounds.maxX = source.position[0];
								if ( source.position[1] < this.bounds.minY ) this.bounds.minY = source.position[1];
								if ( source.position[1] > this.bounds.maxY ) this.bounds.maxY = source.position[1];
								if ( source.position[2] < this.bounds.minZ ) this.bounds.minZ = source.position[2];
								if ( source.position[2] > this.bounds.maxZ ) this.bounds.maxZ = source.position[2];
								
								// Update graph properties unrelated to the force-directed layout
								// This is to avoid multiple iterations over all nodes
								graph.nodeObj.setWorldPosition( i, nodes[i].position );
								
								if ( graph.settings.renderNodeLabels ) {
										
										// Update the positions of the labels, if labels are to be drawn
										var zNear = 1.0;
										var zFar  = 100000.0;
										var windowPos = vec3.create( );
										
										
										project( nodes[i].position, windowPos );
										
										var z_n = 2.0 * windowPos[2] - 1.0;
										var z_e = 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
										
								        if ( z_e > 0.0 )
								       		graph.labelCanvas.context.fillText( nodes[i].id, windowPos[0], gl.canvas.height - windowPos[1] );  		
								       		
						       	}		
							
						} // end while ( i-- )
						
						
						// stop simulation when energy of the system goes below a threshold		
						//if ( this.totalKineticEnergy < 1.0 ) {
					
						//		this.simulate = false;
				
						//}
				
				}	
			
		}
		
		// To calculate the force acting on a body
		// 1. If the current node is an external node (and it is not body b), calculate the force exerted by the current node on b, and add this amount to b’s net force.
		// 2. Otherwise, calculate the ratio s/d. If s/d < θ, treat this internal node as a single body, and calculate the force it exerts on body b, and add this amount to b’s net force.
		// 3. Otherwise, run the procedure recursively on each of the current node’s children.
		
		this.calculateRepulsiveForces = function ( sourceBody, root ) { 
		
				var queue = [ root ];
				var dx, dy, dz;
				var r;	
				var v;	
		
				while ( queue.length ) {
						
						var octant = queue.shift();
						var body = octant.body;
						
						if ( !octant.isInternal ) {
							
								if ( body && body != sourceBody ) {
									
										dx = body.position[0] - sourceBody.position[0]; 
										dy = body.position[1] - sourceBody.position[1]; 
										dz = body.position[2] - sourceBody.position[2];							
								
										r = Math.sqrt( dx * dx + dy * dy + dz * dz );
										
										// check for r == 0
									
										v = this.charge * body.mass * sourceBody.mass / ( r * r * r );
										
										sourceBody.force[0] = sourceBody.force[0] + v * dx;
										sourceBody.force[1] = sourceBody.force[1] + v * dy;
										sourceBody.force[2] = sourceBody.force[2] + v * dz;
		
								} 
							
						} else {
								
								dx = octant.centerOfMass[0] / octant.mass - sourceBody.position[0]; 
								dy = octant.centerOfMass[1] / octant.mass - sourceBody.position[1]; 
								dz = octant.centerOfMass[2] / octant.mass - sourceBody.position[2];							
						
								r = Math.sqrt( dx * dx + dy * dy + dz * dz );	
								
								if ( ( octant.radius * 2.0 / r ) <= this.theta ) {
										
										v = this.charge * octant.mass * sourceBody.mass / ( r * r * r );
										
										sourceBody.force[0] = sourceBody.force[0] + v * dx;
										sourceBody.force[1] = sourceBody.force[1] + v * dy;
										sourceBody.force[2] = sourceBody.force[2] + v * dz;
										
								} else {
						
										if ( octant.octants[0] != null ) { queue.unshift( octant.octants[0] ); }
				                        if ( octant.octants[1] != null ) { queue.unshift( octant.octants[1] ); }
				                        if ( octant.octants[2] != null ) { queue.unshift( octant.octants[2] ); }
				                        if ( octant.octants[3] != null ) { queue.unshift( octant.octants[3] ); }
				                        if ( octant.octants[4] != null ) { queue.unshift( octant.octants[4] ); }
				                        if ( octant.octants[5] != null ) { queue.unshift( octant.octants[5] ); }
				                        if ( octant.octants[6] != null ) { queue.unshift( octant.octants[6] ); }
				                        if ( octant.octants[7] != null ) { queue.unshift( octant.octants[7] ); }
				                       							
								}
							
						}
						
				} // end while
			
		}
		
		/**
		 * Use the Barnes-Hut algorithm to approximate repulsive forces for the graph nodes (reduces time complexity from O(N^2) to O(N log N))
		 */
		this.barnesHutForce = function ( graph ) {
			
				var nodes = graph.nodes;
				var edges = graph.edges;
			
				// build octree
				//octree.constructBarnesHutTree( this.nodes );	
				
				// Initialize variables					
				var magnitude, distance, oneoverdistance, displacement;
				var source, dest;
				var difference = vec3.create( );
				var direction = vec3.create( );
				var force = vec3.create( );
				var acceleration = vec3.create( );
				var velocity = vec3.create( );
				
				var x = this.edgeLength;
				var k = this.edgeStiffness;		
				var k_times_displacement;		
				
				var dx, dy, dz;													
				
				// Sum of the total kinetic energy over all particles (nodes)
				this.totalKineticEnergy = 0.0;
			
				// For each edge ( Attractive forces / Hooke's Law )	
				var i = edges.length;
								
				while ( i-- ) { 				// to optimize loop iteration (can't do it this way if id's are not a continuous sequence of integers)						
					
						// Get the nodes linked by the edge
					
						source = edges[i].source;
						dest = edges[i].dest;
					
						// Find the distance between the two nodes and find a direction vector
					
						dx = dest.position[0] - source.position[0]; 
						dy = dest.position[1] - source.position[1]; 
						dz = dest.position[2] - source.position[2];							
				
						distance = Math.sqrt( dx * dx + dy * dy + dz * dz );
									
						oneoverdistance = 1.0 / distance;   // this is to reduce 3 divides into 1 divide and 3 multiplies 
						
						direction[0] = dx * oneoverdistance;
						direction[1] = dy * oneoverdistance;
						direction[2] = dz * oneoverdistance;											
						
						displacement = distance - x;
						
						k_times_displacement = k * displacement;
						
						source.force[0] += direction[0] * k_times_displacement;
						source.force[1] += direction[1] * k_times_displacement;
						source.force[2] += direction[2] * k_times_displacement;
						
						dest.force[0] += -direction[0] * k_times_displacement;
						dest.force[1] += -direction[1] * k_times_displacement;
						dest.force[2] += -direction[2] * k_times_displacement;
						
						// Update graph properties unrelated to the force-directed layout
						// This is to avoid multiple iterations over all nodes
						//graph.edgeLabelObj.setWorldPosition( i, nodes[i].position );
		
				} // end while ( i-- )
							
				// For each node		
				i = nodes.length;
				
				var totalForces = 0;
				
				this.bounds.minX = 0.0;
				this.bounds.maxX = 0.0;
				this.bounds.minY = 0.0;
				this.bounds.maxY = 0.0;
				this.bounds.minZ = 0.0;
				this.bounds.maxZ = 0.0;		
				
				vec3.zero( this.center );		
				
				while ( i-- ) {
									
						source = nodes[i];
																
						// get supernode
						nodes[i].totalforces = 0;					
										
						this.calculateRepulsiveForces( source, this.octree.root );
						
						totalForces += nodes[i].totalforces;
						
						// Apply force to get acceleration	
						var oneovermass = 1.0 / source.mass;
						
						source.acceleration[0] = source.force[0] * oneovermass;
						source.acceleration[1] = source.force[1] * oneovermass;
						source.acceleration[2] = source.force[2] * oneovermass; 
						
						// Calculated force value is no longer needed, zero it out for the next iteration								
						vec3.zero( source.force );
																				
						// Apply acceleration to velocity and apply damping to the velocity							
						source.velocity[0] = ( source.velocity[0] + source.acceleration[0] ) * this.damping;
						source.velocity[1] = ( source.velocity[1] + source.acceleration[1] ) * this.damping;
						source.velocity[2] = ( source.velocity[2] + source.acceleration[2] ) * this.damping;
						
						// Update node position based on velocity					
						source.position[0] += source.velocity[0];
						source.position[1] += source.velocity[1];
						source.position[2] += source.velocity[2];																																	
						
						// update bounds (this is to assist the tree construction)						
						if ( source.position[0] < this.bounds.minX ) this.bounds.minX = source.position[0];
						if ( source.position[0] > this.bounds.maxX ) this.bounds.maxX = source.position[0];
						if ( source.position[1] < this.bounds.minY ) this.bounds.minY = source.position[1];
						if ( source.position[1] > this.bounds.maxY ) this.bounds.maxY = source.position[1];
						if ( source.position[2] < this.bounds.minZ ) this.bounds.minZ = source.position[2];
						if ( source.position[2] > this.bounds.maxZ ) this.bounds.maxZ = source.position[2];	
						
						//vec3.add( this.center, source.position, this.center );
										
						// Update total kinetic energy 
						speed = vec3.magnitude( source.velocity );				
						this.totalKineticEnergy += source.mass * speed * speed;
						
						// Update graph properties unrelated to the force-directed layout
						// This is to avoid multiple iterations over all nodes						
						if ( graph.nodeObj instanceof $3DJS.QuadArray ) {
							
								graph.nodeObj.setWorldPosition( i, nodes[i].position );
								
						}
						
						if ( graph.settings.renderNodeLabels ) {
								
								// Update the positions of the labels, if labels are to be drawn
								var zNear = 1.0;
								var zFar  = 100000.0;
								var windowPos = vec3.create( );
																
								project( nodes[i].position, windowPos );
								
								var z_n = 2.0 * windowPos[2] - 1.0;
								var z_e = 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
								
						        if ( z_e > 0.0 ) {
						       							       	
						       			graph.labelCanvas.context.fillText( nodes[i].id, windowPos[0], gl.canvas.height - windowPos[1] );
						       							    
						       	}  		
						       		
				       	}											
						
				}			
				
				//vec3.set( this.center, 
				//		( this.bounds.maxX + this.bounds.minX ) * 0.5,  
				//		( this.bounds.maxY + this.bounds.minY ) * 0.5,
				//		( this.bounds.maxZ + this.bounds.minZ ) * 0.5 );
				
				
				//vec3.divide( this.center, nodes.length, this.center );
				
				//console.log( this.bounds.minX + ' ' + this.bounds.maxX + ' ' + this.bounds.minY + ' ' + this.bounds.maxY + ' ' + this.bounds.minZ + ' ' + this.bounds.maxZ );
				//console.log( totalForces / nodes.length );
			
		}
	
}; 

// Used for collapsing child nodes
/*
ForceDirectedGraph.prototype.attractChildrenToParent = function ( parent_node, timestep ) {
	
		var child_node;
		var difference = vec3.create( );
		var direction = vec3.create( );
		var force = vec3.create( );
		var acceleration = vec3.create( );
		var velocity = vec3.create( );
		
		parent_node.localEnergy = 0.0;
		
		// For each child of the parent node
		for ( var i = parent_node.numChildren - 1; i >= 0; --i ) {
				
				child_node = parent_node.children[i]; 
				
				vec3.subtract( parent_node.position, child_node.position, difference );								
				magnitude = vec3.magnitude( difference );
				distance  = magnitude + 0.1; 		   				// avoid massive forces at small distances (and divide by zero)
				vec3.divide( difference, magnitude, direction );	
						
				displacement = 1 - magnitude;  // 40 -> edge rest length				
				
				vec3.multiply( direction, -3.0 * displacement, force ); // 1.0 spring constant
				vec3.add( child_node.force, force, child_node.force );  
				
				// Apply forces					
				vec3.divide( child_node.force, child_node.mass, child_node.acceleration );				
				vec3.zero( child_node.force );
																		
				// Apply acceleration to velocity						
				vec3.multiply( child_node.acceleration, timestep, child_node.acceleration );   					    
			    vec3.add( child_node.velocity, child_node.acceleration, child_node.velocity );
			    vec3.multiply( child_node.velocity, this.damping, child_node.velocity );											
				
				// Update node position based on velocity
				vec3.add( child_node.position, child_node.velocity, child_node.position );
				
				// Update total kinetic energy 		
				speed = vec3.magnitude( child_node.velocity );
				parent_node.localEnergy += child_node.mass * speed * speed; 				
				//this.totalKineticEnergy += source.mass * speed * speed;		
				
				if ( displacement < Math.abs(0.1) )
						parent_node.collapsed = true;
				else
						parent_node.collapsed = false;						
				
				this.attractChildrenToParent( child_node, timestep );
																																																																						
		}
		

		
}
*/


/** 
 * A subdivision of three dimensional space. Occupies an octant of a defined space.
 * 
 * @param center A 3D vector describing the center of the octant.
 * @param radius The radius of the octant.
 * @param parent The parent node to the octant.
 * @param depth The depth of the octant with respect to the octree
 */
// Octants
// Index 0 - bottom-back-left
// 		 1 - bottom-back-right
// 		 2 - top-back-left
// 		 3 - top-back-right
// 		 4 - bottom-front-left
// 		 5 - bottom-front-right
// 		 6 - top-front-left
// 		 7 - top-front-right
function OctreeNode ( center, radius, parent, depth ) {
		
		// General octree node properties
		this.center = center;
		this.radius = radius;		
		this.parent = parent;
		this.depth  = depth;
				
		this.isInternal = false;
		
		this.octants = [];
		//this.numChildren = 0;  // temporary?
		
		this.body = null;

		//this.containedPoints = [];
		//this.numContainedPoints = 0;					
		
		// For Barnes-Hut Algorithm
		this.centerOfMass = vec3.create( 0, 0, 0 );               // Average position of points within this node's bounds
		this.mass = 0;	
	
}

OctreeNode.prototype = {
	
		addChild: function ( octIndex ) {
				
				var newCenter = vec3.create( );
				var offset = vec3.create( );
				
				vec3.multiply( boundOffsetTable[ octIndex ], this.radius, offset );
				vec3.add( this.center, offset, newCenter );
			
				this.octants[ octIndex ] = new OctreeNode(
					newCenter,                 
					this.radius * 0.5,
					this,
					this.depth + 1	
				);
			
		},
	 		 		 		 
 		subdivide: function ( ) { 
 			
 				this.isInternal = true;
 				
 				this.octants[0] = null;
 				this.octants[1] = null;
 				this.octants[2] = null;
 				this.octants[3] = null;
 				this.octants[4] = null;
 				this.octants[5] = null;
 				this.octants[6] = null;
 				this.octants[7] = null;
 			
 				/*
 				var newCenter; 
 				var offset = vec3.create( );
 				var halfRadius = this.radius * 0.5;
 				 				  				 			
 				var i = 8;
 				
	 			while ( i-- ) {  // split the space 8 ways for an octree
	 						 						 				
    					vec3.multiply( boundOffsetTable[i], this.radius, offset );
	 				
	 					newCenter = vec3.create( );
	 					vec3.add( this.center, offset, newCenter );
	 				
	 					this.octants[i] = new OctreeNode( 
	 						newCenter,                 
	 						halfRadius,
	 						this,
	 						this.depth + 1	
	 					);
	 				
	 			}
	 			*/
 			
 		},
 		
 		subdivide2: function () {
 			
 				this.isInternal = true;
 				
 				var newCenter; 
 				var offset = vec3.create( );
 				var halfRadius = this.radius * 0.5;
 				 				  				 			
 				var i = 8;
 				
	 			while ( i-- ) {  // split the space 8 ways for an octree
	 						 						 				
    					vec3.multiply( boundOffsetTable[i], this.radius, offset );
	 				
	 					newCenter = vec3.create( );
	 					vec3.add( this.center, offset, newCenter );
	 				
	 					this.octants[i] = new OctreeNode( 
	 						newCenter,                 
	 						halfRadius,
	 						this,
	 						this.depth + 1	
	 					);
	 				
	 			}
 			
 		}
	
};

var boundOffsetTable = [

		vec3.create( -0.5, -0.5, -0.5 ),
		vec3.create( +0.5, -0.5, -0.5 ),
		vec3.create( -0.5, +0.5, -0.5 ),
		vec3.create( +0.5, +0.5, -0.5 ),
		vec3.create( -0.5, -0.5, +0.5 ),
		vec3.create( +0.5, -0.5, +0.5 ),
		vec3.create( -0.5, +0.5, +0.5 ),
		vec3.create( +0.5, +0.5, +0.5 )  	
					
];

/**
 * Octrees
 * @param {object} config Data describing the configuration of the octree.
 * @param config.center
 * @param config.bounds
 * @param config.threshold
 * @param config.maxDepth
 */

function Octree ( config ) {
	
		config = config || { };
		
		this.settings = {
			center: config.center ? config.center : vec3.create( 0.0, 0.0, 0.0 ),
			bounds: config.bounds ? config.bounds : 100, 
			maxDepth:  config.maxDepth ? config.maxDepth : 10
		}
	
		this.root = null; 
		this.maxDepth = config.maxDepth;
		
		// To render the octree
		this.renderObj = new WireframeCube({
    		width: 2, 
    		height: 2, 
    		depth: 2,
    		color: [ 0.0, 0.0, 0.0, 1.0 ] 
    	});
    	
    	this.renderObj.shaderProgram[0] = loadShader( 'octree', setupOctreeShader );
		
	
}

Octree.prototype = {

  	bounds: vec3.create(),
  	
  	// 1. If node x does not contain a body, put the new body b here.
	// 2. If node x is an internal node, update the center-of-mass and total mass of x. Recursively insert the body b in the appropriate quadrant.
    // 3. If node x is an external node, say containing a body named c, then there are two bodies b and c in the same region. Subdivide the region 
    // 	  further by creating four children. Then, recursively insert both b and c into the appropriate quadrant(s). Since b and c may still end up
    //    in the same quadrant, there may be several subdivisions during a single insertion. Finally, update the center-of-mass and total mass of x.

  	insertBody: function ( body, octant ) {  // THIS FUNCTION IS CURRENTLY BROKEN, FIX
  			
  			if ( octant.depth > this.maxDepth) {
  				
	  				this.maxDepth = octant.depth;
	  				//console.log( this.maxDepth);
	  				
  			}
  			
  			// 1.
  			if (octant.body == null && !octant.isInternal) {
  					
  					octant.body = body;
  					return;
  					
  			}
  			
  			// 2. If node x is an internal node, update the center-of-mass and total mass of x. Recursively insert the body b in the appropriate quadrant.
  			if ( octant.isInternal ) {          // this is an internal node
  				
  					// Update the center of mass and mass of the node  				
  					vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
  					octant.mass += body.mass;
  			
  					//++octant.numContainedPoints;
  					
  					// Recursively insert the body in the appropriate octant
  					var code = 0;
  					
  					if ( body.position[0] > octant.center[0] ) code |= 1;
  					if ( body.position[1] > octant.center[1] ) code |= 2;
  					if ( body.position[2] > octant.center[2] ) code |= 4;
  					
  					//octant.body = null;
  					if ( octant.octants[code] == null ) {
  						
  							octant.addChild( code );
  						
  					}
  					
  					this.insertBody( body, octant.octants[ code ] );
  					
  					return;
  					
  			} 
  			
  			// 3. If node x is an external node, say containing a body named c, then there are two bodies b and c in the same region. Subdivide the region 
		    // 	  further by creating four children. Then, recursively insert both b and c into the appropriate quadrant(s). Since b and c may still end up
		    //    in the same quadrant, there may be several subdivisions during a single insertion. Finally, update the center-of-mass and total mass of x.
  			if ( octant.octants.length == 0 && octant.body != body ) {      // if the node is an external node and contains a body
  					
  					// Subdivide the region (create 8 children) and turn it into an internal node
  					octant.subdivide2( );
  					
  					var oldBody = octant.body;
  					octant.body = null; 
  					
  					vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
  					octant.mass += body.mass;
  					
  					vec3.add( octant.centerOfMass, oldBody.position, octant.centerOfMass );  
  					octant.mass += oldBody.mass;
  					
  					var code = 0;
  					
  					if ( body.position[0] > octant.center[0] ) code |= 1;
  					if ( body.position[1] > octant.center[1] ) code |= 2;
  					if ( body.position[2] > octant.center[2] ) code |= 4;
  					
  					this.insertBody( body, octant.octants[ code ] );
  					
  					code = 0;
  					
  					if ( oldBody.position[0] > octant.center[0] ) code |= 1;
  					if ( oldBody.position[1] > octant.center[1] ) code |= 2;
  					if ( oldBody.position[2] > octant.center[2] ) code |= 4;
  						
  					this.insertBody( oldBody, octant.octants[ code ] );
  					
  					return;
  			} 
  			
  	},
  	
  	// 1. If node x does not contain a body, put the new body b here.
	// 2. If node x is an internal node, update the center-of-mass and total mass of x. Recursively insert the body b in the appropriate quadrant.
    // 3. If node x is an external node, say containing a body named c, then there are two bodies b and c in the same region. Subdivide the region 
    // 	  further by creating four children. Then, recursively insert both b and c into the appropriate quadrant(s). Since b and c may still end up
    //    in the same quadrant, there may be several subdivisions during a single insertion. Finally, update the center-of-mass and total mass of x.
  	
  	insertBodyIterative: function ( newBody ) {
  	  		
  			// declare variables
  			var offset = vec3.create( );
  			var newCenter = vec3.create( );
  		
  			var queue = [{
  				body: newBody,
  				octant: this.root 				
  			}];
  			
  			while ( queue.length ) {
  				
  					var queueItem = queue.shift();
                    var octant = queueItem.octant;
                    var body   = queueItem.body;      
                    
                    // Determines the max depth of the tree each time it is built
                    if ( octant.depth > this.maxDepth) {
		  			
		  					this.maxDepth = octant.depth;		  						  		
		  			
		  			}
		  			
		  			// This was for debugging an infinite (or not infinite) subdivision due to 2 nodes being too close to each other
		  			//if ( octant.depth > 30 ) {
		  			//	
		  			//		debugger;	
		  			//		
		  			//}	
		  					  					  	
                    
                    // 2. If node x is an internal node, update the center-of-mass and total mass of x. Recursively insert the body b in the appropriate quadrant.
                    if ( octant.isInternal ) {
	                    	
	                    	// Update the center of mass and mass of the node (fix)
	                    	//console.log( octant.centerOfMass + ' ' +  body.position);
		  					vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
		  					octant.mass += body.mass;
		  			
		  					//++octant.numContainedPoints;
		  					
		  					// Recursively insert the body in the appropriate quadrant.
	                    	// But first find the appropriate octant.
	                    	var octIndex = 0;
	  					
		  					if ( body.position[0] > octant.center[0] ) octIndex |= 1;
		  					if ( body.position[1] > octant.center[1] ) octIndex |= 2;
		  					if ( body.position[2] > octant.center[2] ) octIndex |= 4;
		  					
		  					
		  					if ( octant.octants[ octIndex ] == null) {
		  							
		  							octant.addChild( octIndex );
		  						
		  					}
		  					
		  					// proceed search in this octant		  							  				  							  				  							  							  							  					  			  					
		  					queue.unshift({
		                    	body: body,
		                        octant: octant.octants[ octIndex ]	                     
		                    });		  				
		  							                   	                    
                    } 
                    // 3. If node x is an external node, say containing a body named c, then there are two bodies b and c in the same region. Subdivide the region 
				    // 	  further by creating four children. Then, recursively insert both b and c into the appropriate quadrant(s). Since b and c may still end up
				    //    in the same quadrant, there may be several subdivisions during a single insertion. Finally, update the center-of-mass and total mass of x.
                    else if ( octant.body ) {
                    	
                    		// Subdivide the region (create 8 children)
  							octant.subdivide( );   // flags node as an internal node
                    	
							var oldBody = octant.body;
                    		octant.body = null; // internal nodes do not carry bodies                     
     
                    		// code should be added here to prevent infinite subdivision
                    		
                    		//vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
		  					//octant.mass += body.mass;
		  					
		  					//vec3.add( octant.centerOfMass, oldBody.position, octant.centerOfMass );  
		  					//octant.mass += oldBody.mass;
		  					
		  					//var code = 0;
		  					
		  					//if ( body.position[0] > octant.center[0] ) code |= 1;
		  					//if ( body.position[1] > octant.center[1] ) code |= 2;
		  					//if ( body.position[2] > octant.center[2] ) code |= 4;
		  					
		  					queue.unshift({		                        
		                        body: body,
		                        octant: octant
		                    });
		  					
		  					//code = 0;
		  					
		  					//if ( oldBody.position[0] > octant.center[0] ) code |= 1;
		  					//if ( oldBody.position[1] > octant.center[1] ) code |= 2;
		  					//if ( oldBody.position[2] > octant.center[2] ) code |= 4;
		  						
		                    queue.unshift({
		                        body: oldBody,
		                        octant: octant	                        
		                    });		                    		                    		                
						                    	
                    } 
                    // 1. If node x does not contain a body, put the new body b here.
                    else {
                    	
                    		// $3DJS.Node has no body. Put it in here.
                    		octant.body = body
                    	
                    }
  				
  			}
  		
  	},
  	
  	// construct the octree
  	constructBarnesHutTree: function ( bodies, center, bounds ) { 
  		
  			this.maxDepth = 0;  		  			  			  
  			
  			var maxrad = Math.abs( bounds.maxX );
  			if ( Math.abs(bounds.minX) > maxrad ) maxrad = Math.abs(bounds.minX); 
  			if ( Math.abs(bounds.maxY) > maxrad ) maxrad = Math.abs(bounds.maxY); 
  			if ( Math.abs(bounds.minY) > maxrad ) maxrad = Math.abs(bounds.minY); 
  			if ( Math.abs(bounds.maxZ) > maxrad ) maxrad = Math.abs(bounds.maxZ); 
  			if ( Math.abs(bounds.minZ) > maxrad ) maxrad = Math.abs(bounds.minZ); 
  			
  			this.root = new OctreeNode( this.settings.center, maxrad, null, 0 );
  			//this.root.radius = maxrad * 0.5; 
  		
  			var i = bodies.length;
  			
  			while ( i-- ) {
  				
  					//this.insertBody( bodies[i], this.root );  				
  					this.insertBodyIterative( bodies[i] );  					
  				
  			}	
  	
  		
  	},    	
  
	calcBounds: function ( ) {
		
	},
	
	// Helper function for render
	recursiveDraw: function ( octreeNode ) {  
			
			//if ( octreeNode.containedPoints.length == 0 ) return;
			if ( !octreeNode ) return;		
			
			gl.uniform3fv( program.translateUniform, octreeNode.center );     
		  	gl.uniform1f( program.scaleUniform, octreeNode.radius );    	 
		   	gl.drawElements( gl.LINES, this.renderObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );
		  	   	
		  	var i=8;
		  	
		   	while ( i-- ) {
		   		this.recursiveDraw( octreeNode.octants[i] );
		   	}
			
	}, 
	
	iterativeDraw: function ( ) {
		
			var queue = [{ 
				octant: this.root
			}];
		
			while ( queue.length ) {
				
					var queueItem = queue.shift();
					var octant = queueItem.octant;
			
					gl.uniform3fv( program.translateUniform, octant.center );     
		  			gl.uniform1f( program.scaleUniform, octant.radius );    	 
		   			gl.drawElements( gl.LINES, g_octreeObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );		   					   		
		   			
		   			if ( octant.isInternal ) {
				   			
				   			var i=8;
				  	
						   	while ( i-- ) {
						   		
						   			//if ( octant.octants[i].isInternal || octant.octants[i].containedBody ) {
						   				
							   				queue.unshift({
							   					octant: octant.octants[i]
							   				});
						   		
						   			//}
						   			
						   	}
						   	
					}
			
			}
		
	},
	
	// Render the octree
	render: function ( ) {
		
			program = this.renderObj.shaderProgram[0];   		   		
	       	gl.useProgram( program );
				 								   	
		   	vertexAttribArrayBuffers = this.renderObj.vertexAttribArrayBuffers;
		   	attributes = this.renderObj.shaderProgram[0].attributes;   
		   	
		   	// Enable vertex buffer objects   					   			
		   	gl.bindBuffer( vertexAttribArrayBuffers[ 'position' ].target, vertexAttribArrayBuffers[ 'position' ].id );	 
		   	gl.enableVertexAttribArray( attributes[ 'position' ] );  			
		   	gl.vertexAttribPointer( attributes[ 'position' ], vertexAttribArrayBuffers[ 'position' ].size, gl.FLOAT, false, 0, 0);
		   	
		   	gl.bindBuffer( vertexAttribArrayBuffers[ 'color' ].target, vertexAttribArrayBuffers[ 'color' ].id );	 
		   	gl.enableVertexAttribArray( attributes[ 'color' ] );  			
		   	gl.vertexAttribPointer( attributes[ 'color' ], vertexAttribArrayBuffers[ 'color' ].size, gl.FLOAT, false, 0, 0);
	  
		   	
		   	// Bind uniforms 
			gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
		  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
		  	
		 	gl.bindBuffer( this.renderObj.elementArrayBuffer.target, this.renderObj.elementArrayBuffer.id );
		  	
		  	this.recursiveDraw( this.root );
		  	//this.iterativeDraw( );	  		   		
	
	       	// Disable vertex buffer objects       	
			gl.disableVertexAttribArray( attributes[ 'position' ] );
			gl.disableVertexAttribArray( attributes[ 'color' ] ); 
		
	}
	

};


/**
 * kd-tree
 */

function pad ( string, length ) {
	
		while ( string.length < length ) {
			
				string = "0" + string;
			
		} 
			
		return string;
		
}

function KDTreeNode ( center, radius, parent, depth ) {
		
		// General node properties
		this.center = center;
		this.radius = radius;		
		this.parent = parent;
		this.depth  = depth;
				
		this.isInternal = false;
		
		this.children = [];
		//this.numChildren = 0;  // temporary?
		
		this.body = null;

}

KDTreeNode.prototype = {
	
		addChild: function ( nodeIndex ) {
				
				var newCenter = vec3.create( );
				var offset = vec3.create( );
				
				vec3.multiply( boundOffsetTable[ nodeIndex ], this.radius, offset );
				vec3.add( this.center, offset, newCenter );
			
				this.octants[ nodeIndex ] = new OctreeNode(
					newCenter,                 
					this.radius * 0.5,
					this,
					this.depth + 1	
				);
			
		},
	 		 		 		 
 		subdivide: function ( ) { 
 			
 				this.isInternal = true;
 				
 				this.octants[0] = null;
 				this.octants[1] = null;
 				this.octants[2] = null;
 				this.octants[3] = null;
 				this.octants[4] = null;
 				this.octants[5] = null;
 				this.octants[6] = null;
 				this.octants[7] = null;
 			
 		}
	
};


function KDTree ( config ) {
		
		config = config || {
			k: 2
		}
		
		/**
		 * Number of dimensions for the kd-tree
		 */
		this.k = config.k; 
		
		/** 
		 * The root of the tree
		 */
		this.root = null;
		
		/**
		 * @private
		 */
		this.offsetTable = [ ];
		
		this.center =  config.center ? config.center : [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];	
		//this.settings = {
		//	center: config.center ? config.center : vec3.create( 0.0, 0.0, 0.0 ),
		//	bounds: config.bounds ? config.bounds : 100, 
		//	maxDepth:  config.maxDepth ? config.maxDepth : 10
		//}
	
		 
		//this.maxDepth = config.maxDepth;
	
		this.initialize( );
	
}

KDTree.prototype = {
	
		initialize: function ( ) {
			
				// create offset table based on k
				var k = this.k;
				var l = Math.pow( 2, k );
				
				for ( var i=0; i < l; ++i ) {
					
						var str = i.toString(2);
						str = pad( str, k );
						
						//console.log(str);
						
						this.offsetTable[i] = new Float32Array( k );
						
						for ( var j=0; j < k; ++j ) {
							
								var val = str.charAt(j);
								var num = -0.5;
								
								if ( val == "1" ) num = 0.5 
															
								this.offsetTable[i][j] = num;
							
						}							
						
						//console.log( this.offsetTable[i] );
					
				}
			
			
			
		},
		
		insertBody: function ( newBody ) {
  	  		
  			// declare variables
  			var offset = vec3.create( );
  			var newCenter = vec3.create( );
  		
  			var queue = [{
  				body: newBody,
  				node: this.root 				
  			}];
  			
  			while ( queue.length ) {
  				
  					var queueItem = queue.shift();
                    var node = queueItem.node;
                    var body = queueItem.body;      
                    
                    // Determines the max depth of the tree each time it is built
                    if ( node.depth > this.maxDepth) {
		  			
		  					this.maxDepth = octant.depth;		  						  		
		  			
		  			}
		  			
		  			// This was for debugging an infinite (or not infinite) subdivision due to 2 nodes being too close to each other
		  			//if ( octant.depth > 30 ) {
		  			//	
		  			//		debugger;	
		  			//		
		  			//}	
		  					  					  	
                    
                    // 2. If node x is an internal node, update the center-of-mass and total mass of x. Recursively insert the body b in the appropriate quadrant.
                    if ( node.isInternal ) {
	                    	
	                    	// Update the center of mass and mass of the node (fix)
	                    	//console.log( octant.centerOfMass + ' ' +  body.position);
		  					//vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
		  					//octant.mass += body.mass;
		  			
		  					//++octant.numContainedPoints;
		  					
		  					// Recursively insert the body in the appropriate location.	                    	
	                    	var nodeIndex = 0;
	  					
	  						for ( var i=0; i < this.k; i++ ) {
		  						
			  						//if ( body.position[0] > octant.center[0] ) octIndex |= 1;
			  						//if ( body.position[1] > octant.center[1] ) octIndex |= 2;
			  						//if ( body.position[2] > octant.center[2] ) octIndex |= 4;
			  				
			  						if ( body.position[i] > node.center[i] ) nodeIndex |= Math.pow( 2, i );
			  				
			  				}
		  					
		  					
		  					if ( node.children[ nodeIndex ] == null) {
		  							
		  							node.addChild( nodeIndex );
		  						
		  					}
		  					
		  					// proceed search in this octant		  							  				  							  				  							  							  							  					  			  					
		  					queue.unshift({
		                    	body: body,
		                        node: node.children[ nodeIndex ]	                     
		                    });		  				
		  							                   	                    
                    } 
                    // 3. If node x is an external node, say containing a body named c, then there are two bodies b and c in the same region. Subdivide the region 
				    // 	  further by creating four children. Then, recursively insert both b and c into the appropriate quadrant(s). Since b and c may still end up
				    //    in the same quadrant, there may be several subdivisions during a single insertion. Finally, update the center-of-mass and total mass of x.
                    else if ( node.body ) {
                    	
                    		// Subdivide the region (create k children)
  							node.subdivide( );   // flags node as an internal node
                    	
							var oldBody = octant.body;
                    		octant.body = null; // internal nodes do not carry bodies                     
     
                    		// code should be added here to prevent infinite subdivision
                    		
                    		//vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
		  					//octant.mass += body.mass;
		  					
		  					//vec3.add( octant.centerOfMass, oldBody.position, octant.centerOfMass );  
		  					//octant.mass += oldBody.mass;
		  					
		  					//var code = 0;
		  					
		  					//if ( body.position[0] > octant.center[0] ) code |= 1;
		  					//if ( body.position[1] > octant.center[1] ) code |= 2;
		  					//if ( body.position[2] > octant.center[2] ) code |= 4;
		  					
		  					queue.unshift({		                        
		                        body: body,
		                        node: node
		                    });
		  					
		  					//code = 0;
		  					
		  					//if ( oldBody.position[0] > octant.center[0] ) code |= 1;
		  					//if ( oldBody.position[1] > octant.center[1] ) code |= 2;
		  					//if ( oldBody.position[2] > octant.center[2] ) code |= 4;
		  						
		                    queue.unshift({
		                        body: oldBody,
		                        node: node	                        
		                    });		                    		                    		                
						                    	
                    } 
                    // 1. If node x does not contain a body, put the new body b here.
                    else {
                    	
                    		// $3DJS.Node has no body. Put it in here.
                    		octant.body = body
                    	
                    }
  				
  			}
  		
  	},
  	
  	// construct the kdtree
  	build: function ( bodies, center, bounds ) { 
  		
  			//this.maxDepth = 0;  		  			  			  
  			/*
  			var maxrad = Math.abs( bounds.maxX );
  			
  			if ( Math.abs(bounds.minX) > maxrad ) maxrad = Math.abs(bounds.minX); 
  			if ( Math.abs(bounds.maxY) > maxrad ) maxrad = Math.abs(bounds.maxY); 
  			if ( Math.abs(bounds.minY) > maxrad ) maxrad = Math.abs(bounds.minY); 
  			if ( Math.abs(bounds.maxZ) > maxrad ) maxrad = Math.abs(bounds.maxZ); 
  			if ( Math.abs(bounds.minZ) > maxrad ) maxrad = Math.abs(bounds.minZ); 
  			*/
  			// temporary
  			var maxrad = 1000000;  		
  			
  			this.root = new KDTreeNode( this.center, maxrad, null, 0 );  			
  			//this.root.radius = maxrad * 0.5; 
  		
  			console.log( this.root );
  		
  			
  			var i = bodies.length;
  			
  			while ( i-- ) {
  				  				
  					this.insertBody( bodies[i] );  					
  				
  			}	
  			
  		
  	},  
	
};

/**
 * Functions to read JSON responses from various web services  
 *  Twitter
 * 	YouTube
 * NOTE: This section is not currently functional!
 */

/*
function handleTwitterResponse ( response ) {
	
		var data = JSON.parse( response );
		console.log( data );
		
		for ( var i=0; i < data.items.length; i++ ) {
		
				var node = new $3DJS.Node({
					id: fdgraph.numNodes,
					name: data.items[i].snippet.title,
					textureUrl: "twitter-bird-light-bgs.png"
					//textureUrl: data.items[i].snippet.thumbnails.medium.url
				});
				
				fdgraph.addNode( node );
				
				
		
		}
		
		fdgraph.addEdge( new $3DJS.Node({id:0, name:"0"}), new $3DJS.Node({id:0, name:"0"}) );
		fdgraph.numEdges = 0;
		
}


function handleYouTubeResponse ( response ) {
	
		var data = JSON.parse( response );
		console.log( data );
		
		for ( var i=0; i < data.items.length; i++ ) {
		
				var node = new $3DJS.Node({
					id: fdgraph.numNodes,
					name: data.items[i].snippet.title,
					textureUrl: "textures/twitter-bird-light-bgs.png"
					//textureUrl: data.items[i].snippet.thumbnails.medium.url
				});
				
				fdgraph.addNode( node );
				
				
		
		}
		
		fdgraph.addEdge( new $3DJS.Node({id:0, name:"0"}), new $3DJS.Node({id:0, name:"0"}) );
		fdgraph.numEdges = 0;
		
}
*/

/**
 * Generates a graph.
 */
	
$3DJS.GraphGenerator = {
		
		/**
		 * Creates a grid.
		 */
		createGrid: function ( graph, extent ) {
			
				var node, source, dest;
						
				// Create nodes
				for ( var i=0; i < extent * extent; i++ ) {
						
						graph.addNode( new $3DJS.Node({ 
			      			id: i, 	      		
			      			color: [ Math.random(), Math.random(), Math.random(), 1.0 ],
			      			size: 30	      			
			      		}) );
						
				}
				/*
				// Create edges ( forms a grid )
				for ( var i=0; i < extent - 1; i++ ) {
						
						for ( var j=0; j < extent - 1; j++ ) {
							
								source = graph.nodes[ i*extent + j];
								dest = graph.nodes[ i*extent + 1 + j];
							
								graph.addEdge({
									 source: source, 
									 dest:   dest 
								});
								
								dest = graph.nodes[ (i + 1)*extent + j];
							
								graph.addEdge({
									 source: source, 
									 dest:   dest 
								});
						}
						
				}
				
				for ( var i=0; i < extent - 1; i++ ) {
					
						source = graph.nodes[ (extent - 1)*extent + i ];
						dest = graph.nodes[ (extent - 1)*extent + i + 1 ];
						
						graph.addEdge({
							 source: source, 
							 dest:   dest 
						});
				
						source = graph.nodes[ i*extent      +  (extent - 1) ];
						dest = graph.nodes[ (i + 1)*extent + (extent - 1) ];
						
						graph.addEdge({
							 source: source, 
							 dest:   dest 
						});
				}
				*/
				if ( !graph.autoUpdateBuffers ) {
						
							graph.nodeObj.updateVertexBuffers();
							graph.edgeObj.updateVertexBuffers();
							//graph.edgeLabelObj.updateVertexBuffers();
							
				}			
				
				
		},
		
		/**
		 * Creates a loop.
		 */
		createLoop: function ( graph, numNodes ) {
			
				for (var i=0; i < numNodes; ++i) {
					 
						graph.addNode( new $3DJS.Node({ 
			      			id: i, 	      		
			      			color: [ Math.random(), Math.random(), Math.random(), 1.0 ],
			      			size: 30	      			
			      		}) );
					
				}
					
				for (var i=0; i < numNodes-1; ++i)	{
					
						graph.addEdge({
							 source: graph.nodes[i], 
							 dest:   graph.nodes[i+1] 
						});

				}

				graph.addEdge({
					 source: graph.nodes[numNodes-1], 
					 dest:   graph.nodes[0] 
				});
				
				if ( !graph.autoUpdateBuffers ) {
						
							graph.nodeObj.updateVertexBuffers();
							graph.edgeObj.updateVertexBuffers();
							//graph.edgeLabelObj.updateVertexBuffers();
							
				}	
			
		}

};

/**
 * @author Mike Wakid
 * This file contains methods to control graph node and edge labeling using HTML elements
 * Note: This method does not work well for 3D since labels will be visible even if they
 *   should be occluded
 */
/*
$3DJS.Graph.LabelManager = {
	
		labels : [],
		
		addLabels : function ( graph ) {
			
				var container = document.getElementById("container");
				
				var i = graph.numNodes;	
				
				while ( i-- ) {
					
						var newDiv = document.createElement('div');
						
						newDiv.innerHTML = graph.nodes[i].name;
						newDiv.id = graph.nodes[i].id.toString();
						newDiv.style.position = "absolute";
						newDiv.style.top = "0px";
						newDiv.style.left = "0px";
						newDiv.style.width = "200px"; 						
						newDiv.style.color = "rgba(255,0,0,255)";
						
						newDiv.style.userSelect = "none";
						newDiv.style.webkitUserSelect = "none";
						newDiv.style.MozUserSelect = "none";
						newDiv.unselectable = "on"; // For IE and Opera
						//newDiv.href = "www.google.com"						
						//newDiv.style.backgroundColor = "rgba(255,0,0,0.5)";
													
						//document.body.appendChild( newDiv );
						container.appendChild( newDiv );	
						
						this.labels[i] = newDiv;
						
				}
					
		},

		updateLabelPositions : function ( graph ) {
						
				var windowPos = vec3.create( );
											
				var i = graph.numNodes;									
				
				while ( i-- ) {
																						
						project( graph.nodes[i].position, windowPos );
						
						// Need to check if the node is behind the camera
						if ( windowPos[2] < 1.0 ) { 	
								
								this.labels[i].style.display = "block";									
								this.labels[i].style.top = (gl.canvas.height - windowPos[1]) + "px";
								this.labels[i].style.left = windowPos[0] + "px";
								
						} else {
							
								this.labels[i].style.display = "none";
							
						}										
						
				}	
					
		}
	
}
*/

/*************************************************************************************************
 *
 * Cascade
 * Description: Create a cascade visualization				
 * 
 *************************************************************************************************/

Cascade.prototype = new SceneObject( );
Cascade.prototype.constructor = Cascade;

function Cascade ( radius, numSlices, numRings ) {
				
		// Number of entities (nodes) 
		this.numNodes = 0;
						
		// Array containing the nodes and their properties
		this.nodes = [ ];
		this.nodesVisible = [ ];
		
		this.startTimeInMs = 0;							// Time of the first tweet 
		this.currTimeInMs  = 0;							// Current time (for animation)	
		this.endTimeInMs   = 0;							// Time of the last tweet
		
		this.totalElapsedTimeInS = 0;
	
		// Rendering related variables and functions
		radius 	       = radius    || 1;
		numSlices      = numSlices || 30;
		numRings   	   = numRings  || 1;	
		
		this.radius    = radius;
		this.numSlices = numSlices;
		this.numRings  = numRings;				
		 
		this.constructor = function( radius, numSlices, numRings ) {
	
				var vertices  = this.vertices;				
				var color 	  = this.color;
				var indices   = this.indices;
				
				var radianIncrement = ( 360.0 / numSlices ) * ( Math.PI / 180.0 );
				
				for ( var i = 0; i < numRings; ++i ) {
				
						for ( var j = 0; j < numSlices; ++j ) { 
							
								var currRadian = j * radianIncrement;
																			
								vertices.push( Math.cos( currRadian ) * (i + 1) * radius ); vertices.push( Math.sin( currRadian ) * (i + 1) * radius );	vertices.push( 0.0 );																																																							
								color.push( 1.0, 1.0, 1.0, 1.0 );									
								indices.push( i * numSlices + j )
												
						}
				
						// connect back to first vertex on the circle
						indices.push( i * numSlices );																		
				
				}
				
			
		}
		
		this.constructor( radius, numSlices, numRings );
	        
        // Initialize scene object variables ( buffers, shaders, rendering function )               
        this.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, numSlices * numRings, gl.STATIC_DRAW );        
        this.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, numSlices * numRings, gl.STATIC_DRAW );                  	   
    	this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, numSlices * numRings + numRings, gl.STATIC_DRAW );  
    	this.shaderProgram.push( loadShader( 'lines', setupLineShader ) );     	   
    	this.renderFunc = this.renderCascade;   
			
}

Cascade.prototype.setColor = function ( r, g, b, a ) {
	
		this.color = [];
	
		for ( var i = 0; i < this.numRings; ++i ) {
		
				for ( var j = 0; j < this.numSlices; ++j ) { 
		
					this.color.push( r, g, b, a,
									 r, g, b, a,
									 r, g, b, a  );
				
				}			        		        		        		        
			        		        		        		        
		}
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );  
			
}

Cascade.prototype.renderCascade = function () { 
		
		// Bind shading program
		var program = this.shaderProgram[0];   		   		
       	gl.useProgram( program );
			 								   	
	   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
	   	var attributes = this.shaderProgram[0].attributes;   
	   	
	   	// Bind vertex array buffers
	   	for ( var i in vertexAttribArrayBuffers ) {
	   			   					   			
	   			gl.bindBuffer( vertexAttribArrayBuffers[ i ].target, vertexAttribArrayBuffers[ i ].id );	 
	   			gl.enableVertexAttribArray( attributes[ i ] );  			
	   			gl.vertexAttribPointer( attributes[ i ], vertexAttribArrayBuffers[ i ].size, gl.FLOAT, false, 0, 0);
	   			
	   	}	  
	   	
	   	// Bind projection and modelview matrices
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, $3DJS.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, $3DJS.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    
		// Render the wireframe circle	  		  	     			   		   	 	   		  	   		    
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );	   		 
	   	gl.drawElements( gl.LINE_STRIP, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );	    
       	  
		// Disable vertex arrays
       	for ( var i in vertexAttribArrayBuffers ) {
       	
       			gl.disableVertexAttribArray( attributes[ i ] );
       			
       	}  	
		
}

Cascade.prototype.animate = function ( elapsedTimeInMs ) {

		var multiplier = 60 * 60 * 24;    // 24 hours per second -> 
		this.currTimeInMs += elapsedTimeInMs * multiplier; 
	
		// For each node		
		for ( var i = this.nodes.length - 1; i >= 0; --i ) {
			
				if ( this.nodes[i].created_at <= this.currTimeInMs )
						this.nodesVisible[i] = true;
				else
						this.nodesVisible[i] = false;
			
		}
		
		
		//if ( this.currTimeInMs >= this.endTimeInMs ) {
		if ( this.currTimeInMs >= this.startTimeInMs + 1000 * 60 * 60 * 24 * 14 ) {
			
				g_cascade.currTimeInMs = g_cascade.startTimeInMs;
			
		}
	
	
}
	
	
