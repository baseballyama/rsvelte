import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChevronRight } from "$lib/icons/index.js";
import { getContext } from "svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<button><!> <div><div class="h-4 w-4 overflow-hidden"><div><!></div></div></div></button>`);

export default function Trigger($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let collapseItem = getContext("collapse");
	let { size, value, defaultExpanded } = getContext("collapseItem");

	if (defaultExpanded) {
		collapseItem.setItem(value);
	}

	let rotate = $.derived(() => {
		if (collapseItem.getItem().includes(value)) {
			return "rotate-90";
		}

		return "";
	});

	// accessibility if its true then set aria-expanded to true else false
	let button = $.state(void 0);

	$.user_effect(() => {
		if ($.get(button)) {
			if (collapseItem.getItem().includes(value)) {
				$.get(button).setAttribute("aria-expanded", "true");
			} else {
				$.get(button).setAttribute("aria-expanded", "false");
			}
		}
	});

	const paddingObj = { small: `py-[12px]`, large: `py-4 lg:py-6` };

	let paddingClass = $.derived(() => {
		return paddingObj[size];
	});

	const textObj = { small: "text-4", large: "text-lg lg:text-[24px]" };

	let textClass = $.derived(() => {
		return textObj[size];
	});

	const onclick = () => {
		const items = collapseItem.getItem();
		const multiple = collapseItem.getMultiple();

		if (!value) return;

		if (multiple) {
			if (items.includes(value)) {
				collapseItem.deleteItem(value);
			} else {
				collapseItem.setItem(value);
			}

			return;
		}

		// single-select behaviour: toggle off if selected, otherwise clear and select the value
		if (items.includes(value)) {
			collapseItem.clearItems();
		} else {
			collapseItem.clearItems();
			collapseItem.setItem(value);
		}
	};

	var button_1 = root_1();

	$.attribute_effect(button_1, () => ({
		onclick,
		class: `flex w-full items-center justify-between bg-transparent text-left ${$.get(paddingClass) ?? ''}`,
		...rest
	}));

	var node = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var node_1 = $.child(span);

			$.snippet(node_1, () => $$props.children);
			$.reset(span);
			$.template_effect(() => $.set_class(span, 1, `${$.get(textClass) ?? ''} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 font-semibold`));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_2 = $.child(div_2);

	ChevronRight(node_2, {});
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(button_1);
	$.bind_this(button_1, ($$value) => $.set(button, $$value), () => $.get(button));
	$.template_effect(() => $.set_class(div_2, 1, `h-4 w-4 ${$.get(rotate) ?? ''} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 transform-gpu duration-200`));
	$.append($$anchor, button_1);
	$.pop();
}