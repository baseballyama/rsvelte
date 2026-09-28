import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Grid, OrbitControls, Text } from '@threlte/extras';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	let textProps = $.rest_props($$props, rest_excludes);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			zoom: 80,
			position: [0, 5, 10],
			makeDefault: true,
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	OrbitControls(node_1, {
		autoRotate: true,
		enableDamping: true,
		enableZoom: false,
		autoRotateSpeed: 0.3
	});

	var node_2 = $.sibling(node_1, 2);

	Text(node_2, $.spread_props({ 'position.y': 0.5 }, () => textProps));

	var node_3 = $.sibling(node_2, 2);

	Grid(node_3, { sectionColor: '#FF3E00' });
	$.append($$anchor, fragment);
}