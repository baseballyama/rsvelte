import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import Check from "@lucide/svelte/icons/check";
import { t } from "$lib/stores/i18n";

var root = $.from_html(`<span><!></span> <span><!></span> <span> </span>`, 1);

export default function CopyButton($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let variant = $.prop($$props, 'variant', 3, "outline"),
		size = $.prop($$props, 'size', 3, "icon-sm");

	const clipboard = new UseClipboard({ delay: 1000 });

	async function handleClick() {
		if ($$props.text) {
			await clipboard.copy($$props.text);
		}

		if ($$props.onclick) {
			$$props.onclick();
		}
	}

	Button($$anchor, {
		get variant() {
			return variant();
		},

		get size() {
			return size();
		},

		get class() {
			return `${$$props.class ?? ''} relative cursor-pointer`;
		},
		onclick: handleClick,
		get title() {
			return $$props.title;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var span = $.first_child(fragment_1);
			var node = $.child(span);

			Check(node, { class: 'h-4 w-4 stroke-green-500' });
			$.reset(span);

			var span_1 = $.sibling(span, 2);
			var node_1 = $.child(span_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.snippet(node_2, () => $$props.children);
					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent);
				});
			}

			$.reset(span_1);

			var span_2 = $.sibling(span_1, 2);
			var text_1 = $.only_child(span_2, true);

			$.template_effect(
				($0) => {
					$.set_class(span, 1, `absolute flex items-center transition-all duration-200 ease-out ${clipboard.copied
						? 'scale-100 opacity-100'
						: 'pointer-events-none scale-75 opacity-0'}`);

					$.set_class(span_1, 1, `flex items-center transition-all duration-200 ease-out ${clipboard.copied
						? 'pointer-events-none scale-75 opacity-0'
						: 'scale-100 opacity-100'}`);

					$.set_class(span_2, 1, `bg-popover text-popover-foreground absolute bottom-full left-1/2 z-50 mb-2 origin-bottom -translate-x-1/2 rounded-md border px-2 py-1 text-xs shadow-md transition-all duration-200 ease-out ${clipboard.copied
						? 'scale-100 opacity-100'
						: 'pointer-events-none scale-75 opacity-0'}`);

					$.set_text(text_1, $0);
				},
				[() => $t()("Copied")]
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}