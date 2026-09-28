import { arm, documents } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	shared: arm('shared'),
	nopool: arm('nopool'),
	code: excerpts({
		consts: 'kernel/pool/MAX_PER_TYPE',
		take: 'kernel/pool/take',
		give: 'kernel/pool/give',
		drop: 'kernel/pool/Pool::drop',
		setEnabled: 'kernel/pool/set_enabled',
		test: 'kernel/pool/tests::capacity_is_reused_on_the_same_thread'
	})
});
