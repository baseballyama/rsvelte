import * as $ from 'svelte/internal/server';
import { H1, Paragraph } from "$lib/components/markdown/index";
import { getDocsLayoutContext } from "./docs-layout-context";

export default function DocsPageShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title, description, children } = $$props;
		const { registerDocContent } = getDocsLayoutContext();
		let contentRef = void 0;

		$$renderer.push(`<div class="mx-auto w-full max-w-4xl"><article class="min-w-0 space-y-8" data-doc-content=""><section>`);

		H1($$renderer, {
			id: 'introduction',
			class: 'tracking-tighter',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(title)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (description) {
			$$renderer.push('<!--[0-->');

			Paragraph($$renderer, {
				class: 'mt-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(description)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section> `);
		children?.($$renderer);
		$$renderer.push(`<!----></article></div>`);
	});
}