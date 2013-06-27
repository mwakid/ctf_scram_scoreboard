precision highp float;

uniform sampler2D uTexture;
uniform vec4 uColor;

varying vec2 vTexCoords;





void main ( void ) {

		gl_FragColor = texture2D( uTexture, vec2( vTexCoords.s, vTexCoords.t ) ) * uColor;
					
}