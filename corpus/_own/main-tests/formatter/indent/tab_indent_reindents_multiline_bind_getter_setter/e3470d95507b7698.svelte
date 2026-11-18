<div>
	<div>
		<Comp
			bind:value={
				() => internalValueForTheBinding,
				(v) => {
					internalValueForTheBinding = v;
				}
			}
		/>
	</div>
</div>
