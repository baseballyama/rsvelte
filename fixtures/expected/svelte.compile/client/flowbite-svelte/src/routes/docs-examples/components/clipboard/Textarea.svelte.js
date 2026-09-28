import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard, Textarea } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Copied`, 1);
var root_1 = $.from_html(`<!> Copy text`, 1);

export default function Textarea_1($$anchor) {
	let value = $.state("");
	let success = $.state(false);

	{
		const addon = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(success) ? "alternative" : "light");

						Clipboard($$anchor, {
							get color() {
								return $.get($0);
							},
							size: 'sm',
							class: 'absolute end-2 top-2 h-8 w-32 px-2.5 font-medium focus:ring-0',
							get value() {
								return $.get(value);
							},

							set value($$value) {
								$.set(value, $$value, true);
							},

							get success() {
								return $.get(success);
							},

							set success($$value) {
								$.set(success, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_1 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = root();
										var node_2 = $.first_child(fragment_4);

										CheckOutline(node_2, { class: 'h-3 w-3' });
										$.next();
										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var fragment_5 = root_1();
										var node_3 = $.first_child(fragment_5);

										ClipboardCleanSolid(node_3, { class: 'h-3 w-3' });
										$.next();
										$.append($$anchor, fragment_5);
									};

									$.if(node_1, ($$render) => {
										if ($.get(success)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node, ($$render) => {
					if ($.get(value).length > 0) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		Textarea($$anchor, {
			id: 'textarea-id',
			placeholder: 'Your message',
			rows: 4,
			name: 'message',
			class: 'w-full',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			addon,
			$$slots: { addon: true }
		});
	}
}