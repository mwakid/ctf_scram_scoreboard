attribute vec3 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTexCoord;

void main(void) {
	
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
		vTexCoord = aTexCoord;
		
}