import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SnsBar from './SnsBar.svelte';
import { page } from '$app/stores';
import { resolve } from '$app/paths';

var root = $.from_html(`<header class="header svelte-10tpybp"><span class="title svelte-10tpybp">svelte-eslint-parser</span> <a>AST</a> <a>Playgroud</a> <a>Scope</a> <a>Virtual Script Code</a> <div class="debug svelte-10tpybp"> </div> <!> <a href="https://github.com/sveltejs/svelte-eslint-parser" class="github-link svelte-10tpybp">View on GitHub</a></header>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function isActive(pathname, path) {
		const normalizedPathname = pathname.replace(/\/$/u, '');
		const normalizedPath = path.replace(/\/$/u, '');

		return normalizedPathname === normalizedPath || normalizedPathname === resolve(normalizedPath || '/');
	}

	var header = root();
	var a = $.sibling($.child(header), 2);
	let classes;
	var a_1 = $.sibling(a, 2);
	let classes_1;
	var a_2 = $.sibling(a_1, 2);
	let classes_2;
	var a_3 = $.sibling(a_2, 2);
	let classes_3;
	var div = $.sibling(a_3, 2);
	var text = $.only_child(div);
	var node = $.sibling(div, 2);

	SnsBar(node, {});
	$.next(2);
	$.reset(header);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7) => {
			classes = $.set_class(a, 1, 'menu svelte-10tpybp', null, classes, { active: $0 });
			$.set_attribute(a, 'href', $1);
			classes_1 = $.set_class(a_1, 1, 'menu svelte-10tpybp', null, classes_1, { active: $2 });
			$.set_attribute(a_1, 'href', $3);
			classes_2 = $.set_class(a_2, 1, 'menu svelte-10tpybp', null, classes_2, { active: $4 });
			$.set_attribute(a_2, 'href', $5);
			classes_3 = $.set_class(a_3, 1, 'menu svelte-10tpybp', null, classes_3, { active: $6 });
			$.set_attribute(a_3, 'href', $7);
			$.set_text(text, `$page.url.pathname: ${$page().url.pathname ?? ''}`);
		},
		[
			() => isActive($page().url.pathname, `/`),
			() => resolve('/'),
			() => isActive($page().url.pathname, `/playground`),
			() => resolve('/playground'),
			() => isActive($page().url.pathname, `/scope`),
			() => resolve('/scope'),
			() => isActive($page().url.pathname, `/virtual-script-code`),
			() => resolve('/virtual-script-code')
		]
	);

	$.append($$anchor, header);
	$.pop();
	$$cleanup();
}