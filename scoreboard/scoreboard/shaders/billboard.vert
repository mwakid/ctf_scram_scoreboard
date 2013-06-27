attribute vec3  aPosition;
attribute vec2  aTexCoords;

uniform mat4  uMVMatrix;
uniform mat4  uPMatrix;
uniform vec3  uWorldPos;
uniform float uScale;

varying vec2 vTexCoords;





void main ( void ) {
								
		mat3 iMVMatrix = mat3 ( uMVMatrix[0][0], uMVMatrix[1][0], uMVMatrix[2][0],
								uMVMatrix[0][1], uMVMatrix[1][1], uMVMatrix[2][1],		
								uMVMatrix[0][2], uMVMatrix[1][2], uMVMatrix[2][2] );									
		
		vec3 newVertexPosition = iMVMatrix * aPosition * uScale;		                
	
		gl_Position = uPMatrix * uMVMatrix * vec4( newVertexPosition + uWorldPos, 1.0 );		
		vTexCoords = aTexCoords;
		
}