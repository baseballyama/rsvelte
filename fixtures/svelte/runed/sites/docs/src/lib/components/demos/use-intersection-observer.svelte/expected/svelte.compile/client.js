import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useIntersectionObserver } from "runed";
import { Checkbox, Label, DemoContainer } from "@svecodocs/kit";

var root_1 = $.from_html(`<div class="flex items-center justify-center"><!> <!></div> <div class="border-border m-2 h-[200px] overflow-y-scroll border-2 border-dashed pt-4"><p class="text-lg italic">Scroll down 👇</p> <div class="border-brand m-6 mt-96 max-h-[150px] border-2 p-2.5"><p>I'm the target! 🎯</p></div></div> <div class="text-center">Element <span> </span> the viewport</div>`, 1);

export default function Use_intersection_observer($$anchor, $$props) {
	$.push($$props, true);

	let root = $.state(null);
	let target = $.state(null);
	let isVisible = $.state(false);

	const observer = useIntersectionObserver(
		() => $.get(target),
		([entry]) => {
			if (entry) {
				$.set(isVisible, entry.isIntersecting, true);
			} else {
				$.set(isVisible, false);
			}
		},
		{ root: () => $.get(root) }
	);

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4 text-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Checkbox(node, {
				id: 'enabled',
				get checked() {
					return observer.isActive;
				},

				onCheckedChange: (v) => {
					if (v) {
						observer.resume();
					} else {
						observer.pause();
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			Label(node_1, {
				for: 'enabled',
				class: 'pl-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Enable');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var div_2 = $.sibling($.child(div_1), 2);

			$.bind_this(div_2, ($$value) => $.set(target, $$value), () => $.get(target));
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(root, $$value), () => $.get(root));

			var div_3 = $.sibling(div_1, 2);
			var span = $.sibling($.child(div_3));
			var text_1 = $.only_child(span, true);

			$.next();
			$.reset(div_3);

			$.template_effect(() => {
				$.set_class(span, 1, `font-medium ${$.get(isVisible)
					? 'text-green-600 dark:text-green-500'
					: 'text-destructive'}`);

				$.set_text(text_1, $.get(isVisible) ? "inside" : "outside");
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}