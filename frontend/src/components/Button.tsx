export interface ButtonProps {
	text: string;
	clickFunction: () => void;
};

export const ButtonSmall = ({ text, clickFunction }: ButtonProps) => (
	<button className="h-8 text-sm text-black bg-primary-400 rounded-xl w-14 drop-shadow-md hover:bg-primary-500" onClick={() => clickFunction()}>{text}</button>
);

export const ButtonLarge = ({ text, clickFunction }: ButtonProps) => (
	<button className="h-12 text-base text-black bg-primary-400 rounded-xl w-36 hover:bg-primary-500 drop-shadow-md" onClick={() => clickFunction()}>{text}</button>
);

export const ButtonExit = ({ text, clickFunction }: ButtonProps) => (
	<button className="h-12 text-base text-black bg-red-400 rounded-xl w-36 hover:bg-red-500 drop-shadow-md" onClick={() => clickFunction()}>{text}</button>
);