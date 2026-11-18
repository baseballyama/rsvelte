<script>
	import { browser } from '$app/environment';
	{
		if (!browser) {
			console.log(1);
		}
		console.log(location.href);
	}
	switch (1) {
		case 1:
			if (!browser) break;
			console.log(location.href);
	}
</script>
