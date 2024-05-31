import { ThemeSwitch } from "./theme-toggle";

export default function Navbar({}): any {
	return (
		<nav className="flex justify-between items-center">
			<h1 className="font-mono text-xl font-semibold">pi.ff</h1>
			<div>
				<ThemeSwitch />
			</div>
		</nav>
	);
}
