import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const document = 'I hereby declare Svelte the bestest framework.';
	const console = 'nintendo sixty four';
	const Error = 'Woops.';
	const Object = 42;
	const Map = false;
	const everyone = [document, console, Error, Object, Map];

	$.head('11qeu67', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Cute test</title>`);
		});
	});

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(everyone);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let someone = each_array[$$index];

		$$renderer.push(`<p>${$.escape(someone)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}