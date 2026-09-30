import { arm, documents, reports } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	benchRev: reports().plainA.build.rev,
	shared: arm('shared'),
	nopool: arm('nopool'),
	code: excerpts({
		perKey: 'kernel/pool/MAX_PER_KEY',
		maxBytes: 'kernel/pool/MAX_BYTES',
		pool: 'kernel/pool/Pool',
		take: 'kernel/pool/take',
		give: 'kernel/pool/give',
		takeKeyed: 'kernel/pool/take_keyed',
		giveKeyed: 'kernel/pool/give_keyed',
		takeString: 'kernel/pool/take_string',
		takeAt: 'kernel/pool/take_at',
		giveAt: 'kernel/pool/give_at',
		drop: 'kernel/pool/Pool::drop',
		setEnabled: 'kernel/pool/set_enabled',
		astDrop: 'js/ast/Ast::drop',
		tokensDefault: 'kernel/token/impl Default for Tokens',
		componentDrop: 'svelte/ast/Component::drop',
		test: 'kernel/pool/tests::capacity_is_reused_on_the_same_thread',
		keyedTest: 'kernel/pool/tests::keyed_buffers_are_not_handed_to_other_owners',
		budgetTest: 'kernel/pool/tests::a_buffer_past_the_budget_is_freed'
	})
});
