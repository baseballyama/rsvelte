export function watch(flush) {
	switch (flush) {
		case 'post':
			$effect(() => {});
			break;
		case 'pre':
			$effect.pre(() => {});
			break;
	}
}

export function unbraced(cond) {
	if (cond) $effect(() => {});
	else console.log(1);
}
