import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { fade } from 'svelte/transition';
import { createEventDispatcher } from 'svelte';
import { mod_key_held } from '../stores/app/misc';

export default function LargeSwitch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {any} [active_tab_id] - export let tabs
		 * @property {string} [variant]
		 * @property {boolean} [disable_hotkeys]
		 * @property {string} [style]
		 */
		/** @type {Props} */
		let {
			active_tab_id = tabs[0]?.id,
			variant = 'primary',
			disable_hotkeys = false,
			style = ''
		} = $$props;

		function toggle_switch() {
			if (active_tab_id === 'code') {
				active_tab_id = 'content';
			} else {
				active_tab_id = 'code';
			}
		}

		$$renderer.push(`<div${$.attr_class(`LargeSwitch ${$.stringify(variant)}`, 'svelte-uxy6ld')}${$.attr_style(style)}><button class="svelte-uxy6ld"><div${$.attr_class('half svelte-uxy6ld', void 0, {
			'active': active_tab_id === 'code',
			'showing_key_hint': $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !disable_hotkeys && active_tab_id !== 'code'
		})}>`);

		if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !disable_hotkeys && active_tab_id !== 'code') {
			$$renderer.push(`<!--[0--><span class="key-hint svelte-uxy6ld">⌘ E</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="label svelte-uxy6ld">`);
		Icon($$renderer, { icon: 'gravity-ui:code' });

		$$renderer.push(`<!----></span></div> <div${$.attr_class('half svelte-uxy6ld', void 0, {
			'active': active_tab_id === 'content',
			'showing_key_hint': $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !disable_hotkeys && active_tab_id !== 'content'
		})}>`);

		if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !disable_hotkeys && active_tab_id !== 'content') {
			$$renderer.push(`<!--[0--><span class="key-hint svelte-uxy6ld">⌘ E</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="label svelte-uxy6ld">`);
		Icon($$renderer, { icon: 'uil:edit' });

		$$renderer.push(`<!----></span></div> <span class="toggle-back svelte-uxy6ld"${$.attr_style('', {
			transform: active_tab_id === 'code' ? '' : 'translateX(calc(100% + 6px))'
		})}></span></button></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { active_tab_id });
	});
}