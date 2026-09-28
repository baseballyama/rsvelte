import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	let {
		color = 'orange',
		href = undefined,
		size = 'l',
		class: _class = '',
		children
	} = $$props;

	const paddings = { s: 'px-3 py-1', m: 'px-5 py-3', l: 'px-7 py-4' };
	const textSizes = { s: 'text-sm', m: 'text-base', l: 'text-lg' };

	const bgColors = {
		orange: 'bg-orange hover:bg-orange-400',
		blue: 'bg-blue hover:bg-blue-400',
		green: 'bg-green hover:bg-green-400'
	};

	const extras = $.derived(() => `${paddings[size]} ${textSizes[size]} ${bgColors[color]} ${_class}`);

	$$renderer.push(`<a${$.attr('href', href)}${$.attr_class(`flex w-fit flex-row gap-3 rounded-md text-center text-white ${extras()}`)}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></a>`);
}