import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let value;

	function handleClick() {
		value = 'hello';
	}

	if (typeof value === 'string') {
		$$renderer.push('<!--[0-->');

		const valueStr = value;
		const valueStr2 = valueStr;

		$$renderer.push(`<div>${$.escape(valueStr.substring(0))}${$.escape(valueStr2.substring(0))}</div> <button></button>`);
	} else if (typeof value === 'number') {
		$$renderer.push(`<!--[1-->${$.escape(value.toFixed())}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (typeof value === 'string') {
		$$renderer.push('<!--[0-->');

		const valueStr = value;
		const valueStr2 = valueStr;

		$$renderer.push(`<div>${$.escape(valueStr.toFixed())}${$.escape(valueStr2.toFixed())}</div>`);
	} else if (typeof value === 'number') {
		$$renderer.push(`<!--[1-->${$.escape(value.substring(0))}`);
	} else {
		$$renderer.push(`<!--[-1-->${$.escape(value.toFixed())}`);
	}

	$$renderer.push(`<!--]-->`);
}