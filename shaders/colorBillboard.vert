// Description: This shader is used for rendering the id color assigned to a node for picking. 
// 
// Note: Nodes for this shader are NOT packed into a single draw call, therefore the rendering could probably be
// optimized further.

attribute vec3  aPosition;

uniform mat4  uMVMatrix;
uniform mat4  uPMatrix;
uniform vec3  uWorldPos;
uniform float uScale;


void main ( void ) {
								
		mat3 iMVMatrix = mat3 ( uMVMatrix[0][0], uMVMatrix[1][0], uMVMatrix[2][0],
								uMVMatrix[0][1], uMVMatrix[1][1], uMVMatrix[2][1],		
								uMVMatrix[0][2], uMVMatrix[1][2], uMVMatrix[2][2] );									
		
		vec3 newVertexPosition = iMVMatrix * aPosition * uScale;		                
	
		gl_Position = uPMatrix * uMVMatrix * vec4( newVertexPosition + uWorldPos, 1.0 );		
		
}