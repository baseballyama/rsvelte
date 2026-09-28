import * as $ from 'svelte/internal/server';
import { useIntersectionObserver } from 'runed';
import { Field, Switch } from 'svelte-ux';

export default function ShowField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			show = void 0,
			label = 'Show',
			labelPlacement = 'left',
			inline = false,
			class: className = 'absolute top-2 right-2 z-1'
		} = $$props;

		let target = null;

		useIntersectionObserver(
			() => target,
			(entries) => {
				const entry = entries[0];

				if (entry?.isIntersecting) {
					setTimeout(
						() => {
							show = true;
						},
						750
					);
				}
			},
			{ once: true }
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (!inline) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-[auto_1fr] gap-2 mb-3 screenshot-hidden screenshot-delay">`);

				Field($$renderer, {
					label,
					labelPlacement,
					class: className,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								size: 'md',
								get checked() {
									return show;
								},

								set checked($$value) {
									show = $$value;
									$$settled = false;
								}
							});
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="screenshot-delay">`);

				Field($$renderer, {
					label,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								size: 'md',
								get checked() {
									return show;
								},

								set checked($$value) {
									show = $$value;
									$$settled = false;
								}
							});
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show });
	});
}