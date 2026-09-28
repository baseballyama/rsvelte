import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GripVerticalIcon from "@tabler/icons-svelte/icons/grip-vertical";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <span class="sr-only">Drag to reorder</span>`, 1);

export default function Data_table_drag_handle($$anchor, $$props) {
	Button($$anchor, {
		[$.attachment()]: ($$node) => ($$props.attach || $.noop)($$node),
		variant: 'ghost',
		size: 'icon',
		class: 'size-7 text-muted-foreground hover:bg-transparent',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			GripVerticalIcon(node, { class: 'size-3 text-muted-foreground' });
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}