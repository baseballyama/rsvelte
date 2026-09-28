import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Error from "$lib/icons/error.svelte";
import { randomString } from "$lib/utils/random.js";

var root = $.from_html(`<div class="mt-2"><div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4"><!></div> <div> </div></div></div>`);
var root_1 = $.from_html(`<div class="w-full"><textarea autocapitalize="off" autocomplete="off" rows="4"></textarea> <!></div>`);
var root_2 = $.from_html(`<label><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-2 inline-block text-sm"> </div> <!></label>`);

export default function Textarea($$anchor, $$props) {
	$.push($$props, true);

	const // oxlint-disable-next-line svelte/no-unused-props -- false positive: quoted renamed prop is used in the template
	// The focus and blur state of the input
	// The name is used on the label and input name
	// Assign defaultValue if it is not ''
	textAreaSnip = ($$anchor) => {
		var div = root_1();
		var textarea = $.child(div);

		$.remove_textarea_child(textarea);

		var node = $.sibling(textarea, 2);

		{
			var consequent = ($$anchor) => {
				var div_1 = root();
				var div_2 = $.child(div_1);
				var div_3 = $.child(div_2);
				var node_1 = $.child(div_3);

				Error(node_1, {});
				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var text_1 = $.only_child(div_4, true);

				$.reset(div_2);
				$.reset(div_1);

				$.template_effect(() => {
					$.set_class(div_4, 1, `font-medium ${$.get(text) ?? ''} text-kui-light-red-900 dark:text-kui-dark-red-900`);
					$.set_text(text_1, error());
				});

				$.append($$anchor, div_1);
			};

			$.if(node, ($$render) => {
				if (error()) $$render(consequent);
			});
		}

		$.reset(div);

		$.template_effect(() => {
			$.set_attribute(textarea, 'id', $.get(inputID));
			$.set_attribute(textarea, 'name', name());
			$.set_attribute(textarea, 'aria-labelledby', araiLabelledBy());

			$.set_class(textarea, 1, ` border transition-all ${$.get(textareaClass) ?? ''} bg-kui-light-bg dark:bg-kui-dark-bg block w-full rounded-md px-[12px]
		 py-[10px] outline-hidden`);

			$.set_attribute(textarea, 'placeholder', placeholder());
			textarea.disabled = disabled();
		});

		$.event('focus', textarea, () => {
			$.set(hasRing, true);
		});

		$.event('blur', textarea, () => {
			$.set(hasRing, false);
		});

		$.bind_value(textarea, value);
		$.append($$anchor, div);
	};

	const textAreaLabel = ($$anchor) => {
		var label_1 = root_2();
		var div_5 = $.child(label_1);
		var text_2 = $.only_child(div_5, true);
		var node_2 = $.sibling(div_5, 2);

		textAreaSnip(node_2);
		$.reset(label_1);

		$.template_effect(() => {
			$.set_attribute(label_1, 'for', $.get(inputID));
			$.set_text(text_2, label());
		});

		$.append($$anchor, label_1);
	};

	let araiLabelledBy = $.prop($$props, 'aria-labelledby', 3, undefined),
		id = $.prop($$props, 'id', 3, undefined),
		name = $.prop($$props, 'name', 3, undefined),
		value = $.prop($$props, 'value', 15, ""),
		label = $.prop($$props, 'label', 3, undefined),
		defaultValue = $.prop($$props, 'defaultValue', 3, ""),
		error = $.prop($$props, 'error', 3, undefined),
		size = $.prop($$props, 'size', 3, "medium"),
		placeholder = $.prop($$props, 'placeholder', 3, undefined),
		disabled = $.prop($$props, 'disabled', 3, false);

	let hasRing = $.state(false);

	let inputID = $.derived(() => {
		if (id()) {
			return id();
		}

		return randomString(8);
	});

	// Assign defaultValue if it is not ''
	if (defaultValue() !== "") {
		value(defaultValue());
	}

	const textObj = {
		tiny: "text-[12px] leading-[16px]",
		small: "text-[13px] leading-5",
		medium: "text-[14px] leading-5",
		large: "text-[16px] leading-6"
	};

	let text = $.derived(() => {
		return textObj[size()];
	});

	let ringClass = $.derived(() => {
		if (disabled()) {
			return `cursor-not-allowed border-kui-light-gray-400 dark:border-kui-dark-gray-400
			bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 text-kui-light-gray-600 dark:text-kui-dark-gray-600
			placeholder-kui-light-gray-600 dark:placeholder-kui-dark-gray-600`;
		}

		if (error()) {
			return `border-kui-light-red-700 dark:border-kui-dark-red-700 hover:border-kui-light-gray-500
			dark:hover:border-kui-dark-gray-500 ring ring-kui-light-red-400 dark:ring-kui-dark-red-400
			hover:ring-0 dark:hover:ring-0 `;
		}

		if ($.get(hasRing)) {
			return `border-kui-light-gray-700 dark:border-kui-dark-gray-700 ring ring-kui-light-gray-400
            dark:ring-kui-dark-gray-400 hover:border-kui-light-gray-700 dark:hover:border-kui-dark-gray-700
			text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 placeholder-kui-light-gray-600 dark:placeholder-kui-dark-gray-600`;
		}

		return `border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-500
		dark:hover:border-kui-dark-gray-500 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 placeholder-kui-light-gray-600
		dark:placeholder-kui-dark-gray-600`;
	});

	let textareaClass = $.derived(() => {
		return `${$.get(text)}  ${$.get(ringClass)}`;
	});

	var fragment = $.comment();
	var node_3 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			textAreaLabel($$anchor);
		};

		var alternate = ($$anchor) => {
			textAreaSnip($$anchor);
		};

		$.if(node_3, ($$render) => {
			if (label()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}