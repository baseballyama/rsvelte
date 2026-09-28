import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><div class="rounded-2xl rounded-bl border border-transparent bg-background px-4 py-3 ring-1"><p class="text-foreground"> </p></div> <div class="mt-4 flex items-center gap-2"><!> <div class="text-sm font-medium text-foreground"> </div> <span aria-hidden="true" class="size-1 rounded-full bg-foreground/25"></span> <span class="text-sm text-muted-foreground"> </span></div></div>`);

var root_2 = $.from_html(`<section><div class="bg-muted py-24"><div class="@container mx-auto w-full max-w-5xl px-6"><div class="mb-12"><h2 class="text-4xl font-semibold text-foreground">What Our Clients Say</h2> <p class="my-4 text-lg text-balance text-muted-foreground">Discover why our clients love working with us. Read their testimonials about our
					dedication to excellence, innovative solutions, and exceptional customer
					service.</p></div> <div class="grid gap-6 @lg:grid-cols-2 @3xl:grid-cols-3"></div></div></div></section>`);

export default function Two($$anchor) {
	const testimonials = [
		{
			name: "Méschac Irung",
			role: "Creator",
			avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
			content: "Using Tailark has been like unlocking a secret design superpower. It's the perfect fusion of simplicity and versatility."
		},

		{
			name: "Théo Balick",
			role: "Frontend Dev",
			avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
			content: "Tailark has transformed the way I develop web applications. The flexibility to customize every aspect is amazing."
		},

		{
			name: "Glodie Lukose",
			role: "Frontend Dev",
			avatar: "https://avatars.githubusercontent.com/u/99137927?v=4",
			content: "The extensive collection of UI components has significantly accelerated my workflow. Tailark is a game-changer."
		}
	];

	var section = root_2();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);

	$.each(div_2, 21, () => testimonials, $.index, ($$anchor, testimonial) => {
		var div_3 = root_1();
		var div_4 = $.child(div_3);
		var p = $.child(div_4);
		var text = $.only_child(p, true);

		$.reset(div_4);

		var div_5 = $.sibling(div_4, 2);
		var node = $.child(div_5);

		Avatar(node, {
			class: ' size-6 border border-transparent shadow ring-1',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				AvatarImage(node_1, {
					get src() {
						return $.get(testimonial).avatar;
					},

					get alt() {
						return $.get(testimonial).name;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				AvatarFallback(node_2, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(testimonial).name.charAt(0)]);
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});

		var div_6 = $.sibling(node, 2);
		var text_2 = $.only_child(div_6, true);
		var span = $.sibling(div_6, 4);
		var text_3 = $.only_child(span, true);

		$.reset(div_5);
		$.reset(div_3);

		$.template_effect(() => {
			$.set_text(text, $.get(testimonial).content);
			$.set_text(text_2, $.get(testimonial).name);
			$.set_text(text_3, $.get(testimonial).role);
		});

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}