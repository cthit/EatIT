import { ButtonExit, ButtonLarge, ButtonSmall } from '@/components/Button'
import { TextBox } from '@/components/TextBox'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [text, setText] = useState("");
  useEffect(() => console.log(text));
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <ButtonSmall clickFunction={() => { alert("hej") }} text={"Small"} />
      <ButtonLarge clickFunction={() => { alert("hej") }} text={"Small"} />
      <ButtonExit clickFunction={() => { alert("hej") }} text={"Small"} />
      <TextBox defaultText={"hej"} val={text} setVal={setText} />
    </main>
  )
}
