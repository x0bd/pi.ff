"use client";

import { useRef, useState } from "react";
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
	const [defaultValues, setDeafultValues] = useState<string>("video");
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

	if (actions.length) {
		return (
			<div className="space-y-6">
				{actions.map((action: Action, i: any) => (
					<div
						key={i}
						className="w-full py-4 spce-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
					>
						{!isLoaded && (
							<Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
						)}
						<div className="flex gap-4 items-center">
							<span className="text-2xl text-orange-500"></span>
						</div>
					</div>
				))}
			</div>
		);
	}
};

export default Dropzone;
