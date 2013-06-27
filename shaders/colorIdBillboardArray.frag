// Description: This shader is used for rendering the id color assigned to a node for picking. 
// 
// Note: Nodes for this shader are NOT packed into a single draw call.

precision highp float;

varying vec4 vColorId;
varying float vVisible;

void main ( void ) {
    
        if (vVisible == 0.0) discard;
	
        gl_FragColor = vColorId;
				
}