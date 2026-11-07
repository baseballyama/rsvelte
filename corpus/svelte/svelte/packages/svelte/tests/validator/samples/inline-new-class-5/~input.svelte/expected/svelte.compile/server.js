import * as $ from 'svelte/internal/server';

const a = new (class Foo {
	foo = 0;
})();

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}