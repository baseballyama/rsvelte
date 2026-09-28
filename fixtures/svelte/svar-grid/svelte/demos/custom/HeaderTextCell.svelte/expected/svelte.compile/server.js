import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";

export default function HeaderTextCell($$renderer) {
	$$renderer.push(`<div class="header-content">`);
	Button($$renderer, { type: "secondary", icon: 'wxi-alert' });
	$$renderer.push(`<!----> <span>Custom header content</span> `);

	$$renderer.push(`<style>
		.header-content {
			display: flex;
			align-items: center;
		}

		.header-content span {
			margin-left: 10px;
		}

		.header-content i {
			display: inline-flex;
			font-size: 20px;
		}
	</style>`);

	$$renderer.push(`</div>`);
}