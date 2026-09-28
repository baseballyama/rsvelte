import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function AttachChild($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	T(node, {
		get is() {
			return $$props.object3d;
		},
		name: 'child'
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [$$props.object3d, 'red']);

		$.component(node_1, () => T.BoxHelper, ($$anchor, T_BoxHelper) => {
			T_BoxHelper($$anchor, {
				get args() {
					return $.get($0);
				}
			});
		});
	}

	$.append($$anchor, fragment);
}