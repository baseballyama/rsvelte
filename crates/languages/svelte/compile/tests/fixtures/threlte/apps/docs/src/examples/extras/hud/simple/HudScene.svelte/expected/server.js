import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { interactivity, useCursor, useViewport } from '@threlte/extras';
import { Mesh, Quaternion } from 'three';

export default function HudScene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { quaternion, onselect } = $$props;
		const viewport = useViewport();
		let meshes = [null, null, null];
		const boxCursor = useCursor();
		const torusCursor = useCursor();
		const torusKnotCursor = useCursor();

		interactivity();

		useTask(
			() => {
				for (const mesh of meshes) {
					mesh.quaternion.copy(quaternion);
				}
			},
			{ autoInvalidate: false }
		);

		const boxHovering = boxCursor.hovering;
		const torusHovering = torusCursor.hovering;
		const torusKnotHovering = torusKnotCursor.hovering;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.OrthographicCamera) {
				$$renderer.push('<!--[-->');
				T.OrthographicCamera($$renderer, { makeDefault: true, zoom: 80, position: [0, 0, 10] });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.AmbientLight) {
				$$renderer.push('<!--[-->');
				T.AmbientLight($$renderer, { intensity: Math.PI / 2 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.PointLight) {
				$$renderer.push('<!--[-->');
				T.PointLight($$renderer, { position: [10, 10, 10], decay: 0, intensity: Math.PI * 2 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					position: [
						$.store_get($$store_subs ??= {}, '$viewport', viewport).width / 2 - 1,
						$.store_get($$store_subs ??= {}, '$viewport', viewport).height / 2 - 1,
						0
					],
					onpointerenter: boxCursor.onPointerEnter,
					onpointerleave: boxCursor.onPointerLeave,
					onclick: () => onselect('box'),
					scale: $.store_get($$store_subs ??= {}, '$boxHovering', boxHovering) ? 1.1 : 1,
					get ref() {
						return meshes[0];
					},

					set ref($$value) {
						meshes[0] = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (T.BoxGeometry) {
							$$renderer.push('<!--[-->');
							T.BoxGeometry($$renderer, { args: [0.5, 0.5, 0.5] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshToonMaterial) {
							$$renderer.push('<!--[-->');

							T.MeshToonMaterial($$renderer, {
								color: $.store_get($$store_subs ??= {}, '$boxHovering', boxHovering) ? 'hotpink' : 'gray'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					position: [
						$.store_get($$store_subs ??= {}, '$viewport', viewport).width / 2 - 2,
						$.store_get($$store_subs ??= {}, '$viewport', viewport).height / 2 - 1,
						0
					],
					onpointerenter: torusCursor.onPointerEnter,
					onpointerleave: torusCursor.onPointerLeave,
					onclick: () => onselect('torus'),
					scale: $.store_get($$store_subs ??= {}, '$torusHovering', torusHovering) ? 1.1 : 1,
					get ref() {
						return meshes[1];
					},

					set ref($$value) {
						meshes[1] = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (T.TorusGeometry) {
							$$renderer.push('<!--[-->');
							T.TorusGeometry($$renderer, { args: [0.25, 0.1] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshToonMaterial) {
							$$renderer.push('<!--[-->');

							T.MeshToonMaterial($$renderer, {
								color: $.store_get($$store_subs ??= {}, '$torusHovering', torusHovering) ? 'hotpink' : 'gray'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					position: [
						$.store_get($$store_subs ??= {}, '$viewport', viewport).width / 2 - 3,
						$.store_get($$store_subs ??= {}, '$viewport', viewport).height / 2 - 1,
						0
					],
					onpointerover: torusKnotCursor.onPointerEnter,
					onpointerleave: torusKnotCursor.onPointerLeave,
					onclick: () => onselect('torusknot'),
					scale: $.store_get($$store_subs ??= {}, '$torusKnotHovering', torusKnotHovering) ? 1.1 : 1,
					get ref() {
						return meshes[2];
					},

					set ref($$value) {
						meshes[2] = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (T.TorusKnotGeometry) {
							$$renderer.push('<!--[-->');
							T.TorusKnotGeometry($$renderer, { args: [0.215, 0.08, 256] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshToonMaterial) {
							$$renderer.push('<!--[-->');

							T.MeshToonMaterial($$renderer, {
								color: $.store_get($$store_subs ??= {}, '$torusKnotHovering', torusKnotHovering) ? 'hotpink' : 'gray'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}