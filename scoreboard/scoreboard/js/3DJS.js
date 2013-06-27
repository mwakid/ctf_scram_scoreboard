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
var GL = GL || { VERSION: '1.0' };

var gl;							// Variable containing interface to all 3D graphics components (rename to ctx or something that doesn't get confused with the library name)		

// transformation matrices

GL.MVMatrix = undefined;		// Modelview matrix
GL.MVMatrixStack = [];			// Modelview matrix stack
GL.PMatrix = undefined;			// Projection matrix
GL.PMatrixStack = [];			// Projection matrix stack

// for calculating frames per second
GL.previousTime = new Date().getTime();
GL.elapsedTime = 0;
GL.frameCount = 0;
GL.fps = 0;


/**
 * Initilization functions for the graphics library. Must be called to intialize the library before use. These initializations incliude 
 * 	 getting the WebGL context from the HTML5 canvas element and initializing internal library variables.
 *
 * @param {Object} config Configuration object for the library
 * @param {String} config.canvasId ID of the canvas that will be rendered to. If an ID is not specified one will be automatically created.
 * @param {Integer} config.width Width of the canvas
 * @param {Integer} config.height Height of the canvas
 */

GL.init = function ( settings ) {
	
		// Set the margin of the body to 0 so there is no spacing around the canvas
		document.body.style.margin = '0px';
		
		// settings - 
		//		canvas_id - the id of the canvas to draw on
		//		width -
		//      height - 
		//
	
		settings = settings || { };
	
		// Create the HTML5 canvas and add it to the document body
		var canvas = document.getElementById( settings.canvas_id );
		
		if ( canvas == null ) {
		
				var canvas = document.createElement('canvas');
				canvas.id = settings.canvas_id || 'canvas3djs';	
				canvas.setAttribute( 'tabindex', '1' );			
				document.body.appendChild(canvas);
				
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
		
		// Add a lost context handler and tell it to prevent the default behavior
		canvas.addEventListener("webglcontextlost", function(event) { 			
			event.preventDefault();			
		}, false);
		
		// Re-setup all your WebGL state and re-create all your WebGL resources when the context is restored.
		canvas.addEventListener("webglcontextrestored", setupWebGLStateAndResources, false);
		
		// Get the WebGL context from the canvas element		
		gl = canvas.getContext( 'experimental-webgl', {
			antialias: true,
			alpha: false, 								// alpha: false is to prevent WebGL objects with transparency to blend with the HTML page	
		}); 
				
		
		// If the context does not exist fire an alert
		if ( !gl ) {
	
				alert( 'Cannot get WebGL context!' );						
				return null;
	
		}			
			
}

function setupWebGLStateAndResources ( ) {
	
}

function initGLVariables ( ) {
	 			
		GL.MVMatrix = mat4.create( );				// Modelview matrix		
		GL.PMatrix  = mat4.create( );				// Projection matrix	
		
		// WebGL initializations
    	gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    	gl.enable( gl.DEPTH_TEST );   
    	gl.depthFunc( gl.LESS ); 

}


/**
 * Resizes the canvas when browser has changed size
 */

window.onresize = function ( ) {
					
		// resize the canvas 	
		var canvas = document.getElementById( "canvas3djs" );  // this element should be stored in a variable instead of retrieved from the DOM each time
		canvas.style.width = window.innerWidth;
		canvas.style.height = window.innerHeight;
		
		gl.canvas.width  = window.innerWidth;
		gl.canvas.height = window.innerHeight;
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
 * 
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
 * This file is used to integrating HTML elements and CSS into our visualizations  
 * 
 * @param {string}
 * @param {integer}
 * @param {integer}
 */

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
function insertHTML5LabelCanvas ( width, height ) {
	
		// Create the canvas	
		var canvas = document.createElement( 'canvas' );
		
		// Assign canvas attributes
		canvas.id     = "labelCanvas";
		canvas.width  = width;
		canvas.height = height;
		
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
        canvas.context.fillStyle = "#FF0000"; 
        
        // This determines the alignment of text, e.g. left, center, right
        canvas.context.textAlign = "center";             
        
        // This determines the baseline of the text, e.g. top, middle, bottom
        canvas.context.textBaseline = "middle";            
        
        // This determines the size of the text and the font family used
        canvas.context.font = "30px Helvetica Neue";      
        
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

/**
 * 
 */

GL.Scene = GL.Scene || { };

GL.Scene = function ( config ) {
	
		this.objects = [];		
	
}

GL.Scene.prototype = {
	
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

GL.Renderer = GL.Renderer || { };

//GL.Renderer.WebGL = GL.Renderer.WebGL || { };

GL.Renderer = function ( config ) {
	
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

GL.Renderer.prototype = {
	
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
		       	mat4.perspective( 45, gl.canvas.width / gl.canvas.height, 1.0, 100000.0, GL.PMatrix );
				
				// Modelview transformation
		       	mat4.identity( GL.MVMatrix );     
		       	mat4.translate( GL.MVMatrix, 0.0, 0.0, -50 );                  
		       	mat4.multiply( GL.MVMatrix, GL.interactor.transform, GL.MVMatrix );
		       	  
		       	//quadArray.render( ); 
		       	   
		       	// Render the graph
		       	           
		      	//  graph.render2( );
		      	scene.render();
		        
		        // Render the spatial partition
		        
		        // if ( drawOctree == true )
		        //	octree.render();    
		        
		        // Render the particle system
		        //graph.particleSystem.render( );
			
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
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
	  	
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
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
	  		  	     			   		   	 	 
	  	// Draw the shape  		  	   		    
	   	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.vertexAttribArrayBuffers['position'].count );
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
	   	gl.drawElements( gl.TRIANGLE_STRIP, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
       	  
		// Disable vertex buffer objects
		gl.disableVertexAttribArray( attributes['position'] );  
       	gl.disableVertexAttribArray( attributes['color'] );       			
       	   	       			
}

SceneObject.prototype.renderSimpleCircle = function ( ) {

		var program = this.shaderProgram[0];   		   		
       	gl.useProgram( program );
			 								   	
	   	var vertexAttribArrayBuffers = this.vertexAttribArrayBuffers;
	   	var attributes = this.shaderProgram[0].attributes;   
	   	
	   	//for ( var i = buffers.length - 1; i >= 0; --i ) {
	   	for ( var i in vertexAttribArrayBuffers ) {
	   			   					   			
	   			gl.bindBuffer( vertexAttribArrayBuffers[ i ].target, vertexAttribArrayBuffers[ i ].id );	 
	   			gl.enableVertexAttribArray( attributes[ i ] );  			
	   			gl.vertexAttribPointer( attributes[ i ], vertexAttribArrayBuffers[ i ].size, gl.FLOAT, false, 0, 0);
	   			
	   	}	  
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    
	   	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.vertexAttribArrayBuffers['position'].count );
	   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
	   	gl.drawElements( gl.TRIANGLE_FAN, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
       	  
       	//for ( var i = this.buffers.length - 1; i >= 0; --i ) {
       	for ( var i in vertexAttribArrayBuffers ) {
       	
       			gl.disableVertexAttribArray( attributes[ i ] );
       			
       	}   	
       	   	       			
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
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    
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
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    	 
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
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    	 
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
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrixStack[ GL.MVMatrixStack.length -1 ].slice( 0 ) );       	
	   	
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
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );
	  		  	
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
	   	
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );
	  	      	
	   	
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
				mat4.identity( GL.MVMatrix );
				
				// Push identity matrix on modelview matrix stack
				pPushMatrix( );
				mat4.identity( GL.PMatrix );
			
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  	
			  	gl.activeTexture( gl.TEXTURE0 );
				gl.bindTexture( gl.TEXTURE_2D, this.texture );
				gl.uniform1i( program.samplerUniform, 0 );
				
				// Enable blending
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

GL.Geometry = function () {
	
	
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
 * This is the quad object
 *
 * @param {object} data stores properties to initialize a quad object
 */

// Quad ///////////////////////////////////////////////////////////////////////////////////////////
// NOTE: Need to add a mechanism to determine whether or not multiple instances of the object will be drawn
// 		 or a single batch call to draw all instanced objects (e.g. pseduinstancing = true)  

function Quad ( data ) {
	
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

Quad.prototype = {
		
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  		  	     			   		   	 	 
			  	// Draw the shape  		  	   		    
			   	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.vertexAttribArrayBuffers['position'].count );
			   	gl.bindBuffer( this.elementArrayBuffer.target, this.elementArrayBuffer.id );
			   	gl.drawElements( gl.TRIANGLE_STRIP, this.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );  
		       	  
				// Disable vertex buffer objects
				gl.disableVertexAttribArray( attributes['position'] );  
		       	gl.disableVertexAttribArray( attributes['color'] ); 
			
		} 
	
}

Quad.prototype.updateTexture = function ( texture ) {
	
		gl.bindTexture( gl.TEXTURE_2D, this.texture );				
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture );	
		gl.bindTexture( gl.TEXTURE_2D, null );
	
}

/**
 * This object is for optimizing rendering performance when a large number of lines (e.g. edges in a graph) 
 * must be rendered to the screen.
 * 
 * @param {object} data Stores properties to initialize a quad object.
 * @param {number} data.width The width of each quad.
 * @param {number} data.height The height of each quad.
 * @param {integer} data.numQuads The number of quad objects to be rendered.
 * @param {array} data.color a 4-D array to indicate the default color of each quad, in the format [r, g, b, a], with values from [0, 1].
 */

function LineArray ( data ) {
	
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

LineArray.prototype = {
	
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
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
					  	
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
 * This object is for optimizing rendering performance when a large number of quads must be
 * rendered to the screen.
 * 
 * Advantages:
 *   1. Has good performance when a large number of nodes must be rendered 
 * Disadvantages:
 * 	 1. Will not work when a unique texture image is needed for a large number of nodes (e.g. Twitter profile images).
 * 	    If only a few are needed (e.g. entity icons) this method will work well.
 * 
 * 
 * @param {object} data Stores properties to initialize a quad object.
 * @param {number} data.width The width of each quad.
 * @param {number} data.height The height of each quad.
 * @param {integer} data.numQuads The number of quad objects to be rendered.
 * @param {array} data.color a 4-D array to indicate the default color of each quad, in the format [r, g, b, a], with values from [0, 1].
 */

function QuadArray ( data ) {

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
		
		var color = data.color || [ 1.0, 1.0, 1.0, 1.0 ];
		
		// Initialize texture
		this.texture = null; 
		
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
		        this.vertexAttribArrayBuffers[i]['worldPos']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.worldPos[i] ),  3, this.worldPos[i].length / 3, gl.DYNAMIC_DRAW );        
		        this.vertexAttribArrayBuffers[i]['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color[i] ),     4, this.color[i].length / 4, gl.STATIC_DRAW );   
		        this.vertexAttribArrayBuffers[i]['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords[i] ), 2, this.texCoords[i].length / 2, gl.STATIC_DRAW );
		        this.vertexAttribArrayBuffers[i]['colorId']   = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.colorId[i] ),   4, this.colorId[i].length / 4, gl.STATIC_DRAW );		        
		        this.elementArrayBuffer[i] = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices[i] ), 1, this.indices[i].length, gl.STATIC_DRAW );
		       	
		}
		
		this.drawMode = gl.TRIANGLES;
                               	  
    	//this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) );
    	this.shaderProgram.push( loadShader( 'billboardArray', setupBillboardArrayShader ) ); 
	
}

