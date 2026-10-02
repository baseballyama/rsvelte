import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Example from '$lib/components/Example.svelte';
import { page } from '$app/state';
import { H2 } from '@layerstack/docs/markdown/components';
import { allComponents } from 'content-collections';
import { ComponentLink, ExampleListing } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';

var root = $.from_html(`<div class="mt-12"><!></div>`);
var root_1 = $.from_html(`<div class="mb-4"><!></div> <!> <!> <div class="grid grid-cols-xs gap-2 mt-2"></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const example = $.derived(() => page.params.example);
	const component = $.derived(() => page.url.searchParams.get('component') ?? page.params.name);
	const exampleInfo = $.derived(() => $$props.data.catalog?.examples.find((e) => e.name === $.get(example)));
	const resolveComponentExample = (component) => allComponents.find((c) => c.name === component)?.defaultExample;
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	OpenWithButton(node, {});
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Example(node_1, {
		get name() {
			return $.get(example);
		},

		get component() {
			return $.get(component);
		},
		showCode: true
	});

	var node_2 = $.sibling(node_1, 2);

	H2(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Components');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_2, 2);

	$.each(div_1, 21, () => $.get(exampleInfo)?.components, $.index, ($$anchor, componentUsage) => {
		ComponentLink($$anchor, {
			get component() {
				return $.get(componentUsage).component;
			},
			resolveExample: resolveComponentExample
		});
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_4 = $.child(div_2);

			ExampleListing(node_4, {
				get catalog() {
					return $$props.data.catalog;
				},
				title: 'More examples',
				get exclude() {
					return $.get(example);
				}
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if ($$props.data.catalog) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}