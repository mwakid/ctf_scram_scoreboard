attribute vec3 aPosition;
attribute vec4 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 uTranslate;
uniform float uScale;

varying vec4 vColor;
  	  	    	
void main(void) {  		
	   	
	   	vec3 newPosition;		
	   	newPosition = aPosition * uScale + uTranslate;
	   	//newPosition = newPosition + uTranslate;	   
	   	
	   	//uMVMatrix[12] += uTranslate.x;
	   	//uMVMatrix[13] += uTranslate.y;
	   	//uMVMatrix[14] += uTranslate.z;
	   	
	   	gl_Position = uPMatrix * uMVMatrix * vec4( newPosition, 1.0 );	   	
		vColor = aColor;

}  
