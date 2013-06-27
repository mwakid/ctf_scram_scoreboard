// Description: This shader is used for rendering the id color assigned to a node for picking. 
// 
// Note: Nodes for this shader are NOT packed into a single draw call, therefore the rendering could probably be
// optimized further.

precision highp float;

uniform vec4 uColor;

void main ( void ) {
	
		gl_FragColor = uColor;				
				
}