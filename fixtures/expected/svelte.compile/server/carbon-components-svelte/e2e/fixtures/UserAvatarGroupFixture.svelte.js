import * as $ from 'svelte/internal/server';
import { UserAvatar, UserAvatarGroup } from "carbon-components-svelte";

export default function UserAvatarGroupFixture($$renderer) {
	$$renderer.push(`<div data-testid="overlap">`);

	UserAvatarGroup($$renderer, {
		max: 3,
		children: ($$renderer) => {
			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Monica',
				tooltipText: 'Monica'
			});

			$$renderer.push(`<!----> `);

			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Richard Hendricks',
				tooltipText: 'Richard Hendricks'
			});

			$$renderer.push(`<!----> `);

			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Dinesh Chugtai',
				tooltipText: 'Dinesh Chugtai'
			});

			$$renderer.push(`<!----> `);

			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Bertram Gilfoyle',
				tooltipText: 'Bertram Gilfoyle'
			});

			$$renderer.push(`<!----> `);

			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Jared Dunn',
				tooltipText: 'Jared Dunn'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="spaced">`);

	UserAvatarGroup($$renderer, {
		gap: 3,
		max: 0,
		children: ($$renderer) => {
			UserAvatar($$renderer, { backgroundColor: 'auto', name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { backgroundColor: 'auto', name: 'Richard Hendricks' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="cascade">`);

	UserAvatarGroup($$renderer, {
		size: 'lg',
		max: 0,
		children: ($$renderer) => {
			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Monica',
				tooltipText: 'Monica'
			});

			$$renderer.push(`<!----> `);

			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Richard Hendricks',
				size: 'sm',
				tooltipText: 'Richard Hendricks'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="coord">`);

	UserAvatarGroup($$renderer, {
		gap: 5,
		max: 0,
		children: ($$renderer) => {
			UserAvatar($$renderer, { backgroundColor: 'auto', name: 'Alpha', tooltipText: 'Alpha' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { backgroundColor: 'auto', name: 'Beta', tooltipText: 'Beta' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="tighter">`);

	UserAvatarGroup($$renderer, {
		gap: '-1rem',
		max: 0,
		children: ($$renderer) => {
			UserAvatar($$renderer, { backgroundColor: 'auto', name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { backgroundColor: 'auto', name: 'Richard Hendricks' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="big">`);

	UserAvatarGroup($$renderer, {
		max: 1,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(Array.from({ length: 101 }));

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let _ = each_array[index];

				UserAvatar($$renderer, { backgroundColor: 'auto', name: `User ${index}` });
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="stack-first">`);

	UserAvatarGroup($$renderer, {
		stackOrder: 'first',
		max: 2,
		children: ($$renderer) => {
			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Monica',
				tooltipText: 'Monica'
			});

			$$renderer.push(`<!----> `);

			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Richard Hendricks',
				tooltipText: 'Richard Hendricks'
			});

			$$renderer.push(`<!----> `);

			UserAvatar($$renderer, {
				backgroundColor: 'auto',
				name: 'Dinesh Chugtai',
				tooltipText: 'Dinesh Chugtai'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}