import * as $ from 'svelte/internal/server';
import { groupBy, sortBy } from 'underscore';
import svelteComponents from '../_components.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let activeSection = 'axis';

		/** @type {HTMLElement[]} */
		let anchors = [];

		/** @type {HTMLElement[]} */
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
						activeSection = id;

						// this.fire('scroll', id);
						lastId = id;
					}

					return;
				}
			}
		}

		$.head('136c6pl', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>LayerCake - Component gallery</title>`);
			});

			$$renderer.push(`<meta name="og:title" content="Layer Cake — Component gallery"/> <meta name="twitter:title" content="Layer Cake — Component gallery"/>`);
		});

		$$renderer.push(`<sidebar class="svelte-136c6pl"><ul class="svelte-136c6pl"><!--[-->`);

		const each_array = $.ensure_array_like(componentGroups);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let componentGroup = each_array[$$index];

			$$renderer.push(`<li><a${$.attr_class(`section ${activeSection === slugify(componentGroup.name) ? 'active' : ''}`, 'svelte-136c6pl')}${$.attr('href', `/components#${$.stringify(slugify(componentGroup.name))}`)}>${$.escape(componentGroup.name)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></sidebar> <div id="container" class="svelte-136c6pl"><h2 class="svelte-136c6pl">Components</h2> <div id="dek" class="svelte-136c6pl"><p>Because Layer Cake doesn't come with any pre-built components, here are a few options to get
			you started. These are meant to serve as starting points for many common chart types. They
			have a few built-in options to be flexible for handling different scenarios so they can be
			reused as much as possible. For example, the <a href="/components/Scatter.svg.svelte" target="_blank" class="svelte-136c6pl">Scatter</a> components support both linear and ordinal scales so you can use them in configurations like a regular <a href="/example/Scatter" target="_blank" class="svelte-136c6pl">Scatter plot</a> but also charts like the <a href="/example/Timeplot" target="_blank" class="svelte-136c6pl">Time of Day</a> plot where the y-scale is made up of
			groups.</p> <p>Some components have HTML, SVG and Canvas versions and those marked as <span class="label percent-range svelte-136c6pl">%-range</span> are optimized to be used server-side with the <a href="/guide#percentrange" class="svelte-136c6pl"><code class="svelte-136c6pl">percentRange=true</code></a> prop.</p> <p>The components here use <a href="https://svelte.dev/docs/svelte/what-are-runes" target="_blank" rel="noreferrer" class="svelte-136c6pl">Svelte 5's Rune</a> syntax. The Svelte 3/4 versions are still available at the <a href="https://mhkeller.github.io/layercake-prerunes/components" target="_blank" rel="noreferrer" class="svelte-136c6pl">documentation archive</a>.</p></div> <!--[-->`);

		const each_array_1 = $.ensure_array_like(componentGroups);

		for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
			let componentGroup = each_array_1[$$index_3];

			$$renderer.push(`<h3${$.attr('id', slugify(componentGroup.name))} class="svelte-136c6pl">${$.escape(componentGroup.name)}</h3> <div class="component-blocks svelte-136c6pl"><!--[-->`);

			const each_array_2 = $.ensure_array_like(Object.entries(groupBy(componentGroup.components, (d) => d.group)));

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let [subgroup, items] = each_array_2[$$index_2];

				$$renderer.push(`<h4 class="svelte-136c6pl">${$.escape(formatSubgroup(subgroup))}</h4> <div class="subgroup-blocks svelte-136c6pl"><!--[-->`);

				const each_array_3 = $.ensure_array_like(items);

				for (let $$index_1 = 0, $$length = each_array_3.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_3[$$index_1];

					$$renderer.push(`<div class="component-block svelte-136c6pl"><div class="component-name svelte-136c6pl"><span><a${$.attr('href', `/components/${$.stringify(item.slug)}`)} class="svelte-136c6pl">${$.escape(item.name || formatName(item.slug))}</a></span> ${$.html(item.classes.map((d) => `<span class="label ${d}">${d.replace('percent-', '%-')}</span>`).join(''))}</div> <div class="block-container svelte-136c6pl">`);

					if (item.component) {
						$$renderer.push('<!--[0-->');

						const Component = item.component;

						if (Component) {
							$$renderer.push('<!--[-->');
							Component($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(item.slug)}`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}