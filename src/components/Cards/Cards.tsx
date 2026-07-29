
import { FC } from "react";
import { PlaceCardContents } from "./CardContents";

type BaseCardProps = {
	children?: React.ReactNode;
}
type PlaceCardProps = {
	placeName: string;
	status: string;
}

export const BaseCard: FC<BaseCardProps> = ({ children }) => {
	return <div className="border w-72 h-24 p-3 rounded-2xl drop-shadow-xl bg-card grid grid-flow-col">
		{children}
	</div>
}
export const PlaceCard: FC<PlaceCardProps> = ({ placeName, status }) => {
	return <BaseCard >
		<div><h3>{placeName}</h3><p>status</p></div>
		<PlaceCardContents />
	</BaseCard>
}