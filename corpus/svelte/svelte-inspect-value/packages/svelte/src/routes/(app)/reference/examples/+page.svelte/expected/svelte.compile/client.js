import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BasicEditable from '$doclib/examples/BasicEditable.svelte';
import Classes from '$doclib/examples/Classes.svelte';
import EmbedMedia from '$doclib/examples/EmbedMedia.svelte';
import Functions from '$doclib/examples/Functions.svelte';
import GettersAndSetters from '$doclib/examples/GettersAndSetters.svelte';
import HtmlElements from '$doclib/examples/HTMLElements.svelte';
import Iterators from '$doclib/examples/Iterators.svelte';
import MapAndSet from '$doclib/examples/MapAndSet.svelte';
import MultiLineStrings from '$doclib/examples/MultiLineStrings.svelte';
import Other from '$doclib/examples/Other.svelte';
import Promises from '$doclib/examples/Promises.svelte';
import Stores from '$doclib/examples/Stores.svelte';
import Urls from '$doclib/examples/Urls.svelte';
import { createPageTitle } from '$doclib/util.js';
import { PanelValue } from '$lib/index.js';
import { setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

var root = $.from_html(`<a> </a> <hr/>`, 1);
var root_1 = $.from_html(`<!> <div class="toc"></div> <h2>Examples</h2> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let codeSamples = $.derived(() => $$props.data.codeSamples);
	const toc = new SvelteMap();

	setContext('toc', toc);

	var fragment = root_1();

	$.head('irkmml', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Examples')]
		);
	});

	var node = $.first_child(fragment);

	PanelValue(node, {
		key: 'toc',
		get value() {
			return toc;
		}
	});

	var div = $.sibling(node, 2);

	$.each(div, 21, () => toc, ([title, id]) => id, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let title = () => $.get($$array)[0];
		let id = () => $.get($$array)[1];
		var fragment_1 = root();
		var a = $.first_child(fragment_1);
		var text = $.only_child(a, true);

		$.next(2);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `#${id()}`);
			$.set_text(text, title());
		});

		$.append($$anchor, fragment_1);
	});

	$.reset(div);

	var node_1 = $.sibling(div, 4);

	BasicEditable(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	MultiLineStrings(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	MapAndSet(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	Promises(node_4, {
		get code() {
			return $.get(codeSamples).promises;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Stores(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	HtmlElements(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	Classes(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	Functions(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	Urls(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	GettersAndSetters(node_10, {
		get code() {
			return $.get(codeSamples).gettersAndSetters;
		}
	});

	var node_11 = $.sibling(node_10, 2);

	Iterators(node_11, {
		get code() {
			return $.get(codeSamples).iterators;
		}
	});

	var node_12 = $.sibling(node_11, 2);

	EmbedMedia(node_12, {});

	var node_13 = $.sibling(node_12, 2);

	Other(node_13, {});
	$.append($$anchor, fragment);
	$.pop();
}