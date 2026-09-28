import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Accordion } from '@skeletonlabs/skeleton-svelte';
import { slide } from 'svelte/transition';

var root = $.from_html(`<hr class="hr"/>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<div> </div>`);
var root_3 = $.from_html(`<h3><!></h3> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
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

	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 18, () => items, (item) => item, ($$anchor, item, i) => {
				var fragment_2 = root_4();
				var node_1 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var hr = root();

						$.append($$anchor, hr);
					};

					$.if(node_1, ($$render) => {
						if ($.get(i) !== 0) $$render(consequent);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
					Accordion_Item($$anchor, {
						get value() {
							return item.id;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var h3 = $.first_child(fragment_3);
							var node_3 = $.child(h3);

							$.component(node_3, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger) => {
								Accordion_ItemTrigger($$anchor, {
									class: 'font-bold flex items-center justify-between gap-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root_1();
										var text = $.first_child(fragment_4);
										var node_4 = $.sibling(text);

										$.component(node_4, () => Accordion.ItemIndicator, ($$anchor, Accordion_ItemIndicator) => {
											Accordion_ItemIndicator($$anchor, {
												class: 'group',
												children: ($$anchor, $$slotProps) => {
													ChevronDownIcon($$anchor, {
														class: 'h-5 w-5 transition group-data-[state=open]:rotate-180'
													});
												},
												$$slots: { default: true }
											});
										});

										$.template_effect(() => $.set_text(text, `${item.title ?? ''} `));
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(h3);

							var node_5 = $.sibling(h3, 2);

							{
								const element = ($$anchor, attributes = $.noop) => {
									var fragment_6 = $.comment();
									var node_6 = $.first_child(fragment_6);

									{
										var consequent_1 = ($$anchor) => {
											var div = root_2();

											$.attribute_effect(div, () => ({ ...attributes() }));

											var text_1 = $.only_child(div, true);

											$.template_effect(() => $.set_text(text_1, item.description));
											$.transition(3, div, () => slide, () => ({ duration: 150 }));
											$.append($$anchor, div);
										};

										$.if(node_6, ($$render) => {
											if (!attributes().hidden) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_6);
								};

								$.component(node_5, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent) => {
									Accordion_ItemContent($$anchor, { element, $$slots: { element: true } });
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}