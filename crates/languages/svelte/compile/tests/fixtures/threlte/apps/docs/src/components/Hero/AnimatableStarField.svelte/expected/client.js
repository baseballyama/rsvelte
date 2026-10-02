import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { SheetObject } from '@threlte/theatre';
import StarField from './StarField/StarField.svelte';

export default function AnimatableStarField($$anchor, $$props) {
	{
		const children = ($$anchor, $$arg0) => {
			let Transform = () => ($$arg0?.()).Transform;
			let Declare = () => ($$arg0?.()).Declare;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, Transform, ($$anchor, Transform_1) => {
				Transform_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
							T_Group($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									{
										const children = ($$anchor, $$arg0) => {
											let values = () => ($$arg0?.()).values;
											var fragment_4 = $.comment();
											var node_3 = $.first_child(fragment_4);

											$.key(node_3, () => `${values().amount}-${values().radius}`, ($$anchor) => {
												{
													let $0 = $.derived(() => [
														values().direction.x,
														values().direction.y,
														values().direction.z
													]);

													StarField($$anchor, {
														get amount() {
															return values().amount;
														},

														get radius() {
															return values().radius;
														},

														get size() {
															return values().size;
														},

														get speed() {
															return values().speed;
														},

														get direction() {
															return $.get($0);
														},

														get opacity() {
															return values().opacity;
														}
													});
												}
											});

											$.append($$anchor, fragment_4);
										};

										$.component(node_2, Declare, ($$anchor, Declare_1) => {
											Declare_1($$anchor, {
												props: {
													amount: 1000,
													radius: 100,
													size: 0,
													speed: 0,
													direction: { x: 0, y: 0, z: 1 },
													opacity: 0
												},
												children,
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		SheetObject($$anchor, {
			get key() {
				return $$props.key;
			},
			children,
			$$slots: { default: true }
		});
	}
}