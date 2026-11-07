import * as $ from 'svelte/internal/server';
import DefaultSvelteWithTS from 'package';
import SubWithDTS from 'package/x';
import SubWithoutDTSAndNotTS from 'package/y';

export default function Input($$renderer) {
	DefaultSvelteWithTS($$renderer, {});
	$$renderer.push(`<!----> `);
	SubWithDTS($$renderer, {});
	$$renderer.push(`<!----> `);
	SubWithoutDTSAndNotTS($$renderer, {});
	$$renderer.push(`<!---->`);
	// with https://github.com/sveltejs/language-tools/pull/2478 this would work; needs decision if we want that
}