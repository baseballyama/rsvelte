import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { h2 as MarkdownH2 } from '$lib/components/mdsx';
import ReferenceTable from './reference-table.svelte';
import { getReference } from './components';

var root = $.from_html(`<!> <div class="mt-8 flex flex-col gap-12"></div>`, 1);

export default function Api_reference($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function componentSlugFromPath(pathname) {
		const m = pathname.match(/\/components\/([^/]+)/);

		return m?.[1];
	}

	const reference = $.derived(() => {
		if ($$props.reference) return $$props.reference;

		const slug = componentSlugFromPath(page.url.pathname);

		return slug ? getReference(slug) : undefined;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			MarkdownH2(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('API Reference');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_1, 2);

			$.each(div, 21, () => Object.values($.get(reference).components), (component) => component.name ?? '_', ($$anchor, component) => {
				ReferenceTable($$anchor, {
					get name() {
						return $.get(reference).name;
					},

					get component() {
						return $.get(component);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(reference)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}