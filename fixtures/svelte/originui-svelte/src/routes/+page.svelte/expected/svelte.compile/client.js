import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CategoryCard from '$lib/demo/category-card.svelte';
import Illustration from '$lib/demo/illustration.svelte';
import { mode } from 'mode-watcher';

var root = $.from_html(`<meta name="theme-color"/> <meta name="Description" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta name="keywords" content="svelte, component, origin ui, tailwindcss, ui, library"/> <meta property="og:title" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta property="og:description" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta property="og:image:type" content="image/jpeg"/><meta property="og:image:width" content="2400"/> <meta property="og:image:height" content="1260"/> <meta property="og:image" content="/og-image.jpg"/> <meta name="twitter:title" content="Origin UI - Svelte"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:description" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta name="twitter:image:type" content="image/jpeg"/> <meta name="twitter:image:width" content="2400"/> <meta name="twitter:image:height" content="1260"/> <meta name="twitter:image" content="/twitter-image.jpg"/>`, 1);
var root_1 = $.from_html(`<h2 class="_component-directory"><a class="text-sm font-medium hover:underline"> </a></h2> <p class="text-muted-foreground text-[13px]"><!></p>`, 1);
var root_2 = $.from_html(`<!> <main data-home=""><div class="max-w-3xl max-sm:text-center"><h1 class="font-heading text-foreground mb-4 font-serif text-4xl/[1.1] tracking-tight text-balance md:text-5xl/[1.1]">Beautiful UI components built with Tailwind CSS and <span class="text-svelte">Svelte</span></h1> <p class="text-md text-muted-foreground mb-4">A collection of copy-and-paste components for quickly build application UIs.</p> <p class="border-border text-accent-foreground w-fit max-w-prose border-t pt-4 text-left text-sm text-balance">This project is not affiliated with the original <a class="underline" href="https://originui.com/" rel="noreferrer">Origin UI</a>. <br/> <span class="text-muted-foreground text-xs">I appreciate their work and have developed these Svelte 5 components based on their design.</span></p></div> <div class="relative my-16"><div class="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"></div></div></main>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $mode = () => $.store_get(mode, '$mode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment_1 = root_2();

	$.head('1uha8ag', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);

		$.next(29);
		$.template_effect(() => $.set_attribute(meta, 'content', $mode() === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)'));

		$.effect(() => {
			$.document.title = 'Origin UI - Svelte | Beautiful UI components built with Tailwind CSS and Svelte';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	Illustration(node, {});

	var main = $.sibling(node, 2);
	var div = $.sibling($.child(main), 2);
	var div_1 = $.child(div);

	$.each(div_1, 21, () => Object.entries($$props.data.componentsMeta.directoriesBreakdown), ([directory, { componentCount, stateBreakdown }]) => directory, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let directory = () => $.get($$array)[0];
		let componentCount = () => $.get($$array)[1].componentCount;
		let stateBreakdown = () => $.get($$array)[1].stateBreakdown;
		const readableName = $.derived(() => directory().charAt(0).toUpperCase() + directory().slice(1));
		const isReady = $.derived(() => stateBreakdown().ready === componentCount());

		{
			const details = ($$anchor) => {
				var fragment_3 = root_1();
				var h2 = $.first_child(fragment_3);
				var a = $.child(h2);
				var text = $.only_child(a, true);

				$.reset(h2);

				var p = $.sibling(h2, 2);
				var node_1 = $.child(p);

				{
					var consequent = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, `${stateBreakdown().ready ?? ''} Components`));
						$.append($$anchor, text_1);
					};

					var alternate = ($$anchor) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, `${stateBreakdown().ready ?? ''}/${componentCount() ?? ''} Components`));
						$.append($$anchor, text_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(isReady)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(p);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `/${directory() ?? ''}`);
					$.set_text(text, $.get(readableName));
				});

				$.append($$anchor, fragment_3);
			};

			CategoryCard($$anchor, {
				get slug() {
					return directory();
				},

				get alt() {
					return `${$.get(readableName) ?? ''} demo`;
				},
				details,
				$$slots: { details: true }
			});
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(main);
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}