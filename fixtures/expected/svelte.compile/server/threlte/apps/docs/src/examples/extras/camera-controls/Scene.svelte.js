import * as $ from 'svelte/internal/server';
import { Mesh } from 'three';
import { T } from '@threlte/core';
import { Grid, CameraControls } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { controls = void 0, mesh = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CameraControls($$renderer, {
				oncreate: (ref) => {
					ref.setPosition(5, 5, 5);
				},

				get ref() {
					return controls;
				},

				set ref($$value) {
					controls = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'position.y': 0.5,
					get ref() {
						return mesh;
					},

					set ref($$value) {
						mesh = $$value;
						$$settled = false;
					},

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

						if (T.MeshBasicMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshBasicMaterial($$renderer, { color: '#ff3e00', wireframe: true });
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

			Grid($$renderer, {
				sectionColor: '#ff3e00',
				sectionThickness: 1,
				cellColor: '#cccccc',
				gridSize: 40
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { controls, mesh });
	});
}