import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { base } from '$app/paths';

var root = $.from_html(`<div class="overlay svelte-1b25erl" role="button" tabindex="-1"></div>`);
var root_1 = $.from_html(`<a> </a>`);
var root_2 = $.from_html(`<!> <aside><nav class="svelte-1b25erl"><a>Home</a> <h4 class="svelte-1b25erl">Charts</h4> <!> <h4 class="svelte-1b25erl">Examples</h4> <!> <h4 class="svelte-1b25erl">Guides</h4> <!> <h4 class="svelte-1b25erl">Reference</h4> <a>API</a></nav></aside>`, 1);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false);

	const charts = [
		{ href: '/charts/bar', label: 'Bar' },
		{ href: '/charts/line', label: 'Line' },
		{ href: '/charts/pie', label: 'Pie' },
		{ href: '/charts/doughnut', label: 'Doughnut' },
		{ href: '/charts/radar', label: 'Radar' },
		{ href: '/charts/polar', label: 'Polar Area' },
		{ href: '/charts/bubble', label: 'Bubble' },
		{ href: '/charts/scatter', label: 'Scatter' }
	];

	const examples = [
		{ href: '/examples/ref', label: 'Chart Instance' },
		{ href: '/examples/events', label: 'Events' },
		{ href: '/examples/horizontal-bar', label: 'Horizontal Bar' },
		{ href: '/examples/stacked-bar', label: 'Stacked Bar' },
		{ href: '/examples/multitype', label: 'Mixed Chart' },
		{ href: '/examples/gradient', label: 'Gradient' }
	];

	const guides = [{ href: '/guides/reactivity', label: 'Reactive Data' }];

	function closeOnMobile() {
		open(false);
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.delegated('click', div, closeOnMobile);
			$.delegated('keydown', div, closeOnMobile);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (open()) $$render(consequent);
		});
	}

	var aside = $.sibling(node, 2);
	let classes;
	var nav = $.child(aside);
	var a = $.child(nav);
	let classes_1;
	var node_1 = $.sibling(a, 4);

	$.each(node_1, 17, () => charts, $.index, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let label = () => $.get($$item).label;
		var a_1 = root_1();
		let classes_2;
		var text = $.only_child(a_1, true);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', `${base}${href()}`);
			classes_2 = $.set_class(a_1, 1, 'svelte-1b25erl', null, classes_2, { active: page.url.pathname === `${base}${href()}` });
			$.set_text(text, label());
		});

		$.delegated('click', a_1, closeOnMobile);
		$.append($$anchor, a_1);
	});

	var node_2 = $.sibling(node_1, 4);

	$.each(node_2, 17, () => examples, $.index, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let label = () => $.get($$item).label;
		var a_2 = root_1();
		let classes_3;
		var text_1 = $.only_child(a_2, true);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', `${base}${href()}`);
			classes_3 = $.set_class(a_2, 1, 'svelte-1b25erl', null, classes_3, { active: page.url.pathname === `${base}${href()}` });
			$.set_text(text_1, label());
		});

		$.delegated('click', a_2, closeOnMobile);
		$.append($$anchor, a_2);
	});

	var node_3 = $.sibling(node_2, 4);

	$.each(node_3, 17, () => guides, $.index, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let label = () => $.get($$item).label;
		var a_3 = root_1();
		let classes_4;
		var text_2 = $.only_child(a_3, true);

		$.template_effect(() => {
			$.set_attribute(a_3, 'href', `${base}${href()}`);
			classes_4 = $.set_class(a_3, 1, 'svelte-1b25erl', null, classes_4, { active: page.url.pathname === `${base}${href()}` });
			$.set_text(text_2, label());
		});

		$.delegated('click', a_3, closeOnMobile);
		$.append($$anchor, a_3);
	});

	var a_4 = $.sibling(node_3, 4);
	let classes_5;

	$.reset(nav);
	$.reset(aside);

	$.template_effect(() => {
		classes = $.set_class(aside, 1, 'svelte-1b25erl', null, classes, { open: open() });
		$.set_attribute(a, 'href', `${base}/`);
		classes_1 = $.set_class(a, 1, 'svelte-1b25erl', null, classes_1, { active: page.url.pathname === `${base}/` });
		$.set_attribute(a_4, 'href', `${base}/api`);
		classes_5 = $.set_class(a_4, 1, 'svelte-1b25erl', null, classes_5, { active: page.url.pathname === `${base}/api` });
	});

	$.delegated('click', a, closeOnMobile);
	$.delegated('click', a_4, closeOnMobile);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);