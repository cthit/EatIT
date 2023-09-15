import { ButtonExit, ButtonLarge, ButtonSmall } from '@/components/Button'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <ButtonSmall clickFunction={() => { alert("hej") }} text={"Small"} />
      <ButtonLarge clickFunction={() => { alert("hej") }} text={"Small"} />
      <ButtonExit clickFunction={() => { alert("hej") }} text={"Small"} />
      Hi
    </main>
  )
}
