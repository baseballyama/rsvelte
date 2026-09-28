import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let visibleExternal = false;
	let external = [];

	const throws = $.derived(() => {
		external.push(1);

		return external;
	});

	let visibleInternal = false;

	const works = $.derived(() => {
		let internal = [];

		internal.push(1);

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