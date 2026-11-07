import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { teleportControls } from '@threlte/xr';
import { useDraco, useGltf } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);

export default function Surfaces($$anchor, $$props) {
	$.push($$props, true);
	teleportControls('left');
	teleportControls('right');

	const dracoLoader = useDraco();
	const gltf = useGltf('/models/xr/ruins.glb', { dracoLoader });
	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { nodes } = $.get($$source);

			return { nodes };
		});

		var nodes = $.derived(() => $.get($$value).nodes);
		var fragment_1 = root();
		var node_2 = $.first_child(fragment_1);

		$.each(node_2, 16, () => [1, 2, 3, 4, 5, 6, 7, 8, 9], $.index, ($$anchor, n) => {
			T($$anchor, {
				get is() {
					return $.get(nodes)[`teleportBlocker${n}`];
				},

				get visible() {
					return $$props.showBlockers;
				},
				teleportBlocker: true
			});
		});

		var node_3 = $.sibling(node_2, 2);

		$.each(node_3, 16, () => [1, 2, 3], $.index, ($$anchor, n) => {
			T($$anchor, {
				get is() {
					return $.get(nodes)[`teleportSurface${n}`];
				},

				get visible() {
					return $$props.showSurfaces;
				},
				teleportSurface: true
			});
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}