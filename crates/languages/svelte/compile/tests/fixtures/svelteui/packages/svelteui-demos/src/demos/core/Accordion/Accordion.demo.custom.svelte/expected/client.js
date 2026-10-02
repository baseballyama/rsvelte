import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, Center, Flex, Stack, Title, Text } from '@svelteuidev/core';
import { Face, HobbyKnife, Moon } from 'radix-icons-svelte';

const code = `<script>
  import { Accordion, Center, Flex, Stack, Title, Text } from '@svelteuidev/core';
	import { Face, HobbyKnife, Moon } from 'radix-icons-svelte';
<\/script>

<Accordion>
  <Accordion.Item value="buffy">
    <div slot="control">
      <Flex>
        <Center mr="lg">
          <HobbyKnife size={24}/>
        </Center>
        <Stack>
          <Title order={4} color="blue">Buffy Summers</Title>
          <Text size="sm" color="gray">Main character and resident bad-ass.</Text>
        </Stack>
    </Flex>
    </div>
    Initially a reluctant hero who constantly wished for nothing more than a normal life, Buffy eventually grew to embrace her destiny. She was unique as a Slayer in many ways; she refused to sacrifice her ordinary life for her supernatural destiny, often operated as part of a team with her friends the Scooby Gang,
  </Accordion.Item>
  <Accordion.Item value="willow">
    <div slot="control">
      <Flex>
        <Center mr="lg">
          <Moon size={24}/>
        </Center>
        <Stack>
          <Title order={4} color="blue">Willow Rosenberg</Title>
          <Text size="sm" color="gray">Computer nerd and witch, Buffy best friend.</Text>
        </Stack>
      </Flex>
    </div>
    Willow started out as a shy computer nerd, eventually developing her talents to become a powerful and assertive witch. Willow was quick to grasp basic spells and, with support from her girlfriend Tara, her powers blossomed even more rapidly.
  </Accordion.Item>
  <Accordion.Item value="xander">
    <div slot="control">
      <Flex>
        <Center mr="lg">
          <Face size={24} />
        </Center>
        <Stack>
          <Title order={4} color="blue">Xander Harris</Title>
          <Text size="sm" color="gray">Clown of the group and the real down to earth guy.</Text>
        </Stack>
      </Flex>
    </div>
    Being the only one of his group of friends to not possess any supernatural abilities, Xander was usually the one who saw beyond the supernatural. Besides this, he was known to be very humorous and sarcastic, especially in the face of danger.
  </Accordion.Item>
</Accordion>`;

export const type = 'demo';
export const configuration = { code, toggle: true };

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div slot="control"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Accordion_demo_custom($$anchor) {
	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Item, ($$anchor, Accordion_Item) => {
				Accordion_Item($$anchor, {
					value: 'buffy',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Initially a reluctant hero who constantly wished for nothing more than a normal life, Buffy eventually\n		grew to embrace her destiny. She was unique as a Slayer in many ways; she refused to sacrifice her\n		ordinary life for her supernatural destiny, often operated as part of a team with her friends the\n		Scooby Gang,');

						$.append($$anchor, text);
					},

					$$slots: {
						default: true,
						control: ($$anchor, $$slotProps) => {
							var div = root_1();
							var node_1 = $.child(div);

							Flex(node_1, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									Center(node_2, {
										mr: 'lg',
										children: ($$anchor, $$slotProps) => {
											HobbyKnife($$anchor, { size: 24 });
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									Stack(node_3, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_4 = $.first_child(fragment_4);

											Title(node_4, {
												order: 4,
												color: 'blue',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Buffy Summers');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});

											var node_5 = $.sibling(node_4, 2);

											Text(node_5, {
												size: 'sm',
												color: 'gray',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Main character and resident bad-ass.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});

							$.reset(div);
							$.append($$anchor, div);
						}
					}
				});
			});

			var node_6 = $.sibling(node, 2);

			$.component(node_6, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
				Accordion_Item_1($$anchor, {
					value: 'willow',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Willow started out as a shy computer nerd, eventually developing her talents to become a powerful\n		and assertive witch. Willow was quick to grasp basic spells and, with support from her girlfriend\n		Tara, her powers blossomed even more rapidly.');

						$.append($$anchor, text_3);
					},

					$$slots: {
						default: true,
						control: ($$anchor, $$slotProps) => {
							var div_1 = root_1();
							var node_7 = $.child(div_1);

							Flex(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_8 = $.first_child(fragment_5);

									Center(node_8, {
										mr: 'lg',
										children: ($$anchor, $$slotProps) => {
											Moon($$anchor, { size: 24 });
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									Stack(node_9, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_10 = $.first_child(fragment_7);

											Title(node_10, {
												order: 4,
												color: 'blue',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Willow Rosenberg');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											var node_11 = $.sibling(node_10, 2);

											Text(node_11, {
												size: 'sm',
												color: 'gray',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Computer nerd and witch, Buffy best friend.');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							$.reset(div_1);
							$.append($$anchor, div_1);
						}
					}
				});
			});

			var node_12 = $.sibling(node_6, 2);

			$.component(node_12, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
				Accordion_Item_2($$anchor, {
					value: 'xander',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Being the only one of his group of friends to not possess any supernatural abilities, Xander was\n		usually the one who saw beyond the supernatural. Besides this, he was known to be very humorous and\n		sarcastic, especially in the face of danger.');

						$.append($$anchor, text_6);
					},

					$$slots: {
						default: true,
						control: ($$anchor, $$slotProps) => {
							var div_2 = root_1();
							var node_13 = $.child(div_2);

							Flex(node_13, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_14 = $.first_child(fragment_8);

									Center(node_14, {
										mr: 'lg',
										children: ($$anchor, $$slotProps) => {
											Face($$anchor, { size: 24 });
										},
										$$slots: { default: true }
									});

									var node_15 = $.sibling(node_14, 2);

									Stack(node_15, {
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root();
											var node_16 = $.first_child(fragment_10);

											Title(node_16, {
												order: 4,
												color: 'blue',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Xander Harris');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});

											var node_17 = $.sibling(node_16, 2);

											Text(node_17, {
												size: 'sm',
												color: 'gray',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Clown of the group and the real down to earth guy.');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							$.reset(div_2);
							$.append($$anchor, div_2);
						}
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}