import * as $ from 'svelte/internal/server';

export default function TaxonomyHeader($$renderer, $$props) {
	const { name, count, type } = $$props;

	$$renderer.push(`<header class="sp-taxonomy svelte-1yg6wfl"><p class="sp-taxonomy__type svelte-1yg6wfl">${$.escape(type === 'tag' ? '标签' : '分类')}</p> <h1 class="sp-taxonomy__name svelte-1yg6wfl">${$.escape(name)}</h1> <p class="sp-taxonomy__count svelte-1yg6wfl">${$.escape(count)} 篇文章</p></header>`);
}