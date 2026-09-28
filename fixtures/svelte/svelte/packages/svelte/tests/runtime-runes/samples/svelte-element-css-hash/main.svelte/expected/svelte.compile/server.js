import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { tag = "div", active = false } = $$props;

	function cn(classname) {
		return classname;
	}

	$.element($$renderer, tag);
	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(` class="red svelte-25v2w4"`);
	});

	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_class('', void 0, { 'active': active })}`);
	});

	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_class('red svelte-25v2w4', void 0, { 'active': active })}`);
	});

	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_class($.clsx(cn("blue")), 'svelte-25v2w4')}`);
	});

	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_class($.clsx(cn("blue")), 'svelte-25v2w4', { 'active': active })}`);
	});
}