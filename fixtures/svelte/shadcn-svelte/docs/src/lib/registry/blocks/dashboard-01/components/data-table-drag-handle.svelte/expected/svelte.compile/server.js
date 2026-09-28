import * as $ from 'svelte/internal/server';
import GripVerticalIcon from "@tabler/icons-svelte/icons/grip-vertical";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Data_table_drag_handle($$renderer, $$props) {
	let { attach } = $$props;

	Button($$renderer, {
		variant: 'ghost',
		size: 'icon',
		class: 'size-7 text-muted-foreground hover:bg-transparent',
		children: ($$renderer) => {
			GripVerticalIcon($$renderer, { class: 'size-3 text-muted-foreground' });
			$$renderer.push(`<!----> <span class="sr-only">Drag to reorder</span>`);
		},
		$$slots: { default: true }
	});
}