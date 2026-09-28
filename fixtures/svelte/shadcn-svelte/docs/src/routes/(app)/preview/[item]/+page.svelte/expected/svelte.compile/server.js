import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";
import Button from "$lib/registry/ui/button/button.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const createExampleComponents = import.meta.glob("/src/lib/registry/examples/create/*/*.svelte");
		const exampleComponentPath = $.derived(() => `/src/lib/registry/examples/create/${data.example.name}/${data.example.name}.svelte`);
		const loadExampleComponent = $.derived(() => createExampleComponents[exampleComponentPath()]);

		const ComponentPromise = $.derived(() => loadExampleComponent()
			? loadExampleComponent()()
			: Promise.reject(new Error(`Missing preview component: ${exampleComponentPath()}`)));

		if (page.url.searchParams.get("fromPreview") === "true") {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				class: 'absolute top-2 right-2 isolate z-10',
				href: `/create/${$.stringify(data.example.name)}${$.stringify(page.url.search)}`,
				variant: 'ghost',
				size: 'icon-sm',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'MinimizeIcon',
						tabler: 'IconMinimize',
						hugeicons: 'ArrowShrinkIcon',
						phosphor: 'CornersInIcon',
						remixicon: 'RiExpandDiagonalLine'
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, ComponentPromise(), () => {}, ({ default: Component }) => {
			if (Component) {
				$$renderer.push('<!--[-->');
				Component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		});

		$$renderer.push(`<!--]--> `);
		TailwindIndicator($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}