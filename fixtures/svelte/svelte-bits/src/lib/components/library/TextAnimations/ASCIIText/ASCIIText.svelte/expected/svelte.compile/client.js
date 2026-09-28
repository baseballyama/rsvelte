import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as THREE from 'three';

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&amp;display=swap" rel="stylesheet"/>`, 1);
var root_1 = $.from_html(`<div style="position:absolute;width:100%;height:100%;" class="svelte-7nwm30"></div>`);

export default function ASCIIText($$anchor, $$props) {
	$.push($$props, true);

	const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;
void main() {
    vUv = uv;
    float time = uTime * 5.;
    float waveFactor = uEnableWaves;
    vec3 transformed = position;
    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

	const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;
void main() {
    float time = uTime;
    vec2 pos = vUv;
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

	function mapRange(n, start, stop, start2, stop2) {
		return (n - start) / (stop - start) * (stop2 - start2) + start2;
	}

	const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

	class AsciiFilter {
		renderer;
		domElement;
		pre;
		canvas;
		context;
		deg;
		invert;
		fontSize;
		fontFamily;
		charset;
		width = 0;
		height = 0;
		center = { x: 0, y: 0 };
		mouse = { x: 0, y: 0 };
		cols = 0;
		rows = 0;

		constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
			this.renderer = renderer;
			this.domElement = document.createElement('div');
			this.domElement.style.position = 'absolute';
			this.domElement.style.top = '0';
			this.domElement.style.left = '0';
			this.domElement.style.width = '100%';
			this.domElement.style.height = '100%';
			this.pre = document.createElement('pre');
			this.domElement.appendChild(this.pre);
			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');
			this.domElement.appendChild(this.canvas);
			this.deg = 0;
			this.invert = invert ?? true;
			this.fontSize = fontSize ?? 12;
			this.fontFamily = fontFamily ?? "'Courier New', monospace";
			this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

			if (this.context) {
				this.context.imageSmoothingEnabled = false;
			}

			this.onMouseMove = this.onMouseMove.bind(this);
			document.addEventListener('mousemove', this.onMouseMove);
		}

		setSize(width, height) {
			this.width = width;
			this.height = height;
			this.renderer.setSize(width, height);
			this.reset();
			this.center = { x: width / 2, y: height / 2 };
			this.mouse = { x: this.center.x, y: this.center.y };
		}

		reset() {
			if (this.context) {
				this.context.font = `${this.fontSize}px ${this.fontFamily}`;

				const charWidth = this.context.measureText('A').width;

				this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
				this.rows = Math.floor(this.height / this.fontSize);
				this.canvas.width = this.cols;
				this.canvas.height = this.rows;
				this.pre.style.fontFamily = this.fontFamily;
				this.pre.style.fontSize = `${this.fontSize}px`;
				this.pre.style.margin = '0';
				this.pre.style.padding = '0';
				this.pre.style.lineHeight = '1em';
				this.pre.style.position = 'absolute';
				this.pre.style.left = '50%';
				this.pre.style.top = '50%';
				this.pre.style.transform = 'translate(-50%, -50%)';
				this.pre.style.zIndex = '9';
				this.pre.style.backgroundAttachment = 'fixed';
				this.pre.style.mixBlendMode = 'difference';
			}
		}

		render(scene, camera) {
			this.renderer.render(scene, camera);

			const w = this.canvas.width;
			const h = this.canvas.height;

			if (this.context) {
				this.context.clearRect(0, 0, w, h);

				if (w && h) {
					this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
				}

				this.asciify(this.context, w, h);
				this.hue();
			}
		}

		onMouseMove(e) {
			this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
		}

		get dx() {
			return this.mouse.x - this.center.x;
		}

		get dy() {
			return this.mouse.y - this.center.y;
		}

		hue() {
			const deg = Math.atan2(this.dy, this.dx) * 180 / Math.PI;

			this.deg += (deg - this.deg) * 0.075;
			this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
		}

		asciify(ctx, w, h) {
			if (w && h) {
				const imgData = ctx.getImageData(0, 0, w, h).data;
				let str = '';

				for (let y = 0; y < h; y++) {
					for (let x = 0; x < w; x++) {
						const i = x * 4 + y * 4 * w;
						const r = imgData[i];
						const g = imgData[i + 1];
						const b = imgData[i + 2];
						const a = imgData[i + 3];

						if (a === 0) {
							str += ' ';

							continue;
						}

						let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
						let idx = Math.floor((1 - gray) * (this.charset.length - 1));

						if (this.invert) idx = this.charset.length - idx - 1;

						str += this.charset[idx];
					}

					str += '\n';
				}

				this.pre.innerHTML = str;
			}
		}

		dispose() {
			document.removeEventListener('mousemove', this.onMouseMove);
		}
	}

	class CanvasTxt {
		canvas;
		context;
		txt;
		fontSize;
		fontFamily;
		color;
		font;

		constructor(
			txt,
			{ fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3' } = {}
		) {
			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');
			this.txt = txt;
			this.fontSize = fontSize;
			this.fontFamily = fontFamily;
			this.color = color;
			this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
		}

		resize() {
			if (this.context) {
				this.context.font = this.font;

				const metrics = this.context.measureText(this.txt);
				const textWidth = Math.ceil(metrics.width) + 20;
				const textHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 20;

				this.canvas.width = textWidth;
				this.canvas.height = textHeight;
			}
		}

		render() {
			if (this.context) {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.context.fillStyle = this.color;
				this.context.font = this.font;

				const metrics = this.context.measureText(this.txt);
				const yPos = 10 + metrics.actualBoundingBoxAscent;

				this.context.fillText(this.txt, 10, yPos);
			}
		}

		get width() {
			return this.canvas.width;
		}

		get height() {
			return this.canvas.height;
		}

		get texture() {
			return this.canvas;
		}
	}

	class CanvAscii {
		textString;
		asciiFontSize;
		textFontSize;
		textColor;
		planeBaseHeight;
		container;
		width;
		height;
		enableWaves;
		camera;
		scene;
		mouse;
		textCanvas;
		texture;
		geometry;
		material;
		mesh;
		renderer;
		filter;
		center;
		animationFrameId = 0;

		constructor(opts, containerElem, width, height) {
			this.textString = opts.text;
			this.asciiFontSize = opts.asciiFontSize;
			this.textFontSize = opts.textFontSize;
			this.textColor = opts.textColor;
			this.planeBaseHeight = opts.planeBaseHeight;
			this.container = containerElem;
			this.width = width;
			this.height = height;
			this.enableWaves = opts.enableWaves;
			this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
			this.camera.position.z = 30;
			this.scene = new THREE.Scene();
			this.mouse = { x: this.width / 2, y: this.height / 2 };
			this.onMouseMove = this.onMouseMove.bind(this);
		}

		async init() {
			try {
				await document.fonts.load('600 200px "IBM Plex Mono"');
				await document.fonts.load('500 12px "IBM Plex Mono"');
			} catch {
				// ignore font load errors and proceed with fallback fonts
			}

			await document.fonts.ready;
			this.setMesh();
			this.setRenderer();
		}

		setMesh() {
			this.textCanvas = new CanvasTxt(this.textString, {
				fontSize: this.textFontSize,
				fontFamily: 'IBM Plex Mono',
				color: this.textColor
			});

			this.textCanvas.resize();
			this.textCanvas.render();
			this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
			this.texture.minFilter = THREE.NearestFilter;

			const textAspect = this.textCanvas.width / this.textCanvas.height;
			const baseH = this.planeBaseHeight;
			const planeW = baseH * textAspect;
			const planeH = baseH;

			this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);

			this.material = new THREE.ShaderMaterial({
				vertexShader,
				fragmentShader,
				transparent: true,
				uniforms: {
					uTime: { value: 0 },
					mouse: { value: 1.0 },
					uTexture: { value: this.texture },
					uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
				}
			});

			this.mesh = new THREE.Mesh(this.geometry, this.material);
			this.scene.add(this.mesh);
		}

		setRenderer() {
			this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
			this.renderer.setPixelRatio(1);
			this.renderer.setClearColor(0x000000, 0);

			this.filter = new AsciiFilter(this.renderer, {
				fontFamily: 'IBM Plex Mono',
				fontSize: this.asciiFontSize,
				invert: true
			});

			this.container.appendChild(this.filter.domElement);
			this.setSize(this.width, this.height);
			this.container.addEventListener('mousemove', this.onMouseMove);
			this.container.addEventListener('touchmove', this.onMouseMove);
		}

		setSize(w, h) {
			this.width = w;
			this.height = h;
			this.camera.aspect = w / h;
			this.camera.updateProjectionMatrix();
			this.filter.setSize(w, h);
			this.center = { x: w / 2, y: h / 2 };
		}

		load() {
			this.animate();
		}

		onMouseMove(evt) {
			const e = evt.touches ? evt.touches[0] : evt;
			const bounds = this.container.getBoundingClientRect();

			this.mouse = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
		}

		animate() {
			const animateFrame = () => {
				this.animationFrameId = requestAnimationFrame(animateFrame);
				this.render();
			};

			animateFrame();
		}

		render() {
			const time = new Date().getTime() * 0.001;

			this.textCanvas.render();
			this.texture.needsUpdate = true;
			this.mesh.material.uniforms.uTime.value = Math.sin(time);
			this.updateRotation();
			this.filter.render(this.scene, this.camera);
		}

		updateRotation() {
			const x = mapRange(this.mouse.y, 0, this.height, 0.5, -0.5);
			const y = mapRange(this.mouse.x, 0, this.width, -0.5, 0.5);

			this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
			this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
		}

		clear() {
			this.scene.traverse((object) => {
				const obj = object;

				if (!obj.isMesh) return;

				[obj.material].flat().forEach((material) => {
					material.dispose();

					Object.keys(material).forEach((key) => {
						const matProp = material[key];

						if (matProp && typeof matProp === 'object' && 'dispose' in matProp && typeof matProp.dispose === 'function') {
							matProp.dispose();
						}
					});
				});

				obj.geometry.dispose();
			});

			this.scene.clear();
		}

		dispose() {
			cancelAnimationFrame(this.animationFrameId);

			if (this.filter) {
				this.filter.dispose();

				if (this.filter.domElement.parentNode) {
					this.container.removeChild(this.filter.domElement);
				}
			}

			this.container.removeEventListener('mousemove', this.onMouseMove);
			this.container.removeEventListener('touchmove', this.onMouseMove);
			this.clear();

			if (this.renderer) {
				this.renderer.dispose();
				this.renderer.forceContextLoss();
			}
		}
	}

	let text = $.prop($$props, 'text', 3, 'David!'),
		asciiFontSize = $.prop($$props, 'asciiFontSize', 3, 8),
		textFontSize = $.prop($$props, 'textFontSize', 3, 200),
		textColor = $.prop($$props, 'textColor', 3, '#FF8A4C'),
		planeBaseHeight = $.prop($$props, 'planeBaseHeight', 3, 8),
		enableWaves = $.prop($$props, 'enableWaves', 3, true);

	let containerEl = $.state(void 0);

	$.user_effect(() => {
		void text();
		void asciiFontSize();
		void textFontSize();
		void textColor();
		void planeBaseHeight();
		void enableWaves();

		if (!$.get(containerEl)) return;

		let cancelled = false;
		let instance = null;
		let observer = null;
		let ro = null;

		const createAndInit = async (container, w, h) => {
			const inst = new CanvAscii(
				{
					text: text(),
					asciiFontSize: asciiFontSize(),
					textFontSize: textFontSize(),
					textColor: textColor(),
					planeBaseHeight: planeBaseHeight(),
					enableWaves: enableWaves()
				},
				container,
				w,
				h
			);

			await inst.init();

			return inst;
		};

		const setup = async () => {
			if (!$.get(containerEl)) return;

			const { width, height } = $.get(containerEl).getBoundingClientRect();

			if (width === 0 || height === 0) {
				observer = new IntersectionObserver(
					async ([entry]) => {
						if (cancelled) return;

						if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
							const { width: w, height: h } = entry.boundingClientRect;

							observer?.disconnect();
							observer = null;

							if (!cancelled && $.get(containerEl)) {
								instance = await createAndInit($.get(containerEl), w, h);

								if (!cancelled && instance) instance.load();
							}
						}
					},
					{ threshold: 0.1 }
				);

				observer.observe($.get(containerEl));

				return;
			}

			instance = await createAndInit($.get(containerEl), width, height);

			if (!cancelled && instance) {
				instance.load();

				ro = new ResizeObserver((entries) => {
					if (!entries[0] || !instance) return;

					const { width: w, height: h } = entries[0].contentRect;

					if (w > 0 && h > 0) instance.setSize(w, h);
				});

				if ($.get(containerEl)) ro.observe($.get(containerEl));
			}
		};

		setup();

		return () => {
			cancelled = true;
			observer?.disconnect();
			ro?.disconnect();

			if (instance) {
				instance.dispose();
				instance = null;
			}
		};
	});

	var div = root_1();

	$.head('7nwm30', ($$anchor) => {
		var fragment = root();

		$.next(4);
		$.append($$anchor, fragment);
	});

	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
	$.append($$anchor, div);
	$.pop();
}