import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p><!></p>`);
var root_2 = $.from_html(`<div class="ml-6 md:ml-0"><a> </a></div>`);
var root_3 = $.from_html(`<div class="ml-6 md:ml-0"><button> </button></div>`);
var root_4 = $.from_html(`<div class="shrink-0"><div class="h-4 w-4"><div class="h-4 w-4"><!></div></div></div>`);
var root_5 = $.from_html(`<div class="w-full"><aside><div class="flex w-full flex-col gap-2 px-6 md:flex-row md:items-center md:justify-center"><div class="flex items-center gap-2"><!> <!></div> <!></div></aside></div>`);

export default function Banner($$anchor, $$props) {
	$.push($$props, true);

	const labelSnip = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var p = root();
						var text = $.only_child(p, true);

						$.template_effect(() => {
							$.set_class(p, 1, `text-sm ${$.get(labelClass) ?? ''}`);
							$.set_text(text, label());
						});

						$.append($$anchor, p);
					};

					var consequent_1 = ($$anchor) => {
						var p_1 = root_1();
						var node_2 = $.child(p_1);

						$.snippet(node_2, () => label() ?? $.noop);
						$.reset(p_1);
						$.template_effect(() => $.set_class(p_1, 1, `text-sm ${$.get(labelClass) ?? ''}`));
						$.append($$anchor, p_1);
					};

					$.if(node_1, ($$render) => {
						if (typeof label() === "string") $$render(consequent); else if (typeof label() === "function") $$render(consequent_1, 1);
					});
				}

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (label()) $$render(consequent_2);
			});
		}

		$.append($$anchor, fragment);
	};

	const callToActionSnip = ($$anchor) => {
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		{
			var consequent_5 = ($$anchor) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				{
					var consequent_3 = ($$anchor) => {
						var div = root_2();
						var a = $.child(div);
						var text_1 = $.only_child(a, true);

						$.reset(div);

						$.template_effect(() => {
							$.set_attribute(a, 'href', callToAction().href);
							$.set_class(a, 1, `-my-px h-6 cursor-pointer rounded-xs border-none bg-transparent px-0 py-1 font-medium capitalize underline underline-offset-[5px] outline-hidden ${$.get(callToActionClass) ?? ''}`);
							$.set_text(text_1, callToAction().label);
						});

						$.append($$anchor, div);
					};

					var consequent_4 = ($$anchor) => {
						var div_1 = root_3();
						var button = $.child(div_1);
						var text_2 = $.only_child(button, true);

						$.reset(div_1);

						$.template_effect(() => {
							$.set_class(button, 1, `-my-px h-6 cursor-pointer rounded-xs border-none bg-transparent px-0 py-1 font-medium capitalize underline underline-offset-[5px] outline-hidden ${$.get(callToActionClass) ?? ''}`);
							$.set_text(text_2, callToAction().label);
						});

						$.delegated('click', button, function (...$$args) {
							callToAction().onClick?.apply(this, $$args);
						});

						$.append($$anchor, div_1);
					};

					$.if(node_4, ($$render) => {
						if (callToAction().href) $$render(consequent_3); else if (callToAction().onClick) $$render(consequent_4, 1);
					});
				}

				$.append($$anchor, fragment_3);
			};

			$.if(node_3, ($$render) => {
				if (callToAction()) $$render(consequent_5);
			});
		}

		$.append($$anchor, fragment_2);
	};

	let icon = $.prop($$props, 'icon', 3, undefined),
		callToAction = $.prop($$props, 'callToAction', 3, undefined),
		label = $.prop($$props, 'label', 3, undefined),
		variant = $.prop($$props, 'variant', 3, "gray");

	const variantAsideObj = {
		gray: `text-kui-light-gray-900 dark:text-kui-dark-gray-900 bg-kui-light-gray-100
		dark:bg-kui-dark-gray-100 border-kui-light-gray-400 dark:border-kui-dark-gray-400`,

		warning: `text-kui-light-amber-900 dark:text-kui-dark-amber-900 bg-kui-light-amber-100
		dark:bg-kui-dark-amber-100 border-kui-light-amber-400 dark:border-kui-dark-amber-400`,

		error: `text-kui-light-red-900 dark:text-kui-dark-red-900 bg-kui-light-red-100
		dark:bg-kui-dark-red-100 border-kui-light-red-400 dark:border-kui-dark-red-400`,

		success: `text-kui-light-blue-900 dark:text-kui-dark-blue-900 bg-kui-light-blue-100
		dark:bg-kui-dark-blue-100 border-kui-light-blue-400 dark:border-kui-dark-blue-400`
	};

	const variantCallToActionObj = {
		gray: `hover:text-kui-light-gray-900 dark:hover:text-kui-dark-gray-900
		hover:decoration-kui-light-gray-500 dark:hover:decoration-kui-dark-gray-500
		decoration-kui-light-gray-500 dark:decoration-kui-dark-gray-500 text-kui-light-gray-1000
		dark:text-kui-dark-gray-1000`,

		warning: `hover:text-kui-light-amber-900 dark:hover:text-kui-dark-amber-900
		hover:decoration-kui-light-amber-500 dark:hover:decoration-kui-dark-amber-500
		decoration-kui-light-amber-400 dark:decoration-kui-dark-amber-400 text-kui-light-amber-1000
		dark:text-kui-dark-amber-1000`,

		error: `hover:text-kui-light-red-900 dark:hover:text-kui-dark-red-900
		hover:decoration-kui-light-red-500 dark:hover:decoration-kui-dark-red-500
		decoration-kui-light-red-400 dark:decoration-kui-dark-red-400 text-kui-light-red-1000
		dark:text-kui-dark-red-1000`,

		success: `hover:text-kui-light-blue-900 dark:hover:text-kui-dark-blue-900
		hover:decoration-kui-light-blue-500 dark:hover:decoration-kui-dark-blue-500
		decoration-kui-light-blue-400 dark:decoration-kui-dark-blue-400 text-kui-light-blue-1000
		dark:text-kui-dark-blue-1000`
	};

	const variantLabelObj = {
		gray: `text-kui-light-gray-900 dark:text-kui-dark-gray-900`,
		warning: `text-kui-light-amber-900 dark:text-kui-dark-amber-900`,
		error: `text-kui-light-red-900 dark:text-kui-dark-red-900`,
		success: `text-kui-light-blue-900 dark:text-kui-dark-blue-900`
	};

	let asideClass = $.derived(() => {
		return `${variantAsideObj[variant()]}`;
	});

	let callToActionClass = $.derived(() => {
		return `${variantCallToActionObj[variant()]}`;
	});

	let labelClass = $.derived(() => {
		return `${variantLabelObj[variant()]}`;
	});

	var div_2 = root_5();
	var aside = $.child(div_2);
	var div_3 = $.child(aside);
	var div_4 = $.child(div_3);
	var node_5 = $.child(div_4);

	{
		var consequent_6 = ($$anchor) => {
			const Icon = $.derived(icon);
			var div_5 = root_4();
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_6 = $.child(div_7);

			$.component(node_6, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, {});
			});

			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_5, ($$render) => {
			if (icon()) $$render(consequent_6);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	labelSnip(node_7);
	$.reset(div_4);

	var node_8 = $.sibling(div_4, 2);

	callToActionSnip(node_8);
	$.reset(div_3);
	$.reset(aside);
	$.reset(div_2);
	$.template_effect(() => $.set_class(aside, 1, `z-30 flex min-h-[40px] w-full -translate-y-px items-center justify-center gap-x-2 border-t border-b py-2 text-[14px] leading-5 ${$.get(asideClass) ?? ''} `));
	$.append($$anchor, div_2);
	$.pop();
}

$.delegate(['click']);