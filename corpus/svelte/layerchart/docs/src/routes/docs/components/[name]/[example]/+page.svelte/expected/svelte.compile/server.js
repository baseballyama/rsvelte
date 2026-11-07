import * as $ from 'svelte/internal/server';
import Example from '$lib/components/Example.svelte';
import { page } from '$app/state';
import { H2 } from '@layerstack/docs/markdown/components';
import { allComponents } from 'content-collections';
import { ComponentLink, ExampleListing } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const example = $.derived(() => page.params.example);
		const component = $.derived(() => page.url.searchParams.get('component') ?? page.params.name);
		const exampleInfo = $.derived(() => data.catalog?.examples.find((e) => e.name === example()));
		const resolveComponentExample = (component) => allComponents.find((c) => c.name === component)?.defaultExample;

		$$renderer.push(`<div class="mb-4">`);
		OpenWithButton($$renderer, {});
		$$renderer.push(`<!----></div> `);
		Example($$renderer, { name: example(), component: component(), showCode: true });
		$$renderer.push(`<!----> `);

		H2($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Components`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="grid grid-cols-xs gap-2 mt-2"><!--[-->`);

		const each_array = $.ensure_array_like(exampleInfo()?.components);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let componentUsage = each_array[$$index];

			ComponentLink($$renderer, {
				component: componentUsage.component,
				resolveExample: resolveComponentExample
			});
		}

		$$renderer.push(`<!--]--></div> `);

		if (data.catalog) {
			$$renderer.push(`<!--[0--><div class="mt-12">`);

			ExampleListing($$renderer, {
				catalog: data.catalog,
				title: 'More examples',
				exclude: example()
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}