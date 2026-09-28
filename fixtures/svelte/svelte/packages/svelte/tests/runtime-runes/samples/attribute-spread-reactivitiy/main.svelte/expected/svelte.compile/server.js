import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 'red';
	let tag = 'div';

	const getValue = () => {
		return value;
	};

	const getClass = () => {
		return value === 'blue';
	};

	const getSpread = () => {
		return { class: value };
	};

	const props = {
		get class() {
			return value;
		}
	};

	$$renderer.push(`<div${$.attr_class('', void 0, { 'blue': getClass() })}${$.attr_style('', { color: getValue() })}></div> <div${$.attributes({ ...getSpread() })}></div> <div${$.attributes({ ...props })}></div> `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_class('', void 0, { 'blue': getClass() })}${$.attr_style('', { color: getValue() })}`);
	});

	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attributes({ ...getSpread() })}`);
	});

	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attributes({ ...props })}`);
	});

	$$renderer.push(` <button>toggle</button>`);
}