import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "@svar-ui/svelte-core";

var root = $.from_html(`<!> <div> </div>`, 1);
var root_1 = $.from_html(`<div class="container svelte-a8wcp2"><!></div>`);

export default function AvatarCell($$anchor, $$props) {
	$.push($$props, true);

	const userData = $.derived(() => {
		if ($$props.data) return $$props.data;

		const users = $$props.column.options;
		const options = $$props.row["assigned"]?.map((id) => users.find((user) => user.id === id));

		if (options?.length === 1) {
			return options[0];
		}

		return options;
	});

	const names = $.derived(() => {
		if (Array.isArray($.get(userData)) && $.get(userData).length) {
			return $.get(userData).map((user) => user.name).join(", ");
		}

		return "";
	});

	var div = root_1();
	var node = $.child(div);

	$.key(node, () => $.get(userData), ($$anchor) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(names)));
						$.append($$anchor, text);
					};

					var alternate = ($$anchor) => {
						Avatar($$anchor, {
							get value() {
								return $.get(userData);
							},
							size: 22
						});
					};

					$.if(node_2, ($$render) => {
						if ($.get(userData).length < 3) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			};

			var d = $.derived(() => Array.isArray($.get(userData)));

			var alternate_1 = ($$anchor) => {
				var fragment_4 = root();
				var node_3 = $.first_child(fragment_4);

				Avatar(node_3, {
					get value() {
						return $.get(userData);
					},
					size: 28
				});

				var div_1 = $.sibling(node_3, 2);
				var text_1 = $.only_child(div_1, true);

				$.template_effect(() => $.set_text(text_1, $.get(userData)?.name ?? ""));
				$.append($$anchor, fragment_4);
			};

			$.if(node_1, ($$render) => {
				if ($.get(d)) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}