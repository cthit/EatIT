export interface ButtonProps {
	text: string;
	clickFunction: () => void;
	css?: string;
};

export const ButtonSmall = ({ text, clickFunction }: ButtonProps) => (
	<ButtonDefault css="h-8 text-sm text-black bg-primary-400 rounded-xl w-14 drop-shadow-md hover:bg-primary-500" clickFunction={clickFunction} text={text} />
);

export const ButtonLarge = ({ text, clickFunction }: ButtonProps) => (
	<ButtonDefault css="h-12 text-base text-black bg-primary-400 rounded-xl w-36 hover:bg-primary-500 drop-shadow-md" clickFunction={clickFunction} text={text} />
);

export const ButtonExit = ({ text, clickFunction }: ButtonProps) => (
	<ButtonDefault css="h-12 text-base text-black bg-red-400 rounded-xl w-36 hover:bg-red-500 drop-shadow-md" clickFunction={clickFunction} text={text} />
);

export const ButtonDefault = ({ text, clickFunction, css }: ButtonProps) => (
	<button className={css} onClick={() => clickFunction()}>{text}</button>
);