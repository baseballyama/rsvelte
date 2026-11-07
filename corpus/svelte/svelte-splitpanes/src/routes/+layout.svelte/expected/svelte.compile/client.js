import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import theme from 'svelte-highlight/styles/night-owl';
import Contents from '$comp/Contents.svelte';
import RTLToggle from '$comp/RTLToggle.svelte';
import { pathIsCurrent } from './pathUtils';
import { asset } from '$app/paths';

var root = $.from_html(`<meta name="description" content="A Fantastic pane splitter for Svelte"/> <!>`, 1);
var root_1 = $.from_html(`<div class="page-container svelte-12qhfyh"><div role="presentation" class="toc-container-space svelte-12qhfyh"></div> <main><!></main> <div class="toc-container svelte-12qhfyh"><div role="presentation" class="toc-contents-wrap svelte-12qhfyh"><h1 class="toc-head svelte-12qhfyh"><img alt="Icon" width="30" height="30"/> Svelte-Splitpane</h1> <!></div> <!></div></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

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

	var // const prevPage = pageIdx >= 1 ? pages[pageIdx - 1] : undefined;
	// const nextPage = pageIdx >= 0 && pageIdx < pages.length - 1 ? pages[pageIdx + 1] : undefined;
	div = root_1();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();
		var node = $.sibling($.first_child(fragment), 2);

		$.html(node, () => theme);

		$.deferred_template_effect(() => {
			$.document.title = `Svelte-Splitpanes${curPage ? ` - ${curPage.title}` : ''}`;
		});

		$.append($$anchor, fragment);
	});

	var main = $.sibling($.child(div), 2);
	let classes;
	var node_1 = $.child(main);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(main);

	var div_1 = $.sibling(main, 2);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var img = $.child(h1);

	$.next();
	$.reset(h1);

	var node_2 = $.sibling(h1, 2);

	Contents(node_2, {
		get contents() {
			return sections;
		}
	});

	$.reset(div_2);

	var node_3 = $.sibling(div_2, 2);

	RTLToggle(node_3, {
		get isRTL() {
			return isRTL;
		},

		set isRTL($$value) {
			isRTL = $$value;
		}
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			classes = $.set_class(main, 1, 'svelte-12qhfyh', null, classes, { 'rtl-containers': isRTL });
			$.set_attribute(img, 'src', $0);
		},
		[() => asset('/favicon.svg')]
	);

	$.append($$anchor, div);
	$.pop();
}