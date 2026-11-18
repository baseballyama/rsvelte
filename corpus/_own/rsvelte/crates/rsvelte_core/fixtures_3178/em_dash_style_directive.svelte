<script lang="ts">
	/**
	 */
	beforeNavigate(({ cancel, willUnload, to }) => {
		if (versionClient.updated && !willUnload && to?.url) {
		}
	});
	$effect(() => {
		if (versionClient.updated) {
			if (showAlertTimeout) {
			}
		}
		return () => {
		};
	});
	// E2E it's purely flag-driven — the local client defaults the flag on for dev:kvist.
	let logPanelHeight = $state(240);
</script>
<div
	style:--app-height={showDevToolbar
		? logPanelOpen
			? `calc(100vh - 2rem - ${logPanelHeight}px)`
			: 'calc(100vh - 2rem)'
		: '100vh'}
>
</div>
