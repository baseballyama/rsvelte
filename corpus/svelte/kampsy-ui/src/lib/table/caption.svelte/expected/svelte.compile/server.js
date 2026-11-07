import * as $ from 'svelte/internal/server';

export default function Caption($$renderer, $$props) {
	let { class: klass = "", children = undefined } = $$props;

	$$renderer.push(`<caption${$.attr_class($.clsx(klass))}>`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></caption>`);
}