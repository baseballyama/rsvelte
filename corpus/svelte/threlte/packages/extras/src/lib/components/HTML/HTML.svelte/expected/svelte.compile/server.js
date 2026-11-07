import * as $ from 'svelte/internal/server';
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

export default function HTML($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			autoRender = true,
			eps = 0.001,
			center = false,
			fullscreen = false,
			portal,
			distanceFactor,
			sprite = false,
			transform = false,
			occlude = false,
			castShadow = false,
			receiveShadow = false,
			material,
			geometry,
			zIndexRange = [16777271, 0],
			calculatePosition = defaultCalculatePosition,
			as = 'div',
			wrapperClass,
			pointerEvents = 'auto',
			ref = void 0,
			visible = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		visible = true;

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
		let transformOuterRef = void 0;
		let transformInnerRef = void 0;
		let isMeshSizeSet = false;
		const occlusionMesh = new Mesh();
		const raycaster = new Raycaster();
		const matrix = new Matrix4();
		const viewportTarget = new Vector3();
		const isRayCastOcclusion = $.derived(() => !!occlude && occlude !== 'blending');
		const viewportFactor = $.derived(() => getViewportFactor($.store_get($$store_subs ??= {}, '$camera', camera), viewportTarget, $.store_get($$store_subs ??= {}, '$size', size)));

		// Stable zRange tuple — objectZIndex only reads zRange[0] and zRange[1].
		// Recomputes only when occlude/raycast/zIndexRange actually change.
		const zRange = $.derived(() => {
			if (!occlude) return zIndexRange;

			const halfRange = Math.floor(zIndexRange[0] / 2);

			return isRayCastOcclusion() ? [zIndexRange[0], halfRange] : [halfRange - 1, 0];
		});

		const render = () => {
			camera.current.updateMatrixWorld();
			group.updateWorldMatrix(true, false);

			const vec = transform
				? null
				: calculatePosition(group, camera.current, $.store_get($$store_subs ??= {}, '$size', size));

			if (transform || vec && (Math.abs(oldZoom - camera.current.zoom) > eps || Math.abs(oldX - vec[0]) > eps || Math.abs(oldY - vec[1]) > eps)) {
				const isBehindCamera = isObjectBehindCamera(group, camera.current);
				let raytraceTarget = false;

				if (isRayCastOcclusion()) {
					if (Array.isArray(occlude)) {
						raytraceTarget = occlude;
					} else if (occlude !== 'blending') {
						raytraceTarget = [scene];
					}
				}

				const previouslyVisible = visible;

				if (raytraceTarget) {
					const isvisible = isObjectVisible(group, camera.current, raycaster, raytraceTarget);

					visible = isvisible && !isBehindCamera;
				} else {
					visible = !isBehindCamera;
				}

				if (previouslyVisible !== visible) {
					if (props.onvisibilitychange) {
						props.onvisibilitychange(visible);
					} else {
						element.style.display = visible ? 'block' : 'none';
					}
				}

				const zIndexNum = objectZIndex(group, camera.current, zRange());

				if (cachedZIndexNum !== zIndexNum) {
					element.style.zIndex = `${zIndexNum}`;
					cachedZIndexNum = zIndexNum;
				}

				if (transform && transformOuterRef && transformInnerRef) {
					const { isOrthographicCamera, top, left, bottom, right } = camera.current;
					const { width, height } = $.store_get($$store_subs ??= {}, '$size', size);
					const halfWidth = width / 2;
					const halfHeight = height / 2;
					const fov = $.store_get($$store_subs ??= {}, '$camera', camera).projectionMatrix.elements[5] * halfHeight;
					const cameraMatrix = getCameraCSSMatrix(camera.current.matrixWorldInverse);

					const cameraTransform = isOrthographicCamera
						? `scale(${fov})translate(${epsilon(-(right + left) / 2)}px,${epsilon((top + bottom) / 2)}px)`
						: `translateZ(${fov}px)`;

					if (sprite) {
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
						transformOuterRef.style.transform = newOuterTransform;
						cachedOuterTransform = newOuterTransform;
					}

					const newInnerTransform = getObjectCSSMatrix(matrix, 1 / ((distanceFactor || 10) / 400));

					if (cachedInnerTransform !== newInnerTransform) {
						transformInnerRef.style.transform = newInnerTransform;
						cachedInnerTransform = newInnerTransform;
					}
				} else if (vec) {
					const scale = distanceFactor === undefined
						? 1
						: objectScale(group, camera.current) * distanceFactor;

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

			if (!isRayCastOcclusion() && !isMeshSizeSet) {
				if (transform && transformOuterRef) {
					const el = transformOuterRef.children[0];

					if (el?.clientWidth && el?.clientHeight) {
						const { isOrthographicCamera } = camera.current;

						if (isOrthographicCamera || geometry) {
							const { scale } = props;

							if (scale) {
								if (!Array.isArray(scale)) {
									occlusionMesh.scale.setScalar(1 / scale);
								} else {
									occlusionMesh.scale.set(1 / scale[0], 1 / scale[1], 1 / scale[2]);
								}
							}
						} else {
							const ratio = (distanceFactor ?? 10) / 400;
							const w = el.clientWidth * ratio;
							const h = el.clientHeight * ratio;

							occlusionMesh.scale.set(w, h, 1);
						}

						isMeshSizeSet = true;
					}
				} else {
					const el = element.children[0];

					if (el?.clientWidth && el?.clientHeight) {
						const ratio = 1 / viewportFactor();
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
			running: () => autoRender
		});

		// Track $size so resize updates the DOM synchronously, ahead of the next renderStage tick.
		const portalAction = (el) => {
			const target = portal ?? dom;

			if (!target) {
				console.warn('<HTML>: target is undefined.');

				return;
			}

			target.append(el);

			return { destroy: () => el.remove() };
		};

		const { suspended } = useSuspense();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: group },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (occlude && !isRayCastOcclusion()) {
							$$renderer.push('<!--[0-->');

							T($$renderer, {
								is: occlusionMesh,
								castShadow,
								receiveShadow,
								children: ($$renderer) => {
									if (geometry) {
										$$renderer.push('<!--[0-->');
										T($$renderer, { is: geometry });
									} else {
										$$renderer.push('<!--[-1-->');

										if (T.PlaneGeometry) {
											$$renderer.push('<!--[-->');
											T.PlaneGeometry($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--> `);

									if (material) {
										$$renderer.push('<!--[0-->');
										T($$renderer, { is: material });
									} else if (!transform) {
										$$renderer.push('<!--[1-->');

										if (T.ShaderMaterial) {
											$$renderer.push('<!--[-->');

											T.ShaderMaterial($$renderer, {
												side: DoubleSide,
												vertexShader: spriteVertex,
												fragmentShader: logFragment
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');

										if (T.ShaderMaterial) {
											$$renderer.push('<!--[-->');

											T.ShaderMaterial($$renderer, {
												side: DoubleSide,
												vertexShader: logVertex,
												fragmentShader: logFragment
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push(`<!----> `);

			$.element(
				$$renderer,
				as,
				() => {
					$$renderer.push(`${$.attr_class($.clsx(wrapperClass))}${$.attr_style('', {
						position: 'absolute',
						top: '0',
						left: '0',
						'pointer-events': transform ? 'none' : undefined,
						overflow: transform ? 'hidden' : undefined,
						'transform-origin': transform ? undefined : '0 0',
						display: $.store_get($$store_subs ??= {}, '$suspended', suspended) ? 'none' : undefined
					})}`);
				},
				() => {
					if (transform) {
						$$renderer.push(`<!--[0--><div${$.attr_style('', {
							position: 'absolute',
							top: '0',
							left: '0',
							'transform-style': 'preserve-3d',
							'pointer-events': 'none',
							width: `${$.store_get($$store_subs ??= {}, '$size', size).width}px`,
							height: `${$.store_get($$store_subs ??= {}, '$size', size).height}px`
						})}><div${$.attr_style('', { position: 'absolute', 'pointer-events': pointerEvents })}><div${$.attr_class($.clsx(props.class))}${$.attr_style(props.style)}>`);

						children?.($$renderer, { render });
						$$renderer.push(`<!----></div></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attr_style(props.style, {
							position: 'absolute',
							transform: center ? 'translate3d(-50%,-50%,0)' : 'none',
							top: fullscreen
								? `${-$.store_get($$store_subs ??= {}, '$size', size).height / 2}px`
								: undefined,

							left: fullscreen
								? `${-$.store_get($$store_subs ??= {}, '$size', size).width / 2}px`
								: undefined,

							width: fullscreen
								? `${$.store_get($$store_subs ??= {}, '$size', size).width}px`
								: undefined,

							height: fullscreen
								? `${$.store_get($$store_subs ??= {}, '$size', size).height}px`
								: undefined
						})}${$.attr_class($.clsx(props.class))}>`);

						children?.($$renderer, { render });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}
			);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref, visible, render });
	});
}