import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<input/>`);
	Component($$renderer, {});
	$$renderer.push(`<!----> <input/><div></div> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
	Component($$renderer, {});
	$$renderer.push(`<!----> `);
	Component($$renderer, {});
	$$renderer.push(`<!---->`);
	Component($$renderer, {});
	$$renderer.push(`<!----> <div></div><p></p> `);
	A($$renderer, {});
	$$renderer.push(`<!---->`);
}