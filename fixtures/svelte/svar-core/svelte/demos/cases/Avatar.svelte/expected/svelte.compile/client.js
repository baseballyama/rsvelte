import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "../../src/index";
import { users } from "../data/userlist";

var root = $.from_html(`<div class="demo-box"><h3>Single avatars</h3> <div class="single-avatars-row svelte-15yo1bu"><div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu"><!></div> <span class="svelte-15yo1bu">Image</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu"><!></div> <span class="svelte-15yo1bu">Initials (default)</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu"><!></div> <span class="svelte-15yo1bu">Initials + color</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu"><!></div> <span class="svelte-15yo1bu">2 letters</span></div> <div class="single-avatar-item svelte-15yo1bu"><div class="single-avatar-slot svelte-15yo1bu"><!></div> <span class="svelte-15yo1bu">Color, no name</span></div></div></div> <div class="demo-box"><h3>Avatar sizes</h3> <div class="sizes svelte-15yo1bu"><!> <!> <!> <!> <!> <!> <!></div></div> <div class="demo-box"><h3>Avatar stack (multiple users)</h3> <!></div> <div class="demo-box"><h3>Avatar stack (mixed image and initials)</h3> <!></div> <div class="demo-box"><h3>Dynamic: +N when stack doesn't fit (resize to see)</h3> <p>Resize the container — +N appears when avatars overflow.</p> <div class="avatar-resizable svelte-15yo1bu"><!></div></div> <div class="demo-box"><h3>With limit (optional cap)</h3> <p></p> <div class="avatar-resizable svelte-15yo1bu"><!></div></div> <div class="demo-box"><h3>Avatar stack sizes</h3> <div class="sizes svelte-15yo1bu"><!> <!> <!></div></div>`, 1);

