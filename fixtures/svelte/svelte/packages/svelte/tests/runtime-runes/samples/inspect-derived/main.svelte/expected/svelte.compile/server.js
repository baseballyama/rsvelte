import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ push: (v: any) => void }} */
		let { push } = $$props;

		let x = 'x';
		let y = $.derived(() => x.toUpperCase());

		;;
		$$renderer.push(`<button>${$.escape(x)}</button>`);
	});
}