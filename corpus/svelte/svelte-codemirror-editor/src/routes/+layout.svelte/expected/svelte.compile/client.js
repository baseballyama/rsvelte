import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../styles.css";
import { page } from "$app/state";
import { resolve } from "$app/paths";

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<section class="layout svelte-12qhfyh"><header class="header svelte-12qhfyh"><h1 class="svelte-12qhfyh"><a class="svelte-12qhfyh">svelte-codemirror-editor</a></h1></header> <nav class="menu svelte-12qhfyh"></nav> <main class="svelte-12qhfyh"><!></main></section>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const nav = [
		{ path: "/", text: "Configurator" },
		{ path: "/javascript", text: "Javascript" },
		{ path: "/typescript", text: "Typescript" },
		{ path: "/html", text: "HTML" },
		{ path: "/css", text: "CSS" }
	];

	var section = root_1();

	$.head('12qhfyh', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'svelte-codemirror-editor';
		});
	});

	var header = $.child(section);
	var h1 = $.child(header);
	var a = $.only_child(h1);

	$.reset(header);

	var nav_1 = $.sibling(header, 2);

	$.each(nav_1, 21, () => nav, (item) => item.path, ($$anchor, item) => {
		var a_1 = root();
		var text = $.only_child(a_1, true);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(a_1, 'href', $0);
				$.set_class(a_1, 1, `menu__item ${$1 ?? ''}`, 'svelte-12qhfyh');
				$.set_text(text, $.get(item).text);
			},
			[
				() => resolve($.get(item).path),
				() => page.url.pathname === resolve($.get(item).path) ? 'menu__item_active' : ''
			]
		);

		$.append($$anchor, a_1);
	});

	$.reset(nav_1);

	var main = $.sibling(nav_1, 2);
	var node = $.child(main);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(main);
	$.reset(section);
	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve("/")]);
	$.append($$anchor, section);
	$.pop();
}