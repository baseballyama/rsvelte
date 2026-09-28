import * as $ from 'svelte/internal/server';
import { dashboard, lang, ripple, record } from '$lib/Stores';
import { createEventDispatcher, tick } from 'svelte';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';
import { generateId } from '$lib/Utils';

export default function ViewButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		/**
		 * Adds a new view to `$dashboard`
		 */
		async function handleClick() {
			// if a view with the default name "Overview" already exists
			// append an increasing number to the name e.g. "Overview 2"
			const placeholder = $.store_get($$store_subs ??= {}, '$lang', lang)('overview');

			const id = generateId($.store_get($$store_subs ??= {}, '$dashboard', dashboard));
			let count = 1;
			let name = placeholder;

			while ($.store_get($$store_subs ??= {}, '$dashboard', dashboard).views.find((view) => view.name === name)) {
				count += 1;
				name = `${placeholder} ${count}`;
			}

			// prepend view
			$.store_mutate($$store_subs ??= {}, '$dashboard', dashboard, $.store_get($$store_subs ??= {}, '$dashboard', dashboard).views = [
				{ name, id, sections: [] },
				...$.store_get($$store_subs ??= {}, '$dashboard', dashboard).views
			]);

			$.store_get($$store_subs ??= {}, '$record', record)();

			// click new view
			await tick();

			const button = document.getElementById(String(id));

			if (button) {
				button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
				button.click();
			}

			dispatch('clicked');
		}

		$$renderer.push(`<button class="button dropdown"><figure${$.attr_style('', { width: '1.35rem' })}>`);
		Icon($$renderer, { icon: 'fluent:tab-add-24-filled', height: 'none' });
		$$renderer.push(`<!----></figure> ${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('add_view'))}</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}