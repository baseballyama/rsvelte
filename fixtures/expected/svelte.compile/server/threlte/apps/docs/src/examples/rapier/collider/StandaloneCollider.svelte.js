import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Collider } from '@threlte/rapier';
import Emitter from './Emitter.svelte';
import TestBed from './TestBed.svelte';

export default function StandaloneCollider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				rotation: [0, 45 * MathUtils.DEG2RAD, 0],
				position: [0, 1, 0],
				children: ($$renderer) => {
					Collider($$renderer, { shape: 'cuboid', args: [1, 1, 1] });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Emitter($$renderer, {});
		$$renderer.push(`<!----> `);

		{
			function text($$renderer) {
				$$renderer.push(`<div><p>This collider is not a child of a &lt;RigidBody> component.<br/> It will participate in contacts and collisions but is not affected by gravity or external forces.
        This can be useful for the environment.</p></div>`);
			}

			TestBed($$renderer, { title: 'Standalone Collider', text, $$slots: { text: true } });
		}

		$$renderer.push(`<!---->`);
	});
}