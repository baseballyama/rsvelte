import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '../Icon.svelte';
import { Download } from '@lucide/svelte';
import ListItemBase from '../nodes/shared/ListItemBase.svelte';

var root = $.from_html(`<span class="text-muted-foreground text-sm"> </span>`);
var root_1 = $.from_html(`<!> <div class="text-muted-foreground flex items-center gap-1 text-sm"><!> </div> <!>`, 1);

export default function ExtensionListItem($$anchor, $$props) {
	$.push($$props, true);

	{
		const accessories = ($$anchor) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, $$props.ext.commands.length));
					$.append($$anchor, span);
				};

				$.if(node, ($$render) => {
					if ($$props.ext.commands.length > 0) $$render(consequent);
				});
			}

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			Download(node_1, { class: 'size-4' });

			var text_1 = $.sibling(node_1);

			$.reset(div);

			var node_2 = $.sibling(div, 2);

			{
				let $0 = $.derived(() => $$props.ext.author.avatar
					? { source: $$props.ext.author.avatar, mask: 'circle' }
					: undefined);

				Icon(node_2, {
					get icon() {
						return $.get($0);
					},
					class: 'size-6'
				});
			}

			$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => $$props.ext.download_count.toLocaleString()]);
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => $$props.ext.icons.light
			? { source: $$props.ext.icons.light, mask: 'roundedRectangle' }
			: undefined);

		ListItemBase($$anchor, {
			get title() {
				return $$props.ext.title;
			},

			get subtitle() {
				return $$props.ext.description;
			},

			get icon() {
				return $.get($0);
			},

			get isSelected() {
				return $$props.isSelected;
			},

			get onclick() {
				return $$props.onclick;
			},
			accessories,
			$$slots: { accessories: true }
		});
	}

	$.pop();
}