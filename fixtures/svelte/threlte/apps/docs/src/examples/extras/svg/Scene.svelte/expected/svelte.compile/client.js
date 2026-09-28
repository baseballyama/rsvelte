import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { SVG, OrbitControls } from '@threlte/extras';
import url from './ordering.svg?url';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 5,
			'position.y': 1,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotate: true, enablePan: false, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			SVG($$anchor, {
				src: '/icons/svelte.svg',
				scale: 0.005,
				'position.x': -1.2,
				'position.y': 1.5
			});
		};

		var alternate = ($$anchor) => {
			SVG($$anchor, {
				get src() {
					return url;
				},
				scale: 0.005,
				'position.x': -1.2,
				'position.y': 1.5
			});
		};

		$.if(node_1, ($$render) => {
			if ($$props.selection == 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}