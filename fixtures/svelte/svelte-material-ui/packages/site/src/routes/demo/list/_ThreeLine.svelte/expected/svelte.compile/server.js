import * as $ from 'svelte/internal/server';
import List, { Item, Text, PrimaryText, SecondaryText } from '@smui/list';

export default function _ThreeLine($$renderer) {
	$$renderer.push(`<div>`);

	List($$renderer, {
		threeLine: true,
		nonInteractive: true,
		children: ($$renderer) => {
			Item($$renderer, {
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							PrimaryText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->FruitPhone Pro`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SecondaryText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$1,000`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SecondaryText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->A beautiful phone with good specs.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							PrimaryText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Robot Phone Max`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SecondaryText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$700`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SecondaryText($$renderer, {
								title: 'Pretty much the same phone, but a different brand name and OS. It spies on you more, too.',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Pretty much the same phone, but a different brand name and OS. It
          spies on you more, too.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							PrimaryText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Penguin Phone`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SecondaryText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->$220`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SecondaryText($$renderer, {
								title: 'A very weak phone that you can install literally anything on. Compile your own kernel, you nerd. :D',
								children: ($$renderer) => {
									$$renderer.push(`<!---->A very weak phone that you can install literally anything on. Compile
          your own kernel, you nerd. :D`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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

	$$renderer.push(`<!----></div>`);
}