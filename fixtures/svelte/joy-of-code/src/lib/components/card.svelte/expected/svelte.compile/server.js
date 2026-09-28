import * as $ from 'svelte/internal/server';

export default function Card($$renderer, $$props) {
	let { children, type } = $$props;

	if (type === 'danger') {
		$$renderer.push(`<!--[0--><div class="card danger svelte-1u0xoi6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon svelte-1u0xoi6"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (type === 'info') {
		$$renderer.push(`<!--[0--><div class="card info svelte-1u0xoi6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon svelte-1u0xoi6"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (type === 'warning') {
		$$renderer.push(`<!--[0--><div class="card warning svelte-1u0xoi6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon svelte-1u0xoi6"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}