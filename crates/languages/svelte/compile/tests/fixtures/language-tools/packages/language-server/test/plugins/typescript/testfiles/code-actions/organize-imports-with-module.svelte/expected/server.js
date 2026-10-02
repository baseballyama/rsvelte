import * as $ from 'svelte/internal/server';
import B from './B';
import A from './A';
import { c } from './c';

export default function Organize_imports_with_module($$renderer) {
	A($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(c)}`);
		},
		$$slots: { default: true }
	});
}