import * as $ from 'svelte/internal/server';
import AudioPlayer, { stopAll } from './AudioPlayer.svelte';

export default function Module_exports01_input($$renderer) {
	$$renderer.push(`<button>stop all audio</button> `);

	AudioPlayer($$renderer, {
		src: 'https://sveltejs.github.io/assets/music/strauss.mp3',
		title: 'The Blue Danube Waltz',
		composer: 'Johann Strauss',
		performer: 'European Archive'
	});

	$$renderer.push(`<!----> `);

	AudioPlayer($$renderer, {
		src: 'https://sveltejs.github.io/assets/music/holst.mp3',
		title: 'Mars, the Bringer of War',
		composer: 'Gustav Holst',
		performer: 'USAF Heritage of America Band'
	});

	$$renderer.push(`<!----> `);

	AudioPlayer($$renderer, {
		src: 'https://sveltejs.github.io/assets/music/satie.mp3',
		title: 'Gymnopédie no. 1',
		composer: 'Erik Satie',
		performer: 'Prodigal Procrastinator'
	});

	$$renderer.push(`<!----> `);

	AudioPlayer($$renderer, {
		src: 'https://sveltejs.github.io/assets/music/beethoven.mp3',
		title: 'Symphony no. 5 in Cm, Op. 67 - I. Allegro con brio',
		composer: 'Ludwig van Beethoven',
		performer: 'European Archive'
	});

	$$renderer.push(`<!----> `);

	AudioPlayer($$renderer, {
		src: 'https://sveltejs.github.io/assets/music/mozart.mp3',
		title: 'Requiem in D minor, K. 626 - III. Sequence - Lacrymosa',
		composer: 'Wolfgang Amadeus Mozart',
		performer: 'Markus Staab'
	});

	$$renderer.push(`<!---->`);
}