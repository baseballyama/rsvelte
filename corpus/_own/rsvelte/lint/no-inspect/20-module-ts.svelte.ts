export type $inspect = string;

export function probe(value: $inspect): $inspect {
	$inspect(value);
	return value satisfies $inspect;
}

const decoy = 'the identifier $inspect inside a string';
void decoy;
