import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { randomString } from "$lib/utils/random.js";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="relative flex h-full w-full items-center justify-center rounded-full"><!></div>`);
var root_2 = $.from_html(`<span><!></span>`);
var root_3 = $.from_html(`<label class="inline-flex cursor-pointer items-center gap-3"><!> <input type="checkbox" class="hidden"/> <div><div><div><!></div></div></div></label>`);

export default function Toggle($$anchor, $$props) {
	$.push($$props, true);

	const // random string for unique id
	icons = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_1 = ($$anchor) => {
				var div = root_1();
				var node_1 = $.child(div);

				{
					var consequent = ($$anchor) => {
						const CheckedIcon = $.derived(() => icon().checked);
						var div_1 = root();
						var node_2 = $.child(div_1);

						$.component(node_2, () => $.get(CheckedIcon), ($$anchor, CheckedIcon_1) => {
							CheckedIcon_1($$anchor, {});
						});

						$.reset(div_1);
						$.template_effect(() => $.set_class(div_1, 1, `absolute ${$.get(iconSizeClass) ?? ''}`));
						$.append($$anchor, div_1);
					};

					var alternate = ($$anchor) => {
						const UncheckedIcon = $.derived(() => icon().unchecked);
						var div_2 = root();
						var node_3 = $.child(div_2);

						$.component(node_3, () => $.get(UncheckedIcon), ($$anchor, UncheckedIcon_1) => {
							UncheckedIcon_1($$anchor, {});
						});

						$.reset(div_2);
						$.template_effect(() => $.set_class(div_2, 1, `absolute ${$.get(iconSizeClass) ?? ''}`));
						$.append($$anchor, div_2);
					};

					$.if(node_1, ($$render) => {
						if (checked()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div);
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if (icon()) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment);
	};

	let size = $.prop($$props, 'size', 3, "small"),
		color = $.prop($$props, 'color', 3, "blue"),
		checked = $.prop($$props, 'checked', 15, false),
		disabled = $.prop($$props, 'disabled', 3, undefined),
		direction = $.prop($$props, 'direction', 3, "switch-last"),
		icon = $.prop($$props, 'icon', 3, undefined),
		children = $.prop($$props, 'children', 3, undefined);

	const onchange = () => {
		checked(!checked());
	};

	// random string for unique id
	const unique = `${randomString(4)}`;

	const sizeContObj = { small: "w-7.5 h-4", large: "w-12.5 h-6.5" };

	let sizeContClass = $.derived(() => {
		return sizeContObj[size()];
	});

	const sizeThumbObj = { small: "w-3 h-3", large: "w-[22px] h-[22px]" };

	let sizeThumbClass = $.derived(() => {
		return sizeThumbObj[size()];
	});

	const iconSizeObj = { small: "w-2.5 h-2.5", large: "w-4 h-4" };

	let iconSizeClass = $.derived(() => {
		return iconSizeObj[size()];
	});

	let childLableClass = $.derived(() => {
		if (direction() === "switch-first") {
			return `order-last`;
		}

		return ``;
	});

	const colorObj = {
		blue: "bg-kui-light-blue-700 dark:bg-kui-dark-blue-700 border-kui-light-blue-800 dark:border-kui-dark-blue-800",
		purple: "bg-kui-light-purple-700 dark:bg-kui-dark-purple-700 border-kui-light-purple-800 dark:border-kui-dark-purple-800",
		amber: "bg-kui-light-amber-700 dark:bg-kui-dark-amber-700 border-kui-light-amber-800 dark:border-kui-dark-amber-800",
		red: "bg-kui-light-red-700 dark:bg-kui-dark-red-700 border-kui-light-red-800 dark:border-kui-dark-red-800",
		pink: "bg-kui-light-pink-700  dark:bg-kui-dark-pink-700 border-kui-light-pink-800 dark:border-kui-dark-pink-800",
		green: "bg-kui-light-green-700 dark:bg-kui-dark-green-700 border-kui-light-green-800 dark:border-kui-dark-green-800",
		teal: "bg-kui-light-teal-700 dark:bg-kui-dark-teal-700 border-kui-light-teal-800 dark:border-kui-dark-teal-800"
	};

	let toogleContClass = $.derived(() => {
		if (checked()) {
			return `${colorObj[color()]}`;
		}

		return `bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 border-black/8
		 dark:border-kui-dark-gray-400`;
	});

	let thumbClass = $.derived(() => {
		if (checked()) {
			return `bg-white border-white dark:text-kui-light-gray-1000 dark:text-kui-dark-gray-1000
			translate-x-full`;
		}

		return `bg-kui-light-bg-secondary border-kui-light-gray-200 dark:bg-white dark:text-kui-light-gray-1000`;
	});

	var label = root_3();
	var node_4 = $.child(label);

	{
		var consequent_2 = ($$anchor) => {
			var span = root_2();
			var node_5 = $.child(span);

			$.snippet(node_5, children);
			$.reset(span);
			$.template_effect(() => $.set_class(span, 1, `${$.get(childLableClass) ?? ''} text-kui-light-gray-800 dark:text-kui-dark-gray-900 text-xs select-none`));
			$.append($$anchor, span);
		};

		$.if(node_4, ($$render) => {
			if (children()) $$render(consequent_2);
		});
	}

	var input = $.sibling(node_4, 2);

	$.remove_input_defaults(input);

	var div_3 = $.sibling(input, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node_6 = $.child(div_5);

	icons(node_6);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(label);

	$.template_effect(() => {
		$.set_attribute(label, 'for', unique);
		$.set_checked(input, checked());
		$.set_attribute(input, 'aria-label', $$props['aria-label']);
		$.set_attribute(input, 'id', unique);
		input.disabled = disabled();
		$.set_class(div_4, 1, `relative ${$.get(sizeContClass) ?? ''} flex items-center rounded-full border ${$.get(toogleContClass) ?? ''}`);
		$.set_class(div_5, 1, `absolute ${$.get(sizeThumbClass) ?? ''} inset-s-0.5 rounded-full border transition-all ${$.get(thumbClass) ?? ''}`);
	});

	$.delegated('change', input, onchange);
	$.append($$anchor, label);
	$.pop();
}

$.delegate(['change']);