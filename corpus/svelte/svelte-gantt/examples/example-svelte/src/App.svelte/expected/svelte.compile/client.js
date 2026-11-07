import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nav from './components/Nav.svelte';
import { Router, Route, navigate, Link } from "svelte-routing";
import LargeDataset from './routes/LargeDataset.svelte';
import Dependencies from './routes/Dependencies.svelte';
import External from './routes/External.svelte';
import Events from './routes/Events.svelte';
import Tree from './routes/Tree.svelte';
import { writable } from 'svelte/store';
import { setContext } from 'svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="container svelte-24d4r1"><!> <!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const $optionsStream = () => $.store_get(optionsStream, '$optionsStream', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showOptions = false;

	function onToggleOptions() {
		showOptions = !showOptions;
	}

	let optionsStream = new writable({});

	function onChangeOptions(event) {
		const opts = event.detail;

		$.store_set(optionsStream, opts);
		optionsStream.set(opts);
		console.log('onChangeOptions', opts);
	}

	setContext('options', { optionsStream, toggle: new writable(false) });

	function onLoadRoute(event) {
		navigate(event.detail.url);
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	Nav(node, {
		$$events: {
			updateOptions: onChangeOptions,
			toggleOptions: onToggleOptions,
			loadRoute: onLoadRoute
		}
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Router(node_1, {
		basepath: '/svelte-gantt',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Route(node_2, {
				path: '/',
				get component() {
					return LargeDataset;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Route(node_3, {
				path: '/dependencies',
				get component() {
					return Dependencies;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Route(node_4, {
				path: '/tree',
				get component() {
					return Tree;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Route(node_5, {
				path: '/external',
				get component() {
					return External;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Route(node_6, {
				path: '/events',
				get component() {
					return Events;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {};

		$.if(node_7, ($$render) => {
			if (showOptions) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}