export default function Avatar_1($$anchor, $$props) {
	$.push($$props, true);

	const singleUser = {
		id: 103,
		name: "Ned Stark",
		avatar: "https://cdn.svar.dev/demos/assets/avatar/491902305.jpg"
	};

	const singleInitials = { id: 1, name: "John Doe" };
	const singleColor = { id: 2, name: "Jane Smith", color: "#2ecc71" };

	const singleTwoWords = {
		id: 3,
		name: "Daenerys Stormborn Targaryen",
		color: "#e74c3c"
	};

	const singleNoName = { id: 4, color: "#9b59b6" };
	const stackUsers = users.slice(0, 5).map((u) => ({ id: u.id, name: u.label, avatar: u.avatar }));

	const stackMixed = [
		{ id: 1, name: "Alice", color: "#3498db" },
		{
			id: 2,
			name: "Bob",
			avatar: "https://cdn.svar.dev/demos/assets/avatar/503723673.jpg"
		},
		{ id: 3, name: "Charlie", color: "#e74c3c" }
	];

	const stackOverflowMixed = [
		// with pictures
		{
			id: users[0].id,
			name: users[0].label,
			avatar: users[0].avatar
		},

		{
			id: users[1].id,
			name: users[1].label,
			avatar: users[1].avatar
		},

		// without picture, dark background
		{ id: 1001, name: "Dark background", color: "#34495e" },

		// again with pictures
		{
			id: users[2].id,
			name: users[2].label,
			avatar: users[2].avatar
		},

		// without picture, light background
		{ id: 1002, name: "Light background", color: "#ecf4ff" },

		// and more with pictures
		{
			id: users[3].id,
			name: users[3].label,
			avatar: users[3].avatar
		},

		{
			id: users[4].id,
			name: users[4].label,
			avatar: users[4].avatar
		}
	];

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Avatar(node, {
		get value() {
			return singleUser;
		},
		size: 32
	});

	$.reset(div_3);
	$.next(2);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.child(div_4);
	var node_1 = $.child(div_5);

	Avatar(node_1, {
		get value() {
			return singleInitials;
		},
		size: 32
	});

	$.reset(div_5);
	$.next(2);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var div_7 = $.child(div_6);
	var node_2 = $.child(div_7);

	Avatar(node_2, {
		get value() {
			return singleColor;
		},
		size: 32
	});

	$.reset(div_7);
	$.next(2);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var div_9 = $.child(div_8);
	var node_3 = $.child(div_9);

	Avatar(node_3, {
		get value() {
			return singleTwoWords;
		},
		size: 32
	});

	$.reset(div_9);
	$.next(2);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var div_11 = $.child(div_10);
	var node_4 = $.child(div_11);

	Avatar(node_4, {
		get value() {
			return singleNoName;
		},
		size: 32
	});

	$.reset(div_11);
	$.next(2);
	$.reset(div_10);
	$.reset(div_1);
	$.reset(div);

	var div_12 = $.sibling(div, 2);
	var div_13 = $.sibling($.child(div_12), 2);
	var node_5 = $.child(div_13);

	Avatar(node_5, {
		get value() {
			return singleUser;
		},
		size: 16
	});

	var node_6 = $.sibling(node_5, 2);

	Avatar(node_6, {
		get value() {
			return singleUser;
		},
		size: 20
	});

	var node_7 = $.sibling(node_6, 2);

	Avatar(node_7, {
		get value() {
			return singleUser;
		},
		size: 24
	});

	var node_8 = $.sibling(node_7, 2);

	Avatar(node_8, {
		get value() {
			return singleUser;
		},
		size: 28
	});

	var node_9 = $.sibling(node_8, 2);

	Avatar(node_9, {
		get value() {
			return singleUser;
		},
		size: 32
	});

	var node_10 = $.sibling(node_9, 2);

	Avatar(node_10, {
		get value() {
			return singleUser;
		},
		size: 40
	});

	var node_11 = $.sibling(node_10, 2);

	Avatar(node_11, {
		get value() {
			return singleUser;
		},
		size: 48
	});

	$.reset(div_13);
	$.reset(div_12);

	var div_14 = $.sibling(div_12, 2);
	var node_12 = $.sibling($.child(div_14), 2);

	Avatar(node_12, {
		get value() {
			return stackUsers;
		}
	});

	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var node_13 = $.sibling($.child(div_15), 2);

	Avatar(node_13, {
		get value() {
			return stackMixed;
		}
	});

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var div_17 = $.sibling($.child(div_16), 4);
	var node_14 = $.child(div_17);

	Avatar(node_14, {
		get value() {
			return stackOverflowMixed;
		}
	});

	$.reset(div_17);
	$.reset(div_16);

	var div_18 = $.sibling(div_16, 2);
	var p = $.sibling($.child(div_18), 2);

	p.textContent = 'limit=6 caps max visible; container can further reduce.';

	var div_19 = $.sibling(p, 2);
	var node_15 = $.child(div_19);

	Avatar(node_15, {
		get value() {
			return stackOverflowMixed;
		},
		limit: 6
	});

	$.reset(div_19);
	$.reset(div_18);

	var div_20 = $.sibling(div_18, 2);
	var div_21 = $.sibling($.child(div_20), 2);
	var node_16 = $.child(div_21);

	{
		let $0 = $.derived(() => stackUsers.slice(0, 4));

		Avatar(node_16, {
			get value() {
				return $.get($0);
			},
			size: 24
		});
	}

	var node_17 = $.sibling(node_16, 2);

	{
		let $0 = $.derived(() => stackUsers.slice(0, 4));

		Avatar(node_17, {
			get value() {
				return $.get($0);
			},
			size: 32
		});
	}

	var node_18 = $.sibling(node_17, 2);

	{
		let $0 = $.derived(() => stackUsers.slice(0, 4));

		Avatar(node_18, {
			get value() {
				return $.get($0);
			},
			size: 40
		});
	}

	$.reset(div_21);
	$.reset(div_20);
	$.append($$anchor, fragment);
	$.pop();
}