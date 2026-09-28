import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleCheckFilledIcon from "@tabler/icons-svelte/icons/circle-check-filled";
import LoaderIcon from "@tabler/icons-svelte/icons/loader";
import { Badge } from "$lib/registry/ui/badge/index.js";

var root = $.from_html(`<!> `, 1);

export default function Data_table_status($$anchor, $$props) {
	$.push($$props, true);

	Badge($$anchor, {
		variant: 'outline',
		class: 'px-1.5 text-muted-foreground',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					CircleCheckFilledIcon($$anchor, { class: 'fill-green-500 dark:fill-green-400' });
				};

				var alternate = ($$anchor) => {
					LoaderIcon($$anchor, {});
				};

				$.if(node, ($$render) => {
					if ($$props.row.original.status === "Done") $$render(consequent); else $$render(alternate, -1);
				});
			}

			var text = $.sibling(node);

			$.template_effect(() => $.set_text(text, ` ${$$props.row.original.status ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}