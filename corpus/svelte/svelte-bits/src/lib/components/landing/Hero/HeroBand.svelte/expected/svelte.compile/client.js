import 'svelte/internal/disclose-version';
import * as THREE from 'three';
import * as $ from 'svelte/internal/client';

const frag = `
precision mediump float;
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform vec3 uColor;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform float uNoise;
uniform float uBandWidth;
uniform float uYOffset;
uniform float uFadeTop;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform int uIterations;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 uv = vUv;
  uv.y += uYOffset;
  vec2 p = uv * 2.0 - 1.0;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  float aspect = uCanvas.x / uCanvas.y;
  vec2 q = vec2(rp.x * aspect, rp.y);
  float invScale = 1.0 / max(uScale, 0.0001);
  q *= invScale;
  q /= 0.5 + 0.2 * dot(q, q);
  q += (uPointer - rp) * uMouseInfluence * 0.2;
  q += 0.2 * cos(t) - 7.56;

  for (int i = 0; i < 5; i++) {
    if (i >= uIterations) break;
    vec2 r = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q = q + (r - q) * uWarpStrength;
  }

  float m = length(q + sin(5.0 * q.y * uFrequency - 3.0 * t) * 0.25);

  float w = 1.0 - exp(-6.0 / exp(6.0 * m));
  w = pow(clamp(w, 0.0, 1.0), uBandWidth);
  w *= smoothstep(uFadeTop, 0.0, vUv.y);
  w *= uIntensity;

  vec3 col = uColor * w;
  col += (fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0) * w;

  gl_FragColor = vec4(col, w);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

function toVec3(hex) {
	const h = hex.replace('#', '').trim();

	return new THREE.Vector3(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
}

var root = $.from_html(`<div></div>`);

export default function HeroBand($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		color = $.prop($$props, 'color', 3, '#FF3E00'),
		rotation = $.prop($$props, 'rotation', 3, 0),
		speed = $.prop($$props, 'speed', 3, 0.2),
		scale = $.prop($$props, 'scale', 3, 1),
		frequency = $.prop($$props, 'frequency', 3, 1),
		warpStrength = $.prop($$props, 'warpStrength', 3, 11),
		noise = $.prop($$props, 'noise', 3, 0.05),
		bandWidth = $.prop($$props, 'bandWidth', 3, 1.4),
		yOffset = $.prop($$props, 'yOffset', 3, 0),
		fadeTop = $.prop($$props, 'fadeTop', 3, 0.3),
		mouseInfluence = $.prop($$props, 'mouseInfluence', 3, 0.3),
		iterations = $.prop($$props, 'iterations', 3, 1),
		intensity = $.prop($$props, 'intensity', 3, 1.0);

	let container;
	let renderer = null;
	let material = null;
	let resizeObserver = null;
	let raf = null;
	const pointerTarget = new THREE.Vector2(0, 0);
	const pointerCurrent = new THREE.Vector2(0, 0);
	let rect = { left: 0, top: 0, width: 1, height: 1 };

	$.user_effect(() => {
		const currentContainer = container;

		if (!currentContainer) return;

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const geometry = new THREE.PlaneGeometry(2, 2);

		material = new THREE.ShaderMaterial({
			vertexShader: vert,
			fragmentShader: frag,
			uniforms: {
				uCanvas: { value: new THREE.Vector2(1, 1) },
				uTime: { value: 0 },
				uSpeed: { value: speed() },
				uRot: { value: new THREE.Vector2(1, 0) },
				uColor: { value: new THREE.Vector3(1, 0.24, 0) },
				uScale: { value: scale() },
				uFrequency: { value: frequency() },
				uWarpStrength: { value: warpStrength() },
				uNoise: { value: noise() },
				uBandWidth: { value: bandWidth() },
				uYOffset: { value: yOffset() },
				uFadeTop: { value: fadeTop() },
				uPointer: { value: new THREE.Vector2(0, 0) },
				uMouseInfluence: { value: mouseInfluence() },
				uIterations: { value: iterations() },
				uIntensity: { value: intensity() }
			},
			premultipliedAlpha: true,
			transparent: true
		});

		scene.add(new THREE.Mesh(geometry, material));

		try {
			renderer = new THREE.WebGLRenderer({
				antialias: false,
				powerPreference: 'high-performance',
				alpha: true
			});
		} catch {
			return;
		}

		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
		renderer.setClearColor(0x000000, 0);
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		renderer.domElement.style.display = 'block';
		currentContainer.appendChild(renderer.domElement);

		const clock = new THREE.Clock();

		const handleResize = () => {
			if (!renderer || !material) return;

			const w = currentContainer.clientWidth || 1;
			const h = currentContainer.clientHeight || 1;

			renderer.setSize(w, h, false);
			material.uniforms.uCanvas.value.set(w, h);
			rect = currentContainer.getBoundingClientRect();
		};

		handleResize();

		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(currentContainer);
		} else {
			window.addEventListener('resize', handleResize);
		}

		const handlePointer = (e) => {
			const x = (e.clientX - rect.left) / rect.width * 2 - 1;
			const y = -((e.clientY - rect.top) / rect.height * 2 - 1);

			pointerTarget.set(x, y);
		};

		window.addEventListener('mousemove', handlePointer, { passive: true });

		const loop = () => {
			if (!renderer || !material) return;

			const dt = clock.getDelta();

			material.uniforms.uTime.value = clock.elapsedTime;

			const amt = Math.min(1, dt * 4);

			pointerCurrent.lerp(pointerTarget, amt);
			material.uniforms.uPointer.value.copy(pointerCurrent);
			renderer.render(scene, camera);
			raf = requestAnimationFrame(loop);
		};

		raf = requestAnimationFrame(loop);

		return () => {
			if (raf !== null) cancelAnimationFrame(raf);
			if (resizeObserver) resizeObserver.disconnect(); else window.removeEventListener('resize', handleResize);

			window.removeEventListener('mousemove', handlePointer);
			geometry.dispose();
			material?.dispose();
			renderer?.dispose();
			renderer?.forceContextLoss();

			if (renderer?.domElement.parentElement === currentContainer) {
				currentContainer.removeChild(renderer.domElement);
			}

			material = null;
			renderer = null;
		};
	});

	$.user_effect(() => {
		if (!material) return;

		material.uniforms.uSpeed.value = speed();
		material.uniforms.uScale.value = scale();
		material.uniforms.uFrequency.value = frequency();
		material.uniforms.uWarpStrength.value = warpStrength();
		material.uniforms.uNoise.value = noise();
		material.uniforms.uBandWidth.value = bandWidth();
		material.uniforms.uYOffset.value = yOffset();
		material.uniforms.uFadeTop.value = fadeTop();
		material.uniforms.uMouseInfluence.value = mouseInfluence();
		material.uniforms.uIterations.value = iterations();
		material.uniforms.uIntensity.value = intensity();
		material.uniforms.uColor.value.copy(toVec3(color()));

		const rad = rotation() * Math.PI / 180;

		material.uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));
	});

	var div = root();

	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.template_effect(() => $.set_class(div, 1, $.clsx(className())));
	$.append($$anchor, div);
	$.pop();
}