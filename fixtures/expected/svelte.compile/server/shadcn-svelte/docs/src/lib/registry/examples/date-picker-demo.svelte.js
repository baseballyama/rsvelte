import * as $ from 'svelte/internal/server';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import { cn } from "$lib/utils.js";

export default function Date_picker_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const df = new DateFormatter("en-US", { dateStyle: "long" });
		let value = void 0;
		let contentRef = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								class: cn(
									buttonVariants({
										variant: "outline",
										class: "w-[280px] justify-start text-start font-normal"
									}),
									!value && "text-muted-foreground"
								),

								children: ($$renderer) => {
									CalendarIcon($$renderer, {});

									$$renderer.push(`<!----> ${$.escape(value
										? df.format(value.toDate(getLocalTimeZone()))
										: "Pick a date")}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-auto p-0',
								get ref() {
									return contentRef;
								},

								set ref($$value) {
									contentRef = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									Calendar($$renderer, {
										type: 'single',
										captionLayout: 'dropdown',
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}