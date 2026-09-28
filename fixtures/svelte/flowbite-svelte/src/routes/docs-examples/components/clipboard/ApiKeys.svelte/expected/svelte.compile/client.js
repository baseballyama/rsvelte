import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Clipboard, Input, Label, Tooltip, Button } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

const children = ($$anchor, success = $.noop) => {
	var fragment = root();
	var node = $.first_child(fragment);

	Tooltip(node, {
		get isOpen() {
			return success();
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, success() ? "Copied" : "Copy to clipboard"));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			CheckOutline($$anchor, {});
		};

		var alternate = ($$anchor) => {
			ClipboardCleanSolid($$anchor, {});
		};

		$.if(node_1, ($$render) => {
			if (success()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div>Flowbite account ID:</div> <!>`, 1);
var root_2 = $.from_html(`<div>API key:</div> <!>`, 1);
var root_3 = $.from_html(`<div>Role ARN:</div> <!>`, 1);
var root_4 = $.from_html(`<form class="flex flex-col space-y-6" action="/"><h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Create a role with read only in-line policies</h2> <p class="mb-6 text-gray-500 dark:text-gray-400">To give Flowbite read access, please create an IAM Role following <a href="#top" class="font-medium text-blue-700 underline hover:no-underline dark:text-blue-500">trust relationship</a> and <a href="#top" class="font-medium text-blue-700 underline hover:no-underline dark:text-blue-500">inline policy</a> .</p> <!> <!> <!> <div class="flex gap-4"><!> <!></div></form>`);

export default function ApiKeys($$anchor) {
	let acc_id = $.state("756593826");
	let api_key = $.state("f4h6sd3t-jsy63ind-hsgdt7rs-jdhf76st");
	let role_arn = $.state("123456789012:user/Flowbite");

	Card($$anchor, {
		size: 'md',
		class: 'p-4 sm:p-6 md:p-8',
		children: ($$anchor, $$slotProps) => {
			var form = root_4();
			var node_2 = $.sibling($.child(form), 4);

			Label(node_2, {
				class: 'space-y-2 font-medium',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_3 = $.sibling($.first_child(fragment_5), 2);

					{
						const right = ($$anchor) => {
							Clipboard($$anchor, {
								embedded: true,
								get children() {
									return children;
								},

								get value() {
									return $.get(acc_id);
								},

								set value($$value) {
									$.set(acc_id, $$value, true);
								}
							});
						};

						Input(node_3, {
							readonly: true,
							disabled: true,
							get value() {
								return $.get(acc_id);
							},

							set value($$value) {
								$.set(acc_id, $$value, true);
							},
							right,
							$$slots: { right: true }
						});
					}

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Label(node_4, {
				class: 'space-y-2 font-medium',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_2();
					var node_5 = $.sibling($.first_child(fragment_7), 2);

					{
						const right = ($$anchor) => {
							Clipboard($$anchor, {
								embedded: true,
								get children() {
									return children;
								},

								get value() {
									return $.get(api_key);
								},

								set value($$value) {
									$.set(api_key, $$value, true);
								}
							});
						};

						Input(node_5, {
							readonly: true,
							disabled: true,
							get value() {
								return $.get(api_key);
							},

							set value($$value) {
								$.set(api_key, $$value, true);
							},
							right,
							$$slots: { right: true }
						});
					}

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Label(node_6, {
				class: 'space-y-2 font-medium',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_3();
					var node_7 = $.sibling($.first_child(fragment_9), 2);

					{
						const right = ($$anchor) => {
							Clipboard($$anchor, {
								embedded: true,
								get children() {
									return children;
								},

								get value() {
									return $.get(role_arn);
								},

								set value($$value) {
									$.set(role_arn, $$value, true);
								}
							});
						};

						Input(node_7, {
							readonly: true,
							disabled: true,
							get value() {
								return $.get(role_arn);
							},

							set value($$value) {
								$.set(role_arn, $$value, true);
							},
							right,
							$$slots: { right: true }
						});
					}

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_6, 2);
			var node_8 = $.child(div);

			Button(node_8, {
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Cancel');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Next step');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.reset(form);
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});
}