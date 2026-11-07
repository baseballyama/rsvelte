import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { useCodeOverflow } from './code.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'collapsed',
	'class',
	'children'
]);

var root = $.from_html(`<div class="from-background absolute bottom-0 left-0 z-10 h-full w-full bg-linear-to-t to-transparent"></div>`);
var root_1 = $.from_html(`<div><!> <!> <!></div>`);

export default function Code_overflow($$anchor, $$props) {
	$.push($$props, true);

	let collapsed = $.prop($$props, 'collapsed', 15, true),
		props = $.rest_props($$props, rest_excludes);

	const state = useCodeOverflow({ collapsed: box.with(() => collapsed(), (v) => collapsed(v)) });
	var div = root_1();

	$.attribute_effect(
		div,
		($0) => ({
			...props,
			'data-code-overflow': true,
			'data-collapsed': collapsed(),
			class: $0
		}),
		[
			() => cn('relative overflow-y-hidden data-[collapsed=true]:max-h-[300px]', $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (collapsed()) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			Button($$anchor, {
				variant: 'secondary',
				size: 'sm',
				class: 'absolute bottom-2 left-1/2 z-20 w-fit -translate-x-1/2',
				get onclick() {
					return state.toggleCollapsed;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Expand');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if (collapsed()) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}