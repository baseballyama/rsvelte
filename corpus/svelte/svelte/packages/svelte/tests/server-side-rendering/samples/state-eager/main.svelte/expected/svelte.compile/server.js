import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const value = $.derived(() => props.number ?? 0);

		$$renderer.push(`<div>value=${$.escape(value())}</div> <div>eager=${$.escape(value())}</div>`);
	});
}