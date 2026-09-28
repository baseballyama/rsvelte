import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

export default function Main($$anchor) {
	const not_hoisted = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.component(node, () => object.property, ($$anchor, object_property) => {
			object_property($$anchor, {});
		});

		$.append($$anchor, fragment);
	};

	const object = { property: Component };

	not_hoisted($$anchor);
}