import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component, { ListItem } from "./lib/Component.svelte";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<span slot="count"> </span>`);
var root_2 = $.from_html(`<main><!> <!></main>`);

export default function Ts_let01_type_output($$anchor) {
	// Component: __sveltets_2_IsomorphicComponent<__sveltets_2_PropsWithChildren<{ items?: ListItem[] | undefined; }, { default: { item: ListItem; }; count: { count: number; }; }>, { ...; }, { ...; }, Record<...>, string>, ListItem: any, ListItem: any
	const items = [
		// items: ListItem[]
		{
			title: "Svelte.dev", // title: string
			link: "https://svelte.dev" // link: string
		},

		{
			title: "TypeScript ESLint", // title: string
			link: "https://typescript-eslint.io" // link: string
		},

		{
			title: "TypeScript", // title: string
			link: "https://www.typescriptlang.org" // link: string
		}
	];

	var main = root_2();
	var node = $.child(main);

	Component(node, {
		get items() {
			return items;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(item).title));
				$.append($$anchor, div);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, {
		get items() {
			return items;
		},

		children: ($$anchor, $$slotProps) => {
			const item = $.derived(() => $$slotProps.item);
			var div_1 = root();
			var text_1 = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(item).title));
			$.append($$anchor, div_1);
		},

		$$slots: {
			default: true,
			count: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.count);
				var span = root_1();
				var text_2 = $.only_child(span, true);

				$.template_effect(() => $.set_text(text_2, $.get(foo)));
				$.append($$anchor, span);
			}
		}
	});

	$.reset(main);
	$.append($$anchor, main);
}