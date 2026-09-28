import * as $ from 'svelte/internal/server';

const $$css = {
	hash: 'svelte-1mg240x',
	code: 'h1.svelte-1mg240x {color:blue;}'
};

export default function GrandChild($$renderer) {
	$$renderer.global.css.add($$css);
	$$renderer.push(`<h1 class="svelte-1mg240x">inner</h1>`);
}