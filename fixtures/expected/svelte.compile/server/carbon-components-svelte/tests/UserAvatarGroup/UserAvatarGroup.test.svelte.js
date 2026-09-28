import * as $ from 'svelte/internal/server';
import UserAvatar from "carbon-components-svelte/UserAvatar/UserAvatar.svelte";
import UserAvatarGroup from "carbon-components-svelte/UserAvatarGroup/UserAvatarGroup.svelte";

export default function UserAvatarGroup_test($$renderer) {
	// Toggles a leading avatar to exercise DOM-order resync: the avatar mounts
	// last but renders first.
	let showLead = false;

	$$renderer.push(`<div data-testid="under-max">`);

	UserAvatarGroup($$renderer, {
		max: 5,
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Dinesh Chugtai' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="overflow">`);

	UserAvatarGroup($$renderer, {
		max: 2,
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Dinesh Chugtai' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Bertram Gilfoyle' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="no-limit">`);

	UserAvatarGroup($$renderer, {
		max: 0,
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Dinesh Chugtai' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="spaced">`);

	UserAvatarGroup($$renderer, {
		gap: 3,
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="tighter">`);

	UserAvatarGroup($$renderer, {
		gap: '-1rem',
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="total">`);

	UserAvatarGroup($$renderer, {
		max: 3,
		total: 250,
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Dinesh Chugtai' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="overflow-tooltip">`);

	UserAvatarGroup($$renderer, {
		max: 1,
		total: 10,
		overflowTooltipText: 'Gilfoyle, Jared, and 8 others',
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="cascade">`);

	UserAvatarGroup($$renderer, {
		size: 'lg',
		max: 1,
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks', size: 'sm' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="stack-first">`);

	UserAvatarGroup($$renderer, {
		stackOrder: 'first',
		max: 2,
		children: ($$renderer) => {
			UserAvatar($$renderer, { name: 'Monica', tooltipText: 'Monica' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Richard Hendricks', tooltipText: 'Richard Hendricks' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Dinesh Chugtai', tooltipText: 'Dinesh Chugtai' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <button type="button" data-testid="toggle-lead">toggle</button> <div data-testid="resync">`);

	UserAvatarGroup($$renderer, {
		max: 1,
		children: ($$renderer) => {
			if (showLead) {
				$$renderer.push('<!--[0-->');
				UserAvatar($$renderer, { name: 'Alice', initials: 'A1' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			UserAvatar($$renderer, { name: 'Bob', initials: 'B2' });
			$$renderer.push(`<!----> `);
			UserAvatar($$renderer, { name: 'Cara', initials: 'C3' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}