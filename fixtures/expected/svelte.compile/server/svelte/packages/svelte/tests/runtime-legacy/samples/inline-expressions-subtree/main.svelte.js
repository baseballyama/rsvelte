import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<span${$.attr_class($.clsx((() => 'red')()))}>A</span> <div><span${$.attr_class($.clsx((() => 'red')()))}>B</span></div>`);
	});
}