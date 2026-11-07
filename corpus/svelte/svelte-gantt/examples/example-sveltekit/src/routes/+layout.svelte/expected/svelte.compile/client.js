import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './../gantt-default.css';
import { showOptions, setView, moveView } from './../stores/store';

var root = $.from_html(`<header class="header svelte-poj9ve"><div class="header-title svelte-poj9ve"><a href="https://github.com/ANovokmet/svelte-gantt" class="svelte-poj9ve">Svelte-gantt</a></div> <div class="header-controls svelte-poj9ve"><a href="/"><button type="button" class="svelte-poj9ve">LargeDataset</button></a> <a href="/dependencies"><button type="button" class="svelte-poj9ve">Dependencies</button></a> <a href="/tree"><button type="button" class="svelte-poj9ve">Tree</button></a> <a href="/external"><button type="button" class="svelte-poj9ve">External</button></a> <a href="/events"><button type="button" class="svelte-poj9ve">Events</button></a> <input type="button" value="&lt;" class="svelte-poj9ve"/> <button type="button" value="Day view" class="svelte-poj9ve">Day view</button> <input type="button" value=">" class="svelte-poj9ve"/> <button type="button" value="Week view" class="svelte-poj9ve">Week view</button> <button class="svelte-poj9ve">|||</button></div></header> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $showOptions = () => $.store_get(showOptions, '$showOptions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var header = $.first_child(fragment);
	var div = $.sibling($.child(header), 2);
	var input = $.sibling($.child(div), 10);
	var button = $.sibling(input, 2);
	var input_1 = $.sibling(button, 2);
	var button_1 = $.sibling(input_1, 2);
	var button_2 = $.sibling(button_1, 2);

	$.reset(div);
	$.reset(header);

	var node = $.sibling(header, 2);

	$.slot(node, $$props, 'default', {}, null);

	$.event('click', input, () => {
		moveView.set('prevDay');
	});

	$.event('click', button, () => {
		setView.set('day');
	});

	$.event('click', input_1, () => {
		moveView.set('nextDay');
	});

	$.event('click', button_1, () => {
		setView.set('week');
	});

	$.event('click', button_2, () => {
		showOptions.set(!$showOptions());
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}