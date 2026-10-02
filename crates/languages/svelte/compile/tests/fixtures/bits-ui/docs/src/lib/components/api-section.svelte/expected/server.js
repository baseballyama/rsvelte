import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import CSSVarsTable from "$lib/components/api-ref/css-vars/css-vars-table.svelte";
import DataAttrsTable from "$lib/components/api-ref/data-attrs/data-attrs-table.svelte";
import PropsTable from "$lib/components/api-ref/props/props-table.svelte";
import { h2 as H2, p as P } from "$lib/components/markdown/index.js";
import { parseMarkdown } from "$lib/utils/index.js";

export default function Api_section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { schemas = [] } = $$props;

		H2($$renderer, {
			id: 'api-reference',
			children: ($$renderer) => {
				$$renderer.push(`<!---->API Reference`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flex flex-col gap-12 pt-8"><!--[-->`);

		const each_array = $.ensure_array_like(schemas);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let schema = each_array[$$index];

			$$renderer.push(`<div><div class="rounded-button bg-accent inline-flex h-[29px] items-center justify-center px-3 font-mono text-[17px] font-medium leading-tight tracking-tight dark:text-neutral-900"><h3 class="scroll-m-20 font-semibold"${$.attr('id', schema.title.toLowerCase())}>`);

			if (schema.type !== "utility") {
				$$renderer.push(`<!--[0--><span class="text-foreground/80 font-normal dark:text-neutral-900/80">${$.escape(page.data.metadata.title.replaceAll(" ", ""))}.</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->${$.escape(schema.title)}</h3></div> `);

			P($$renderer, {
				class: 'mt-2! mb-5!',
				children: ($$renderer) => {
					$$renderer.push(`${$.html(parseMarkdown(schema.description))}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex flex-col gap-4">`);

			if (schema.props) {
				$$renderer.push('<!--[0-->');
				PropsTable($$renderer, { props: schema.props });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (schema.type === "component") {
				$$renderer.push('<!--[0-->');
				DataAttrsTable($$renderer, { dataAttrs: schema.dataAttributes });
				$$renderer.push(`<!----> `);
				CSSVarsTable($$renderer, { cssVars: schema.cssVars });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}