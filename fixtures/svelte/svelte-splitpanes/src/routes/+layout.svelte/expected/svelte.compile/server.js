import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import theme from 'svelte-highlight/styles/night-owl';
import Contents from '$comp/Contents.svelte';
import RTLToggle from '$comp/RTLToggle.svelte';
import { pathIsCurrent } from './pathUtils';
import { asset } from '$app/paths';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let isRTL = false;

		const sections = [
			{
				title: 'Getting started',
				pages: [{ title: 'Introduction', path: '' }]
			},

			{
				title: 'General Examples',
				pages: [
					{ title: 'Min-Max', path: 'examples/min-max' },
					{ title: 'Default Size', path: 'examples/default-size' },
					{
						title: 'Disable Double Click',
						path: 'examples/disable-dbl-click'
					},
					{ title: 'Lock Layout', path: 'examples/lock-layout' },
					{ title: 'Push Other Panes', path: 'examples/push-other-panes' },
					{ title: 'Add Remove Panes', path: 'examples/add-remove-panes' },
					{ title: 'Reordering Panes', path: 'examples/reordering-panes' },
					{
						title: 'ChangeOrientation',
						path: 'examples/change-orientation'
					},
					{ title: 'Prog Resize', path: 'examples/prog-resize' },
					{ title: 'Toggle Panes', path: 'examples/toggle-panes' },
					{ title: 'Listen To Events', path: 'examples/listen-to-events' }
				]
			},

			{
				title: 'Snap',
				pages: [
					{ title: 'Simple Snap', path: 'examples/snap/simple' },
					{ title: 'Middle Snap', path: 'examples/snap/middle' },
					{ title: 'Min-Max Snap', path: 'examples/snap/min-max' }
				]
			},

			{
				title: 'Styling',
				pages: [
					{ title: 'Style Splitters', path: 'examples/styling/splitters' },
					{ title: 'App Layout', path: 'examples/styling/app-layout' }
				]
			}
		];

		const pages = sections.map((section) => section.pages).flat();
		const pageIdx = pages.findIndex(({ path }) => pathIsCurrent(path, page));
		const curPage = pageIdx >= 0 ? pages[pageIdx] : undefined;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('12qhfyh', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Svelte-Splitpanes${$.escape(curPage ? ` - ${curPage.title}` : '')}</title>`);
				});

				$$renderer.push(`<meta name="description" content="A Fantastic pane splitter for Svelte"/> ${$.html(theme)}`);
			});

			$$renderer.push(`<div class="page-container svelte-12qhfyh"><div role="presentation" class="toc-container-space svelte-12qhfyh"></div> <main${$.attr_class('svelte-12qhfyh', void 0, { 'rtl-containers': isRTL })}><!--[-->`);
			$.slot($$renderer, $$props, 'default', {}, null);
			$$renderer.push(`<!--]--></main> <div class="toc-container svelte-12qhfyh"><div role="presentation" class="toc-contents-wrap svelte-12qhfyh"><h1 class="toc-head svelte-12qhfyh"><img${$.attr('src', asset('/favicon.svg'))} alt="Icon" width="30" height="30"/> Svelte-Splitpane</h1> `);
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
	});
}