<script module>
	const { Story } = defineMeta({});
</script>

<Story play={async ({ args, canvas, userEvent }) => {
	// Simulate a user filling out the form
	await userEvent.type(canvas.getByTestId('email'), 'email@provider.com');
	await userEvent.type(canvas.getByTestId('password'), 'a-random-password');
	await userEvent.click(canvas.getByRole('button'));

	// Run assertions
	await expect(args.onSubmit).toHaveBeenCalledTimes(1);
	await expect(canvas.getByText('You’re in!')).toBeInTheDocument();
}} />