import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Alert, Li, List } from "flowbite-svelte";
import { InfoCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<span><!> <span class="sr-only">Info</span></span>`);
var root_1 = $.from_html(`<p class="font-medium">Ensure that these requirements are met:</p> <ul class="ms-4 mt-1.5 list-inside list-disc"><li>At least 10 characters (and up to 100 characters)</li> <li>At least one lowercase character</li> <li>Inclusion of at least one special character, e.g., ! @ # ?</li></ul>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<p class="font-medium">Ensure that these requirements are met:</p> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function AlertWithList($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			var span = root();
			var node_1 = $.child(span);

			InfoCircleSolid(node_1, { class: 'h-5 w-5' });
			$.next(2);
			$.reset(span);
			$.append($$anchor, span);
		};

		Alert(node, {
			class: 'items-start!',
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();

				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		const icon = ($$anchor) => {
			var span_1 = root();
			var node_3 = $.child(span_1);

			InfoCircleSolid(node_3, { class: 'h-5 w-5' });
			$.next(2);
			$.reset(span_1);
			$.append($$anchor, span_1);
		};

		Alert(node_2, {
			color: 'blue',
			class: 'items-start!',
			icon,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_3();
				var node_4 = $.sibling($.first_child(fragment_2), 2);

				List(node_4, {
					class: 'ms-4 mt-1.5',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var node_5 = $.first_child(fragment_3);

						Li(node_5, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('At least 10 characters (and up to 100 characters)');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						Li(node_6, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('At least one lowercase character');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						Li(node_7, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Inclusion of at least one special character, e.g., ! @ # ?');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}