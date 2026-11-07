import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breakpoint } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="current-size"> </div> <div data-testid="is-sm"> </div> <div data-testid="is-md"> </div> <div data-testid="is-lg"> </div> <div data-testid="is-xlg"> </div> <div data-testid="is-max"> </div>`, 1);

export default function BreakpointFixture($$anchor) {
	Breakpoint($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const size = $.derived(() => $$slotProps.size);
				const sizes = $.derived(() => $$slotProps.sizes);
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var text = $.only_child(div, true);
				var div_1 = $.sibling(div, 2);
				var text_1 = $.only_child(div_1, true);
				var div_2 = $.sibling(div_1, 2);
				var text_2 = $.only_child(div_2, true);
				var div_3 = $.sibling(div_2, 2);
				var text_3 = $.only_child(div_3, true);
				var div_4 = $.sibling(div_3, 2);
				var text_4 = $.only_child(div_4, true);
				var div_5 = $.sibling(div_4, 2);
				var text_5 = $.only_child(div_5, true);

				$.template_effect(() => {
					$.set_text(text, $.get(size));
					$.set_text(text_1, $.get(sizes).sm);
					$.set_text(text_2, $.get(sizes).md);
					$.set_text(text_3, $.get(sizes).lg);
					$.set_text(text_4, $.get(sizes).xlg);
					$.set_text(text_5, $.get(sizes).max);
				});

				$.append($$anchor, fragment_1);
			}
		}
	});
}