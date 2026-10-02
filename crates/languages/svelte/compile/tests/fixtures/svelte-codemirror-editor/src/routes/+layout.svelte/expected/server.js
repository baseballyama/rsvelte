import * as $ from 'svelte/internal/server';
import "../styles.css";
import { page } from "$app/state";
import { resolve } from "$app/paths";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nav = [
			{ path: "/", text: "Configurator" },
			{ path: "/javascript", text: "Javascript" },
			{ path: "/typescript", text: "Typescript" },
			{ path: "/html", text: "HTML" },
			{ path: "/css", text: "CSS" }
		];

		$.head('12qhfyh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>svelte-codemirror-editor</title>`);
			});
		});

		$$renderer.push(`<section class="layout svelte-12qhfyh"><header class="header svelte-12qhfyh"><h1 class="svelte-12qhfyh"><a${$.attr('href', resolve("/"))} class="svelte-12qhfyh">svelte-codemirror-editor</a></h1></header> <nav class="menu svelte-12qhfyh"><!--[-->`);

		const each_array = $.ensure_array_like(nav);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', resolve(item.path))}${$.attr_class(`menu__item ${page.url.pathname === resolve(item.path) ? 'menu__item_active' : ''}`, 'svelte-12qhfyh')}>${$.escape(item.text)}</a>`);
		}

		$$renderer.push(`<!--]--></nav> <main class="svelte-12qhfyh"><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></main></section>`);
	});
}