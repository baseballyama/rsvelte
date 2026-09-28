import * as $ from 'svelte/internal/server';
import { page } from "$app/state";

export default function LlmLink($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { link } = $$props;
		const pathname = page.url.pathname;
		const parts = pathname.split("/").filter(Boolean);
		const dirName = parts.at(-1); // "input-field"
		const parentDir = parts.at(-2); // "forms"

		$$renderer.push(`<ul><li>`);

		if (link) {
			$$renderer.push(`<!--[0--><a${$.attr('href', `/llm/${$.stringify(link)}.md`)} target="_blank" class="underline">Open LLM source for this page</a>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attr('href', `/llm/${$.stringify(parentDir)}/${$.stringify(dirName)}.md`)} target="_blank" class="underline">Open LLM source for this page</a>`);
		}

		$$renderer.push(`<!--]--></li></ul>`);
	});
}