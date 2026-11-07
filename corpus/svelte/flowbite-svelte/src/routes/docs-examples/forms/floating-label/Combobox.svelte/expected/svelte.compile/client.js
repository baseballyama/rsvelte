import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput } from "flowbite-svelte";

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

	FloatingLabelInput($$anchor, {
		variant: 'filled',
		clearable: true,
		id: 'floating_filled',
		get data() {
			return carMakers;
		},
		name: 'floating_filled',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Type to search cars');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}