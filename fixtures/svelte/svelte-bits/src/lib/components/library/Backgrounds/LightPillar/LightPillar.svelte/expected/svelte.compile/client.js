import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import * as THREE from 'three';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div>WebGL not supported</div>`);

export default function LightPillar($$anchor, $$props) {
	$.push($$props, true);

	let topColor = $.prop($$props, 'topColor', 3, '#ff8a3d'),
		bottomColor = $.prop($$props, 'bottomColor', 3, '#FF9FFC'),
		intensity = $.prop($$props, 'intensity', 3, 1),
		rotationSpeed = $.prop($$props, 'rotationSpeed', 3, 0.3),
		interactive = $.prop($$props, 'interactive', 3, false),
		className = $.prop($$props, 'class', 3, ''),
		glowAmount = $.prop($$props, 'glowAmount', 3, 0.005),
		pillarWidth = $.prop($$props, 'pillarWidth', 3, 3),
		pillarHeight = $.prop($$props, 'pillarHeight', 3, 0.4),
		noiseIntensity = $.prop($$props, 'noiseIntensity', 3, 0.5),
		mixBlendMode = $.prop($$props, 'mixBlendMode', 3, 'screen'),
		pillarRotation = $.prop($$props, 'pillarRotation', 3, 0),
		quality = $.prop($$props, 'quality', 3, 'high');

	let containerRef;
	let webGLSupported = $.state(true);
	let material = null;

	const parseColor = (hex) => {
		const c = new THREE.Color(hex);

		return new THREE.Vector3(c.r, c.g, c.b);
	};

	$.user_effect(() => {
		if (!material) return;

		material.uniforms.uTopColor.value = parseColor(topColor());
	});

	$.user_effect(() => {
		if (!material) return;

		material.uniforms.uBottomColor.value = parseColor(bottomColor());
	});

	$.user_effect(() => {
		if (material) material.uniforms.uIntensity.value = intensity();
	});

	$.user_effect(() => {
		if (material) material.uniforms.uInteractive.value = interactive();
	});

	$.user_effect(() => {
		if (material) material.uniforms.uGlowAmount.value = glowAmount();
	});

	$.user_effect(() => {
		if (material) material.uniforms.uPillarWidth.value = pillarWidth();
	});

	$.user_effect(() => {
		if (material) material.uniforms.uPillarHeight.value = pillarHeight();
	});

	$.user_effect(() => {
		if (material) material.uniforms.uNoiseIntensity.value = noiseIntensity();
	});

	$.user_effect(() => {
		if (!material) return;

		const r = pillarRotation() * Math.PI / 180;

		material.uniforms.uPillarRotCos.value = Math.cos(r);
		material.uniforms.uPillarRotSin.value = Math.sin(r);
	});

	let rotationSpeedRef = $.state($.proxy(rotationSpeed()));

	$.user_effect(() => {
		$.set(rotationSpeedRef, rotationSpeed());
	});

	onMount(() => {
		const test = document.createElement('canvas');
		const gl0 = test.getContext('webgl') || test.getContext('experimental-webgl');

		if (!gl0) {
			$.set(webGLSupported, false);

			return;
		}

		const width = containerRef.clientWidth;
		const height = containerRef.clientHeight;
		const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent);
		const isLowEndDevice = isMobile || navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
		let effectiveQuality = quality();

		if (isLowEndDevice && quality() === 'high') effectiveQuality = 'medium';
		if (isMobile && quality() !== 'low') effectiveQuality = 'low';

		const qs = {
			low: {
				iterations: 24,
				waveIterations: 1,
				pixelRatio: 0.5,
				precision: 'mediump',
				stepMultiplier: 1.5
			},
			medium: {
				iterations: 40,
				waveIterations: 2,
				pixelRatio: 0.65,
				precision: 'mediump',
				stepMultiplier: 1.2
			},
			high: {
				iterations: 80,
				waveIterations: 4,
				pixelRatio: Math.min(window.devicePixelRatio, 2),
				precision: 'highp',
				stepMultiplier: 1.0
			}
		};

		const settings = qs[effectiveQuality] || qs.medium;
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		let renderer;

		try {
			renderer = new THREE.WebGLRenderer({
				antialias: false,
				alpha: true,
				powerPreference: effectiveQuality === 'low' ? 'low-power' : 'high-performance',
				precision: settings.precision,
				stencil: false,
				depth: false
			});
		} catch {
			$.set(webGLSupported, false);

			return;
		}

		renderer.setSize(width, height);
		renderer.setPixelRatio(settings.pixelRatio);

		// eslint-disable-next-line svelte/no-dom-manipulating
		containerRef.appendChild(renderer.domElement);

		const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;

		const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uIntensity;
uniform bool uInteractive;
uniform float uGlowAmount;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform float uNoiseIntensity;
uniform float uPillarRotation;
uniform float uRotCos;
uniform float uRotSin;
uniform float uPillarRotCos;
uniform float uPillarRotSin;
uniform float uWaveSin[4];
uniform float uWaveCos[4];
varying vec2 vUv;
const float PI = 3.141592653589793;
const float EPSILON = 0.001;
const float E = 2.71828182845904523536;
float noise(vec2 coord) { vec2 r = (E * sin(E * coord)); return fract(r.x * r.y * (1.0 + coord.x)); }
void main() {
  vec2 fragCoord = vUv * uResolution;
  vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;
  uv = vec2(uv.x * uPillarRotCos - uv.y * uPillarRotSin, uv.x * uPillarRotSin + uv.y * uPillarRotCos);
  vec3 origin = vec3(0.0, 0.0, -10.0);
  vec3 direction = normalize(vec3(uv, 1.0));
  float maxDepth = 50.0;
  float depth = 0.1;
  float rotCos = uRotCos;
  float rotSin = uRotSin;
  if (uInteractive && length(uMouse) > 0.0) {
    float mouseAngle = uMouse.x * PI * 2.0;
    rotCos = cos(mouseAngle);
    rotSin = sin(mouseAngle);
  }
  vec3 color = vec3(0.0);
  const int ITERATIONS = ${settings.iterations};
  const int WAVE_ITERATIONS = ${settings.waveIterations};
  const float STEP_MULT = ${settings.stepMultiplier.toFixed(1)};
  for (int i = 0; i < ITERATIONS; i++) {
    vec3 pos = origin + direction * depth;
    float newX = pos.x * rotCos - pos.z * rotSin;
    float newZ = pos.x * rotSin + pos.z * rotCos;
    pos.x = newX;
    pos.z = newZ;
    vec3 deformed = pos;
    deformed.y *= uPillarHeight;
    deformed = deformed + vec3(0.0, uTime, 0.0);
    float frequency = 1.0;
    float amplitude = 1.0;
    for (int j = 0; j < WAVE_ITERATIONS; j++) {
      float wx = deformed.x * uWaveCos[j] - deformed.z * uWaveSin[j];
      float wz = deformed.x * uWaveSin[j] + deformed.z * uWaveCos[j];
      deformed.x = wx;
      deformed.z = wz;
      float phase = uTime * float(j) * 2.0;
      vec3 oscillation = cos(deformed.zxy * frequency - phase);
      deformed += oscillation * amplitude;
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    vec2 cosinePair = cos(deformed.xz);
    float fieldDistance = length(cosinePair) - 0.2;
    float radialBound = length(pos.xz) - uPillarWidth;
    float k = 4.0;
    float h = max(k - abs(-radialBound - (-fieldDistance)), 0.0);
    fieldDistance = -(min(-radialBound, -fieldDistance) - h * h * 0.25 / k);
    fieldDistance = abs(fieldDistance) * 0.15 + 0.01;
    vec3 gradient = mix(uBottomColor, uTopColor, smoothstep(15.0, -15.0, pos.y));
    color += gradient / fieldDistance;
    if (fieldDistance < EPSILON || depth > maxDepth) break;
    depth += fieldDistance * STEP_MULT;
  }
  float widthNormalization = uPillarWidth / 3.0;
  color = tanh(color * uGlowAmount / widthNormalization);
  float rnd = noise(gl_FragCoord.xy);
  color -= rnd / 15.0 * uNoiseIntensity;
  gl_FragColor = vec4(color * uIntensity, 1.0);
}`;

		const waveAngle = 0.4;
		const waveSinValues = new Float32Array(4);
		const waveCosValues = new Float32Array(4);

		for (let i = 0; i < 4; i++) {
			waveSinValues[i] = Math.sin(waveAngle);
			waveCosValues[i] = Math.cos(waveAngle);
		}

		const pillarRotRad = pillarRotation() * Math.PI / 180;
		const mouse = new THREE.Vector2(0, 0);

		material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: { value: new THREE.Vector2(width, height) },
				uMouse: { value: mouse },
				uTopColor: { value: parseColor(topColor()) },
				uBottomColor: { value: parseColor(bottomColor()) },
				uIntensity: { value: intensity() },
				uInteractive: { value: interactive() },
				uGlowAmount: { value: glowAmount() },
				uPillarWidth: { value: pillarWidth() },
				uPillarHeight: { value: pillarHeight() },
				uNoiseIntensity: { value: noiseIntensity() },
				uPillarRotation: { value: pillarRotation() },
				uRotCos: { value: 1 },
				uRotSin: { value: 0 },
				uPillarRotCos: { value: Math.cos(pillarRotRad) },
				uPillarRotSin: { value: Math.sin(pillarRotRad) },
				uWaveSin: { value: waveSinValues },
				uWaveCos: { value: waveCosValues }
			},
			transparent: true,
			depthWrite: false,
			depthTest: false
		});

		const geometry = new THREE.PlaneGeometry(2, 2);
		const mesh = new THREE.Mesh(geometry, material);

		scene.add(mesh);

		let mouseMoveTimeout = null;

		const handleMouseMove = (event) => {
			if (!interactive()) return;
			if (mouseMoveTimeout) return;

			mouseMoveTimeout = window.setTimeout(
				() => {
					mouseMoveTimeout = null;
				},
				16
			);

			const rect = containerRef.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width * 2 - 1;
			const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			mouse.set(x, y);
		};

		if (interactive()) containerRef.addEventListener('mousemove', handleMouseMove, { passive: true });

		let lastTime = performance.now();
		const targetFPS = effectiveQuality === 'low' ? 30 : 60;
		const frameTime = 1000 / targetFPS;
		let timeAcc = 0;
		let raf = 0;

		const animate = (currentTime) => {
			if (!material) return;

			const deltaTime = currentTime - lastTime;

			if (deltaTime >= frameTime) {
				timeAcc += 0.016 * $.get(rotationSpeedRef);
				material.uniforms.uTime.value = timeAcc;

				const rotAngle = timeAcc * 0.3;

				material.uniforms.uRotCos.value = Math.cos(rotAngle);
				material.uniforms.uRotSin.value = Math.sin(rotAngle);
				renderer.render(scene, camera);
				lastTime = currentTime - deltaTime % frameTime;
			}

			raf = requestAnimationFrame(animate);
		};

		raf = requestAnimationFrame(animate);

		let resizeTimeout = null;

		const handleResize = () => {
			if (resizeTimeout) clearTimeout(resizeTimeout);

			resizeTimeout = window.setTimeout(
				() => {
					if (!material) return;

					const w = containerRef.clientWidth;
					const h = containerRef.clientHeight;

					renderer.setSize(w, h);
					material.uniforms.uResolution.value.set(w, h);
				},
				150
			);
		};

		window.addEventListener('resize', handleResize, { passive: true });

		return () => {
			window.removeEventListener('resize', handleResize);

			if (interactive()) containerRef.removeEventListener('mousemove', handleMouseMove);

			cancelAnimationFrame(raf);
			renderer.dispose();
			renderer.forceContextLoss();

			if (containerRef.contains(renderer.domElement)) containerRef.removeChild(renderer.domElement);

			material?.dispose();
			geometry.dispose();
			material = null;
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			let styles;

			$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);

			$.template_effect(() => {
				$.set_class(div, 1, `absolute left-0 top-0 h-full w-full ${className() ?? ''}`);
				styles = $.set_style(div, '', styles, { 'mix-blend-mode': mixBlendMode() });
			});

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();
			let styles_1;

			$.template_effect(() => {
				$.set_class(div_1, 1, `absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/10 text-sm text-gray-500 ${className() ?? ''}`);
				styles_1 = $.set_style(div_1, '', styles_1, { 'mix-blend-mode': mixBlendMode() });
			});

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(webGLSupported)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}