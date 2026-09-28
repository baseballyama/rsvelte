import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';

export default function Nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { section } = $$props;
		const lists = ['top', 'new', 'best', 'show', 'ask', 'jobs'];

		$$renderer.push(`<nav class="svelte-1escm0m"><a${$.attr('href', resolve('/'))}><img alt="Svelte Hacker News logo" class="icon svelte-1escm0m" src="/favicon.png"/></a> <ul class="svelte-1escm0m"><!--[-->`);

		const each_array = $.ensure_array_like(lists);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let list = each_array[$$index];

			$$renderer.push(`<li class="svelte-1escm0m"><a${$.attr('href', resolve('/[list=category]/[page=numeric]', { list, page: '1' }))}${$.attr_class('svelte-1escm0m', void 0, { 'selected': section === list })}>${$.escape(list)}</a></li>`);
		}

		$$renderer.push(`<!--]--> <li class="about svelte-1escm0m"><a${$.attr('href', resolve('/about'))}${$.attr_class('svelte-1escm0m', void 0, { 'selected': section === 'about' })}>about</a></li></ul></nav>`);
	});
}