import * as $ from 'svelte/internal/server';

export default function If_blocks_input($$renderer) {
	let user = { loggedIn: false };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}

	if (user.loggedIn) {
		$$renderer.push(`<!--[0--><button>Log out</button>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (!user.loggedIn) {
		$$renderer.push(`<!--[0--><button>Log in</button>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}