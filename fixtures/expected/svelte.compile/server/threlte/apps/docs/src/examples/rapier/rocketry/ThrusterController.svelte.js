import * as $ from 'svelte/internal/server';
import { ConstantValue } from 'three.quarks';

export default function ThrusterController($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { system, active } = $$props;
		const originalEmission = system.emissionOverTime;
		const nullEmission = new ConstantValue(0);
	});
}