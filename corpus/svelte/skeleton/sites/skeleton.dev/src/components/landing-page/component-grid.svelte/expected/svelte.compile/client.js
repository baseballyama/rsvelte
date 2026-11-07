import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import massiveAttackMezzanine from '@/assets/landing-page/massive-attack-mezzanine.webp';
import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
import ChartBar from '@lucide/svelte/icons/chart-bar';
import Check from '@lucide/svelte/icons/check';
import FastForward from '@lucide/svelte/icons/fast-forward';
import Headphones from '@lucide/svelte/icons/headphones';
import Music from '@lucide/svelte/icons/music';
import Play from '@lucide/svelte/icons/play';
import Rewind from '@lucide/svelte/icons/rewind';
import Sliders from '@lucide/svelte/icons/sliders';
import Users from '@lucide/svelte/icons/users';
import Volume2 from '@lucide/svelte/icons/volume-2';
import { Avatar, Slider, Progress, SegmentedControl, Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<hr class="hr"/>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <button type="button" class="card w-full grid grid-cols-[auto_1fr] items-center gap-4 p-3"><!> <div class="text-left"><p class="font-bold"> </p> <p class="opacity-60 text-xs"> </p></div></button>`, 1);
var root_4 = $.from_html(`<tr><td><label><span class="sr-only"> </span> <input type="checkbox" class="checkbox"/></label></td><td> </td><td> </td><td class="text-right"> </td></tr>`);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="space-y-2"><div class="grid grid-cols-4 gap-4"><div><header><span class="h3">Create Account</span> <p class="opacity-60">Complete the form to get started.</p></header> <nav class="grid grid-cols-2 gap-5"><button class="btn preset-outlined-surface-200-800 hover:preset-tonal">GitHub</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Google</button></nav> <hr class="hr"/> <form class="grid grid-cols-1 gap-5"><label class="label"><span class="label-text">Email</span> <input type="email" class="input" placeholder="me@example.com"/></label> <label class="label"><span class="label-text">Password</span> <input type="password" class="input" placeholder="Enter your password..."/></label></form> <button class="w-full btn preset-filled-primary-500">Create Account</button></div> <div><header class="space-y-1"><h2 class="h4">Notifications</h2> <p class="opacity-60">Review each available option.</p></header> <section class="w-full space-y-5"></section></div> <div><div class="space-y-4"><header><h2 class="h4">Team</h2> <p class="opacity-60">View all members of the team, or filter using the search field provided.</p></header> <input type="search" class="input" placeholder="Search Members..."/> <div class="grid grid-cols-1 gap-2"></div></div></div> <div><header class="flex justify-between items-center"><h2 class="h4">Music</h2> <p class="text-xs opacity-60">Harman Kardon Luna</p></header> <img alt="Massive Attack" class="rounded-container border-[1px] border-surface-500/50"/> <div class="grid grid-cols-[auto_1fr] gap-2 items-center"><!> <!></div> <div class="grid grid-cols-4 gap-2 items-center"><button type="button" class="aspect-square flex flex-col justify-center items-center gap-2 rounded-container hover:preset-tonal"><div class="w-8 aspect-square rounded-full flex justify-center items-center preset-filled-primary-500"><!></div> <span class="text-[10px]">Normalize</span></button> <button type="button" class="aspect-square flex flex-col justify-center items-center gap-2 rounded-container hover:preset-tonal"><div class="w-8 aspect-square rounded-full flex justify-center items-center preset-filled-primary-500"><!></div> <span class="text-[10px]">Equalizer</span></button> <button type="button" class="aspect-square flex flex-col justify-center items-center gap-2 rounded-container hover:preset-tonal"><div class="w-8 aspect-square rounded-full flex justify-center items-center preset-filled-primary-500"><!></div> <span class="text-[10px]">3D Audio</span></button> <button type="button" class="aspect-square flex flex-col justify-center items-center gap-2 rounded-container hover:preset-tonal"><div class="w-8 aspect-square rounded-full flex justify-center items-center preset-filled-primary-500"><!></div> <span class="text-[10px]">Crossfade</span></button></div></div> <div><div class="flex justify-between items-center gap-4"><div><h2 class="h4">Success</h2> <p class="text-xs opacity-60">Task was completed.</p></div> <div class="flex gap-1"><button type="button" class="btn preset-outlined-surface-200-800 hover:preset-tonal">Dismiss</button></div></div></div> <div><h2 class="h4">Statistics</h2> <div class="card grid grid-cols-3 gap-5"><div class="flex flex-col items-start"><h2 class="text-3xl font-bold">64k+</h2> <div class="grid grid-cols-1 gap-2"><p class="text-xs opacity-60">Downloads</p> <span class="badge preset-tonal-success">&uarr; 4%</span></div></div> <div class="flex flex-col items-start"><h2 class="text-3xl font-bold">93k+</h2> <div class="grid grid-cols-1 gap-2"><p class="text-xs opacity-60">Views</p> <span class="badge preset-tonal-error">&darr; 2.4%</span></div></div> <div class="flex flex-col items-start"><h2 class="text-3xl font-bold">15k+</h2> <div class="grid grid-cols-1 gap-2"><p class="text-xs opacity-60">Members</p> <span class="badge preset-tonal-success">&uarr; 8%</span></div></div></div> <hr class="hr"/> <p class="opacity-60">Data represents quarterly metrics for the TPS reports. Updates every 24 hours.</p></div> <div><h2 class="h4 text-center">Progression</h2> <div class="grid grid-cols-[1fr_auto] grid-row-2 gap-5"><!> <!> <!></div></div> <div><header class="flex justify-between"><div><h2 class="h3">Revenue</h2> <p class="text-xs opacity-60">Posted April 1-13</p></div> <button type="button" class="btn-icon rounded-full preset-tonal" title="Expand revenue details" aria-label="Expand revenue details"><!></button></header> <hr class="hr"/> <div class="space-y-1"><div class="flex justify-between items-center"><span class="text-xl font-bold">$3,900</span> <span class="badge preset-tonal-success">+20%</span></div> <progress class="progress" value="39" max="100"></progress></div> <div class="space-y-1"><div class="flex justify-between items-center"><span class="text-xl font-bold">$6,400</span> <span class="badge preset-tonal-error">-5%</span></div> <progress class="progress" value="64" max="100"></progress></div> <div class="space-y-1"><div class="flex justify-between items-center"><span class="text-xl font-bold">$1,300</span> <span class="badge preset-tonal-success">+8%</span></div> <progress class="progress" value="13" max="100"></progress></div></div> <div><div class="space-y-2"><p class="font-bold">Delivery</p> <nav class="grid grid-cols-2 gap-2"><button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Tomorrow</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Within 2 days</button></nav></div> <div class="space-y-2"><p class="font-bold">Size</p> <nav class="grid grid-cols-5 gap-2"><button class="btn preset-outlined-surface-200-800 hover:preset-tonal">5.5</button> <button class="btn preset-filled-primary-500">6</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">6.5</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">7</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">7.5</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">8</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">8.5</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">9</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">9.5</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">10</button></nav></div> <div class="space-y-2"><p class="font-bold">Material</p> <nav class="grid grid-cols-4 gap-2"><button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Canvas</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Mesh</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Suede</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Leather</button></nav></div></div> <div><div class="w-16 aspect-square preset-tonal-success flex justify-center items-center mx-auto rounded-full"><!></div> <div class="space-y-2 text-center"><h2 class="h2">Invoice Paid</h2> <p class="text-sm opacity-60">You paid $14,276. Receipt submitted to:</p> <p class="font-bold">me@email.com</p></div> <nav class="grid grid-cols-1 gap-2"><button class="btn preset-filled-primary-500">Mark Completed</button> <button class="btn preset-outlined-surface-200-800 hover:preset-tonal">Cancel</button></nav></div> <div><label><span class="label-text">Filter</span> <input type="search" class="input" placeholder="Filter elements..."/></label> <div class="table-wrap"><table class="table"><thead><tr><th>Selected</th><th>Symbol</th><th>Name</th><th class="text-right!">Weight</th></tr></thead><tbody class="[&amp;>tr]:hover:preset-tonal"></tbody></table></div></div> <div><h2 class="h4">Set Reminder</h2> <!> <label class="label"><span class="label-text">Message</span> <textarea name="message" id="message" rows="3" class="textarea rounded-container" placeholder="Provide a message..."></textarea></label> <div class="flex justify-end"><button class="btn preset-filled-primary-500">Submit</button></div></div> <div><div class="space-y-2"><header class="flex justify-between items-center gap-4"><h2 class="h6">Contributions</h2> <!></header> <h2 class="text-4xl font-bold">+1,248</h2> <p class="text-xs opacity-60"><span class="badge preset-tonal">+150% increase</span></p></div></div> <div><div class="h-full grid grid-cols-[auto_2fr_0.5fr] items-center gap-2 px-5"><button type="button" class="btn-icon btn-icon-lg rounded-full preset-filled-primary-500 scale-150" title="Play music" aria-label="Play music"><!></button> <div class="grid grid-cols-[auto_1fr_auto] gap-5 items-center px-10"><button type="button" class="btn hover:preset-tonal" aria-label="Rewind"><!></button> <div class="space-y-1"><p class="font-bold">Pink Floyd</p> <progress class="progress" value="75" max="100"></progress> <div class="flex justify-between items-end"><p class="text-xs opacity-60">Another Brick in the Wall</p> <p class="text-xs opacity-60">3:16</p></div></div> <button type="button" class="btn hover:preset-tonal" aria-label="Fast forward"><!></button></div> <div class="grid grid-cols-[auto_1fr] gap-2 items-center"><!> <!></div></div></div></div></div>`);

