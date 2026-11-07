import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Router, { link, push, pop, replace, router } from 'svelte-spa-router';
import active from 'svelte-spa-router/active';
import routes from './routes';

var root = $.from_html(`<li><a> </a> - <i role="button">delete link</i></li>`);
var root_1 = $.from_html(`<li><a href="/foo"> </a> - <i role="button"><!></i></li>`);
var root_2 = $.from_html(`<h1>svelte-spa-router example</h1>  <ul class="navigation-links"><li><a href="/">Home</a></li> <li><a href="/brand"><b>Brand</b></a></li> <li><a href="/hello/svelte">Say hi!</a></li> <li><a href="/does/not/exist">Not found</a></li></ul> <p class="navigation-buttons"><button>Visit /wild/something</button> <button>Go back</button> <button>Replace current page</button></p> <a href="/hello/svelte?quantity=100">Querystring args</a> <p>Current path: <code id="currentpath"> </code> <br/> Querystring: <code id="currentqs"> </code> <br/> Params: <code id="currentparams"> </code></p> <!> <h2>Dynamic links</h2> <ul class="navigation-dynamic-links"></ul> <h2>Dynamic links</h2> <ul class="navigation-disable-links"></ul> <p><a href="#/">This link</a> is active when you're matching <code>/*/hi</code></p> <pre id="logbox"> </pre>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	// Import the router component, the "link" action, and methods to control history programmatically
	// Import the "active" action
	// Import the list of routes
	// Contains logging information used by tests
	let logbox = $.state('');

	// Handles the "conditionsFailed" event dispatched by the router when a component can't be loaded because one of its pre-condition failed
	function onConditionsFailed(detail) {
		// eslint-disable-next-line no-console
		console.error('Caught event conditionsFailed', detail);

		$.set(logbox, $.get(logbox) + ('conditionsFailed - ' + JSON.stringify(detail) + '\n'));

		// Replace the route
		replace('/wild/conditions-failed');
	}

	// Handles the "routeLoaded" event dispatched by the router after a route has been successfully loaded
	function onRouteLoaded(detail) {
		// eslint-disable-next-line no-console
		console.info('Caught event routeLoaded', detail);

		$.set(logbox, $.get(logbox) + ('routeLoaded - ' + JSON.stringify(detail) + '\n'));
	}

	// Handles the "routeLoading" event dispatched by the router whie a route is being loaded
	// If the route is dynamically imported, such as with the `import()` syntax, then there might be a delay before the route is loaded
	function onRouteLoading(detail) {
		// eslint-disable-next-line no-console
		console.info('Caught event routeLoading', detail);

		$.set(logbox, $.get(logbox) + ('routeLoading - ' + JSON.stringify(detail) + '\n'));
	}

	// Handles event bubbling up from nested routes
	function onRouteEvent(detail) {
		// eslint-disable-next-line no-console
		console.info('Caught event routeEvent', detail);

		$.set(logbox, $.get(logbox) + ('routeEvent - ' + JSON.stringify(detail) + '\n'));
	}

	// Enables the restoreScrollState option by checking for the "scroll=1" querystring parameter
	// We're checking this for the tests, but in your code you will likely want to set this value manually
	const urlParams = new URLSearchParams(window.location.search);

	const restoreScrollState = !!urlParams.has('scroll');

	// List of dynamic links
	let dynamicLinks = $.state($.proxy([
		{ id: 1, link: '/hello/dynamic-link-1' },
		{ id: 2, link: '/hello/dynamic-link-2' },
		{ id: 3, link: '/hello/dynamic-link-3' }
	]));

	// List of links that can be disabled
	let disableLinks = $.proxy([
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
	]);

	disableLinks.map((el) => {
		el.toggle = () => {
			el.opts.disabled = !el.opts.disabled;
		};

		return el;
	});

	var fragment = root_2();
	var ul = $.sibling($.first_child(fragment), 2);
	var li = $.child(ul);
	var a = $.child(li);

	$.action(a, ($$node) => link?.($$node));
	$.action(a, ($$node) => active?.($$node));
	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var a_1 = $.child(li_1);

	$.action(a_1, ($$node) => link?.($$node));
	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var a_2 = $.child(li_2);

	$.action(a_2, ($$node) => link?.($$node));

	$.action(a_2, ($$node, $$action_arg) => active?.($$node, $$action_arg), () => ({
		path: '/hello/*',
		className: 'active another-class',
		inactiveClassName: 'inactive'
	}));

	$.reset(li_2);

	var li_3 = $.sibling(li_2, 2);
	var a_3 = $.child(li_3);

	$.action(a_3, ($$node) => link?.($$node));
	$.reset(li_3);
	$.reset(ul);

	var p = $.sibling(ul, 2);
	var button = $.child(p);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.reset(p);

	var a_4 = $.sibling(p, 2);

	$.action(a_4, ($$node) => link?.($$node));
	$.action(a_4, ($$node, $$action_arg) => active?.($$node, $$action_arg), () => '/hello/*');

	var p_1 = $.sibling(a_4, 2);
	var code = $.sibling($.child(p_1));
	var text = $.only_child(code, true);
	var code_1 = $.sibling(code, 4);
	var text_1 = $.only_child(code_1, true);
	var code_2 = $.sibling(code_1, 4);
	var text_2 = $.only_child(code_2, true);

	$.reset(p_1);

	var node = $.sibling(p_1, 2);

	Router(node, {
		get routes() {
			return routes;
		},
		onConditionsFailed,
		onRouteLoaded,
		onRouteLoading,
		onRouteEvent,
		get restoreScrollState() {
			return restoreScrollState;
		}
	});

	var ul_1 = $.sibling(node, 4);

	$.each(ul_1, 21, () => $.get(dynamicLinks), (dl) => dl.id, ($$anchor, dl) => {
		var li_4 = root();
		var a_5 = $.child(li_4);
		var text_3 = $.only_child(a_5);

		$.action(a_5, ($$node) => link?.($$node));
		$.action(a_5, ($$node) => active?.($$node));

		var i_1 = $.sibling(a_5, 2);

		$.reset(li_4);

		$.template_effect(() => {
			$.set_attribute(a_5, 'id', `dynamic-link-${$.get(dl).id ?? ''}`);
			$.set_attribute(a_5, 'href', $.get(dl).link);
			$.set_text(text_3, `Dynamic Link ${$.get(dl).id ?? ''}`);
			$.set_attribute(i_1, 'id', `delete-link-${$.get(dl).id ?? ''}`);
		});

		$.delegated('click', i_1, () => $.set(dynamicLinks, $.get(dynamicLinks).filter((e) => e.id != $.get(dl).id), true));
		$.append($$anchor, li_4);
	});

	$.reset(ul_1);

	var ul_2 = $.sibling(ul_1, 4);

	$.each(ul_2, 23, () => disableLinks, (dl) => dl.id, ($$anchor, dl) => {
		var li_5 = root_1();
		var a_6 = $.child(li_5);
		var text_4 = $.only_child(a_6);

		$.action(a_6, ($$node, $$action_arg) => link?.($$node, $$action_arg), () => $.get(dl).opts);
		$.action(a_6, ($$node) => active?.($$node));

		var i_2 = $.sibling(a_6, 2);
		var node_1 = $.child(i_2);

		{
			var consequent = ($$anchor) => {
				var text_5 = $.text('enable link');

				$.append($$anchor, text_5);
			};

			var alternate = ($$anchor) => {
				var text_6 = $.text('disable link');

				$.append($$anchor, text_6);
			};

			$.if(node_1, ($$render) => {
				if ($.get(dl).opts.disabled) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(i_2);
		$.reset(li_5);

		$.template_effect(() => {
			$.set_attribute(a_6, 'id', `disable-link-${$.get(dl).id ?? ''}`);
			$.set_text(text_4, `Dynamic Link ${$.get(dl).id ?? ''}`);
			$.set_attribute(i_2, 'id', `toggle-link-${$.get(dl).id ?? ''}`);
		});

		$.delegated('click', i_2, function (...$$args) {
			$.get(dl).toggle?.apply(this, $$args);
		});

		$.append($$anchor, li_5);
	});

	$.reset(ul_2);

	var p_2 = $.sibling(ul_2, 2);
	var a_7 = $.child(p_2);

	$.action(a_7, ($$node, $$action_arg) => active?.($$node, $$action_arg), () => /\/*\/hi/);
	$.next(2);
	$.reset(p_2);

	var pre = $.sibling(p_2, 2);
	var text_7 = $.only_child(pre, true);

	$.template_effect(
		($0) => {
			$.set_text(text, router.location);
			$.set_text(text_1, router.querystring);
			$.set_text(text_2, $0);
			$.set_text(text_7, $.get(logbox));
		},
		[() => JSON.stringify(router.params)]
	);

	$.delegated('click', button, () => push('/wild/something'));
	$.delegated('click', button_1, () => pop());
	$.delegated('click', button_2, () => replace('/wild/replaced'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);