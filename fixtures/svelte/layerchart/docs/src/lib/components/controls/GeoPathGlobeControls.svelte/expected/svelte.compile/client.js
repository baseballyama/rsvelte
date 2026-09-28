import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LucidePlay from '~icons/lucide/play';
import LucideSquare from '~icons/lucide/square';
import { Button, ButtonGroup } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="text-sm px-2 py-1 font-semibold text-primary bg-primary/5 rounded-full"> </span>`);
var root_2 = $.from_html(`<div class="absolute top-0 left-0 z-10 flex items-center gap-3 screenshot-hidden"><!> <!></div>`);

export default function GeoPathGlobeControls($$anchor, $$props) {
	$.push($$props, true);

	var div = root_2();
	var node = $.child(div);

	ButtonGroup(node, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		class: 'outline rounded-full',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Button(node_1, {
				get icon() {
					return LucidePlay;
				},

				get disabled() {
					return $$props.isPlaying;
				},
				classes: { icon: 'text-xs', root: 'px-2 py-1' },
				$$events: {
					click: function (...$$args) {
						$$props.play?.apply(this, $$args);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => !$$props.isPlaying);

				Button(node_2, {
					get icon() {
						return LucideSquare;
					},

					get disabled() {
						return $.get($0);
					},
					classes: { icon: 'text-xs', root: 'px-2 py-1' },
					$$events: {
						click: function (...$$args) {
							$$props.stop?.apply(this, $$args);
						}
					}
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var span = root_1();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $$props.selectedFeature?.properties.name ?? ''));
			$.append($$anchor, span);
		};

		$.if(node_3, ($$render) => {
			if ($$props.isPlaying && $$props.selectedFeature) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}