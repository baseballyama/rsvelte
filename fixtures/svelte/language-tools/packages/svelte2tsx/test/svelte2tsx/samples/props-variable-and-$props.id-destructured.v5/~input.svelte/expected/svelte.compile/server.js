import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const id = $.props_id($$renderer);
	let { props } = $$props;

	$$renderer.push(`<!---->${$.escape(id)} ${$.escape(props)}`);
}