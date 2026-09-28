import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

var root = $.from_html(`<div class="h-full w-full"></div>`);

export default function LiquidChrome($$anchor, $$props) {
	$.push($$props, true);

	let baseColor = $.prop($$props, 'baseColor', 19, () => [0.1, 0.1, 0.1]),
		speed = $.prop($$props, 'speed', 3, 0.2),
		amplitude = $.prop($$props, 'amplitude', 3, 0.5),
		frequencyX = $.prop($$props, 'frequencyX', 3, 3),
		frequencyY = $.prop($$props, 'frequencyY', 3, 2),
		interactive = $.prop($$props, 'interactive', 3, true);

	const current = $.derived(() => ({
		baseColor: baseColor(),
		speed: speed(),
		amplitude: amplitude(),
		frequencyX: frequencyX(),
		frequencyY: frequencyY(),
		interactive: interactive()
	}));

	let container;

	const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;
varying vec2 vUv;

vec4 renderImage(vec2 uvCoord) {
    vec2 fragCoord = uvCoord * uResolution.xy;
    vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

    for (float i = 1.0; i < 10.0; i++){
        uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
        uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
    }

    vec2 diff = (uvCoord - uMouse);
    float dist = length(diff);
    float falloff = exp(-dist * 20.0);
    float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
    uv += (diff / (dist + 0.0001)) * ripple * falloff;

    vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
    return vec4(color, 1.0);
}

void main() {
    vec4 col = vec4(0.0);
    int samples = 0;
    for (int i = -1; i <= 1; i++){
        for (int j = -1; j <= 1; j++){
            vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
            col += renderImage(vUv + offset);
            samples++;
        }
    }
    gl_FragColor = col / float(samples);
}
`;

	onMount(() => {
		const renderer = new Renderer({ antialias: true, alpha: true, premultipliedAlpha: false });
		const gl = renderer.gl;

		gl.clearColor(0, 0, 0, 0);

		const geometry = new Triangle(gl);

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: {
					value: new Float32Array([
						gl.canvas.width,
						gl.canvas.height,
						gl.canvas.width / gl.canvas.height
					])
				},
				uBaseColor: { value: new Float32Array($.get(current).baseColor) },
				uAmplitude: { value: $.get(current).amplitude },
				uFrequencyX: { value: $.get(current).frequencyX },
				uFrequencyY: { value: $.get(current).frequencyY },
				uMouse: { value: new Float32Array([0, 0]) }
			}
		});

		const mesh = new Mesh(gl, { geometry, program });

		function resize() {
			renderer.setSize(container.offsetWidth, container.offsetHeight);

			const r = program.uniforms.uResolution.value;

			r[0] = gl.canvas.width;
			r[1] = gl.canvas.height;
			r[2] = gl.canvas.width / gl.canvas.height;
		}

		window.addEventListener('resize', resize);
		resize();

		function handleMouseMove(event) {
			if (!$.get(current).interactive) return;

			const rect = container.getBoundingClientRect();
			const mu = program.uniforms.uMouse.value;

			mu[0] = (event.clientX - rect.left) / rect.width;
			mu[1] = 1 - (event.clientY - rect.top) / rect.height;
		}

		function handleTouchMove(event) {
			if (!$.get(current).interactive || event.touches.length === 0) return;

			const touch = event.touches[0];
			const rect = container.getBoundingClientRect();
			const mu = program.uniforms.uMouse.value;

			mu[0] = (touch.clientX - rect.left) / rect.width;
			mu[1] = 1 - (touch.clientY - rect.top) / rect.height;
		}

		container.addEventListener('mousemove', handleMouseMove);
		container.addEventListener('touchmove', handleTouchMove);

		// eslint-disable-next-line svelte/no-dom-manipulating
		container.appendChild(gl.canvas);

		let raf = 0;

		function update(t) {
			raf = requestAnimationFrame(update);

			const c = $.get(current);

			program.uniforms.uBaseColor.value.set(c.baseColor);
			program.uniforms.uAmplitude.value = c.amplitude;
			program.uniforms.uFrequencyX.value = c.frequencyX;
			program.uniforms.uFrequencyY.value = c.frequencyY;
			program.uniforms.uTime.value = t * 0.001 * c.speed;
			renderer.render({ scene: mesh });
		}

		raf = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			container.removeEventListener('mousemove', handleMouseMove);
			container.removeEventListener('touchmove', handleTouchMove);

			// eslint-disable-next-line svelte/no-dom-manipulating
			if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);

			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});

	var div = root();

	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, div);
	$.pop();
}