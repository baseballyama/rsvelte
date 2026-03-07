<script lang="ts">
	import type { Category, TestCase } from '$lib/types/test-results';

	interface Props {
		categories: Category[];
		selectedCategoryId?: string | null;
	}

	let { categories, selectedCategoryId = null }: Props = $props();

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'pass' | 'fail' | 'skip'>('all');

	const allTests = $derived(
		categories.flatMap((cat) =>
			cat.tests.map((test) => ({
				...test,
				categoryId: cat.id,
				categoryName: cat.name
			}))
		)
	);

	const filteredTests = $derived(
		allTests
			.filter((test) => {
				if (selectedCategoryId && test.categoryId !== selectedCategoryId) {
					return false;
				}
				if (statusFilter !== 'all' && test.status !== statusFilter) {
					return false;
				}
				if (searchQuery) {
					const query = searchQuery.toLowerCase();
					return (
						test.name.toLowerCase().includes(query) ||
						test.categoryName.toLowerCase().includes(query)
					);
				}
				return true;
			})
			.sort((a, b) => {
				const statusOrder = { fail: 0, skip: 1, pass: 2 };
				const statusDiff = statusOrder[a.status] - statusOrder[b.status];
				if (statusDiff !== 0) return statusDiff;
				return a.name.localeCompare(b.name);
			})
	);

	const getStatusIcon = (status: TestCase['status']): string => {
		switch (status) {
			case 'pass':
				return '\u2713';
			case 'fail':
				return '\u2717';
			case 'skip':
				return '\u2298';
		}
	};

	const getStatusClass = (status: TestCase['status']): string => {
		return `status-${status}`;
	};
</script>

<div class="test-list">
	<div class="filters">
		<input type="text" class="search" placeholder="Search tests..." bind:value={searchQuery} />
		<select class="filter" bind:value={statusFilter}>
			<option value="all">All Status</option>
			<option value="pass">Passed</option>
			<option value="fail">Failed</option>
			<option value="skip">Skipped</option>
		</select>
	</div>

	<div class="list-header">
		<span class="header-name">Test Name</span>
		<span class="header-category">Category</span>
		<span class="header-status">Status</span>
	</div>

	<div class="list">
		{#each filteredTests as test (test.categoryId + '/' + test.name)}
			<div class="test-row">
				<span class="test-name" title={test.name}>{test.name}</span>
				<span class="test-category">{test.categoryName}</span>
				<span class="test-status {getStatusClass(test.status)}">
					<span class="status-icon">{getStatusIcon(test.status)}</span>
					<span class="status-text">{test.status}</span>
				</span>
			</div>
			{#if test.error_message || test.skip_reason}
				<div class="test-message">
					{test.error_message || test.skip_reason}
				</div>
			{/if}
		{/each}
		{#if filteredTests.length === 0}
			<div class="no-results">No tests match your filters</div>
		{/if}
	</div>

	<div class="list-footer">
		Showing {filteredTests.length} of {allTests.length} tests
	</div>
</div>

<style>
	.test-list {
		display: flex;
		flex-direction: column;
		background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
		border: 1px solid #0f3460;
		border-radius: 12px;
		overflow: hidden;
	}

	.filters {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid #0f3460;
	}

	.search {
		flex: 1;
		padding: 0.5rem 1rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid #0f3460;
		border-radius: 6px;
		color: #fff;
		font-size: 0.9rem;
	}

	.search::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.search:focus {
		outline: none;
		border-color: #ff6b35;
	}

	.filter {
		padding: 0.5rem 1rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid #0f3460;
		border-radius: 6px;
		color: #fff;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.filter:focus {
		outline: none;
		border-color: #ff6b35;
	}

	.list-header {
		display: grid;
		grid-template-columns: 1fr 150px 100px;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(0, 0, 0, 0.2);
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.list {
		max-height: 500px;
		overflow-y: auto;
	}

	.test-row {
		display: grid;
		grid-template-columns: 1fr 150px 100px;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgba(15, 52, 96, 0.5);
		font-size: 0.9rem;
	}

	.test-row:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.test-name {
		color: #fff;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.test-category {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.85rem;
	}

	.test-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-icon {
		font-size: 1rem;
	}

	.status-text {
		font-size: 0.8rem;
		text-transform: capitalize;
	}

	.status-pass {
		color: #27ca40;
	}

	.status-fail {
		color: #ff5f56;
	}

	.status-skip {
		color: #ffbd2e;
	}

	.test-message {
		padding: 0.5rem 1rem 0.75rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
		background: rgba(0, 0, 0, 0.15);
		border-bottom: 1px solid rgba(15, 52, 96, 0.5);
		font-family: monospace;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.no-results {
		padding: 2rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.5);
	}

	.list-footer {
		padding: 0.75rem 1rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
		border-top: 1px solid #0f3460;
		text-align: center;
	}

	@media (max-width: 768px) {
		.filters {
			flex-direction: column;
		}

		.list-header {
			display: none;
		}

		.test-row {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}

		.test-category {
			font-size: 0.75rem;
		}
	}
</style>
