import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { touchControls, useXR, Controller, Hand } from '@threlte/xr';
import TouchDebug from './TouchDebug.svelte';
import Button from './Button.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $isPresenting = () => $.store_get(isPresenting, '$isPresenting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { isPresenting } = useXR();

	touchControls('left');
	touchControls('right');

	let debug = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Controller(node, { left: true });

	var node_1 = $.sibling(node, 2);

	Controller(node_1, { right: true });

	var node_2 = $.sibling(node_1, 2);

	Hand(node_2, { left: true });

	var node_3 = $.sibling(node_2, 2);

	Hand(node_3, { right: true });

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, { position: [-0.18, 1.3, -0.25], color: '#e11d48' });

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, { position: [-0.06, 1.3, -0.25], color: '#16a34a' });

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, { position: [0.06, 1.3, -0.25], color: '#2563eb' });

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		position: [0.18, 1.3, -0.25],
		color: '#6b7280',
		onclick: () => $.set(debug, !$.get(debug))
	});

	var node_8 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => $isPresenting() ? 1 : 0.001);

		$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				'position.y': 1.3,
				'position.z': -0.3,
				get scale() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_9 = $.first_child(fragment_1);

					$.component(node_9, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
						T_PlaneGeometry($$anchor, { args: [0.6, 0.2] });
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, { color: '#1f2937', transparent: true, opacity: 0.6 });
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_11 = $.sibling(node_8, 2);

	{
		var consequent = ($$anchor) => {
			TouchDebug($$anchor, {});
		};

		$.if(node_11, ($$render) => {
			if ($.get(debug)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}