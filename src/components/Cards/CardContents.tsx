"use client"
import { SmallButton } from "../Buttons"

export const PlaceCardContents = () => {
	return <><SmallButton fun={() => { console.log("weeoooeeoooeeoo") }}> Hit me!</SmallButton> <br />
		<SmallButton fun={() => { console.log("wooeeooeeooeeoo") }}> Please!</SmallButton></>
}