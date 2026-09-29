import { polishArms } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	arms: polishArms(),
	code: excerpts({
		replaceParts: 'kernel/doc/Docs::replace_parts',
		trimLeft: 'kernel/doc/Docs::trim_left',
		take: 'kernel/pool/take',
		runEach: 'kernel/pipeline/run_each'
	})
});
