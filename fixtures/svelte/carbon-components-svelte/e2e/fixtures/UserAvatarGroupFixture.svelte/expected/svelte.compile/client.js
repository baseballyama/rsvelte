import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UserAvatar, UserAvatarGroup } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div data-testid="overlap"><!></div> <div data-testid="spaced"><!></div> <div data-testid="cascade"><!></div> <div data-testid="coord"><!></div> <div data-testid="tighter"><!></div> <div data-testid="big"><!></div> <div data-testid="stack-first"><!></div>`, 1);

export default function UserAvatarGroupFixture($$anchor) {
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	UserAvatarGroup(node, {
		max: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			UserAvatar(node_1, {
				backgroundColor: 'auto',
				name: 'Monica',
				tooltipText: 'Monica'
			});

			var node_2 = $.sibling(node_1, 2);

			UserAvatar(node_2, {
				backgroundColor: 'auto',
				name: 'Richard Hendricks',
				tooltipText: 'Richard Hendricks'
			});

			var node_3 = $.sibling(node_2, 2);

			UserAvatar(node_3, {
				backgroundColor: 'auto',
				name: 'Dinesh Chugtai',
				tooltipText: 'Dinesh Chugtai'
			});

			var node_4 = $.sibling(node_3, 2);

			UserAvatar(node_4, {
				backgroundColor: 'auto',
				name: 'Bertram Gilfoyle',
				tooltipText: 'Bertram Gilfoyle'
			});

			var node_5 = $.sibling(node_4, 2);

			UserAvatar(node_5, {
				backgroundColor: 'auto',
				name: 'Jared Dunn',
				tooltipText: 'Jared Dunn'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_6 = $.child(div_1);

	UserAvatarGroup(node_6, {
		gap: 3,
		max: 0,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_7 = $.first_child(fragment_2);

			UserAvatar(node_7, { backgroundColor: 'auto', name: 'Monica' });

			var node_8 = $.sibling(node_7, 2);

			UserAvatar(node_8, { backgroundColor: 'auto', name: 'Richard Hendricks' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_9 = $.child(div_2);

	UserAvatarGroup(node_9, {
		size: 'lg',
		max: 0,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_10 = $.first_child(fragment_3);

			UserAvatar(node_10, {
				backgroundColor: 'auto',
				name: 'Monica',
				tooltipText: 'Monica'
			});

			var node_11 = $.sibling(node_10, 2);

			UserAvatar(node_11, {
				backgroundColor: 'auto',
				name: 'Richard Hendricks',
				size: 'sm',
				tooltipText: 'Richard Hendricks'
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_12 = $.child(div_3);

	UserAvatarGroup(node_12, {
		gap: 5,
		max: 0,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_13 = $.first_child(fragment_4);

			UserAvatar(node_13, { backgroundColor: 'auto', name: 'Alpha', tooltipText: 'Alpha' });

			var node_14 = $.sibling(node_13, 2);

			UserAvatar(node_14, { backgroundColor: 'auto', name: 'Beta', tooltipText: 'Beta' });
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_15 = $.child(div_4);

	UserAvatarGroup(node_15, {
		gap: '-1rem',
		max: 0,
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_1();
			var node_16 = $.first_child(fragment_5);

			UserAvatar(node_16, { backgroundColor: 'auto', name: 'Monica' });

			var node_17 = $.sibling(node_16, 2);

			UserAvatar(node_17, { backgroundColor: 'auto', name: 'Richard Hendricks' });
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_18 = $.child(div_5);

	UserAvatarGroup(node_18, {
		max: 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_19 = $.first_child(fragment_6);

			$.each(node_19, 16, () => Array.from({ length: 101 }), $.index, ($$anchor, _, index) => {
				UserAvatar($$anchor, { backgroundColor: 'auto', name: `User ${index}` });
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_20 = $.child(div_6);

	UserAvatarGroup(node_20, {
		stackOrder: 'first',
		max: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_2();
			var node_21 = $.first_child(fragment_8);

			UserAvatar(node_21, {
				backgroundColor: 'auto',
				name: 'Monica',
				tooltipText: 'Monica'
			});

			var node_22 = $.sibling(node_21, 2);

			UserAvatar(node_22, {
				backgroundColor: 'auto',
				name: 'Richard Hendricks',
				tooltipText: 'Richard Hendricks'
			});

			var node_23 = $.sibling(node_22, 2);

			UserAvatar(node_23, {
				backgroundColor: 'auto',
				name: 'Dinesh Chugtai',
				tooltipText: 'Dinesh Chugtai'
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.append($$anchor, fragment);
}