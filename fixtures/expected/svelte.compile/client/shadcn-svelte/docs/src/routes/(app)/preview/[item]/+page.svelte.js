import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";
import Button from "$lib/registry/ui/button/button.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const createExampleComponents = import.meta.glob("/src/lib/registry/examples/create/*/*.svelte");
	const exampleComponentPath = $.derived(() => `/src/lib/registry/examples/create/${$$props.data.example.name}/${$$props.data.example.name}.svelte`);
	const loadExampleComponent = $.derived(() => createExampleComponents[$.get(exampleComponentPath)]);

	const ComponentPromise = $.derived(() => $.get(loadExampleComponent)
		? $.get(loadExampleComponent)()
		: Promise.reject(new Error(`Missing preview component: ${$.get(exampleComponentPath)}`)));

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				class: 'absolute top-2 right-2 isolate z-10',
				get href() {
					return `/create/${$$props.data.example.name ?? ''}${page.url.search ?? ''}`;
				},
				variant: 'ghost',
				size: 'icon-sm',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'MinimizeIcon',
						tabler: 'IconMinimize',
						hugeicons: 'ArrowShrinkIcon',
						phosphor: 'CornersInIcon',
						remixicon: 'RiExpandDiagonalLine'
					});
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => page.url.searchParams.get("fromPreview") === "true");

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => $.get(ComponentPromise), null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { default: Component } = $.get($$source);

			return { Component };
		});

		var Component = $.derived(() => $.get($$value).Component);
		var fragment_3 = $.comment();
		var node_2 = $.first_child(fragment_3);

		$.component(node_2, () => $.get(Component), ($$anchor, Component_1) => {
			Component_1($$anchor, {});
		});

		$.append($$anchor, fragment_3);
	});

	var node_3 = $.sibling(node_1, 2);

	TailwindIndicator(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}