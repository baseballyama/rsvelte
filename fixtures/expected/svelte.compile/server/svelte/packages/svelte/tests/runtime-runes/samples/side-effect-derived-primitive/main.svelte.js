import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let visibleExternal = false;
	let external = 1;

	const throws = $.derived(() => {
		external = 2;

		return external;
	});

	let visibleInternal = false;

	const works = $.derived(() => {
		let internal = 1;

		internal = 2;

		return internal;
	});

	$$renderer.push(`<button>external</button> `);

	if (visibleExternal) {
		$$renderer.push(`<!--[0-->${$.escape(throws())}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>internal</button> `);

	if (visibleInternal) {
		$$renderer.push(`<!--[0-->${$.escape(works())}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}