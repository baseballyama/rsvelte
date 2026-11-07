import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, ClipPath, Frame, Layer, Pattern } from 'layerchart';

var root = $.from_svg(`<circle cx="120" cy="150" r="90"></circle><circle cx="240" cy="150" r="90"></circle><rect x="100" y="130" width="160" height="40"></rect>`, 1);

export default function Clip_snippet($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							{
								const clip = ($$anchor) => {
									var fragment_4 = root();

									$.next(2);
									$.append($$anchor, fragment_4);
								};

								ClipPath($$anchor, {
									clip,
									children: ($$anchor, $$slotProps) => {
										Frame($$anchor, {
											get fill() {
												return pattern();
											},
											class: 'stroke-surface-content'
										});
									},
									$$slots: { clip: true, default: true }
								});
							}
						};

						Pattern($$anchor, {
							size: 6,
							lines: [{ rotate: 45 }, { rotate: -45 }],
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}