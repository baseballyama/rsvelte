import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { numbers } = $$props;

		$$renderer.push(`<!---->${$.escape(numbers.join(', '))}`);
	});
}