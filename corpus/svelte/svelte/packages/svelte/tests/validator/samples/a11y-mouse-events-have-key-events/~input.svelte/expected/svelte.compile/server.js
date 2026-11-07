import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const otherProps = { onblur: () => {}, onfocus: () => {} };

	$$renderer.push(`<div></div> <div></div> <div${$.attributes({ ...otherProps })}></div> <div></div> <div></div> <div${$.attributes({ ...otherProps })}></div> <div></div> <div></div>`);
}