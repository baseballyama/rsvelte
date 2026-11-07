import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	Parent($$anchor, {
		propA: true,
		propB,
		propC: 'val1',
		propD: 'val2',
		propE: `a${a ?? ''}b${b ?? ''}`,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.slot(
					node,
					$$props,
					'default',
					{
						get foo() {
							return $.get(foo);
						}
					},
					null
				);

				$.append($$anchor, fragment_1);
			}
		}
	});
}