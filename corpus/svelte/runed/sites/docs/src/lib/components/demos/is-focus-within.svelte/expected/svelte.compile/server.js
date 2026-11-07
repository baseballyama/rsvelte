import * as $ from 'svelte/internal/server';
import { IsFocusWithin } from "runed";
import { Input, Label, Button, DemoContainer } from "@svecodocs/kit";

export default function Is_focus_within($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let formElement = void 0;
		const formFocused = new IsFocusWithin(() => formElement);

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<form class="mx-auto flex max-w-[340px] flex-col gap-4 p-4"><div class="flex flex-col gap-3">`);

				Label($$renderer, {
					for: 'fname',
					children: ($$renderer) => {
						$$renderer.push(`<!---->First name`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Input($$renderer, { id: 'fname' });
				$$renderer.push(`<!----></div> <div class="flex flex-col gap-3">`);

				Label($$renderer, {
					for: 'lname',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Last name`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Input($$renderer, { id: 'lname' });
				$$renderer.push(`<!----></div> <div class="flex flex-col gap-3">`);

				Label($$renderer, {
					for: 'email',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Email`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Input($$renderer, { id: 'email', type: 'email' });
				$$renderer.push(`<!----></div> `);

				Button($$renderer, {
					type: 'submit',
					variant: 'brand',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></form> <p class="mx-auto mt-6 text-center">Focus is within form: <b${$.attr_class($.clsx(formFocused.current ? "text-emerald-500" : "text-destructive"))}>${$.escape(formFocused.current)}</b></p>`);
			},
			$$slots: { default: true }
		});
	});
}