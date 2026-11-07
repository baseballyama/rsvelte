import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'component',
	'onDragStart',
	'decorationClasses'
]);

export default function NodeViewFrame($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	setContext('onDragStart', () => $$props.onDragStart);
	setContext('decorationClasses', () => $$props.decorationClasses);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.component, ($$anchor, Component_1) => {
		Component_1($$anchor, $.spread_props(() => props));
	});

	$.append($$anchor, fragment);
	$.pop();
}