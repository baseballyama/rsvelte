import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from "./Input.svelte";
import Display from "./Display.svelte";

export default function Main($$anchor) {
	Input($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.val);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						Display($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(foo)));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					};

					$.if(node, ($$render) => {
						if ($.get(foo)) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});
}