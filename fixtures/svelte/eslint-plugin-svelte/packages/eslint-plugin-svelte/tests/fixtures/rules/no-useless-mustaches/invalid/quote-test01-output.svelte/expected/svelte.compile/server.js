import * as $ from 'svelte/internal/server';

export default function Quote_test01_output($$renderer) {
	$$renderer.push(`<div data-text="a"></div> <div data-text="a b"></div> <div data-text="ab cd"></div> <div data-text="ab cd"></div> <div data-text="&quot;&lt;br>&quot;"></div>`);
}