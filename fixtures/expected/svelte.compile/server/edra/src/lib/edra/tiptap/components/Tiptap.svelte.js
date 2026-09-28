import * as $ from 'svelte/internal/server';
import { setEditor } from './editorContext.js';

export default function Tiptap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, children } = $$props;

		if (editor) {
			setEditor(editor);
		}

		if (editor && children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}