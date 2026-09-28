import * as $ from 'svelte/internal/server';
import Nav from './components/Nav.svelte';
import { Router, Route, navigate, Link } from "svelte-routing";
import LargeDataset from './routes/LargeDataset.svelte';
import Dependencies from './routes/Dependencies.svelte';
import External from './routes/External.svelte';
import Events from './routes/Events.svelte';
import Tree from './routes/Tree.svelte';
import { writable } from 'svelte/store';
import { setContext } from 'svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

		Nav($$renderer, {});
		$$renderer.push(`<!----> <div class="container svelte-24d4r1">`);

		Router($$renderer, {
			basepath: '/svelte-gantt',
			children: ($$renderer) => {
				Route($$renderer, { path: '/', component: LargeDataset });
				$$renderer.push(`<!----> `);
				Route($$renderer, { path: '/dependencies', component: Dependencies });
				$$renderer.push(`<!----> `);
				Route($$renderer, { path: '/tree', component: Tree });
				$$renderer.push(`<!----> `);
				Route($$renderer, { path: '/external', component: External });
				$$renderer.push(`<!----> `);
				Route($$renderer, { path: '/events', component: Events });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (showOptions) {
			$$renderer.push('<!--[0-->');
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}