QuadArray.prototype = {
	
		// adds a quad to the end of the quad array
		addQuad: function ( config ) {
			
				config = config || { };
				
				config.width = config.width ? config.width : 1.0;
				config.height = config.height ? config.height : 1.0;
				config.color = config.color ? config.color : [ 0.0, 0.0, 0.0, 1.0 ];
				config.colorId = config.colorId ? config.colorId : [ 0.0, 0.0, 0.0, 0.0 ];
			
				// add 1 to the number of total quads
				++this.numQuads;
				
				// recalculate the required number of buffers
				this.calcNumRequiredBuffers( );
				
				var i = this.currentBufferIndex;
				
				this.vertices[i].push(
				        
			           -config.width * 0.5, -config.height * 0.5,  0.0,
			           -config.width * 0.5,  config.height * 0.5,  0.0,
			            config.width * 0.5, -config.height * 0.5,  0.0,	           
			            config.width * 0.5,  config.height * 0.5,  0.0
			            	             	        
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
		        
			        	config.color[0], config.color[1], config.color[2], config.color[3],
			        	config.color[0], config.color[1], config.color[2], config.color[3],
			        	config.color[0], config.color[1], config.color[2], config.color[3],
			        	config.color[0], config.color[1], config.color[2], config.color[3]
		        
		        );
		                 	
				// Texture coordinate data
		        this.texCoords[i].push(
		        
			            0.0, 0.0,
			            0.0, 1.0,
			            1.0, 0.0,	          	         
			            1.0, 1.0
		            
		        );	
		        
		        // Color Ids for picking
		        this.colorId[i].push(
		        
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3],
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3],
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3],
			        	config.colorId[0], config.colorId[1], config.colorId[2], config.colorId[3]
		        
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
						this.indices[i]    = [ ];
												
						this.vertexAttribArrayBuffers[i] = [ ];		
				
					
				} 
			
		},
		
		updateVertexBuffers: function ( ) {
			
				for ( var i=0; i < this.numRequiredBuffers; ++i ) {
			
						// Initialize scene object variables ( buffers, shaders, rendering function )               
				        this.vertexAttribArrayBuffers[i]['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices[i] ),  3, this.vertices[i].length / 3, gl.STATIC_DRAW );
				        this.vertexAttribArrayBuffers[i]['worldPos']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.worldPos[i] ),  3, this.worldPos[i].length / 3, gl.DYNAMIC_DRAW );        
				        this.vertexAttribArrayBuffers[i]['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color[i] ),     4, this.color[i].length / 4, gl.STATIC_DRAW );   
				        this.vertexAttribArrayBuffers[i]['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords[i] ), 2, this.texCoords[i].length / 2, gl.STATIC_DRAW );
				        this.vertexAttribArrayBuffers[i]['colorId']   = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.colorId[i] ),   4, this.colorId[i].length / 4, gl.STATIC_DRAW );
				        //this.drawMode = gl.TRIANGLES;				    
				        this.elementArrayBuffer[i] = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices[i] ), 1, this.indices[i].length, gl.STATIC_DRAW );
				        
				}
			
		},
		
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
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
					  	
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
Circle.prototype = new SceneObject( );
Circle.prototype.constructor = Circle;

function Circle ( radius, numSlices ) {        // requires 3 slices at the minimum ( would create a triangle composed of 3 triangles )
	
		radius    = radius  || 1;
		numSlices = numSlices || 30;
		
		this.radius = radius;
		this.numSlices = numSlices;
		 
		this.constructor = function( radius, numSlices ) {
	
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
																	
						vertices.push( Math.cos( currRadian ) * radius );	   
						vertices.push( Math.sin( currRadian ) * radius );					
						vertices.push( 0.0 );		
																										
						texCoords.push( 0.5 * Math.cos( currRadian ) + 0.5 );  
						texCoords.push( 0.5 * Math.sin( currRadian ) + 0.5 );
																																		
						color.push( 1.0, 1.0, 1.0, 1.0 );	
														
						indices.push( i + 1 )
										
				}
				
				// connect back to first vertex on the circle
				indices.push( 1 );
			
		}
		
		this.constructor( radius, numSlices );
		
		// Initialize texture
		this.texture = undefined; /*gl.createTexture( );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );		
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );		      		
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);			
		gl.bindTexture( gl.TEXTURE_2D, null );
		*/
		
		//this.texture = createImageTexture( "textures/propagator2.png", gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );  
	        
        // Initialize scene object variables ( buffers, shaders, rendering function )               
        this.vertexAttribArrayBuffers['position']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), 3, numSlices + 2, gl.STATIC_DRAW );      // check these vbo as the count may be incorrect  
        this.vertexAttribArrayBuffers['color']     = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.color ), 4, numSlices + 2, gl.STATIC_DRAW );    
        this.vertexAttribArrayBuffers['texCoords'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.texCoords ), 2, numSlices + 2, gl.STATIC_DRAW ); 
        this.drawMode = gl.TRIANGLE_FAN;             	   
    	this.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), 1, numSlices + 2, gl.STATIC_DRAW );  
    	this.shaderProgram.push( loadShader( 'simpleObject', setupSimpleObjectShader ) );     	   
    	this.renderFunc = this.renderSimpleCircle;   	
        	

} 

// This function has must be changed to be more robust

Circle.prototype.setColor = function ( r, g, b, a ) {
	
		this.color = [];
	
		for ( var i = 0; i < this.numSlices + 2; i++ ) { 
		
				this.color.push( r, g, b, a );
			        		        		        		        
		}
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexAttribArrayBuffers['color'].id );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.color ), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );  
			
}

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
	
		GL.interactor.currentlyPressedKeys[ event.keyCode ] = true;	
	 
}

function handleKeyUp ( event ) {
	
		GL.interactor.currentlyPressedKeys[ event.keyCode ] = false;
	
}
 
function handleMouseDown ( event ) {
	
		// 0 - W3C value for left mouse click
		if ( event.button == 0 ) 
			GL.interactor.leftMouseDown = true;
		
		// 1 - Middle mouse click	
		if ( event.button == 1 ) 
			GL.interactor.middleMouseDown = true;
		
		// 2 - Right mouse click
		if ( event.button == 2 ) 
			GL.interactor.rightMouseDown = true;
			
		//interactor.buttonReleased = false;	
		
		//interactor.lastMouseX = event.offsetX;
		//interactor.lastMouseY = event.offsetY;
		//interactor.lastMouseX = event.clientX;
		//interactor.lastMouseY = event.clientY;
		
} 

function handleMouseUp ( event ) {
    
    	GL.interactor.leftMouseDown = false;
    	GL.interactor.middleMouseDown = false;
    	GL.interactor.rightMouseDown = false;
    	
    	GL.interactor.buttonReleased = true;
    
}

