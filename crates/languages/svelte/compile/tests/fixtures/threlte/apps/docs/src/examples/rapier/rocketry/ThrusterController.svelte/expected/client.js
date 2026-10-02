import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ConstantValue } from 'three.quarks';

export default function ThrusterController($$anchor, $$props) {
	$.push($$props, true);

	let system = $.prop($$props, 'system', 7);
	const originalEmission = system().emissionOverTime;
	const nullEmission = new ConstantValue(0);

	$.user_pre_effect(() => {
		if ($$props.active) {
			system().emissionOverTime = originalEmission;
		} else {
			system().emissionOverTime = nullEmission;
		}
	});

	$.pop();
}