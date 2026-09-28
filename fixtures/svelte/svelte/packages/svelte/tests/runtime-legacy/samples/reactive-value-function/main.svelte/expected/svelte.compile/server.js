import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let foo = () => 1;

	var bar = function () {
		return 2;
	};

	function update() {
		foo = () => 3;
		bar = () => 4;
	}

	$$renderer.push(`<!---->${$.escape(foo())}-${$.escape(bar())}`);
	$.bind_props($$props, { update });
}