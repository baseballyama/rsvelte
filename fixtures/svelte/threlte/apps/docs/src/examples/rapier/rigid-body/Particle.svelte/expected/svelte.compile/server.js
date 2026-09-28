import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { PositionalAudio } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';
import { writable } from 'svelte/store';
import { BoxGeometry, MeshStandardMaterial, MathUtils } from 'three';

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshStandardMaterial();

export const muted = writable(true);

export default function Particle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { position, quaternion } = $$props;

		const audios = new Array(9).fill(0).map((_, i) => {
			return {
				threshold: i / 10,
				ref: undefined,
				volume: (i + 2) / 10,
				source: `/audio/ball_bounce_${i + 1}.mp3`
			};
		});

		const fireSound = (event) => {
			if ($.store_get($$store_subs ??= {}, '$muted', muted)) return;

			const volume = MathUtils.clamp((event.totalForceMagnitude - 30) / 1100, 0.1, 1);
			const audio = audios.find((a) => a.volume >= volume);

			audio?.ref?.stop?.();
			audio?.ref?.play?.();
		};

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position,
				quaternion,
				children: ($$renderer) => {
					RigidBody($$renderer, {
						type: 'dynamic',
						oncontact: fireSound,
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(audios);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let audio = each_array[$$index];

								PositionalAudio($$renderer, {
									autoplay: false,
									detune: 600 - Math.random() * 1200,
									src: audio.source,
									volume: audio.volume
								});
							}

							$$renderer.push(`<!--]--> `);

							Collider($$renderer, {
								contactForceEventThreshold: 30,
								restitution: 0.4,
								shape: 'cuboid',
								args: [0.5, 0.5, 0.5]
							});

							$$renderer.push(`<!----> `);

							if (T.Mesh) {
								$$renderer.push('<!--[-->');
								T.Mesh($$renderer, { castShadow: true, receiveShadow: true, geometry, material });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}