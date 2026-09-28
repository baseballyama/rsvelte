import * as $ from 'svelte/internal/server';
import { BoldButton } from '$lib/index.js';
import { Divider } from '$lib/index.js';
import { ItalicButton } from '$lib/index.js';
import { UnderlineButton } from '$lib/index.js';
import { StrikethroughButton } from '$lib/index.js';
import { FormatCodeButton } from '$lib/index.js';
import { DropDownAlign } from '$lib/index.js';
import { FontFamilyDropDown } from '$lib/index.js';
import { FontSizeDropDown } from '$lib/index.js';
import { Toolbar } from '$lib/index.js';

export default function Composer2Toolbar($$renderer) {
	{
		function children($$renderer, { editor, activeEditor, blockType }) {
			FontFamilyDropDown($$renderer, {});
			$$renderer.push(`<!----> `);
			FontSizeDropDown($$renderer, {});
			$$renderer.push(`<!----> `);
			Divider($$renderer, {});
			$$renderer.push(`<!----> `);
			BoldButton($$renderer, {});
			$$renderer.push(`<!----> `);
			ItalicButton($$renderer, {});
			$$renderer.push(`<!----> `);
			UnderlineButton($$renderer, {});
			$$renderer.push(`<!----> `);
			StrikethroughButton($$renderer, {});
			$$renderer.push(`<!----> `);
			FormatCodeButton($$renderer, {});
			$$renderer.push(`<!----> `);
			Divider($$renderer, {});
			$$renderer.push(`<!----> `);
			DropDownAlign($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		Toolbar($$renderer, { children, $$slots: { default: true } });
	}
}