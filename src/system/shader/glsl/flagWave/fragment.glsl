// Based on Bruno Simon's Three.js Journey course.
// https://threejs-journey.com/

uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;

void main() {
	vec4 textureColor = texture2D(uTexture, vUv);
	textureColor.rgb *= vElevation * 2.0 + 0.65;
	gl_FragColor = textureColor;
}