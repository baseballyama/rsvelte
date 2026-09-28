import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let { class: klass = '' } = $$props;

	$$renderer.push(`<!---->${$.escape(klass)}`);
}