import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'title',
	'description',
	'icon',
	'children'
]);

var root = $.from_html(`<div class="flex w-full justify-center"><div class="border-kui-light-gray-400 dark:border-kui-dark-gray-200 flex h-15 w-15.5 items-center justify-center rounded-lg border"><div class="h-8 w-8"><!></div></div></div>`);
var root_1 = $.from_html(`<div><div class="grid justify-items-center gap-6"><!> <div class="mx-auto flex max-w-85 flex-col gap-2"><p class="text-kui-light-dark-gray-1000 dark:text-kui-dark-gray-1000 text-center text-base capitalize"><span> </span></p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-center text-sm"><span class="inline-block text-balance"> </span></p></div> <!></div></div>`);

export default function Root($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var div = root_1();

	$.attribute_effect(div, () => ({
		...rest,
		class: 'border-kui-light-gray-400 dark:border-kui-dark-gray-200 w-full rounded-lg border px-17.5 py-12'
	}));

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			const Icon = $.derived(() => $$props.icon);
			var div_2 = root();
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var node_1 = $.child(div_4);

			$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, {});
			});

			$.reset(div_4);
			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.icon) $$render(consequent);
		});
	}

	var div_5 = $.sibling(node, 2);
	var p = $.child(div_5);
	var span = $.child(p);
	var text = $.only_child(span, true);

	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var span_1 = $.child(p_1);
	var text_1 = $.only_child(span_1, true);

	$.reset(p_1);
	$.reset(div_5);

	var node_2 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_3 = $.first_child(fragment);

			$.snippet(node_3, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node_2, ($$render) => {
			if ($$props.children) $$render(consequent_1);
		});
	}

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.append($$anchor, div);
}