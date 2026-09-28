import * as $ from 'svelte/internal/server';
import { AlignmentButton, FontButton, FormatButton, ImageButton } from "@flowbite-svelte-plugins/texteditor";

export default function CustomGroup($$renderer, $$props) {
	let { editor, showToolbar = true } = $$props;

	if (editor && showToolbar) {
		$$renderer.push('<!--[0-->');
		AlignmentButton($$renderer, { editor, alignment: 'left' });
		$$renderer.push(`<!----> `);
		AlignmentButton($$renderer, { editor, alignment: 'right' });
		$$renderer.push(`<!----> `);
		ImageButton($$renderer, { editor });
		$$renderer.push(`<!----> `);
		FontButton($$renderer, { editor, format: 'fontSize' });
		$$renderer.push(`<!----> `);
		FormatButton($$renderer, { editor, format: 'italic' });
		$$renderer.push(`<!----> `);
		FormatButton($$renderer, { editor, format: 'link' });
		$$renderer.push(`<!----> `);
		FormatButton($$renderer, { editor, format: 'removeLink' });
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}