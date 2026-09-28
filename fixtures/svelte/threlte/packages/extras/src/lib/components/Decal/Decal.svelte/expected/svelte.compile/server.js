import * as $ from 'svelte/internal/server';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { asyncWritable, T, useParent } from '@threlte/core';
import { useSuspense } from '../../suspense/useSuspense.js';
import { useTexture } from '../../hooks/useTexture.js';
import { Euler, Matrix4, Mesh, Object3D, Texture, Vector3 } from 'three';

const vertex = new Vector3();
const matrixWorld = new Matrix4();
const closestNormal = new Vector3();
const vec3 = new Vector3();
const object3d = new Object3D();

export default function Decal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/** Euler for manual orientation or a single float for closest-vertex-normal orient */
		let {
			src,
			mesh: parentMesh,
			position,
			rotation,
			scale,
			polygonOffsetFactor = -10,
			depthTest = true,
			debug = false,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const parent = useParent();
		const parentNode = $.derived(() => parentMesh ?? $.store_get($$store_subs ??= {}, '$parent', parent));
		const mesh = new Mesh();
		const projectorPosition = new Vector3();
		const projectorRotation = new Euler();
		const projectorSize = new Vector3(1, 1, 1);
		let helper = new Mesh();
		const suspend = useSuspense();

		const map = $.derived(() => typeof src === 'string'
			? suspend(useTexture(src))
			: src ? asyncWritable(Promise.resolve(src)) : undefined);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$map', map()) || children) {
				$$renderer.push('<!--[0-->');

				T($$renderer, $.spread_props([
					{
						is: mesh,
						'material.transparent': true,
						'material.polygonOffset': true,
						'material.polygonOffsetFactor': polygonOffsetFactor,
						'material.depthTest': depthTest,
						'material.map': $.store_get($$store_subs ??= {}, '$map', map())
					},
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer, { ref: mesh });
							$$renderer.push(`<!----> `);

							if (debug) {
								$$renderer.push('<!--[0-->');

								T($$renderer, {
									is: helper,
									raycast: () => null,
									children: ($$renderer) => {
										if (T.BoxGeometry) {
											$$renderer.push('<!--[-->');
											T.BoxGeometry($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.MeshNormalMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshNormalMaterial($$renderer, { wireframe: true });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.AxesHelper) {
											$$renderer.push('<!--[-->');
											T.AxesHelper($$renderer, { raycast: () => null });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}