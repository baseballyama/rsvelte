import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate, refreshAll } from '$app/navigation';
import { page } from '$app/state';
import { increment_layout, increment_page } from './state';

var root = $.from_html(`<button class="layout">Refresh layout</button> <button class="page">Refresh page</button> <button class="all">Refresh all</button> <p> </p> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	/** @param {string} str */
	async function update(str) {
		if (str !== 'page') {
			increment_layout();
		}

		if (str !== 'layout') {
			increment_page();
		}

		if (str === 'all') {
			refreshAll();
		} else {
			invalidate(`invalid:${str}`);
		}
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var p = $.sibling(button_2, 2);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	$.slot(node, $$props, 'default', {}, null);
	$.template_effect(() => $.set_text(text, `layout: ${page.data.count_layout ?? ''}, page: ${page.data.count_page ?? ''}`));
	$.delegated('click', button, () => update('layout'));
	$.delegated('click', button_1, () => update('page'));
	$.delegated('click', button_2, () => update('all'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);