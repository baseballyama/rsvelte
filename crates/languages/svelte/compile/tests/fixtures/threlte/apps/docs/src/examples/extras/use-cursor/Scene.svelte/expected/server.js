import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { interactivity, Text, useCursor } from '@threlte/extras';
import { DEG2RAD } from 'three/src/math/MathUtils.js';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { hovering, onPointerEnter, onPointerLeave } = useCursor();

		interactivity();

		const { size } = useThrelte();
		const color = $.derived(() => $.store_get($$store_subs ??= {}, '$hovering', hovering) ? '#dddddd' : '#FE3D00');
		const zoom = $.derived(() => $.store_get($$store_subs ??= {}, '$size', size).width / 7);

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				zoom: zoom(),
				position: [5, 5, 5],
				oncreate: (ref) => {
					ref.lookAt(0, 0, 0);
				},
				makeDefault: true
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { 'position.y': 10, 'position.x': 5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.2 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Text($$renderer, {
			text: 'HOVER',
			interactive: true,
			onpointerenter: onPointerEnter,
			onpointerleave: onPointerLeave,
			fontSize: 0.5,
			anchorY: '100%',
			anchorX: '50%',
			'rotation.y': 90 * DEG2RAD,
			'position.y': 1,
			'position.x': -1,
			color: color()
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				onpointerenter: onPointerEnter,
				onpointerleave: onPointerLeave,
				children: ($$renderer) => {
					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: color() });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [2, 2, 2] });
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}