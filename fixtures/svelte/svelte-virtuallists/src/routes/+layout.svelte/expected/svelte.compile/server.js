import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/stores';
import '../app.css';
import theme from 'svelte-highlight/styles/night-owl';
import Contents from '../comp/Contents.svelte';
import RTLToggle from '../comp/RTLToggle.svelte';
import { pathIsCurrent } from '../comp/pathUtils';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { children } = $$props;
		let isRTL = false;

		const sections = [
			{
				title: 'Getting started',
				pages: [{ title: 'Introduction', path: '/' }]
			},

			{
				title: 'General Examples',
				pages: [
					{ title: 'Vertical', path: '/examples/vertical' },
					{ title: 'Horizontal', path: '/examples/horizontal' },
					{ title: 'Table/Grid', path: '/examples/table' },
					{ title: 'Variable Sizing', path: '/examples/variablesizing' },
					{ title: 'Positioning', path: '/examples/positioning' },
					{ title: 'Events', path: '/examples/events' }
				]
			}
		];

		const pages = sections.map((section) => section.pages).flat();
		const pageIdx = $.derived(() => pages.findIndex(({ path }) => pathIsCurrent(path, $.store_get($$store_subs ??= {}, '$page', page))));
		const curPage = $.derived(() => pageIdx() >= 0 ? pages[pageIdx()] : undefined);
		const prevPage = $.derived(() => pageIdx() >= 1 ? pages[pageIdx() - 1] : undefined);
		const nextPage = $.derived(() => pageIdx() >= 0 && pageIdx() < pages.length - 1 ? pages[pageIdx() + 1] : undefined);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('12qhfyh', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Svelte-Virtuallists${$.escape(curPage() ? ` - ${curPage().title}` : '')}</title>`);
				});

				$$renderer.push(`<meta name="description" content="A Fantastic virtual list for Svelte 5 and above"/> ${$.html(theme)}`);
			});

			$$renderer.push(`<div class="page-container svelte-12qhfyh"><div role="presentation" class="toc-container-space svelte-12qhfyh"></div> <main${$.attr_class('svelte-12qhfyh', void 0, { 'rtl-containers': isRTL })}>`);
			children($$renderer);
			$$renderer.push(`<!----> <div class="controls svelte-12qhfyh"><div class="svelte-12qhfyh"><span${$.attr_class('svelte-12qhfyh', void 0, { 'faded': !prevPage() })}>previous</span> `);

			if (prevPage()) {
				$$renderer.push(`<!--[0--><a data-sveltekit-preload-data=""${$.attr('href', base + prevPage().path)} class="svelte-12qhfyh">${$.escape(prevPage().title)}</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="svelte-12qhfyh"><span${$.attr_class('svelte-12qhfyh', void 0, { 'faded': !nextPage() })}>next</span> `);

			if (nextPage()) {
				$$renderer.push(`<!--[0--><a data-sveltekit-preload-data=""${$.attr('href', base + nextPage().path)} class="svelte-12qhfyh">${$.escape(nextPage().title)}</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></main> <div class="toc-container svelte-12qhfyh"><div role="presentation" class="toc-contents-wrap svelte-12qhfyh"><h1 class="toc-head svelte-12qhfyh"><img${$.attr('src', `${$.stringify(base)}/favicon.svg`)} alt="Icon" width="30" height="30"/> Svelte-Virtuallists</h1> `);
			Contents($$renderer, { contents: sections });
			$$renderer.push(`<!----></div> `);

			RTLToggle($$renderer, {
				get isRTL() {
					return isRTL;
				},

				set isRTL($$value) {
					isRTL = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}