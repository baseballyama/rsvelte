import * as $ from 'svelte/internal/server';
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

export default function Accordion_demo_custom($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'buffy',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Initially a reluctant hero who constantly wished for nothing more than a normal life, Buffy eventually
		grew to embrace her destiny. She was unique as a Slayer in many ways; she refused to sacrifice her
		ordinary life for her supernatural destiny, often operated as part of a team with her friends the
		Scooby Gang,`);
					},

					$$slots: {
						default: true,
						control: ($$renderer) => {
							$$renderer.push(`<div slot="control">`);

							Flex($$renderer, {
								children: ($$renderer) => {
									Center($$renderer, {
										mr: 'lg',
										children: ($$renderer) => {
											HobbyKnife($$renderer, { size: 24 });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Stack($$renderer, {
										children: ($$renderer) => {
											Title($$renderer, {
												order: 4,
												color: 'blue',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Buffy Summers`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												size: 'sm',
												color: 'gray',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Main character and resident bad-ass.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'willow',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Willow started out as a shy computer nerd, eventually developing her talents to become a powerful
		and assertive witch. Willow was quick to grasp basic spells and, with support from her girlfriend
		Tara, her powers blossomed even more rapidly.`);
					},

					$$slots: {
						default: true,
						control: ($$renderer) => {
							$$renderer.push(`<div slot="control">`);

							Flex($$renderer, {
								children: ($$renderer) => {
									Center($$renderer, {
										mr: 'lg',
										children: ($$renderer) => {
											Moon($$renderer, { size: 24 });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Stack($$renderer, {
										children: ($$renderer) => {
											Title($$renderer, {
												order: 4,
												color: 'blue',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Willow Rosenberg`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												size: 'sm',
												color: 'gray',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Computer nerd and witch, Buffy best friend.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'xander',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Being the only one of his group of friends to not possess any supernatural abilities, Xander was
		usually the one who saw beyond the supernatural. Besides this, he was known to be very humorous and
		sarcastic, especially in the face of danger.`);
					},

					$$slots: {
						default: true,
						control: ($$renderer) => {
							$$renderer.push(`<div slot="control">`);

							Flex($$renderer, {
								children: ($$renderer) => {
									Center($$renderer, {
										mr: 'lg',
										children: ($$renderer) => {
											Face($$renderer, { size: 24 });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Stack($$renderer, {
										children: ($$renderer) => {
											Title($$renderer, {
												order: 4,
												color: 'blue',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Xander Harris`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												size: 'sm',
												color: 'gray',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Clown of the group and the real down to earth guy.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}