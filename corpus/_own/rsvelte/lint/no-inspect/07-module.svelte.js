export function probe(value) {
	$inspect(value);
	return value;
}

const decoy = '$inspect in a string';
void decoy;
