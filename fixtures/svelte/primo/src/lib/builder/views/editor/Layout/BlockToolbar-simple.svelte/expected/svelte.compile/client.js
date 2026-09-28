import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { createEventDispatcher } from 'svelte';
import { debugging_context } from '$lib/builder/stores/context';
import { fade } from 'svelte/transition';
import { mod_key_held } from '../../../stores/app/misc';
import { click_to_copy } from '../../../utilities';
import { Code, Edit3, Trash2, ChevronUp, ChevronDown } from 'lucide-svelte';
import { current_user } from '$lib/pocketbase/user';

var root = $.from_html(`<span class="key-hint svelte-18th5ce">⌘ E</span>`);
var root_1 = $.from_html(`<button aria-label="Edit Block Code"><!> <span class="icon svelte-18th5ce"><!></span></button>`);
var root_2 = $.from_html(`<span>Edit Content</span>`);
var root_3 = $.from_html(`<button class="block-id svelte-18th5ce"> </button>`);
var root_4 = $.from_html(`<button class="svelte-18th5ce"><!></button>`);
var root_5 = $.from_html(`<div class="top-right svelte-18th5ce"><button class="button-delete svelte-18th5ce"><!></button> <!></div>`);
var root_6 = $.from_html(`<button class="bottom-right svelte-18th5ce"><!></button>`);
var root_7 = $.from_html(`<div class="bottom svelte-18th5ce"><!></div>`);
var root_8 = $.from_html(`<div class="BlockToolbar primo-reset svelte-18th5ce"><div class="top svelte-18th5ce"><div class="component-button svelte-18th5ce"><!> <button aria-label="Edit Block Content" class="svelte-18th5ce"><span class="icon"><!></span> <!></button> <!></div> <!></div> <!></div>`);

export default function BlockToolbar_simple($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let node = $.prop($$props, 'node', 15),
		is_instance_block = $.prop($$props, 'is_instance_block', 3, false),
		is_last = $.prop($$props, 'is_last', 3, false);

	let isFirst = $.derived(() => $$props.i === 0);
	let DEBUGGING = $.state(void 0);

	if (browser) $.set(DEBUGGING, debugging_context.getOr(false), true);

	var div = root_8();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var button = root_1();
			let classes;
			var node_2 = $.child(button);

			{
				var consequent = ($$anchor) => {
					var span = root();

					$.append($$anchor, span);
				};

				$.if(node_2, ($$render) => {
					if ($mod_key_held()) $$render(consequent);
				});
			}

			var span_1 = $.sibling(node_2, 2);
			var node_3 = $.child(span_1);

			Code(node_3, { size: 14 });
			$.reset(span_1);
			$.reset(button);
			$.template_effect(() => classes = $.set_class(button, 1, 'svelte-18th5ce', null, classes, { showing_key_hint: $mod_key_held() }));
			$.delegated('click', button, () => dispatch('edit-code'));
			$.append($$anchor, button);
		};

		$.if(node_1, ($$render) => {
			if ($current_user()?.siteRole === 'developer') $$render(consequent_1);
		});
	}

	var button_1 = $.sibling(node_1, 2);
	var span_2 = $.child(button_1);
	var node_4 = $.child(span_2);

	Edit3(node_4, { size: 14 });
	$.reset(span_2);

	var node_5 = $.sibling(span_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var span_3 = root_2();

			$.append($$anchor, span_3);
		};

		$.if(node_5, ($$render) => {
			if ($current_user()?.siteRole !== 'developer') $$render(consequent_2);
		});
	}

	$.reset(button_1);

	var node_6 = $.sibling(button_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var button_2 = root_3();
			var text = $.only_child(button_2, true);

			$.action(button_2, ($$node) => click_to_copy?.($$node));

			$.template_effect(() => {
				$.set_attribute(button_2, 'title', `Copy block ID: ${$$props.id ?? ''}`);
				$.set_text(text, $$props.id);
			});

			$.append($$anchor, button_2);
		};

		$.if(node_6, ($$render) => {
			if ($current_user()?.siteRole === 'developer' && browser && window.location.hostname === 'localhost') $$render(consequent_3);
		});
	}

	$.reset(div_2);

	var node_7 = $.sibling(div_2, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_5();
			var button_3 = $.child(div_3);
			var node_8 = $.child(button_3);

			Trash2(node_8, { size: 14 });
			$.reset(button_3);

			var node_9 = $.sibling(button_3, 2);

			{
				var consequent_4 = ($$anchor) => {
					var button_4 = root_4();
					var node_10 = $.child(button_4);

					ChevronUp(node_10, { size: 14 });
					$.reset(button_4);
					$.delegated('click', button_4, () => dispatch('moveUp'));
					$.append($$anchor, button_4);
				};

				$.if(node_9, ($$render) => {
					if (!$.get(isFirst)) $$render(consequent_4);
				});
			}

			$.reset(div_3);
			$.delegated('click', button_3, () => dispatch('delete'));
			$.append($$anchor, div_3);
		};

		$.if(node_7, ($$render) => {
			if (!is_instance_block()) $$render(consequent_5);
		});
	}

	$.reset(div_1);

	var node_11 = $.sibling(div_1, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_4 = root_7();
			var node_12 = $.child(div_4);

			{
				var consequent_6 = ($$anchor) => {
					var button_5 = root_6();
					var node_13 = $.child(button_5);

					ChevronDown(node_13, { size: 14 });
					$.reset(button_5);
					$.delegated('click', button_5, () => dispatch('moveDown'));
					$.append($$anchor, button_5);
				};

				$.if(node_12, ($$render) => {
					if (!is_last()) $$render(consequent_6);
				});
			}

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_11, ($$render) => {
			if (!is_instance_block()) $$render(consequent_7);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => node($$value), () => node());
	$.delegated('click', button_1, () => dispatch('edit-content'));
	$.transition(1, div, () => fade, () => ({ duration: 100 }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);