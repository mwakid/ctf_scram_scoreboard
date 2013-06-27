precision highp float;

uniform sampler2D uSampler;

varying vec2 vTexCoord;

void main(void) {
	
		vec4 textureColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));
		gl_FragColor = vec4(textureColor.rgb, textureColor.a);	
	
}