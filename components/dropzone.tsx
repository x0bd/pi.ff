"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "./ui/use-toast";
import { Action } from "@/types";
import convertFile from "@/lib/convert";
import { Skeleton } from "./ui/skeleton";
import fileToIcon from "@/lib/file-to-icon";
import compressFileName from "@/lib/compress-file-name";
import bytesToSize from "@/lib/bytes-to-size";
import { Badge } from "./ui/badge";
import { BiSolidError } from "react-icons/bi";
import { MdClose, MdDone, MdDownload } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import loadFFmpeg from "@/lib/load-ff";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import ReactDropzone from "react-dropzone";
import { LucideFileSymlink, UploadCloud } from "lucide-react";

const extensions = {
	audio: ["flac", "mp3", "ogg", "wma", "m4a", "wav"],
	image: [
		"svg",
		"raw",
		"tga",
		"gif",
		"jpg",
		"jpeg",
		"webp",
		"tif",
		"tiff",
		"png",
		"ico",
	],
	video: [
		"mp4",
		"m4v",
		"mkv",
		"webm",
		"hevc",
		"265",
		"264",
		"mov",
		"wmv",
		"3gp",
		"avi",
		"3g2",
		"flv",
		"ogv",
		"h264",
	],
};

const Dropzone = () => {
	const { toast } = useToast();
	const [isReady, setIsReady] = useState<boolean>(false);
	const [isHover, setIsHover] = useState<boolean>(false);
	const [actions, setActions] = useState<Action[]>([]);
	const [files, setFiles] = useState<Array<any>>([]);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isConverting, setIsConverting] = useState<boolean>(false);
	const [isDone, setIsDone] = useState<boolean>(false);
	const ffmpegRef = useRef<any>(null);
	const [defaultValues, setDefaultValues] = useState<string>("video");
	const [selected, setSelected] = useState<string>("...");
	const acceptedFiles = {
		"image/*": [
			".svg",
			".raw",
			".tga",
			".gif",
			".jpg",
			".jpeg",
			".webp",
			".tif",
			".tiff",
			".png",
			".ico",
		],
		"audio/*": [],
		"video/*": [],
	};

	// FUNCTIONS
	const reset = () => {
		setIsDone(false);
		setActions([]);
		setFiles([]);
		setIsReady(false);
		setIsConverting(false);
	};

	const downloadAll = (): void => {
		for (let action of actions) {
			!action.isError && download(action);
		}
	};

	const download = (action: Action) => {
		const a = document.createElement("a");
		a.style.display = "none";
		a.href = action.url;
		a.download = action.output;

		document.body.appendChild(a);
		a.click();

		// Download Cleanup
		URL.revokeObjectURL(action.url);
		document.body.removeChild(a);
	};

	const convert = async (): Promise<any> => {
		let tmpActions = actions.map((elt) => ({
			...elt,
			isConverting: true,
		}));
		setActions(tmpActions);
		setIsConverting(true);

		for (let action of tmpActions) {
			try {
				const { url, output } = await convertFile(
					ffmpegRef.current,
					action
				);
				tmpActions = tmpActions.map((elt) =>
					elt === action
						? {
								...elt,
								isConverted: true,
								isConverting: false,
								url,
								output,
						  }
						: elt
				);
				setActions(tmpActions);
			} catch (err) {
				tmpActions = tmpActions.map((elt) =>
					elt === action
						? {
								...elt,
								isConverted: false,
								isConverting: false,
								isError: true,
						  }
						: elt
				);
				setActions(tmpActions);
			}
		}
		setIsDone(true);
		setIsConverting(false);
	};

	const handleUpload = (data: Array<any>): void => {
		handleExitHover();

		setFiles(data);
		const tmp: Action[] = [];
		data.forEach((file: any) => {
			const formData = new FormData();
			tmp.push({
				fileName: file.name,
				fileSize: file.size,
				from: file.name.slice(
					((file.name.lastIndexOf(".") - 1) >>> 0) + 2
				),
				to: null,
				fileType: file.type,
				isConverted: false,
				isConverting: false,
				isError: false,
				file,
			});
		});
		setActions(tmp);
	};

	const handleHover = (): void => setIsHover(true);
	const handleExitHover = (): void => setIsHover(false);
	const updateAction = (fileName: String, to: String) => {
		setActions(
			actions.map((action): Action => {
				if (action.fileName === fileName) {
					console.log("FILE FOUND");
					return {
						...action,
						to,
					};
				}

				return action;
			})
		);
	};

	const checkIsReady = (): void => {
		let tmpIsReady = true;
		actions.forEach((action: Action) => {
			if (!action.to) tmpIsReady = false;
		});
		setIsReady(tmpIsReady);
	};

	useEffect(() => {
		if (!actions.length) {
			setIsDone(false);
			setFiles([]);
			setIsReady(false);
			setIsConverting(false);
		} else checkIsReady();
	}, [actions]);
	useEffect(() => {
		load();
	}, []);

	const load = async () => {
		const ffmpeg_response: FFmpeg = await loadFFmpeg();
		ffmpegRef.current = ffmpeg_response;
		setIsLoaded;
	};

	const deleteAction = (action: Action): void => {
		setActions(actions.filter((elt) => elt !== action));
		setFiles(files.filter((elt) => elt.name !== action.fileName));
	};

	// Rendered
	if (actions.length) {
		return (
			<div className="space-y-6">
				{actions.map((action: Action, i: any) => (
					<div
						key={i}
						className="w-full py-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
					>
						{!isLoaded && (
							<Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
						)}
						<div className="flex gap-4 items-center">
							<span className="text-2xl text-emerald-600">
								{fileToIcon(action.fileType)}
							</span>
							<div className="flex items-center gap-1 w-96">
								<span className="text-md font-medium overflow-x-hidden">
									{compressFileName(action.fileName)}
								</span>
								<span className="text-muted-foreground text-sm">
									({bytesToSize(action.fileSize)})
								</span>
							</div>
						</div>

						{action.isError ? (
							<Badge variant="destructive" className="flex gap-2">
								<span>Error Converting File</span>
								<BiSolidError />
							</Badge>
						) : action.isConverted ? (
							<Badge
								variant="default"
								className="flex gap-2 bg-green-500"
							>
								<span>Done</span>
								<MdDone />
							</Badge>
						) : action.isConverting ? (
							<Badge variant="default" className="flex gap-2">
								<span>Converting</span>
								<span className="animate-spin">
									<ImSpinner3 />
								</span>
							</Badge>
						) : (
							<div className="text-muted-foreground text-md flex items-center gap-4">
								<span>Convert to</span>
								<Select
									onValueChange={(value) => {
										if (extensions.audio.includes(value)) {
											setDefaultValues("audio");
										} else if (
											extensions.video.includes(value)
										) {
											setDefaultValues("video");
										}
										setSelected(value);
										updateAction(action.fileName, value);
									}}
									value={selected}
								>
									<SelectTrigger className="w-32 outline-none focus:outline-none focus:ring-0 text-center text-muted-foreground bg-background text-md font-medium">
										<SelectValue placeholder="..." />
									</SelectTrigger>
									<SelectContent className="h-fit">
										{action.fileType.includes("image") && (
											<div className="grid grid-cols-2 gap-2 w-fit">
												{extensions.image.map(
													(elt, i) => (
														<div
															key={i}
															className="col-span-i text-center"
														>
															<SelectItem
																value={elt}
																className="mx-auto"
															>
																{elt}
															</SelectItem>
														</div>
													)
												)}
											</div>
										)}
										{action.fileType.includes("video") && (
											<Tabs
												defaultValue={defaultValues}
												className="w-full"
											>
												<TabsList className="w-full">
													<TabsTrigger
														value="video"
														className="w-full"
													>
														Video
													</TabsTrigger>
													<TabsTrigger
														value="audio"
														className="w-full"
													>
														Audio
													</TabsTrigger>
												</TabsList>
												<TabsContent value="video">
													<div className="grid grid-cols-2 gap-2 w-fit">
														{extensions.image.map(
															(elt, i) => (
																<div
																	key={i}
																	className="col-span-1 text-center"
																>
																	<SelectItem
																		value={
																			elt
																		}
																		className="mx-auto"
																	>
																		{elt}
																	</SelectItem>
																</div>
															)
														)}
													</div>
												</TabsContent>
												<TabsContent value="audio">
													<div className="grid grid-cols-3 gap-2 w-fit">
														{extensions.audio.map(
															(elt, i) => (
																<div
																	key={i}
																	className="col-span-1 text-center"
																>
																	<SelectItem
																		value={
																			elt
																		}
																		className="mx-auto"
																	>
																		{elt}
																	</SelectItem>
																</div>
															)
														)}
													</div>
												</TabsContent>
											</Tabs>
										)}
										{action.fileType.includes("audio") && (
											<div className="grid grid-cols-2 gap-2 w-fit">
												{extensions.audio.map(
													(elt, i) => (
														<div
															key={i}
															className="col-span-1 text-center"
														>
															<SelectItem
																value={elt}
																className="mx-auto"
															>
																{elt}
															</SelectItem>
														</div>
													)
												)}
											</div>
										)}
									</SelectContent>
								</Select>
							</div>
						)}

						{action.isConverted ? (
							<Button
								variant="outline"
								onClick={() => download(action)}
							>
								Download
							</Button>
						) : (
							<span
								className="text-2xl text-foreground h-10 w-10 cursor-pointer hover:bg-muted rounded-full items-center justify-center "
								onClick={() => deleteAction(action)}
							>
								<MdClose />
							</span>
						)}
					</div>
				))}
				<div className="flex w-full justify-end">
					{isDone ? (
						<div className="space-y-4 w-fit">
							<Button
								size="lg"
								className="rounded-xl font-semibold relative py-4 text-md flex gap-2 items-center w-full"
								onClick={downloadAll}
							>
								{actions.length > 1
									? "Download All"
									: "Download"}
								<MdDownload />
							</Button>
							<Button
								size="lg"
								onClick={reset}
								variant="outline"
								className="rounded-xl"
							>
								Convert Another File(s)
							</Button>
						</div>
					) : (
						<Button
							size="lg"
							disabled={!isReady || isConverting}
							className="rounded-xl font-semibold relative py-4 text-md flex items-center
							 w-44"
							onClick={convert}
						>
							{isConverting ? (
								<span className="animate-spin text-lg">
									<ImSpinner3 />
								</span>
							) : (
								<span>Convert Now!</span>
							)}
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<ReactDropzone
			onDrop={handleUpload}
			onDragEnter={handleHover}
			onDragLeave={handleExitHover}
			accept={acceptedFiles}
			onDropRejected={() => {
				handleExitHover();
				toast({
					variant: "destructive",
					title: "Error uploading your files",
					description: "Allowed Files: Audio, Video, Images",
					duration: 5000,
				});
			}}
			onError={() => {
				handleExitHover();
				toast({
					variant: "destructive",
					title: "Error uploading your files",
					description: "Allowed Files: Audio, Video, Images.",
					duration: 5000,
				});
			}}
		>
			{({ getRootProps, getInputProps }) => (
				<div
					{...getRootProps()}
					className="bg-background h-72 lg:h-80 xl:h-96 rounded-3xl shadow-sm  border-secondary border-2 border-dashed cursor-pointer flex items-center justify-center"
				>
					<input {...getInputProps()} />
					<div className="space-y-4 text-foreground">
						{isHover ? (
							<>
								<div className="justify-center flex text-6xl">
									<LucideFileSymlink />
								</div>
								<h3 className="text-center font-medium text-2xl">
									Yes, right there
								</h3>
							</>
						) : (
							<>
								<div className="justify-center flex text-6xl">
									<UploadCloud />
								</div>
								<h3 className="text-center font-medium text-2xl">
									Click, or drop your files here
								</h3>
							</>
						)}
					</div>
				</div>
			)}
		</ReactDropzone>
	);
};

export default Dropzone;
