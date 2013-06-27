// Description: This shader is for rendering label objects, for example, a quad with a canvas texture containing text on it. It is similar to the billboard shader will the exception of some code in the fragment shader.

precision highp float;

uniform sampler2D uTexture;
uniform vec4 uColor;

varying vec2 vTexCoords;





void main ( void ) {

        // Get the color from the canvas texture
        vec4 texColor = texture2D( uTexture, vec2( vTexCoords.s, vTexCoords.t ) );
        
        // For the part of the texture containing no text
        if (texColor.a < 0.1) discard;

        // Set the fragment color to the final result (probably shouldn't need uColor here
		gl_FragColor = texColor * uColor;
					
}