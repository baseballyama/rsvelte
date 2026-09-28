import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';
import { onMount, tick } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Backdrop from './Backdrop.svelte';
import { tocCollapsed } from './layout';

export const DEFAULT_ON_THIS_PAGE = 'On this page';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<div><div class="title svelte-9b42ia"> </div> <div class="anchors svelte-9b42ia"><!> <div class="active-bar svelte-9b42ia"></div></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Toc($$anchor, $$props) {
	$.push($$props, true);

	const $tocCollapsed = () => $.store_get(tocCollapsed, '$tocCollapsed', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * @typedef {object} Props
	 * @property {Array<import('../markdown/anchors').Anchor>} [anchors] - The anchors to display in the TOC.
	 */
	/** @type {Props} */
	const anchors = $.prop($$props, 'anchors', 19, () => []);

	let scrollY = $.state(void 0);

	// All sections intersecting the viewport are active, Nuxt-style:
	// [firstActiveIdx, lastActiveIdx]
	let activeRange = $.state($.proxy([0, 0]));

	afterNavigate(() => {
		$.set(activeRange, [0, 0], true);
	});

	let mounted = false;

	function computeActiveRange() {
		if (!mounted || !anchors().length) return;

		const positions = anchors().map(({ slugId }) => document.getElementById(slugId)?.offsetTop ?? 0);
		const viewportTop = $.get(scrollY) ?? 0;
		const viewportBottom = viewportTop + window.innerHeight;
		const docBottom = document.documentElement.scrollHeight;
		let first = -1;
		let last = 0;

		for (let i = 0; i < positions.length; i++) {
			// a section spans from its own anchor to the next one (or page end)
			const start = positions[i];

			const end = i + 1 < positions.length ? positions[i + 1] : docBottom;

			if (start < viewportBottom && end > viewportTop) {
				if (first === -1) first = i;

				last = i;
			}
		}

		if (first === -1) first = last = 0;

		$.set(activeRange, [first, last], true);
	}

	$.user_effect(() => {
		computeActiveRange($.get(scrollY));
	});

	onMount(() => {
		mounted = true;

		const anchorTarget = decodeURI(page.url.hash);

		if (!anchorTarget) {
			computeActiveRange();

			return;
		}

		try {
			const ele = document.querySelector(anchorTarget);

			if (ele) $.set(scrollY, ele.offsetTop, true);
		} catch {
			// Invalid query selector, ignore
		}

		tick().then(computeActiveRange);
	});

	function handleTocToggleClick() {
		$.store_set(tocCollapsed, !$tocCollapsed());
	}

	var fragment = root_2();

	$.event('resize', $.window, computeActiveRange);

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			let classes;
			var div_1 = $.child(div);
			var text = $.only_child(div_1, true);
			var div_2 = $.sibling(div_1, 2);
			var node_1 = $.child(div_2);

			$.each(node_1, 17, anchors, $.index, ($$anchor, an, i) => {
				const active = $.derived(() => i >= $.get(activeRange)[0] && i <= $.get(activeRange)[1]);
				var a = root();
				let classes_1;
				var text_1 = $.only_child(a, true);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `#${$.get(an).slugId ?? ''}`);
					classes_1 = $.set_class(a, 1, 'item svelte-9b42ia', null, classes_1, { active: $.get(active) });
					$.set_style(a, `--heading-depth: ${($.get(an).depth < 2 ? 2 : $.get(an).depth) ?? ''};`);
					$.set_text(text_1, $.get(an).title);
				});

				$.append($$anchor, a);
			});

			$.next(2);
			$.reset(div_2);
			$.reset(div);

			$.template_effect(() => {
				classes = $.set_class(div, 1, 'toc svelte-9b42ia', null, classes, { collapsed: $tocCollapsed() });
				$.set_text(text, themeOptions?.i18n?.onThisPage || DEFAULT_ON_THIS_PAGE);
				$.set_style(div_2, `--bar-top: ${$.get(activeRange)[0] * 2}em; --bar-height: ${($.get(activeRange)[1] - $.get(activeRange)[0] + 1) * 2}em;`);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (anchors().length) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => !$tocCollapsed());

		Backdrop(node_2, {
			get show() {
				return $.get($0);
			},
			$$events: { close: handleTocToggleClick }
		});
	}

	$.bind_window_scroll('y', () => $.get(scrollY), ($$value) => $.set(scrollY, $$value, true));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}