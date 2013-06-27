// Description: This shader is used for rendering textured nodes (e.g. person, document, event) with labeling. 
// Therefore this shader takes two textures as input, one representing the entity categorization and
// a second label texture generated with the name of the node.
// 
// Note: Nodes for this shader are NOT packed into a single draw call, therefore the rendering could probably be
// optimized further.

attribute vec3  aPosition;
attribute vec4  aColor;
attribute vec2  aTexCoords;

uniform mat4  uMVMatrix;
uniform mat4  uPMatrix;
uniform vec3  uWorldPos;
uniform float uScale;

varying vec2 vTexCoords;
varying vec4 vColor;

void main ( void ) {
								
		mat3 iMVMatrix = mat3 ( uMVMatrix[0][0], uMVMatrix[1][0], uMVMatrix[2][0],
								uMVMatrix[0][1], uMVMatrix[1][1], uMVMatrix[2][1],		
								uMVMatrix[0][2], uMVMatrix[1][2], uMVMatrix[2][2] );									
		
		vec3 newVertexPosition = iMVMatrix * aPosition * uScale;		                
	
		gl_Position = uPMatrix * uMVMatrix * vec4( newVertexPosition + uWorldPos, 1.0 );		
		vTexCoords = aTexCoords;
		vColor = aColor;
		
}