import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let { message, showMessage = message, title, extra } = $$props;
	let showTitle = title;
	let extraTitle = $.derived(() => extra);

	if (showMessage) {
		$$renderer.push('<!--[0-->');
		message?.($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}