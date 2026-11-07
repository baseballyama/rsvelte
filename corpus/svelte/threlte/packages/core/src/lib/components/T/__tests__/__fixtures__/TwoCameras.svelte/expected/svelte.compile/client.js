import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function TwoCameras($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, position: [1, 2, 3] });
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
				T_OrthographicCamera($$anchor, { makeDefault: true, position: [4, 5, 6] });
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.showSecond) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}