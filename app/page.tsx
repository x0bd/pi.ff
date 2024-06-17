import Dropzone from "@/components/dropzone";

const Home = () => {
	return (
		<>
			<div className="space-y-16 pb-8">
				<div className="space-y-10">
					<h1 className="text-3xl md:text-5xl font-medium text-center">
						Online File Convertor
					</h1>
					<p className="text-md text-muted-foreground md:text-lg text-center md:px-24 xl:px-44 2xl:px-52">
						Effortless Conversions, Unleashed Creativity: Convert
						any file, anytime with <strong>pi.ff</strong>, your free
						online tool for unlimited multimedia conversions
					</p>
				</div>
			</div>
			<Dropzone />
		</>
	);
};

export default Home;
