import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { injectPlugin } from '@threlte/core';

export default function InjectPlugin($$anchor, $$props) {
	$.push($$props, true);
	injectPlugin($$props.name, $$props.plugin);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}