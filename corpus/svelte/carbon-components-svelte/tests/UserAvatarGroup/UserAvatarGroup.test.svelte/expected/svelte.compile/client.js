import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UserAvatar from "carbon-components-svelte/UserAvatar/UserAvatar.svelte";
import UserAvatarGroup from "carbon-components-svelte/UserAvatarGroup/UserAvatarGroup.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div data-testid="under-max"><!></div> <div data-testid="overflow"><!></div> <div data-testid="no-limit"><!></div> <div data-testid="spaced"><!></div> <div data-testid="tighter"><!></div> <div data-testid="total"><!></div> <div data-testid="overflow-tooltip"><!></div> <div data-testid="cascade"><!></div> <div data-testid="stack-first"><!></div> <button type="button" data-testid="toggle-lead">toggle</button> <div data-testid="resync"><!></div>`, 1);

export default function UserAvatarGroup_test($$anchor) {
	// Toggles a leading avatar to exercise DOM-order resync: the avatar mounts
	// last but renders first.
	let showLead = false;

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	UserAvatarGroup(node, {
		max: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			UserAvatar(node_1, { name: 'Monica' });

			var node_2 = $.sibling(node_1, 2);

			UserAvatar(node_2, { name: 'Richard Hendricks' });

			var node_3 = $.sibling(node_2, 2);

			UserAvatar(node_3, { name: 'Dinesh Chugtai' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	UserAvatarGroup(node_4, {
		max: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_5 = $.first_child(fragment_2);

			UserAvatar(node_5, { name: 'Monica' });

			var node_6 = $.sibling(node_5, 2);

			UserAvatar(node_6, { name: 'Richard Hendricks' });

			var node_7 = $.sibling(node_6, 2);

			UserAvatar(node_7, { name: 'Dinesh Chugtai' });

			var node_8 = $.sibling(node_7, 2);

			UserAvatar(node_8, { name: 'Bertram Gilfoyle' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_9 = $.child(div_2);

	UserAvatarGroup(node_9, {
		max: 0,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_10 = $.first_child(fragment_3);

			UserAvatar(node_10, { name: 'Monica' });

			var node_11 = $.sibling(node_10, 2);

			UserAvatar(node_11, { name: 'Richard Hendricks' });

			var node_12 = $.sibling(node_11, 2);

			UserAvatar(node_12, { name: 'Dinesh Chugtai' });
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_13 = $.child(div_3);

	UserAvatarGroup(node_13, {
		gap: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_14 = $.first_child(fragment_4);

			UserAvatar(node_14, { name: 'Monica' });

			var node_15 = $.sibling(node_14, 2);

			UserAvatar(node_15, { name: 'Richard Hendricks' });
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_16 = $.child(div_4);

	UserAvatarGroup(node_16, {
		gap: '-1rem',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_17 = $.first_child(fragment_5);

			UserAvatar(node_17, { name: 'Monica' });

			var node_18 = $.sibling(node_17, 2);

			UserAvatar(node_18, { name: 'Richard Hendricks' });
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_19 = $.child(div_5);

	UserAvatarGroup(node_19, {
		max: 3,
		total: 250,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_20 = $.first_child(fragment_6);

			UserAvatar(node_20, { name: 'Monica' });

			var node_21 = $.sibling(node_20, 2);

			UserAvatar(node_21, { name: 'Richard Hendricks' });

			var node_22 = $.sibling(node_21, 2);

			UserAvatar(node_22, { name: 'Dinesh Chugtai' });
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_23 = $.child(div_6);

	UserAvatarGroup(node_23, {
		max: 1,
		total: 10,
		overflowTooltipText: 'Gilfoyle, Jared, and 8 others',
		children: ($$anchor, $$slotProps) => {
			UserAvatar($$anchor, { name: 'Monica' });
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_24 = $.child(div_7);

	UserAvatarGroup(node_24, {
		size: 'lg',
		max: 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_2();
			var node_25 = $.first_child(fragment_8);

			UserAvatar(node_25, { name: 'Monica' });

			var node_26 = $.sibling(node_25, 2);

			UserAvatar(node_26, { name: 'Richard Hendricks', size: 'sm' });
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_27 = $.child(div_8);

	UserAvatarGroup(node_27, {
		stackOrder: 'first',
		max: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_28 = $.first_child(fragment_9);

			UserAvatar(node_28, { name: 'Monica', tooltipText: 'Monica' });

			var node_29 = $.sibling(node_28, 2);

			UserAvatar(node_29, { name: 'Richard Hendricks', tooltipText: 'Richard Hendricks' });

			var node_30 = $.sibling(node_29, 2);

			UserAvatar(node_30, { name: 'Dinesh Chugtai', tooltipText: 'Dinesh Chugtai' });
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var button = $.sibling(div_8, 2);
	var div_9 = $.sibling(button, 2);
	var node_31 = $.child(div_9);

	UserAvatarGroup(node_31, {
		max: 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root();
			var node_32 = $.first_child(fragment_10);

			{
				var consequent = ($$anchor) => {
					UserAvatar($$anchor, { name: 'Alice', initials: 'A1' });
				};

				$.if(node_32, ($$render) => {
					if (showLead) $$render(consequent);
				});
			}

			var node_33 = $.sibling(node_32, 2);

			UserAvatar(node_33, { name: 'Bob', initials: 'B2' });

			var node_34 = $.sibling(node_33, 2);

			UserAvatar(node_34, { name: 'Cara', initials: 'C3' });
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);
	$.event('click', button, () => showLead = !showLead);
	$.append($$anchor, fragment);
}