export default function Component_grid($$anchor, $$props) {
	$.push($$props, true);

	const cardClasses = 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5';

	function camelCaseToReadable(str) {
		return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
	}

	const notifications = $.proxy({
		doNotDisturb: false,
		global: false,
		personal: false,
		priority: false,
		news: false
	});

	const teamData = [
		{ name: 'Janet Rosenbell', email: 'jrosenbell@email.com' },
		{ name: 'Jason Greene', email: 'jgreene@email.com' },
		{ name: 'Lucas Gamble', email: 'lgamble@email.com' },
		{ name: 'Murray Henderson', email: 'mhenderson@email.com' }
	];

	const tableData = [
		{ position: '0', name: 'Iron', symbol: 'Fe', atomic_no: '26' },
		{
			position: '1',
			name: 'Rhodium',
			symbol: 'Rh',
			atomic_no: '45'
		},
		{ position: '2', name: 'Iodine', symbol: 'I', atomic_no: '53' },
		{ position: '3', name: 'Radon', symbol: 'Rn', atomic_no: '86' },
		{
			position: '4',
			name: 'Technetium',
			symbol: 'Tc',
			atomic_no: '43'
		}
	];

	var div = root_6();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.set_class(div_2, 1, $.clsx(cardClasses));

	var div_3 = $.sibling(div_2, 2);

	$.set_class(div_3, 1, $.clsx(cardClasses));

	var section = $.sibling($.child(div_3), 2);

	$.each(section, 23, () => Object.entries(notifications), ([key, value]) => key, ($$anchor, $$item, i) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array)[0];
		let value = () => $.get($$array)[1];
		var fragment = root_2();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var hr = root();

				$.append($$anchor, hr);
			};

			$.if(node, ($$render) => {
				if ($.get(i) > 0) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			let $0 = $.derived(() => key() !== 'doNotDisturb' && notifications.doNotDisturb ? false : value());
			let $1 = $.derived(() => key() !== 'doNotDisturb' && notifications.doNotDisturb);

			Switch(node_1, {
				class: 'flex justify-between items-center gap-4',
				get name() {
					return key();
				},

				get checked() {
					return $.get($0);
				},
				onCheckedChange: (details) => notifications[key()] = details.checked,
				get disabled() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Switch.Label, ($$anchor, Switch_Label) => {
						Switch_Label($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => camelCaseToReadable(key())]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Switch.Control, ($$anchor, Switch_Control) => {
						Switch_Control($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
									Switch_Thumb($$anchor, {});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_3, 2);

					$.component(node_5, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
						Switch_HiddenInput($$anchor, {});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(section);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);

	$.set_class(div_4, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2');

	var div_5 = $.child(div_4);
	var div_6 = $.sibling($.child(div_5), 4);

	$.each(div_6, 21, () => teamData, $.index, ($$anchor, member, i) => {
		var fragment_4 = root_3();
		var node_6 = $.first_child(fragment_4);

		{
			var consequent_1 = ($$anchor) => {
				var hr_1 = root();

				$.append($$anchor, hr_1);
			};

			$.if(node_6, ($$render) => {
				if (i > 0) $$render(consequent_1);
			});
		}

		var button = $.sibling(node_6, 2);
		var node_7 = $.child(button);

		Avatar(node_7, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_8 = $.first_child(fragment_5);

				{
					let $0 = $.derived(() => `Avatar of ${$.get(member).name}`);

					$.component(node_8, () => Avatar.Image, ($$anchor, Avatar_Image) => {
						Avatar_Image($$anchor, {
							src: `https://i.pravatar.cc/150?img=${i + 10}`,
							get alt() {
								return $.get($0);
							},
							class: 'grayscale'
						});
					});
				}

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});

		var div_7 = $.sibling(node_7, 2);
		var p = $.child(div_7);
		var text_1 = $.only_child(p, true);
		var p_1 = $.sibling(p, 2);
		var text_2 = $.only_child(p_1, true);

		$.reset(div_7);
		$.reset(button);

		$.template_effect(() => {
			$.set_text(text_1, $.get(member).name);
			$.set_text(text_2, $.get(member).email);
		});

		$.append($$anchor, fragment_4);
	});

	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_4);

	var div_8 = $.sibling(div_4, 2);

	$.set_class(div_8, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2');

	var img = $.sibling($.child(div_8), 2);
	var div_9 = $.sibling(img, 2);
	var node_9 = $.child(div_9);

	Play(node_9, { class: 'size-4 opacity-60' });

	var node_10 = $.sibling(node_9, 2);

	Slider(node_10, {
		name: 'volume',
		defaultValue: [70],
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_11 = $.first_child(fragment_6);

			$.component(node_11, () => Slider.Control, ($$anchor, Slider_Control) => {
				Slider_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_2();
						var node_12 = $.first_child(fragment_7);

						$.component(node_12, () => Slider.Track, ($$anchor, Slider_Track) => {
							Slider_Track($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_13 = $.first_child(fragment_8);

									$.component(node_13, () => Slider.Range, ($$anchor, Slider_Range) => {
										Slider_Range($$anchor, {});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_12, 2);

						$.component(node_14, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
							Slider_Thumb($$anchor, {
								index: 0,
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = $.comment();
									var node_15 = $.first_child(fragment_9);

									$.component(node_15, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput) => {
										Slider_HiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var button_1 = $.child(div_10);
	var div_11 = $.child(button_1);
	var node_16 = $.child(div_11);

	Music(node_16, { class: 'size-4' });
	$.reset(div_11);
	$.next(2);
	$.reset(button_1);

	var button_2 = $.sibling(button_1, 2);
	var div_12 = $.child(button_2);
	var node_17 = $.child(div_12);

	Sliders(node_17, { class: 'size-4' });
	$.reset(div_12);
	$.next(2);
	$.reset(button_2);

	var button_3 = $.sibling(button_2, 2);
	var div_13 = $.child(button_3);
	var node_18 = $.child(div_13);

	Headphones(node_18, { class: 'size-4' });
	$.reset(div_13);
	$.next(2);
	$.reset(button_3);

	var button_4 = $.sibling(button_3, 2);
	var div_14 = $.child(button_4);
	var node_19 = $.child(div_14);

	ChartBar(node_19, { class: 'size-4' });
	$.reset(div_14);
	$.next(2);
	$.reset(button_4);
	$.reset(div_10);
	$.reset(div_8);

	var div_15 = $.sibling(div_8, 2);

	$.set_class(div_15, 1, $.clsx(cardClasses));

	var div_16 = $.sibling(div_15, 2);

	$.set_class(div_16, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2');

	var div_17 = $.sibling(div_16, 2);

	$.set_class(div_17, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2 row-start-3');

	var div_18 = $.sibling($.child(div_17), 2);
	var node_20 = $.child(div_18);

	Progress(node_20, {
		value: 32,
		class: 'relative items-center w-fit row-span-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_2();
			var node_21 = $.first_child(fragment_10);

			$.component(node_21, () => Progress.Circle, ($$anchor, Progress_Circle) => {
				Progress_Circle($$anchor, {
					class: '[--size:--spacing(48)]',
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_2();
						var node_22 = $.first_child(fragment_11);

						$.component(node_22, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack) => {
							Progress_CircleTrack($$anchor, {});
						});

						var node_23 = $.sibling(node_22, 2);

						$.component(node_23, () => Progress.CircleRange, ($$anchor, Progress_CircleRange) => {
							Progress_CircleRange($$anchor, {});
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			var node_24 = $.sibling(node_21, 2);

			$.component(node_24, () => Progress.ValueText, ($$anchor, Progress_ValueText) => {
				Progress_ValueText($$anchor, {
					class: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-semibold'
				});
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_20, 2);

	Progress(node_25, {
		value: 66,
		class: 'relative items-center w-fit self-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_2();
			var node_26 = $.first_child(fragment_12);

			$.component(node_26, () => Progress.Circle, ($$anchor, Progress_Circle_1) => {
				Progress_Circle_1($$anchor, {
					class: '[--size:--spacing(18)]',
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = root_2();
						var node_27 = $.first_child(fragment_13);

						$.component(node_27, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack_1) => {
							Progress_CircleTrack_1($$anchor, {});
						});

						var node_28 = $.sibling(node_27, 2);

						$.component(node_28, () => Progress.CircleRange, ($$anchor, Progress_CircleRange_1) => {
							Progress_CircleRange_1($$anchor, {});
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			});

			var node_29 = $.sibling(node_26, 2);

			$.component(node_29, () => Progress.ValueText, ($$anchor, Progress_ValueText_1) => {
				Progress_ValueText_1($$anchor, {
					class: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
				});
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_30 = $.sibling(node_25, 2);

	Progress(node_30, {
		value: 35,
		class: 'relative items-center w-fit self-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_2();
			var node_31 = $.first_child(fragment_14);

			$.component(node_31, () => Progress.Circle, ($$anchor, Progress_Circle_2) => {
				Progress_Circle_2($$anchor, {
					class: '[--size:--spacing(18)]',
					children: ($$anchor, $$slotProps) => {
						var fragment_15 = root_2();
						var node_32 = $.first_child(fragment_15);

						$.component(node_32, () => Progress.CircleTrack, ($$anchor, Progress_CircleTrack_2) => {
							Progress_CircleTrack_2($$anchor, {});
						});

						var node_33 = $.sibling(node_32, 2);

						$.component(node_33, () => Progress.CircleRange, ($$anchor, Progress_CircleRange_2) => {
							Progress_CircleRange_2($$anchor, {});
						});

						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				});
			});

			var node_34 = $.sibling(node_31, 2);

			$.component(node_34, () => Progress.ValueText, ($$anchor, Progress_ValueText_2) => {
				Progress_ValueText_2($$anchor, {
					class: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
				});
			});

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_18);
	$.reset(div_17);

	var div_19 = $.sibling(div_17, 2);

	$.set_class(div_19, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 col-span-2 row-span-2 col-start-3 row-start-3');

	var header = $.child(div_19);
	var button_5 = $.sibling($.child(header), 2);
	var node_35 = $.child(button_5);

	ArrowUpRight(node_35, { class: 'size-4' });
	$.reset(button_5);
	$.reset(header);
	$.next(8);
	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);

	$.set_class(div_20, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2 col-start-2 row-start-4');

	var div_21 = $.sibling(div_20, 2);

	$.set_class(div_21, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2 row-start-5 text-center');

	var div_22 = $.child(div_21);
	var node_36 = $.child(div_22);

	Check(node_36, { class: 'size-8' });
	$.reset(div_22);
	$.next(4);
	$.reset(div_21);

	var div_23 = $.sibling(div_21, 2);

	$.set_class(div_23, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 col-span-2 row-span-2 col-start-3 row-start-5');

	var div_24 = $.sibling($.child(div_23), 2);
	var table = $.child(div_24);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => tableData, $.index, ($$anchor, row, i) => {
		var tr = root_4();
		var td = $.child(tr);
		var label = $.child(td);
		var span = $.child(label);
		var text_3 = $.only_child(span);
		var input = $.sibling(span, 2);

		$.remove_input_defaults(input);
		$.set_checked(input, i === 1);
		$.reset(label);
		$.reset(td);

		var td_1 = $.sibling(td);
		var text_4 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_5 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_6 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_3, `Select ${$.get(row).name ?? ''}`);
			$.set_text(text_4, $.get(row).symbol);
			$.set_text(text_5, $.get(row).name);
			$.set_text(text_6, $.get(row).atomic_no);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_24);
	$.reset(div_23);

	var div_25 = $.sibling(div_23, 2);

	$.set_class(div_25, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2 col-start-2 row-start-6 row-end-9');

	var node_37 = $.sibling($.child(div_25), 2);

	SegmentedControl(node_37, {
		name: 'time',
		defaultValue: '15',
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_2();
			var node_38 = $.first_child(fragment_16);

			$.component(node_38, () => SegmentedControl.Label, ($$anchor, SegmentedControl_Label) => {
				SegmentedControl_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Time');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});
			});

			var node_39 = $.sibling(node_38, 2);

			$.component(node_39, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
				SegmentedControl_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_17 = root_5();
						var node_40 = $.first_child(fragment_17);

						$.component(node_40, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
							SegmentedControl_Indicator($$anchor, {});
						});

						var node_41 = $.sibling(node_40, 2);

						$.component(node_41, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
							SegmentedControl_Item($$anchor, {
								value: '15',
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = root_2();
									var node_42 = $.first_child(fragment_18);

									$.component(node_42, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
										SegmentedControl_ItemText($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('5 mins');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									var node_43 = $.sibling(node_42, 2);

									$.component(node_43, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
										SegmentedControl_ItemHiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_18);
								},
								$$slots: { default: true }
							});
						});

						var node_44 = $.sibling(node_41, 2);

						$.component(node_44, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_1) => {
							SegmentedControl_Item_1($$anchor, {
								value: '60',
								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root_2();
									var node_45 = $.first_child(fragment_19);

									$.component(node_45, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_1) => {
										SegmentedControl_ItemText_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('15 mins');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_46 = $.sibling(node_45, 2);

									$.component(node_46, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_1) => {
										SegmentedControl_ItemHiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});
						});

						var node_47 = $.sibling(node_44, 2);

						$.component(node_47, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_2) => {
							SegmentedControl_Item_2($$anchor, {
								value: '240',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root_2();
									var node_48 = $.first_child(fragment_20);

									$.component(node_48, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_2) => {
										SegmentedControl_ItemText_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('30 mins');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									var node_49 = $.sibling(node_48, 2);

									$.component(node_49, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_2) => {
										SegmentedControl_ItemHiddenInput_2($$anchor, {});
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_17);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	$.next(4);
	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);

	$.set_class(div_26, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 row-span-2 row-start-7');

	var div_27 = $.child(div_26);
	var header_1 = $.child(div_27);
	var node_50 = $.sibling($.child(header_1), 2);

	Users(node_50, { class: 'size-4 opacity-60' });
	$.reset(header_1);
	$.next(4);
	$.reset(div_27);
	$.reset(div_26);

	var div_28 = $.sibling(div_26, 2);

	$.set_class(div_28, 1, 'card preset-outlined-surface-200-800 bg-surface-50-950 p-5 space-y-5 col-span-2 row-span-2 col-start-3 row-start-7');

	var div_29 = $.child(div_28);
	var button_6 = $.child(div_29);
	var node_51 = $.child(button_6);

	Play(node_51, { class: 'size-6 fill-current stroke-none' });
	$.reset(button_6);

	var div_30 = $.sibling(button_6, 2);
	var button_7 = $.child(div_30);
	var node_52 = $.child(button_7);

	Rewind(node_52, { class: 'size-4 opacity-60' });
	$.reset(button_7);

	var button_8 = $.sibling(button_7, 4);
	var node_53 = $.child(button_8);

	FastForward(node_53, { class: 'size-4 opacity-60' });
	$.reset(button_8);
	$.reset(div_30);

	var div_31 = $.sibling(div_30, 2);
	var node_54 = $.child(div_31);

	Volume2(node_54, { class: 'size-4 opacity-60' });

	var node_55 = $.sibling(node_54, 2);

	Slider(node_55, {
		name: 'volume',
		defaultValue: [70],
		children: ($$anchor, $$slotProps) => {
			var fragment_21 = $.comment();
			var node_56 = $.first_child(fragment_21);

			$.component(node_56, () => Slider.Control, ($$anchor, Slider_Control_1) => {
				Slider_Control_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_22 = root_2();
						var node_57 = $.first_child(fragment_22);

						$.component(node_57, () => Slider.Track, ($$anchor, Slider_Track_1) => {
							Slider_Track_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_23 = $.comment();
									var node_58 = $.first_child(fragment_23);

									$.component(node_58, () => Slider.Range, ($$anchor, Slider_Range_1) => {
										Slider_Range_1($$anchor, {});
									});

									$.append($$anchor, fragment_23);
								},
								$$slots: { default: true }
							});
						});

						var node_59 = $.sibling(node_57, 2);

						$.component(node_59, () => Slider.Thumb, ($$anchor, Slider_Thumb_1) => {
							Slider_Thumb_1($$anchor, {
								index: 0,
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = $.comment();
									var node_60 = $.first_child(fragment_24);

									$.component(node_60, () => Slider.HiddenInput, ($$anchor, Slider_HiddenInput_1) => {
										Slider_HiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_24);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_22);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_21);
		},
		$$slots: { default: true }
	});

	$.reset(div_31);
	$.reset(div_29);
	$.reset(div_28);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(img, 'src', massiveAttackMezzanine.src);
		$.set_attribute(img, 'width', massiveAttackMezzanine.width);
		$.set_attribute(img, 'height', massiveAttackMezzanine.height);
	});

	$.append($$anchor, div);
	$.pop();
}