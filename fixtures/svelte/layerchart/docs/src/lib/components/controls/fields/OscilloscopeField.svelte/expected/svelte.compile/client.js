import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from 'svelte-ux';
import LucideCirclePlay from '~icons/lucide/circle-play';
import LucideCircleStop from '~icons/lucide/circle-stop';

var root = $.from_html(`<span class="text-danger"> </span>`);
var root_1 = $.from_html(`<div class="mb-4 flex gap-2 items-center"><!> <!></div>`);

export default function OscilloscopeField($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				get icon() {
					return LucideCirclePlay;
				},
				variant: 'fill-outline',
				color: 'primary',
				size: 'sm',
				$$events: {
					click: function (...$$args) {
						$$props.startMicrophone?.apply(this, $$args);
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Start Microphone');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			Button($$anchor, {
				get icon() {
					return LucideCircleStop;
				},
				variant: 'fill-outline',
				color: 'danger',
				size: 'sm',
				$$events: {
					click: function (...$$args) {
						$$props.stopMicrophone?.apply(this, $$args);
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Stop Microphone');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (!$$props.isListening) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span = root();
			var text_2 = $.only_child(span, true);

			$.template_effect(() => $.set_text(text_2, $$props.error));
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($$props.error) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}