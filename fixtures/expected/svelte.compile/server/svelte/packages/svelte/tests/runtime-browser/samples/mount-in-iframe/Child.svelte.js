import * as $ from 'svelte/internal/server';
import GrandChild from "./GrandChild.svelte";

const $$css = { hash: 'svelte-xpqyuz', code: 'h1.svelte-xpqyuz {color:red;}' };

export default function Child($$renderer, $$props) {
	$$renderer.global.css.add($$css);

	let { count } = $$props;

	$$renderer.push(`<h1 class="svelte-xpqyuz">count: ${$.escape(count)}</h1> `);
	GrandChild($$renderer, { count });
	$$renderer.push(`<!---->`);
}