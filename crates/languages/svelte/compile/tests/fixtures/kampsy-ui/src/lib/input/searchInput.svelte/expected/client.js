import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MagnifyingGlass from "$lib/icons/magnifying-glass.svelte";

var root = $.from_html(`<div><span class="text-kui-light-gray-700 dark:text-kui-dark-gray-700 flex h-full items-center px-3"><div class="h-4 w-4"><!></div></span> <div class="h-full w-full pr-3"><input type="search" class="placeholder:text-kui-light-gray-600 dark:placeholder:text-kui-dark-gray-600 h-full w-full bg-transparent capitalize outline-hidden
             placeholder:text-sm"/></div></div>`);

export default function SearchInput($$anchor, $$props) {
	$.push($$props, true);

	// oxlint-disable-next-line svelte/no-unused-props -- false positive: quoted renamed prop is used in the template
	let araiLabelledBy = $.prop($$props, 'aria-labelledby', 3, undefined),
		value = $.prop($$props, 'value', 15, ""),
		size = $.prop($$props, 'size', 3, "medium"),
		error = $.prop($$props, 'error', 3, undefined),
		disabled = $.prop($$props, 'disabled', 3, false),
		placeholder = $.prop($$props, 'placeholder', 3, undefined);

	// The focus and blur state of the input
	let hasRing = $.state(false);

	const sizeObj = {
		small: "h-8 text-sm",
		medium: "h-[40px] text-sm",
		large: "h-[48px] text-base"
	};

	let sizeClass = $.derived(() => {
		return sizeObj[size()];
	});

	// Show the ring when the input is focused
	let ringClass = $.derived(() => {
		if (disabled()) {
			return `cursor-not-allowed border-kui-light-gray-200 dark:border-kui-dark-gray-400 
			bg-kui-light-gray-100 dark:bg-kui-dark-gray-100`;
		}

		if (error()) {
			return `border-kui-light-red-700 dark:border-kui-dark-red-700 hover:border-kui-light-red-700 
			dark:hover:border-kui-dark-red-700 ring-4 ring-kui-light-red-400 dark:ring-kui-dark-red-400 
			hover:ring-kui-light-red-500 dark:hover:ring-kui-dark-red-500 `;
		}

		if ($.get(hasRing)) {
			return `border-kui-light-gray-700 dark:border-kui-dark-gray-700 ring-4 ring-kui-light-gray-400 
            dark:ring-kui-dark-gray-400 hover:border-kui-light-gray-700 dark:hover:border-kui-dark-gray-700`;
		}

		return `border-kui-light-gray-200 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-700 dark:hover:border-kui-dark-gray-700`;
	});

	var div = root();
	var span = $.child(div);
	var div_1 = $.child(span);
	var node = $.child(div_1);

	MagnifyingGlass(node, {});
	$.reset(div_1);
	$.reset(span);

	var div_2 = $.sibling(span, 2);
	var input = $.child(div_2);

	$.remove_input_defaults(input);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `flex items-center ${$.get(sizeClass) ?? ''} overflow-hidden border transition-all ${$.get(ringClass) ?? ''} rounded-md`);
		$.set_attribute(input, 'aria-labelledby', araiLabelledBy());
		$.set_attribute(input, 'placeholder', placeholder());
		input.disabled = disabled();
	});

	$.event('focus', input, () => {
		$.set(hasRing, true);
	});

	$.event('blur', input, () => {
		$.set(hasRing, false);
	});

	$.bind_value(input, value);
	$.append($$anchor, div);
	$.pop();
}