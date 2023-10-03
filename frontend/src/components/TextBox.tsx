export interface TextBoxProps {
	defaultText: string;
	val: string;
	setVal: (val: string) => void;
};

export const TextBox = ({ defaultText, val, setVal }: TextBoxProps) => (
	<input className="h-8 text-sm text-black bg-primary-200 rounded-xl px-2 w-36 shadow-inner" type="text" placeholder={defaultText} value={val} onChange={(e) => setVal(e.currentTarget.value)} />
);