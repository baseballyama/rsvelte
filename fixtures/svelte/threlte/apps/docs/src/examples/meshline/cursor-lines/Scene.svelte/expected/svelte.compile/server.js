import * as $ from 'svelte/internal/server';
import CursorLine from './CursorLine.svelte';
import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { T } from '@threlte/core';
import { interactivity } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		interactivity();

		const cursorPosition = new Spring([0, 0, 0]);

		const colors = [
			'#0000ff',
			'#00ff00',
			'#00ffff',
			'#ff0000',
			'#ff00ff',
			'#ffff00'
		];

		const m = 2 * Math.PI / colors.length;

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(colors);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let color = each_array[i];
			const a = m * i;

			{
				function children($$renderer, { getPoints }) {
					MeshLineGeometry($$renderer, { points: getPoints(), shape: 'taper' });
					$$renderer.push(`<!----> `);
					MeshLineMaterial($$renderer, { width: 10, color, attenuate: false });
					$$renderer.push(`<!---->`);
				}

				CursorLine($$renderer, {
					color,
					cursorPosition: cursorPosition.current,
					'position.x': 0.5 * Math.cos(a),
					'position.y': 0.5 * Math.sin(a),
					children,
					$$slots: { default: true }
				});
			}
		}

		$$renderer.push(`<!--]--> `);

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');
			T.OrthographicCamera($$renderer, { zoom: 50, makeDefault: true });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				visible: false,
				onpointermove: (event) => {
					cursorPosition.set(event.point.toArray());
				},
				'position.z': -10,
				scale: 100,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, {});
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
	});
}