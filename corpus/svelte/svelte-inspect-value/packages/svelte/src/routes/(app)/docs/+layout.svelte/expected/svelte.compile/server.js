import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { addToPanel } from '$lib/global.svelte.js';
import { fly } from 'svelte/transition';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		const links = data.docs.map(({ type, title, children }) => ({ title: title[1], href: `/docs/${type}/${title[1]}`, children }));

		addToPanel('links', () => links);

		const fns = links.filter((l) => l.href.includes('functions'));
		const types = links.filter((l) => l.href.includes('types'));
		const vars = links.filter((l) => l.href.includes('variables'));
		const modules = links.filter((l) => l.href.includes('modules'));

		$$renderer.push(`<ul style="display: none" class="svelte-1ktby0k"><li class="svelte-1ktby0k">Modules <ul class="svelte-1ktby0k"><!--[-->`);

		const each_array = $.ensure_array_like(modules);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { href, title } = each_array[$$index];

			$$renderer.push(`<li class="var svelte-1ktby0k"><a${$.attr('href', href)} class="svelte-1ktby0k">${$.escape(title)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li> <li class="svelte-1ktby0k">Variables <ul class="svelte-1ktby0k"><!--[-->`);

		const each_array_1 = $.ensure_array_like(vars);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let { href, title } = each_array_1[$$index_1];

			$$renderer.push(`<li class="var svelte-1ktby0k"><a${$.attr('href', href)} class="svelte-1ktby0k">${$.escape(title)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li> <li class="svelte-1ktby0k">Types <ul class="svelte-1ktby0k"><!--[-->`);

		const each_array_2 = $.ensure_array_like(types);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let { href, title } = each_array_2[$$index_2];

			$$renderer.push(`<li class="type svelte-1ktby0k"><a${$.attr('href', href)} class="svelte-1ktby0k">${$.escape(title)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></li> <!--[-->`);

		const each_array_3 = $.ensure_array_like(fns);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let { href, title } = each_array_3[$$index_3];

			$$renderer.push(`<li class="svelte-1ktby0k"><a${$.attr('href', href)} class="svelte-1ktby0k"><span class="fn svelte-1ktby0k">${$.escape(title)}</span>()</a></li>`);
		}

		$$renderer.push(`<!--]--></ul> <!---->`);

		{
			$$renderer.push(`<div class="md-types">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!---->`);
	});
}