export function f(flush) {
	switch (flush) {
		case 'post':
			$effect(() => {});
			break;
	}
}
