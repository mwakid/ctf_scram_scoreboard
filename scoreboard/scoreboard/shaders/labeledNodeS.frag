// Description: This shader is used for rendering textured nodes (e.g. person, document, event) with labeling. 
// Therefore this shader takes two textures as input, one representing the entity categorization and
// a second label texture generated with the name of the node.
// 
// Note: Nodes for this shader are NOT packed into a single draw call, therefore the rendering could probably be
// optimized further.

precision highp float;

uniform sampler2D uEntityTexture;
uniform sampler2D uLabelTexture;
uniform vec4 uColor;

varying vec2 vTexCoords;
varying vec4 vColor;

void main ( void ) {
	
		//vec4 entityTextureColor = texture2D( uEntityTexture, vec2( vTexCoords.s, vTexCoords.t ) );
		vec4 labelTextureColor  = texture2D( uLabelTexture, vec2( vTexCoords.s, vTexCoords.t ) );
		
		//entityTextureColor.rgb = entityTextureColor.rgb * (1.0 - labelTextureColor.a);
		//labelTextureColor.rgb  = labelTextureColor.rgb  * labelTextureColor.a;  
		
		gl_FragColor = texture2D( uEntityTexture, vec2( vTexCoords.s, vTexCoords.t ) ) * (1.0 - labelTextureColor.a) + labelTextureColor * labelTextureColor.a;	
		//gl_FragColor = vColor * (1.0 - labelTextureColor.a) + labelTextureColor * labelTextureColor.a;
					
}