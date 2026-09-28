import * as $ from 'svelte/internal/server';
import { InstancedSpriteMesh } from '@threejs-kit/instanced-sprite-mesh';
import { T, useTask, useThrelte } from '@threlte/core';
import { DoubleSide, Matrix4, MeshBasicMaterial } from 'three';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import SpriteInstance from './SpriteInstance.svelte';

export default function InstancedSprite($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			autoUpdate = true,
			baseMaterial = MeshBasicMaterial,
			fps = 15,
			billboarding,
			playmode = 'FORWARD',
			count = 1000,
			alphaTest = 0.1,
			transparent = true,
			hueShift,
			randomPlaybackOffset = false,
			spritesheet,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const spriteBaseMaterial = new baseMaterial({
			transparent,
			alphaTest,
			// needs to be double side for shading
			side: DoubleSide
		});

		const { renderer } = useThrelte();
		const mesh = new InstancedSpriteMesh(spriteBaseMaterial, count, renderer);
		const animationMap = writable(new Map());

		// BILLBOARDING
		// PLAYMODE
		// RANDOM PLAYBACK OFFSET
		let previousRndOffset = false;

		// going from no offset to random
		// going from random offset to none
		// MATRIX UPDATE - POSITION AND SCALE
		let instanceMatrixNeedsUpdate = false;

		const tempMatrix = new Matrix4();

		const updatePosition = (id, position, scale = [1, 1]) => {
			// Since this uses matrix updates, position and scale have to be updated at the same.
			tempMatrix.makeScale(scale[0], scale[1], 1);

			tempMatrix.setPosition(...position);
			mesh.setMatrixAt(id, tempMatrix);
			instanceMatrixNeedsUpdate = true;
		};

		// Context for user facing components and hooks
		setContext('instanced-sprite-ctx', { sprite: mesh, count, animationMap, updatePosition });

		useTask(() => {
			if (autoUpdate) {
				mesh.update();
			}

			if (instanceMatrixNeedsUpdate) {
				mesh.instanceMatrix.needsUpdate = true;
				instanceMatrixNeedsUpdate = false;
			}
		});

		mesh.update();

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: mesh, frustumCulled: false },
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
						children?.($$renderer, { Instance: SpriteInstance });
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