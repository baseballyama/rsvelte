import * as $ from 'svelte/internal/server';

const $$css = {
	hash: 'svelte-okauro',
	code: '.foo.svelte-okauro {color:red;}'
};

export default function Main($$renderer) {
	$$renderer.global.css.add($$css);
	$$renderer.push(`<div class="foo svelte-okauro">foo</div>`);
}