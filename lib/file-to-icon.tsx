import { FaFileAudio } from "react-icons/fa";
import { AiFillFile } from "react-icons/ai";
import {
	BsFileEarmarkTextFill,
	BsFillCameraVideoFill,
	BsFillImageFill,
	BsSpeakerFill,
} from "react-icons/bs";

export default function fileToIcon(fileType: any): any {
	if (fileType.includes("video")) return <BsFillCameraVideoFill />;
	if (fileType.includes("text")) return <BsFileEarmarkTextFill />;
	if (fileType.includes("audio")) return <BsSpeakerFill />;
	if (fileType.includes("image")) return <BsFillImageFill />;
	else return <AiFillFile />;
}
