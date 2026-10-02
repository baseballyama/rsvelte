import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	Component($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const n = $.derived(() => $$slotProps.name);
				const thing = $.derived(() => $$slotProps.thing);

				const whatever = $.derived(() => {
					let { bla } = $$slotProps.whatever;

					return { bla };
				});

				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.slot(
					node,
					$$props,
					'default',
					{
						get n() {
							return $.get(n);
						},

						get thing() {
							return $.get(thing);
						},

						get bla() {
							return $.get(whatever).bla;
						}
					},
					null
				);

				$.append($$anchor, fragment_1);
			}
		}
	});
}