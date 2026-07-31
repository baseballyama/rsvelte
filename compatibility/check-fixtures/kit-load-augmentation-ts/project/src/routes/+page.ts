// #2055 (1): official's `load` gate only checks the parameter's type
// (`hasTypedParameter`), not any pre-existing return-type annotation — this
// must still get `event` typed even though the return type is already
// spelled out, or `event` stays implicit `any` under `strict`.
export async function load(event): Promise<{ slug: string }> {
	return { slug: event.params.slug };
}
