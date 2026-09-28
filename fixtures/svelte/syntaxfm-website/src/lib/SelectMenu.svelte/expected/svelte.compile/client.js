import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { anchor } from '$actions/anchor';
import Icon from './Icon.svelte';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { apply, isSupported } from '@oddbird/popover-polyfill/fn';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<div style="position: relative;"><button class="subtle"><!> <!> </button> <div popover="" class="svelte-1l1vm98"><div class="select-menu-menu-wrapper svelte-1l1vm98"></div></div></div>`);

export default function SelectMenu($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Polyfill for Popover. Remove once Firefox supports it. https://caniuse.com/?search=popover
	if (!isSupported() && browser) {
		apply();
	}

	let button_icon = $.prop($$props, 'button_icon', 3, null),
		value_as_label = $.prop($$props, 'value_as_label', 3, false),
		value = $.prop($$props, 'value', 3, '');

	let id = $$props.popover_id.replace('filter-', '');

	// let searchParams = new URLSearchParams(window.location.search);
	let generate_search_params = $.derived(() => (id, value) => {
		const searchParams = new URLSearchParams($page().url.search);

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

	var div = root_1();
	var button = $.child(div);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			Icon($$anchor, {
				get name() {
					return button_icon();
				}
			});
		};

		$.if(node_1, ($$render) => {
			if (button_icon()) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, value()));
			$.append($$anchor, text);
		};

		$.if(node_2, ($$render) => {
			if (value_as_label()) $$render(consequent_1);
		});
	}

	var text_1 = $.sibling(node_2);

	$.reset(button);
	$.action(button, ($$node, $$action_arg) => anchor?.($$node, $$action_arg), () => ({ id: $$props.popover_id, position: ['BOTTOM', 'LEFT'] }));

	var div_1 = $.sibling(button, 2);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => $$props.options, $.index, ($$anchor, option) => {
		var a = root();
		let classes;
		var text_2 = $.only_child(a, true);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', $0);
				classes = $.set_class(a, 1, 'svelte-1l1vm98', null, classes, { selected: $.get(option).value === value() });
				$.set_text(text_2, $.get(option).label);
			},
			[
				() => `?${$.get(generate_search_params)(id, $.get(option).value)}`
			]
		);

		$.append($$anchor, a);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.action(div_1, ($$node) => closePopoverWhenSelected?.($$node));
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'popovertarget', $$props.popover_id);
		$.set_text(text_1, ` ${$$props.button_text ?? ''}`);
		$.set_attribute(div_1, 'id', $$props.popover_id);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}