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
			} catch (err) {}
		}
	};

	return <div>Dropzone</div>;
};

export default Dropzone;
