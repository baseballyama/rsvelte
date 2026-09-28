import * as $ from 'svelte/internal/server';
import Router, { link, push, pop, replace, router } from 'svelte-spa-router';
import active from 'svelte-spa-router/active';
import routes from './routes';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Import the router component, the "link" action, and methods to control history programmatically
		// Import the "active" action
		// Import the list of routes
		// Contains logging information used by tests
		let logbox = '';

		// Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its pre-condition failed
		function onConditionsFailed(detail) {
			// eslint-disable-next-line no-console
			console.error('Caught event conditionsFailed', detail);

			logbox += 'conditionsFailed - ' + JSON.stringify(detail) + '\n';

			// Replace the route
			replace('/wild/conditions-failed');
		}

		// Handles the "routeLoaded" event dispatched by the router after a route has been successfully loaded
		function onRouteLoaded(detail) {
			// eslint-disable-next-line no-console
			console.info('Caught event routeLoaded', detail);

			logbox += 'routeLoaded - ' + JSON.stringify(detail) + '\n';
		}

		// Handles the "routeLoading" event dispatched by the router whie a route is being loaded
		// If the route is dynamically imported, such as with the `import()` syntax, then there might be a delay before the route is loaded
		function onRouteLoading(detail) {
			// eslint-disable-next-line no-console
			console.info('Caught event routeLoading', detail);

			logbox += 'routeLoading - ' + JSON.stringify(detail) + '\n';
		}

		// Handles event bubbling up from nested routes
		function onRouteEvent(detail) {
			// eslint-disable-next-line no-console
			console.info('Caught event routeEvent', detail);

			logbox += 'routeEvent - ' + JSON.stringify(detail) + '\n';
		}

		// Enables the restoreScrollState option by checking for the "scroll=1" querystring parameter
		// We're checking this for the tests, but in your code you will likely want to set this value manually
		const urlParams = new URLSearchParams(window.location.search);

		const restoreScrollState = !!urlParams.has('scroll');

		// List of dynamic links
		let dynamicLinks = [
			{ id: 1, link: '/hello/dynamic-link-1' },
			{ id: 2, link: '/hello/dynamic-link-2' },
			{ id: 3, link: '/hello/dynamic-link-3' }
		];

		// List of links that can be disabled
		let disableLinks = [
			{
				id: 1,
				opts: {
					//href: '/hello/disable-link-1',
					disabled: false
				}
			},

			{
				id: 2,
				opts: {
					//href: '/hello/disable-link-2',
					disabled: false
				}
			},

			{
				id: 3,
				opts: { href: '/hello/disable-link-3', disabled: false }
			}
		];

		disableLinks.map((el) => {
			el.toggle = () => {
				el.opts.disabled = !el.opts.disabled;
			};

			return el;
		});

		$$renderer.push(`<h1>svelte-spa-router example</h1>  <ul class="navigation-links"><li><a href="/">Home</a></li> <li><a href="/brand"><b>Brand</b></a></li> <li><a href="/hello/svelte">Say hi!</a></li> <li><a href="/does/not/exist">Not found</a></li></ul> <p class="navigation-buttons"><button>Visit /wild/something</button> <button>Go back</button> <button>Replace current page</button></p> <a href="/hello/svelte?quantity=100">Querystring args</a> <p>Current path: <code id="currentpath">${$.escape(router.location)}</code> <br/> Querystring: <code id="currentqs">${$.escape(router.querystring)}</code> <br/> Params: <code id="currentparams">${$.escape(JSON.stringify(router.params))}</code></p> `);

		Router($$renderer, {
			routes,
			onConditionsFailed,
			onRouteLoaded,
			onRouteLoading,
			onRouteEvent,
			restoreScrollState
		});

		$$renderer.push(`<!----> <h2>Dynamic links</h2> <ul class="navigation-dynamic-links"><!--[-->`);

		const each_array = $.ensure_array_like(dynamicLinks);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let dl = each_array[$$index];

			$$renderer.push(`<li><a${$.attr('id', `dynamic-link-${$.stringify(dl.id)}`)}${$.attr('href', dl.link)}>Dynamic Link ${$.escape(dl.id)}</a> - <i role="button"${$.attr('id', `delete-link-${$.stringify(dl.id)}`)}>delete link</i></li>`);
		}

		$$renderer.push(`<!--]--></ul> <h2>Dynamic links</h2> <ul class="navigation-disable-links"><!--[-->`);

		const each_array_1 = $.ensure_array_like(disableLinks);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let dl = each_array_1[i];

			$$renderer.push(`<li><a${$.attr('id', `disable-link-${$.stringify(dl.id)}`)} href="/foo">Dynamic Link ${$.escape(dl.id)}</a> - <i role="button"${$.attr('id', `toggle-link-${$.stringify(dl.id)}`)}>`);

			if (dl.opts.disabled) {
				$$renderer.push(`<!--[0-->enable link`);
			} else {
				$$renderer.push(`<!--[-1-->disable link`);
			}

			$$renderer.push(`<!--]--></i></li>`);
		}

		$$renderer.push(`<!--]--></ul> <p><a href="#/">This link</a> is active when you're matching <code>/*/hi</code></p> <pre id="logbox">${$.escape(logbox)}</pre>`);
	});
}