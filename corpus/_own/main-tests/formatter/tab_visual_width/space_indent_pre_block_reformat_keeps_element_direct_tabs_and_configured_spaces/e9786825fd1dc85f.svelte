<div class="ast-view">
	<pre>
		<code>
			{#if typeof ast === "object"}
				<ul>
					<AstNode value={ast} />
				</ul>
			{:else}
				<p>No AST available</p>
			{/if}
		</code>
	</pre>
</div>
