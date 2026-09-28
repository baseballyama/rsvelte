import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { createEventDispatcher } from 'svelte';
import { debugging_context } from '$lib/builder/stores/context';
import { fade } from 'svelte/transition';
import { mod_key_held } from '../../../stores/app/misc';
import { click_to_copy } from '../../../utilities';
import { Code, Edit3, Trash2, ChevronUp, ChevronDown } from 'lucide-svelte';
import { current_user } from '$lib/pocketbase/user';

export default function BlockToolbar_simple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {any} id
		 * @property {any} i
		 * @property {any} [node]
		 * @property {boolean} [is_instance_block]
		 * @property {boolean} [is_last]
		 */
		/** @type {Props} */
		let {
			id,
			i,
			node = void 0,
			is_instance_block = false,
			is_last = false
		} = $$props;

		let isFirst = $.derived(() => i === 0);
		let DEBUGGING = void 0;

		if (browser) DEBUGGING = debugging_context.getOr(false);

		$$renderer.push(`<div class="BlockToolbar primo-reset svelte-18th5ce"><div class="top svelte-18th5ce"><div class="component-button svelte-18th5ce">`);

		if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
			$$renderer.push(`<!--[0--><button aria-label="Edit Block Code"${$.attr_class('svelte-18th5ce', void 0, {
				'showing_key_hint': $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)
			})}>`);

			if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
				$$renderer.push(`<!--[0--><span class="key-hint svelte-18th5ce">⌘ E</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span class="icon svelte-18th5ce">`);
			Code($$renderer, { size: 14 });
			$$renderer.push(`<!----></span></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button aria-label="Edit Block Content" class="svelte-18th5ce"><span class="icon">`);
		Edit3($$renderer, { size: 14 });
		$$renderer.push(`<!----></span> `);

		if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole !== 'developer') {
			$$renderer.push(`<!--[0--><span>Edit Content</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></button> `);

		if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' && browser && window.location.hostname === 'localhost') {
			$$renderer.push(`<!--[0--><button class="block-id svelte-18th5ce"${$.attr('title', `Copy block ID: ${$.stringify(id)}`)}>${$.escape(id)}</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!is_instance_block) {
			$$renderer.push(`<!--[0--><div class="top-right svelte-18th5ce"><button class="button-delete svelte-18th5ce">`);
			Trash2($$renderer, { size: 14 });
			$$renderer.push(`<!----></button> `);

			if (!isFirst()) {
				$$renderer.push(`<!--[0--><button class="svelte-18th5ce">`);
				ChevronUp($$renderer, { size: 14 });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!is_instance_block) {
			$$renderer.push(`<!--[0--><div class="bottom svelte-18th5ce">`);

			if (!is_last) {
				$$renderer.push(`<!--[0--><button class="bottom-right svelte-18th5ce">`);
				ChevronDown($$renderer, { size: 14 });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { node });
	});
}