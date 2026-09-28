import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'line',
	'class',
	'children'
]);

var root = $.from_html(`<div class="bg-primary-bg/75 min-h-[1rem] w-0.5 flex-1 group-last:hidden"></div>`);
var root_1 = $.from_html(`<li><div class="mt-0 flex flex-col items-center self-stretch"><p class="connected-step bg-primary-bg text-primary-fg grid h-7 w-7 place-items-center rounded-full text-xs font-bold svelte-wud7kk"></p> <!></div> <div class="mb-4"><!></div></li>`);

export default function ConnectedListItem($$anchor, $$props) {
	let line = $.prop($$props, 'line', 3, true),
		rest = $.rest_props($$props, rest_excludes);

	var li = root_1();

	$.attribute_effect(
		li,
		() => ({
			class: `group flex items-baseline space-x-4 ${$$props.class ?? ''}`,
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-wud7kk'
	);

	var div = $.child(li);
	var node = $.sibling($.child(div), 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (line()) $$render(consequent);
		});
	}

	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node_1 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($$props.children) $$render(consequent_1);
		});
	}

	$.reset(div_2);
	$.reset(li);
	$.append($$anchor, li);
}