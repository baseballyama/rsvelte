import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <footer class="svelte-1spfe2l">footer</footer>`);
}