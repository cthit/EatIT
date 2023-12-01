import { PlaceCard } from "@/components/Cards/Cards"

export default function Home() {
  return <>
    <h1 className="text-4xl text-center mt-4">This is the new eatIT!</h1>
    <ul>
      <li><PlaceCard status="Open" placeName="Sannes" /></li>
    </ul>
  </>
}
