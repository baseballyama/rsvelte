<script>
	import ContactCard from './ContactCard.svelte';
</script>

<ContactCard>
	<!-- contact details go here -->
	<span slot="name">
		P. Sherman
	</span>

	<span slot="address">
		42 Wallaby Way<br>
		Sydney
	</span>
</ContactCard>
