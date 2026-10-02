import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PressedKeys, watch } from "runed";
import { fade, scale } from "svelte/transition";
import { cn, DemoContainer } from "@svecodocs/kit";
import RunedIcon from "$lib/components/logos/runed-icon.svelte";

var root = $.from_html(`<div class="bg-background dark:bg-muted absolute left-0 top-1/2 -translate-y-1/2 translate-x-[calc(-100%-0.5rem)]"><!></div>`);
var root_1 = $.from_html(`<span class="text-foreground duration-250 text-xl font-bold transition-all"> </span>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<p class="text-muted-foreground absolute bottom-2 right-2 mb-0 text-center text-sm">Press any key to start, no need to select anything</p>`);
var root_4 = $.from_html(`<div><!> <!></div> <p class="text-center"> </p> <!>`, 1);

export default function Pressed_keys($$anchor, $$props) {
	$.push($$props, true);

	const keys = new PressedKeys();
	const toPress = ("Runed").split("");
	const allPressed = $.derived(() => keys.has(...toPress));
	let guessedCorrectly = $.state(false);

	$.user_effect(() => {
		if ($.get(allPressed)) {
			$.set(guessedCorrectly, true);
		}
	});

	let triedInputting = $.state(false);

	watch(() => keys.all, () => {
		$.set(triedInputting, false);
	});

	// eslint-disable-next-line svelte/no-inspect
	;;

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();
					var node_1 = $.child(div_1);

					RunedIcon(node_1, { class: 'size-12' });
					$.reset(div_1);
					$.transition(3, div_1, () => scale, () => ({ start: 0.75, duration: 300 }));
					$.append($$anchor, div_1);
				};

				$.if(node, ($$render) => {
					if ($.get(allPressed)) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node, 2);

			$.each(node_2, 19, () => toPress, (key, i) => `key-${i}`, ($$anchor, key) => {
				var div_2 = root_2();
				var node_3 = $.child(div_2);

				{
					var consequent_1 = ($$anchor) => {
						var span = root_1();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, $.get(key)));
						$.transition(3, span, () => fade, () => ({ duration: 100 }));
						$.append($$anchor, span);
					};

					var d = $.derived(() => keys.has($.get(key)));

					$.if(node_3, ($$render) => {
						if ($.get(d)) $$render(consequent_1);
					});
				}

				$.reset(div_2);

				$.template_effect(($0) => $.set_class(div_2, 1, $0), [
					() => $.clsx(cn("border-input bg-background dark:bg-muted ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", "grid size-12 place-items-center rounded-lg border-2 transition-all duration-200", $.get(allPressed) && "border-brand"))
				]);

				$.delegated('click', div_2, () => $.set(triedInputting, true));
				$.append($$anchor, div_2);
			});

			$.reset(div);

			var p = $.sibling(div, 2);
			var text_1 = $.only_child(p, true);
			var node_4 = $.sibling(p, 2);

			{
				var consequent_2 = ($$anchor) => {
					var p_1 = root_3();

					$.transition(3, p_1, () => fade, () => ({ duration: 300 }));
					$.append($$anchor, p_1);
				};

				$.if(node_4, ($$render) => {
					if (!$.get(guessedCorrectly) && $.get(triedInputting)) $$render(consequent_2);
				});
			}

			$.template_effect(() => {
				$.set_class(div, 1, `relative mx-auto flex w-min items-center justify-center gap-2 transition-all duration-300
		${$.get(allPressed) ? 'translate-x-[1.625rem]' : ''}`);

				$.set_text(text_1, $.get(guessedCorrectly) ? "You did it! 🎉" : "Try and guess the password 👀");
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);