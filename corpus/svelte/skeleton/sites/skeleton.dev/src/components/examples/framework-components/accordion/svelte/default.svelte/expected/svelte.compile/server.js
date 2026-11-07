import * as $ from 'svelte/internal/server';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Accordion } from '@skeletonlabs/skeleton-svelte';
import { slide } from 'svelte/transition';

export default function Default($$renderer) {
	/**
	 * Attribution
	 * @see https://www.healthline.com/health/fun-facts-about-the-skeletal-system#8-More-than-half-your-bones-are-in-your-hands-and-feet
	 */
	const items = [
		{
			id: '1',
			title: 'Your skeleton is made of more than 200 bones',
			description: 'Inside your body are 206 bones. Each bone plays a very important role in making all the mechanics of your body function properly. If a bone is broken, all the bones around it can’t perform their duty properly.'
		},

		{
			id: '2',
			title: 'The smallest bone in the body is in your ear',
			description: 'The stapes, a bone in your inner ear, is the smallest of all your bones. This bone is also sometimes called the stirrup because of its Y shape. Together with the anvil and hammer bones, the stapes helps translate sounds you hear into waves your brain can understand.'
		},

		{
			id: '3',
			title: 'One bone isn’t connected to any other bones',
			description: 'The hyoid bone, which is in your throat, is the only bone that doesn’t connect to a joint. The hyoid is responsible for holding your tongue in place.'
		}
	];

	Accordion($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];

				if (i !== 0) {
					$$renderer.push(`<!--[0--><hr class="hr"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (Accordion.Item) {
					$$renderer.push('<!--[-->');

					Accordion.Item($$renderer, {
						value: item.id,
						children: ($$renderer) => {
							$$renderer.push(`<h3>`);

							if (Accordion.ItemTrigger) {
								$$renderer.push('<!--[-->');

								Accordion.ItemTrigger($$renderer, {
									class: 'font-bold flex items-center justify-between gap-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.title)} `);

										if (Accordion.ItemIndicator) {
											$$renderer.push('<!--[-->');

											Accordion.ItemIndicator($$renderer, {
												class: 'group',
												children: ($$renderer) => {
													ChevronDownIcon($$renderer, {
														class: 'h-5 w-5 transition group-data-[state=open]:rotate-180'
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

							$$renderer.push(`</h3> `);

							{
								function element($$renderer, attributes) {
									if (!attributes.hidden) {
										$$renderer.push(`<!--[0--><div${$.attributes({ ...attributes })}>${$.escape(item.description)}</div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Accordion.ItemContent) {
									$$renderer.push('<!--[-->');
									Accordion.ItemContent($$renderer, { element, $$slots: { element: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
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

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}