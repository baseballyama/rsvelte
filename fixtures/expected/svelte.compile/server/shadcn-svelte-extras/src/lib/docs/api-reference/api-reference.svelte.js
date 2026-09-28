import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { h2 as MarkdownH2 } from '$lib/components/mdsx';
import ReferenceTable from './reference-table.svelte';
import { getReference } from './components';

export default function Api_reference($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let { reference: referenceProp } = $$props;

		function componentSlugFromPath(pathname) {
			const m = pathname.match(/\/components\/([^/]+)/);

			return m?.[1];
		}

		const reference = $.derived(() => {
			if (referenceProp) return referenceProp;

			const slug = componentSlugFromPath(page.url.pathname);

			return slug ? getReference(slug) : undefined;
		});

		if (reference()) {
			$$renderer.push('<!--[0-->');

			MarkdownH2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->API Reference`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-8 flex flex-col gap-12"><!--[-->`);

			const each_array = $.ensure_array_like(Object.values(reference().components));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let component = each_array[$$index];

				ReferenceTable($$renderer, { name: reference().name, component });
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}