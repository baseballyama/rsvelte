import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { useLocale } from '$lib/hooks/use-locale.svelte';
import { DateField } from 'bits-ui';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <!> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://next.bits-ui.com/docs/components/date-field" target="_blank" rel="noopener nofollow">Bits UI DateField</a></p></div>`);

export default function Input_36($$anchor, $$props) {
	$.push($$props, true);

	const localeCtx = useLocale();
	var div = root();
	var node = $.child(div);

	Label(node, {
		class: 'text-foreground text-sm font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Date input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => DateField.Root, ($$anchor, DateField_Root) => {
		DateField_Root($$anchor, {
			get locale() {
				return localeCtx.locale;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_2 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let segments = () => ($$arg0?.()).segments;
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.each(node_3, 17, segments, $.index, ($$anchor, $$item) => {
							let part = () => $.get($$item).part;
							let value = () => $.get($$item).value;
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => DateField.Segment, ($$anchor, DateField_Segment) => {
								DateField_Segment($$anchor, {
									get part() {
										return part();
									},
									class: 'text-foreground focus:bg-accent focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground/70 focus:aria-[valuetext=Empty]:text-foreground data-invalid:data-focused:bg-destructive data-invalid:text-destructive data-[segment=literal]:text-muted-foreground/70 data-invalid:focus:data-placeholder:text-destructive-foreground data-invalid:focus:text-destructive-foreground data-invalid:aria-[valuetext=Empty]:text-destructive inline rounded p-0.5 caret-transparent outline-0 outline-solid disabled:cursor-not-allowed disabled:opacity-50 data-[type=literal]:px-0',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, value()));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_2, () => DateField.Input, ($$anchor, DateField_Input) => {
						DateField_Input($$anchor, {
							class: 'border-input bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg border px-3 py-2 text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden disabled:opacity-50',
							children,
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}