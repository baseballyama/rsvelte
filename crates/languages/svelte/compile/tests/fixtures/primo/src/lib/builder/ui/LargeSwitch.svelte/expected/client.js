import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import { fade } from 'svelte/transition';
import { createEventDispatcher } from 'svelte';
import { mod_key_held } from '../stores/app/misc';

var root = $.from_html(`<span class="key-hint svelte-uxy6ld">&#8984; E</span>`);
var root_1 = $.from_html(`<div><button class="svelte-uxy6ld"><div><!> <span class="label svelte-uxy6ld"><!></span></div> <div><!> <span class="label svelte-uxy6ld"><!></span></div> <span class="toggle-back svelte-uxy6ld"></span></button></div>`);

export default function LargeSwitch($$anchor, $$props) {
	$.push($$props, true);

	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {any} [active_tab_id] - export let tabs
	 * @property {string} [variant]
	 * @property {boolean} [disable_hotkeys]
	 * @property {string} [style]
	 */
	/** @type {Props} */
	let active_tab_id = $.prop($$props, 'active_tab_id', 31, () => $.proxy(tabs[0]?.id)),
		variant = $.prop($$props, 'variant', 3, 'primary'),
		disable_hotkeys = $.prop($$props, 'disable_hotkeys', 3, false),
		style = $.prop($$props, 'style', 3, '');

	function toggle_switch() {
		if (active_tab_id() === 'code') {
			active_tab_id('content');
		} else {
			active_tab_id('code');
		}
	}

	$.user_effect(() => {
		dispatch('switch', active_tab_id());
	});

	var div = root_1();
	var button = $.child(div);
	var div_1 = $.child(button);
	let classes;
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($mod_key_held() && !disable_hotkeys() && active_tab_id() !== 'code') $$render(consequent);
		});
	}

	var span_1 = $.sibling(node, 2);
	var node_1 = $.child(span_1);

	Icon(node_1, { icon: 'gravity-ui:code' });
	$.reset(span_1);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	let classes_1;
	var node_2 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var span_2 = root();

			$.append($$anchor, span_2);
		};

		$.if(node_2, ($$render) => {
			if ($mod_key_held() && !disable_hotkeys() && active_tab_id() !== 'content') $$render(consequent_1);
		});
	}

	var span_3 = $.sibling(node_2, 2);
	var node_3 = $.child(span_3);

	Icon(node_3, { icon: 'uil:edit' });
	$.reset(span_3);
	$.reset(div_2);

	var span_4 = $.sibling(div_2, 2);
	let styles;

	$.reset(button);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `LargeSwitch ${variant() ?? ''}`, 'svelte-uxy6ld');
		$.set_style(div, style());

		classes = $.set_class(div_1, 1, 'half svelte-uxy6ld', null, classes, {
			active: active_tab_id() === 'code',
			showing_key_hint: $mod_key_held() && !disable_hotkeys() && active_tab_id() !== 'code'
		});

		classes_1 = $.set_class(div_2, 1, 'half svelte-uxy6ld', null, classes_1, {
			active: active_tab_id() === 'content',
			showing_key_hint: $mod_key_held() && !disable_hotkeys() && active_tab_id() !== 'content'
		});

		styles = $.set_style(span_4, '', styles, {
			transform: active_tab_id() === 'code' ? '' : 'translateX(calc(100% + 6px))'
		});
	});

	$.delegated('click', button, toggle_switch);
	$.transition(1, div, () => fade, () => ({ duration: 200 }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);