import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';
import Nav from '$lib/common/nav.svelte';
import Alert from '$lib/common/Alert.svelte';
import Stores from '$lib/common/Stores.svelte';
import { themeStore } from '$lib/common/stores.js';

var root = $.from_html(`<main class="flex flex-col"><!> <div class="flex"><!> <div class="flex flex-1 min-w-0 flex-col bg-base-100"><!>  <div><!></div></div></div></main>`);

export default function _layout($$anchor, $$props) {
	const $themeStore = () => $.store_get(themeStore, '$themeStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	var // NOTE: the element that is using one of the theme attributes must be in the DOM on mount
	main = root();

	var node = $.child(main);

	Stores(node, {});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Nav(node_1, {});

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	Alert(node_2, {});

	var div_2 = $.sibling(node_2, 2);
	var node_3 = $.child(div_2);

	$.slot(node_3, $$props, 'default', {}, null);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(main);
	$.template_effect(() => $.set_attribute(main, 'data-theme', $themeStore()));
	$.append($$anchor, main);
	$$cleanup();
}