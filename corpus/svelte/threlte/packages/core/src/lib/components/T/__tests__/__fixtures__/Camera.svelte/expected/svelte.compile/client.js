import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

export default function Camera($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, { makeDefault: true, position: [1, 2, 3] });
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
				T_OrthographicCamera($$anchor, { makeDefault: true, position: [4, 5, 6] });
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.perspective) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}