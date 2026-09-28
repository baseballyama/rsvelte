import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavItem } from 'svelte-ux';
import { flatGroup } from 'd3-array';
import { allComponents, allUtils, allGuides } from 'content-collections';
import { sortCollection } from '@layerstack/docs/collections';
import { page } from '$app/state';
import { sortFunc } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import LucideBot from '~icons/lucide/bot';
import LucideCompass from '~icons/lucide/compass';
import LucideGalleryVertical from '~icons/lucide/gallery-vertical';
import LucideGalleryHorizontalEnd from '~icons/lucide/gallery-horizontal-end';
import LucideGalleryVerticalEnd from '~icons/lucide/gallery-vertical-end';
import LucideGlobe from '~icons/lucide/globe';
import LucideNotebookPen from '~icons/lucide/notebook-pen';
import LucideBlocks from '~icons/lucide/blocks';
import LucideFileCode2 from '~icons/lucide/file-code-2';
import LucideCirclePlay from '~icons/lucide/circle-play';
import LucideParentheses from '~icons/lucide/parentheses';
import SimpleIconsStackblitz from '~icons/simple-icons/stackblitz';

var root = $.from_html(`<details class="ml-2 mb-6 last:mb-0 group"><summary class="text-surface-content/80 mb-3 text-sm font-medium capitalize cursor-pointer list-none flex items-center gap-1 select-none [&amp;::-webkit-details-marker]:hidden"><span class="transition-transform duration-200 group-open:rotate-90 text-surface-content/40">&#9656;</span> </summary> <div class="border-l border-surface-content/10"></div></details>`);
var root_1 = $.from_html(`<div class="ml-2 mb-6 last:mb-0"><h3 class="text-surface-content/80 mb-3 text-sm font-medium capitalize"> </h3> <div class="border-l border-surface-content/10"></div></div>`);
var root_2 = $.from_html(`<div class="ml-2 border-l border-surface-content/10 mb-6 last:mb-0"></div>`);
var root_3 = $.from_html(`<nav><section class="border-l border-surface-content/10"><!> <!> <!> <!></section> <section><h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize"><!> Guides</h2> <!></section> <section><h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize"><!> Components</h2> <!></section> <section><h2 class="flex gap-2 items-center mb-3 text-base font-semibold capitalize"><!> Utils</h2> <div class="ml-2 border-l border-surface-content/10"></div></section></nav>`);

