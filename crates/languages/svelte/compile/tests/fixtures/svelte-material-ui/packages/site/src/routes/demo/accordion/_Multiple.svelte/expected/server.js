import * as $ from 'svelte/internal/server';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

export default function _Multiple($$renderer) {
	$$renderer.push(`<div class="accordion-container">`);

	Accordion($$renderer, {
		multiple: true,
		children: ($$renderer) => {
			Panel($$renderer, {
				children: ($$renderer) => {
					Header($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Panel 1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->The content for panel 1. <ul><li>Some</li> <li>List</li> <li>Items</li></ul>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Panel($$renderer, {
				children: ($$renderer) => {
					Header($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Panel 2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->The content for panel 2.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Panel($$renderer, {
				children: ($$renderer) => {
					Header($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Panel 3`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->The content for panel 3. <ul><li>Some</li> <li>More</li> <li>List</li> <li>Items</li> <li>To</li> <li>Show</li> <li>Big</li> <li>Height</li></ul>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Panel($$renderer, {
				children: ($$renderer) => {
					Header($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Panel 4`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->The content for panel 4.`);
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

	$$renderer.push(`<!----></div>`);
}