import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Error from "$lib/icons/error.svelte";
import LinkExternal from "$lib/icons/link-external.svelte";

var root = $.from_html(`<span class="text-kui-light-red-900 dark:text-kui-dark-red-900 font-medium"> </span>`);
var root_1 = $.from_html(`<span class="text-kui-light-red-900 dark:text-kui-dark-red-900 font-normal"><!></span>`);
var root_2 = $.from_html(`<div><!> <!></div>`);
var root_3 = $.from_html(`<div class="text-kui-light-red-900 dark:text-kui-dark-red-900 flex items-center gap-1 text-[14px]"> <div class=" border-kui-light-red-900 dark:border-kui-dark-red-900 hover:text-kui-light-red-600 dark:hover:text-kui-dark-red-800 hover:border-kui-light-red-600 dark:hover:border-kui-dark-red-800 border-b leading-5 font-medium capitalize"><a><div class="flex items-center gap-1"> <div class="h-3.5 w-3.5"><!></div></div></a></div></div>`);
var root_4 = $.from_html(`<div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4"><!></div> <div><!></div></div>`);

export default function Error_1($$anchor, $$props) {
	$.push($$props, true);

	const childrenLabelSizeSnip = ($$anchor) => {
		var div = root_2();
		var node = $.child(div);

		{
			var consequent = ($$anchor) => {
				var span = root();
				var text = $.only_child(span);

				$.template_effect(() => $.set_text(text, `${$$props.label ?? ''}:`));
				$.append($$anchor, span);
			};

			$.if(node, ($$render) => {
				if ($$props.label) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var span_1 = root_1();
				var node_2 = $.child(span_1);

				$.snippet(node_2, () => $$props.children);
				$.reset(span_1);
				$.append($$anchor, span_1);
			};

			$.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent_1);
			});
		}

		$.reset(div);
		$.template_effect(() => $.set_class(div, 1, `space-x-1 ${$.get(sizeClass) ?? ''}`));
		$.append($$anchor, div);
	};

	const withErrorPropSnip = ($$anchor) => {
		var div_1 = root_3();
		var text_1 = $.child(div_1);
		var div_2 = $.sibling(text_1);
		var a = $.child(div_2);
		var div_3 = $.child(a);
		var text_2 = $.child(div_3);
		var div_4 = $.sibling(text_2);
		var node_3 = $.child(div_4);

		LinkExternal(node_3, {});
		$.reset(div_4);
		$.reset(div_3);
		$.reset(a);
		$.reset(div_2);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text_1, `${(error()?.message || "") ?? ''} `);
			$.set_attribute(a, 'href', error()?.link || "");
			$.set_text(text_2, `${(error()?.action || "") ?? ''} `);
		});

		$.append($$anchor, div_1);
	};

	const errorSnip = ($$anchor) => {
		var fragment = $.comment();
		var node_4 = $.first_child(fragment);

		{
			var consequent_2 = ($$anchor) => {
				withErrorPropSnip($$anchor);
			};

			var alternate = ($$anchor) => {
				childrenLabelSizeSnip($$anchor);
			};

			$.if(node_4, ($$render) => {
				if (error()) $$render(consequent_2); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let size = $.prop($$props, 'size', 3, "md"),
		error = $.prop($$props, 'error', 3, undefined);

	const sizeObj = {
		sm: "text-[13px] leading-5",
		md: "text-[14px] leading-5",
		lg: "text-[16px] leading-6"
	};

	let sizeClass = $.derived(() => {
		return sizeObj[size()];
	});

	var div_5 = root_4();
	var div_6 = $.child(div_5);
	var node_5 = $.child(div_6);

	Error(node_5, {});
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_6 = $.child(div_7);

	errorSnip(node_6);
	$.reset(div_7);
	$.reset(div_5);
	$.append($$anchor, div_5);
	$.pop();
}