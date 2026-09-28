import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Float, useGltf, useSuspense } from '@threlte/extras';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'name']);

export default function Spaceship($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const suspend = useSuspense();
	const gltf = suspend(useGltf(`/models/spaceships/${$$props.name}.gltf`));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { scene } = $.get($$source);

			return { scene };
		});

		var scene = $.derived(() => $.get($$value).scene);
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, $.spread_props(() => rest, {
				children: ($$anchor, $$slotProps) => {
					Float($$anchor, {
						floatIntensity: 3,
						speed: 3,
						children: ($$anchor, $$slotProps) => {
							T($$anchor, {
								get is() {
									return $.get(scene);
								}
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			}));
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}