import * as $ from 'svelte/internal/server';

export default function Plugin_issue254_input($$renderer) {
	let isOpen = false;
	let id = undefined;

	$$renderer.push(`<h1>Welcome to SvelteKit</h1> <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p> <button></button> `);

	if (!isOpen) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (!isOpen && id) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (!isOpen && !!id) {
		$$renderer.push(`<!--[0--><div>only visible when isOpen and id</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (!isOpen && id !== undefined) {
		$$renderer.push(`<!--[0--><div>only visible when isopen and id</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}