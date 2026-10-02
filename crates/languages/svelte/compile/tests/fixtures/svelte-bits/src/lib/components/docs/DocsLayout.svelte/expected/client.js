import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
import Footer from '$lib/components/landing/Footer/Footer.svelte';
import Sidebar from './Sidebar.svelte';
import '$lib/css/docs.css';
import '$lib/css/preview.css';

var root = $.from_html(`<div class="docs-app"><!> <div class="docs-drawer-backdrop" role="presentation"></div> <div class="docs-drawer svelte-fxrvrl" tabindex="-1" role="dialog" aria-modal="true" aria-label="Docs navigation"><!></div> <div class="docs-wrapper"><!> <!></div> <!></div>`);

export default function DocsLayout($$anchor, $$props) {
	$.push($$props, true);

	let drawerOpen = $.state(false);
	let drawerEl = $.state(null);

	function toggle() {
		$.set(drawerOpen, !$.get(drawerOpen));
	}

	function close() {
		$.set(drawerOpen, false);
	}

	function getFocusable(container) {
		return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
	}

	$.user_effect(() => {
		if (!$.get(drawerOpen) || !$.get(drawerEl)) return;

		const onKey = (event) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();

				return;
			}

			if (event.key !== 'Tab') return;

			const focusable = getFocusable($.get(drawerEl));

			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onKey);

		return () => document.removeEventListener('keydown', onKey);
	});

	var div = root();
	var node = $.child(div);

	Navbar(node, { showDocs: true, onhamburger: toggle });

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Sidebar(node_1, { onnavigate: close });
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => $.set(drawerEl, $$value), () => $.get(drawerEl));

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Sidebar(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	$.snippet(node_3, () => $$props.children);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	Footer(node_4, {});
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div_1, 'data-open', $.get(drawerOpen));
		$.set_attribute(div_2, 'data-open', $.get(drawerOpen));
		$.set_attribute(div_2, 'aria-hidden', !$.get(drawerOpen));
		div_2.inert = !$.get(drawerOpen);
	});

	$.delegated('click', div_1, close);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);