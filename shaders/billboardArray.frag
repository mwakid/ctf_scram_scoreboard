precision highp float;

uniform sampler2D uTexture;

varying vec4 vColor;
varying vec2 vTexCoords;
varying float vVisible;
//varying vec4 vColorIds;

void main ( void ) {

		if (vVisible == 0.0) discard;
	
		gl_FragColor = texture2D( uTexture, vTexCoords ) * vColor;
		//gl_FragColor = texture2D( uTexture, vTexCoords );
		
		// when multiple render targets are available, output the color Ids to the second color buffer
		//gl_FragColor[1] = vColorIds;
					
}