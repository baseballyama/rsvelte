import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "./Button.svelte";

var root = $.from_html(`<span>showing</span>`);
var root_1 = $.from_html(`<span>hidden</span>`);

export default function Main($$anchor) {
	let show = $.state(false);

	Button($$anchor, {
		change: () => $.set(show, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var span = root();

					$.append($$anchor, span);
				};

				var alternate = ($$anchor) => {
					var span_1 = root_1();

					$.append($$anchor, span_1);
				};

				$.if(node, ($$render) => {
					if ($.get(show)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}