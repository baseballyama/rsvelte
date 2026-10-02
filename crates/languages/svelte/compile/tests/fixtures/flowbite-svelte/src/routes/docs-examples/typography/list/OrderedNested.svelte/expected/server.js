import * as $ from 'svelte/internal/server';
import { List, Li } from "flowbite-svelte";

export default function OrderedNested($$renderer) {
	List($$renderer, {
		tag: 'ol',
		class: 'list-decimal text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->List item one `);

					List($$renderer, {
						tag: 'ul',
						class: 'mt-2 space-y-1 ps-5',
						children: ($$renderer) => {
							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->You might feel like you are being really "organized" o`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Nested navigation in UIs is a bad idea too, keep things as flat as possible.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Nesting tons of folders in your source code is also not helpful.`);
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

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->List item two `);

					List($$renderer, {
						tag: 'ul',
						class: 'mt-2 space-y-1 ps-5',
						children: ($$renderer) => {
							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->I'm not sure if we'll bother styling more than two levels deep.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Two is already too much, three is guaranteed to be a bad idea.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->If you nest four levels deep you belong in prison.`);
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

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->List item three `);

					List($$renderer, {
						tag: 'ul',
						class: 'mt-2 space-y-1 ps-5 text-gray-500 dark:text-gray-400',
						children: ($$renderer) => {
							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Again please don't nest lists if you want`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Nobody wants to look at this.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->I'm upset that we even have to bother styling this.`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}