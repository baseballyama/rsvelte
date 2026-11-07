import * as $ from 'svelte/internal/server';
import { Button, Input, Label } from "@svecodocs/kit";
import { ScrollState } from "runed";
import { preventDefault } from "svelte/legacy";

export default function Scroll_state($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let el = void 0;
		let behavior = "smooth";

		const scroll = new ScrollState({
			element: () => el,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- for some reason ScrollBehavior is not defined
			behavior: () => behavior
		});

		let x = $.derived(() => scroll.x);
		let y = $.derived(() => scroll.y);

		function info($$renderer, label, condition) {
			$$renderer.push(`<div class="flex items-baseline gap-2"><span class="text-sm font-medium leading-none">${$.escape(label)}</span> <span${$.attr_class($.clsx([
				"rounded-lg px-1.5 py-0.5  text-xs text-white ",
				condition ? "bg-emerald-700" : "bg-red-900"
			]))}>${$.escape(condition ? "Yes" : "No")}</span></div>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="dark:bg-primary bg-background dark:ring-primary-hover dark:inset-shadow-muted/20 dark:inset-ring-muted/10 inset-ring-muted/20 ring-muted inset-shadow-muted/20 inset-ring inset-shadow-sm relative mb-4 mt-6 max-w-[760px] overflow-hidden rounded-xl ring"><div class="bg-background border-border absolute left-0 top-0 h-4 w-full border-b"><div class="relative w-full"><div class="h-4 bg-[#F64A00]"${$.attr_style(`width: ${$.stringify(scroll.progress.y)}%;`)}></div></div></div> <div class="bg-background border-border absolute left-0 top-0 h-full w-4 border-b"><div class="relative h-full"><div class="w-4 bg-[#F64A00]"${$.attr_style(`height: ${$.stringify(scroll.progress.x)}%;`)}></div></div></div> <div class="h-[800px] overflow-scroll"><div class="pattern size-[1200px] svelte-1qb8zdd"></div></div> <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold">Scroll me</div> <div class="bg-muted absolute inset-4 !top-[unset] rounded-lg p-4"><h2 class="font-bold">Controls &amp; State</h2> <div class="mt-2 flex items-center gap-2"><form class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'x',
				children: ($$renderer) => {
					$$renderer.push(`<!---->X Position`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex items-center gap-2">`);

			Input($$renderer, {
				type: 'number',
				id: 'x',
				get value() {
					return x();
				},

				set value($$value) {
					x($$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				disabled: x() === scroll.x,
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Set`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></form> <form class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'x',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Y Position`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex items-center gap-2">`);

			Input($$renderer, {
				type: 'number',
				id: 'y',
				get value() {
					return y();
				},

				set value($$value) {
					y($$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				disabled: y() === scroll.y,
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Set`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></form></div> <div class="mt-4 grid grid-cols-5 items-center gap-4">`);

			Label($$renderer, {
				class: 'flex items-center gap-2',
				children: ($$renderer) => {
					$$renderer.push(`<span>Smooth Scroll</span> <input type="checkbox"${$.attr('checked', (() => behavior === "smooth")(), true)}/>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			info($$renderer, "isScrolling", scroll.isScrolling);
			$$renderer.push(`<!----></div> <hr class="border-foreground/10 mt-2 h-px border"/> <h3 class="mt-2 text-sm font-semibold">Progress</h3> <div class="mt-2 grid grid-cols-5 items-center gap-4"><div class="flex place-items-center gap-2"><span class="text-sm font-medium leading-none">x</span> <span class="text-xs text-white">${$.escape(scroll.progress.x.toFixed(0))}%</span></div> <div class="flex place-items-center gap-2"><span class="text-sm font-medium leading-none">y</span> <span class="text-xs text-white">${$.escape(scroll.progress.y.toFixed(0))}%</span></div></div> <hr class="border-foreground/10 mt-2 h-px border"/> <h3 class="mt-2 text-sm font-semibold">Arrived</h3> <div class="mt-2 grid grid-cols-5 items-center gap-4">`);
			info($$renderer, "top", scroll.arrived.top);
			$$renderer.push(`<!----> `);
			info($$renderer, "right", scroll.arrived.right);
			$$renderer.push(`<!----> `);
			info($$renderer, "bottom", scroll.arrived.bottom);
			$$renderer.push(`<!----> `);
			info($$renderer, "left", scroll.arrived.left);
			$$renderer.push(`<!----></div> <hr class="border-foreground/10 mt-2 h-px border"/> <h3 class="mt-2 text-sm font-semibold">Directions</h3> <div class="mt-2 grid grid-cols-5 items-center gap-4">`);
			info($$renderer, "top", scroll.directions.top);
			$$renderer.push(`<!----> `);
			info($$renderer, "right", scroll.directions.right);
			$$renderer.push(`<!----> `);
			info($$renderer, "bottom", scroll.directions.bottom);
			$$renderer.push(`<!----> `);
			info($$renderer, "left", scroll.directions.left);
			$$renderer.push(`<!----></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}