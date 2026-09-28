import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Combobox($$anchor) {
	const carMakers = [
		"Toyota",
		"Ford",
		"Honda",
		"Chevrolet",
		"Nissan",
		"BMW",
		"Mercedes-Benz",
		"Volkswagen",
		"Hyundai",
		"Kia",
		"Mazda",
		"Subaru",
		"Lexus",
		"Audi",
		"Jeep",
		"Dodge",
		"Ram",
		"GMC",
		"Cadillac",
		"Chrysler",
		"Buick",
		"Infiniti",
		"Acura",
		"Volvo",
		"Porsche",
		"Jaguar",
		"Land Rover",
		"Mini",
		"Mitsubishi",
		"Genesis",
		"Tesla",
		"Fiat",
		"Peugeot",
		"Renault",
		"Alfa Romeo",
		"Citroën",
		"SEAT",
		"Skoda",
		"Saab",
		"Suzuki",
		"Isuzu",
		"Scion",
		"Hummer",
		"Lincoln",
		"Opel",
		"Daewoo",
		"Rivian",
		"Lucid",
		"Polestar",
		"Bugatti",
		"Maserati",
		"Ferrari",
		"Lamborghini",
		"Bentley",
		"Rolls-Royce",
		"Aston Martin",
		"McLaren",
		"Pagani",
		"Koenigsegg",
		"Maybach",
		"Tata",
		"Mahindra",
		"Perodua",
		"Proton",
		"Chery",
		"Geely",
		"Great Wall",
		"BYD",
		"NIO",
		"XPeng",
		"VinFast",
		"Zotye",
		"FAW",
		"BAIC",
		"Lancia",
		"Dacia",
		"Cupra",
		"Roewe",
		"Holden",
		"Smart"
	];

	var fragment = root();
	var node = $.first_child(fragment);

	Input(node, {
		get data() {
			return carMakers;
		},
		placeholder: 'Type to search cars...'
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		get data() {
			return carMakers;
		},
		clearable: true,
		placeholder: 'Clearable'
	});

	$.append($$anchor, fragment);
}