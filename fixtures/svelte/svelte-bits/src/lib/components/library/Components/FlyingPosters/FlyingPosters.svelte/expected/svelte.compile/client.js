import 'svelte/internal/disclose-version';
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } from 'ogl';
import * as $ from 'svelte/internal/client';

const vertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uPosition;
uniform float uTime;
uniform float uSpeed;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;

varying vec2 vUv;
varying vec3 vNormal;

float PI = 3.141592653589793238;
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(
      oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
      0.0,                              0.0,                                0.0,                                1.0
    );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float qinticInOut(float t) {
  return t < 0.5
    ? 16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

void main() {
  vUv = uv;
  
  float norm = 0.5;
  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm / 2.) / norm;
  float localprogress = clamp(
    (fract(uPosition * 5.0 * 0.01) - 0.01 * uDistortion * offset) / (1. - 0.01 * uDistortion),
    0.,
    2.
  );
  localprogress = qinticInOut(localprogress) * PI;
  newpos = rotate(newpos, rotationAxis, localprogress);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
  vec2 imageSize = uImageSize;
  vec2 planeSize = uPlaneSize;

  float imageAspect = imageSize.x / imageSize.y;
  float planeAspect = planeSize.x / planeSize.y;
  vec2 scale = vec2(1.0, 1.0);

  if (planeAspect > imageAspect) {
      scale.x = imageAspect / planeAspect;
  } else {
      scale.y = planeAspect / imageAspect;
  }

  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;

  gl_FragColor = texture2D(tMap, uv);
}
`;

function autoBind(self, { include, exclude } = {}) {
	const getAllProperties = (object) => {
		const properties = new Set();
		let target = object;

		do {
			for (const key of Reflect.ownKeys(target)) {
				properties.add([target, key]);
			}

			target = Reflect.getPrototypeOf(target);
		} while (target && target !== Object.prototype);

		return properties;
	};

	const filter = (key) => {
		const match = (pattern) => typeof pattern === 'string' ? key === pattern : pattern.test(key.toString());

		if (include) return include.some(match);
		if (exclude) return !exclude.some(match);

		return true;
	};

	for (const [object, key] of getAllProperties(Object.getPrototypeOf(self))) {
		if (key === 'constructor' || !filter(key)) continue;

		const descriptor = Reflect.getOwnPropertyDescriptor(object, key);

		if (descriptor && typeof descriptor.value === 'function') {
			Object.defineProperty(self, key, { configurable: true, value: descriptor.value.bind(self) });
		}
	}

	return self;
}

function lerp(p1, p2, t) {
	return p1 + (p2 - p1) * t;
}

function map(num, min1, max1, min2, max2, round = false) {
	const num1 = (num - min1) / (max1 - min1);
	const num2 = num1 * (max2 - min2) + min2;

	return round ? Math.round(num2) : num2;
}

class Media {
	gl;
	geometry;
	scene;
	screen;
	viewport;
	image;
	length;
	index;
	planeWidth;
	planeHeight;
	distortion;
	program;
	plane;
	extra = 0;
	padding = 0;
	height = 0;
	heightTotal = 0;
	y = 0;

	constructor(
		{
			gl,
			geometry,
			scene,
			screen,
			viewport,
			image,
			length,
			index,
			planeWidth,
			planeHeight,
			distortion
		}
	) {
		this.gl = gl;
		this.geometry = geometry;
		this.scene = scene;
		this.screen = screen;
		this.viewport = viewport;
		this.image = image;
		this.length = length;
		this.index = index;
		this.planeWidth = planeWidth;
		this.planeHeight = planeHeight;
		this.distortion = distortion;
		this.createShader();
		this.createMesh();
		this.onResize();
	}

	createShader() {
		const texture = new Texture(this.gl, { generateMipmaps: false });

		this.program = new Program(this.gl, {
			depthTest: false,
			depthWrite: false,
			fragment: fragmentShader,
			vertex: vertexShader,
			uniforms: {
				tMap: { value: texture },
				uPosition: { value: 0 },
				uPlaneSize: { value: [0, 0] },
				uImageSize: { value: [0, 0] },
				uSpeed: { value: 0 },
				rotationAxis: { value: [0, 1, 0] },
				distortionAxis: { value: [1, 1, 0] },
				uDistortion: { value: this.distortion },
				uViewportSize: { value: [this.viewport.width, this.viewport.height] },
				uTime: { value: 0 }
			},
			cullFace: false
		});

		const img = new Image();

		img.crossOrigin = 'anonymous';
		img.src = this.image;

		img.onload = () => {
			texture.image = img;
			this.program.uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
		};
	}

	createMesh() {
		this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
		this.plane.setParent(this.scene);
	}

	setScale() {
		this.plane.scale.x = this.viewport.width * this.planeWidth / this.screen.width;
		this.plane.scale.y = this.viewport.height * this.planeHeight / this.screen.height;
		this.plane.position.x = 0;
		this.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
	}

	onResize({ screen, viewport } = {}) {
		if (screen) this.screen = screen;

		if (viewport) {
			this.viewport = viewport;
			this.program.uniforms.uViewportSize.value = [viewport.width, viewport.height];
		}

		this.setScale();
		this.padding = 5;
		this.height = this.plane.scale.y + this.padding;
		this.heightTotal = this.height * this.length;
		this.y = -this.heightTotal / 2 + (this.index + 0.5) * this.height;
	}

	update(scroll) {
		this.plane.position.y = this.y - scroll.current - this.extra;

		const position = map(this.plane.position.y, -this.viewport.height, this.viewport.height, 5, 15);

		this.program.uniforms.uPosition.value = position;
		this.program.uniforms.uTime.value += 0.04;
		this.program.uniforms.uSpeed.value = scroll.current;

		const planeHeight = this.plane.scale.y;
		const viewportHeight = this.viewport.height;
		const topEdge = this.plane.position.y + planeHeight / 2;
		const bottomEdge = this.plane.position.y - planeHeight / 2;

		if (topEdge < -viewportHeight / 2) {
			this.extra -= this.heightTotal;
		} else if (bottomEdge > viewportHeight / 2) {
			this.extra += this.heightTotal;
		}
	}
}

class Canvas {
	container;
	canvas;
	items;
	planeWidth;
	planeHeight;
	distortion;
	scroll;
	cameraFov;
	cameraZ;
	renderer;
	gl;
	camera;
	scene;
	planeGeometry;
	medias;
	screen;
	viewport;
	isDown = false;
	start = 0;
	loaded = 0;
	raf = 0;

	constructor(
		{
			container,
			canvas,
			items,
			planeWidth,
			planeHeight,
			distortion,
			scrollEase,
			cameraFov,
			cameraZ
		}
	) {
		this.container = container;
		this.canvas = canvas;
		this.items = items;
		this.planeWidth = planeWidth;
		this.planeHeight = planeHeight;
		this.distortion = distortion;
		this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
		this.cameraFov = cameraFov;
		this.cameraZ = cameraZ;
		autoBind(this);
		this.createRenderer();
		this.createCamera();
		this.createScene();
		this.onResize();
		this.createGeometry();
		this.createMedias();
		this.update();
		this.addEventListeners();
		this.createPreloader();
	}

	createRenderer() {
		this.renderer = new Renderer({
			canvas: this.canvas,
			alpha: true,
			antialias: true,
			dpr: Math.min(window.devicePixelRatio, 2)
		});

		this.gl = this.renderer.gl;
	}

	createCamera() {
		this.camera = new Camera(this.gl);
		this.camera.fov = this.cameraFov;
		this.camera.position.z = this.cameraZ;
	}

	createScene() {
		this.scene = new Transform();
	}

	createGeometry() {
		this.planeGeometry = new Plane(this.gl, { heightSegments: 1, widthSegments: 100 });
	}

	createMedias() {
		this.medias = this.items.map((image, index) => new Media({
			gl: this.gl,
			geometry: this.planeGeometry,
			scene: this.scene,
			screen: this.screen,
			viewport: this.viewport,
			image,
			length: this.items.length,
			index,
			planeWidth: this.planeWidth,
			planeHeight: this.planeHeight,
			distortion: this.distortion
		}));
	}

	createPreloader() {
		this.loaded = 0;

		this.items.forEach((src) => {
			const image = new Image();

			image.crossOrigin = 'anonymous';
			image.src = src;

			image.onload = () => {
				if (++this.loaded === this.items.length) {
					document.documentElement.classList.remove('loading');
					document.documentElement.classList.add('loaded');
				}
			};
		});
	}

	onResize() {
		const rect = this.container.getBoundingClientRect();

		this.screen = { width: rect.width, height: rect.height };
		this.renderer.setSize(this.screen.width, this.screen.height);
		this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });

		const fov = this.camera.fov * Math.PI / 180;
		const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
		const width = height * this.camera.aspect;

		this.viewport = { width, height };
		this.medias?.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
	}

	onTouchDown(e) {
		this.isDown = true;
		this.scroll.position = this.scroll.current;
		this.start = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
	}

	onTouchMove(e) {
		if (!this.isDown || !this.scroll.position) return;

		const y = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
		const distance = (this.start - y) * 0.1;

		this.scroll.target = this.scroll.position + distance;
	}

	onTouchUp() {
		this.isDown = false;
	}

	onWheel(e) {
		this.scroll.target += e.deltaY * 0.005;
	}

	update() {
		this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
		this.medias?.forEach((media) => media.update(this.scroll));
		this.renderer.render({ scene: this.scene, camera: this.camera });
		this.scroll.last = this.scroll.current;
		this.raf = requestAnimationFrame(this.update);
	}

	addEventListeners() {
		window.addEventListener('resize', this.onResize);
		window.addEventListener('wheel', this.onWheel);
		window.addEventListener('mousedown', this.onTouchDown);
		window.addEventListener('mousemove', this.onTouchMove);
		window.addEventListener('mouseup', this.onTouchUp);
		window.addEventListener('touchstart', this.onTouchDown);
		window.addEventListener('touchmove', this.onTouchMove);
		window.addEventListener('touchend', this.onTouchUp);
	}

	destroy() {
		cancelAnimationFrame(this.raf);
		window.removeEventListener('resize', this.onResize);
		window.removeEventListener('wheel', this.onWheel);
		window.removeEventListener('mousedown', this.onTouchDown);
		window.removeEventListener('mousemove', this.onTouchMove);
		window.removeEventListener('mouseup', this.onTouchUp);
		window.removeEventListener('touchstart', this.onTouchDown);
		window.removeEventListener('touchmove', this.onTouchMove);
		window.removeEventListener('touchend', this.onTouchUp);
	}
}

var root = $.from_html(`<div><canvas class="block h-full w-full"></canvas></div>`);

export default function FlyingPosters($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		planeWidth = $.prop($$props, 'planeWidth', 3, 320),
		planeHeight = $.prop($$props, 'planeHeight', 3, 320),
		distortion = $.prop($$props, 'distortion', 3, 3),
		scrollEase = $.prop($$props, 'scrollEase', 3, 0.01),
		cameraFov = $.prop($$props, 'cameraFov', 3, 45),
		cameraZ = $.prop($$props, 'cameraZ', 3, 20),
		className = $.prop($$props, 'class', 3, '');

	let containerRef;
	let canvasRef;
	let instance = null;

	$.user_effect(() => {
		const container = containerRef;
		const canvas = canvasRef;

		if (!container || !canvas) return;

		instance = new Canvas({
			container,
			canvas,
			items: items(),
			planeWidth: planeWidth(),
			planeHeight: planeHeight(),
			distortion: distortion(),
			scrollEase: scrollEase(),
			cameraFov: cameraFov(),
			cameraZ: cameraZ()
		});

		return () => {
			instance?.destroy();
			instance = null;
		};
	});

	$.user_effect(() => {
		const canvasEl = canvasRef;

		if (!canvasEl) return;

		const handleWheel = (e) => {
			e.preventDefault();
			instance?.onWheel(e);
		};

		const handleTouchMove = (e) => {
			e.preventDefault();
		};

		canvasEl.addEventListener('wheel', handleWheel, { passive: false });
		canvasEl.addEventListener('touchmove', handleTouchMove, { passive: false });

		return () => {
			canvasEl.removeEventListener('wheel', handleWheel);
			canvasEl.removeEventListener('touchmove', handleTouchMove);
		};
	});

	var div = root();
	var canvas_1 = $.child(div);

	$.bind_this(canvas_1, ($$value) => canvasRef = $$value, () => canvasRef);
	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
	$.template_effect(() => $.set_class(div, 1, `relative z-[2] h-full w-full overflow-hidden ${className() ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}