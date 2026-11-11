<script>
import { goto } from '$app/navigation';
export function bad() {
	return goto('/module-bad');
}
</script>
