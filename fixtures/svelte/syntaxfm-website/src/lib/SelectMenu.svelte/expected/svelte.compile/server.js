import * as $ from 'svelte/internal/server';
import { anchor } from '$actions/anchor';
import Icon from './Icon.svelte';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { apply, isSupported } from '@oddbird/popover-polyfill/fn';

export default function SelectMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Polyfill for Popover. Remove once Firefox supports it. https://caniuse.com/?search=popover
		if (!isSupported() && browser) {
			apply();
		}

		let {
			options,
			button_icon = null,
			value_as_label = false,
			button_text,
			popover_id,
			value = '',
			onselect
		} = $$props;

		let id = popover_id.replace('filter-', '');

		// let searchParams = new URLSearchParams(window.location.search);
		let generate_search_params = $.derived(() => (id, value) => {
			const searchParams = new URLSearchParams($.store_get($$store_subs ??= {}, '$page', page).url.search);

			if (!value) {
				searchParams.delete(id);
			} else {
				searchParams.set(id, value);
			}

			return searchParams.toString();
		});

		function closePopoverWhenSelected(node) {
			function handlePopoverSelection(event) {
				if (event.target instanceof HTMLAnchorElement) {
					node.hidePopover();
				}
			}

			node.addEventListener('click', handlePopoverSelection);

			return {
				destroy() {
					node.removeEventListener('click', handlePopoverSelection);
				}
			};
		}

		$$renderer.push(`<div style="position: relative;"><button${$.attr('popovertarget', popover_id)} class="subtle">`);

		if (button_icon) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: button_icon });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (value_as_label) {
			$$renderer.push(`<!--[0-->${$.escape(value)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> ${$.escape(button_text)}</button> <div popover=""${$.attr('id', popover_id)} class="svelte-1l1vm98"><div class="select-menu-menu-wrapper svelte-1l1vm98"><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `?${generate_search_params()(id, option.value)}`)}${$.attr_class('svelte-1l1vm98', void 0, { 'selected': option.value === value })}>${$.escape(option.label)}</a>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}