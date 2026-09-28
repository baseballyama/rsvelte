import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { useOptions } from './options.svelte.js';
import { createState, STATE_CONTEXT_KEY } from './state.svelte.js';
import { build_search_index } from './util/search.js';

export default function CollapseStateProvider($$anchor, $$props) {
	$.push($$props, true);

	const keys = $.prop($$props, 'keys', 19, () => []);
	const initState = $.proxy({});
	const inspectState = createState(initState, (state) => $$props.onCollapseChange?.(state));
	const options = useOptions();

	setContext(STATE_CONTEXT_KEY, inspectState);

	setContext(Symbol.for('siv.build-index'), () => build_search_index({
		value: keys().length ? $$props.values : $$props.value,
		key: keys().length ? '' : $$props.name,
		maxDepth: 20,
		options: options.value
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}