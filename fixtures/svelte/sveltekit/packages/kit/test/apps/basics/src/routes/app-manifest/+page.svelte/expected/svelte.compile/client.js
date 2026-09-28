import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { immutable, assets, prerendered, routes } from '$app/manifest';

var root = $.from_html(`<h1>$app/manifest</h1> <section data-name="routes"><h2>routes</h2> <pre> </pre></section> <section data-name="assets"><h2>assets</h2> <pre> </pre></section> <section data-name="prerendered"><h2>prerendered</h2> <pre> </pre></section> <section data-name="immutable"><h2>immutable</h2> <pre> </pre></section>`, 1);

export default function _page($$anchor) {
	let prerendered_json = JSON.stringify(prerendered, null, '  ');
	let routes_json = JSON.stringify(routes, null, '  ');
	let files_json = JSON.stringify(assets, null, '  ');
	let build_json = JSON.stringify(immutable, null, '  ');
	var fragment = root();
	var section = $.sibling($.first_child(fragment), 2);
	var pre = $.sibling($.child(section), 2);
	var text = $.only_child(pre, true);

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var pre_1 = $.sibling($.child(section_1), 2);
	var text_1 = $.only_child(pre_1, true);

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var pre_2 = $.sibling($.child(section_2), 2);
	var text_2 = $.only_child(pre_2, true);

	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var pre_3 = $.sibling($.child(section_3), 2);
	var text_3 = $.only_child(pre_3, true);

	$.reset(section_3);

	$.template_effect(() => {
		$.set_text(text, routes_json);
		$.set_text(text_1, files_json);
		$.set_text(text_2, prerendered_json);
		$.set_text(text_3, build_json);
	});

	$.append($$anchor, fragment);
}