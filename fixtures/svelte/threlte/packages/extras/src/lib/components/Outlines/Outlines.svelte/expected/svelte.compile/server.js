import * as $ from 'svelte/internal/server';
import { isInstanceOf, T, useParent, useThrelte } from '@threlte/core';

import {
	BackSide,
	Color,
	Group,
	InstancedMesh,
	Mesh,
	ShaderMaterial,
	SkinnedMesh,
	Uniform,
	Vector2
} from 'three';

import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { fragmentShader, vertexShader } from './shaders.js';
import { fromStore } from 'svelte/store';

export default function Outlines($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			color = 'black',
			screenspace = false,
			opacity = 1,
			transparent = false,
			thickness = 0.05,
			toneMapped = true,
			angle = Math.PI,
			polygonOffset = false,
			polygonOffsetFactor = 0,
			renderOrder = 0,
			children,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { renderer } = useThrelte();

		const uniforms = {
			screenspace: new Uniform(false),
			color: new Uniform(new Color('black')),
			opacity: new Uniform(1),
			thickness: new Uniform(0.05),
			size: new Uniform(new Vector2())
		};

		const group = new Group();
		const material = new ShaderMaterial({ side: BackSide, uniforms, vertexShader, fragmentShader });
		let parent = fromStore(useParent());

		let geometry = $.derived(() => {
			if (!isInstanceOf(parent.current, 'Mesh')) return undefined;

			return toCreasedNormals(parent.current.geometry, angle);
		});

		let mesh = $.derived(() => {
			if (!isInstanceOf(parent.current, 'Mesh')) return;

			if (isInstanceOf(parent.current, 'SkinnedMesh')) {
				const nextMesh = new SkinnedMesh();

				nextMesh.bind(parent.current.skeleton, parent.current.bindMatrix);

				return nextMesh;
			} else if (isInstanceOf(parent.current, 'InstancedMesh')) {
				const nextMesh = new InstancedMesh(undefined, undefined, parent.current.count);

				nextMesh.instanceMatrix = parent.current.instanceMatrix;

				return nextMesh;
			}

			return new Mesh();
		});

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
						T($$renderer, {
							is: mesh(),
							children: ($$renderer) => {
								T($$renderer, { is: geometry() });
								$$renderer.push(`<!----> `);
								T($$renderer, { is: material });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						children?.($$renderer, { ref: group });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}