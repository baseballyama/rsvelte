import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/Icon.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'title',
	'subtitle',
	'icon',
	'isSelected',
	'accessories',
	'assetsPath'
]);

var root = $.from_html(`<div class="size-[22px]"></div>`);
var root_1 = $.from_html(`<p class="text-muted-foreground truncate"> </p>`);
var root_2 = $.from_html(`<div class="ml-auto flex shrink-0 items-center gap-4"><!></div>`);
var root_3 = $.from_html(`<button><!> <div class="flex flex-grow items-baseline gap-3 overflow-hidden"><p class="whitespace-nowrap"> </p> <!></div> <!></button>`);

export default function ListItemBase($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var button = root_3();

	$.attribute_effect(button, () => ({
		type: 'button',
		class: 'hover:bg-accent/50 flex h-12 w-full items-center gap-3 rounded-md px-2 text-left',
		'data-testid': 'list-item',
		...restProps,
		[$.CLASS]: { '!bg-accent': $$props.isSelected }
	}));

	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			Icon($$anchor, {
				get icon() {
					return $$props.icon;
				},

				get assetsPath() {
					return $$props.assetsPath;
				},
				class: 'size-[22px]'
			});
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.icon) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var div_1 = $.sibling(node, 2);
	var p = $.child(div_1);
	var text = $.only_child(p, true);
	var node_1 = $.sibling(p, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, $$props.subtitle));
			$.append($$anchor, p_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.subtitle) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();
			var node_3 = $.child(div_2);

			$.snippet(node_3, () => $$props.accessories);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.accessories) $$render(consequent_2);
		});
	}

	$.reset(button);
	$.template_effect(() => $.set_text(text, $$props.title));
	$.append($$anchor, button);
}