// NOTE: The performance of this function may be able to be improved
function handleMouseMove ( event ) {

		GL.interactor.mouseMoving = true;

    	//if ( !interactor.leftMouseDown && !interactor.middleMouseDown ) {
      			
      	//		return;
      			
    	//}
    	
    	// For Chrome  
    	//var currMouseX = event.offsetX;
    	//var currMouseY = event.offsetY;
    	
    	// For Firefox
    	var currMouseX = event.clientX;
    	var currMouseY = event.clientY;

    	var deltaX = currMouseX - GL.interactor.lastMouseX;       	
    	var deltaY = currMouseY - GL.interactor.lastMouseY;
    	
    	if ( GL.interactor.leftMouseDown ) {
		    	
		    	var quat = new quat4( );
		    	var rotationMatrix = mat4.create( );
				
				quat.axisAngleToQuat( -deltaX * 0.2, GL.interactor.transform[1], GL.interactor.transform[5], GL.interactor.transform[9] );
				GL.interactor.rotation = quat.multiply( GL.interactor.rotation );
				
				quat.axisAngleToQuat( -deltaY * 0.2, GL.interactor.transform[0], GL.interactor.transform[4], GL.interactor.transform[8] );
				GL.interactor.rotation = quat.multiply( GL.interactor.rotation );
						
				GL.interactor.updateRotation( );
		
		} 
		
		if ( GL.interactor.middleMouseDown ) {
			
				GL.interactor.translation[0] += deltaX * GL.interactor.translationSpeed;
				GL.interactor.translation[1] -= deltaY * GL.interactor.translationSpeed;
				GL.interactor.updateTranslation( );
			
		}

    	GL.interactor.lastMouseX = currMouseX;
    	GL.interactor.lastMouseY = currMouseY;

}

function handleMouseWheel ( event ) {
	
		GL.interactor.translation[2] += event.wheelDelta * 1.0;	
		GL.interactor.updateTranslation( );
	
}

