import * as $ from 'svelte/internal/server';
import { Notification } from 'svelte-ux';
import { colors } from '@layerstack/tailwind';
import { toTitleCase } from '@layerstack/utils';

import {
	mdiInbox,
	mdiCheckCircleOutline,
	mdiInformationOutline,
	mdiAlertOutline,
	mdiAlertOctagonOutline
} from '@mdi/js';

import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function themeColorIcon(color) {
			switch (color) {
				case 'accent':
					return mdiInformationOutline;

				case 'success':
					return mdiCheckCircleOutline;

				case 'neutral':
					return mdiInformationOutline;

				case 'danger':
					return mdiAlertOctagonOutline;

				case 'primary':
					return mdiInformationOutline;

				case 'secondary':
					return mdiInformationOutline;

				case 'info':
					return mdiInformationOutline;

				case 'warning':
					return mdiAlertOutline;
			}
		}

		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[400px]">`);
				Notification($$renderer, { title: 'New software update available.', closeIcon: true });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Description</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[400px]">`);

				Notification($$renderer, {
					title: 'Successfully Saved!',
					description: 'Anyone with a link can now view this file.',
					closeIcon: true
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[400px]">`);

				Notification($$renderer, {
					title: 'Successfully Saved!',
					icon: mdiCheckCircleOutline,
					color: 'success',
					closeIcon: true
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon with description</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[400px]">`);

				Notification($$renderer, {
					title: 'Successfully Saved!',
					description: 'Anyone with a link can now view this file.',
					icon: mdiCheckCircleOutline,
					color: 'success',
					closeIcon: true
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Actions (inline / default)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[400px]">`);

				Notification($$renderer, {
					title: 'Discussion archived',
					actions: { Undo: () => alert('Undo') },
					closeIcon: true
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Actions (below)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[400px]">`);

				Notification($$renderer, {
					title: 'Discussion moved',
					description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit oluptatum tenetur.',
					icon: mdiInbox,
					actions: { Undo: () => alert('Undo'), Dismiss: () => {} },
					actionsPlacement: 'below',
					closeIcon: true
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Actions (split)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[600px]">`);

				Notification($$renderer, {
					title: 'Receive notifications',
					description: 'Notifications may include alerts, sounds, and badges',
					actions: {
						Allow: () => alert('Allow'),
						"Don't Allow": () => alert("Don't Allow")
					},
					actionsPlacement: 'split',
					classes: { actions: 'w-40' }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Color</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2 w-[400px]"><!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let color = each_array[$$index];

					Notification($$renderer, {
						title: toTitleCase(color),
						description: `An example using ${$.stringify(color)} color`,
						icon: themeColorIcon(color),
						color,
						closeIcon: true
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Variant (fill)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2 w-[400px]"><!--[-->`);

				const each_array_1 = $.ensure_array_like(colors);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let color = each_array_1[$$index_1];

					Notification($$renderer, {
						title: toTitleCase(color),
						description: `An example using ${$.stringify(color)} color`,
						icon: themeColorIcon(color),
						color,
						variant: 'fill',
						closeIcon: true
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Variant (fill) with inline actions</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2 w-[400px]"><!--[-->`);

				const each_array_2 = $.ensure_array_like(colors);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let color = each_array_2[$$index_2];

					Notification($$renderer, {
						title: `Example using ${$.stringify(color)} color`,
						color,
						variant: 'fill',
						actions: { Undo: () => alert('Undo') },
						closeIcon: true
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Variant (fill) with actions below</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2 w-[400px]"><!--[-->`);

				const each_array_3 = $.ensure_array_like(colors);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let color = each_array_3[$$index_3];

					Notification($$renderer, {
						title: toTitleCase(color),
						description: `An example using ${$.stringify(color)} color`,
						icon: themeColorIcon(color),
						color,
						variant: 'fill',
						actions: {
							Allow: () => alert('Allow'),
							"Don't Allow": () => alert("Don't Allow")
						},
						actionsPlacement: 'below'
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Variant (fill) with split actions</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2 w-[600px]"><!--[-->`);

				const each_array_4 = $.ensure_array_like(colors);

				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let color = each_array_4[$$index_4];

					Notification($$renderer, {
						title: toTitleCase(color),
						description: `An example using ${$.stringify(color)} color`,
						icon: themeColorIcon(color),
						color,
						variant: 'fill',
						actions: {
							Allow: () => alert('Allow'),
							"Don't Allow": () => alert("Don't Allow")
						},
						actionsPlacement: 'split',
						classes: { actions: 'w-40' }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}