// Description: This shader is used for rendering the id color assigned to a node for picking. 
// 
// Note: Nodes for this shader are packed into a single draw call

attribute vec3 aPosition;
attribute vec3 aWorldPos;
attribute vec4 aColor;
attribute float aVisible;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;
varying float vVisible;

void main ( void ) {
								
		mat3 iMVMatrix = mat3 ( uMVMatrix[0][0], uMVMatrix[1][0], uMVMatrix[2][0],
								uMVMatrix[0][1], uMVMatrix[1][1], uMVMatrix[2][1],		
								uMVMatrix[0][2], uMVMatrix[1][2], uMVMatrix[2][2] );
		
		vec3 newVertexPosition = iMVMatrix * aPosition;		                
	
        gl_Position = uPMatrix * uMVMatrix * vec4( newVertexPosition + aWorldPos, 1.0 );
        vColor = aColor;
        vVisible = aVisible;
}