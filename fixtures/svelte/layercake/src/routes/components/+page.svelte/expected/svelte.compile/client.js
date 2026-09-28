import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { groupBy, sortBy } from 'underscore';
import svelteComponents from '../_components.js';

var root = $.from_html(`<meta name="og:title" content="Layer Cake — Component gallery"/> <meta name="twitter:title" content="Layer Cake — Component gallery"/>`, 1);
var root_1 = $.from_html(`<li><a> </a></li>`);
var root_2 = $.from_html(`<div class="component-block svelte-136c6pl"><div class="component-name svelte-136c6pl"><span><a class="svelte-136c6pl"> </a></span> <!></div> <div class="block-container svelte-136c6pl"><!></div></div>`);
var root_3 = $.from_html(`<h4 class="svelte-136c6pl"> </h4> <div class="subgroup-blocks svelte-136c6pl"></div>`, 1);
var root_4 = $.from_html(`<h3 class="svelte-136c6pl"> </h3> <div class="component-blocks svelte-136c6pl"></div>`, 1);

var root_5 = $.from_html(
	`<sidebar class="svelte-136c6pl"><ul class="svelte-136c6pl"></ul></sidebar> <div id="container" class="svelte-136c6pl"><h2 class="svelte-136c6pl">Components</h2> <div id="dek" class="svelte-136c6pl"><p>Because Layer Cake doesn't come with any pre-built components, here are a few options to get
			you started. These are meant to serve as starting points for many common chart types. They
			have a few built-in options to be flexible for handling different scenarios so they can be
			reused as much as possible. For example, the <a href="/components/Scatter.svg.svelte" target="_blank" class="svelte-136c6pl">Scatter</a> components support both linear and ordinal scales so you can use them in configurations like a regular <a href="/example/Scatter" target="_blank" class="svelte-136c6pl">Scatter plot</a> but also charts like the <a href="/example/Timeplot" target="_blank" class="svelte-136c6pl">Time of Day</a> plot where the y-scale is made up of
			groups.</p> <p>Some components have HTML, SVG and Canvas versions and those marked as <span class="label percent-range svelte-136c6pl">%-range</span> are optimized to be used server-side with the <a href="/guide#percentrange" class="svelte-136c6pl"><code class="svelte-136c6pl"></code></a> prop.</p> <p>The components here use <a href="https://svelte.dev/docs/svelte/what-are-runes" target="_blank" rel="noreferrer" class="svelte-136c6pl">Svelte 5's Rune</a> syntax. The Svelte 3/4 versions are still available at the <a href="https://mhkeller.github.io/layercake-prerunes/components" target="_blank" rel="noreferrer" class="svelte-136c6pl">documentation archive</a>.</p></div> <!></div>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {{
	 *   slug: string,
	 *   name?: string,
	 *   component: import('svelte').Component
	 * }} ComponentEntry
	 *
	 * @typedef {{
	 *   name: string,
	 *   components: ComponentEntry[]
	 * }} ComponentGroup
	 *
	 * @typedef {ComponentEntry & {
	 *   classes: string[],
	 *   group: string | undefined
	 * }} GalleryEntry
	 */
	/**
	 * @param {string} name
	 * @returns {string[]}
	 */
	function getClasses(name) {
		const parts = name.split('.').filter(/** @param {string} d */ (d) => d !== 'svelte');

		parts.shift();

		if (parts.length === 0) return ['svg'];

		return parts;
	}

	const componentGroups = svelteComponents.map(/** @param {ComponentGroup} d */ (d) => {
		return {
			name: `${d.name.replace(/^\w/, /** @param {string} w */ (w) => w.toUpperCase())} components`,
			components: sortBy(d.components, 'slug').map(
				/** @param {ComponentEntry} args */
				({ name, slug, component }) => {
					const classes = getClasses(slug);

					return {
						name,
						slug,
						component,
						classes,
						group: classes.filter(/** @param {string} d */ (d) => d !== 'percent-range')[0]
					};
				}
			)
		};
	});

	/** @param {string} name */
	function formatName(name) {
		return name.split('.')[0];
	}

	/** @param {string} subgroup */
	function formatSubgroup(subgroup) {
		if (subgroup == 'webgl') return 'WebGL';
		if (subgroup == 'canvas') return 'Canvas';

		return subgroup.toUpperCase();
	}

	/** @param {string} name */
	function slugify(name) {
		return name.toLowerCase().split(' ')[0];
	}

	/** @type {HTMLElement | undefined} */
	let container;

	/** @type {number[]} */
	let positions = [];

	let lastId = 'axis';
	let activeSection = $.state('axis');

	/** @type {HTMLElement[]} */
	let anchors = [];

	$.user_effect(() => {
		if (typeof window !== 'undefined' && container) {
			anchors = /** @type {HTMLElement[]} */ ([...container.querySelectorAll('[id]')]);
			lastId = window.location.hash.slice(1);
			$.set(activeSection, lastId || 'axis', true);
			onresize();
			onscroll();
		}
	});

	function onresize() {
		if (container) {
			const { top } = container.getBoundingClientRect();

			positions = anchors.map((anchor) => {
				return anchor.getBoundingClientRect().top - top;
			});
		}
	}

	function onscroll() {
		const top = -window.scrollY;
		let i = anchors.length;

		while (i--) {
			if (positions[i] + top < 100) {
				const anchor = anchors[i];
				const { id } = anchor;

				if (id !== lastId) {
					$.set(activeSection, id, true);

					// this.fire('scroll', id);
					lastId = id;
				}

				return;
			}
		}
	}

	var fragment_1 = root_5();

	$.event('scroll', $.window, onscroll);
	$.event('resize', $.window, onresize);

	$.head('136c6pl', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'LayerCake - Component gallery';
		});

		$.append($$anchor, fragment);
	});

	var sidebar = $.first_child(fragment_1);
	var ul = $.child(sidebar);

	$.each(ul, 21, () => componentGroups, $.index, ($$anchor, componentGroup) => {
		var li = root_1();
		var a = $.child(li);
		var text = $.only_child(a, true);

		$.reset(li);

		$.template_effect(
			($0, $1) => {
				$.set_class(a, 1, `section ${$0 ?? ''}`, 'svelte-136c6pl');
				$.set_attribute(a, 'href', `/components#${$1 ?? ''}`);
				$.set_text(text, $.get(componentGroup).name);
			},
			[
				() => $.get(activeSection) === slugify($.get(componentGroup).name) ? 'active' : '',
				() => slugify($.get(componentGroup).name)
			]
		);

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(sidebar);

	var div = $.sibling(sidebar, 2);
	var div_1 = $.sibling($.child(div), 2);
	var p = $.sibling($.child(div_1), 2);
	var a_1 = $.sibling($.child(p), 3);
	var code = $.child(a_1);

	code.textContent = 'percentRange=true';
	$.reset(a_1);
	$.next();
	$.reset(p);
	$.next(2);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	$.each(node, 17, () => componentGroups, $.index, ($$anchor, componentGroup) => {
		var fragment_2 = root_4();
		var h3 = $.first_child(fragment_2);
		var text_1 = $.only_child(h3, true);
		var div_2 = $.sibling(h3, 2);

		$.each(div_2, 21, () => Object.entries(groupBy($.get(componentGroup).components, (d) => d.group)), $.index, ($$anchor, $$item) => {
			var $$array = $.derived(() => $.to_array($.get($$item), 2));
			let subgroup = () => $.get($$array)[0];
			let items = () => $.get($$array)[1];
			var fragment_3 = root_3();
			var h4 = $.first_child(fragment_3);
			var text_2 = $.only_child(h4, true);
			var div_3 = $.sibling(h4, 2);

			$.each(div_3, 21, items, $.index, ($$anchor, item) => {
				var div_4 = root_2();
				var div_5 = $.child(div_4);
				var span = $.child(div_5);
				var a_2 = $.child(span);
				var text_3 = $.only_child(a_2, true);

				$.reset(span);

				var node_1 = $.sibling(span, 2);

				$.html(node_1, () => $.get(item).classes.map((d) => `<span class="label ${d}">${d.replace('percent-', '%-')}</span>`).join(''));
				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var node_2 = $.child(div_6);

				{
					var consequent = ($$anchor) => {
						const Component = $.derived(() => $.get(item).component);
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => $.get(Component), ($$anchor, Component_1) => {
							Component_1($$anchor, {});
						});

						$.append($$anchor, fragment_4);
					};

					var alternate = ($$anchor) => {
						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(item).slug));
						$.append($$anchor, text_4);
					};

					$.if(node_2, ($$render) => {
						if ($.get(item).component) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div_6);
				$.reset(div_4);

				$.template_effect(
					($0) => {
						$.set_attribute(a_2, 'href', `/components/${$.get(item).slug ?? ''}`);
						$.set_text(text_3, $0);
					},
					[() => $.get(item).name || formatName($.get(item).slug)]
				);

				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.template_effect(($0) => $.set_text(text_2, $0), [() => formatSubgroup(subgroup())]);
			$.append($$anchor, fragment_3);
		});

		$.reset(div_2);

		$.template_effect(
			($0) => {
				$.set_attribute(h3, 'id', $0);
				$.set_text(text_1, $.get(componentGroup).name);
			},
			[() => slugify($.get(componentGroup).name)]
		);

		$.append($$anchor, fragment_2);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);
	$.append($$anchor, fragment_1);
	$.pop();
}