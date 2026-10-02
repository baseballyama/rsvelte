import * as $ from 'svelte/internal/server';

const $$css = {
	hash: 'svelte-1h3glmj',
	code: '.foo.svelte-1h3glmj {color:green;}.foo.svelte-1h3glmj {color:green;} .foo.svelte-1h3glmj {color:green;}.foo.svelte-1h3glmj, .foo.svelte-1h3glmj {color:green;}'
};

export default function Main($$renderer) {
	$$renderer.global.css.add($$css);
	$$renderer.push(`<div class="foo svelte-1h3glmj">foo</div>`);
}