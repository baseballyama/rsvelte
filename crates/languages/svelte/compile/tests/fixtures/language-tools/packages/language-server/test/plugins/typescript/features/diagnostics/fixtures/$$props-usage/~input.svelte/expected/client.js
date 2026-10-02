import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Props from '../$$props-valid/input.svelte';
import PropsInvalid3 from './$$props-invalid3.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	// @ts-expect-error
	Props(node, { exported1: 'valid', exported2: 'valid', exported3: 'valid' });

	var node_1 = $.sibling(node, 2);

	PropsInvalid3(node_1, { exported1: true });

	var node_2 = $.sibling(node_1, 2);

	Props(node_2, { exported1: true, exported2: 'valid' });

	var node_3 = $.sibling(node_2, 2);

	Props(node_3, { exported1: 'valid', exported2: 'valid', invalidProp: true });

	var node_4 = $.sibling(node_3, 2);

	Props(node_4, {});
	$.append($$anchor, fragment);
}