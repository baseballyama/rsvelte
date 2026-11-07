import * as $ from 'svelte/internal/server';
import Tooltip, { Wrapper, Title, Content, Link, RichActions } from '@smui/tooltip';
import Button, { Label } from '@smui/button';

export default function _Rich($$renderer) {
	let clicked = 0;

	$$renderer.push(`<div style="display: flex; flex-wrap: wrap; align-items: center;">`);

	Wrapper($$renderer, {
		rich: true,
		children: ($$renderer) => {
			Button($$renderer, {
				onclick: () => clicked++,
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Rich Tooltip`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				children: ($$renderer) => {
					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->A rich tooltip can provide a lot more information than a regular toolip.
        It is sized appropriately for a large amount of content.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Wrapper($$renderer, {
		rich: true,
		children: ($$renderer) => {
			Button($$renderer, {
				onclick: () => clicked++,
				touch: true,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Interactive Rich Tooltip`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				interactive: true,
				children: ($$renderer) => {
					Title($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->With a Title!`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->An interactive rich tooltip can have `);

							Link($$renderer, {
								href: 'http://example.com',
								target: '_blank',
								children: ($$renderer) => {
									$$renderer.push(`<!---->links`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> and actions.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					RichActions($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								onclick: () => clicked++,
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Action`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Wrapper($$renderer, {
		rich: true,
		children: ($$renderer) => {
			$$renderer.push(`<span role="button" tabindex="0">Persistent Rich Tooltip (Click Me)</span> `);

			Tooltip($$renderer, {
				persistent: true,
				children: ($$renderer) => {
					Title($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->With a Title!`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->A persistent rich tooltip shows up when you click or press enter/space
        bar on an element and goes away when you activate it again or it loses
        focus. Great for informational popups on those little "i" icons.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}