export default function DocsMenu($$anchor, $$props) {
	$.push($$props, true);

	const navItem = ($$anchor, $$arg0) => {
		let label = () => ($$arg0?.()).label;
		let path = () => ($$arg0?.()).path;
		let icon = () => ($$arg0?.()).icon;

		{
			let $0 = $.derived(() => path().startsWith('http') ? '_blank' : undefined);

			let $1 = $.derived(() => ({
				root: cls('relative text-sm text-surface-content/50 py-1 my-px rounded-r border-l border-transparent border-surface-content/5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary-600 -ml-px', icon() ? 'pl-3' : 'pl-6'),
				active: cls('text-primary-400! border-primary! hover:bg-primary/10! font-medium bg-primary/10 border-l')
			}));

			NavItem($$anchor, {
				get text() {
					return label();
				},

				get currentUrl() {
					return page.url;
				},

				get target() {
					return $.get($0);
				},

				get path() {
					return path();
				},

				get icon() {
					return icon();
				},

				get classes() {
					return $.get($1);
				},
				$$events: { click: () => $$props.onItemClick?.() }
			});
		}
	};

	const filteredGuides = allGuides.filter((g) => !g.draft);
	const guidesByCategory = flatGroup(filteredGuides, (d) => d.category?.toLowerCase()).sort(sortFunc(([category]) => category ? 1 : 0));
	const collapsibleCategories = ['migrations'];

	const componentsByCategory = flatGroup(allComponents, (d) => d.category?.toLowerCase()).filter(([category]) => category !== 'examples').sort(sortFunc(([category]) => [
		'charts',
		'common',
		'primitives',
		'marks',
		'geo',
		'layout',
		'interactions',
		'annotations',
		'fill',
		'clipping',
		'layers',
		'other'
	].indexOf(category)));

	var nav = root_3();
	var section = $.child(nav);
	var node = $.child(section);

	navItem(node, () => ({
		label: 'Getting Started',
		path: '/docs/getting-started',
		icon: LucideCirclePlay
	}));

	var node_1 = $.sibling(node, 2);

	navItem(node_1, () => ({
		label: 'Examples',
		path: '/docs/examples',
		icon: LucideFileCode2
	}));

	var node_2 = $.sibling(node_1, 2);

	navItem(node_2, () => ({
		label: 'Showcase',
		path: '/docs/showcase',
		icon: LucideGalleryVertical
	}));

	var node_3 = $.sibling(node_2, 2);

	navItem(node_3, () => ({
		label: 'Releases',
		path: '/docs/releases',
		icon: LucideNotebookPen
	}));

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var h2 = $.child(section_1);
	var node_4 = $.child(h2);

	LucideGlobe(node_4, { class: 'size-4 text-surface-content/70' });
	$.next();
	$.reset(h2);

	var node_5 = $.sibling(h2, 2);

	$.each(node_5, 17, () => guidesByCategory, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let category = () => $.get($$array)[0];
		let guides = () => $.get($$array)[1];
		var fragment_1 = $.comment();
		var node_6 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var details = root();
				var summary = $.child(details);
				var text = $.sibling($.child(summary));

				$.reset(summary);

				var div = $.sibling(summary, 2);

				$.each(div, 21, () => sortCollection(guides()), $.index, ($$anchor, guide) => {
					navItem($$anchor, () => ({
						label: $.get(guide).name,
						path: `/docs/guides/${$.get(guide).slug}`
					}));
				});

				$.reset(div);
				$.reset(details);

				$.template_effect(
					($0) => {
						details.open = $0;
						$.set_text(text, ` ${category() ?? ''}`);
					},
					[
						() => guides().some((g) => page.url.pathname.includes(`/docs/guides/${g.slug}`))
					]
				);

				$.append($$anchor, details);
			};

			var d_1 = $.derived(() => category() && collapsibleCategories.includes(category()));

			var consequent_1 = ($$anchor) => {
				var div_1 = root_1();
				var h3 = $.child(div_1);
				var text_1 = $.only_child(h3, true);
				var div_2 = $.sibling(h3, 2);

				$.each(div_2, 21, () => sortCollection(guides()), $.index, ($$anchor, guide) => {
					navItem($$anchor, () => ({
						label: $.get(guide).name,
						path: `/docs/guides/${$.get(guide).slug}`
					}));
				});

				$.reset(div_2);
				$.reset(div_1);
				$.template_effect(() => $.set_text(text_1, category()));
				$.append($$anchor, div_1);
			};

			var alternate = ($$anchor) => {
				var div_3 = root_2();

				$.each(div_3, 21, () => sortCollection(guides()), $.index, ($$anchor, guide) => {
					navItem($$anchor, () => ({
						label: $.get(guide).name,
						path: `/docs/guides/${$.get(guide).slug}`
					}));
				});

				$.reset(div_3);
				$.append($$anchor, div_3);
			};

			$.if(node_6, ($$render) => {
				if ($.get(d_1)) $$render(consequent); else if (category()) $$render(consequent_1, 1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var h2_1 = $.child(section_2);
	var node_7 = $.child(h2_1);

	LucideBlocks(node_7, { class: 'size-4 text-surface-content/70' });
	$.next();
	$.reset(h2_1);

	var node_8 = $.sibling(h2_1, 2);

	$.each(node_8, 17, () => componentsByCategory, $.index, ($$anchor, $$item) => {
		var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
		let category = () => $.get($$array_1)[0];
		let components = () => $.get($$array_1)[1];
		var div_4 = root_1();
		var h3_1 = $.child(div_4);
		var text_2 = $.only_child(h3_1, true);
		var div_5 = $.sibling(h3_1, 2);

		$.each(div_5, 21, () => sortCollection(components()), $.index, ($$anchor, component) => {
			navItem($$anchor, () => ({
				label: $.get(component).name,
				path: `/docs/components/${$.get(component).slug}`
			}));
		});

		$.reset(div_5);
		$.reset(div_4);
		$.template_effect(() => $.set_text(text_2, category()));
		$.append($$anchor, div_4);
	});

	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var h2_2 = $.child(section_3);
	var node_9 = $.child(h2_2);

	LucideParentheses(node_9, { class: 'size-4 text-surface-content/70' });
	$.next();
	$.reset(h2_2);

	var div_6 = $.sibling(h2_2, 2);

	$.each(div_6, 21, () => allUtils, $.index, ($$anchor, util) => {
		navItem($$anchor, () => ({
			label: $.get(util).name,
			path: `/docs/utils/${$.get(util).slug}`
		}));
	});

	$.reset(div_6);
	$.reset(section_3);
	$.reset(nav);
	$.template_effect(($0) => $.set_class(nav, 1, $0), [() => $.clsx(cls('grid gap-6', $$props.class))]);
	$.append($$anchor, nav);
	$.pop();
}