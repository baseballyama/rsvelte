import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setGlobalInspectOptions } from './options.svelte.js';

export default function InspectOptionsProvider($$anchor, $$props) {
	$.push($$props, true);
	setGlobalInspectOptions(() => $$props.options);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}