<div class="wrap">
	<div class="panel">
		<div class="inner">
			<SvelteFlow
				fitView
				onmove={(_event, viewport) => {
					graph.activeDocument.viewport = { ...viewport };
				}}
			/>
		</div>
	</div>
</div>
