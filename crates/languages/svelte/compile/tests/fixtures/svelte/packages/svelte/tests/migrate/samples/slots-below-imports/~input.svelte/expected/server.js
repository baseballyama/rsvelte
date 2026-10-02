import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> `);
	Foo($$renderer, {});
	$$renderer.push(`<!---->`);
}