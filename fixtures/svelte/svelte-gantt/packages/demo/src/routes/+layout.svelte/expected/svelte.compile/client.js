import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../gantt-default.css';
import '../main.css';
import { showOptions, options } from './../stores/store';
import GanttViewNavigation from '../components/GanttViewNavigation.svelte';
import { base } from '$app/paths';

var root = $.from_html(`<div class="app svelte-dngl6v"><header class="header svelte-dngl6v"><div class="header-title svelte-dngl6v"><a href="https://github.com/ANovokmet/svelte-gantt" class="svelte-dngl6v">Svelte-gantt</a></div> <div class="header-controls svelte-dngl6v"><div class="header-controls__row"><a><button type="button" class="svelte-dngl6v">LargeDataset</button></a> <a><button type="button" class="svelte-dngl6v">Dependencies</button></a> <a><button type="button" class="svelte-dngl6v">Tree</button></a> <a><button type="button" class="svelte-dngl6v">External</button></a> <a><button type="button" class="svelte-dngl6v">Events</button></a> <a><button type="button" class="svelte-dngl6v">Multiple gantt</button></a> <a><button type="button" class="svelte-dngl6v">Usage as svelte component</button></a> <a><button type="button" class="svelte-dngl6v">Column styles</button></a> <a><button type="button" class="svelte-dngl6v">Layouts</button></a> <a><button type="button" class="svelte-dngl6v">Create tasks</button></a></div> <!> <button class="svelte-dngl6v">|||</button></div></header> <!></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $options = () => $.store_get(options, '$options', $$stores);
	const $showOptions = () => $.store_get(showOptions, '$showOptions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function onUpdateOptions(event) {
		const opts = event.detail;

		console.log('onUpdateOptions', opts);
		$.store_set(options, { ...$options(), ...opts });
	}

	var div = root();
	var header = $.child(div);
	var div_1 = $.sibling($.child(header), 2);
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);
	var a_3 = $.sibling(a_2, 2);
	var a_4 = $.sibling(a_3, 2);
	var a_5 = $.sibling(a_4, 2);
	var a_6 = $.sibling(a_5, 2);
	var a_7 = $.sibling(a_6, 2);
	var a_8 = $.sibling(a_7, 2);
	var a_9 = $.sibling(a_8, 2);

	$.reset(div_2);

	var node = $.sibling(div_2, 2);

	GanttViewNavigation(node, {
		get options() {
			return $options();
		},
		$$events: { updateOptions: onUpdateOptions }
	});

	var button = $.sibling(node, 2);

	$.reset(div_1);
	$.reset(header);

	var node_1 = $.sibling(header, 2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${base ?? ''}/large-dataset`);
		$.set_attribute(a_1, 'href', `${base ?? ''}/dependencies`);
		$.set_attribute(a_2, 'href', `${base ?? ''}/tree`);
		$.set_attribute(a_3, 'href', `${base ?? ''}/external`);
		$.set_attribute(a_4, 'href', `${base ?? ''}/events`);
		$.set_attribute(a_5, 'href', `${base ?? ''}/multiple-charts`);
		$.set_attribute(a_6, 'href', `${base ?? ''}/svelte-component`);
		$.set_attribute(a_7, 'href', `${base ?? ''}/column-styles`);
		$.set_attribute(a_8, 'href', `${base ?? ''}/pack-layout`);
		$.set_attribute(a_9, 'href', `${base ?? ''}/create-tasks`);
	});

	$.event('click', button, () => {
		showOptions.set(!$showOptions());
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}