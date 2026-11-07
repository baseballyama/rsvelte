import * as $ from 'svelte/internal/server';
import { refreshAll } from '$app/navigation';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$$renderer.push(`<nav><a href="/load/invalidation/during-navigation/a" data-testid="nav-a">a</a> <a href="/load/invalidation/during-navigation/b" data-testid="nav-b">b</a> <a href="/load/invalidation/during-navigation/b" data-testid="nav-b-refresh">b+refresh</a> <a href="/load/invalidation/during-navigation/a" data-testid="nav-a-refresh">a+refresh</a></nav> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}