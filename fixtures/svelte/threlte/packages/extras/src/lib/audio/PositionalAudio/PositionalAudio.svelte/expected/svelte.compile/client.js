import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { PositionalAudio } from 'three';
import { useAudio } from '../utils/useAudio.svelte.js';
import { useThrelteAudio } from '../useThrelteAudio.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'src',
	'autoplay',
	'loop',
	'volume',
	'playbackRate',
	'detune',
	'directionalCone',
	'refDistance',
	'rolloffFactor',
	'distanceModel',
	'maxDistance',
	'ref',
	'children'
]);

export default function PositionalAudio_1($$anchor, $$props) {
	$.push($$props, true);

	let autoplay = $.prop($$props, 'autoplay', 3, false),
		loop = $.prop($$props, 'loop', 3, false),
		volume = $.prop($$props, 'volume', 3, 1),
		playbackRate = $.prop($$props, 'playbackRate', 3, 1),
		detune = $.prop($$props, 'detune', 3, 0),
		ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const { getAudioListener } = useThrelteAudio();
	const listener = $.derived(() => getAudioListener($$props.id));

	$.user_effect(() => {
		if (!$.get(listener)) {
			console.warn(`No Audiolistener with id ${$$props.id} found.`);
		}
	});

	const audio = $.derived(() => $.get(listener) ? new PositionalAudio($.get(listener)) : undefined);

	$.user_effect(() => {
		if (!$.get(audio)) return;

		if ($$props.refDistance !== undefined) {
			$.get(audio).setRefDistance($$props.refDistance);
		}

		if ($$props.rolloffFactor !== undefined) {
			$.get(audio).setRolloffFactor($$props.rolloffFactor);
		}

		if ($$props.distanceModel !== undefined) {
			$.get(audio).setDistanceModel($$props.distanceModel);
		}

		if ($$props.maxDistance !== undefined) {
			$.get(audio).setMaxDistance($$props.maxDistance);
		}

		if ($$props.directionalCone !== undefined) {
			$.get(audio).setDirectionalCone($$props.directionalCone.coneInnerAngle, $$props.directionalCone.coneOuterAngle, $$props.directionalCone.coneOuterGain);
		}
	});

	const { pause, play, stop } = useAudio(() => $.get(audio), () => $$props.src, () => autoplay(), () => loop(), () => volume(), () => playbackRate(), () => detune(), () => rest);
	var $$exports = { pause, play, stop };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			T($$anchor, $.spread_props(
				{
					get is() {
						return $.get(audio);
					}
				},
				() => rest,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: $.get(audio) }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		};

		$.if(node, ($$render) => {
			if ($.get(audio)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}