function handleMouseWheelFF ( event ) {
	
		GL.interactor.translation[2] += event.detail ? event.detail * ( -120.0 ) * 1.0 : event.wheelDelta;
		GL.interactor.updateTranslation( );
	
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
		
		// Call custom key function if it exists 
		
		handleCustomInput( );
		
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
		image.src = filename;
		
	
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

// Billboard shader for single objects (i.e. when each object needs i)
function setupBillboardSShader ( program ) {

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

function setupBillboardArrayShader ( program ) {
		
		// Attributes	                  
       	program.attributes['position']  = gl.getAttribLocation( program, "aPosition" );  
       	program.attributes['worldPos']  = gl.getAttribLocation( program, "aWorldPos" );       
        program.attributes['color']     = gl.getAttribLocation( program, "aColor" );                          
      	program.attributes['texCoords'] = gl.getAttribLocation( program, "aTexCoords" );
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

function setupColoredNodeSShader ( program ) { 
		
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





/*************************************************************************************************
 *
 * Math Utility Functions
 * Description: 
 * 		2D, 3D, 4D Vectors 
 * 		4x4 Matrix
 * 
 *************************************************************************************************/

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

//GL.prototype.perspective = function ( fovy, aspect, zNear, zFar ) {
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
		
		mat4.copy( GL.MVMatrix, matrix );
		
        GL.MVMatrixStack.push( matrix );
	
}

// Pop the top matrix from the modelview matrix stack
function mvPopMatrix ( ) {  
       
        GL.MVMatrix = GL.MVMatrixStack.pop();
        		                      
}

// Push the current modelview matrix onto the projection matrix stack
function pPushMatrix ( ) {
			
		var matrix = mat4.create( );
		
		mat4.copy( GL.PMatrix, matrix );
		
        GL.PMatrixStack.push( matrix );
	
}

// Pop the top matrix from the projection matrix stack
function pPopMatrix ( ) {
	    	   
        GL.PMatrix = GL.PMatrixStack.pop();
        		            	        
}

function glLoadIdentity ( ) {
    	
    	var cm = gl.currMatrix;
    
    	cm[0] = 1;		cm[4] = 0;		cm[8]  = 0;		cm[12] = 0;
    	cm[1] = 0;		cm[5] = 1;		cm[9]  = 0;		cm[13] = 0;
    	cm[2] = 0;		cm[6] = 0;		cm[10] = 1;		cm[14] = 0;
    	cm[3] = 0;		cm[7] = 0;		cm[11] = 0;		cm[15] = 1;   
      
}

//GL.prototype.multMatrix = function ( matrix ) {
function glMultMatrix ( matrix ) {

    	mat4.multiply( gl.currMatrix, matrix, gl.currMatrix );
      
}

// Map object coordinates to window coordinates
//function gluProject( objX, objY, objZ, model, proj, view, winX, winY, winZ ) {
function project( objectPos, windowPos ) {
	
		var objectPosVec4 = vec4.create( objectPos[0], objectPos[1], objectPos[2], 1.0 );
		
		// Calculate the modelview-projection matrix
		var mvpMatrix = mat4.create( );
		mat4.multiply( GL.PMatrix, GL.MVMatrix, mvpMatrix );
		
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
		mat4.multiply( GL.PMatrix, GL.MVMatrix, mvpMatrix );
        
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
 * Splines
 * 
 * @param center
 * @param
 * @param
 */

// Bezier

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
		
				this.particleObj = new Quad( 1, 1 );
	
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
   					    //vec3.add( src.velocity, src.acceleration, src.velocity );   		
   					    
   					    
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  	
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
 * Node object for a graph.
 * @param {object} data Data to populate information regarding the node.
 * @param data.id Unique identifier for the node. Can be a number or a string.
 * @param {integer} data.graphId Unique internal identifier for the node within the graph. These id's must be a contiguous sequence ordered [0,1,2...n].
 * @param {object} data.metadata Arbitrary metadata to be stored within the node.
 */

function Node ( data ) { 
	
		/**
		 * General node properties
		 */
	
		// Unique node identifier
		this.id = data.id;
		
		// Node index in relationship to the graph 
		// should be specified by the library NOT the user for rendering and performance optimization
		this.graphId = data.graphId;
		
		// String containing the name of the node (or word)
		this.name = data.name;
		
		//  Used to random access lookup in the graph node array
		//this.graphIndex = graphIndex;
		
		// Color identifier for picking (based on id)
		this.colorId = vec4.create( );		
		
		// Array containing the edges this node is attached to
		this.edgeIndices = [];
		
		this.metadata = data.metadata ? data.metadata : undefined;
		
		// Node type (e.g. person, location, document )
		this.type = data.type;
				
		// Array containing child nodes ( this is used to expand and collapse nodes )
		//this.numChildren = 0;
		//this.children = [];
		//this.collapse = false;
		//this.collapsed = false;
		
		/**
		 * Appearance variables for rendering
		 */
	
		this.color = data.color || [ 1.0, 1.0, 1.0, 1.0 ];
	
		this.textureUrl = data.textureUrl ? data.textureUrl : undefined;
	
		/**
		 * Metrics for graph analytics
		 */
		
		this.degree_centrality = 0;
		
		this.avg_edge_weight = 0;
		
		this.authority = 0;
	
		/**
		 * Physics related variables for force-directed layouts
		 */
		
		// Position
		this.position = vec3.create( 100 * Math.random() - 50, 100 * Math.random() - 50, 100 * Math.random() - 50 );	
		
		// Velocity
		this.velocity = vec3.create( ); 		
		
		// Acceleration		
		this.acceleration = vec3.create( );		
		
		// Force 
		this.force = vec3.create( );
		
		// Mass
		this.mass = 1.0; 		
		
		// Rendering related variables
		this.size = data.size || 1.0;				
	
}

Node.prototype = {
	
		// Constructor
		init: function ( ) {
			
		},
	
		// Assigns a color to a node based on their unique identifier.
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

//function Edge ( src, dst, id, graphId, weight ) {
function Edge ( data ) {
	
		// Unique edge identifier
		this.id = data.id || 0;
		
		// Node index in relationship to the graph 
		// should be specified by the library NOT the user for rendering and performance optimization
		this.graphId = data.graphId;
	
		// String containing the name of the node (or word)
		this.name = data.id;
	
		// Source node
		this.src = data.src;
		
		// Destination node	
		this.dst = data.dst;	
		
		// Source node side edge color (to show direction)
		this.src_color = data.src_color ? data.src_color : [ 0.5, 0.5, 0.5, 1.0 ];
		
		// Destination node side edge color (to show direction)
		this.dst_color =  data.dst_color ? data.dst_color : [ 0.5, 0.5, 0.5, 1.0 ];
		
		// Is this edge bidirectional?
		this.bidirectional = data.bidirectional;
		
		// Weight representing the strength of the link (normalize values between 0-1?)
		this.weight = data.weight ? data.weight : 1.0;			 
	
		// Physics-based variables (Hooke's law / spring model)
		
		// Spring length at rest
		//this.restLength = restLength;   	
		
		// Spring constant k / stiffness
		//this.k = stiffness; 	
		
}

/**
 * Graph and associated methods.
 * @author Mike Wakid
 * @class Graph object.
 * @param {Object} config
 * @property {number} numNodes The number of nodes in the graph.
 * @property {number} numEdges The number of edges in the graph.
 * @property {array} nodes Array containing all of the nodes in the graph. 
 * @property {array} edges Array containing all of the edges in the graph.
 */

GL.Graph = function ( config ) {
		
		/**
		 * Variables to store the graph data 
		 */
	
		// Number of entities (nodes) 
		this.numNodes = 0;
		
		// Number of edges 
		this.numEdges = 0;
		
		// Array containing the nodes and their properties
		this.nodes = [];
		
		// Array containing the nodes by a string identifier
		this.nodeLookupArray = [];
		//this.nodesById = [];
		
		// Array containing the edges and their properties
		this.edges = [];
		
		// Array containing the edge by a string identifier
		this.edgesById = [];
		
		// Used for allowing the user to select nodes
		this.selectedNodeId = -1;
		
		// Used for allowing the user to select edges
		this.selectedEdgeId = -1;
		
		// Array that contains the center positions of the edges for the selected node
		this.edgeLabelPositions = [];
		
		this.edgeLabelColorIds = [];
		
		// * temporary
		this.particleSystem = new ParticleSystem( );
		
		this.useWebGLLabels = false;
		this.labelCanvas = null;
		
		/**
		 * Settings that control the appearance of the graph when rendered
		 */
		
		config = config || {};
		
		/**
		 * Autoupdates vertex buffer objects each time a node or edge is added to the graph. This is a slow operation
		 * that should be set to false for large graphs, 
		 */
		this.autoUpdateBuffers = ( config.autoUpdateBuffers == true || config.autoUpdateBuffers == undefined ) ? true : false;		
		
		this.settings = {
			
				/**
				 * Specifies what the shape of the node will be when drawn (e.g. square, circle, cube, sphere, etc. ). Defaults to square.
				 */
				nodeShape : config.nodeShape ? config.nodeShape : 'quad',
				
				/**
				 * Specifies the node color as a rgba vector. Defaults to black ([0.0, 0.0, 0.0, 1.0]).
				 */
				nodeColor : config.nodeColor ? config.nodeColor : [ 0.0, 0.0, 1.0, 1.0 ],
				
				/**
				 * 
				 */
				renderNodeLabels: config.renderNodeLabels? config.renderNodeLabels : false,
				
				/**
				 * Color of the text written on the node. Defaults to black '#000000'.
				 */
				nodeTextColor : config.nodeTextColor ? config.nodeTextColor : '#000000',
				
				/**
				 * Color of the text written on the node. Defaults to black '#000000'.
				 */
				nodeLabelSize : config.nodeLabelSize ? config.nodeLabelSize : 1.0,
	
				/**
				 * Specifies the edge color as a rgba vector. Defaults to black ([0.0, 0.0, 0.0, 1.0]).
				 */
				edgeColor: config.edgeColor ? config.edgeColor : [ 0.7, 0.7, 0.7, 1.0 ],
				
				/**
				 * Specifies the edge color as a rgba vector. Defaults to black ([0.0, 0.0, 0.0, 1.0]).
				 */
				edgeTextColor: config.edgeTextColor ? config.edgeTextColor : '#000000',
				
				/**
				 * Specifies the color of an edge when highlighted. Defaults to black ([0.0, 0.0, 0.0, 0.0]).
				 */
				edgeHighlightColor: config.edgeHighlightColor ? config.edgeHighlightColor : [0.0, 1.0, 0.0, 1.0],
								
		};
		
		/** 
		 * Variables to rendering the nodes and edges of the graph
		 * May want to move these to an outside object
		 */
		
		// Object to render nodes
		this.nodeObj = undefined;
		
		// Object to render labels for nodes (may be a temporary solution for this)
		this.nodeLabelObj = undefined;
		
		// Object to render edges
		this.edgeObj = undefined;
		
		// Object to render edge labels
		this.edgeLabelObj = undefined;
		
		// Frame buffer object to render graph objects into for picking/selecting 
		this.frameBufferObj = new FrameBufferObject( );
				
		this.layout = new GL.Graph.Layout.forceDirected();
		
		//this.apperance = new Graph.Appearance();

}

GL.Graph.prototype = {
	 	
		/**
		 * Methods 
		 */
		
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
						var src = edge.src;											
						
						if ( edge.bidirectional || src.id == nodeId ) {
												
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
					
						var src = this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].src;
						var dst = this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].dst;
						
						var _wj = src.avg_edge_weight;
						
						if ( src.id == nodeId ) 
							_wj = dst.avg_edge_weight; 
										
						this.nodes[ nodeId ].authority += ( this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].weight * this.edges[ this.nodes[ nodeId ].edgeIndices[i] ].weight ) * _wj; 
					
				}
			
		},		
		
		/**
		 * Adds a node to the graph. 
		 * 
		 * @param {Object} node The node object to add to the graph (reference the Node object).
		 */
		addNode2: function ( node ) {  // change name (this will be used when for social networks or anytime we have a unique texture for each node)
			
				// If the node already exists do not add it to the graph again and return.
				
				if ( this.nodeExists( node.id ) ) {
															
						return;
						
				}
				
				// Assign a unique id to the node (should be internal to the graph object only, the user shouldn't care about this)
				node.graphId = this.numNodes;
			
				// Add the node	if the id does not already exist		
				this.nodes[ node.graphId ] = node;
				this.nodeLookupArray[ node.id ] = node.graphId;
				//this.nodesById[ node.id ] = node;
				
				// Assign a color id so this node can be picked by the user (to be moved possibly)
				this.nodes[ node.graphId ].assignColorId( );
				
				// Create the object that will represent nodes when the graph is rendered
				if ( this.numNodes == 0 ) { 
					
						switch ( this.settings.nodeShape ) {
							case 'quad':
								this.nodeObj = new Quad( 1.0, 1.0 );   								
								break;
							case 'circle':
								this.nodeObj = new Circle( 0.5 * settings.nodeSize, 30 );   // this is out of date, updated when needed next								
								break;
							default:
								this.nodeObj = new Quad( 1, 1 );   								
								break;
						}
						
				 				
				  		this.nodeObj.texture = []; 				  		
				  		//this.nodeObj.texture = createImageTexture( "textures/person.gif", gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );
				  						  		
				  		if ( !node.textureUrl )
				  			this.nodeObj.shaderProgram[0] = loadShader( 'coloredNodeS', setupColoredNodeSShader );
				  		else
				  			this.nodeObj.shaderProgram[0] = loadShader( 'billboardS', setupBillboardSShader ); 
				  		this.nodeObj.shaderProgram[1] = loadShader( 'coloredNodeS', setupColoredNodeSShader ); 
				  		
				  		this.nodeLabelObj = new Quad( 1.0, 1.0 );  
				  		this.nodeLabelObj.texture = [];
				  		this.nodeLabelObj.shaderProgram[0] = loadShader( 'labelS', setupBillboardSShader );
				  		this.nodeLabelObj.labelSize = this.settings.nodeLabelSize;
				  		
				  		// init frame buffer
				  		this.frameBufferObj.init( gl.canvas.width, gl.canvas.height );
						this.frameBufferObj.initColorTexture( gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST );
						this.frameBufferObj.initDepthTexture( );
						this.frameBufferObj.disable( );
				  		
				}
				
				if ( node.textureUrl )
					this.nodeObj.texture[ node.graphId ] = createImageTexture( node.textureUrl, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );
				/*
				// determine if labels will be WebGL textures or HTML elements
				// WebGL textures will only be feasible with a small number of nodes (e.g. less than 1000), otherwise memory issues will occur
				
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
					
					
				}
								
				*/
				// Increment the number of edges in the graph by 1
				this.numNodes++;
			
				return node;
			
		},
		
		addNode: function ( node ) {
			
				// If the node already exists do not add it to the graph again and return.
				
				if ( this.nodeExists( node.id ) ) {
												
						return;
						
				}
				
				// Assign a unique id to the node (should be internal to the graph object only, the user shouldn't care about this)
				node.graphId = this.numNodes;
			
				// Add the node	if the id does not already exist		
				this.nodes[ node.graphId ] = node;
				this.nodeLookupArray[ node.id ] = node.graphId;
				//this.nodesById[ node.id ] = node;
				
				// Assign a color id so this node can be picked by the user (to be moved possibly)
				this.nodes[ node.graphId ].assignColorId( );
				
				// Create the object that will represent nodes when the graph is rendered
				if ( this.numNodes == 0 ) { 
					
						switch ( this.settings.nodeShape ) {
							case 'quad':
								this.nodeObj = new QuadArray({
						    		width: node.size,
						    		height: node.size,
						    		color: node.colorId
						    	});						    							
								break;						
						}
						
						if ( !node.textureUrl )
				  			this.nodeObj.shaderProgram[0] = loadShader( 'colorBillboardArray', setupColorBillboardArrayShader );
				  		else
				  			this.nodeObj.shaderProgram[0] = loadShader( 'billboardArray', setupBillboardArrayShader ); 
						
						this.nodeObj.shaderProgram[1] = loadShader( 'colorIdBillboardArray', setupColorIdBillboardArrayShader );    
						
						// init frame buffer
				  		this.frameBufferObj.init( gl.canvas.width, gl.canvas.height );
						this.frameBufferObj.initColorTexture( gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST );
						this.frameBufferObj.initDepthTexture( );
						this.frameBufferObj.disable( );	
						
						// Create an HTML5 canvas element to draw node labels on. This will be overlaid on top of the screen.
						this.labelCanvas = insertHTML5LabelCanvas( gl.canvas.width, gl.canvas.height );
						this.labelCanvasObj = new FullScreenQuad( ); 
						this.labelCanvasObj.texture = gl.createTexture();
						
				        gl.bindTexture( gl.TEXTURE_2D, this.labelCanvasObj.texture );
								
						gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );		
						gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
						gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );        		
						gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
						gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );				
						gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.labelCanvas );				   
								
						gl.bindTexture( gl.TEXTURE_2D, null );
				}
				
				this.nodeObj.addQuad({
					width: node.size,
					height: node.size,
					color: node.color,
					colorId: node.colorId
				});
				
				if ( node.textureUrl )
					this.nodeObj.texture = createImageTexture( node.textureUrl, gl.TEXTURE_2D, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR );
									
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
				
				// Update vertex buffer objects
				if ( this.autoUpdateBuffers )
					this.nodeObj.updateVertexBuffers();							
				
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
					
						//console.log( 'Debug: Node: ' + id + ' exists.')
						return true;
						
				} else { 
					
						//console.log( 'Debug: Node: ' + id + ' does not exist.')
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
		 * Adds an edge to the graph 
		 */	
		addEdge: function ( data ) {
			
				var src = data.src;
				var dst = data.dst;
				
				var src_color = data.src_color ? data.src_color : this.settings.edgeColor;
				var dst_color = data.dst_color ? data.dst_color : this.settings.edgeColor;

				var bidirectional = data.bidirectional;
				
				if ( bidirectional == undefined ) bidirectional = true;

				var weight = data.weight;
				
				var edge_name = src.id + "||" + dst.id;
				
				// Add the edge index to each node so we know what edges the node is part of
				src.edgeIndices.push( this.numEdges );
				dst.edgeIndices.push( this.numEdges );
			
				// Create the edge
				this.edges[ this.numEdges ] = new Edge({ 
					id: edge_name, 
					graphId: this.numEdges,
					src: src, 
					dst: dst, 
					src_color: src_color,
					dst_color: dst_color,	
					bidirectional: bidirectional,				
					weight: weight 
				});
				
				//this.edgesById[ edge_name ] = this.edges[ this.numEdges ];
				
				// Push a new line onto the edge geometry (going to need to clean this code up later)
				if (this.numEdges == 0) {
					
						this.edgeObj = new LineArray( );
						this.edgeObj.vertices = [];
						this.edgeObj.color = [];						
						this.edgeObj.indices = [];
						
						this.edgeLabelObj = new Quad( 2, 0.5 );
						this.edgeLabelObj.setColor( 0.8, 0.8, 0.8, 1.0 );  
						
						this.edgeLabelObj.texture = [];  						  
						
				  		this.edgeLabelObj.shaderProgram[0] = loadShader( 'labelS', setupBillboardSShader ); 
				  		this.edgeLabelObj.shaderProgram[1] = loadShader( 'coloredNodeS', setupColoredNodeSShader ); 
						
				}
				/*
				this.edgeLabelObj.texture[ this.numEdges ] = createCanvasTexture({ 
					//text : src.id + ' to ' + dst.id,
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
					p1: src.position,
					p2: dst.position,
					color1: src_color,
					color2: dst_color
				});
				
				// Update edge vertex buffer objects
				if ( this.autoUpdateBuffers )
					this.edgeObj.updateVertexBuffers();
				
				
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
		 * Check if an edge exists
		 */
		edgeExists: function ( id ) {
			
				if ( this.edgesById[ id ] != null ) { 
					
						//console.log( 'Debug: Edge: ' + id + ' already exists.')
						return true;
						
				} else { 
					
						//console.log( 'Debug: Edge: ' + id + ' does not exist.')
						return false;
						
				}
				
		},
		
		/**
		 * Update the edge buffer objects
		 */
		updateEdges: function ( ) {
			
				//this.edgeObj.updateVertices( this.edges );
				
				var i = this.numEdges;								
				
				while ( i-- ) {   // this calculation should be moved to where the forces are being determined		    	
		    			    			
		    			this.edgeObj.updateVertex( 6*i, this.edges[i].src.position );
		    			this.edgeObj.updateVertex( 6*i + 3, this.edges[i].dst.position );     			
		    			
		    			/*    			
		    			this.edgeObj.vertices[ 6*i ]     = this.edges[i].src.position[0];
		    			this.edgeObj.vertices[ 6*i + 1 ] = this.edges[i].src.position[1];
		    			this.edgeObj.vertices[ 6*i + 2 ] = this.edges[i].src.position[2];		    		
		    			
		    			this.edgeObj.vertices[ 6*i + 3 ] = this.edges[i].dst.position[0];
		    			this.edgeObj.vertices[ 6*i + 4 ] = this.edges[i].dst.position[1];
		    			this.edgeObj.vertices[ 6*i + 5 ] = this.edges[i].dst.position[2];
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
							
								var edge = this.edges[ this.nodes[ this.selectedNodeId ].edgeIndices[i] ];
							
								var avg_position = vec3.create();
								
								vec3.add( edge.src.position, edge.dst.position, avg_position );
								vec3.multiply( avg_position, 0.5, avg_position );
								
								this.edgeLabelPositions[i] = avg_position;
								
								// Particles
								
								var difference = vec3.create();
								var direction = vec3.create(); 
								var distance;
								var position = vec3.create();
								var velocity = vec3.create();
								
								vec3.subtract( edge.dst.position, edge.src.position, difference ); 								
								distance = vec3.magnitude( difference );						
								vec3.divide( difference, distance, direction );
								vec3.multiply( direction, 50.0, velocity );
								
								vec3.set( position, this.nodes[ this.selectedNodeId ].position[0], this.nodes[ this.selectedNodeId ].position[1], this.nodes[ this.selectedNodeId ].position[2] );
								
						}  
					
				}
			
		},
		
		/**
		 * Renders the graph 
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  	
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  	
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  			  				   
			   	
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  	
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  		  	
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  	
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
				gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
			  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
			  		  	
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
				var elapsed = currentTime - GL.previousTime;
				GL.elapsedTime += elapsed;
				
				// Increment the frame count   					  		
				GL.frameCount++;
				
				// Update frames per second (FPS) counter
				if ( GL.elapsedTime >= 1000 ) {
					
						//fps.innerHTML = "FPS: " + ( GL.frameCount / ( GL.elapsedTime * 0.001 ) ).toFixed(1);
						GL.elapsedTime = 0.0;	
						GL.frameCount = 0;			
					
				}
				
				
				// Set previous time to the current time
				GL.previousTime = currentTime;
			
				// Clear the label canvas
				graph.labelCanvas.context.clearRect( 0, 0, gl.canvas.width, gl.canvas.height );
			
				// Update the layout of the graph		
				//this.layout.update( this.nodes, this.edges );
				//this.layout.update( this );
				
				this.layout.octree.constructBarnesHutTree( this.nodes, this.layout.center, this.layout.bounds ); 		
				this.layout.barnesHutForce( graph );	
				
				// Update vertex buffers for the nodes and edges
				for ( var i=0; i < this.nodeObj.numRequiredBuffers; ++i ) {
						
						this.nodeObj.vertexAttribArrayBuffers[i]['worldPos']  = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( this.nodeObj.worldPos[i] ),  3, this.nodeObj.worldPos[i].length / 3, gl.DYNAMIC_DRAW );
						
				}    	
				
				// Update edge vertex positions				
				if ( this.numEdges > 0 ) this.updateEdges( );	
				
				
				// Update the particles (add into updateEdges function to reduce the number of loops)				
				// this.updateParticles( );							
				
		},
				
		// Animate the graph and draw it
		render: function ( ) {
			
				// Update the graph before drawing
				this.update();
			
				// WebGL stuff (move)
				//gl.clearColor( this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], this.backgroundColor[3] );
				gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
		       	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		
				// Define viewport
				gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
		   	 	
		   	 	// Perspective transformation
		       	mat4.perspective( 45, gl.canvas.width / gl.canvas.height, 1.0, 100000.0, GL.PMatrix );
				
				// Modelview transformation
		       	mat4.identity( GL.MVMatrix );     
		       	//mat4.translate( GL.MVMatrix, 0.0, 0.0, -50 );                  
		       	mat4.multiply( GL.MVMatrix, GL.interactor.transform, GL.MVMatrix );
			
				// Draw the graph
				this.draw ( );
				
				// Object picking
				if ( GL.interactor.rightMouseDown ) {
		       		
		       			this.handlePickedObject( );       			
		       		
		       	}  
				
				// Callback for render function
				requestAnimationFrame( this.render.bind(this) );
			   				   			   				   	 			
		},
		
		// Draw the graph
		draw: function ( ) {
			
				// Render edges ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			   	this.edgeObj.render();
			   	
			   	// Render nodes ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				this.nodeObj.render();			
				
	
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
						gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
					  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );						  						  
			   	
					   	// Because of this we will only draw after we have detected a user click
					   	//gl.bindBuffer( this.nodeObj.elementArrayBuffer[i].target, this.nodeObj.elementArrayBuffer[i].id );   	
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
				
				// Render labels using a fullscreen quad overlay
				this.labelCanvasObj.updateTexture( this.labelCanvas );
				this.labelCanvasObj.render();
			
		},
		
		/**
		 * Handling for when a node or edge is selected in the graph
		 */
		handlePickedObject: function ( ) {
	
				var width  = this.frameBufferObj.width; 
				var height = this.frameBufferObj.height;
				var x = GL.interactor.lastMouseX;
				var y = ( height - 1 ) - GL.interactor.lastMouseY;
				
				// If the mouse button is not currently being held down 
			
				if ( GL.interactor.buttonReleased ) {
					
						GL.interactor.buttonReleased = false;
									
						this.frameBufferObj.enable();	
						var pixels = new Uint8Array( width * height * 4);	
						gl.readPixels( 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels );		
						this.frameBufferObj.disable();				
						
						// if red channel of the pixel is fully red, nothing was selected 
						
						if ( pixels[ 4 * ( y * width + x ) ] == 255 ) {      
								
								// Display the name of the selected node in the top bar
								//document.getElementById( "entityText" ).innerHTML = "";
								
								// If a dialog was open, close it.
								
								//$( "#dialog" ).dialog( "close" );
								
								this.unHighlightNodeEdges( );
								this.selectedNodeId = -1;
								this.selectedEdgeId = -1;
								
								// If nothing was selected, return all nodes to their original color																
								//for ( var i=0; i < graph.numNodes; i++ ) {
																														
								//	graph.nodes[i].color = [ 1.0, 1.0, 1.0, 1.0 ];
											
								//}
								
								// temp
								//graph.particleSystem.destroy();
								
								return;
								
						}
									
						// retrieve id from color	
						var id = ( pixels[ 4 * ( y * width + x ) ]     << 24 ) +
			         		 	 ( pixels[ 4 * ( y * width + x ) + 1 ] << 16 ) +
			      	 			 ( pixels[ 4 * ( y * width + x ) + 2 ] <<  8 ) +
			      	 		 	 ( pixels[ 4 * ( y * width + x ) + 3 ]       );
		
																									
						if ( id < this.numNodes ) {      // A node was clicked by the user.												
							
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
										
										vec3.add( edge.src.position, edge.dst.position, avg_position );
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
										
										
										if ( this.nodes[ this.selectedNodeId ].position == edge.src.position ) {
											
												vec3.set( startPosition, edge.src.position[0], edge.src.position[1], edge.src.position[2] );
												vec3.set( targetPosition, edge.dst.position[0], edge.dst.position[1], edge.dst.position[2] );										
										
										} else {
											
												vec3.set( startPosition, edge.dst.position[0], edge.dst.position[1], edge.dst.position[2] );
												vec3.set( targetPosition, edge.src.position[0], edge.src.position[1], edge.src.position[2] );
																				
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
								
								// Make a request to the webservice to retrieve the documents for the selected entity-entity relationship
												
								//var request_url = "https://trex003/nlpweb/bandit/docIdsForEntity/" + g_searchvalue;   // (no service available for this yet)
						
								//docIdRequest( request_url );
		
								// Dialog placeholder text until the above webservice is available											
								//$( "#dialog" ).dialog( "open" ).text('This edge connects node ' + edge.src_node.name + ' with node ' + edge.dst_node.name + '.' );
											
						} 
																											
				} // if ( GL.interactor.buttonReleased )
				
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
				//var src_color = vec4.create();
			
				for ( var i=0; i < node.edgeIndices.length; ++i ) {
					
					index = node.edgeIndices[i];
					edge = this.edges[ node.edgeIndices[i] ];		
					
					//vec4.set( color, 0.5, 0.5, 1.0, 1.0 );
					this.edgeObj.updateColor( 8*index, edge.src.color );
					this.edgeObj.updateColor( 8*index + 4, edge.dst.color  );		
	    			
	    			/*
	    			this.edgeObj.color[ 8*node.edgeIndices[i] ]     = edge.src_color[0] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 1 ] = edge.src_color[1] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 2 ] = edge.src_color[2] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 3 ] = edge.src_color[3];
	    			
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 4 ] = edge.dst_color[0] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 5 ] = edge.dst_color[1] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 6 ] = edge.dst_color[2] * edge.weight;
	    			this.edgeObj.color[ 8*node.edgeIndices[i] + 7 ] = edge.dst_color[3];
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
						
						vec3.add( edge.src.position, edge.dst.position, avg_position );
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
						
						
						if ( this.nodes[ this.selectedNodeId ].position == edge.src.position ) {
							
								vec3.set( startPosition, edge.src.position[0], edge.src.position[1], edge.src.position[2] );
								vec3.set( targetPosition, edge.dst.position[0], edge.dst.position[1], edge.dst.position[2] );										
						
						} else {
							
								vec3.set( startPosition, edge.dst.position[0], edge.dst.position[1], edge.dst.position[2] );
								vec3.set( targetPosition, edge.src.position[0], edge.src.position[1], edge.src.position[2] );
																
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
			
		}
		
}

/**
 * @author Mike Wakid
 * This file contains graph layout methods 
 */

GL.Graph.Layout = GL.Graph.Layout || {};

GL.Graph.Layout.forceDirected = function ( graph, config ) {
	
		var STABLE_ENERGY_THRESHOLD = 1.0; // Threshold at which we can consider the system to be stabilized.
		
		this.totalKineticEnergy = 0.0;     // Total amount of energy in the system
		
		this.octree = new Octree({
			center: vec3.create(0,0,0), 
			bounds: 30000, 
			threshold: 0.5, 
			maxDepth: 5 
		});
		
		this.pause = false;
				
		config = config || {};
		
		this.settings = {
			
				/**
				 * Spring constant k for Hooke's Law (F = -kx).
				 */
				springConstant : config.springConstant ? config.springConstant : 0.008,
				
				/**
				 * The length of the spring at rest used to calculate its displacement x, in Hooke's law, from
				 * its equilibrium position.
				 */
				springLength : config.springLength ? config.springLength : 30,
				
				/**
				 * Node charge for Coulomb's Law. This value should be negative since it is used 
				 * to make nodes repel each other, otherwise positive values will make them attract.
				 */
				charge: config.charge ? config.charge : -120,
								
				/**
				 * Damping, also sometimes refered to as friction or drag, is value between (0, 1) used to slow down
				 * node velcoity by a percentage 
				 */
				damping : config.damping ? config.damping : 0.9,
				
				/**
				 * Theta is an approximation criterion for the perform Barnes-Hut algorithm. Theta is the value  
				 * in which we compare the ratio s/d to determine whether or not a cluster of bodies in a system 
				 * is sufficiently far away from the currently evaluated body.  
				 */
				theta : config.theta ? config.theta : 0.8,							
				 						
		};
		
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
						var src, dst;
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
							
								src = edges[i].src;
								dst = edges[i].dst;
							
								// Find the distance between the two nodes and find a direction vector
							
								vec3.subtract( dst.position, src.position, difference );								
								magnitude = vec3.magnitude( difference );
								distance = magnitude;
								//distance  = magnitude + 0.1; 		   				// avoid massive forces at small distances (and divide by zero)
								vec3.divide( difference, magnitude, direction );
								
								// Calculate the displacement from the current length of the spring to the spring's rest length
								
								displacement = magnitude - settings.springLength;  
								
								// Calculate the force imposed on the nodes (F = -kx)
								
								vec3.multiply( direction, settings.springConstant * displacement, force ); 
								vec3.add( src.force, force, src.force );  
								
								vec3.multiply( direction, -settings.springConstant * displacement, force ); 	
								vec3.add( dst.force, force, dst.force ); 
		
						} // end while ( i-- )
						
										
						// For each node
						i = nodes.length;
						
						while ( i-- ) {					// to optimize loop iteration (can't do it this way if id's are not a continuous sequence of integers)						
								
								src = nodes[ i ];											 				
								
								// For every other node ( Repulsive forces / Coulomb's Law )						
								for ( var j = i - 1; j >= 0; --j ) {								
									
										if ( j == i ) continue;
									
										dst = nodes[ j ];																				
																							
										vec3.subtract( dst.position, src.position, difference );								
										magnitude = vec3.magnitude( difference );
										distance = magnitude;
										//distance  = magnitude + 0.1; 		   				// avoid massive forces at small distances (and divide by zero)
										vec3.divide( difference, magnitude, direction );									
									
										// Apply repulsion force to each node								
										vec3.multiply( direction, settings.charge, force );
										vec3.divide( force, distance * distance, force );
										vec3.add( src.force, force, src.force );
										
										vec3.multiply( direction, -settings.charge, force );
										vec3.divide( force, distance * distance, force );
										vec3.add( dst.force, force, dst.force );
																																																																		
								} 				
								
								// Apply force to get acceleration					
								vec3.divide( src.force, src.mass, src.acceleration );				
								vec3.zero( src.force );
																						
								// Apply acceleration to velocity						
								//vec3.multiply( src.acceleration, 0.1, src.acceleration );   					    
		   					    vec3.add( src.velocity, src.acceleration, src.velocity );
		   					    vec3.multiply( src.velocity, 0.9, src.velocity );											
								
								// Update node position based on velocity				
								vec3.add( src.position, src.velocity, src.position );
								
								// Update total kinetic energy 
								speed = vec3.magnitude( src.velocity );				
								this.totalKineticEnergy += src.mass * speed * speed;
								
								// Update graph properties unrelated to the force-directed layout
								// This is to avoid multiple iterations over all nodes
								graph.nodeObj.setWorldPosition( i, nodes[i].position );
								
								if ( graph.renderNodeLabels ) {
										
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
										
										v = this.settings.charge * body.mass * sourceBody.mass / ( r * r * r );
										
										sourceBody.force[0] = sourceBody.force[0] + v * dx;
										sourceBody.force[1] = sourceBody.force[1] + v * dy;
										sourceBody.force[2] = sourceBody.force[2] + v * dz;
										
								}
							
						} else {
								
								dx = octant.centerOfMass[0] / octant.mass - sourceBody.position[0]; 
								dy = octant.centerOfMass[1] / octant.mass - sourceBody.position[1]; 
								dz = octant.centerOfMass[2] / octant.mass - sourceBody.position[2];							
						
								r = Math.sqrt( dx * dx + dy * dy + dz * dz );
								
								if ( ( octant.radius * 2.0 ) / r <= 5.0 ) {
										
										v = this.settings.charge * octant.mass * sourceBody.mass / ( r * r * r );
										
										sourceBody.force[0] = sourceBody.force[0] + v * dx;
										sourceBody.force[1] = sourceBody.force[1] + v * dy;
										sourceBody.force[2] = sourceBody.force[2] + v * dz;
										
								} else {
									
										if (octant.octants[0]) { queue.unshift( octant.octants[0] ); }
				                        if (octant.octants[1]) { queue.unshift( octant.octants[1] ); }
				                        if (octant.octants[2]) { queue.unshift( octant.octants[2] ); }
				                        if (octant.octants[3]) { queue.unshift( octant.octants[3] ); }
				                        if (octant.octants[4]) { queue.unshift( octant.octants[4] ); }
				                        if (octant.octants[5]) { queue.unshift( octant.octants[5] ); }
				                        if (octant.octants[6]) { queue.unshift( octant.octants[6] ); }
				                        if (octant.octants[7]) { queue.unshift( octant.octants[7] ); }
									
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
				var magnitude, distance, displacement;
				var src, dst;
				var difference = vec3.create( );
				var direction = vec3.create( );
				var force = vec3.create( );
				var acceleration = vec3.create( );
				var velocity = vec3.create( );
				
				var x = this.settings.springLength;
				var k = this.settings.springConstant;				
				
				var dx, dy, dz;													
				
				// Sum of the total kinetic energy over all particles (nodes)
				this.totalKineticEnergy = 0.0;
			
				// For each edge ( Attractive forces / Hooke's Law )	
				var i = edges.length;
		   		
				while ( i-- ) { 				// to optimize loop iteration (can't do it this way if id's are not a continuous sequence of integers)						
					
						// Get the nodes linked by the edge
					
						src = edges[i].src;
						dst = edges[i].dst;
					
						// Find the distance between the two nodes and find a direction vector
					
						dx = dst.position[0] - src.position[0]; 
						dy = dst.position[1] - src.position[1]; 
						dz = dst.position[2] - src.position[2];							
				
						distance = Math.sqrt( dx * dx + dy * dy + dz * dz );
						
						displacement = distance - x;
						
						distance = 1.0 / distance;   // this is to reduce 3 divides into 1 divice and 3 multiplies 
						
						direction[0] = dx * distance;
						direction[1] = dy * distance;
						direction[2] = dz * distance;											
						
						src.force[0] += direction[0] * k * displacement;
						src.force[1] += direction[1] * k * displacement;
						src.force[2] += direction[2] * k * displacement;
						
						dst.force[0] += -direction[0] * k * displacement;
						dst.force[1] += -direction[1] * k * displacement;
						dst.force[2] += -direction[2] * k * displacement;
	
		
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
									
						src = nodes[i];
																
						// get supernode
						nodes[i].totalforces = 0;					
												
						this.calculateRepulsiveForces( src, this.octree.root );
						
						totalForces += nodes[i].totalforces;
						
						// Apply force to get acceleration	
						var oneovermass = 1.0 / src.mass;
						
						src.acceleration[0] = src.force[0] * oneovermass;
						src.acceleration[1] = src.force[1] * oneovermass;
						src.acceleration[2] = src.force[2] * oneovermass; 
						
						// Calculated force value is no longer needed, zero it out for the next iteration								
						vec3.zero( src.force );
																				
						// Apply acceleration to velocity and apply damping to the velocity							
						src.velocity[0] = ( src.velocity[0] + src.acceleration[0] ) * this.settings.damping;
						src.velocity[1] = ( src.velocity[1] + src.acceleration[1] ) * this.settings.damping;
						src.velocity[2] = ( src.velocity[2] + src.acceleration[2] ) * this.settings.damping;
						
						// Update node position based on velocity					
						src.position[0] += src.velocity[0];
						src.position[1] += src.velocity[1];
						src.position[2] += src.velocity[2];																																	
						
						// update bounds (this is to assist the tree construction)						
						if ( src.position[0] < this.bounds.minX ) this.bounds.minX = src.position[0];
						if ( src.position[0] > this.bounds.maxX ) this.bounds.maxX = src.position[0];
						if ( src.position[1] < this.bounds.minY ) this.bounds.minY = src.position[1];
						if ( src.position[1] > this.bounds.maxY ) this.bounds.maxY = src.position[1];
						if ( src.position[2] < this.bounds.minZ ) this.bounds.minZ = src.position[2];
						if ( src.position[2] > this.bounds.maxZ ) this.bounds.maxZ = src.position[2];	
					
						//vec3.add( this.center, src.position, this.center );
										
						// Update total kinetic energy 
						speed = vec3.magnitude( src.velocity );				
						this.totalKineticEnergy += src.mass * speed * speed;
						
						// Update graph properties unrelated to the force-directed layout
						// This is to avoid multiple iterations over all nodes
						graph.nodeObj.setWorldPosition( i, nodes[i].position );
						
						if ( graph.renderNodeLabels ) {
								
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
				//this.totalKineticEnergy += src.mass * speed * speed;		
				
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
			threshold: config.threshold ? config.threshold : 0.1,
			maxDepth:  config.maxDepth ? config.maxDepth : 5
		}
	
		this.root = null; 
		this.threshold = config.threshold;
		this.maxDepth = config.maxDepth;
	
}

Octree.prototype = {

  	bounds: vec3.create(),
  	
  	// 1. If node x does not contain a body, put the new body b here.
	// 2. If node x is an internal node, update the center-of-mass and total mass of x. Recursively insert the body b in the appropriate quadrant.
    // 3. If node x is an external node, say containing a body named c, then there are two bodies b and c in the same region. Subdivide the region 
    // 	  further by creating four children. Then, recursively insert both b and c into the appropriate quadrant(s). Since b and c may still end up
    //    in the same quadrant, there may be several subdivisions during a single insertion. Finally, update the center-of-mass and total mass of x.

  	insertBody: function ( body, octant ) {
  		
  			if ( octant.depth > this.maxDepth) {
  				this.maxDepth = octant.depth;
  				console.log( this.maxDepth);
  			}
  			
  			// 2. If node x is an internal node, update the center-of-mass and total mass of x. Recursively insert the body b in the appropriate quadrant.
  			if ( octant.isInternal ) {          // this is an internal node
  				
  					// Update the center of mass and mass of the node
  					//var oldBody = octant.body;
  					//octant.body = null;
  					
  					vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
  					octant.mass += octant.mass;
  			
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
  					
  			} else if ( octant.body ) {
  			
  			// 3. If node x is an external node, say containing a body named c, then there are two bodies b and c in the same region. Subdivide the region 
		    // 	  further by creating four children. Then, recursively insert both b and c into the appropriate quadrant(s). Since b and c may still end up
		    //    in the same quadrant, there may be several subdivisions during a single insertion. Finally, update the center-of-mass and total mass of x.
  			//if ( octant.octants.length == 0 && octant.body != body ) {      // if the node is an external node and contains a body
  					
  					// Subdivide the region (create 8 children)
  					octant.subdivide( );
  					
  					var oldBody = octant.body;
  					octant.body = null; 
  					
  					vec3.add( octant.centerOfMass, body.position, octant.centerOfMass );  
  					octant.mass += body.mass;
  					
  					vec3.add( octant.centerOfMass, oldBody.position, octant.centerOfMass );  
  					octant.mass += oldBody.mass;
  					/*
  					var code = 0;
  					
  					if ( body.position[0] > octant.center[0] ) code |= 1;
  					if ( body.position[1] > octant.center[1] ) code |= 2;
  					if ( body.position[2] > octant.center[2] ) code |= 4;
  					
  					if ( octant.octants[code] == null ) {
  						
  							octant.addChild( code );
  						
  					}
  					*/
  					this.insertBody( body, octant );
  					/*
  					code = 0;
  					
  					if ( oldBody.position[0] > octant.center[0] ) code |= 1;
  					if ( oldBody.position[1] > octant.center[1] ) code |= 2;
  					if ( oldBody.position[2] > octant.center[2] ) code |= 4;
  					
  					if ( octant.octants[code] == null ) {
  						
  							octant.addChild( code );
  						
  					}
  					*/	
  					this.insertBody( oldBody, octant );
  				
  			} else {    // 1. If node x does not contain a body, put the new body b here.
  				  					
  					octant.body = body;
  					
  					//vec3.add( octant.centerOfMass, body.position, octant.centerOfMass ); // still need to divide by the average number of bodys in the octant  
		  			//octant.mass += body.mass;
		  					
		  			//++octant.numContainedPoints;
  				
  			}
  			
  			//return;
  			
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
		  			//	console.log( this.maxDepth);
		  			}
                    
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
		  					
		  					
		  					if ( !octant.octants[ octIndex ] ) {
		  							
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
                    	
                    		// Node has no body. Put it in here.
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
		   	gl.drawElements( gl.LINES, g_octreeObj.elementArrayBuffer.count, gl.UNSIGNED_SHORT, 0 );
		  	   	
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
		
			program = g_octreeObj.shaderProgram[0];   		   		
	       	gl.useProgram( program );
				 								   	
		   	vertexAttribArrayBuffers = g_octreeObj.vertexAttribArrayBuffers;
		   	attributes = g_octreeObj.shaderProgram[0].attributes;   
		   	
		   	// Enable vertex buffer objects   					   			
		   	gl.bindBuffer( vertexAttribArrayBuffers[ 'position' ].target, vertexAttribArrayBuffers[ 'position' ].id );	 
		   	gl.enableVertexAttribArray( attributes[ 'position' ] );  			
		   	gl.vertexAttribPointer( attributes[ 'position' ], vertexAttribArrayBuffers[ 'position' ].size, gl.FLOAT, false, 0, 0);
		   	
		   	gl.bindBuffer( vertexAttribArrayBuffers[ 'color' ].target, vertexAttribArrayBuffers[ 'color' ].id );	 
		   	gl.enableVertexAttribArray( attributes[ 'color' ] );  			
		   	gl.vertexAttribPointer( attributes[ 'color' ], vertexAttribArrayBuffers[ 'color' ].size, gl.FLOAT, false, 0, 0);
	  
		   	
		   	// Bind uniforms 
			gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
		  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
		  	
		 	gl.bindBuffer( g_octreeObj.elementArrayBuffer.target, g_octreeObj.elementArrayBuffer.id );
		  	
		  	this.recursiveDraw( octree.root );
		  	//this.iterativeDraw( );	  		   		
	
	       	// Disable vertex buffer objects       	
			gl.disableVertexAttribArray( attributes[ 'position' ] );
			gl.disableVertexAttribArray( attributes[ 'color' ] ); 
		
	}
	

};




/**
 * @author Mike Wakid
 * Functions to read JSON responses from various web services  
 *  Twitter
 * 	YouTube
 * NOTE: This section is not currently functional!
 */

function handleTwitterResponse ( response ) {
	
		var data = JSON.parse( response );
		console.log( data );
		
		for ( var i=0; i < data.items.length; i++ ) {
		
				var node = new Node({
					id: fdgraph.numNodes,
					name: data.items[i].snippet.title,
					textureUrl: "twitter-bird-light-bgs.png"
					//textureUrl: data.items[i].snippet.thumbnails.medium.url
				});
				
				fdgraph.addNode( node );
				
				
		
		}
		
		fdgraph.addEdge( new Node({id:0, name:"0"}), new Node({id:0, name:"0"}) );
		fdgraph.numEdges = 0;
		
		/*
		fdgraph.addEdge( node1, node2 );
				
		console.log( 'This graph has ' + fdgraph.numNodes + ' nodes and ' + fdgraph.numEdges + ' edges.');
		
		fdgraph.edgeObj.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( fdgraph.edgeObj.vertices ), 3, 2 * fdgraph.numNodes, gl.STREAM_DRAW );        
        fdgraph.edgeObj.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( fdgraph.edgeObj.color ), 4, 2 * fdgraph.numNodes, gl.DYNAMIC_DRAW );    
        fdgraph.edgeObj.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( fdgraph.edgeObj.indices ), 1, 2 * fdgraph.numEdges, gl.STATIC_DRAW ); 
	
		fdgraph.simulate = true;
		*/
}


function handleYouTubeResponse ( response ) {
	
		var data = JSON.parse( response );
		console.log( data );
		
		for ( var i=0; i < data.items.length; i++ ) {
		
				var node = new Node({
					id: fdgraph.numNodes,
					name: data.items[i].snippet.title,
					textureUrl: "textures/twitter-bird-light-bgs.png"
					//textureUrl: data.items[i].snippet.thumbnails.medium.url
				});
				
				fdgraph.addNode( node );
				
				
		
		}
		
		fdgraph.addEdge( new Node({id:0, name:"0"}), new Node({id:0, name:"0"}) );
		fdgraph.numEdges = 0;
		
		/*
		fdgraph.addEdge( node1, node2 );
				
		console.log( 'This graph has ' + fdgraph.numNodes + ' nodes and ' + fdgraph.numEdges + ' edges.');
		
		fdgraph.edgeObj.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( fdgraph.edgeObj.vertices ), 3, 2 * fdgraph.numNodes, gl.STREAM_DRAW );        
        fdgraph.edgeObj.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( fdgraph.edgeObj.color ), 4, 2 * fdgraph.numNodes, gl.DYNAMIC_DRAW );    
        fdgraph.edgeObj.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( fdgraph.edgeObj.indices ), 1, 2 * fdgraph.numEdges, gl.STATIC_DRAW ); 
	
		fdgraph.simulate = true;
		*/
}

/**
 * @author Mike Wakid
 * This file contains methods for generating graphs with no data
 */
GL.Graph.GraphGenerator = {
/*	
		// Grid
		function createGrid ( ) {
			
				var node, src, dst;
			
				var extent = 20;
			
				// grid graph
				
				// Create nodes
				for ( var i=0; i < extent*extent; i++ ) {
					
						var data = {
					 	 	id: i,
					 	 	name: i
					 	 };
					
						fdgraph.addNode( new Node( data ) );
						fdgraph.nodes[i].assignColorId();
						
						console.log(fdgraph.nodes[i].id + ' ' + fdgraph.nodes[i].colorId[0] + ' ' + fdgraph.nodes[i].colorId[1] + ' ' + fdgraph.nodes[i].colorId[2] + ' ' + fdgraph.nodes[i].colorId[3] );
						
				}
				
				// Create edges ( forms a grid )
				for ( var i=0; i < extent - 1; i++ ) {
						
						for ( var j=0; j < extent - 1; j++ ) {
							
								src = fdgraph.nodes[ i*extent + j];
								dst = fdgraph.nodes[ i*extent + 1 + j];
							
								fdgraph.addEdge( src, dst );
								
								dst = fdgraph.nodes[ (i + 1)*extent + j];
							
								fdgraph.addEdge( src, dst );
						}
						
				}
				
				for ( var i=0; i < extent - 1; i++ ) {
					
						src = fdgraph.nodes[ (extent - 1)*extent + i ];
						dst = fdgraph.nodes[ (extent - 1)*extent + i + 1 ];
						
						fdgraph.addEdge( src, dst );
						
						src = fdgraph.nodes[ i*extent      +  (extent - 1) ];
						dst = fdgraph.nodes[ (i + 1)*extent + (extent - 1) ];
						
						fdgraph.addEdge( src, dst );
				}
			
				fdgraph.edgeObj.vertexAttribArrayBuffers['position'] = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( fdgraph.edgeObj.vertices ), 3, 2 * fdgraph.numNodes, gl.STREAM_DRAW );        
		        fdgraph.edgeObj.vertexAttribArrayBuffers['color']    = initBufferObject( gl.ARRAY_BUFFER, new Float32Array( fdgraph.edgeObj.color ), 4, 2 * fdgraph.numNodes, gl.DYNAMIC_DRAW );    
		        fdgraph.edgeObj.elementArrayBuffer = initBufferObject( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( fdgraph.edgeObj.indices ), 1, 2 * fdgraph.numEdges, gl.STATIC_DRAW ); 
			
				fdgraph.simulate = true;
				
				// build octree and debug
				//for (var i=0; i < fdgraph.nodes.length; ++i)
				//	octree.root.containedPoints[i] = vec3.create(fdgraph.nodes[i].position[0], fdgraph.nodes[i].position[1], fdgraph.nodes[i].position[2] );
					
				//octree.build( octree.root );
				//octree.constructBarnesHutTree( fdgraph.nodes );
		}
		
		// Loop
		function createLoop ( ) {
			
				var numNodes = 500;
				
				for (var i=0; i < numNodes; ++i) {
					 
					 	 var data = {
					 	 	id: i,
					 	 	name: i
					 	 };
					 	 
						 fdgraph.addNode( new Node( data ) );
						 fdgraph.nodes[i].assignIdColor();
					 
				}
					
				for (var i=0; i < numNodes-1; ++i)	
					fdgraph.addEdge( fdgraph.nodes[i], fdgraph.nodes[i+1] );
					
				fdgraph.addEdge( fdgraph.nodes[numNodes-1], fdgraph.nodes[0] );
				
				fdgraph.simulate = true;
				
				// build octree and debug
				//octree.constructBarnesHutTree( fdgraph.nodes );
				
				// Add labels to graph
				//Graph.LabelManager.addLabels( fdgraph );
			
		}
*/
};

/**
 * @author Mike Wakid
 * This file contains methods to control graph node and edge labeling using HTML elements
 * Note: This method does not work well for 3D since labels will be visible even if they
 *   should be occluded
 */
/*
GL.Graph.LabelManager = {
	
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
		gl.uniformMatrix4fv( program.pMatrixUniform,  false, GL.PMatrix );
	  	gl.uniformMatrix4fv( program.mvMatrixUniform, false, GL.MVMatrix );	  
	  		  	     			   		   	 	   		  	   		    
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
	
	
