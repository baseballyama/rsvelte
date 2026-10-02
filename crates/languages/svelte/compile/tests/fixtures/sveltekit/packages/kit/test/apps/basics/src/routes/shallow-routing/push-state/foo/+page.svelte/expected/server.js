import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Foo } from '#lib';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<button data-id="shallow">add state</button> <button data-id="full">add state with navigation</button> <button>bump count</button> <p data-testid="foo">foo: ${$.escape(page.state.foo?.bar() ?? 'nope')}</p> <p data-testid="count">count: ${$.escape(page.state.count ?? 'nope')}</p>`);
	});
}