import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

var root = $.from_html(`<div class="relative h-full w-full overflow-hidden"></div>`);

export default function Plasma($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, '#ffffff'),
		speed = $.prop($$props, 'speed', 3, 1),
		direction = $.prop($$props, 'direction', 3, 'forward'),
		scale = $.prop($$props, 'scale', 3, 1),
		opacity = $.prop($$props, 'opacity', 3, 1),
		mouseInteractive = $.prop($$props, 'mouseInteractive', 3, true);

	const current = $.derived(() => ({
		color: color(),
		speed: speed(),
		direction: direction(),
		scale: scale(),
		opacity: opacity(),
		mouseInteractive: mouseInteractive()
	}));

	let container;

	const hexToRgb = (hex) => {
		const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex);

		if (!result) return [1, 0.5, 0.2];

		return [
			parseInt(result[1], 16) / 255,
			parseInt(result[2], 16) / 255,
			parseInt(result[3], 16) / 255
		];
	};

	const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

	onMount(() => {
		let renderer;

		try {
			renderer = new Renderer({
				webgl: 2,
				alpha: true,
				antialias: false,
				dpr: Math.min(window.devicePixelRatio || 1, 2)
			});
		} catch {
			return;
		}

		const gl = renderer.gl;

		gl.clearColor(0, 0, 0, 0);

		const canvas = gl.canvas;

		canvas.style.display = 'block';
		canvas.style.width = '100%';
		canvas.style.height = '100%';

		// eslint-disable-next-line svelte/no-dom-manipulating
		container.appendChild(canvas);

		const geometry = new Triangle(gl);
		const useCustomColor = $.get(current).color ? 1.0 : 0.0;
		const customColorRgb = $.get(current).color ? hexToRgb($.get(current).color) : [1, 1, 1];
		const directionMultiplier = $.get(current).direction === 'reverse' ? -1.0 : 1.0;

		const program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				iTime: { value: 0 },
				iResolution: { value: new Float32Array([1, 1]) },
				uCustomColor: { value: new Float32Array(customColorRgb) },
				uUseCustomColor: { value: useCustomColor },
				uSpeed: { value: $.get(current).speed * 0.4 },
				uDirection: { value: directionMultiplier },
				uScale: { value: $.get(current).scale },
				uOpacity: { value: $.get(current).opacity },
				uMouse: { value: new Float32Array([0, 0]) },
				uMouseInteractive: { value: $.get(current).mouseInteractive ? 1.0 : 0.0 }
			}
		});

		const mesh = new Mesh(gl, { geometry, program });

		function handleMouseMove(e) {
			if (!$.get(current).mouseInteractive) return;

			const rect = container.getBoundingClientRect();
			const mouseUniform = program.uniforms.uMouse.value;

			mouseUniform[0] = e.clientX - rect.left;
			mouseUniform[1] = e.clientY - rect.top;
		}

		container.addEventListener('mousemove', handleMouseMove);

		const setSize = () => {
			const rect = container.getBoundingClientRect();
			const width = Math.max(1, Math.floor(rect.width));
			const height = Math.max(1, Math.floor(rect.height));

			renderer.setSize(width, height);

			const res = program.uniforms.iResolution.value;

			res[0] = gl.drawingBufferWidth;
			res[1] = gl.drawingBufferHeight;
		};

		const ro = new ResizeObserver(setSize);

		ro.observe(container);
		setSize();

		let raf = 0;
		let contextLost = false;
		let isVisible = true;
		const t0 = performance.now();

		const loop = (t) => {
			if (contextLost || !isVisible) return;

			const c = $.get(current);
			const customRgb = c.color ? hexToRgb(c.color) : [1, 1, 1];

			program.uniforms.uCustomColor.value.set(customRgb);
			program.uniforms.uUseCustomColor.value = c.color ? 1.0 : 0.0;
			program.uniforms.uSpeed.value = c.speed * 0.4;
			program.uniforms.uScale.value = c.scale;
			program.uniforms.uOpacity.value = c.opacity;
			program.uniforms.uMouseInteractive.value = c.mouseInteractive ? 1.0 : 0.0;

			const timeValue = (t - t0) * 0.001;

			if (c.direction === 'pingpong') {
				const pingpongDuration = 10;
				const segmentTime = timeValue % pingpongDuration;
				const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
				const u = segmentTime / pingpongDuration;
				const smooth = u * u * (3 - 2 * u);

				const pingpongTime = isForward
					? smooth * pingpongDuration
					: (1 - smooth) * pingpongDuration;

				program.uniforms.uDirection.value = 1.0;
				program.uniforms.iTime.value = pingpongTime;
			} else {
				program.uniforms.uDirection.value = c.direction === 'reverse' ? -1.0 : 1.0;
				program.uniforms.iTime.value = timeValue;
			}

			renderer.render({ scene: mesh });
			raf = requestAnimationFrame(loop);
		};

		const handleContextLost = (e) => {
			e.preventDefault();
			contextLost = true;
			cancelAnimationFrame(raf);
		};

		const handleContextRestored = () => {
			contextLost = false;

			if (isVisible) {
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(loop);
			}
		};

		canvas.addEventListener('webglcontextlost', handleContextLost);
		canvas.addEventListener('webglcontextrestored', handleContextRestored);

		const io = new IntersectionObserver(
			([entry]) => {
				const wasVisible = isVisible;

				isVisible = entry.isIntersecting;

				if (isVisible && !wasVisible && !contextLost) {
					cancelAnimationFrame(raf);
					raf = requestAnimationFrame(loop);
				}
			},
			{ threshold: 0 }
		);

		io.observe(container);
		raf = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			canvas.removeEventListener('webglcontextlost', handleContextLost);
			canvas.removeEventListener('webglcontextrestored', handleContextRestored);
			container.removeEventListener('mousemove', handleMouseMove);

			try {
				// eslint-disable-next-line svelte/no-dom-manipulating
				container.removeChild(canvas);
			} catch {
				/* noop */
			}
		};
	});

	var div = root();

	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, div);
	$.pop();
}