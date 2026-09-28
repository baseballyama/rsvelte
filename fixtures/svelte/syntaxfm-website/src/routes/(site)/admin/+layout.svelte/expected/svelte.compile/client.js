import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<nav class="svelte-1k5m4xw"></nav> <div class="admin svelte-1k5m4xw"><!></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const LINKS = [
		{ name: 'Dashboard', link: '/admin' },
		{ name: 'Shows', link: '/admin/shows' },
		{ name: 'Transcripts', link: '/admin/transcripts' },
		{ name: 'Video', link: '/admin/videos' },
		{ name: 'Submissions', link: '/admin/submissions' },
		{ name: 'Cache', link: '/admin/cache' }
	];

	var fragment = root_1();
	var nav = $.first_child(fragment);

	$.each(nav, 21, () => LINKS, $.index, ($$anchor, link) => {
		var a = root();
		let classes;
		var text = $.only_child(a, true);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(link).link);
			classes = $.set_class(a, 1, 'svelte-1k5m4xw', null, classes, { active: $page().url.pathname === $.get(link).link });
			$.set_text(text, $.get(link).name);
		});

		$.append($$anchor, a);
	});

	$.reset(nav);

	var div = $.sibling(nav, 2);
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}