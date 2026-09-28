import * as $ from 'svelte/internal/server';
import { paletteStore } from '../store/PaletteStore';
import { onDestroy, getContext } from 'svelte';
import Result from './Result.svelte';
import { getNonEmptyArray, groupActions } from '../utils';
import { THEME_CONTEXT } from '../constants';

export default function ResultPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { emptyState } = $$props;
		let actions = [];

		const unsubscribe = paletteStore.subscribe((value) => {
			actions = value.results.length > 0
				? getNonEmptyArray(value.results)
				: getNonEmptyArray(value.commands);
		});

		const themeCtx = getContext(THEME_CONTEXT);
		const { resultsContainerClass, unstyled, resultsContainerStyle } = $.store_get($$store_subs ??= {}, '$themeCtx', themeCtx);

		// Group actions by their group property
		let groupedActions = $.derived(() => groupActions(actions));

		onDestroy(unsubscribe);

		if (actions.length > 0) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(resultsContainerClass), 'svelte-1wexb39', { 'cp-results': !unstyled })}${$.attr_style(resultsContainerStyle)} role="listbox" id="command-palette-results"><!--[-->`);

			const each_array = $.ensure_array_like([...groupedActions().entries()]);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let [groupName, groupActions] = each_array[$$index_1];

				if (groupName) {
					$$renderer.push(`<!--[0--><div class="cp-group-header svelte-1wexb39">${$.escape(groupName)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array_1 = $.ensure_array_like(groupActions);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let action = each_array_1[$$index];

					Result($$renderer, { action });
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="cp-empty svelte-1wexb39">`);

			if (emptyState) {
				$$renderer.push('<!--[0-->');
				emptyState($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><div class="cp-empty-content svelte-1wexb39"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <p class="svelte-1wexb39">No results found</p> <span class="svelte-1wexb39">Try a different search term</span></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}