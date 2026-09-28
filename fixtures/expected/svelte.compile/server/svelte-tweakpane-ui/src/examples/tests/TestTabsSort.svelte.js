import * as $ from 'svelte/internal/server';
import { Button, Pane, TabGroup, TabPage } from '$lib';

export default function TestTabsSort($$renderer) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let tabIndex = 0;

	let tabPages = ['A', 'B', 'C', 'D'];

	function sortTabs() {
		tabPages = tabPages.toReversed();
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p>TabIndex: ${$.escape(tabIndex)}</p> `);

		Pane($$renderer, {
			position: 'inline',
			children: ($$renderer) => {
				TabGroup($$renderer, {
					get selectedIndex() {
						return tabIndex;
					},

					set selectedIndex($$value) {
						tabIndex = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(tabPages);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let pageTitle = each_array[$$index];

							TabPage($$renderer, {
								title: pageTitle,
								children: ($$renderer) => {
									Button($$renderer, { title: 'Sort Tabs' });
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}