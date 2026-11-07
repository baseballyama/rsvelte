import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getDevices } from '$lib/common/apiFunctions.svelte';
import { deviceSortDirectionStore, deviceSortStore } from '$lib/common/stores.js';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path></svg>`);
var root_2 = $.from_html(`<span class="flex"><button class="mx-1"><!></button> <span class="btn-group"><button>ID</button> <button>Device Name</button> <button>Last Seen</button></span></span>`);

export default function SortDevices($$anchor, $$props) {
	$.push($$props, true);

	const $deviceSortDirectionStore = () => $.store_get(deviceSortDirectionStore, '$deviceSortDirectionStore', $$stores);
	const $deviceSortStore = () => $.store_get(deviceSortStore, '$deviceSortStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function sortAction() {
		if ($deviceSortDirectionStore() == 'ascending') {
			$.store_set(deviceSortDirectionStore, 'descending');
		} else {
			$.store_set(deviceSortDirectionStore, 'ascending');
		}

		getDevices();
	}

	var span = root_2();
	var button = $.child(span);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		$.if(node, ($$render) => {
			if ($deviceSortDirectionStore() == 'ascending') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var span_1 = $.sibling(button, 2);
	var button_1 = $.child(span_1);
	let classes;
	var button_2 = $.sibling(button_1, 2);
	let classes_1;
	var button_3 = $.sibling(button_2, 2);
	let classes_2;

	$.reset(span_1);
	$.reset(span);

	$.template_effect(() => {
		classes = $.set_class(button_1, 1, 'btn btn-xs', null, classes, { 'btn-active': $deviceSortStore() == 'id' });
		classes_1 = $.set_class(button_2, 1, 'btn btn-xs capitalize', null, classes_1, { 'btn-active': $deviceSortStore() == 'givenName' });
		classes_2 = $.set_class(button_3, 1, 'btn btn-xs capitalize', null, classes_2, { 'btn-active': $deviceSortStore() == 'lastSeen' });
	});

	$.event('keypress', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button, () => {
		sortAction();
	});

	$.event('click', button_1, () => {
		$.store_set(deviceSortStore, 'id');
		getDevices();
	});

	$.event('click', button_2, () => {
		$.store_set(deviceSortStore, 'givenName');
		getDevices();
	});

	$.event('click', button_3, () => {
		$.store_set(deviceSortStore, 'lastSeen');
		getDevices();
	});

	$.append($$anchor, span);
	$.pop();
	$$cleanup();
}