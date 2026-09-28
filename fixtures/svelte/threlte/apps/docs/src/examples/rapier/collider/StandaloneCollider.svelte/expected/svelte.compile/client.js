import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Collider } from '@threlte/rapier';
import Emitter from './Emitter.svelte';
import TestBed from './TestBed.svelte';

var root = $.from_html(`<div><p> <br/> It will participate in contacts and collisions but is not affected by gravity or external forces.
        This can be useful for the environment.</p></div>`);

var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function StandaloneCollider($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [0, 45 * MathUtils.DEG2RAD, 0]);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get rotation() {
					return $.get($0);
				},
				position: [0, 1, 0],
				children: ($$anchor, $$slotProps) => {
					Collider($$anchor, { shape: 'cuboid', args: [1, 1, 1] });
				},
				$$slots: { default: true }
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	Emitter(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	{
		const text = ($$anchor) => {
			var div = root();
			var p = $.child(div);
			var text_1 = $.child(p);

			text_1.nodeValue = 'This collider is not a child of a <RigidBody> component.';
			$.next(2);
			$.reset(p);
			$.reset(div);
			$.append($$anchor, div);
		};

		TestBed(node_2, { title: 'Standalone Collider', text, $$slots: { text: true } });
	}

	$.append($$anchor, fragment);
	$.pop();
}