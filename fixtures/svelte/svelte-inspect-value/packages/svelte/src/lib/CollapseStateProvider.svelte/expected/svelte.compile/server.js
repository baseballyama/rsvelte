import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { useOptions } from './options.svelte.js';
import { createState, STATE_CONTEXT_KEY } from './state.svelte.js';
import { build_search_index } from './util/search.js';

export default function CollapseStateProvider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, onCollapseChange, value, values, name, keys = [] } = $$props;
		const initState = {};
		const inspectState = createState(initState, (state) => onCollapseChange?.(state));
		const options = useOptions();

		setContext(STATE_CONTEXT_KEY, inspectState);

		setContext(Symbol.for('siv.build-index'), () => build_search_index({
			value: keys.length ? values : value,
			key: keys.length ? '' : name,
			maxDepth: 20,
			options: options.value
		}));

		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}