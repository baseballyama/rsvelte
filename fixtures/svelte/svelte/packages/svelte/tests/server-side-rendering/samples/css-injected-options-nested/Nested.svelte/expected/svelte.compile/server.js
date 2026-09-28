import * as $ from 'svelte/internal/server';

const $$css = {
	hash: 'svelte-lr8eda',
	code: '.bar.svelte-lr8eda {color:red;}'
};

export default function Nested($$renderer) {
	$$renderer.global.css.add($$css);
	$$renderer.push(`<div class="bar svelte-lr8eda">bar</div>`);
}