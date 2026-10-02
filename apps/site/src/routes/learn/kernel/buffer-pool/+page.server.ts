import { arm, documents, reports } from '$lib/server/benchmark';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	benchRev: reports().plainA.build.rev,
	shared: arm('shared'),
	nopool: arm('nopool'),
	code: excerpts({
		perKey: 'kernel/performance/buffer_pool/MAXIMUM_PER_KEY',
		maxBytes: 'kernel/performance/buffer_pool/MAXIMUM_BYTES',
		pool: 'kernel/performance/buffer_pool/Pool',
		take: 'kernel/performance/buffer_pool/take',
		give: 'kernel/performance/buffer_pool/give',
		takeKeyed: 'kernel/performance/buffer_pool/take_keyed',
		giveKeyed: 'kernel/performance/buffer_pool/give_keyed',
		takeString: 'kernel/performance/buffer_pool/take_string',
		takeAt: 'kernel/performance/buffer_pool/take_at',
		giveAt: 'kernel/performance/buffer_pool/give_at',
		drop: 'kernel/performance/buffer_pool/Pool::drop',
		setEnabled: 'kernel/performance/buffer_pool/set_enabled',
		syntaxTreeDrop: 'typescript/syntax/syntax_tree/SyntaxTree::drop',
		tokensDefault: 'kernel/source/tokens/impl Default for Tokens',
		componentDrop: 'svelte/syntax/syntax_tree/Component::drop',
		test: 'kernel/performance/buffer_pool/tests::capacity_is_reused_on_the_same_thread',
		keyedTest: 'kernel/performance/buffer_pool/tests::keyed_buffers_are_not_handed_to_other_owners',
		budgetTest: 'kernel/performance/buffer_pool/tests::a_buffer_past_the_budget_is_freed'
	})
});
