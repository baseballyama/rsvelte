import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Error from "$lib/icons/error.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'name',
	'value',
	'label',
	'error',
	'size',
	'contPrefix',
	'prefixStyling',
	'contSuffix',
	'suffixStyling',
	'spellcheck',
	'placeholder',
	'disabled'
]);

var root = $.from_html(`<div class="h-4 w-4"><!></div>`);
var root_1 = $.from_html(`<span><!></span>`);
var root_2 = $.from_html(`<div class="mt-2"><div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4"><!></div> <div> </div></div></div>`);
var root_3 = $.from_html(`<div><div><!> <div><input/></div> <!></div> <!></div>`);
var root_4 = $.from_html(`<label><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-2 inline-block text-sm"> </div> <!></label>`);
var root_5 = $.from_html(`<div><!></div>`);

export default function Input($$anchor, $$props) {
	const // The focus and blur state of the input
	uid = $.props_id();

	$.push($$props, true);

	const // Show the ring when the input is focused
	// will the prefix have a bg and a border?
	// will the prefix have a bg and a border?
	prefixSnip = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_2 = ($$anchor) => {
				var span = root_1();
				var node_1 = $.child(span);

				{
					var consequent = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, contPrefix()));
						$.append($$anchor, text);
					};

					var consequent_1 = ($$anchor) => {
						const PrefixIcon = $.derived(contPrefix);
						var div = root();
						var node_2 = $.child(div);

						$.component(node_2, () => $.get(PrefixIcon), ($$anchor, PrefixIcon_1) => {
							PrefixIcon_1($$anchor, {});
						});

						$.reset(div);
						$.append($$anchor, div);
					};

					$.if(node_1, ($$render) => {
						if (typeof contPrefix() === "string") $$render(consequent); else if (typeof contPrefix() === "function") $$render(consequent_1, 1);
					});
				}

				$.reset(span);
				$.template_effect(() => $.set_class(span, 1, `text-kui-light-gray-700 dark:text-kui-dark-gray-700 flex h-full items-center px-3 ${$.get(prefixClass) ?? ''}`));
				$.append($$anchor, span);
			};

			$.if(node, ($$render) => {
				if (contPrefix()) $$render(consequent_2);
			});
		}

		$.append($$anchor, fragment);
	};

	const suffixSnip = ($$anchor) => {
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		{
			var consequent_5 = ($$anchor) => {
				var span_1 = root_1();
				var node_4 = $.child(span_1);

				{
					var consequent_3 = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, contSuffix()));
						$.append($$anchor, text_1);
					};

					var consequent_4 = ($$anchor) => {
						const SuffixIcon = $.derived(contSuffix);
						var div_1 = root();
						var node_5 = $.child(div_1);

						$.component(node_5, () => $.get(SuffixIcon), ($$anchor, SuffixIcon_1) => {
							SuffixIcon_1($$anchor, {});
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					};

					$.if(node_4, ($$render) => {
						if (typeof contSuffix() === "string") $$render(consequent_3); else if (typeof contSuffix() === "function") $$render(consequent_4, 1);
					});
				}

				$.reset(span_1);
				$.template_effect(() => $.set_class(span_1, 1, `text-kui-light-gray-700 dark:text-kui-dark-gray-700 flex h-full items-center px-3 ${$.get(suffixClass) ?? ''}`));
				$.append($$anchor, span_1);
			};

			$.if(node_3, ($$render) => {
				if (contSuffix()) $$render(consequent_5);
			});
		}

		$.append($$anchor, fragment_2);
	};

	const inputSnip = ($$anchor) => {
		var div_2 = root_3();
		var div_3 = $.child(div_2);
		var node_6 = $.child(div_3);

		prefixSnip(node_6);

		var div_4 = $.sibling(node_6, 2);
		var input = $.child(div_4);

		var event_handler = () => {
			$.set(hasRing, true);
		};

		var event_handler_1 = () => {
			$.set(hasRing, false);
		};

		$.attribute_effect(
			input,
			() => ({
				id: uid,
				name: name(),
				spellcheck: spellcheck(),
				placeholder: placeholder(),
				disabled: disabled(),
				onfocus: event_handler,
				onblur: event_handler_1,
				class: `${$.get(inputClass) ?? ''} h-full w-full bg-transparent outline-hidden`,
				...rest
			}),
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);

		$.reset(div_4);

		var node_7 = $.sibling(div_4, 2);

		suffixSnip(node_7);
		$.reset(div_3);

		var node_8 = $.sibling(div_3, 2);

		{
			var consequent_6 = ($$anchor) => {
				var div_5 = root_2();
				var div_6 = $.child(div_5);
				var div_7 = $.child(div_6);
				var node_9 = $.child(div_7);

				Error(node_9, {});
				$.reset(div_7);

				var div_8 = $.sibling(div_7, 2);
				var text_2 = $.only_child(div_8, true);

				$.reset(div_6);
				$.reset(div_5);

				$.template_effect(() => {
					$.set_class(div_8, 1, `${$.get(errorText) ?? ''} text-kui-light-red-900 dark:text-kui-dark-red-900`);
					$.set_text(text_2, error());
				});

				$.append($$anchor, div_5);
			};

			$.if(node_8, ($$render) => {
				if (error()) $$render(consequent_6);
			});
		}

		$.reset(div_2);

		$.template_effect(() => {
			$.set_class(div_3, 1, `flex items-center ${$.get(sizeClass) ?? ''} overflow-hidden border transition-all ${$.get(ringClass) ?? ''} bg-kui-light-bg dark:bg-kui-dark-bg
			rounded-md`);

			$.set_class(div_4, 1, `h-full w-full ${$.get(inputContClass) ?? ''}`);
		});

		$.bind_value(input, value);
		$.append($$anchor, div_2);
	};

	let name = $.prop($$props, 'name', 3, undefined),
		value = $.prop($$props, 'value', 15, ""),
		label = $.prop($$props, 'label', 3, undefined),
		error = $.prop($$props, 'error', 3, undefined),
		size = $.prop($$props, 'size', 3, "medium"),
		contPrefix = $.prop($$props, 'contPrefix', 3, undefined),
		prefixStyling = $.prop($$props, 'prefixStyling', 3, true),
		contSuffix = $.prop($$props, 'contSuffix', 3, undefined),
		suffixStyling = $.prop($$props, 'suffixStyling', 3, true),
		spellcheck = $.prop($$props, 'spellcheck', 3, false),
		placeholder = $.prop($$props, 'placeholder', 3, undefined),
		disabled = $.prop($$props, 'disabled', 3, false),
		rest = $.rest_props($$props, rest_excludes);

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
			placeholder:text-kui-light-gray-600 dark:placeholder:text-kui-dark-gray-600`;
		}

		return `border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-500
		dark:hover:border-kui-dark-gray-500`;
	});

	let inputClass = $.derived(() => {
		if (disabled()) {
			return `cursor-not-allowed text-kui-light-gray-600 dark:text-kui-dark-gray-600`;
		}

		return `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000`;
	});

	let inputContClass = $.derived(() => {
		if (prefixStyling() && suffixStyling()) {
			return `px-3`;
		}

		if (prefixStyling()) {
			return "pl-3";
		}

		if (suffixStyling()) {
			return "pr-3";
		}

		return ``;
	});

	// will the prefix have a bg and a border?
	let prefixClass = $.derived(() => {
		if (prefixStyling()) {
			return `bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary border-r border-kui-light-gray-200
     dark:border-kui-dark-gray-400`;
		}

		return ``;
	});

	// will the prefix have a bg and a border?
	let suffixClass = $.derived(() => {
		if (suffixStyling()) {
			return `bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary border-l border-kui-light-gray-200
     dark:border-kui-dark-gray-400`;
		}

		return ``;
	});

	const errorTextObj = {
		tiny: "text-[12px] leading-[16px]",
		small: "text-[13px] leading-5",
		medium: "text-[14px] leading-5",
		large: "text-[16px] leading-6"
	};

	let errorText = $.derived(() => {
		return errorTextObj[size()];
	});

	var div_9 = root_5();

	{
		const inputLabel = ($$anchor) => {
			var label_1 = root_4();
			var div_10 = $.child(label_1);
			var text_3 = $.only_child(div_10, true);
			var node_10 = $.sibling(div_10, 2);

			inputSnip(node_10);
			$.reset(label_1);

			$.template_effect(() => {
				$.set_attribute(label_1, 'for', uid);
				$.set_text(text_3, label());
			});

			$.append($$anchor, label_1);
		};

		var node_11 = $.child(div_9);

		{
			var consequent_7 = ($$anchor) => {
				inputLabel($$anchor);
			};

			var alternate = ($$anchor) => {
				inputSnip($$anchor);
			};

			$.if(node_11, ($$render) => {
				if (label()) $$render(consequent_7); else $$render(alternate, -1);
			});
		}

		$.reset(div_9);
	}

	$.append($$anchor, div_9);
	$.pop();
}