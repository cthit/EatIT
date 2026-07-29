
import { FC } from "react";

type BasedButProps = {
	children?: React.ReactNode;
	fun?: () => void;
}

export const BaseButton: FC<BasedButProps> = ({ children, fun }) => {

	return <button className="h-8 w-16 font-small font-semibold bg-turquoise rounded-3xl m-2 p-2 hover:bg-turquoise-600 hover:shadow-inner-md" onClick={fun} >
		{children}
	</button>
}

export const SmallButton: FC<BasedButProps> = ({ children, fun }) => {
	return <BaseButton fun={fun}>{children}</BaseButton>
}
