import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import GuideContents from './GuideContents.svelte';
import examples from '../_examples.js';
import examplesSsr from '../_examples_ssr.js';

var root = $.from_html(`<option disabled="">Select...</option>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<div></div> <div class="container svelte-dx5cpj"><span> </span> <a href="/" class="logo svelte-dx5cpj">Layer Cake</a></div> <ul class="dropdown svelte-dx5cpj"><li class="svelte-dx5cpj"><select class="svelte-dx5cpj"><!><!><option>All</option><option class="header svelte-dx5cpj" disabled=""></option><option class="header svelte-dx5cpj" disabled="">Client-side</option><!><option class="header svelte-dx5cpj" disabled=""></option><option class="header svelte-dx5cpj" disabled="">Server-side</option><!></select></li></ul> <nav><ul class="primary svelte-dx5cpj"><li class="svelte-dx5cpj"><a href="/components"><span class="wide-name svelte-dx5cpj">Component gallery</span><span class="short-name svelte-dx5cpj">Components</span></a></li> <li class="svelte-dx5cpj"><a href="/guide">Guide</a></li> <li class="svelte-dx5cpj"><a id="github-link" target="_blank" rel="noreferrer" href="https://github.com/mhkeller/layercake" aria-label="Layer Cake GitHub Repository" class="svelte-dx5cpj"></a></li></ul> <div class="secondary svelte-dx5cpj"><!></div></nav>`, 1);

export default function Nav($$anchor, $$props) {
	$.push($$props, true);

	// let slug = '';
	let path = $.state(void 0);

	// let type;
	// I was getting a weird artifact of a service-worker.js
	// being requested. it's fixed now but keep this for
	// good measure
	let isServiceWorker = $.derived(() => page.url.pathname === '/service-worker.js');

	let segment = $.state('');

	$.user_effect(() => {
		if (!$.get(isServiceWorker)) {
			$.set(path, page.url.pathname, true);

			// type = path.split('/')[1];
			$.set(segment, `/${$.get(path).replace('/', '')}`);

			// segment = `/${path.replace('/', '').replace(/\$/, '')}`;
			// slug = path.replace(/\/$/, '').split('/').pop();
		}
	});

	// let basePath = '/';
	let open = $.state(false);

	let nav = $.state(void 0);
	const slimName = /** @param {string} d */ (d) => d.split(' (')[0];

	/** @this {HTMLSelectElement} */
	function loadPage() {
		$.set(open, false);
		goto(this.value || '/');
	}

	function toggleOpen() {
		// if the menu is closing, scroll back to the top *after* it
		// shuts. otherwise, scroll back to the top immediately
		// (just in case the user reopened before it happened).
		// The reason we don't just do it when the menu opens is
		// that the scrollbar visibly flashes
		if ($.get(open)) {
			setTimeout(
				() => {
					if (!$.get(open)) {
						$.get(nav).scrollTop = 0;
					}
				},
				350
			);
		} else {
			$.get(nav).scrollTop = 0;
		}

		$.set(open, !$.get(open));
	}

	var fragment = root_2();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var span = $.child(div_1);
	var text = $.only_child(span, true);

	$.next(2);
	$.reset(div_1);

	var ul = $.sibling(div_1, 2);
	var li = $.child(ul);
	var select = $.child(li);
	var node = $.child(select);

	{
		var consequent = ($$anchor) => {
			var option = root();
			var option_value = {};

			$.template_effect(() => {
				if (option_value !== (option_value = $.get(segment))) {
					option.value = (option.__value = option_value) ?? '';
				}
			});

			$.append($$anchor, option);
		};

		var d_1 = $.derived(() => $.get(segment).startsWith('/components'));

		$.if(node, ($$render) => {
			if ($.get(d_1)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node);

	{
		var consequent_1 = ($$anchor) => {
			var option_1 = root();
			var option_1_value = {};

			$.template_effect(() => {
				if (option_1_value !== (option_1_value = $.get(segment))) {
					option_1.value = (option_1.__value = option_1_value) ?? '';
				}
			});

			$.append($$anchor, option_1);
		};

		var d_2 = $.derived(() => $.get(segment).startsWith('/guide'));

		$.if(node_1, ($$render) => {
			if ($.get(d_2)) $$render(consequent_1);
		});
	}

	var option_2 = $.sibling(node_1);

	option_2.value = option_2.__value = '/';

	var node_2 = $.sibling(option_2, 3);

	$.each(node_2, 17, () => examples.slice().sort((a, b) => a.title < b.title ? -1 : 1), $.index, ($$anchor, example) => {
		var option_3 = root_1();
		var text_1 = $.only_child(option_3, true);
		var option_3_value = {};

		$.template_effect(
			($0) => {
				$.set_text(text_1, $0);

				if (option_3_value !== (option_3_value = `/example/${$.get(example).slug ?? ''}`)) {
					option_3.value = option_3.__value = option_3_value;
				}
			},
			[() => slimName($.get(example).title)]
		);

		$.append($$anchor, option_3);
	});

	var node_3 = $.sibling(node_2, 3);

	$.each(node_3, 17, () => examplesSsr.slice().sort((a, b) => a.title < b.title ? -1 : 1), $.index, ($$anchor, example) => {
		var option_4 = root_1();
		var text_2 = $.only_child(option_4, true);
		var option_4_value = {};

		$.template_effect(
			($0) => {
				$.set_text(text_2, $0);

				if (option_4_value !== (option_4_value = `/example-ssr/${$.get(example).slug ?? ''}`)) {
					option_4.value = option_4.__value = option_4_value;
				}
			},
			[() => slimName($.get(example).title)]
		);

		$.append($$anchor, option_4);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(li);
	$.reset(ul);

	var nav_1 = $.sibling(ul, 2);
	var ul_1 = $.child(nav_1);
	var li_1 = $.child(ul_1);
	var a_1 = $.only_child(li_1);
	var li_2 = $.sibling(li_1, 2);
	var a_2 = $.only_child(li_2);

	$.next(2);
	$.reset(ul_1);

	var div_2 = $.sibling(ul_1, 2);
	var node_4 = $.child(div_2);

	GuideContents(node_4, {
		get sections() {
			return $$props.sections;
		},

		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		}
	});

	$.reset(div_2);
	$.reset(nav_1);
	$.bind_this(nav_1, ($$value) => $.set(nav, $$value), () => $.get(nav));

	$.template_effect(() => {
		$.set_class(div, 1, `${$.get(open) ? 'open' : 'closed'} mousecatcher`, 'svelte-dx5cpj');
		$.set_class(span, 1, `menu-link ${$.get(open) ? 'menu-open' : 'menu-closed'}`, 'svelte-dx5cpj');
		$.set_text(text, $.get(open) ? 'Close' : 'Menu');
		$.set_class(nav_1, 1, $.clsx($.get(open) ? 'open' : 'closed'), 'svelte-dx5cpj');
		$.set_class(a_1, 1, $.clsx($.get(segment) === '/components' ? 'active' : ''), 'svelte-dx5cpj');
		$.set_class(a_2, 1, $.clsx($.get(segment) === '/guide' ? 'active' : ''), 'svelte-dx5cpj');
	});

	$.delegated('click', div, () => $.set(open, false));
	$.event('keypress', div, () => $.set(open, false));
	$.delegated('click', span, toggleOpen);
	$.event('keypress', span, toggleOpen);
	$.delegated('change', select, loadPage);
	$.bind_select_value(select, () => $.get(segment), ($$value) => $.set(segment, $$value));
	$.delegated('click', a_1, () => $.set(open, false));
	$.delegated('click', a_2, () => $.set(open, false));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'change']);