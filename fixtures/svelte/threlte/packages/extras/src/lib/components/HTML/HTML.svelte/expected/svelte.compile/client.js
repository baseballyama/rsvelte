import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask, useThrelte } from '@threlte/core';
import { untrack } from 'svelte';
import { DoubleSide, Group, Matrix4, Mesh, Raycaster, Vector3 } from 'three';
import { useSuspense } from '../../suspense/useSuspense.js';
import { logFragment, logVertex, spriteVertex } from './shaders.js';

import {
	defaultCalculatePosition,
	epsilon,
	getCameraCSSMatrix,
	getObjectCSSMatrix,
	getViewportFactor,
	isObjectBehindCamera,
	isObjectVisible,
	objectScale,
	objectZIndex
} from './utils.js';

let canvasModified = false;
let activeOccludeInstances = 0;
let oldZIndex = '';
let oldPosition = '';
let oldPointerEvents = '';

const modifyCanvas = (canvas, zIndexRange) => {
	if (activeOccludeInstances === 1 && !canvasModified) {
		oldZIndex = canvas.style.zIndex;
		oldPosition = canvas.style.position;
		oldPointerEvents = canvas.style.pointerEvents;
		canvas.style.zIndex = `${Math.floor(zIndexRange / 2)}`;
		canvas.style.position = 'absolute';
		canvas.style.pointerEvents = 'none';
		canvasModified = true;
	} else if (activeOccludeInstances === 0 && canvasModified) {
		canvas.style.zIndex = oldZIndex;
		canvas.style.position = oldPosition;
		canvas.style.pointerEvents = oldPointerEvents;
		canvasModified = false;
	}
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'autoRender',
	'eps',
	'center',
	'fullscreen',
	'portal',
	'distanceFactor',
	'sprite',
	'transform',
	'occlude',
	'castShadow',
	'receiveShadow',
	'material',
	'geometry',
	'zIndexRange',
	'calculatePosition',
	'as',
	'wrapperClass',
	'pointerEvents',
	'ref',
	'visible',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><div><div><!></div></div></div>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function HTML($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const $suspended = () => $.store_get(suspended, '$suspended', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let autoRender = $.prop($$props, 'autoRender', 3, true),
		eps = $.prop($$props, 'eps', 3, 0.001),
		center = $.prop($$props, 'center', 3, false),
		fullscreen = $.prop($$props, 'fullscreen', 3, false),
		sprite = $.prop($$props, 'sprite', 3, false),
		transform = $.prop($$props, 'transform', 3, false),
		occlude = $.prop($$props, 'occlude', 3, false),
		castShadow = $.prop($$props, 'castShadow', 3, false),
		receiveShadow = $.prop($$props, 'receiveShadow', 3, false),
		zIndexRange = $.prop($$props, 'zIndexRange', 19, () => [16777271, 0]),
		calculatePosition = $.prop($$props, 'calculatePosition', 3, defaultCalculatePosition),
		as = $.prop($$props, 'as', 3, 'div'),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, 'auto'),
		ref = $.prop($$props, 'ref', 15),
		visible = $.prop($$props, 'visible', 15),
		props = $.rest_props($$props, rest_excludes);

	visible(true);

	const { camera, scene, size, dom, canvas, renderStage } = useThrelte();
	const group = new Group();
	let element;
	let oldZoom = 0;
	let oldX = 0;
	let oldY = 0;
	let cachedZIndexNum = Number.MIN_SAFE_INTEGER;
	let cachedWidth = -1;
	let cachedHeight = -1;
	let cachedPerspective = '';
	let cachedOuterTransform = '';
	let cachedInnerTransform = '';
	let cachedTransform = '';
	let transformOuterRef = $.state(void 0);
	let transformInnerRef = $.state(void 0);
	let isMeshSizeSet = false;
	const occlusionMesh = new Mesh();
	const raycaster = new Raycaster();
	const matrix = new Matrix4();
	const viewportTarget = new Vector3();
	const isRayCastOcclusion = $.derived(() => !!occlude() && occlude() !== 'blending');
	const viewportFactor = $.derived(() => getViewportFactor($camera(), viewportTarget, $size()));

	// Stable zRange tuple — objectZIndex only reads zRange[0] and zRange[1].
	// Recomputes only when occlude/raycast/zIndexRange actually change.
	const zRange = $.derived(() => {
		if (!occlude()) return zIndexRange();

		const halfRange = Math.floor(zIndexRange()[0] / 2);

		return $.get(isRayCastOcclusion) ? [zIndexRange()[0], halfRange] : [halfRange - 1, 0];
	});

	$.user_pre_effect(() => {
		if (occlude() !== 'blending') return;

		activeOccludeInstances += 1;
		modifyCanvas(canvas, zIndexRange()[0]);

		return () => {
			activeOccludeInstances -= 1;
			modifyCanvas(canvas, zIndexRange()[0]);
		};
	});

	const render = () => {
		camera.current.updateMatrixWorld();
		group.updateWorldMatrix(true, false);

		const vec = transform()
			? null
			: calculatePosition()(group, camera.current, $size());

		if (transform() || vec && (Math.abs(oldZoom - camera.current.zoom) > eps() || Math.abs(oldX - vec[0]) > eps() || Math.abs(oldY - vec[1]) > eps())) {
			const isBehindCamera = isObjectBehindCamera(group, camera.current);
			let raytraceTarget = false;

			if ($.get(isRayCastOcclusion)) {
				if (Array.isArray(occlude())) {
					raytraceTarget = occlude();
				} else if (occlude() !== 'blending') {
					raytraceTarget = [scene];
				}
			}

			const previouslyVisible = visible();

			if (raytraceTarget) {
				const isvisible = isObjectVisible(group, camera.current, raycaster, raytraceTarget);

				visible(isvisible && !isBehindCamera);
			} else {
				visible(!isBehindCamera);
			}

			if (previouslyVisible !== visible()) {
				if ($$props.onvisibilitychange) {
					$$props.onvisibilitychange(visible());
				} else {
					element.style.display = visible() ? 'block' : 'none';
				}
			}

			const zIndexNum = objectZIndex(group, camera.current, $.get(zRange));

			if (cachedZIndexNum !== zIndexNum) {
				element.style.zIndex = `${zIndexNum}`;
				cachedZIndexNum = zIndexNum;
			}

			if (transform() && $.get(transformOuterRef) && $.get(transformInnerRef)) {
				const { isOrthographicCamera, top, left, bottom, right } = camera.current;
				const { width, height } = $size();
				const halfWidth = width / 2;
				const halfHeight = height / 2;
				const fov = $camera().projectionMatrix.elements[5] * halfHeight;
				const cameraMatrix = getCameraCSSMatrix(camera.current.matrixWorldInverse);

				const cameraTransform = isOrthographicCamera
					? `scale(${fov})translate(${epsilon(-(right + left) / 2)}px,${epsilon((top + bottom) / 2)}px)`
					: `translateZ(${fov}px)`;

				if (sprite()) {
					matrix.copy(camera.current.matrixWorldInverse).transpose().copyPosition(matrix).scale(group.scale);
					matrix.elements[3] = matrix.elements[7] = matrix.elements[11] = 0;
					matrix.elements[15] = 1;
				} else {
					matrix.copy(group.matrixWorld);
				}

				if (cachedWidth !== width) {
					element.style.width = `${width}px`;
					cachedWidth = width;
				}

				if (cachedHeight !== height) {
					element.style.height = `${height}px`;
					cachedHeight = height;
				}

				const perspective = isOrthographicCamera ? '' : `${fov}px`;

				if (cachedPerspective !== perspective) {
					element.style.perspective = perspective;
					cachedPerspective = perspective;
				}

				const newOuterTransform = `${cameraTransform}${cameraMatrix}translate(${halfWidth}px,${halfHeight}px)`;

				if (cachedOuterTransform !== newOuterTransform) {
					$.get(transformOuterRef).style.transform = newOuterTransform;
					cachedOuterTransform = newOuterTransform;
				}

				const newInnerTransform = getObjectCSSMatrix(matrix, 1 / (($$props.distanceFactor || 10) / 400));

				if (cachedInnerTransform !== newInnerTransform) {
					$.get(transformInnerRef).style.transform = newInnerTransform;
					cachedInnerTransform = newInnerTransform;
				}
			} else if (vec) {
				const scale = $$props.distanceFactor === undefined
					? 1
					: objectScale(group, camera.current) * $$props.distanceFactor;

				const newTransform = `translate3d(${vec[0]}px,${vec[1]}px,0) scale(${scale})`;

				if (cachedTransform !== newTransform) {
					element.style.transform = newTransform;
					cachedTransform = newTransform;
				}
			}

			if (vec) {
				oldX = vec[0];
				oldY = vec[1];
			}

			oldZoom = camera.current.zoom;
		}

		if (!$.get(isRayCastOcclusion) && !isMeshSizeSet) {
			if (transform() && $.get(transformOuterRef)) {
				const el = $.get(transformOuterRef).children[0];

				if (el?.clientWidth && el?.clientHeight) {
					const { isOrthographicCamera } = camera.current;

					if (isOrthographicCamera || $$props.geometry) {
						const { scale } = props;

						if (scale) {
							if (!Array.isArray(scale)) {
								occlusionMesh.scale.setScalar(1 / scale);
							} else {
								occlusionMesh.scale.set(1 / scale[0], 1 / scale[1], 1 / scale[2]);
							}
						}
					} else {
						const ratio = ($$props.distanceFactor ?? 10) / 400;
						const w = el.clientWidth * ratio;
						const h = el.clientHeight * ratio;

						occlusionMesh.scale.set(w, h, 1);
					}

					isMeshSizeSet = true;
				}
			} else {
				const el = element.children[0];

				if (el?.clientWidth && el?.clientHeight) {
					const ratio = 1 / $.get(viewportFactor);
					const w = el.clientWidth * ratio;
					const h = el.clientHeight * ratio;

					occlusionMesh.scale.set(w, h, 1);
					isMeshSizeSet = true;
				}

				occlusionMesh.lookAt(camera.current.position);
			}
		}
	};

	useTask(render, {
		autoInvalidate: false,
		stage: renderStage,
		running: () => autoRender()
	});

	$.user_effect(() => {
		// Track $size so resize updates the DOM synchronously, ahead of the next renderStage tick.
		void $size();

		untrack(render);
	});

	const portalAction = (el) => {
		const target = $$props.portal ?? dom;

		if (!target) {
			console.warn('<HTML>: target is undefined.');

			return;
		}

		target.append(el);

		return { destroy: () => el.remove() };
	};

	const { suspended } = useSuspense();
	var $$exports = { render };
	var fragment = root();
	var node = $.first_child(fragment);

	T(node, $.spread_props(
		{
			get is() {
				return group;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_3 = ($$anchor) => {
						T($$anchor, {
							get is() {
								return occlusionMesh;
							},

							get castShadow() {
								return castShadow();
							},

							get receiveShadow() {
								return receiveShadow();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										T($$anchor, {
											get is() {
												return $$props.geometry;
											}
										});
									};

									var alternate = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_3 = $.first_child(fragment_5);

										$.component(node_3, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
											T_PlaneGeometry($$anchor, {});
										});

										$.append($$anchor, fragment_5);
									};

									$.if(node_2, ($$render) => {
										if ($$props.geometry) $$render(consequent); else $$render(alternate, -1);
									});
								}

								var node_4 = $.sibling(node_2, 2);

								{
									var consequent_1 = ($$anchor) => {
										T($$anchor, {
											get is() {
												return $$props.material;
											}
										});
									};

									var consequent_2 = ($$anchor) => {
										var fragment_7 = $.comment();
										var node_5 = $.first_child(fragment_7);

										$.component(node_5, () => T.ShaderMaterial, ($$anchor, T_ShaderMaterial) => {
											T_ShaderMaterial($$anchor, {
												get side() {
													return DoubleSide;
												},

												get vertexShader() {
													return spriteVertex;
												},

												get fragmentShader() {
													return logFragment;
												}
											});
										});

										$.append($$anchor, fragment_7);
									};

									var alternate_1 = ($$anchor) => {
										var fragment_8 = $.comment();
										var node_6 = $.first_child(fragment_8);

										$.component(node_6, () => T.ShaderMaterial, ($$anchor, T_ShaderMaterial_1) => {
											T_ShaderMaterial_1($$anchor, {
												get side() {
													return DoubleSide;
												},

												get vertexShader() {
													return logVertex;
												},

												get fragmentShader() {
													return logFragment;
												}
											});
										});

										$.append($$anchor, fragment_8);
									};

									$.if(node_4, ($$render) => {
										if ($$props.material) $$render(consequent_1); else if (!transform()) $$render(consequent_2, 1); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_1, ($$render) => {
						if (occlude() && !$.get(isRayCastOcclusion)) $$render(consequent_3);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	var node_7 = $.sibling(node, 2);

	$.element(node_7, as, false, ($$element, $$anchor) => {
		$.action($$element, ($$node) => portalAction?.($$node));
		$.bind_this($$element, ($$value) => element = $$value, () => element);

		$.attribute_effect($$element, () => ({
			class: $$props.wrapperClass,
			style: '',
			[$.STYLE]: {
				position: 'absolute',
				top: '0',
				left: '0',
				'pointer-events': transform() ? 'none' : undefined,
				overflow: transform() ? 'hidden' : undefined,
				'transform-origin': transform() ? undefined : '0 0',
				display: $suspended() ? 'none' : undefined
			}
		}));

		var fragment_9 = $.comment();
		var node_8 = $.first_child(fragment_9);

		{
			var consequent_4 = ($$anchor) => {
				var div = root_1();
				let styles;
				var div_1 = $.child(div);
				let styles_1;
				var div_2 = $.child(div_1);
				var node_9 = $.child(div_2);

				$.snippet(node_9, () => $$props.children ?? $.noop, () => ({ render }));
				$.reset(div_2);
				$.reset(div_1);
				$.bind_this(div_1, ($$value) => $.set(transformInnerRef, $$value), () => $.get(transformInnerRef));
				$.reset(div);
				$.bind_this(div, ($$value) => $.set(transformOuterRef, $$value), () => $.get(transformOuterRef));

				$.template_effect(() => {
					styles = $.set_style(div, '', styles, {
						position: 'absolute',
						top: '0',
						left: '0',
						'transform-style': 'preserve-3d',
						'pointer-events': 'none',
						width: `${$size().width}px`,
						height: `${$size().height}px`
					});

					styles_1 = $.set_style(div_1, '', styles_1, { position: 'absolute', 'pointer-events': pointerEvents() });
					$.set_class(div_2, 1, $.clsx($$props.class));
					$.set_style(div_2, $$props.style);
				});

				$.append($$anchor, div);
			};

			var alternate_2 = ($$anchor) => {
				var div_3 = root_2();
				let styles_2;
				var node_10 = $.child(div_3);

				$.snippet(node_10, () => $$props.children ?? $.noop, () => ({ render }));
				$.reset(div_3);

				$.template_effect(() => {
					styles_2 = $.set_style(div_3, $$props.style, styles_2, {
						position: 'absolute',
						transform: center() ? 'translate3d(-50%,-50%,0)' : 'none',
						top: fullscreen() ? `${-$size().height / 2}px` : undefined,
						left: fullscreen() ? `${-$size().width / 2}px` : undefined,
						width: fullscreen() ? `${$size().width}px` : undefined,
						height: fullscreen() ? `${$size().height}px` : undefined
					});

					$.set_class(div_3, 1, $.clsx($$props.class));
				});

				$.append($$anchor, div_3);
			};

			$.if(node_8, ($$render) => {
				if (transform()) $$render(consequent_4); else $$render(alternate_2, -1);
			});
		}

		$.append($$anchor, fragment_9);
	});

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}