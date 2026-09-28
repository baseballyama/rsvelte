import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { PositionalAudio } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';
import { writable } from 'svelte/store';
import { BoxGeometry, MeshStandardMaterial, MathUtils } from 'three';

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshStandardMaterial();

export const muted = writable(true);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Particle($$anchor, $$props) {
	$.push($$props, true);

	const $muted = () => $.store_get(muted, '$muted', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const audios = $.proxy(new Array(9).fill(0).map((_, i) => {
		return {
			threshold: i / 10,
			ref: undefined,
			volume: (i + 2) / 10,
			source: `/audio/ball_bounce_${i + 1}.mp3`
		};
	}));

	const fireSound = (event) => {
		if ($muted()) return;

		const volume = MathUtils.clamp((event.totalForceMagnitude - 30) / 1100, 0.1, 1);
		const audio = audios.find((a) => a.volume >= volume);

		audio?.ref?.stop?.();
		audio?.ref?.play?.();
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return $$props.position;
			},

			get quaternion() {
				return $$props.quaternion;
			},

			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'dynamic',
					oncontact: fireSound,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => audios, $.index, ($$anchor, audio, $$index) => {
							$.bind_this(
								PositionalAudio($$anchor, {
									autoplay: false,
									detune: 600 - Math.random() * 1200,
									get src() {
										return $.get(audio).source;
									},

									get volume() {
										return $.get(audio).volume;
									}
								}),
								($$value, audio) => (audio.ref = $$value),
								(audio) => audio?.ref,
								() => [$.get(audio)]
							);
						});

						var node_2 = $.sibling(node_1, 2);

						Collider(node_2, {
							contactForceEventThreshold: 30,
							restitution: 0.4,
							shape: 'cuboid',
							args: [0.5, 0.5, 0.5]
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								castShadow: true,
								receiveShadow: true,
								get geometry() {
									return geometry;
								},

								get material() {
									return material;
								}
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}