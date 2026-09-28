import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import AttachChild from './AttachChild.svelte';
import { Mesh } from 'three';

export default function Attach($$anchor, $$props) {
	$.push($$props, true);

	let object3d = $.derived(() => $$props.attach ? new Mesh() : undefined);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			name: 'parent',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						AttachChild($$anchor, {
							get object3d() {
								return $.get(object3d);
							}
						});
					};

					var alternate = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						$.component(node_2, () => T.Group, ($$anchor, T_Group_1) => {
							T_Group_1($$anchor, { name: 'child2' });
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_1, ($$render) => {
						if ($.get(object3d)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}